import React, { forwardRef } from 'react';

export interface SwitchProps extends React.HTMLAttributes<HTMLDivElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const Switch = forwardRef<HTMLDivElement, SwitchProps>(
  ({ checked, onCheckedChange, disabled = false, className = '', ...props }, ref) => {
    return (
      <div
        className={`relative inline-flex h-6 w-11 cursor-pointer rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        } ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`}
        onClick={() => !disabled && onCheckedChange(!checked)}
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        ref={ref}
        {...props}
      >
        <span
          className={`block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-1'
          }`}
          style={{ margin: '2px' }}
        />
      </div>
    );
  }
); 