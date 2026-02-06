'use client';

import { useLanguage } from "../context/LanguageContext";

const copy = {
    en: {
        linksTitle: "Team & Partners",
        linksSubtitle: "Project team and partner resources",
        linksTeam: "Project Team",
        linksPartners: "Partners",
        linksContact: "Contact",
        contactLocation: "Location: Hong Kong · PolyU SHTM",
        labelHost: "Project Host: Prof. Hengyun Li",
        labelCollaborator: "Collaborator & Core: Dr. Jie Mu",
        labelMembers: "Members: Dr. Danting Cai, Wei Zhang, Haoqiang Sun",
        labelFunding: "This project is funded by RCDTT Hotel ICON Grant",
    },
    zh: {
        linksTitle: "团队与合作链接",
        linksSubtitle: "项目团队与合作伙伴资源",
        linksTeam: "项目团队",
        linksPartners: "合作伙伴",
        linksContact: "联系我们",
        contactLocation: "地址: 香港 · 香港理工大学酒店及旅游业管理学院",
        labelHost: "项目主持人：李恒云 教授",
        labelCollaborator: "项目合作者 兼 核心成员：慕杰 博士",
        labelMembers: "成员：蔡丹婷 博士，张薇，孙浩强等",
        labelFunding: "本项目由 RCDTT Hotel ICON Grant 资助",
    },
};

const friendLinks = [
    {
        label: "Hotel Icon",
        url: "https://www.hotel-icon.com/zh-tw/",
    },
    {
        label: "Hotel Icon · Social Media",
        url: "https://www.xiaohongshu.com/user/profile/60794e420000000001004467?xhsshare=CopyLink&appuid=60499914000000000100af1e&apptime=1619586106",
    },
    {
        label: "PolyU School of Hotel and Tourism Management",
        url: "https://www.polyu.edu.hk/shtm/",
    },
];

const collaboratorUrl = "https://dsai.dufe.edu.cn/content_71197.html";

export default function FooterLinks() {
    const { lang } = useLanguage();
    const t = copy[lang];
    // @ts-ignore
    const copyLabel = (key: string) => t[key] || "";

    return (
        <section className="links fade-up delay-3" id="links">
            <div className="links-content-wrapper">
                <div className="section-head">
                    <p className="pill">{copyLabel("linksTitle")}</p>
                    <h3>{copyLabel("linksSubtitle")}</h3>
                </div>
                <div className="links-columns">
                    {/* Column 1: Project Team */}
                    <div className="links-col">
                        <div className="links-col-title">{copyLabel("linksTeam")}</div>
                        <ul>
                            <li>
                                <a href="https://hengyunli.github.io/index.html" target="_blank" rel="noreferrer noopener">
                                    {copyLabel("labelHost")}
                                </a>
                            </li>
                            <li>
                                <a href={collaboratorUrl} target="_blank" rel="noreferrer noopener">
                                    {copyLabel("labelCollaborator")}
                                </a>
                            </li>
                            <li>{copyLabel("labelMembers")}</li>
                            <li>{copyLabel("labelFunding")}</li>
                        </ul>
                    </div>

                    {/* Column 2: Partners */}
                    <div className="links-col">
                        <div className="links-col-title">{copyLabel("linksPartners")}</div>
                        <ul>
                            {friendLinks.map((link) => (
                                <li key={link.url}>
                                    <a href={link.url} target="_blank" rel="noreferrer noopener">
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Contact */}
                    <div className="links-col">
                        <div className="links-col-title">{copyLabel("linksContact")}</div>
                        <ul>
                            <li>{copyLabel("contactLocation")}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
