import React, { useRef, useState, ChangeEvent, DragEvent } from 'react';

interface FileUploadProps {
    label: string;
    accept: string;
    supportText: string;
    clickText: string;
    fileName?: string;
    onFileSelect: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    label,
    accept,
    supportText,
    clickText,
    fileName,
    onFileSelect
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleSelect = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileSelect(file);
            setIsDragging(false);
        }
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer?.files?.[0];
        if (file) {
            onFileSelect(file);
        }
        setIsDragging(false);
    };

    return (
        <div className="stack">
            <label className="muted">{label}</label>
            <div
                className={`ui-upload-box ${isDragging ? 'dragging' : ''}`}
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
            >
                <div className="ui-upload-text-main">{clickText}</div>
                <div className="muted tiny">{supportText}</div>
                {fileName && <div className="ui-upload-filename">{fileName}</div>}
            </div>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                style={{ display: 'none' }}
                onChange={handleSelect}
            />
        </div>
    );
};
