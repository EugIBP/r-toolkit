import { useCanvasStore } from "@/store/useCanvasStore";
import { useProjectStore } from "@/store/useProjectStore";
import type { AssetObject, IconInstance, ScreenData } from "@/types/project";
import { useMemo } from "react";

export interface FolderNode {
  name: string;
  fullPath: string;
  assets: Array<AssetObject & { dir?: string; isRegistered?: boolean }>;
  children: Record<string, FolderNode>;
}

export function useExplorerData() {
  const { projectData, scannedFiles } = useProjectStore();
  const { searchQuery, assetFilter, activeScreenIdx, stackThreshold } =
    useCanvasStore();

  const stackedAssetNames = useMemo(() => {
    if (!projectData?.Screens?.[activeScreenIdx]?.Icons)
      return new Set<string>();
    const icons = projectData.Screens[activeScreenIdx].Icons;
    const positionMap = new Map<string, string[]>();

    icons.forEach((icon: IconInstance) => {
      const key = `${Math.round(icon.X / stackThreshold)}_${Math.round(icon.Y / stackThreshold)}`;
      if (!positionMap.has(key)) positionMap.set(key, []);
      positionMap.get(key)!.push(icon.Name);
    });

    const stackedNames = new Set<string>();
    positionMap.forEach((names) => {
      if (names.length > 1) names.forEach((name) => stackedNames.add(name));
    });
    return stackedNames;
  }, [projectData, activeScreenIdx, stackThreshold]);

  return useMemo(() => {
    if (!projectData)
      return {
        newCount: 0,
        mergedAssets: [],
        groupedInstances: new Map(),
        folderTree: {
          name: "root",
          fullPath: "",
          assets: [],
          children: {},
        } as FolderNode,
      };

    const allFilesMap = new Map<
      string,
      AssetObject & { isRegistered: boolean }
    >();

    projectData.Objects.forEach((obj: AssetObject) => {
      const existing = allFilesMap.get(obj.Path);
      if (!existing) {
        allFilesMap.set(obj.Path, { ...obj, isRegistered: true });
      } else {
        if (obj.Name.length < existing.Name.length) {
          allFilesMap.set(obj.Path, { ...obj, isRegistered: true });
        }
      }
    });

    let newCount = 0;
    scannedFiles?.forEach((file) => {
      if (!allFilesMap.has(file.path)) {
        newCount++;
        const name =
          file.path
            .split(/[\\/]/)
            .pop()
            ?.replace(/\.[^/.]+$/, "") || file.path;
        const type =
          file.asset_type === "bin"
            ? "Bin"
            : file.asset_type === "pal"
              ? "Pal"
              : "Ico";
        allFilesMap.set(file.path, {
          Name: name,
          Path: file.path,
          dir: file.dir,
          Type: type,
          isRegistered: false,
        });
      }
    });

    const groupedInstances = new Map<
      string,
      Array<{
        iconIdx: number;
        icon: IconInstance;
        isBackground?: boolean;
        screenIdx: number;
      }>
    >();

    projectData.Screens.forEach((screen: ScreenData, screenIdx: number) => {
      if (screen.Background) {
        const bgAsset = projectData.Objects.find(
          (o: AssetObject) => o.Name === screen.Background,
        );
        if (bgAsset) {
          if (!groupedInstances.has(bgAsset.Path))
            groupedInstances.set(bgAsset.Path, []);
          groupedInstances.get(bgAsset.Path)!.push({
            iconIdx: -1,
            icon: { Name: bgAsset.Name, X: 0, Y: 0 },
            isBackground: true,
            screenIdx,
          });
        }
      }
      screen.Icons?.forEach((icon: IconInstance, iconIdx: number) => {
        const asset = projectData.Objects.find(
          (o: AssetObject) => o.Name === icon.Name,
        );
        if (asset) {
          if (!groupedInstances.has(asset.Path))
            groupedInstances.set(asset.Path, []);
          groupedInstances.get(asset.Path)!.push({ iconIdx, icon, screenIdx });
        }
      });
    });

    let mergedAssets = Array.from(allFilesMap.values());

    if (newCount > 0)
      mergedAssets = mergedAssets.filter((obj) => !obj.isRegistered);

    if (searchQuery) {
      mergedAssets = mergedAssets.filter((obj) =>
        obj.Name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (assetFilter !== "all") {
      mergedAssets = mergedAssets.filter((obj) => {
        const isSprite = obj.isSprite;
        const isBG = obj.Type === "Bin";
        if (assetFilter === "bg") return isBG;
        if (assetFilter === "sprites") return isSprite;
        if (assetFilter === "icons") return !isSprite && !isBG;
        if (assetFilter === "stacked") return stackedAssetNames.has(obj.Name);
        return true;
      });
    }

    // ПОСТРОЕНИЕ ДЕРЕВА
    const rootNode: FolderNode = {
      name: "root",
      fullPath: "",
      assets: [],
      children: {},
    };

    mergedAssets.forEach((obj) => {
      let dirStr = (
        obj.dir || obj.Path.split(/[\\/]/).slice(0, -1).join("\\")
      ).replace(/\//g, "\\");
      dirStr = dirStr.replace(/^[\.\\]+/, ""); // Убираем ведущие слеши или точки

      if (!dirStr || dirStr === "") {
        rootNode.assets.push(obj);
      } else {
        const parts = dirStr.split("\\").filter(Boolean);
        let current = rootNode;
        let currentPath = "";

        for (const part of parts) {
          currentPath = currentPath ? `${currentPath}\\${part}` : part;
          if (!current.children[part]) {
            current.children[part] = {
              name: part,
              fullPath: currentPath,
              assets: [],
              children: {},
            };
          }
          current = current.children[part];
        }
        current.assets.push(obj);
      }
    });

    return {
      newCount,
      mergedAssets,
      groupedInstances,
      folderTree: rootNode,
    };
  }, [
    projectData,
    scannedFiles,
    searchQuery,
    assetFilter,
    activeScreenIdx,
    stackedAssetNames,
  ]);
}
