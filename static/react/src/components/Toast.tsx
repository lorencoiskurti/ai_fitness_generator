import { useToast } from '../hooks/useToast';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '•';
    }
  };

  const getStyles = (type: string) => {
    const baseStyles = 'fixed right-4 md:right-6 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-sm animate-in slide-in-from-right-full duration-300';

    switch (type) {
      case 'success':
        return `${baseStyles} bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200`;
      case 'error':
        return `${baseStyles} bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-900 dark:text-red-200`;
      case 'warning':
        return `${baseStyles} bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 text-amber-900 dark:text-amber-200`;
      case 'info':
        return `${baseStyles} bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-900 dark:text-blue-200`;
      default:
        return baseStyles;
    }
  };

  const getIconStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-emerald-600 font-bold';
      case 'error':
        return 'text-red-600 font-bold';
      case 'warning':
        return 'text-amber-600 font-bold';
      case 'info':
        return 'text-blue-600 font-bold';
      default:
        return 'font-bold';
    }
  };

  return (
    <div className="fixed top-0 right-0 z-50 pointer-events-none">
      <div className="pointer-events-auto flex flex-col gap-3 p-4 md:p-6">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className={`${getStyles(toast.type)} animate-in slide-in-from-right-full duration-300`}
            style={{
              top: `${index * 80 + 16}px`,
              minWidth: '320px',
              maxWidth: '400px'
            }}
          >
            <span className={`text-xl flex-shrink-0 ${getIconStyles(toast.type)}`}>
              {getIcon(toast.type)}
            </span>
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-lg leading-none opacity-60 hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
