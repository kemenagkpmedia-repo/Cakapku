import React from 'react';
import { cn } from '../../utils/cn';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { label: string; value: string | number }[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, ...props }, ref) => {
    return (
      <select
        className={cn(
          'w-full px-3 py-2 border border-border rounded-md text-[0.8125rem] bg-white focus:outline-none focus:border-accent disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);
Select.displayName = 'Select';
