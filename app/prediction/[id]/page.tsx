'use client';

import { useEffect, useState, useRef } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { ensureResultCompatibility } from "@/lib/resultCompatibility";

const copy = {
    en: {
        loading: "Data processing and prediction in progress, please wait...",
        errorFetch: "Error fetching task",
        errorNotFound: "Task not found",
        errorFailed: "Prediction failed",
        localTitle: "Engagement score prediction (Local scope)",
        localDesc: "Based on the like count range from Hotel Icon's own historical data, this refers to the prediction of the probability that the video content will achieve a high level of engagement relative to its Hotel Icon's performance history.",
        localLabel: "Local scope:",
        globalTitle: "Engagement score prediction (Global scope)",
        globalDesc: "Based on the range of likes from official hotel accounts on social media platforms within the dataset, this refers to the prediction of the probability that the video content will reach industry-leading engagement levels.",
        globalLabel: "Global scope:",
    },
    zh: {
        loading: "数据处理与预测进行中，请稍候...",
        errorFetch: "获取任务失败",
        errorNotFound: "任务未找到",
        errorFailed: "预测失败",
        localTitle: "互动指数预测（本号范围）",
        localDesc: "基于唯港荟现有历史数据的点赞数范围，指该视频内容相对于唯港荟历史表现，能够获得高互动的概率预测。",
        localLabel: "本号范围：",
        globalTitle: "互动指数预测（全网范围）",
        globalDesc: "基于数据集中社交媒体平台酒店官方账号的点赞数范围，指该视频内容能够达到行业头部互动水平的概率预测。",
        globalLabel: "全网范围：",
    }
};

export default function PredictionPage({ params }: { params: { id: string } }) {
    const { lang } = useLanguage();
    const t = copy[lang];
    const [loading, setLoading] = useState(true);
    const [localScore, setLocalScore] = useState(0);
    const [globalScore, setGlobalScore] = useState(0);
    const [error, setError] = useState('');
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch(`/api/tasks/${params.id}`);
                if (!res.ok) {
                    if (res.status === 404) setError(t.errorNotFound);
                    else setError(t.errorFetch);
                    setLoading(false);
                    return;
                }

                const data = await res.json();

                if (data.status === 'COMPLETED' && data.resultData) {
                    const result = ensureResultCompatibility(JSON.parse(data.resultData));

                    if (intervalRef.current) clearInterval(intervalRef.current);

                    setLoading(false);
                    requestAnimationFrame(() => {
                        setLocalScore(result.engagementScore?.local || 0);
                        setGlobalScore(result.engagementScore?.global || 0);
                    });
                } else if (data.status === 'FAILED') {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    setError(t.errorFailed);
                    setLoading(false);
                }
            } catch (e) {
                console.error(e);
            }
        };

        fetchStatus();
        intervalRef.current = setInterval(fetchStatus, 4000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [params.id, t]);

    const getRotation = (val: number) => {
        // Clamp 0-100, Map to -90 to 90 degrees if semi-circle, or 0 to 180.
        // CSS transform rotate usually starts from 12 o'clock or 3 o'clock depending on setup.
        // Assuming the needle starts bottom center pointing UP (0deg), we want -90 (left) to 90 (right).
        // Let's adjust based on the CSS gauge implementation.
        // If 0 is left horizontal and 180 is right horizontal.
        const clamped = Math.max(0, Math.min(100, val));
        return (clamped / 100) * 180 - 90; // -90deg to 90deg
    };

    return (
        <div className="page app-page">
            <section className="prediction-section fade-up delay-1">
                {error ? (
                    <div className="prediction-loader error">
                        <h3>{error}</h3>
                    </div>
                ) : loading ? (
                    <div className="prediction-loader">
                        <div className="spinner"></div>
                        <p className="muted">{t.loading}</p>
                    </div>
                ) : (
                    <div className="prediction-content">
                        {/* Local Scope */}
                        <div className="result-block glass">
                            <h3 className="result-header">{t.localTitle}</h3>
                            <div className="result-grid">
                                <div className="gauge-wrap">
                                    <div className="gauge">
                                        <div className="gauge-arc"></div>
                                        <div
                                            className="gauge-needle"
                                            style={{ '--gauge-angle': `${getRotation(localScore)}deg` } as any}
                                        ></div>
                                        <div className="gauge-center">
                                            <div className="gauge-value">{localScore}</div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <p className="result-description">
                                        <strong>{t.localLabel}</strong> {t.localDesc}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Global Scope */}
                        <div className="result-block glass">
                            <h3 className="result-header">{t.globalTitle}</h3>
                            <div className="result-grid">
                                <div className="gauge-wrap">
                                    <div className="gauge">
                                        <div className="gauge-arc"></div>
                                        <div
                                            className="gauge-needle"
                                            style={{ '--gauge-angle': `${getRotation(globalScore)}deg` } as any}
                                        ></div>
                                        <div className="gauge-center">
                                            <div className="gauge-value">{globalScore}</div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <p className="result-description">
                                        <strong>{t.globalLabel}</strong> {t.globalDesc}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
