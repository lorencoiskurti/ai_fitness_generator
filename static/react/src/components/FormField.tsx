import { InputHTMLAttributes } from 'react';

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  icon?: string;
  required?: boolean;
}

export default function FormField({
  label,
  name,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error,
  icon,
  required = false,
  min,
  max,
  step,
  ...props
}: FormFieldProps) {
  const isNumberInput = type === 'number';

  const handleIncrement = () => {
    const currentValue = parseFloat(String(value)) || 0;
    const stepValue = parseFloat(String(step)) || 1;
    const maxValue = max ? parseFloat(String(max)) : Infinity;
    const newValue = Math.min(currentValue + stepValue, maxValue);
    onChange({ target: { name, value: String(newValue) } } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleDecrement = () => {
    const currentValue = parseFloat(String(value)) || 0;
    const stepValue = parseFloat(String(step)) || 1;
    const minValue = min ? parseFloat(String(min)) : -Infinity;
    const newValue = Math.max(currentValue - stepValue, minValue);
    onChange({ target: { name, value: String(newValue) } } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="form-group">
      <label className="block text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
        {label}
        {required && <span className="text-red-600">*</span>}
      </label>
      <div className="relative group">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 ${icon ? 'pl-12' : 'pl-4'} ${isNumberInput ? 'pr-8' : 'pr-4'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
            error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-slate-600 focus:border-purple-500'
          }`}
          min={min}
          max={max}
          step={step}
          {...props}
        />
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">
            {icon}
          </span>
        )}
        {isNumberInput && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col gap-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={handleIncrement}
              className="h-3 w-5 flex items-center justify-center text-xs text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-600 rounded transition-colors"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={handleDecrement}
              className="h-3 w-5 flex items-center justify-center text-xs text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-600 rounded transition-colors"
            >
              ▼
            </button>
          </div>
        )}
      </div>
      {error && (
        <p className="text-red-600 text-sm mt-1 font-medium">{error}</p>
      )}
    </div>
  );
}