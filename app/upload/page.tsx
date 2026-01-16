'use client';

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { useLanguage } from "../context/LanguageContext";

const copy = {
    en: {
        alertTitle: "Please enter a title",
        alertFailed: "Submission failed. Please try again.",
        pageTitle: "Upload Sources",
        labelVideo: "Video",
        clickUploadVideo: "Click to upload video",
        supportVideo: "Supported formats: MP4",
        labelCover: "Video cover image",
        clickUploadCover: "Upload cover",
        supportCover: "Supported formats: JPG, PNG",
        labelTitle: "Title",
        placeholderTitle: "Enter video title",
        labelText: "Text content",
        placeholderText: "Enter video description...",
        labelTags: "Tags",
        placeholderTag: "Tag",
        labelFollowers: "Number of hotel followers",
        labelSubscribers: "Number of hotel subscribers",
        labelLikes: "Number of hotel likes",
        btnSubmit: "Submit",
    },
    zh: {
        alertTitle: "请输入标题",
        alertFailed: "提交失败，请重试。",
        pageTitle: "上传素材",
        labelVideo: "视频",
        clickUploadVideo: "点击上传视频",
        supportVideo: "支持格式：MP4",
        labelCover: "视频封面图",
        clickUploadCover: "上传封面",
        supportCover: "支持格式：JPG, PNG",
        labelTitle: "标题",
        placeholderTitle: "输入视频标题",
        labelText: "文本内容",
        placeholderText: "输入视频描述...",
        labelTags: "标签",
        placeholderTag: "标签",
        labelFollowers: "酒店粉丝数",
        labelSubscribers: "酒店订阅数",
        labelLikes: "酒店点赞数",
        btnSubmit: "提交",
    }
};

export default function UploadPage() {
    const router = useRouter();
    const { lang } = useLanguage();
    const t = copy[lang];
    const [isProcessing, setIsProcessing] = useState(false);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const [isDraggingVideo, setIsDraggingVideo] = useState(false);
    const [isDraggingCover, setIsDraggingCover] = useState(false);

    // Form States
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState(["", "", ""]);
    const [followers, setFollowers] = useState("");
    const [subscribers, setSubscribers] = useState("");
    const [likes, setLikes] = useState("");

    // File names for display
    const [videoName, setVideoName] = useState("");
    const [coverName, setCoverName] = useState("");

    const handleVideoSelect = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setVideoName(file.name);
            setIsDraggingVideo(false);
        }
    };

    const handleCoverSelect = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setCoverName(file.name);
            setIsDraggingCover(false);
        }
    };

    const handleVideoDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer?.files?.[0];
        if (file) {
            setVideoName(file.name);
        }
        setIsDraggingVideo(false);
    };

    const handleCoverDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer?.files?.[0];
        if (file) {
            setCoverName(file.name);
        }
        setIsDraggingCover(false);
    };

    const handleAddTag = () => {
        setTags([...tags, ""]);
    };

    const handleTagChange = (index: number, value: string) => {
        const newTags = [...tags];
        newTags[index] = value;
        setTags(newTags);
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            alert(t.alertTitle);
            return;
        }

        setIsProcessing(true);

        try {
            const payload = {
                title,
                textContent: content,
                tags,
                followers: Number(followers) || 0,
                subscribers: Number(subscribers) || 0,
                likes: Number(likes) || 0,
                video: videoName || "mock_video.mp4",
                cover: coverName || "mock_cover.jpg"
            };

            const res = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            router.push(`/prediction/${data.id}`);

        } catch (error) {
            console.error(error);
            alert(t.alertFailed);
            setIsProcessing(false);
        }
    };

    return (
        <div className="page">
            <Navbar />



            <section className="upload-section glass fade-up delay-1" style={{ padding: 32, marginTop: 32 }}>
                <div className="section-head" style={{ marginBottom: 32 }}>
                    <h3>{t.pageTitle}</h3>
                </div>

                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                    {/* 1. Video */}
                    <div className="stack">
                        <label className="muted">{t.labelVideo}</label>
                        <div
                            className="upload-box"
                            style={{
                                border: `1px dashed ${isDraggingVideo ? 'rgba(106,227,255,0.8)' : 'rgba(255,255,255,0.2)'}`,
                                borderRadius: 8,
                                padding: '40px 20px',
                                textAlign: 'center',
                                background: isDraggingVideo ? 'rgba(106,227,255,0.08)' : 'rgba(255,255,255,0.02)',
                                cursor: 'pointer'
                            }}
                            onClick={() => videoInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setIsDraggingVideo(true); }}
                            onDragLeave={() => setIsDraggingVideo(false)}
                            onDrop={handleVideoDrop}
                        >
                            <div style={{ fontWeight: 600, color: '#e8f0ff', marginBottom: 8 }}>{t.clickUploadVideo}</div>
                            <div className="muted tiny">{t.supportVideo}</div>

                            {videoName && <div style={{ color: '#6ae3ff', marginTop: 12 }}>{videoName}</div>}
                        </div>
                        <input
                            ref={videoInputRef}
                            type="file"
                            accept="video/mp4"
                            style={{ display: 'none' }}
                            onChange={handleVideoSelect}
                        />
                    </div>

                    {/* 2. Cover Image */}
                    <div className="stack">
                        <label className="muted">{t.labelCover}</label>
                        <div
                            className="upload-box"
                            style={{
                                border: `1px dashed ${isDraggingCover ? 'rgba(106,227,255,0.8)' : 'rgba(255,255,255,0.2)'}`,
                                borderRadius: 8,
                                padding: '40px 20px',
                                textAlign: 'center',
                                background: isDraggingCover ? 'rgba(106,227,255,0.08)' : 'rgba(255,255,255,0.02)',
                                cursor: 'pointer'
                            }}
                            onClick={() => coverInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setIsDraggingCover(true); }}
                            onDragLeave={() => setIsDraggingCover(false)}
                            onDrop={handleCoverDrop}
                        >
                            <div style={{ fontWeight: 600, color: '#e8f0ff', marginBottom: 8 }}>{t.clickUploadCover}</div>
                            <div className="muted tiny">{t.supportCover}</div>

                            {coverName && <div style={{ color: '#6ae3ff', marginTop: 12 }}>{coverName}</div>}
                        </div>
                        <input
                            ref={coverInputRef}
                            type="file"
                            accept="image/jpeg,image/png"
                            style={{ display: 'none' }}
                            onChange={handleCoverSelect}
                        />
                    </div>

                    {/* 3. Title */}
                    <div className="stack full" style={{ gridColumn: '1 / -1' }}>
                        <label className="muted">{t.labelTitle}</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder={t.placeholderTitle}

                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 8,
                                color: '#fff'
                            }}
                        />
                    </div>

                    {/* 4. Text Content */}
                    <div className="stack full" style={{ gridColumn: '1 / -1' }}>
                        <label className="muted">{t.labelText}</label>
                        <textarea
                            rows={5}
                            placeholder={t.placeholderText}

                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 8,
                                color: '#fff'
                            }}
                        />
                    </div>

                    {/* 5. Tags */}
                    <div className="stack full" style={{ gridColumn: '1 / -1' }}>
                        <label className="muted">{t.labelTags}</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                            {tags.map((tag, idx) => (
                                <input
                                    key={idx}
                                    type="text"
                                    value={tag}
                                    onChange={(e) => handleTagChange(idx, e.target.value)}
                                    placeholder={`${t.placeholderTag} ${idx + 1}`}
                                    style={{
                                        width: 120,
                                        padding: '8px 12px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 6,
                                        color: '#fff',
                                        fontSize: 14
                                    }}
                                />
                            ))}
                            <button
                                onClick={handleAddTag}
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 6,
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    background: 'transparent',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: 18
                                }}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* 6. Hotel Followers */}
                    <div className="stack">
                        <label className="muted">{t.labelFollowers}</label>
                        <input
                            type="number"
                            className="input-field"
                            value={followers}
                            onChange={(e) => setFollowers(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 8,
                                color: '#fff'
                            }}
                        />
                    </div>

                    {/* 7. Hotel Subscribers */}
                    <div className="stack">
                        <label className="muted">{t.labelSubscribers}</label>
                        <input
                            type="number"
                            className="input-field"
                            value={subscribers}
                            onChange={(e) => setSubscribers(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 8,
                                color: '#fff'
                            }}
                        />
                    </div>

                    {/* 8. Hotel Likes */}
                    <div className="stack">
                        <label className="muted">{t.labelLikes}</label>
                        <input
                            type="number"
                            className="input-field"
                            value={likes}
                            onChange={(e) => setLikes(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 8,
                                color: '#fff'
                            }}
                        />
                    </div>

                </div>

                <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center' }}>
                    <button
                        className="primary-button"
                        style={{ padding: '14px 48px', fontSize: 16 }}
                        onClick={handleSubmit}
                    >
                        {t.btnSubmit}
                    </button>
                </div>
            </section>
        </div>
    );
}
