'use client';

import { useLanguage } from "../context/LanguageContext";

const copy = {
    en: {
        brand: "Hotel Video InsightHub",
        heroTitle:
            "Video-based Social Media Marketing Analysis and Effectiveness Prediction",
        heroLead:
            "Video-based social media has become a transformative marketing force, dynamically reshaping consumer experiences through its multimodal nature (visual, audio, textual). This model can accurately analyze video social media content and predict its marketing effectiveness, providing support for strategy optimization and research on consumer cognition and behavior.",
        subLead:
            "Built for Hotel Icon and future sub-systems; ready for local vs. industry benchmarks.",
        scrollCta: "Scroll to explore",
        quickFacts: [
            "Spatiotemporal encoders (VGG, VGGish, BERT)",
            "Audio-text and text-video cross-attention",
            "Adaptive fusion with user attention factors",
            "Engagement scores for local & global scopes"
        ],
    },
    zh: {
        brand: "酒店短视频智算台",
        heroTitle: "面向短视频的社交媒体营销分析与效果预测",
        heroLead: "短视频社交媒体已成为一股变革性的营销力量，通过其多模态特性（视觉、听觉、文本）重塑消费者体验。本模型能够精准分析视频社媒内容并预测其营销效果，为策略优化及消费者认知行为研究提供有力支持。",
        subLead: "兼容 Hotel Icon 与未来子系统，支持本地与行业对比基准。",
        scrollCta: "下滑查看详情",
        quickFacts: [
            "时空编码器（VGG、VGGish、BERT）",
            "音频-文本、文本-视频跨模态注意力",
            "自适应融合 + 用户注意因子",
            "本地与全局范围互动分数"
        ],
    },
};

export default function Hero() {
    const { lang } = useLanguage();
    const t = copy[lang];

    return (
        <div className="hero-copy">
            <div className="pill accent">{t.heroTitle}</div>
            <h1>{t.brand}</h1>
            <p className="lead">{t.heroLead}</p>
            <p className="lead muted">{t.subLead}</p>
            <div className="quick-grid">
                {t.quickFacts.map((fact) => (
                    <div key={fact} className="chip">
                        {fact}
                    </div>
                ))}
            </div>
            <a className="scroll-hint" href="#overview">
                <span>↓</span>
                {t.scrollCta}
            </a>
        </div>
    );
}
