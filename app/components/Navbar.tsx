'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

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
    },
    zh: {
        brand: "酒店短视频智算台",
        navLogin: "登录",
        navOverview: "介绍",
        navArchitecture: "架构",
        navLinks: "友链",
        langToggle: "EN",
        navUpload: "数据上传",
        navHistory: "历史记录",
        navAdmin: "管理后台",
    },
};

export default function Navbar() {
    const { lang, setLang } = useLanguage();
    const { user } = useAuth();
    const t = copy[lang];
    const pathname = usePathname();

    const navItems = [
        { label: lang === 'en' ? "Home" : "首页", href: "/" },
    ];

    if (user) {
        navItems.push({
            label: t.navUpload || (lang === 'en' ? "Data Upload" : "数据上传"),
            href: "/upload"
        });
        // Points to History for listing past predictions/analysis
        navItems.push({
            label: t.navHistory || (lang === 'en' ? "History" : "历史记录"),
            href: "/history"
        });

        if (user.role === 'admin') {
            navItems.push({
                label: t.navAdmin || (lang === 'en' ? "Admin" : "管理后台"),
                href: "/admin"
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
                            style={{ border: '1px solid rgba(255,100,100,0.5)', color: '#ffaaaa' }}
                        >
                            {lang === "en" ? "Logout" : "退出"}
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}
