import { useAppStore } from "@/store/useAppStore";
import { AlertTriangle, X } from "lucide-react";

export function ConfirmModal() {
  const { confirmDialog, closeConfirm } = useAppStore();

  if (!confirmDialog || !confirmDialog.isOpen) return null;

  const handleConfirm = () => {
    confirmDialog.resolve(true); // Возвращаем true
    closeConfirm();
  };

  const handleCancel = () => {
    confirmDialog.resolve(false); // Возвращаем false
    closeConfirm();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121212] border border-white/10 w-[400px] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Хедер с иконкой */}
        <div className="flex items-center gap-3 p-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <h2 className="text-sm font-semibold text-white">
            {confirmDialog.title}
          </h2>
          <button
            onClick={handleCancel}
            className="ml-auto text-muted-foreground hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Текст сообщения */}
        <div className="p-6">
          <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">
            {confirmDialog.message}
          </p>
        </div>

        {/* Кнопки */}
        <div className="p-5 border-t border-white/10 bg-white/[0.02] flex items-center justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl text-xs font-bold transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
