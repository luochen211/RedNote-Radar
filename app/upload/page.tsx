'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useLanguage } from "../context/LanguageContext";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { FileUpload } from "@/components/ui/FileUpload";
import { TagInput } from "@/components/ui/TagInput";
import { Button } from "@/components/ui/Button";

interface Submission {
    id: string;
    status: string;
    createdAt: string;
    inputData: string;
}

const createCoverFromVideo = async (videoFile: File): Promise<File | null> =>
    new Promise((resolve) => {
        const objectUrl = URL.createObjectURL(videoFile);
        const video = document.createElement("video");
        let settled = false;

        const cleanup = () => {
            URL.revokeObjectURL(objectUrl);
            video.remove();
        };

        const finish = (value: File | null) => {
            if (settled) return;
            settled = true;
            cleanup();
            resolve(value);
        };

        const capture = () => {
            if (!video.videoWidth || !video.videoHeight) {
                finish(null);
                return;
            }

            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext("2d");
            if (!context) {
                finish(null);
                return;
            }

            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        finish(null);
                        return;
                    }

                    const baseName = videoFile.name.replace(/\.[^/.]+$/, "") || "video";
                    const cover = new File([blob], `${baseName}-cover.jpg`, { type: "image/jpeg" });
                    finish(cover);
                },
                "image/jpeg",
                0.92
            );
        };

        video.preload = "metadata";
        video.muted = true;
        video.playsInline = true;
        video.onloadeddata = capture;
        video.onerror = () => finish(null);
        video.src = objectUrl;
        video.load();
    });

const PROVINCES = [
    { value: "Anhui", en: "Anhui", zh: "安徽" },
    { value: "Beijing", en: "Beijing", zh: "北京" },
    { value: "Chongqing", en: "Chongqing", zh: "重庆" },
    { value: "Fujian", en: "Fujian", zh: "福建" },
    { value: "Gansu", en: "Gansu", zh: "甘肃" },
    { value: "Guangdong", en: "Guangdong", zh: "广东" },
    { value: "Guangxi", en: "Guangxi", zh: "广西" },
    { value: "Guizhou", en: "Guizhou", zh: "贵州" },
    { value: "Hainan", en: "Hainan", zh: "海南" },
    { value: "Hebei", en: "Hebei", zh: "河北" },
    { value: "Heilongjiang", en: "Heilongjiang", zh: "黑龙江" },
    { value: "Henan", en: "Henan", zh: "河南" },
    { value: "Hubei", en: "Hubei", zh: "湖北" },
    { value: "Hunan", en: "Hunan", zh: "湖南" },
    { value: "Inner Mongolia", en: "Inner Mongolia", zh: "内蒙古" },
    { value: "Jiangsu", en: "Jiangsu", zh: "江苏" },
    { value: "Jiangxi", en: "Jiangxi", zh: "江西" },
    { value: "Jilin", en: "Jilin", zh: "吉林" },
    { value: "Liaoning", en: "Liaoning", zh: "辽宁" },
    { value: "Ningxia", en: "Ningxia", zh: "宁夏" },
    { value: "Qinghai", en: "Qinghai", zh: "青海" },
    { value: "Shaanxi", en: "Shaanxi", zh: "陕西" },
    { value: "Shandong", en: "Shandong", zh: "山东" },
    { value: "Shanghai", en: "Shanghai", zh: "上海" },
    { value: "Shanxi", en: "Shanxi", zh: "山西" },
    { value: "Sichuan", en: "Sichuan", zh: "四川" },
    { value: "Tianjin", en: "Tianjin", zh: "天津" },
    { value: "Tibet", en: "Tibet", zh: "西藏" },
    { value: "Xinjiang", en: "Xinjiang", zh: "新疆" },
    { value: "Yunnan", en: "Yunnan", zh: "云南" },
    { value: "Zhejiang", en: "Zhejiang", zh: "浙江" },
    { value: "Hong Kong SAR", en: "Hong Kong SAR", zh: "香港特别行政区" },
    { value: "Macao SAR", en: "Macao SAR", zh: "澳门特别行政区" },
    { value: "Taiwan", en: "Taiwan", zh: "台湾" },
];

const copy = {
    en: {
        alertTitle: "Please enter a title",
        alertVideo: "Please upload a video file",
        alertProvince: "Please select the hotel's province",
        alertFailed: "Submission failed. Please try again.",
        pageTitle: "Upload Sources",
        labelVideo: "Video",
        clickUploadVideo: "Click to upload video",
        supportVideo: "Supported formats: MP4",
        labelCover: "Video cover image (Optional)",
        clickUploadCover: "Upload cover",
        supportCover: "Default: First frame of video",
        labelTitle: "Title",
        placeholderTitle: "Enter video title",
        labelText: "Text content",
        placeholderText: "Enter video description...",
        labelTags: "Tags",
        placeholderTag: "Tag",
        labelFollowers: "Number of hotel followers",
        labelSubscribers: "Number of hotel subscribers",
        labelLikes: "Number of hotel likes",
        labelProvince: "Hotel province",
        placeholderProvince: "Select a province",
        btnSubmit: "Submit",
        historyTitle: "Recent Upload History",
        historyLoading: "Loading history...",
        historyEmpty: "No uploads yet.",
        untitled: "Untitled",
        noCover: "No cover",
    },
    zh: {
        alertTitle: "请输入标题",
        alertVideo: "请上传视频文件",
        alertProvince: "请选择酒店所在省份",
        alertFailed: "提交失败，请重试。",
        pageTitle: "上传素材",
        labelVideo: "视频",
        clickUploadVideo: "点击上传视频",
        supportVideo: "支持格式：MP4",
        labelCover: "视频封面图 (选填)",
        clickUploadCover: "上传封面",
        supportCover: "默认截取视频首帧",
        labelTitle: "标题",
        placeholderTitle: "输入视频标题",
        labelText: "文本内容",
        placeholderText: "输入视频描述...",
        labelTags: "标签",
        placeholderTag: "标签",
        labelFollowers: "酒店粉丝数",
        labelSubscribers: "酒店订阅数",
        labelLikes: "酒店点赞数",
        labelProvince: "酒店所在省份",
        placeholderProvince: "请选择省份",
        btnSubmit: "提交",
        historyTitle: "最近上传记录",
        historyLoading: "加载历史中...",
        historyEmpty: "暂无上传记录。",
        untitled: "未命名",
        noCover: "无封面",
    }
};

export default function UploadPage() {
    const router = useRouter();
    const { lang } = useLanguage();
    const t = copy[lang];
    const [isProcessing, setIsProcessing] = useState(false);

    // Form States
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState([""]);
    const [followers, setFollowers] = useState("");
    const [subscribers, setSubscribers] = useState("");
    const [likes, setLikes] = useState("");
    const [province, setProvince] = useState("");

    // File names for display
    const [videoName, setVideoName] = useState("");
    const [coverName, setCoverName] = useState("");
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [history, setHistory] = useState<Submission[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch('/api/history');
                if (res.ok) {
                    setHistory(await res.json());
                }
            } catch (error) {
                console.error(error);
            } finally {
                setHistoryLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const handleVideoSelect = (file: File) => {
        setVideoFile(file);
        setVideoName(file.name);
    };

    const handleCoverSelect = (file: File) => {
        setCoverFile(file);
        setCoverName(file.name);
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            alert(t.alertTitle);
            return;
        }
        if (!videoFile) {
            alert(t.alertVideo);
            return;
        }
        if (!province) {
            alert(t.alertProvince);
            return;
        }

        setIsProcessing(true);

        try {
            const payload = new FormData();
            payload.append('video', videoFile);
            const resolvedCover = coverFile || await createCoverFromVideo(videoFile);
            if (resolvedCover) {
                payload.append('cover', resolvedCover);
            }
            payload.append('title', title);
            payload.append('textContent', content);
            payload.append('tags', JSON.stringify(tags.filter(tag => tag.trim())));
            payload.append('followers', String(Number(followers) || 0));
            payload.append('subscribers', String(Number(subscribers) || 0));
            payload.append('likes', String(Number(likes) || 0));
            payload.append('province', province);

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
        <div className="page app-page">
            <section className="upload-section glass app-section app-section-lg fade-up delay-1">
                <div className="section-head section-intro">
                    <h3>{t.pageTitle}</h3>
                </div>

                <div className="form-grid">
                    {/* 1. Video */}
                    <FileUpload
                        label={t.labelVideo}
                        accept="video/mp4"
                        clickText={t.clickUploadVideo}
                        supportText={t.supportVideo}
                        fileName={videoName}
                        onFileSelect={handleVideoSelect}
                    />

                    {/* 2. Cover Image */}
                    <FileUpload
                        label={t.labelCover}
                        accept="image/jpeg,image/png"
                        clickText={t.clickUploadCover}
                        supportText={t.supportCover}
                        fileName={coverName}
                        onFileSelect={handleCoverSelect}
                    />

                    {/* 3. Title */}
                    <div className="stack full">
                        <Input
                            label={t.labelTitle}
                            placeholder={t.placeholderTitle}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* 4. Text Content */}
                    <div className="stack full">
                        <Textarea
                            label={t.labelText}
                            placeholder={t.placeholderText}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    {/* 5. Tags */}
                    <TagInput
                        label={t.labelTags}
                        tags={tags}
                        placeholder={t.placeholderTag}
                        onTagsChange={setTags}
                    />

                    {/* 6. Metrics */}
                    <Input
                        type="number"
                        label={t.labelFollowers}
                        value={followers}
                        onChange={(e) => setFollowers(e.target.value)}
                    />

                    <Input
                        type="number"
                        label={t.labelSubscribers}
                        value={subscribers}
                        onChange={(e) => setSubscribers(e.target.value)}
                    />

                    <Input
                        type="number"
                        label={t.labelLikes}
                        value={likes}
                        onChange={(e) => setLikes(e.target.value)}
                    />

                    <div className="stack">
                        <label className="muted">{t.labelProvince}</label>
                        <select
                            className="ui-input-field"
                            value={province}
                            onChange={(e) => setProvince(e.target.value)}
                        >
                            <option value="">{t.placeholderProvince}</option>
                            {PROVINCES.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {lang === 'en' ? item.en : item.zh}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>
                    <Button
                        onClick={handleSubmit}
                        isLoading={isProcessing}
                    >
                        {t.btnSubmit}
                    </Button>
                </div>

                <div style={{ marginTop: 34 }}>
                    <h4 style={{ marginBottom: 12 }}>{t.historyTitle}</h4>
                    {historyLoading ? (
                        <div className="muted">{t.historyLoading}</div>
                    ) : history.length === 0 ? (
                        <div className="muted">{t.historyEmpty}</div>
                    ) : (
                        <div className="app-stack">
                            {history.slice(0, 6).map((item) => {
                                let parsedTitle = t.untitled;
                                try {
                                    const input = JSON.parse(item.inputData);
                                    parsedTitle = input.title || t.untitled;
                                } catch {
                                    parsedTitle = t.untitled;
                                }
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.status === 'COMPLETED' ? `/analysis/${item.id}` : `/prediction/${item.id}`}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <div className="upload-box history-card" style={{
                                            padding: 16,
                                            borderRadius: 8,
                                            background: 'rgba(255,255,255,0.92)',
                                            border: '1px solid rgba(2,132,199,0.15)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 14
                                        }}>
                                            <div style={{
                                                width: 78,
                                                height: 52,
                                                borderRadius: 8,
                                                overflow: 'hidden',
                                                border: '1px solid rgba(2,132,199,0.14)',
                                                background: 'rgba(2,132,199,0.05)',
                                                position: 'relative',
                                                flex: '0 0 auto',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'var(--muted)',
                                                fontSize: 11
                                            }}>
                                                <span>{t.noCover}</span>
                                                <img
                                                    src={`/api/history/${item.id}/cover`}
                                                    alt={parsedTitle}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        position: 'absolute',
                                                        inset: 0
                                                    }}
                                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: 'var(--text)' }}>{parsedTitle}</div>
                                                <div className="muted tiny">{new Date(item.createdAt).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
