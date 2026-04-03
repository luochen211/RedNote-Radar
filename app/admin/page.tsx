'use client';

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useLanguage } from "../context/LanguageContext";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { isAdminRole } from "@/lib/roles";

interface User {
    id: string;
    username: string;
    role: string;
    hotelName: string | null;
    employeeId: string | null;
    createdAt: string;
}

interface Submission {
    id: string;
    user: { username: string };
    status: string;
    createdAt: string;
    inputData: string;
}

interface UsageLog {
    id: string;
    action: string;
    location: string | null;
    timestamp: string;
    user: { username: string; role: string } | null;
}

interface Analytics {
    totals: {
        users: number;
        submissions: number;
        logs: number;
    };
    topLocations: { label: string; count: number }[];
}

const copy = {
    en: {
        pageTitle: "Admin Console",
        pageSubtitle: "User administration, submission monitoring and audit overview",
        tabUsers: "User Management",
        tabSubs: "Submission Management",
        tabAudit: "Audit & Statistics",
        thUsername: "Username",
        thHotel: "Hotel",
        thEmployee: "Employee ID",
        thRole: "Role",
        thCreatedAt: "Created At",
        thActions: "Actions",
        thUser: "User",
        thTitle: "Title",
        thStatus: "Status",
        thDate: "Date",
        thAction: "Action",
        thLocation: "Location",
        btnDelete: "Delete",
        cardUsers: "Total users",
        cardSubs: "Total submissions",
        cardLogs: "Audit logs",
        latestLogs: "Latest activity",
        topLocations: "Top locations",
        empty: "No data available.",
        confirmUser: "Are you sure you want to delete this user?",
        confirmSub: "Are you sure you want to delete this record?",
        loading: "Loading admin console...",
        untitled: "Untitled",
        status: {
            COMPLETED: "COMPLETED",
            FAILED: "FAILED",
            PROCESSING: "PROCESSING",
            PENDING: "PENDING"
        }
    },
    zh: {
        pageTitle: "管理中台",
        pageSubtitle: "用户管理、提交监控与审计统计总览",
        tabUsers: "用户管理",
        tabSubs: "提交管理",
        tabAudit: "审计与统计",
        thUsername: "用户名",
        thHotel: "酒店名称",
        thEmployee: "员工编号",
        thRole: "角色",
        thCreatedAt: "创建时间",
        thActions: "操作",
        thUser: "用户",
        thTitle: "标题",
        thStatus: "状态",
        thDate: "日期",
        thAction: "动作",
        thLocation: "地点",
        btnDelete: "删除",
        cardUsers: "用户总数",
        cardSubs: "提交总数",
        cardLogs: "审计日志数",
        latestLogs: "最近活动",
        topLocations: "高频地点",
        empty: "暂无数据。",
        confirmUser: "确定要删除该用户吗？",
        confirmSub: "确定要删除该记录吗？",
        loading: "正在加载管理中台...",
        untitled: "未命名",
        status: {
            COMPLETED: "已完成",
            FAILED: "失败",
            PROCESSING: "处理中",
            PENDING: "等待中"
        }
    }
};

export default function AdminPage() {
    const { lang } = useLanguage();
    const t = copy[lang];
    const router = useRouter();
    const { data: session, status } = useSession();

    const [users, setUsers] = useState<User[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [logs, setLogs] = useState<UsageLog[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [activeTab, setActiveTab] = useState<'users' | 'submissions' | 'audit'>('users');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
            return;
        }

        if (status === 'authenticated') {
            if (!isAdminRole((session?.user as any).role)) {
                router.push('/');
            } else {
                void fetchData();
            }
        }
    }, [status, session, router]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resUsers, resSubs, resLogs, resAnalytics] = await Promise.all([
                fetch('/api/admin/users'),
                fetch('/api/admin/submissions'),
                fetch('/api/admin/logs'),
                fetch('/api/admin/analytics'),
            ]);

            if (resUsers.ok) setUsers(await resUsers.json());
            if (resSubs.ok) setSubmissions(await resSubs.json());
            if (resLogs.ok) setLogs(await resLogs.json());
            if (resAnalytics.ok) setAnalytics(await resAnalytics.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm(t.confirmUser)) return;
        try {
            await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
            setUsers((prev) => prev.filter((user) => user.id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteSubmission = async (id: string) => {
        if (!confirm(t.confirmSub)) return;
        try {
            await fetch(`/api/admin/submissions?id=${id}`, { method: 'DELETE' });
            setSubmissions((prev) => prev.filter((submission) => submission.id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="page workspace-page workspace-inverse workspace-soft">
                <Navbar />
                <div className="loader" style={{ padding: "120px 0", textAlign: "center" }}>
                    <div className="spinner" style={{ margin: "0 auto" }}></div>
                    <div className="muted" style={{ marginTop: 20 }}>{t.loading}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="page workspace-page workspace-inverse workspace-soft">
            <Navbar />
            <section className="glass fade-up workspace-panel workspace-section" style={{ padding: 36, marginTop: 36, minHeight: '80vh' }}>
                <div className="workspace-header" style={{ display: 'flex', justifyContent: 'space-between', gap: 24, alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap' }}>
                    <div>
                        <h3 style={{ marginBottom: 8 }}>{t.pageTitle}</h3>
                        <div className="muted">{t.pageSubtitle}</div>
                    </div>
                    <div className="tabs" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button className={`ghost-button ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>{t.tabUsers}</button>
                        <button className={`ghost-button ${activeTab === 'submissions' ? 'active' : ''}`} onClick={() => setActiveTab('submissions')}>{t.tabSubs}</button>
                        <button className={`ghost-button ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>{t.tabAudit}</button>
                    </div>
                </div>

                {analytics && (
                    <div className="admin-kpi-grid workspace-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
                        <div className="glass workspace-subcard workspace-stat-card" style={{ padding: 18, borderRadius: 18 }}>
                            <div className="muted tiny">{t.cardUsers}</div>
                            <div style={{ fontSize: 34, fontWeight: 800, color: 'var(--text)' }}>{analytics.totals.users}</div>
                        </div>
                        <div className="glass workspace-subcard workspace-stat-card" style={{ padding: 18, borderRadius: 18 }}>
                            <div className="muted tiny">{t.cardSubs}</div>
                            <div style={{ fontSize: 34, fontWeight: 800, color: 'var(--text)' }}>{analytics.totals.submissions}</div>
                        </div>
                        <div className="glass workspace-subcard workspace-stat-card" style={{ padding: 18, borderRadius: 18 }}>
                            <div className="muted tiny">{t.cardLogs}</div>
                            <div style={{ fontSize: 34, fontWeight: 800, color: 'var(--text)' }}>{analytics.totals.logs}</div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="workspace-table workspace-data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left' }}>
                                    <th style={{ padding: 12 }}>{t.thUsername}</th>
                                    <th style={{ padding: 12 }}>{t.thHotel}</th>
                                    <th style={{ padding: 12 }}>{t.thEmployee}</th>
                                    <th style={{ padding: 12 }}>{t.thRole}</th>
                                    <th style={{ padding: 12 }}>{t.thCreatedAt}</th>
                                    <th style={{ padding: 12 }}>{t.thActions}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td style={{ padding: 12 }}>{user.username}</td>
                                        <td style={{ padding: 12 }}>{user.hotelName || "-"}</td>
                                        <td style={{ padding: 12 }}>{user.employeeId || "-"}</td>
                                        <td style={{ padding: 12 }}>{user.role}</td>
                                        <td style={{ padding: 12 }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td style={{ padding: 12 }}>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="workspace-danger-btn"
                                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                            >
                                                {t.btnDelete}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'submissions' && (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="workspace-table workspace-data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left' }}>
                                    <th style={{ padding: 12 }}>{t.thUser}</th>
                                    <th style={{ padding: 12 }}>{t.thTitle}</th>
                                    <th style={{ padding: 12 }}>{t.thStatus}</th>
                                    <th style={{ padding: 12 }}>{t.thDate}</th>
                                    <th style={{ padding: 12 }}>{t.thActions}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map((submission) => {
                                    const input = JSON.parse(submission.inputData);
                                    const statusClass = submission.status === 'COMPLETED' ? 'is-success' : submission.status === 'FAILED' ? 'is-failed' : 'is-pending';

                                    return (
                                        <tr key={submission.id}>
                                            <td style={{ padding: 12 }}>{submission.user.username}</td>
                                            <td style={{ padding: 12 }}>{input.title || t.untitled}</td>
                                            <td style={{ padding: 12 }}>
                                                <span className={`workspace-status-chip ${statusClass}`} style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12 }}>
                                                    {t.status[submission.status as keyof typeof t.status] || submission.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: 12 }}>{new Date(submission.createdAt).toLocaleString()}</td>
                                            <td style={{ padding: 12 }}>
                                                <button
                                                    onClick={() => handleDeleteSubmission(submission.id)}
                                                    className="workspace-danger-btn"
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                                >
                                                    {t.btnDelete}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'audit' && (
                    <div className="admin-audit-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 18 }}>
                        <div className="glass workspace-subcard" style={{ borderRadius: 20, padding: 20 }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>{t.latestLogs}</div>
                            <div style={{ display: 'grid', gap: 12 }}>
                                {logs.length === 0 && <div className="muted">{t.empty}</div>}
                                {logs.slice(0, 12).map((log) => (
                                    <div key={log.id} className="admin-log-row workspace-list-card" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 0.8fr 1fr', gap: 12, padding: 12, borderRadius: 14, background: 'rgba(122, 166, 255, 0.08)' }}>
                                        <div>
                                            <div style={{ color: 'var(--text)', fontWeight: 600 }}>{log.user?.username || "-"}</div>
                                            <div className="muted tiny">{log.user?.role || "-"}</div>
                                        </div>
                                        <div style={{ color: 'var(--text)' }}>{log.action}</div>
                                        <div className="muted">{log.location || "-"}</div>
                                        <div className="muted tiny">{new Date(log.timestamp).toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: 18 }}>
                            <div className="glass workspace-subcard" style={{ borderRadius: 20, padding: 20 }}>
                                <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>{t.topLocations}</div>
                                <div style={{ display: 'grid', gap: 10 }}>
                                    {(analytics?.topLocations || []).map((item) => (
                                        <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 14, background: 'rgba(122, 166, 255, 0.08)' }}>
                                            <span style={{ color: 'var(--text)' }}>{item.label}</span>
                                            <strong style={{ color: 'var(--text)' }}>{item.count}</strong>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            <style jsx>{`
                @media (max-width: 980px) {
                    .admin-audit-grid {
                        grid-template-columns: 1fr;
                    }

                    .admin-log-row {
                        grid-template-columns: 1fr 1fr;
                    }
                }

                @media (max-width: 640px) {
                    .admin-log-row {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}
