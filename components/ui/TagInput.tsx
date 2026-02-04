import React from 'react';

interface TagInputProps {
    label: string;
    tags: string[];
    placeholder: string;
    onTagsChange: (tags: string[]) => void;
}

export const TagInput: React.FC<TagInputProps> = ({
    label,
    tags,
    placeholder,
    onTagsChange
}) => {
    const handleTagChange = (index: number, value: string) => {
        const newTags = [...tags];
        newTags[index] = value;
        onTagsChange(newTags);
    };

    const handleAddTag = () => {
        onTagsChange([...tags, ""]);
    };

    const handleRemoveTag = (index: number) => {
        const newTags = tags.filter((_, i) => i !== index);
        onTagsChange(newTags);
    };

    return (
        <div className="stack full" style={{ gridColumn: '1 / -1' }}>
            <label className="muted">{label}</label>
            <div className="ui-tag-container">
                {tags.map((tag, idx) => (
                    <div key={idx} className="ui-tag-wrapper">
                        <input
                            type="text"
                            value={tag}
                            onChange={(e) => handleTagChange(idx, e.target.value)}
                            placeholder={`${placeholder} ${idx + 1}`}
                            className="ui-tag-input"
                        />
                        {tags.length > 1 && (
                            <button
                                onClick={() => handleRemoveTag(idx)}
                                className="ui-tag-remove-btn"
                                title="Remove"
                            >
                                ×
                            </button>
                        )}
                    </div>
                ))}
                <button
                    onClick={handleAddTag}
                    className="ui-tag-add-btn"
                >
                    +
                </button>
            </div>
        </div>
    );
};
