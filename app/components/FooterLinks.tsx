'use client';

import { useLanguage } from "../context/LanguageContext";

const copy = {
    en: {
        linksTitle: "Links",
        linksSubtitle: "Friend links",
        linksAdvisors: "Academic advisors",
        linksPartners: "Project resources",
        linksContact: "Contact",
        contactFunding: "This project is funded by RCDTT Hotel ICON Grant",
        contactLocation: "Location: Hong Kong · PolyU SHTM",
    },
    zh: {
        linksTitle: "友情链接",
        linksSubtitle: "友情链接",
        linksAdvisors: "学术顾问",
        linksPartners: "项目资源",
        linksContact: "联系我们",
        contactFunding: "This project is funded by RCDTT Hotel ICON Grant",
        contactLocation: "地址: 香港 · 香港理工大学酒店及旅游业管理学院",
    },
};

const friendLinks = [
    {
        label: "Project Principal Investigator · Prof. Hengyun Li",
        url: "https://hengyunli.github.io/index.html",
    },
    {
        label: "Project Collaborator and Core Member · Dr. Jie Mu",
        url: "https://dsai.dufe.edu.cn/content_71197.html",
    },
    {
        label: "Members · Dr. Danting Cai, Zhang Wei, Sun Haoqiang, et al.",
        url: "https://www.polyu.edu.hk/shtm/",
    },
    {
        label: "Hotel ICON",
        url: "https://www.hotel-icon.com/zh-tw/",
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
                            <li>{friendLinks[2].label}</li>
                        </ul>
                    </div>
                    <div className="links-col">
                        <div className="links-col-title">{copyLabel("linksPartners")}</div>
                        <ul>
                            {friendLinks.slice(3).map((link) => (
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
                            <li>{copyLabel("contactFunding")}</li>
                            <li>{copyLabel("contactLocation")}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
