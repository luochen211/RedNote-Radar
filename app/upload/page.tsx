'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useLanguage } from "../context/LanguageContext";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { FileUpload } from "@/components/ui/FileUpload";
import { TagInput } from "@/components/ui/TagInput";
import { Button } from "@/components/ui/Button";

const copy = {
    en: {
        alertTitle: "Please enter a title",
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
        btnSubmit: "Submit",
    },
    zh: {
        alertTitle: "请输入标题",
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
        btnSubmit: "提交",
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

    // File names for display
    const [videoName, setVideoName] = useState("");
    const [coverName, setCoverName] = useState("");

    const handleVideoSelect = (file: File) => {
        setVideoName(file.name);
    };

    const handleCoverSelect = (file: File) => {
        setCoverName(file.name);
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
                cover: coverName || "" // Empty cover implies default to video frame
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
            <section className="upload-section glass fade-up delay-1" style={{ padding: 32, marginTop: 32 }}>
                <div className="section-head" style={{ marginBottom: 32 }}>
                    <h3>{t.pageTitle}</h3>
                </div>

                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 32 }}>
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
                    <div className="stack full" style={{ gridColumn: '1 / -1' }}>
                        <Input
                            label={t.labelTitle}
                            placeholder={t.placeholderTitle}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* 4. Text Content */}
                    <div className="stack full" style={{ gridColumn: '1 / -1' }}>
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
                </div>

                <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center' }}>
                    <Button
                        onClick={handleSubmit}
                        isLoading={isProcessing}
                    >
                        {t.btnSubmit}
                    </Button>
                </div>
            </section>
        </div>
    );
}
