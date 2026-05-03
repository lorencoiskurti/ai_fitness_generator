interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function Modal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
  isLoading = false
}: ModalProps) {
  if (!isOpen) return null;

  const confirmButtonColors = {
    danger: 'bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800',
    primary: 'bg-gradient-to-r from-purple-600 to-purple-900 text-white hover:from-purple-700 hover:to-purple-950'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-sm w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 font-medium transition-colors disabled:opacity-60"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg ${confirmButtonColors[confirmVariant]} font-medium transition-colors disabled:opacity-60 flex items-center gap-2`}
            >
              {isLoading && <div className="animate-spin">⏳</div>}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
