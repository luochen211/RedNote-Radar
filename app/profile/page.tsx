'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

interface Submission {
    id: string;
    status: string;
    createdAt: string;
}

const copy = {
    en: {
        title: "Personal Profile",
        subtitle: "Your account overview and recent submission status.",
        cardAccount: "Account",
        cardRole: "Role",
        cardLoginTime: "Current session",
        cardTotal: "Total submissions",
        cardCompleted: "Completed",
        cardProcessing: "In progress",
        cardFailed: "Failed",
        cardLatest: "Latest submission",
        noHistory: "No submissions yet",
        roleUser: "User",
        roleAdmin: "Admin",
        actionUpload: "Upload New Content",
        actionHistory: "View History",
    },
    zh: {
        title: "个人信息",
        subtitle: "查看你的账号信息与最近提交状态。",
        cardAccount: "账号",
        cardRole: "角色",
        cardLoginTime: "当前会话",
        cardTotal: "提交总数",
        cardCompleted: "已完成",
        cardProcessing: "处理中",
        cardFailed: "失败",
        cardLatest: "最近一次提交",
        noHistory: "暂无提交记录",
        roleUser: "普通用户",
        roleAdmin: "管理员",
        actionUpload: "上传新内容",
        actionHistory: "查看历史记录",
    },
};

export default function ProfilePage() {
    const { user, isLoading } = useAuth();
    const { lang } = useLanguage();
    const t = copy[lang];
    const router = useRouter();

    const [history, setHistory] = useState<Submission[]>([]);

    useEffect(() => {
        if (isLoading) return;
        if (!user) {
            router.push("/");
            return;
        }
        if (user.role === "admin") {
            router.push("/admin");
            return;
        }

        const fetchHistory = async () => {
            try {
                const res = await fetch("/api/history");
                if (!res.ok) return;
                const data = await res.json();
                setHistory(data);
            } catch (e) {
                console.error(e);
            }
        };

        fetchHistory();
    }, [isLoading, router, user]);

    const stats = useMemo(() => {
        const completed = history.filter((item) => item.status === "COMPLETED").length;
        const processing = history.filter((item) => item.status === "PENDING" || item.status === "PROCESSING").length;
        const failed = history.filter((item) => item.status === "FAILED").length;
        return {
            total: history.length,
            completed,
            processing,
            failed,
            latest: history[0]?.createdAt,
        };
    }, [history]);

    if (!user || user.role === "admin") return null;

    return (
        <div className="page app-page page-enter">
            <section className="glass app-section app-section-lg fade-up">
                <div className="section-head section-intro">
                    <div className="pill accent" style={{ display: "inline-flex" }}>{lang === "en" ? "Profile" : "个人中心"}</div>
                    <h2 style={{ marginTop: 8 }}>{t.title}</h2>
                    <p className="muted" style={{ marginTop: 8 }}>{t.subtitle}</p>
                </div>

                <div className="content-grid-auto-220">
                    <div className="tech-card" style={{ minHeight: 120, alignItems: "flex-start" }}>
                        <div className="tech-label">{t.cardAccount}</div>
                        <div className="value-highlight" style={{ fontSize: 20 }}>{user.account}</div>
                    </div>
                    <div className="tech-card" style={{ minHeight: 120, alignItems: "flex-start" }}>
                        <div className="tech-label">{t.cardRole}</div>
                        <div className="value-highlight" style={{ fontSize: 20 }}>
                            {t.roleUser}
                        </div>
                    </div>
                    <div className="tech-card" style={{ minHeight: 120, alignItems: "flex-start" }}>
                        <div className="tech-label">{t.cardLoginTime}</div>
                        <div className="value-highlight" style={{ fontSize: 20 }}>
                            {new Date(user.loginTime).toLocaleString()}
                        </div>
                    </div>
                </div>

                <div className="content-grid-auto-200" style={{ marginTop: 20 }}>
                    <div className="soft-card">
                        <div className="muted tiny">{t.cardTotal}</div>
                        <div className="stat-value">{stats.total}</div>
                    </div>
                    <div className="soft-card">
                        <div className="muted tiny">{t.cardCompleted}</div>
                        <div className="stat-value success">{stats.completed}</div>
                    </div>
                    <div className="soft-card">
                        <div className="muted tiny">{t.cardProcessing}</div>
                        <div className="stat-value info">{stats.processing}</div>
                    </div>
                    <div className="soft-card">
                        <div className="muted tiny">{t.cardFailed}</div>
                        <div className="stat-value danger">{stats.failed}</div>
                    </div>
                </div>

                <div className="soft-card soft-card-accent" style={{ marginTop: 20 }}>
                    <div className="muted tiny">{t.cardLatest}</div>
                    <div style={{ marginTop: 6, fontWeight: 600 }}>
                        {stats.latest ? new Date(stats.latest).toLocaleString() : t.noHistory}
                    </div>
                </div>

                <div className="inline-actions" style={{ marginTop: 22 }}>
                    <Link className="primary-button" href="/upload" style={{ padding: "10px 16px", borderRadius: 999 }}>
                        {t.actionUpload}
                    </Link>
                    <Link className="ghost-button" href="/history">
                        {t.actionHistory}
                    </Link>
                </div>
            </section>
        </div>
    );
}
