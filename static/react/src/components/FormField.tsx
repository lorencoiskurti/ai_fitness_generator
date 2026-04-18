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
  ...props
}: FormFieldProps) {
  return (
    <div className="form-group">
      <label className="block text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
        {label}
        {required && <span className="text-red-600">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 ${icon ? 'pl-12' : 'pl-4'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
            error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-purple-500'
          }`}
          {...props}
        />
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">
            {icon}
          </span>
        )}
      </div>
      {error && (
        <p className="text-red-600 text-sm mt-1 font-medium">{error}</p>
      )}
    </div>
  );
}