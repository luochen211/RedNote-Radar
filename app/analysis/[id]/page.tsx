'use client';

import { useState, useEffect, useRef } from "react";
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
        "M_Oriental_Culture": "Refers to the degree of similarity between the content of hotel videos and Oriental cultural styles",
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
        tabOriental: "Oriental Aesthetics Score",
        headerBalance: "Aesthetics Balance",
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
        lblOriental: "Oriental",
        lblWestern: "Western",
        lblControlModern: "Control_Modern_Norm",
        localTitle: "Engagement score prediction (Local scope)",
        localDesc: "Based on the like count range from Hotel Icon's own historical data, this refers to the prediction of the probability that the video content will achieve a high level of engagement relative to its Hotel Icon's performance history.",
        localLabel: "Local scope:",
        globalTitle: "Engagement score prediction (Global scope)",
        globalDesc: "Based on the range of likes from all official hotel accounts on the Xiaohongshu platform within the dataset, this refers to the prediction of the the probability that the video content will reach industry-leading engagement levels.",
        globalLabel: "Global scope:",
    },
    zh: {
        loading: "正在加载分析结果...",
        tabQuality: "内容质量评分",
        tabSentiment: "内容情感评分",
        tabConsistency: "内容一致性评分",
        tabOriental: "东方美学评分",
        headerBalance: "美学平衡",
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
        localTitle: "互动指数预测（本号范围）",
        localDesc: "基于唯港荟现有历史数据的点赞数范围，指该视频内容相对于唯港荟历史表现，能够获得高互动的概率预测。",
        localLabel: "本号范围：",
        globalTitle: "互动指数预测（全网范围）",
        globalDesc: "基于数据集内全网小红书酒店官方账号的点赞数范围，指该视频内容能够达到行业头部互动水平的概率预测。",
        globalLabel: "全网范围：",
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
                    stroke="rgba(255,255,255,0.1)"
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
                <div style={{ fontSize: size * 0.22, fontWeight: 700, color: '#fff' }}>{value}%</div>
            </div>
        </div>
    );
};

const LinearProgress = ({ value, color = "#6ae3ff" }: { value: number, color?: string }) => {
    return (
        <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden', marginTop: 12 }}>
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
                    <circle key={i} cx={p.x} cy={p.y} r="4" fill="#fff" />
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
                            color: '#98a7c3',
                            fontSize: 12,
                            textAlign: 'center',
                            width: 100
                        }}
                    >
                        {data[i].label}
                        <br />
                        <span style={{ color: '#fff', fontWeight: 600 }}>{data[i].value}</span>
                    </div>
                );
            })}
        </div>
    );
};

// Cyberpunk Gauge Component
const CyberGauge = ({ value, label, size = 200 }: { value: number, label: string, size?: number }) => {
    const radius = size * 0.4;
    const cx = size / 2;
    const cy = size / 2;

    // 240 degree gauge
    const startAngle = 135;
    const endAngle = 405;
    const totalAngle = endAngle - startAngle;

    // Value to angle
    const angle = startAngle + (value / 100) * totalAngle;

    // Helper to get coordinates
    const getCoords = (a: number, r: number) => {
        const rad = (a * Math.PI) / 180;
        return {
            x: cx + r * Math.cos(rad),
            y: cy + r * Math.sin(rad)
        };
    };

    // Ticks
    const ticks = [];
    for (let i = 0; i <= 40; i++) {
        const tickVal = (i / 40) * 100;
        const tickAngle = startAngle + (i / 40) * totalAngle;
        const isMajor = i % 4 === 0;
        const innerR = isMajor ? radius - 15 : radius - 8;
        const outerR = radius;
        const p1 = getCoords(tickAngle, innerR);
        const p2 = getCoords(tickAngle, outerR);

        ticks.push(
            <line
                key={i}
                x1={p1.x} y1={p1.y}
                x2={p2.x} y2={p2.y}
                stroke={isMajor ? "rgba(106, 227, 255, 0.6)" : "rgba(106, 227, 255, 0.2)"}
                strokeWidth={isMajor ? 2 : 1}
            />
        );
    }

    // Gradient Arc (Need path command)
    const describeArc = (x: number, y: number, r: number, start: number, end: number) => {
        // SVG angles: 0 is right (3 o'clock)
        const startP = getCoords(end, r);
        const endP = getCoords(start, r);

        const largeArc = end - start <= 180 ? "0" : "1";

        return [
            "M", startP.x, startP.y,
            "A", r, r, 0, largeArc, 0, endP.x, endP.y
        ].join(" ");
    };

    const needleTip = getCoords(angle, radius - 20);

    return (
        <div style={{ position: 'relative', width: size, height: size }}>
            <svg width={size} height={size}>
                {/* Glow Filter */}
                <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6ae3ff" />
                        <stop offset="100%" stopColor="#7c8bff" />
                    </linearGradient>
                </defs>

                {/* Ticks */}
                {ticks}

                {/* Background Arc */}
                <path
                    d={describeArc(cx, cy, radius - 25, startAngle, endAngle)}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="4"
                    strokeLinecap="round"
                />

                {/* Foregound active Arc */}
                <path
                    d={describeArc(cx, cy, radius - 25, startAngle, angle)}
                    fill="none"
                    stroke="url(#grad)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    filter="url(#glow)"
                    style={{ transition: 'd 1s ease-out' }}
                />

                {/* Needle */}
                <circle cx={cx} cy={cy} r="6" fill="#6ae3ff" />
                <line
                    x1={cx} y1={cy}
                    x2={needleTip.x} y2={needleTip.y}
                    stroke="#6ae3ff"
                    strokeWidth="3"
                    strokeLinecap="round"
                    filter="url(#glow)"
                    style={{ transition: 'all 1s ease-out' }}
                />
            </svg>

            {/* Value Text */}
            <div style={{
                position: 'absolute',
                top: '60%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                zIndex: 10
            }}>
                <div className="tech-value" style={{ fontSize: size * 0.2 }}>{value}</div>
                <div className="tech-label" style={{ fontSize: size * 0.06 }}>{label}</div>
            </div>
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
    const [data, setData] = useState<any>(null); // Analysis data
    const [scores, setScores] = useState<any>(null); // Prediction scores
    const router = useRouter();

    // Helper for gauge rotation
    const getRotation = (val: number) => {
        const clamped = Math.max(0, Math.min(100, val));
        return (clamped / 100) * 180;
    };

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
                        setData(result.analysis);
                        setScores(result.engagementScore);
                        setLoading(false);
                    } else if (json.status === 'PROCESSING' || json.status === 'PENDING') {
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


    // Enhanced Metric Card (Tech HUD Style)
    const MetricCard = ({ label, value, type = "score", maxValue = 100 }: { label: string, value: string | number | boolean, type?: "score" | "binary" | "percent", maxValue?: number }) => {
        const isPercent = typeof value === 'string' && value.includes('%');
        let numValue = 0;

        if (isPercent) {
            numValue = parseInt(value as string);
        } else if (typeof value === 'number') {
            numValue = value;
            // If value is small float (0-1), map to 0-100 for grading
            if (numValue <= 1 && numValue >= -1) numValue = numValue * 100;
        }

        // Calculate Grade
        let grade = '';
        let gradeColor = '#6ae3ff'; // Default Cyan
        if (type === 'score' || type === 'percent') {
            const score = Math.abs(numValue); // Handle negative sentiment too for magnitude
            if (score >= 90) { grade = 'S'; gradeColor = '#facc15'; } // Gold
            else if (score >= 80) { grade = 'A'; gradeColor = '#a855f7'; } // Purple
            else if (score >= 60) { grade = 'B'; gradeColor = '#6ae3ff'; } // Cyan
            else { grade = 'C'; gradeColor = '#98a7c3'; } // Grey
        }

        // Binary Display
        if (type === 'binary') {
            const isActive = value === 1 || value === true || value === '1' || value === 'true';
            return (
                <div
                    className="tech-card"
                    onMouseEnter={() => setHoveredMetric(label)}
                    onMouseLeave={() => setHoveredMetric(null)}
                    onMouseMove={handleMouseMove}
                    style={{ cursor: 'help', minHeight: 180 }}
                >
                    <div className="hud-corner top-left"></div>
                    <div className="hud-corner top-right"></div>
                    <div className="hud-corner bottom-left"></div>
                    <div className="hud-corner bottom-right"></div>

                    <div className="tech-label">{label}</div>

                    <div style={{
                        fontSize: 24,
                        color: isActive ? '#6ae3ff' : '#98a7c3',
                        fontWeight: 700,
                        border: `1px solid ${isActive ? 'rgba(106,227,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
                        padding: '8px 24px',
                        borderRadius: 4,
                        background: isActive ? 'rgba(106,227,255,0.1)' : 'transparent',
                        textShadow: isActive ? '0 0 10px rgba(106,227,255,0.5)' : 'none'
                    }}>
                        {isActive ? 'DETECTED' : 'NONE'}
                    </div>
                </div>
            )
        }

        return (
            <div
                className="tech-card"
                onMouseEnter={() => setHoveredMetric(label)}
                onMouseLeave={() => setHoveredMetric(null)}
                onMouseMove={handleMouseMove}
                style={{ cursor: 'help', minHeight: 180 }}
            >
                <div className="hud-corner top-left"></div>
                <div className="hud-corner top-right"></div>
                <div className="hud-corner bottom-left"></div>
                <div className="hud-corner bottom-right"></div>

                <div style={{ position: 'absolute', top: 16, right: 16 }}>
                    <div style={{
                        color: gradeColor,
                        fontWeight: 800,
                        fontSize: 16,
                        border: `1px solid ${gradeColor}`,
                        padding: '2px 8px',
                        borderRadius: 4,
                        opacity: 0.8
                    }}>
                        {grade}
                    </div>
                </div>

                <div className="tech-label">{label}</div>

                {isPercent ? (
                    <CircularProgress value={numValue} label={label} size={100} color={gradeColor} />
                ) : (
                    <div className="tech-value" style={{ color: gradeColor, textShadow: `0 0 15px ${gradeColor}66` }}>
                        {value}
                    </div>
                )}
            </div>
        );
    };

    // Bar Metric Card (Segmented Equalizer Style)
    const BarMetricCard = ({ label, value }: { label: string, value: string }) => {
        const numValue = parseInt(value);
        // Create 20 segments
        const segments = Array.from({ length: 20 }, (_, i) => i);
        const activeCount = Math.round((numValue / 100) * 20);

        return (
            <div
                className="tech-card"
                onMouseEnter={() => setHoveredMetric(label)}
                onMouseLeave={() => setHoveredMetric(null)}
                onMouseMove={handleMouseMove}
                style={{ cursor: 'help', alignItems: 'stretch', padding: '24px', minWidth: 300 }}
            >
                <div className="hud-corner top-left"></div>
                <div className="hud-corner top-right"></div>
                <div className="hud-corner bottom-left"></div>
                <div className="hud-corner bottom-right"></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div className="tech-label" style={{ marginBottom: 0, textAlign: 'left' }}>{label}</div>
                    <div className="tech-value" style={{ fontSize: 20 }}>{value}</div>
                </div>

                <div className="segment-bar">
                    {segments.map(i => (
                        <div
                            key={i}
                            className={`segment ${i < activeCount ? 'active' : ''} ${i < activeCount && i > 15 ? 'high' : ''}`}
                        />
                    ))}
                </div>
            </div>
        );
    };

    if (loading || !data) {
        return (
            <div className="page" style={{ position: 'relative' }}>

                <div className="loader" style={{ textAlign: 'center', padding: '100px 0' }}>
                    <div className="spinner" style={{ margin: '0 auto' }}></div>
                    <p className="muted" style={{ marginTop: 24, color: '#e8f0ff' }}>{t.loading}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="page" style={{ position: 'relative' }}>


            {/* Custom Chat-Style Floating Tooltip */}
            {hoveredMetric && (
                <div
                    style={{
                        position: 'fixed',
                        top: mousePos.y + 20,
                        left: mousePos.x + 20,
                        maxWidth: 300,
                        background: 'rgba(11, 18, 32, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(106, 227, 255, 0.3)',
                        borderRadius: '4px 12px 12px 12px',
                        padding: '16px',
                        zIndex: 9999,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                        pointerEvents: 'none',
                        animation: 'fadeIn 0.2s ease-out'
                    }}
                >
                    <div style={{ color: '#6ae3ff', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                        {hoveredMetric}
                    </div>
                    <div style={{ color: '#e8f0ff', fontSize: 14, lineHeight: 1.5 }}>
                        {tooltips[hoveredMetric as keyof typeof tooltips]}
                    </div>
                </div>
            )}

            {/* Prediction Scores Section */}
            {scores && (
                <section className="score-section fade-up" style={{ marginTop: 24, padding: '0 20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        {/* Local Scope */}
                        <div className="tech-card" style={{ flexDirection: 'row', gap: 32, padding: 40 }}>
                            <div className="hud-corner top-left"></div>
                            <div className="hud-corner top-right"></div>
                            <div className="hud-corner bottom-left"></div>
                            <div className="hud-corner bottom-right"></div>

                            <CyberGauge value={scores.local || 0} label="Local Score" size={240} />

                            <div style={{ flex: 1 }}>
                                <h3 style={{ marginTop: 0, marginBottom: 16, color: '#e8f0ff', fontSize: 24 }}>{t.localTitle}</h3>
                                <p className="muted" style={{ lineHeight: 1.6 }}>
                                    <strong style={{ color: '#6ae3ff' }}>{t.localLabel}</strong> {t.localDesc}
                                </p>
                            </div>
                        </div>

                        {/* Global Scope */}
                        <div className="tech-card" style={{ flexDirection: 'row', gap: 32, padding: 40 }}>
                            <div className="hud-corner top-left"></div>
                            <div className="hud-corner top-right"></div>
                            <div className="hud-corner bottom-left"></div>
                            <div className="hud-corner bottom-right"></div>

                            <CyberGauge value={scores.global || 0} label="Global Score" size={240} />

                            <div style={{ flex: 1 }}>
                                <h3 style={{ marginTop: 0, marginBottom: 16, color: '#e8f0ff', fontSize: 24 }}>{t.globalTitle}</h3>
                                <p className="muted" style={{ lineHeight: 1.6 }}>
                                    <strong style={{ color: '#6ae3ff' }}>{t.globalLabel}</strong> {t.globalDesc}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <div className="tabs" style={{ display: 'flex', gap: 10, marginTop: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className={`ghost-button ${activeTab === 'quality' ? 'active' : ''}`} onClick={() => setActiveTab('quality')}>{t.tabQuality}</button>
                <button className={`ghost-button ${activeTab === 'sentiment' ? 'active' : ''}`} onClick={() => setActiveTab('sentiment')}>{t.tabSentiment}</button>
                <button className={`ghost-button ${activeTab === 'consistency' ? 'active' : ''}`} onClick={() => setActiveTab('consistency')}>{t.tabConsistency}</button>
                <button className={`ghost-button ${activeTab === 'oriental' ? 'active' : ''}`} onClick={() => setActiveTab('oriental')}>{t.tabOriental}</button>
            </div>

            <section className="analysis-section glass fade-up delay-1" style={{ padding: 40, marginTop: 24, minHeight: 500 }}>

                {activeTab === 'quality' && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
                        <div style={{ flex: '1 1 220px', maxWidth: 300 }}><MetricCard label={t.lblVideoAes} value={data.quality.aesthetic} /></div>
                        <div style={{ flex: '1 1 220px', maxWidth: 300 }}><MetricCard label={t.lblReadability} value={data.quality.readability} /></div>
                        <div style={{ flex: '1 1 220px', maxWidth: 300 }}><MetricCard label={t.lblCoverQuality} value={data.quality.coverQuality} /></div>
                        <div style={{ flex: '1 1 220px', maxWidth: 300 }}><MetricCard label={t.lblCoverAes} value={data.quality.coverAesthetic} /></div>
                        <div style={{ flex: '1 1 220px', maxWidth: 300 }}><MetricCard label={t.lblVoice} value={data.quality.voice} type="binary" /></div>
                        <div style={{ flex: '1 1 220px', maxWidth: 300 }}><MetricCard label={t.lblFace} value={data.quality.face} type="binary" /></div>
                    </div>
                )}

                {activeTab === 'sentiment' && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
                        <div style={{ flex: '1 1 220px', maxWidth: 300 }}><MetricCard label={t.lblTitleSent} value={data.sentiment.title} /></div>
                        <div style={{ flex: '1 1 220px', maxWidth: 300 }}><MetricCard label={t.lblTextSent} value={data.sentiment.text} /></div>
                        <div style={{ flex: '1 1 220px', maxWidth: 300 }}><MetricCard label={t.lblTextArousal} value={data.sentiment.textArousal} /></div>
                        <div style={{ flex: '1 1 220px', maxWidth: 300 }}><MetricCard label={t.lblAudioSent} value={data.sentiment.audio} /></div>
                        <div style={{ flex: '1 1 220px', maxWidth: 300 }}><MetricCard label={t.lblAudioArousal} value={data.sentiment.audioArousal} /></div>
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
                            <h3 style={{ color: '#e8f0ff', marginBottom: 20 }}>{t.headerBalance}</h3>
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
                            <h3 style={{ color: '#e8f0ff', marginBottom: 20 }}>{t.headerStyle}</h3>
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
