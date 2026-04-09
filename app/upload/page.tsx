'use client';

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import ParticleBackground from "../components/ParticleBackground";
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
        placeholderTitle: "Enter a Chinese or English title",
        labelText: "Text content",
        placeholderText: "Enter video description...",
        labelTags: "Tags",
        placeholderTag: "Tag",
        labelFollowers: "Account follower count",
        labelSubscribers: "Account following count",
        labelLikes: "Account total likes and bookmarks",
        labelProvince: "Hotel province / region",
        placeholderProvince: "Select province or region",
        btnSubmit: "Submit",
        loadingTitle: "Preparing submission...",
        loadingSteps: ["Uploading media...", "Extracting cover frame...", "Creating task..."],
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
        placeholderTitle: "输入中英文视频标题",
        labelText: "文本内容",
        placeholderText: "输入视频描述...",
        labelTags: "标签",
        placeholderTag: "标签",
        labelFollowers: "酒店粉丝数",
        labelSubscribers: "酒店订阅数",
        labelLikes: "酒店获赞与收藏数",
        labelProvince: "酒店所在省份 / 地区",
        placeholderProvince: "选择省份或地区",
        btnSubmit: "提交",
        loadingTitle: "正在创建任务...",
        loadingSteps: ["上传视频中...", "生成封面预览...", "写入分析任务..."],
    }
};

const provinceOptions = [
    "北京", "天津", "上海", "重庆", "河北", "山西", "辽宁", "吉林", "黑龙江", "江苏", "浙江",
    "安徽", "福建", "江西", "山东", "河南", "湖北", "湖南", "广东", "海南", "四川", "贵州",
    "云南", "陕西", "甘肃", "青海", "内蒙古", "广西", "西藏", "宁夏", "新疆", "香港", "澳门", "台湾"
];

async function generateVideoFramePreview(file: File) {
    const objectUrl = URL.createObjectURL(file);

    try {
        const preview = await new Promise<string | null>((resolve) => {
            const video = document.createElement("video");
            video.preload = "metadata";
            video.muted = true;
            video.playsInline = true;
            video.src = objectUrl;

            const cleanup = () => {
                video.remove();
            };

            const renderFrame = () => {
                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth || 640;
                canvas.height = video.videoHeight || 360;
                const ctx = canvas.getContext("2d");

                if (!ctx) {
                    cleanup();
                    resolve(null);
                    return;
                }

                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL("image/png");
                cleanup();
                resolve(dataUrl);
            };

            video.onloadedmetadata = () => {
                if (!Number.isFinite(video.duration) || video.duration <= 0.1) {
                    requestAnimationFrame(renderFrame);
                    return;
                }

                const seekTime = Math.min(Math.max(video.duration * 0.05, 0.05), Math.max(video.duration - 0.05, 0.05));
                video.currentTime = seekTime;
            };

            video.onseeked = renderFrame;
            video.onerror = () => {
                cleanup();
                resolve(null);
            };
        });

        return preview;
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}

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
    const [province, setProvince] = useState("");

    // File names for display
    const [videoName, setVideoName] = useState("");
    const [coverName, setCoverName] = useState("");
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [defaultCoverPreview, setDefaultCoverPreview] = useState<string | null>(null);

    const applyVideoFile = async (file: File) => {
        setVideoName(file.name);
        setVideoFile(file);
        setIsDraggingVideo(false);

        if (!coverFile) {
            const preview = await generateVideoFramePreview(file);
            setDefaultCoverPreview(preview);
        }
    };

    const handleVideoSelect = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            await applyVideoFile(file);
        }
    };

    const handleCoverSelect = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setCoverName(file.name);
            setCoverFile(file);
            setIsDraggingCover(false);
            setDefaultCoverPreview(null);
        }
    };

    const handleVideoDrop = async (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer?.files?.[0];
        if (file) {
            await applyVideoFile(file);
        }
        setIsDraggingVideo(false);
    };

    const handleCoverDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer?.files?.[0];
        if (file) {
            setCoverName(file.name);
            setCoverFile(file);
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
            if (!videoFile) {
                alert(t.supportVideo);
                setIsProcessing(false);
                return;
            }

            const payload = new FormData();
            payload.append("title", title);
            payload.append("textContent", content);
            payload.append("tags", JSON.stringify(tags.filter(tag => tag.trim())));
            payload.append("followers", String(Number(followers) || 0));
            payload.append("subscribers", String(Number(subscribers) || 0));
            payload.append("likes", String(Number(likes) || 0));
            if (!province) {
                alert(t.placeholderProvince);
                setIsProcessing(false);
                return;
            }

            payload.append("video", videoFile);
            if (coverFile) {
                payload.append("cover", coverFile);
            }
            payload.append("province", province);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: payload,
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
        <div className="page doc-home overview-page workspace-page workspace-inverse workspace-soft">
            <ParticleBackground />
            <Navbar />

            {isProcessing && (
                <div className="workspace-loading-overlay">
                    <div className="workspace-loading-card">
                        <div className="spinner"></div>
                        <h3>{t.loadingTitle}</h3>
                        <div className="workspace-loading-steps">
                            {t.loadingSteps.map((step) => (
                                <span key={step}>{step}</span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <section className="upload-section glass fade-up delay-1 workspace-panel workspace-section" style={{ padding: 32, marginTop: 32 }}>
                <div className="section-head workspace-header" style={{ marginBottom: 32 }}>
                    <h3>{t.pageTitle}</h3>
                </div>

                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                    {/* 1. Video */}
                    <div className="stack">
                        <label className="muted">{t.labelVideo}</label>
                        <div
                            className={`upload-box workspace-upload-box workspace-dropzone ${isDraggingVideo ? 'is-dragging' : ''}`}
                            style={{
                                borderRadius: 8,
                                padding: '40px 20px',
                                textAlign: 'center',
                                cursor: 'pointer'
                            }}
                            onClick={() => videoInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setIsDraggingVideo(true); }}
                            onDragLeave={() => setIsDraggingVideo(false)}
                            onDrop={handleVideoDrop}
                        >
                            <div style={{ fontWeight: 600, marginBottom: 8 }}>{t.clickUploadVideo}</div>
                            <div className="muted tiny">{t.supportVideo}</div>

                            {videoName && <div className="workspace-file-name" style={{ marginTop: 12 }}>{videoName}</div>}
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
                            className={`upload-box workspace-upload-box workspace-dropzone ${isDraggingCover ? 'is-dragging' : ''}`}
                            style={{
                                borderRadius: 8,
                                padding: '40px 20px',
                                textAlign: 'center',
                                cursor: 'pointer'
                            }}
                            onClick={() => coverInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setIsDraggingCover(true); }}
                            onDragLeave={() => setIsDraggingCover(false)}
                            onDrop={handleCoverDrop}
                        >
                            {coverName ? (
                                <>
                                    <div style={{ fontWeight: 600, marginBottom: 8 }}>{t.clickUploadCover}</div>
                                    <div className="muted tiny">{t.supportCover}</div>
                                    <div className="workspace-file-name" style={{ marginTop: 12 }}>{coverName}</div>
                                </>
                            ) : defaultCoverPreview ? (
                                <div style={{ display: 'grid', gap: 10, justifyItems: 'center' }}>
                                    <img
                                        src={defaultCoverPreview}
                                        alt="Default cover preview"
                                        style={{
                                            width: '100%',
                                            maxWidth: 260,
                                            maxHeight: 260,
                                            objectFit: 'contain',
                                            borderRadius: 10,
                                            border: '1px solid rgba(15,23,42,0.12)'
                                        }}
                                    />
                                    <div className="muted tiny">
                                        {lang === 'en' ? 'Using the first video frame as default cover' : '未上传封面时将使用视频第一帧'}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div style={{ fontWeight: 600, marginBottom: 8 }}>{t.clickUploadCover}</div>
                                    <div className="muted tiny">{t.supportCover}</div>
                                </>
                            )}
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
                                borderRadius: 8,
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
                                borderRadius: 8,
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
                                        borderRadius: 6,
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
                                        border: '1px solid rgba(140, 198, 255, 0.18)',
                                        background: 'rgba(122, 166, 255, 0.14)',
                                        color: '#eaf2ff',
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
                                borderRadius: 8,
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
                                borderRadius: 8,
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
                                borderRadius: 8,
                            }}
                        />
                    </div>

                    <div className="stack">
                        <label className="muted">{t.labelProvince}</label>
                        <select
                            className="input-field"
                            value={province}
                            onChange={(e) => setProvince(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: 8 }}
                        >
                            <option value="">{t.placeholderProvince}</option>
                            {provinceOptions.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
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
