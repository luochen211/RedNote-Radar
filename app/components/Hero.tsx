'use client';

import { useLanguage } from "../context/LanguageContext";

const copy = {
    en: {
        brand: "Hotel Video InsightHub",
        kicker: "Method Overview",
        abstractLabel: "Core Method",
        methodName: "Video-based Social Media Marketing Analysis and Effectiveness Prediction",
        heroLead:
            "Video-based social media has become a transformative marketing force. This model analyzes hotel short-video content across visual, audio and textual modalities, and predicts marketing effectiveness to support strategy optimization and consumer behavior research.",
        subLead: "The model comprises five modules: single-modal feature extraction, multimodal interaction, modal adaptive fusion, user attention, and engagement prediction.",
        scrollCta: "View system overview",
        quickFacts: [
            "Single-modal feature extraction with VGG, VGGish and BERT",
            "Cross-modal interaction across text, audio and video",
            "Adaptive fusion with user-attention signals",
            "Outputs local/global prediction and multidimensional analysis"
        ],
    },
    zh: {
        brand: "酒店短视频智算平台",
        kicker: "方法概览",
        abstractLabel: "核心方法",
        methodName: "视频社交媒体营销分析与效果预测",
        heroLead: "视频社交媒体已经成为重塑消费者体验的重要营销力量。本模型综合视觉、音频与文本等多模态信息，对酒店短视频内容进行分析并预测其营销效果，为内容优化、策略制定与消费者行为研究提供支持。",
        subLead: "模型由五个模块组成：单模态特征提取、多模态交互、模态自适应融合、用户注意力模块与互动效果预测模块。",
        scrollCta: "查看系统介绍",
        quickFacts: [
            "单模态特征提取：VGG、VGGish、BERT",
            "跨模态交互：文本、音频、视频联合建模",
            "自适应融合：结合用户注意力相关特征",
            "输出结果：本地/全局预测与多维分析"
        ],
    },
};

export default function Hero() {
    const { lang } = useLanguage();
    const t = copy[lang];

    return (
        <div className="hero-copy">
            <h1>{t.brand}</h1>
            <div className="doc-abstract landing-abstract">
                <div className="doc-abstract-label">{t.abstractLabel}</div>
                <p className="lead" style={{ fontWeight: 700 }}>{t.methodName}</p>
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
            <a className="scroll-hint landing-link" href="/overview">
                {t.scrollCta}
            </a>
        </div>
    );
}
