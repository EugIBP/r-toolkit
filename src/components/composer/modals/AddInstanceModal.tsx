import { useState, useEffect } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { motion } from "framer-motion";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionLabel } from "@/components/ui/typography";

interface AddInstanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetName: string;
  screenIdx: number;
}

export function AddInstanceModal({ isOpen, onClose, assetName, screenIdx }: AddInstanceModalProps) {
  const { isNameUnique, addInstance, projectData } = useProjectStore();
  
  const [name, setName] = useState("");
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [states, setStates] = useState([{ Name: "OFF", Color: "PURE_BLANK" }]);
  const [error, setError] = useState("");
  
  // Generate default name
  useEffect(() => {
    if (isOpen && assetName) {
      // Find next available name
      let baseName = assetName.toLowerCase();
      let counter = 1;
      let testName = baseName;
      
      while (!isNameUnique(testName)) {
        counter++;
        testName = `${baseName}_${counter}`;
      }
      
      setName(testName);
      setX(0);
      setY(0);
      setStates([{ Name: "OFF", Color: "PURE_BLANK" }]);
      setError("");
    }
  }, [isOpen, assetName, isNameUnique]);
  
  const handleAddState = () => {
    setStates([...states, { Name: `STATE_${states.length}`, Color: "PURE_WHITE" }]);
  };
  
  const handleRemoveState = (idx: number) => {
    if (states.length > 1) {
      setStates(states.filter((_, i) => i !== idx));
    }
  };
  
  const handleStateChange = (idx: number, field: "Name" | "Color", value: string) => {
    const newStates = [...states];
    newStates[idx] = { ...newStates[idx], [field]: value };
    setStates(newStates);
  };
  
  const handleSubmit = () => {
    // Validate name
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    
    if (!isNameUnique(name)) {
      setError(`Name "${name}" already exists`);
      return;
    }
    
    // Create instance
    const success = addInstance(screenIdx, assetName, {
      name: name.trim(),
      x: parseInt(String(x)) || 0,
      y: parseInt(String(y)) || 0,
      states,
    });
    
    if (success) {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  const colors = projectData?.Colors ? Object.keys(projectData.Colors) : [];
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-[400px] max-h-[80vh]"
      >
        <Card className="animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
          <CardHeader className="flex flex-row items-center justify-between p-5 border-b border-white/10 bg-white/[0.02]">
            <h3 className="text-sm font-semibold text-white">Add Instance</h3>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </CardHeader>

          <ScrollArea className="flex-1">
            <CardContent className="p-5 space-y-4">
              {/* Instance Name */}
              <div className="space-y-2">
                <SectionLabel>Instance Name *</SectionLabel>
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter unique name"
                />
                {error && (
                  <p className="text-xs text-red-400 ml-1">{error}</p>
                )}
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <SectionLabel>X</SectionLabel>
                  <Input
                    type="number"
                    value={x}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setX(parseInt(e.target.value) || 0)}
                    className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  />
                </div>
                <div className="space-y-2">
                  <SectionLabel>Y</SectionLabel>
                  <Input
                    type="number"
                    value={y}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setY(parseInt(e.target.value) || 0)}
                    className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  />
                </div>
              </div>

              {/* States */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <SectionLabel>States</SectionLabel>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleAddState}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {states.map((state, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-black/20 rounded-lg">
                      <input
                        value={state.Name}
                        onChange={(e) => handleStateChange(idx, "Name", e.target.value.toUpperCase())}
                        placeholder="STATE"
                        className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-white uppercase"
                      />
                      <select
                        value={state.Color}
                        onChange={(e) => handleStateChange(idx, "Color", e.target.value)}
                        className="bg-black/40 border border-white/5 rounded px-2 py-1 text-xs text-white outline-none cursor-pointer"
                      >
                        {colors.map((c) => (
                          <option key={c} value={c} className="bg-bg-elevated">{c}</option>
                        ))}
                      </select>
                      {states.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleRemoveState(idx)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </ScrollArea>

          <div className="p-5 border-t border-white/5 bg-white/[0.02] flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleSubmit}
            >
              Create Instance
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
