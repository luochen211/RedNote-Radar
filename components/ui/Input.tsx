import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = "", ...props }, ref) => {
        return (
            <div className="stack">
                {label && <label className="muted">{label}</label>}
                <input
                    ref={ref}
                    className={`ui-input-field ${className}`}
                    {...props}
                />
                {error && <div className="ui-error-text">{error}</div>}
            </div>
        );
    }
);

Input.displayName = "Input";
