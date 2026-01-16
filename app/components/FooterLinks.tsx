'use client';

import { useLanguage } from "../context/LanguageContext";

const copy = {
    en: {
        linksTitle: "Advisors & partner links",
        linksSubtitle: "Stay aligned with our advisors and partners",
        linksAdvisors: "Advisors",
        linksPartners: "Partners",
        linksContact: "Contact",
        contactEmail: "Email: info@insighthub.ai",
        contactLocation: "Location: Hong Kong · PolyU SHTM",
        contactTBD: "WeChat / Xiaohongshu / TikTok links TBD",
    },
    zh: {
        linksTitle: "指导与合作链接",
        linksSubtitle: "与我们的顾问和合作伙伴保持联系",
        linksAdvisors: "顾问团队",
        linksPartners: "合作伙伴",
        linksContact: "联系我们",
        contactEmail: "邮箱: info@insighthub.ai",
        contactLocation: "地址: 香港 · 香港理工大学酒店及旅游业管理学院",
        contactTBD: "微信 / 小红书 / 抖音 链接待定",
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
