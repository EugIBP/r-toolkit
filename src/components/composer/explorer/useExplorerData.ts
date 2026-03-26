import { useCanvasStore } from "@/store/useCanvasStore";
import { useProjectStore } from "@/store/useProjectStore";
import type { AssetObject, IconInstance, ScreenData } from "@/types/project";
import { useMemo } from "react";

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
        assetsByDir: new Map(),
        sortedDirs: [],
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

    // Шаг 1: Если мы в режиме сканирования, берем ТОЛЬКО новые файлы
    if (newCount > 0) {
      mergedAssets = mergedAssets.filter((obj) => !obj.isRegistered);
    }

    if (searchQuery) {
      mergedAssets = mergedAssets.filter((obj) =>
        obj.Name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Шаг 2 (ИСПРАВЛЕНИЕ): Всегда применяем глобальный фильтр типов ассетов поверх новых файлов!
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

    type AssetWithDir = AssetObject & { dir?: string; isRegistered?: boolean };
    const assetsByDir = new Map<string, AssetWithDir[]>();
    mergedAssets.forEach((obj: AssetWithDir) => {
      const dir = obj.dir || obj.Path.split(/[\\/]/)[0] || "other";
      if (!assetsByDir.has(dir)) assetsByDir.set(dir, []);
      assetsByDir.get(dir)!.push(obj);
    });

    const priorityOrder = [
      "backgrounds",
      "sprites",
      "icons",
      "assets",
      "pales",
      "palettes",
    ];
    const sortedDirs = Array.from(assetsByDir.keys()).sort((a, b) => {
      const idxA = priorityOrder.indexOf(a.toLowerCase());
      const idxB = priorityOrder.indexOf(b.toLowerCase());
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    return {
      newCount,
      mergedAssets,
      groupedInstances,
      assetsByDir,
      sortedDirs,
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
