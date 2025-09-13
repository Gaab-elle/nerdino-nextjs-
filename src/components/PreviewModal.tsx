import React from "react";

type Props = { open: boolean; onClose: () => void; children: React.ReactNode };

export const PreviewModal: React.FC<Props> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-4xl rounded shadow-lg overflow-hidden">
        <div className="flex justify-between items-center p-3 border-b">
          <h3 className="text-sm font-medium">Preview do Projeto</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-black">Fechar ✕</button>
        </div>
        <div className="p-0">{children}</div>
      </div>
    </div>
  );
};
