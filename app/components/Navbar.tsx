'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { isAdminRole } from "@/lib/roles";

const copy = {
    en: {
        brand: "Hotel Video InsightHub",
        navLogin: "Login",
        navOverview: "Overview",
        navArchitecture: "Architecture",
        navLinks: "Links",
        langToggle: "中文",
        navUpload: "Data Upload",
        navHistory: "History",
        navAdmin: "Admin",
        navHome: "Home",
        navProfile: "Profile",
        logout: "Logout",
    },
    zh: {
        brand: "酒店短视频智算平台",
        navLogin: "登录",
        navOverview: "系统介绍",
        navArchitecture: "架构",
        navLinks: "友链",
        langToggle: "EN",
        navUpload: "数据上传",
        navHistory: "历史记录",
        navAdmin: "管理后台",
        navHome: "首页",
        navProfile: "个人中心",
        logout: "退出",
    },
};

export default function Navbar() {
    const { lang, setLang } = useLanguage();
    const { user } = useAuth();
    const t = copy[lang];
    const pathname = usePathname();

    const navItems = user ? [
        { label: t.navHome, href: "/" },
        { label: t.navOverview, href: "/overview" },
    ] : [
        { label: t.navLogin, href: "/#login" },
        { label: t.navOverview, href: "/overview" },
    ];

    if (user) {
        navItems.push({
            label: t.navUpload,
            href: "/upload"
        });
        navItems.push({
            label: t.navHistory,
            href: "/history"
        });

        if (isAdminRole(user.role)) {
            navItems.push({
                label: t.navAdmin,
                href: "/admin"
            });
        } else {
            navItems.push({
                label: t.navProfile,
                href: "/profile"
            });
        }
    }

    const { logout } = useAuth();

    return (
        <nav className="hero-banner">
            <div className="topbar">
                <div className="brand">
                    <div className="brand-title">{t.brand}</div>
                </div>
                <div className="nav-links">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`nav-link ${isActive ? "active" : ""}`}
                            >
                                {item.label}
                            </Link>
                        )
                    })}
                </div>
                <div className="actions" style={{ display: 'flex', gap: 12 }}>
                    <button
                        className="ghost-button"
                        onClick={() => setLang(lang === "en" ? "zh" : "en")}
                    >
                        {t.langToggle}
                    </button>
                    {user && (
                        <button
                            className="ghost-button"
                            onClick={() => logout()}
                            style={{ border: '1px solid rgba(220,38,38,0.18)', color: '#dc2626' }}
                        >
                            {t.logout}
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}
