'use client';

import { useLanguage } from "../context/LanguageContext";

const copy = {
    en: {
        brand: "Hotel Video InsightHub",
        heroLead:
            "A multilingual analysis workspace for hotel short videos. Upload video, cover, title and copy to receive engagement prediction, sentiment analysis, consistency diagnostics and Eastern aesthetics insights.",
        subLead: "Designed for hospitality teams that need a cleaner demo surface than a research prototype.",
        scrollCta: "View system overview",
        quickFacts: [
            "Chinese and English titles are both supported",
            "Local and global engagement prediction",
            "Cross-modal analysis with structured cards",
            "Submission history for later comparison"
        ],
    },
    zh: {
        brand: "酒店短视频智算平台",
        heroLead: "系统支持中英文标题与文本输入，围绕上传的视频、封面、标题和正文内容，输出互动预测、情感与激活度分析、跨模态一致性诊断以及东方美学相关结果。",
        subLead: "界面将研究型原型整理成更适合汇报、演示和后续商用展示的科技化工作台。",
        scrollCta: "查看系统介绍",
        quickFacts: [
            "支持中英文标题输入",
            "预测页展示本号与全网双范围分数",
            "分析页展示多模态诊断指标",
            "历史页沉淀全部提交记录"
        ],
    },
};

export default function Hero() {
    const { lang } = useLanguage();
    const t = copy[lang];

    return (
        <div className="hero-copy">
            <div className="doc-kicker">{lang === "en" ? "AI Analysis Platform" : "AI 智算平台"}</div>
            <h1>{t.brand}</h1>
            <div className="doc-abstract landing-abstract">
                <div className="doc-abstract-label">{lang === "en" ? "Platform Intro" : "平台简介"}</div>
                <p className="lead">{t.heroLead}</p>
                {t.subLead ? <p className="lead muted">{t.subLead}</p> : null}
            </div>
            <div className="quick-grid doc-fact-list">
                {t.quickFacts.map((fact, index) => (
                    <div key={fact} className="chip">
                        <span className="doc-fact-index">{String(index + 1).padStart(2, "0")}</span>
                        <span>{fact}</span>
                    </div>
                ))}
            </div>
            <div className="landing-stat-row">
                <div className="landing-stat-card">
                    <span>{lang === "en" ? "Upload inputs" : "上传输入"}</span>
                    <strong>9+</strong>
                </div>
                <div className="landing-stat-card">
                    <span>{lang === "en" ? "Analysis groups" : "分析模块"}</span>
                    <strong>4</strong>
                </div>
                <div className="landing-stat-card">
                    <span>{lang === "en" ? "Scopes" : "预测范围"}</span>
                    <strong>2</strong>
                </div>
            </div>
            <a className="scroll-hint landing-link" href="/overview">
                {t.scrollCta}
            </a>
        </div>
    );
}
