import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", isLoading, fullWidth, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none rounded-2xl";
    
    const variants = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600 shadow-lg shadow-blue-600/20",
      secondary: "bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500 shadow-lg shadow-emerald-500/20",
      outline: "border-2 border-gray-200 dark:border-border-medium bg-transparent hover:bg-gray-50 dark:hover:bg-surface-secondary text-gray-900 dark:text-text-primary focus:ring-gray-200 dark:focus:ring-border-medium",
      ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-surface-secondary text-gray-700 dark:text-text-secondary focus:ring-gray-200 dark:focus:ring-border-medium",
    };

    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-12 px-6 text-base",
      lg: "h-14 px-8 text-lg",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
