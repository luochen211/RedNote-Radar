'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";

interface Submission {
    id: string;
    status: string;
    createdAt: string;
    inputData: string; // JSON string
    resultData: string | null;
}

const copy = {
    en: {
        pageTitle: "Submission History",
        loading: "Loading...",
        noHistory: "No history found.",
        untitled: "Untitled",
        noCover: "No cover",
        keyScoresTitle: "Key Scores",
        localScore: "Local Score",
        globalScore: "Global Score",
        noScore: "--",
    },
    zh: {
        pageTitle: "历史记录",
        loading: "加载中...",
        noHistory: "暂无历史记录。",
        untitled: "未命名",
        noCover: "无封面",
        keyScoresTitle: "关键评分",
        localScore: "本号评分",
        globalScore: "全网评分",
        noScore: "--",
    }
};

export default function HistoryPage() {
    const { lang } = useLanguage();
    const t = copy[lang];
    const [history, setHistory] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch history
        // Ideally we need an endpoint /api/history
        // Since we didn't define it explicitly in Plan, I will create it.
        // For now, let's assume /api/history exists or use a mock.

        const fetchHistory = async () => {
            try {
                const res = await fetch('/api/history');
                if (res.ok) {
                    const data = await res.json();
                    setHistory(data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    return (
        <div className="page app-page">
            <section className="glass app-section app-section-lg fade-up" style={{ minHeight: '72vh' }}>
                <h3>{t.pageTitle}</h3>

                {loading ? (
                    <div style={{ marginTop: 20 }}>{t.loading}</div>
                ) : (
                    <div className="app-stack" style={{ marginTop: 20 }}>
                        {history.length === 0 && <div>{t.noHistory}</div>}
                        {history.map(item => {
                            let parsedTitle = t.untitled;
                            let localScore = "";
                            let globalScore = "";
                            try {
                                const input = JSON.parse(item.inputData || "{}") as { title?: string };
                                parsedTitle = input.title || t.untitled;
                            } catch {
                                parsedTitle = t.untitled;
                            }
                            try {
                                const result = JSON.parse(item.resultData || "{}") as {
                                    engagementScore?: { local?: number | string; global?: number | string };
                                };
                                const local = result.engagementScore?.local;
                                const global = result.engagementScore?.global;
                                localScore = typeof local === "number" ? `${local}` : (local || "");
                                globalScore = typeof global === "number" ? `${global}` : (global || "");
                            } catch {
                                localScore = "";
                                globalScore = "";
                            }
                            return (
                                <Link
                                    href={item.status === 'COMPLETED' ? `/analysis/${item.id}` : `/prediction/${item.id}`} // Assuming logic
                                    key={item.id}
                                    style={{ textDecoration: 'none' }}
                                >
                                    <div className="upload-box history-card" style={{
                                        padding: 20,
                                        borderRadius: 8,
                                        background: 'rgba(255,255,255,0.92)',
                                        border: '1px solid rgba(2,132,199,0.15)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 14,
                                        justifyContent: 'space-between',
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 14,
                                            minWidth: 0,
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
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontWeight: 600, color: 'var(--text)' }}>{parsedTitle}</div>
                                                <div className="muted tiny">{new Date(item.createdAt).toLocaleString()}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginLeft: 12 }}>
                                            <div className="upload-box" style={{
                                                padding: '6px 10px',
                                                borderRadius: 8,
                                                border: '1px solid rgba(2,132,199,0.16)',
                                                background: 'rgba(255,255,255,0.92)',
                                                minWidth: 92
                                            }}>
                                                <div className="muted tiny">{t.localScore}</div>
                                                <div style={{ fontWeight: 700, color: 'var(--text)' }}>{localScore || t.noScore}</div>
                                            </div>
                                            <div className="upload-box" style={{
                                                padding: '6px 10px',
                                                borderRadius: 8,
                                                border: '1px solid rgba(2,132,199,0.16)',
                                                background: 'rgba(255,255,255,0.92)',
                                                minWidth: 92
                                            }}>
                                                <div className="muted tiny">{t.globalScore}</div>
                                                <div style={{ fontWeight: 700, color: 'var(--text)' }}>{globalScore || t.noScore}</div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
