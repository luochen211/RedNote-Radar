'use client';

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { useLanguage } from "../../context/LanguageContext";

const copy = {
    en: {
        loading: "Data processing and prediction in progress, please wait...",
        errorFetch: "Error fetching task",
        errorNotFound: "Task not found",
        errorFailed: "Prediction failed",
        localTitle: "Engagement score prediction (Local scope)",
        localDesc: "Based on Hotel ICON's historical data, used to evaluate the expected engagement of the uploaded post.",
        localLabel: "Local scope:",
        globalTitle: "Engagement score prediction (Global scope)",
        globalDesc: "Based on luxury-hotel data from social media platforms, used to evaluate the expected engagement of the uploaded post.",
        globalLabel: "Global scope:",
    },
    zh: {
        loading: "数据处理与预测进行中，请稍候...",
        errorFetch: "获取任务失败",
        errorNotFound: "任务未找到",
        errorFailed: "预测失败",
        localTitle: "互动指数预测（本号范围）",
        localDesc: "基于 Hotel ICON 历史数据，用于评估上传帖子的预期参与度。",
        localLabel: "本地范围：",
        globalTitle: "互动指数预测（全网范围）",
        globalDesc: "基于社交媒体平台所有高端酒店数据，用于评估上传帖子的预期参与度。",
        globalLabel: "全局范围：",
    }
};

export default function PredictionPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { lang } = useLanguage();
    const t = copy[lang];
    const [loading, setLoading] = useState(true);
    const [localScore, setLocalScore] = useState(0);
    const [globalScore, setGlobalScore] = useState(0);
    const [error, setError] = useState('');
    const [submissionInput, setSubmissionInput] = useState<any>(null);
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
                    const result = JSON.parse(data.resultData);
                    const input = data.inputData ? JSON.parse(data.inputData) : null;
                    // result.engagementScore.local / global

                    // Clear interval if completed
                    if (intervalRef.current) clearInterval(intervalRef.current);

                    setLoading(false);
                    setSubmissionInput(input);
                    // Animate scores
                    requestAnimationFrame(() => {
                        setLocalScore(result.engagementScore?.local || 0);
                        setGlobalScore(result.engagementScore?.global || 0);
                    });
                } else if (data.status === 'FAILED') {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    setError(t.errorFailed);
                    setLoading(false);
                }
                // If PENDING/PROCESSING, keep loading
            } catch (e) {
                console.error(e);
            }
        };

        // Initial fetch
        fetchStatus();

        // Poll every 2 seconds
        intervalRef.current = setInterval(fetchStatus, 2000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [params.id, t]);

    useEffect(() => {
        if (!loading && !error) {
            router.replace(`/analysis/${params.id}`);
        }
    }, [error, loading, params.id, router]);

    // Helper to calculate rotation
    // Score 0-100? Docs say "prediction of probability". 
    // Requirement 4.73: 0-100.
    // Gauge: 0 is left, 100 is right? Or 180 degrees?
    // Start angle?
    // Let's assume standard semi-circle gauge 0-180 deg.
    // 0 score -> 0 deg. 100 score -> 180 deg.
    const getRotation = (val: number) => {
        // Clamp 0-100
        const clamped = Math.max(0, Math.min(100, val));
        return (clamped / 100) * 180;
    };

    return (
        <div className="page workspace-page workspace-soft">
            <Navbar />

            <section className="prediction-section fade-up delay-1 workspace-section" style={{ marginTop: 32 }}>
                {error ? (
                    <div className="loader" style={{ textAlign: 'center', padding: '100px 0', color: '#ff6b6b' }}>
                        <h3>{error}</h3>
                    </div>
                ) : loading ? (
                    <div className="loader" style={{ textAlign: 'center', padding: '100px 0' }}>
                        <div className="spinner" style={{ margin: '0 auto' }}></div>
                        <p className="muted" style={{ marginTop: 24, fontSize: 18 }}>{t.loading}</p>
                    </div>
                ) : (
                    <div className="prediction-content">
                        {submissionInput && (
                            <div className="glass workspace-panel prediction-hero-card" style={{ marginBottom: 24, padding: 24, borderRadius: 16 }}>
                                <div className="muted tiny" style={{ marginBottom: 8 }}>
                                    {lang === 'en' ? 'Current upload' : '当前上传内容'}
                                </div>
                                <h3 style={{ marginTop: 0, marginBottom: 8, color: 'var(--text)' }}>
                                    {submissionInput.title || (lang === 'en' ? 'Untitled submission' : '未命名提交')}
                                </h3>
                                {submissionInput.textContent && (
                                    <p className="muted" style={{ marginTop: 0, lineHeight: 1.6 }}>
                                        {submissionInput.textContent.slice(0, 160)}
                                        {submissionInput.textContent.length > 160 ? '...' : ''}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="glass workspace-panel prediction-hero-card" style={{ marginBottom: 24, padding: 24, borderRadius: 16 }}>
                            <div className="muted tiny" style={{ marginBottom: 8 }}>
                                {lang === 'en' ? 'Redirecting' : '正在跳转'}
                            </div>
                            <h3 style={{ margin: 0, color: 'var(--text)' }}>
                                {lang === 'en' ? 'Opening merged analysis page...' : '正在进入统一分析详情页...'}
                            </h3>
                        </div>

                        {/* Local Scope */}
                        <div className="result-block glass workspace-panel prediction-result-card" style={{ marginBottom: 24, padding: 32, borderRadius: 16 }}>
                            <h3 style={{ marginTop: 0, marginBottom: 16, color: 'var(--text)' }}>{t.localTitle}</h3>
                            <div className="prediction-result-grid" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 32, alignItems: 'center' }}>
                                <div className="gauge-wrap" style={{ margin: 0 }}>
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
                                    <p className="muted" style={{ lineHeight: 1.6 }}>
                                        <strong style={{ color: 'var(--text)' }}>{t.localLabel}</strong> {t.localDesc}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Global Scope */}
                        <div className="result-block glass workspace-panel prediction-result-card" style={{ padding: 32, borderRadius: 16 }}>
                            <h3 style={{ marginTop: 0, marginBottom: 16, color: 'var(--text)' }}>{t.globalTitle}</h3>
                            <div className="prediction-result-grid" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 32, alignItems: 'center' }}>
                                <div className="gauge-wrap" style={{ margin: 0 }}>
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
                                    <p className="muted" style={{ lineHeight: 1.6 }}>
                                        <strong style={{ color: 'var(--text)' }}>{t.globalLabel}</strong> {t.globalDesc}
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
