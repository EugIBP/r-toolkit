import { useState, useEffect } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { convertFileSrc } from "@tauri-apps/api/core";
import { X, Edit3, HardDrive, Image } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/typography";

interface EditBackgroundModalProps {
    isOpen: boolean;
    onClose: () => void;
    assetName: string;
}

export function EditBackgroundModal({
    isOpen,
    onClose,
    assetName,
}: EditBackgroundModalProps) {
    const { projectData, projectPath, updateProjectObject } = useProjectStore();
    const { canvasMode } = useCanvasStore();

    const isEditMode = canvasMode === "edit";

    const asset = projectData?.Objects.find((o: any) => o.Name === assetName);

    const [name, setName] = useState("");
    const [path, setPath] = useState("");

    useEffect(() => {
        if (asset && isOpen) {
            setName(asset.Name);
            setPath(asset.Path);
        }
    }, [asset, isOpen]);

    if (!isOpen || !asset) return null;

    const lastIdx = Math.max(
        projectPath?.lastIndexOf("/") || 0,
        projectPath?.lastIndexOf("\\") || 0,
    );
    const baseDir = projectPath
        ? projectPath.substring(0, lastIdx).replace(/\\/g, "/")
        : "";
    const assetPath = asset.Path.replace(/\\/g, "/");
    const previewSrc = projectPath
        ? convertFileSrc(`${baseDir}/${assetPath}`)
        : "";

    const handleSave = () => {
        if (!name.trim()) return;
        updateProjectObject(assetName, {
            Name: name.trim(),
            Path: path.trim(),
        });
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSave();
        if (e.key === "Escape") onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <Card
                className="w-[33vw] min-w-[400px] max-w-[560px] animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
                onKeyDown={handleKeyDown}
            >
                <CardHeader className="flex flex-row items-center justify-between p-5 border-b border-white/10 bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                        <Image className="w-4 h-4 text-emerald-400" />
                        <h2 className="text-sm font-semibold text-white">
                            Edit Background
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </CardHeader>

                <ScrollArea className="flex-1">
                    <CardContent className="p-6 space-y-5">
                        {/* Preview */}
                        <div className="aspect-video w-full rounded-xl overflow-hidden bg-bg-panel border border-white/5 relative">
                            <div
                                className="absolute inset-0 opacity-10"
                                style={{
                                    backgroundImage:
                                        "linear-gradient(45deg, #222 25%, transparent 25%), linear-gradient(-45deg, #222 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #222 75%), linear-gradient(-45deg, transparent 75%, #222 75%)",
                                    backgroundSize: "16px 16px",
                                }}
                            />
                            {previewSrc && (
                                <img
                                    src={previewSrc}
                                    alt=""
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            )}
                        </div>

                        {/* Registry Name */}
                        <div className="flex flex-col gap-1.5">
                            <SectionLabel>Registry Name</SectionLabel>
                            <div className="relative">
                                <Edit3 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={!isEditMode}
                                    className="w-full pl-9"
                                />
                            </div>
                        </div>

                        {/* Internal Path */}
                        <div className="flex flex-col gap-1.5">
                            <SectionLabel>Internal Path</SectionLabel>
                            <div className="relative">
                                <HardDrive className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <Input
                                    value={path}
                                    onChange={(e) => setPath(e.target.value)}
                                    disabled={!isEditMode}
                                    className="w-full pl-9 text-xs font-mono"
                                />
                            </div>
                        </div>
                    </CardContent>
                </ScrollArea>

                <div className="p-5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!isEditMode || !name.trim()}
                    >
                        Save
                    </Button>
                </div>
            </Card>
        </div>
    );
}
