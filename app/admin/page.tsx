'use client';

import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface UserItem {
    id: string;
    username: string;
    role: string;
    hotelName?: string | null;
    employeeId?: string | null;
    createdAt: string;
}

interface SubmissionItem {
    id: string;
    user: { username: string };
    status: string;
    createdAt: string;
    inputData: string;
    resultData?: string | null;
}

interface UsageLogItem {
    id: string;
    action: string;
    ip: string | null;
    location: string | null;
    timestamp: string;
    user: { username: string; role: string } | null;
}

interface AnalyticsData {
    summary: {
        totalUsers: number;
        totalSubmissions: number;
        totalLogs: number;
    };
    actionCounts: Array<{ action: string; count: number }>;
    locationCounts: Array<{ location: string; count: number }>;
    dailyUsage: Array<{ date: string; count: number }>;
}

const copy = {
    en: {
        pageTitle: "Admin Dashboard",
        pageIntro: "Manage account permissions, review upload history, and audit key operations from one place.",
        tabUsers: "Users",
        tabSubs: "Submissions",
        tabAudit: "Audit",
        tabIntroUsers: "Filter and review user accounts, then remove invalid or redundant entries when needed.",
        tabIntroSubs: "Review all submitted tasks, monitor statuses, and export upload/result datasets.",
        tabIntroAudit: "Track sensitive actions and usage trends for compliance and troubleshooting.",
        thUser: "User",
        thUsername: "Username",
        thRole: "Role",
        thCreatedAt: "Created At",
        thActions: "Actions",
        thTitle: "Title",
        thStatus: "Status",
        thDate: "Date",
        thHotel: "Hotel",
        thEmployee: "Employee ID",
        thAction: "Action",
        thIp: "IP",
        thLocation: "Location",
        btnDelete: "Delete",
        btnResetFilters: "Reset Filters",
        btnExportUsers: "Export Users CSV",
        btnExportUpload: "Export Upload CSV",
        btnExportResults: "Export Results CSV",
        filterTitle: "User Filters",
        filterRoleAll: "All Roles",
        noFilteredUsers: "No users match the current filters.",
        formHotel: "Hotel Name",
        formEmployee: "Employee ID",
        formRole: "Role",
        roleUser: "USER",
        roleAdmin: "ADMIN",
        loading: "Loading Admin Panel...",
        auditLoading: "Loading audit data...",
        confirmUser: "Are you sure you want to delete this user?",
        confirmSub: "Are you sure you want to delete this record?",
        noLogs: "No logs",
        summaryUsers: "Total users",
        summarySubs: "Total submissions",
        summaryLogs: "Total logs",
        topActions: "Top Actions",
        topLocations: "Top Locations",
        status: {
            COMPLETED: "COMPLETED",
            FAILED: "FAILED",
            PROCESSING: "PROCESSING",
            PENDING: "PENDING"
        }
    },
    zh: {
        pageTitle: "管理后台",
        pageIntro: "在这里统一完成账号权限管理、提交记录治理与关键操作审计。",
        tabUsers: "用户管理",
        tabSubs: "提交记录",
        tabAudit: "审计日志",
        tabIntroUsers: "用于筛选并查看用户账号，必要时清理无效或冗余账号。",
        tabIntroSubs: "用于查看所有提交任务、跟踪处理状态，并导出上传/结果数据。",
        tabIntroAudit: "用于追踪敏感操作和访问行为，支持审计留痕与问题排查。",
        thUser: "用户",
        thUsername: "用户名",
        thRole: "角色",
        thCreatedAt: "创建时间",
        thActions: "操作",
        thTitle: "标题",
        thStatus: "状态",
        thDate: "日期",
        thHotel: "酒店",
        thEmployee: "员工编号",
        thAction: "动作",
        thIp: "IP",
        thLocation: "地点",
        btnDelete: "删除",
        btnResetFilters: "重置筛选",
        btnExportUsers: "导出用户 CSV",
        btnExportUpload: "导出上传 CSV",
        btnExportResults: "导出结果 CSV",
        filterTitle: "筛选查询",
        filterRoleAll: "全部角色",
        noFilteredUsers: "当前筛选条件下没有匹配用户。",
        formHotel: "酒店名称",
        formEmployee: "员工编号",
        formRole: "角色",
        roleUser: "普通用户",
        roleAdmin: "管理员",
        loading: "正在加载管理后台...",
        auditLoading: "正在加载审计数据...",
        confirmUser: "确定要删除该用户吗？",
        confirmSub: "确定要删除该记录吗？",
        noLogs: "暂无日志",
        summaryUsers: "用户总数",
        summarySubs: "提交总数",
        summaryLogs: "日志总数",
        topActions: "高频操作",
        topLocations: "高频地点",
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

    const [users, setUsers] = useState<UserItem[]>([]);
    const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
    const [logs, setLogs] = useState<UsageLogItem[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [activeTab, setActiveTab] = useState<'users' | 'submissions' | 'audit'>('users');
    const [loading, setLoading] = useState(true);
    const [auditLoading, setAuditLoading] = useState(false);
    const [userFilters, setUserFilters] = useState({
        hotelName: "",
        employeeId: "",
        role: "ALL",
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
            return;
        }
        if (status === 'authenticated') {
            if ((session?.user as any).role !== 'ADMIN') {
                router.push('/');
            } else {
                fetchCoreData();
            }
        }
    }, [status, session, router]);

    useEffect(() => {
        if (activeTab === "audit") {
            fetchAuditData();
        }
    }, [activeTab]);

    const fetchCoreData = async () => {
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

    const fetchAuditData = async () => {
        setAuditLoading(true);
        try {
            const [resLogs, resAnalytics] = await Promise.all([
                fetch('/api/admin/logs?limit=200'),
                fetch('/api/admin/analytics')
            ]);
            if (resLogs.ok) setLogs(await resLogs.json());
            if (resAnalytics.ok) setAnalytics(await resAnalytics.json());
        } catch (e) {
            console.error(e);
        } finally {
            setAuditLoading(false);
        }
    };

    const handleDeleteSubmission = async (id: string) => {
        if (!confirm(t.confirmSub)) return;
        try {
            const res = await fetch(`/api/admin/submissions?id=${id}`, { method: 'DELETE' });
            if (!res.ok) return;
            setSubmissions((prev) => prev.filter((item) => item.id !== id));
        } catch (e) {
            console.error(e);
        }
    };

    const triggerExport = (url: string) => {
        window.open(url, "_blank");
    };

    const resetUserFilters = () => {
        setUserFilters({
            hotelName: "",
            employeeId: "",
            role: "ALL",
        });
    };

    const roleText = (role?: string | null) => {
        if (!role) return "-";
        if (lang === "zh") {
            if (role.toUpperCase() === "ADMIN") return "管理员";
            if (role.toUpperCase() === "USER") return "普通用户";
        }
        return role;
    };

    const actionText = (action: string) => {
        if (lang !== "zh") return action;

        if (action.startsWith("ADMIN_CREATE_USER:")) {
            return `管理员新增用户：${action.slice("ADMIN_CREATE_USER:".length)}`;
        }
        if (action.startsWith("ADMIN_DELETE_USER:")) {
            return `管理员删除用户：${action.slice("ADMIN_DELETE_USER:".length)}`;
        }
        if (action.startsWith("ADMIN_DELETE_SUBMISSION:")) {
            return `管理员删除提交：${action.slice("ADMIN_DELETE_SUBMISSION:".length)}`;
        }

        const map: Record<string, string> = {
            LOGIN: "登录",
            REGISTER: "注册",
            UPLOAD_CREATE: "创建上传",
            VIEW_HISTORY: "查看历史记录",
            VIEW_TASK_STATUS: "查看任务状态",
            ADMIN_VIEW_USERS: "查看用户列表",
            ADMIN_EXPORT_USERS: "导出用户数据",
            ADMIN_VIEW_SUBMISSIONS: "查看提交列表",
            ADMIN_EXPORT_UPLOADS: "导出上传数据",
            ADMIN_EXPORT_RESULTS: "导出预测/分析结果",
            ADMIN_VIEW_AUDIT_LOGS: "查看审计日志",
            ADMIN_VIEW_ANALYTICS: "查看使用统计",
        };
        return map[action] || action;
    };

    const tabIntroText =
        activeTab === "users" ? t.tabIntroUsers :
            activeTab === "submissions" ? t.tabIntroSubs :
                t.tabIntroAudit;

    const filteredUsers = users.filter((user) => {
        const hotelInput = userFilters.hotelName.trim().toLowerCase();
        const employeeInput = userFilters.employeeId.trim().toLowerCase();
        const roleInput = userFilters.role.toUpperCase();

        const hotelValue = (user.hotelName || "").toLowerCase();
        const employeeValue = (user.employeeId || "").toLowerCase();
        const roleValue = (user.role || "").toUpperCase();

        const matchHotel = !hotelInput || hotelValue.includes(hotelInput);
        const matchEmployee = !employeeInput || employeeValue.includes(employeeInput);
        const matchRole = roleInput === "ALL" || roleValue === roleInput;

        return matchHotel && matchEmployee && matchRole;
    });

    if (status === 'loading' || loading) {
        return <div className="page app-page"><div className="loader">{t.loading}</div></div>;
    }

    return (
        <div className="page app-page">
            <section className="glass app-section app-section-lg fade-up" style={{ minHeight: '72vh' }}>
                <div className="section-title-row" style={{ marginBottom: 24 }}>
                    <h3>{t.pageTitle}</h3>
                    <div className="tabs inline-actions">
                        <button className={`ghost-button ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>{t.tabUsers}</button>
                        <button className={`ghost-button ${activeTab === 'submissions' ? 'active' : ''}`} onClick={() => setActiveTab('submissions')}>{t.tabSubs}</button>
                        <button className={`ghost-button ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>{t.tabAudit}</button>
                    </div>
                </div>
                <div className="soft-card soft-card-accent" style={{ marginBottom: 18 }}>
                    <div className="muted tiny">{t.pageIntro}</div>
                    <div style={{ marginTop: 6 }}>{tabIntroText}</div>
                </div>

                {activeTab === 'users' && (
                    <div className="app-stack">
                        <div className="soft-card">
                            <div className="muted tiny" style={{ marginBottom: 10 }}>{t.filterTitle}</div>
                            <div className="content-grid-auto-220">
                                <input
                                    className="ui-input-field"
                                    placeholder={t.formHotel}
                                    value={userFilters.hotelName}
                                    onChange={(e) => setUserFilters((prev) => ({ ...prev, hotelName: e.target.value }))}
                                />
                                <input
                                    className="ui-input-field"
                                    placeholder={t.formEmployee}
                                    value={userFilters.employeeId}
                                    onChange={(e) => setUserFilters((prev) => ({ ...prev, employeeId: e.target.value }))}
                                />
                                <select
                                    className="ui-input-field"
                                    value={userFilters.role}
                                    onChange={(e) => setUserFilters((prev) => ({ ...prev, role: e.target.value }))}
                                >
                                    <option value="ALL">{t.filterRoleAll}</option>
                                    <option value="USER">{t.roleUser}</option>
                                    <option value="ADMIN">{t.roleAdmin}</option>
                                </select>
                                <div className="inline-actions">
                                    <button className="ghost-button" type="button" onClick={resetUserFilters}>
                                        {t.btnResetFilters}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="inline-actions">
                            <button className="ghost-button" onClick={() => triggerExport('/api/admin/users?export=csv')}>
                                {t.btnExportUsers}
                            </button>
                        </div>

                        <div className="table-wrap">
                            <table className="table-surface">
                                <thead>
                                    <tr>
                                        <th>{t.thUsername}</th>
                                        <th>{t.thRole}</th>
                                        <th>{t.thHotel}</th>
                                        <th>{t.thEmployee}</th>
                                        <th>{t.thCreatedAt}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5}>{t.noFilteredUsers}</td>
                                        </tr>
                                    ) : filteredUsers.map(user => (
                                        <tr className="table-surface-row" key={user.id} style={{ borderBottom: '1px solid rgba(15,23,42,0.06)' }}>
                                            <td>{user.username}</td>
                                            <td>{roleText(user.role)}</td>
                                            <td>{user.hotelName || "-"}</td>
                                            <td>{user.employeeId || "-"}</td>
                                            <td>{new Date(user.createdAt).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'submissions' && (
                    <div className="app-stack">
                        <div className="inline-actions">
                            <button className="ghost-button" onClick={() => triggerExport('/api/admin/submissions?export=upload')}>
                                {t.btnExportUpload}
                            </button>
                            <button className="ghost-button" onClick={() => triggerExport('/api/admin/submissions?export=result')}>
                                {t.btnExportResults}
                            </button>
                        </div>

                        <div className="table-wrap">
                            <table className="table-surface">
                                <thead>
                                    <tr>
                                        <th>{t.thUser}</th>
                                        <th>{t.thTitle}</th>
                                        <th>{t.thStatus}</th>
                                        <th>{t.thDate}</th>
                                        <th>{t.thActions}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.map(sub => {
                                        let title = lang === "en" ? "Untitled" : "未命名";
                                        try {
                                            const input = JSON.parse(sub.inputData || "{}");
                                            title = input.title || title;
                                        } catch {
                                            title = lang === "en" ? "Untitled" : "未命名";
                                        }
                                        return (
                                            <tr className="table-surface-row" key={sub.id} style={{ borderBottom: '1px solid rgba(15,23,42,0.06)' }}>
                                                <td>{sub.user.username}</td>
                                                <td>{title}</td>
                                                <td>
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
                                                <td>{new Date(sub.createdAt).toLocaleString()}</td>
                                                <td>
                                                    <button onClick={() => handleDeleteSubmission(sub.id)} className="table-delete-btn">
                                                        {t.btnDelete}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'audit' && (
                    <div className="app-stack">
                        {auditLoading ? (
                            <div className="muted">{t.auditLoading}</div>
                        ) : (
                            <>
                                {analytics && (
                                    <div className="content-grid-auto-220">
                                        <div className="soft-card">
                                            <div className="muted tiny">{t.summaryUsers}</div>
                                            <div className="stat-value">{analytics.summary.totalUsers}</div>
                                        </div>
                                        <div className="soft-card">
                                            <div className="muted tiny">{t.summarySubs}</div>
                                            <div className="stat-value">{analytics.summary.totalSubmissions}</div>
                                        </div>
                                        <div className="soft-card">
                                            <div className="muted tiny">{t.summaryLogs}</div>
                                            <div className="stat-value">{analytics.summary.totalLogs}</div>
                                        </div>
                                    </div>
                                )}

                                <div className="content-grid-auto-280">
                                    <div className="soft-card">
                                        <div className="muted tiny">{t.topActions}</div>
                                        {(analytics?.actionCounts || []).slice(0, 8).map((item) => (
                                            <div key={item.action} className="stack-row" style={{ marginTop: 8 }}>
                                                <span>{actionText(item.action)}</span>
                                                <strong>{item.count}</strong>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="soft-card">
                                        <div className="muted tiny">{t.topLocations}</div>
                                        {(analytics?.locationCounts || []).slice(0, 8).map((item) => (
                                            <div key={item.location} className="stack-row" style={{ marginTop: 8 }}>
                                                <span>{item.location}</span>
                                                <strong>{item.count}</strong>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="table-wrap">
                                    <table className="table-surface">
                                        <thead>
                                            <tr>
                                                <th>{t.thDate}</th>
                                                <th>{t.thUser}</th>
                                                <th>{t.thRole}</th>
                                                <th>{t.thAction}</th>
                                                <th>{t.thIp}</th>
                                                <th>{t.thLocation}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {logs.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6}>{t.noLogs}</td>
                                                </tr>
                                            ) : logs.map((log) => (
                                                <tr className="table-surface-row" key={log.id} style={{ borderBottom: '1px solid rgba(15,23,42,0.06)' }}>
                                                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                                                    <td>{log.user?.username || "-"}</td>
                                                    <td>{roleText(log.user?.role)}</td>
                                                    <td>{actionText(log.action)}</td>
                                                    <td>{log.ip || "-"}</td>
                                                    <td>{log.location || "-"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}
