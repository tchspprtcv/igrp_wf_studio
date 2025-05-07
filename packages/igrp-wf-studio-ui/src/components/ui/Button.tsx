import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    children, 
    variant = "primary", 
    size = "md", 
    isLoading = false,
    icon,
    disabled,
    ...props 
  }, ref) => {
    const variantClasses = {
      primary: "btn-primary",
      secondary: "btn-secondary",
      accent: "btn-accent",
      danger: "btn-danger",
      ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
    };

    const sizeClasses = {
      sm: "text-xs px-2.5 py-1.5",
      md: "text-sm px-4 py-2",
      lg: "text-base px-6 py-3",
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={cn(
          "btn",
          variantClasses[variant],
          sizeClasses[size],
          isLoading && "opacity-70 cursor-not-allowed",
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && icon && (
          <span className="mr-2">{icon}</span>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;