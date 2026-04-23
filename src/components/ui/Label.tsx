import React from 'react';
import { cn } from '../../utils/cn';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('block text-xs font-medium mb-1 text-text-muted peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
      {...props}
    />
  )
);
Label.displayName = 'Label';
