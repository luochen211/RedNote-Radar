import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost';
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "primary", isLoading, children, ...props }, ref) => {
        const variantClass = variant === 'primary' ? 'primary-button'
            : variant === 'outline' ? 'outline-button'
                : 'ghost-button';

        return (
            <button
                ref={ref}
                className={`${variantClass} ${className}`}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading ? 'Loading...' : children}
            </button>
        );
    }
);

Button.displayName = "Button";
