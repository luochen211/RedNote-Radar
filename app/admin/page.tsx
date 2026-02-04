'use client';

import { useState, useEffect } from "react";

import { useLanguage } from "../context/LanguageContext";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface User {
    id: string;
    username: string;
    role: string;
    createdAt: string;
}

interface Submission {
    id: string;
    user: { username: string };
    status: string;
    createdAt: string;
    inputData: string;
}

const copy = {
    en: {
        pageTitle: "Admin Dashboard",
        tabUsers: "Users",
        tabSubs: "Submissions",
        thUser: "User",
        thUsername: "Username",
        thRole: "Role",
        thCreatedAt: "Created At",
        thActions: "Actions",
        thTitle: "Title",
        thStatus: "Status",
        thDate: "Date",
        btnDelete: "Delete",
        confirmUser: "Are you sure you want to delete this user?",
        confirmSub: "Are you sure you want to delete this record?",
        loading: "Loading Admin Panel...",
        status: {
            COMPLETED: "COMPLETED",
            FAILED: "FAILED",
            PROCESSING: "PROCESSING",
            PENDING: "PENDING"
        }
    },
    zh: {
        pageTitle: "管理后台",
        tabUsers: "用户管理",
        tabSubs: "提交记录管理",
        thUser: "用户",
        thUsername: "用户名",
        thRole: "角色",
        thCreatedAt: "创建时间",
        thActions: "操作",
        thTitle: "标题",
        thStatus: "状态",
        thDate: "日期",
        btnDelete: "删除",
        confirmUser: "确定要删除该用户吗？",
        confirmSub: "确定要删除该记录吗？",
        loading: "正在加载管理后台...",
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
    const [activeTab, setActiveTab] = useState<'users' | 'submissions'>('users');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
        if (status === 'authenticated') {
            if ((session?.user as any).role !== 'ADMIN') {
                router.push('/'); // Redirect non-admins
            } else {
                fetchData();
            }
        }
    }, [status, session, router]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resUsers, resSubs] = await Promise.all([
                fetch('/api/admin/users'),
                fetch('/api/admin/submissions')
            ]);

            if (resUsers.ok) setUsers(await resUsers.json());
            if (resSubs.ok) setSubmissions(await resSubs.json());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm(t.confirmUser)) return;
        try {
            await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
            setUsers(users.filter(u => u.id !== id));
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteSubmission = async (id: string) => {
        if (!confirm(t.confirmSub)) return;
        try {
            await fetch(`/api/admin/submissions?id=${id}`, { method: 'DELETE' });
            setSubmissions(submissions.filter(s => s.id !== id));
        } catch (e) {
            console.error(e);
        }
    };

    if (status === 'loading' || loading) {
        return <div className="page"><div className="loader">{t.loading}</div></div>;
    }

    return (
        <div className="page">

            <section className="glass fade-up" style={{ padding: 40, marginTop: 40, minHeight: '80vh' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
                    <h3>{t.pageTitle}</h3>
                    <div className="tabs" style={{ display: 'flex', gap: 10 }}>
                        <button className={`ghost-button ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>{t.tabUsers}</button>
                        <button className={`ghost-button ${activeTab === 'submissions' ? 'active' : ''}`} onClick={() => setActiveTab('submissions')}>{t.tabSubs}</button>
                    </div>
                </div>

                {activeTab === 'users' ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                                    <th style={{ padding: 12 }}>{t.thUsername}</th>
                                    <th style={{ padding: 12 }}>{t.thRole}</th>
                                    <th style={{ padding: 12 }}>{t.thCreatedAt}</th>
                                    <th style={{ padding: 12 }}>{t.thActions}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: 12 }}>{user.username}</td>
                                        <td style={{ padding: 12 }}>{user.role}</td>
                                        <td style={{ padding: 12 }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td style={{ padding: 12 }}>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                style={{ color: '#ff6b6b', background: 'none', border: 'none', cursor: 'pointer' }}
                                            >
                                                {t.btnDelete}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                                    <th style={{ padding: 12 }}>{t.thUser}</th>
                                    <th style={{ padding: 12 }}>{t.thTitle}</th>
                                    <th style={{ padding: 12 }}>{t.thStatus}</th>
                                    <th style={{ padding: 12 }}>{t.thDate}</th>
                                    <th style={{ padding: 12 }}>{t.thActions}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map(sub => {
                                    const input = JSON.parse(sub.inputData);
                                    return (
                                        <tr key={sub.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: 12 }}>{sub.user.username}</td>
                                            <td style={{ padding: 12 }}>{input.title || "Untitled"}</td>
                                            <td style={{ padding: 12 }}>
                                                <span style={{
                                                    padding: '2px 8px',
                                                    borderRadius: 4,
                                                    fontSize: 12,
                                                    background: sub.status === 'COMPLETED' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(250, 204, 21, 0.2)',
                                                    color: sub.status === 'COMPLETED' ? '#4ade80' : '#facc15'
                                                }}>
                                                    {t.status[sub.status as keyof typeof t.status] || sub.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: 12 }}>{new Date(sub.createdAt).toLocaleString()}</td>
                                            <td style={{ padding: 12 }}>
                                                <button
                                                    onClick={() => handleDeleteSubmission(sub.id)}
                                                    style={{ color: '#ff6b6b', background: 'none', border: 'none', cursor: 'pointer' }}
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
            </section>
        </div>
    );
}
