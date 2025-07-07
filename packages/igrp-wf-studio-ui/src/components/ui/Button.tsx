import React from "react";
import { cn } from "@/lib/utils";
import { Button as ShadcnButton, type ButtonProps as ShadcnButtonProps } from "@/components/ui/button"; // Shadcn button (lowercase)
import { Loader2 } from "lucide-react"; // For loading spinner

// Extend ShadcnButtonProps if necessary, or define new ones
export interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "danger" | "ghost" | "link" | "outline" | "default"; // Added shadcn variants
  size?: "sm" | "md" | "lg" | "icon" | "default"; // Added shadcn sizes
  isLoading?: boolean;
  icon?: React.ReactNode;
  asChild?: boolean; // Prop from shadcn for composition
}

const Button = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ 
    className, 
    children, 
    variant = "primary", // Default to "primary" which will map to shadcn's "default"
    size = "md", 
    isLoading = false,
    icon,
    disabled,
    asChild = false,
    ...props 
  }, ref) => {

    const shadcnVariantMap: Record<NonNullable<CustomButtonProps['variant']>, NonNullable<ShadcnButtonProps['variant']>> = {
      primary: "default",   // Old 'primary' maps to shadcn 'default'
      default: "default",   // Allow direct use of 'default'
      secondary: "secondary",
      accent: "default",    // Old 'accent' maps to shadcn 'default' (theme primary color)
      danger: "destructive",
      ghost: "ghost",
      link: "link",
      outline: "outline"
    };

    const shadcnSizeMap: Record<NonNullable<CustomButtonProps['size']>, NonNullable<ShadcnButtonProps['size']>> = {
      sm: "sm",
      md: "default", // Old 'md' maps to shadcn 'default' size
      default: "default", // Allow direct use of 'default' size
      lg: "lg",
      icon: "icon"
    };

    const selectedShadcnVariant = shadcnVariantMap[variant] || "default";
    const selectedShadcnSize = shadcnSizeMap[size] || "default";

    return (
      <ShadcnButton
        ref={ref}
        variant={selectedShadcnVariant}
        size={selectedShadcnSize}
        disabled={isLoading || disabled}
        className={cn(className)} // cn will merge existing shadcn classes with any custom ones
        asChild={asChild}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {children}
          </>
        ) : (
          <>
            {icon && <span className={children ? "mr-2" : ""}>{icon}</span>}
            {children}
          </>
        )}
      </ShadcnButton>
    );
  }
);

Button.displayName = "Button";

export default Button;