import React from 'react';
import { cn } from '../../utils/cn';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
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
        {options.map((option, idx) => (
          <option
            key={`${option.value}-${idx}`}
            value={option.value}
            disabled={option.disabled}
            style={option.disabled ? { color: '#94a3b8', fontStyle: 'italic', fontWeight: 600 } : undefined}
          >
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);
Select.displayName = 'Select';

