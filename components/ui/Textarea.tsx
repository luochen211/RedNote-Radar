import React, { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, className = "", ...props }, ref) => {
        return (
            <div className="stack">
                {label && <label className="muted">{label}</label>}
                <textarea
                    ref={ref}
                    className={`ui-input-field ui-textarea ${className}`}
                    {...props}
                />
                {error && <div className="ui-error-text">{error}</div>}
            </div>
        );
    }
);

Textarea.displayName = "Textarea";
