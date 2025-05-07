import React from 'react';
import { cn } from '@/lib/utils'; // Assuming you have a utility for class names

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onValueChange?: (value: string) => void;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, onValueChange, onChange, ...props }, ref) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (onValueChange) {
      onValueChange(event.target.value);
    }
    if (onChange) {
      onChange(event);
    }
  };

  return (
    <select
      ref={ref}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      onChange={handleChange}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = 'Select';

export default Select;