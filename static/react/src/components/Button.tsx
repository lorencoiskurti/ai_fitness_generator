interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  loading?: boolean;
}

const Button = ({
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  children,
  className = '',
  disabled = false,
  ...props
}: ButtonProps) => {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-purple-600 to-purple-900 text-white hover:from-purple-700 hover:to-purple-950 shadow-lg hover:shadow-xl',
    secondary: 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-50',
    danger: 'bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800 shadow-lg hover:shadow-xl',
    success: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 shadow-lg hover:shadow-xl',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm font-semibold',
    md: 'px-4 py-2 text-base font-semibold',
    lg: 'px-6 py-3 text-lg font-semibold',
  };

  return (
    <button
      disabled={loading || disabled}
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500 disabled:opacity-60 disabled:pointer-events-none hover:transform hover:-translate-y-0.5 ${
        variantClasses[variant]
      } ${sizeClasses[size]} ${block ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <span className="mr-2 h-4 w-4 animate-spin border-2 border-white/50 border-t-2 border-white rounded-full" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;