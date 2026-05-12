'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import ParticleBackground from "../components/ParticleBackground";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { isAdminRole } from "@/lib/roles";

interface Submission {
    id: string;
    status: string;
    createdAt: string;
}

const copy = {
    en: {
        pageTitle: "Profile",
        pageSubtitle: "Account overview and recent submission summary",
        loading: "Loading profile...",
        account: "Account",
        role: "Role",
        sessionTime: "Session time",
        totalSubmissions: "Total submissions",
        completed: "Completed",
        processing: "Processing",
        failed: "Failed",
        recentSubmission: "Recent submission",
        noSubmission: "No submission yet",
        goUpload: "Go to Upload",
        goHistory: "Go to History",
        userRole: "User",
        adminRole: "Admin",
    },
    zh: {
        pageTitle: "个人中心",
        pageSubtitle: "账号概览与最近提交统计",
        loading: "正在加载个人中心...",
        account: "账号",
        role: "角色",
        sessionTime: "会话时间",
        totalSubmissions: "总提交数",
        completed: "已完成",
        processing: "处理中",
        failed: "失败",
        recentSubmission: "最近提交时间",
        noSubmission: "暂无提交记录",
        goUpload: "前往上传页",
        goHistory: "前往历史记录",
        userRole: "普通用户",
        adminRole: "管理员",
    }
};

export default function ProfilePage() {
    const { user, isLoading } = useAuth();
    const { lang } = useLanguage();
    const router = useRouter();
    const t = copy[lang];
    const [history, setHistory] = useState<Submission[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);

    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (!user) {
            router.push("/");
            return;
        }

        if (isAdminRole(user.role)) {
            router.push("/admin");
            return;
        }

        const fetchHistory = async () => {
            try {
                const res = await fetch("/api/history");
                if (res.ok) {
                    setHistory(await res.json());
                }
            } catch (error) {
                console.error(error);
            } finally {
                setHistoryLoading(false);
            }
        };

        void fetchHistory();
    }, [isLoading, router, user]);

    const stats = useMemo(() => {
        const completed = history.filter((item) => item.status === "COMPLETED").length;
        const processing = history.filter((item) => item.status === "PROCESSING" || item.status === "PENDING").length;
        const failed = history.filter((item) => item.status === "FAILED").length;
        const recentSubmission = history[0]?.createdAt ?? null;

        return {
            total: history.length,
            completed,
            processing,
            failed,
            recentSubmission,
        };
    }, [history]);

    if (isLoading || historyLoading || !user) {
        return (
            <div className="page doc-home overview-page workspace-page workspace-inverse workspace-soft">
                <ParticleBackground />
                <Navbar />
                <div className="loader" style={{ padding: "120px 0", textAlign: "center" }}>
                    <div className="spinner" style={{ margin: "0 auto" }}></div>
                    <div className="muted" style={{ marginTop: 20 }}>{t.loading}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="page doc-home overview-page workspace-page workspace-inverse workspace-soft">
            <ParticleBackground />
            <Navbar />
            <section className="glass fade-up workspace-panel workspace-section" style={{ padding: 36, marginTop: 36, minHeight: "70vh" }}>
                <div className="workspace-header" style={{ marginBottom: 28 }}>
                    <h3 style={{ marginBottom: 8 }}>{t.pageTitle}</h3>
                    <div className="muted">{t.pageSubtitle}</div>
                </div>

                <div className="workspace-grid workspace-grid-profile" style={{ display: "grid", gridTemplateColumns: "minmax(260px, 360px) 1fr", gap: 20, alignItems: "start" }}>
                    <div className="glass workspace-subcard" style={{ padding: 24, borderRadius: 20 }}>
                        <div className="muted tiny" style={{ marginBottom: 6 }}>{t.account}</div>
                        <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", marginBottom: 18 }}>
                            {user.account}
                        </div>

                        <div className="muted tiny" style={{ marginBottom: 6 }}>{t.role}</div>
                        <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 18 }}>
                            {isAdminRole(user.role) ? t.adminRole : t.userRole}
                        </div>

                        <div className="muted tiny" style={{ marginBottom: 6 }}>{t.sessionTime}</div>
                        <div style={{ color: "var(--text)" }}>
                            {new Date(user.loginTime).toLocaleString()}
                        </div>
                    </div>

                        <div style={{ display: "grid", gap: 20 }}>
                            <div className="workspace-stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
                                <div className="glass workspace-subcard workspace-stat-card" style={{ padding: 20, borderRadius: 20 }}>
                                <div className="muted tiny">{t.totalSubmissions}</div>
                                <div style={{ fontSize: 34, fontWeight: 800, color: "var(--text)" }}>{stats.total}</div>
                            </div>
                                <div className="glass workspace-subcard workspace-stat-card" style={{ padding: 20, borderRadius: 20 }}>
                                <div className="muted tiny">{t.completed}</div>
                                <div style={{ fontSize: 34, fontWeight: 800, color: "var(--text)" }}>{stats.completed}</div>
                            </div>
                                <div className="glass workspace-subcard workspace-stat-card" style={{ padding: 20, borderRadius: 20 }}>
                                <div className="muted tiny">{t.processing}</div>
                                <div style={{ fontSize: 34, fontWeight: 800, color: "var(--text)" }}>{stats.processing}</div>
                            </div>
                                <div className="glass workspace-subcard workspace-stat-card" style={{ padding: 20, borderRadius: 20 }}>
                                <div className="muted tiny">{t.failed}</div>
                                <div style={{ fontSize: 34, fontWeight: 800, color: "var(--text)" }}>{stats.failed}</div>
                            </div>
                        </div>

                        <div className="glass workspace-subcard" style={{ padding: 24, borderRadius: 20 }}>
                            <div className="muted tiny" style={{ marginBottom: 8 }}>{t.recentSubmission}</div>
                            <div style={{ color: "var(--text)", fontWeight: 600, marginBottom: 20 }}>
                                {stats.recentSubmission ? new Date(stats.recentSubmission).toLocaleString() : t.noSubmission}
                            </div>

                            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                                <Link href="/upload" className="ghost-button">
                                    {t.goUpload}
                                </Link>
                                <Link href="/history" className="ghost-button">
                                    {t.goHistory}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
