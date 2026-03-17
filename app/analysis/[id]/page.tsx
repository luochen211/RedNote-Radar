'use client';

import { useState, useEffect, useRef } from "react";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../context/LanguageContext";

const TOOLTIPS = {
    en: {
        "Video aesthetics score": "A indicator for measuring the aesthetic features of video, such as composition, color matching.",
        "Text readability": "An indicator for evaluating the ease with which the audience can understand and read the text content.",
        "Cover image quality score": "A indicator for evaluating cover image quality based on clarity, resolution, integrity and other dimensions.",
        "Cover image aesthetics score": "A indicator for measuring the visual aesthetic characteristics of cover images, such as composition and color coordination.",
        "Human voice presence": "A binary variable for determining whether human voice is included in the video audio.",
        "Human face presence": "A binary variable for determining whether human faces appear in the video frames.",
        "Title sentiment score": "An indicator for quantifying the emotional tendency (positive/negative) conveyed by the title text.",
        "Text sentiment score": "An indicator for quantifying the emotional tendency (positive/negative) conveyed by the main text.",
        "Text arousal score": "A indicator for measuring the degree of audience emotional activation triggered by text content.",
        "Audio sentiment score": "An indicator for quantifying the emotional tendency (positive/negative) conveyed by the audio content.",
        "Audio arousal score": "A indicator for measuring the degree of audience emotional activation triggered by audio content.",
        "Title-tags content consistency": "An indicator for measuring the consistency of content information between the title and tags.",
        "Title-cover image content consistency": "An indicator for measuring the consistency of content information between the title and cover image.",
        "Title-video content consistency": "An indicator for measuring the consistency of content information between the title and video content.",
        "Text-audio sentiment consistency": "A indicator for measuring the consistency of emotional tendencies conveyed by text and audio.",
        "Text-video sentiment consistency": "A indicator for measuring the consistency of emotional tendencies conveyed by text and video content.",
        "Video-audio sentiment consistency": "A indicator for measuring the consistency of emotional tendencies conveyed by video content and audio.",
        "Richness": "Color richness based on traditional Chinese five-color aesthetic theory; values closer to 0 align with Taoist simplicity, while those closer to 1 fit ritualistic completeness",
        "Harmony": "Color harmony based on traditional Chinese five-color aesthetic theory, measuring color conflict or coordination in hotel videos",
        "Adaption": "Color adaptability based on traditional Chinese five-color aesthetic theory, measuring color matching between hotel videos and geographical theoretical benchmarks",
        "Control_Modern_Norm": "Refers to the degree of similarity between the content of hotel videos and modern cultural norms.",
        "M_Oriental_Culture": "Refers to the degree of similarity between the content of hotel videos and Eastern cultural styles",
        "M_Western_Culture": "Refers to the degree of similarity between the content of hotel videos and Western cultural styles."
    },
    zh: {
        "视频美学评分": "衡量视频美学特征的指标，如构图、色彩搭配。",
        "文本可读性": "评估受众理解和阅读文本内容难易程度的指标。",
        "封面图像质量分": "基于清晰度、分辨率、完整性等维度评估封面图像质量的指标。",
        "封面美学评分": "衡量封面图像视觉美学特征的指标，如构图和色彩协调性。",
        "人声存在": "确定视频音频中是否包含人声的二元变量。",
        "人脸存在": "确定视频帧中是否出现人脸的二元变量。",
        "标题情感分": "量化标题文本传达的情感倾向（积极/消极）的指标。",
        "文本情感分": "量化正文文本传达的情感倾向（积极/消极）的指标。",
        "文本激活度": "衡量文本内容引发受众情绪激活程度的指标。",
        "音频情感分": "量化音频内容传达的情感倾向（积极/消极）的指标。",
        "音频激活度": "衡量音频内容引发受众情绪激活程度的指标。",
        "标题-标签内容一致性": "衡量标题与标签之间内容信息一致性的指标。",
        "标题-封面内容一致性": "衡量标题与封面图像之间内容信息一致性的指标。",
        "标题-视频内容一致性": "衡量标题与视频内容之间内容信息一致性的指标。",
        "文本-音频情感一致性": "衡量文本与音频传达的情感倾向一致性的指标。",
        "文本-视频情感一致性": "衡量文本与视频内容传达的情感倾向一致性的指标。",
        "视频-音频情感一致性": "衡量视频内容与音频传达的情感倾向一致性的指标。",
        "丰富度": "基于中国传统五色美学理论的色彩丰富度；数值接近0符合道家简约，接近1符合儒家礼仪完备。",
        "和谐度": "基于中国传统五色美学理论的色彩和谐度，衡量酒店视频中的色彩冲突或协调性。",
        "适配度": "基于中国传统五色美学理论的色彩适应性，衡量酒店视频与地理理论基准之间的色彩匹配度。",
        "现代规范控制": "指酒店视频内容与现代文化规范的相似程度。",
        "东方文化": "指酒店视频内容与东方文化风格的相似程度",
        "西方文化": "指酒店视频内容与西方文化风格的相似程度"
    }
};

const copy = {
    en: {
        loading: "Loading Analysis...",
        tabQuality: "Content quality scores",
        tabSentiment: "Content sentiment scores",
        tabConsistency: "Content consistency scores",
        tabOriental: "Eastern Aesthetics Score",
        headerBalance: "Eastern Aesthetics",
        headerStyle: "Cultural Style",
        norm: "Normalized (0-1)",
        lblVideoAes: "Video aesthetics score",
        lblReadability: "Text readability",
        lblCoverQuality: "Cover image quality score",
        lblCoverAes: "Cover image aesthetics score",
        lblVoice: "Human voice presence",
        lblFace: "Human face presence",
        lblTitleSent: "Title sentiment score",
        lblTextSent: "Text sentiment score",
        lblTextArousal: "Text arousal score",
        lblAudioSent: "Audio sentiment score",
        lblAudioArousal: "Audio arousal score",
        lblTitleTags: "Title-tags content consistency",
        lblTitleCover: "Title-cover image content consistency",
        lblTitleVideo: "Title-video content consistency",
        lblTextAudio: "Text-audio sentiment consistency",
        lblTextVideo: "Text-video sentiment consistency",
        lblVideoAudio: "Video-audio sentiment consistency",
        lblRichness: "Richness",
        lblHarmony: "Harmony",
        lblAdaption: "Adaption",
        lblModern: "Modern",
        lblOriental: "Eastern",
        lblWestern: "Western",
        lblControlModern: "Control_Modern_Norm",
    },
    zh: {
        loading: "正在加载分析结果...",
        tabQuality: "内容质量评分",
        tabSentiment: "内容情感评分",
        tabConsistency: "内容一致性评分",
        tabOriental: "东方美学评分",
        headerBalance: "东方美学",
        headerStyle: "文化风格",
        norm: "归一化 (0-1)",
        lblVideoAes: "视频美学评分",
        lblReadability: "文本可读性",
        lblCoverQuality: "封面图像质量分",
        lblCoverAes: "封面美学评分",
        lblVoice: "人声存在",
        lblFace: "人脸存在",
        lblTitleSent: "标题情感分",
        lblTextSent: "文本情感分",
        lblTextArousal: "文本激活度",
        lblAudioSent: "音频情感分",
        lblAudioArousal: "音频激活度",
        lblTitleTags: "标题-标签内容一致性",
        lblTitleCover: "标题-封面内容一致性",
        lblTitleVideo: "标题-视频内容一致性",
        lblTextAudio: "文本-音频情感一致性",
        lblTextVideo: "文本-视频情感一致性",
        lblVideoAudio: "视频-音频情感一致性",
        lblRichness: "丰富度",
        lblHarmony: "和谐度",
        lblAdaption: "适配度",
        lblModern: "现代",
        lblOriental: "东方",
        lblWestern: "西方",
        lblControlModern: "现代规范控制",
    }
};

// --- SVG Components ---

const CircularProgress = ({ value, label, size = 120, color = "#6ae3ff" }: { value: number, label: string, size?: number, color?: string }) => {
    const radius = size * 0.4;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                {/* Track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="8"
                    fill="transparent"
                />
                {/* Progress */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: size * 0.22, fontWeight: 700, color: 'var(--text)' }}>{value}%</div>
            </div>
        </div>
    );
};

const LinearProgress = ({ value, color = "#6ae3ff" }: { value: number, color?: string }) => {
    return (
        <div style={{ width: '100%', height: 8, background: 'rgba(15,23,42,0.08)', borderRadius: 4, overflow: 'hidden', marginTop: 12 }}>
            <div
                style={{
                    width: `${value}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${color}, #7c8bff)`,
                    borderRadius: 4,
                    transition: 'width 1s ease-out'
                }}
            />
        </div>
    );
};

const RadarChartTriangle = ({ data, color = "#6ae3ff" }: { data: { label: string, value: number, max: number }[], color?: string }) => {
    const size = 300;
    const center = size / 2;
    const radius = size * 0.35;
    const angles = [-90, 30, 150];

    const getPoint = (value: number, max: number, angleDeg: number) => {
        const r = (value / max) * radius;
        const angleRad = (angleDeg * Math.PI) / 180;
        return {
            x: center + r * Math.cos(angleRad),
            y: center + r * Math.sin(angleRad)
        };
    };

    const getAxisPoint = (angleDeg: number) => {
        const angleRad = (angleDeg * Math.PI) / 180;
        return {
            x: center + radius * Math.cos(angleRad),
            y: center + radius * Math.sin(angleRad)
        };
    };

    const gridPoints = [0.25, 0.5, 0.75, 1].map(scale =>
        angles.map(a => getPoint(scale * 10, 10, a))
    );

    const dataPoints = data.map((d, i) => getPoint(d.value, d.max, angles[i]));
    const polyString = dataPoints.map(p => `${p.x},${p.y}`).join(" ");

    return (
        <div style={{ position: 'relative', width: size, height: size }}>
            <svg width={size} height={size}>
                {angles.map((a, i) => {
                    const p = getAxisPoint(a);
                    return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />;
                })}
                {gridPoints.map((triangle, i) => (
                    <polygon
                        key={i}
                        points={triangle.map(p => `${p.x},${p.y}`).join(" ")}
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                    />
                ))}
                <polygon
                    points={polyString}
                    fill={color}
                    fillOpacity="0.2"
                    stroke={color}
                    strokeWidth="2"
                />
                {dataPoints.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="4" fill="#edf4ff" />
                ))}
            </svg>
            {angles.map((a, i) => {
                const p = getAxisPoint(a);
                const xOff = i === 0 ? 0 : (i === 1 ? 20 : -20);
                const yOff = i === 0 ? -20 : 10;
                return (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            left: p.x + xOff,
                            top: p.y + yOff,
                            transform: 'translate(-50%, -50%)',
                            color: 'var(--muted)',
                            fontSize: 12,
                            textAlign: 'center',
                            width: 100
                        }}
                    >
                        {data[i].label}
                        <br />
                        <span style={{ color: 'var(--text)', fontWeight: 600 }}>{data[i].value}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default function AnalysisPage({ params }: { params: { id: string } }) {
    const { lang } = useLanguage();
    const t = copy[lang];
    const tooltips = TOOLTIPS[lang];

    const [activeTab, setActiveTab] = useState<"quality" | "sentiment" | "consistency" | "oriental">("quality");
    const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null); // To store valid structure
    const [submissionInput, setSubmissionInput] = useState<any>(null);
    const [resultSource, setResultSource] = useState<string>("");
    const router = useRouter();

    const handleMouseMove = (e: React.MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/tasks/${params.id}`);
                if (res.ok) {
                    const json = await res.json();
                    if (json.status === 'COMPLETED' && json.resultData) {
                        const result = JSON.parse(json.resultData);
                        const input = json.inputData ? JSON.parse(json.inputData) : null;
                        setData(result.analysis);
                        setSubmissionInput(input);
                        setResultSource(result.source || "");
                        setLoading(false);
                    } else if (json.status === 'PROCESSING' || json.status === 'PENDING') {
                        // Redirect back to prediction if not ready?? Or show loading?
                        // Better to just tell user it's processing
                        // For now, let's just wait a bit or auto-refresh?
                        // The user usually comes here FROM prediction page which confirms completion.
                        // But if refreshed, might need to re-poll?
                        // Let's assume completed for simplicity or simple polling
                    }
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchData();
    }, [params.id]);


    // Enhanced Metric Card
    const MetricCard = ({ label, value, type = "score", maxValue = 100 }: { label: string, value: string | number, type?: "score" | "binary" | "percent", maxValue?: number }) => {
        const isPercent = typeof value === 'string' && value.includes('%');
        const numValue = isPercent ? parseInt(value as string) : (typeof value === 'number' ? value : 0);

        return (
            <div
                className="metric-card glass-card"
                onMouseEnter={() => setHoveredMetric(label)}
                onMouseLeave={() => setHoveredMetric(null)}
                onMouseMove={handleMouseMove}
                style={{
                    background: 'var(--panel-strong)',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 160,
                    position: 'relative',
                    cursor: 'help',
                    transition: 'all 0.3s ease'
                }}
            >
                <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--muted)', textAlign: 'center', minHeight: 40, display: 'flex', alignItems: 'center' }}>
                    {label}
                </div>

                {isPercent ? (
                    <CircularProgress value={numValue} label={label} />
                ) : (
                    <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)' }}>
                        {value}
                    </div>
                )}
            </div>
        );
    };

    // Bar Metric Card
    const BarMetricCard = ({ label, value }: { label: string, value: string }) => {
        const numValue = parseInt(value);
        return (
            <div
                className="metric-card glass-card"
                onMouseEnter={() => setHoveredMetric(label)}
                onMouseLeave={() => setHoveredMetric(null)}
                onMouseMove={handleMouseMove}
                style={{
                    background: 'var(--panel-strong)',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                    padding: 24,
                    minHeight: 100,
                    position: 'relative',
                    cursor: 'help',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: 13, color: 'var(--muted)', maxWidth: '80%' }}>{label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{value}</div>
                </div>
                <LinearProgress value={numValue} />
            </div>
        );
    };

    if (loading || !data) {
        return (
            <div className="page workspace-page workspace-soft" style={{ position: 'relative' }}>
                <Navbar />
                <div className="loader" style={{ textAlign: 'center', padding: '100px 0' }}>
                    <div className="spinner" style={{ margin: '0 auto' }}></div>
                    <p className="muted" style={{ marginTop: 24, color: 'var(--text)' }}>{t.loading}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="page workspace-page workspace-soft" style={{ position: 'relative' }}>
            <Navbar />

            {/* Custom Chat-Style Floating Tooltip */}
            {hoveredMetric && (
                <div
                    style={{
                        position: 'fixed',
                        top: mousePos.y + 20,
                        left: mousePos.x + 20,
                        maxWidth: 300,
                        background: 'rgba(27, 39, 67, 0.96)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(15,23,42,0.12)',
                        borderRadius: '4px 12px 12px 12px',
                        padding: '16px',
                        zIndex: 9999,
                        boxShadow: '0 12px 32px rgba(15,23,42,0.12)',
                        pointerEvents: 'none',
                        animation: 'fadeIn 0.2s ease-out'
                    }}
                >
                    <div style={{ color: 'var(--text)', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                        {hoveredMetric}
                    </div>
                    <div style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.5 }}>
                        {tooltips[hoveredMetric as keyof typeof tooltips]}
                    </div>
                </div>
            )}

            <div className="tabs" style={{ display: 'flex', gap: 10, marginTop: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className={`ghost-button ${activeTab === 'quality' ? 'active' : ''}`} onClick={() => setActiveTab('quality')}>{t.tabQuality}</button>
                <button className={`ghost-button ${activeTab === 'sentiment' ? 'active' : ''}`} onClick={() => setActiveTab('sentiment')}>{t.tabSentiment}</button>
                <button className={`ghost-button ${activeTab === 'consistency' ? 'active' : ''}`} onClick={() => setActiveTab('consistency')}>{t.tabConsistency}</button>
                <button className={`ghost-button ${activeTab === 'oriental' ? 'active' : ''}`} onClick={() => setActiveTab('oriental')}>{t.tabOriental}</button>
            </div>

            {submissionInput && (
                <section
                    className="glass fade-up workspace-panel"
                    style={{
                        marginTop: 20,
                        padding: 24,
                        display: 'grid',
                        gridTemplateColumns: submissionInput.coverPath ? '120px 1fr' : '1fr',
                        gap: 20,
                        alignItems: 'center'
                    }}
                >
                    {submissionInput.coverPath && (
                        <img
                            src={submissionInput.coverPath}
                            alt={submissionInput.title || 'cover'}
                            style={{
                                width: 120,
                                height: 160,
                                objectFit: 'cover',
                                borderRadius: 12,
                                border: '1px solid rgba(15,23,42,0.08)'
                            }}
                        />
                    )}
                    <div>
                        <div className="muted tiny" style={{ marginBottom: 8 }}>
                            {resultSource === 'actual-upload' ? 'Actual upload analysis' : 'Analysis result'}
                        </div>
                        <h3 style={{ marginTop: 0, marginBottom: 8, color: 'var(--text)' }}>
                            {submissionInput.title || (lang === 'en' ? 'Untitled submission' : '未命名提交')}
                        </h3>
                        {submissionInput.textContent && (
                            <p className="muted" style={{ marginTop: 0, lineHeight: 1.6 }}>
                                {submissionInput.textContent.slice(0, 180)}
                                {submissionInput.textContent.length > 180 ? '...' : ''}
                            </p>
                        )}
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                            {(submissionInput.tags || []).map((tag: string) => (
                                <span
                                    key={tag}
                                    style={{
                                        padding: '6px 10px',
                                        borderRadius: 999,
                                        background: 'rgba(122, 166, 255, 0.12)',
                                        border: '1px solid rgba(140, 198, 255, 0.18)',
                                        color: 'var(--text)',
                                        fontSize: 12
                                    }}
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                        <div className="muted tiny" style={{ marginTop: 12 }}>
                            {submissionInput.videoName ? `Video: ${submissionInput.videoName}` : ''}
                        </div>
                    </div>
                </section>
            )}

            <section className="analysis-section glass fade-up delay-1 workspace-panel" style={{ padding: 40, marginTop: 24, minHeight: 500 }}>

                {activeTab === 'quality' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
                        <MetricCard label={t.lblVideoAes} value={data.quality.aesthetic} />
                        <MetricCard label={t.lblReadability} value={data.quality.readability} />
                        <MetricCard label={t.lblCoverQuality} value={data.quality.coverQuality} />
                        <MetricCard label={t.lblCoverAes} value={data.quality.coverAesthetic} />
                        <MetricCard label={t.lblVoice} value={data.quality.voice} type="binary" />
                        <MetricCard label={t.lblFace} value={data.quality.face} type="binary" />
                    </div>
                )}

                {activeTab === 'sentiment' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
                        <MetricCard label={t.lblTitleSent} value={data.sentiment.title} />
                        <MetricCard label={t.lblTextSent} value={data.sentiment.text} />
                        <MetricCard label={t.lblTextArousal} value={data.sentiment.textArousal} />
                        <MetricCard label={t.lblAudioSent} value={data.sentiment.audio} />
                        <MetricCard label={t.lblAudioArousal} value={data.sentiment.audioArousal} />
                    </div>
                )}

                {activeTab === 'consistency' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24 }}>
                        <BarMetricCard label={t.lblTitleTags} value={data.consistency.titleTags} />
                        <BarMetricCard label={t.lblTitleCover} value={data.consistency.titleCover} />
                        <BarMetricCard label={t.lblTitleVideo} value={data.consistency.titleVideo} />
                        <BarMetricCard label={t.lblTextAudio} value={data.consistency.textAudio} />
                        <BarMetricCard label={t.lblTextVideo} value={data.consistency.textVideo} />
                        <BarMetricCard label={t.lblVideoAudio} value={data.consistency.videoAudio} />
                    </div>
                )}

                {activeTab === 'oriental' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
                        {/* Radar 1 */}
                        <div className="radar-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                            onMouseEnter={() => setHoveredMetric(t.lblRichness)}
                            onMouseLeave={() => setHoveredMetric(null)}
                            onMouseMove={handleMouseMove}
                        >
                            <h3 style={{ color: 'var(--text)', marginBottom: 20 }}>{t.headerBalance}</h3>
                            <RadarChartTriangle
                                data={[
                                    { label: t.lblRichness, value: data.orientalAesthetics.richness, max: 1 },
                                    { label: t.lblHarmony, value: data.orientalAesthetics.harmony, max: 1 },
                                    { label: t.lblAdaption, value: data.orientalAesthetics.adaption, max: 1 }
                                ]}
                                color="#6ae3ff"
                            />
                            <div className="muted tiny" style={{ marginTop: 10 }}>{t.norm}</div>
                        </div>

                        {/* Radar 2 */}
                        <div className="radar-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                            onMouseEnter={() => setHoveredMetric(t.lblControlModern)}
                            onMouseLeave={() => setHoveredMetric(null)}
                            onMouseMove={handleMouseMove}
                        >
                            <h3 style={{ color: 'var(--text)', marginBottom: 20 }}>{t.headerStyle}</h3>
                            <RadarChartTriangle
                                data={[
                                    { label: t.lblModern, value: data.orientalAesthetics.modern, max: 1 },
                                    { label: t.lblOriental, value: data.orientalAesthetics.oriental, max: 1 },
                                    { label: t.lblWestern, value: data.orientalAesthetics.western, max: 1 }
                                ]}
                                color="#facc15"
                            />
                            <div className="muted tiny" style={{ marginTop: 10 }}>{t.norm}</div>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
