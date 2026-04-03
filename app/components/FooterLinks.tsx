'use client';

import { useLanguage } from "../context/LanguageContext";

const copy = {
    en: {
        linksTitle: "Links",
        linksSubtitle: "Friend links",
        linksAdvisors: "Academic advisors",
        linksPartners: "Social media",
        linksContact: "Contact",
        contactEmail: "Email: info@insighthub.ai",
        contactLocation: "Location: Hong Kong · PolyU SHTM",
        contactTBD: "Social media",
    },
    zh: {
        linksTitle: "友情链接",
        linksSubtitle: "友情链接",
        linksAdvisors: "学术顾问",
        linksPartners: "社交媒体",
        linksContact: "联系我们",
        contactEmail: "邮箱: info@insighthub.ai",
        contactLocation: "地址: 香港 · 香港理工大学酒店及旅游业管理学院",
        contactTBD: "社交媒体",
    },
};

const friendLinks = [
    {
        label: "Project Advisor · Prof. Hengyun Li",
        url: "https://hengyunli.github.io/index.html",
    },
    {
        label: "Technical Advisor · Dr. Jie Mu",
        url: "https://dsai.dufe.edu.cn/content_71197.html",
    },
    {
        label: "Hotel Icon",
        url: "https://www.hotel-icon.com/zh-tw/",
    },
    {
        label: "Hotel Icon · Xiaohongshu",
        url: "https://www.xiaohongshu.com/explore",
    },
    {
        label: "PolyU School of Hotel and Tourism Management",
        url: "https://www.polyu.edu.hk/shtm/",
    },
];

export default function FooterLinks() {
    const { lang } = useLanguage();
    const t = copy[lang];
    const copyLabel = (key: keyof typeof t) => t[key];

    return (
        <section className="links fade-up delay-3" id="links">
            <div className="links-content-wrapper">
                <div className="section-head">
                    <p className="pill">{copyLabel("linksTitle")}</p>
                    <h3>{copyLabel("linksSubtitle")}</h3>
                </div>
                <div className="links-columns">
                    <div className="links-col">
                        <div className="links-col-title">{copyLabel("linksAdvisors")}</div>
                        <ul>
                            {friendLinks.slice(0, 2).map((link) => (
                                <li key={link.url}>
                                    <a href={link.url} target="_blank" rel="noreferrer">
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="links-col">
                        <div className="links-col-title">{copyLabel("linksPartners")}</div>
                        <ul>
                            {friendLinks.slice(2).map((link) => (
                                <li key={link.url}>
                                    <a href={link.url} target="_blank" rel="noreferrer">
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="links-col">
                        <div className="links-col-title">{copyLabel("linksContact")}</div>
                        <ul>
                            <li>{copyLabel("contactEmail")}</li>
                            <li>{copyLabel("contactLocation")}</li>
                            <li>{copyLabel("contactTBD")}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
