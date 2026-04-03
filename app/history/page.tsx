'use client';

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
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
        viewPrediction: "Prediction",
        viewAnalysis: "Analysis",
        status: {
            COMPLETED: "COMPLETED",
            FAILED: "FAILED",
            PROCESSING: "PROCESSING",
            PENDING: "PENDING"
        }
    },
    zh: {
        pageTitle: "历史记录",
        loading: "加载中...",
        noHistory: "暂无历史记录。",
        untitled: "未命名",
        viewPrediction: "预测详情",
        viewAnalysis: "分析详情",
        status: {
            COMPLETED: "已完成",
            FAILED: "失败",
            PROCESSING: "处理中",
            PENDING: "等待中"
        }
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
        <div className="page workspace-page workspace-inverse workspace-soft">
            <Navbar />
            <section className="glass fade-up workspace-panel workspace-section" style={{ padding: 40, marginTop: 40, minHeight: '80vh' }}>
                <div className="workspace-header">
                    <h3>{t.pageTitle}</h3>
                </div>

                {loading ? (
                    <div style={{ marginTop: 20 }}>{t.loading}</div>
                ) : (
                    <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {history.length === 0 && <div>{t.noHistory}</div>}
                        {history.map(item => {
                            const input = JSON.parse(item.inputData);
                            return (
                                <div
                                    key={item.id}
                                    className="upload-box workspace-history-card workspace-list-card"
                                    style={{
                                        padding: 20,
                                        borderRadius: 8,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: 20
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--text)' }}>{input.title || t.untitled}</div>
                                        <div className="muted tiny">{new Date(item.createdAt).toLocaleString()}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                        <div className={`workspace-status-chip ${item.status === 'COMPLETED' ? 'is-success' : item.status === 'FAILED' ? 'is-failed' : 'is-pending'}`} style={{
                                            padding: '4px 12px',
                                            borderRadius: 20,
                                            fontSize: 12,
                                        }}>
                                            {t.status[item.status as keyof typeof t.status] || item.status}
                                        </div>
                                        <Link href={`/prediction/${item.id}`} className="ghost-button">
                                            {t.viewPrediction}
                                        </Link>
                                        {item.status === 'COMPLETED' && (
                                            <Link href={`/analysis/${item.id}`} className="ghost-button">
                                                {t.viewAnalysis}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
