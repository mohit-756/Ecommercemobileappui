import { InputHTMLAttributes, forwardRef, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        {label && <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary ml-1">{label}</label>}
        <div className="relative flex items-center">
          {leftIcon && <div className="absolute left-4 text-gray-400 dark:text-text-tertiary">{leftIcon}</div>}
          <input
            ref={ref}
            className={`flex h-14 w-full rounded-2xl border ${error ? "border-red-500 focus:ring-red-500" : "border-gray-200 dark:border-border-medium focus:ring-blue-600"} bg-gray-50/50 dark:bg-surface-secondary px-4 py-2 text-sm text-gray-900 dark:text-text-primary placeholder:text-gray-400 dark:placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:border-transparent transition-all ${leftIcon ? "pl-11" : ""} ${rightIcon ? "pr-11" : ""} ${className}`}
            {...props}
          />
          {rightIcon && <div className="absolute right-4 text-gray-400 dark:text-text-tertiary">{rightIcon}</div>}
        </div>
        {error && <p className="text-xs text-red-500 ml-1 mt-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
