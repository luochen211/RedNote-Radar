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

    const quickFactsEnhanced = [
        {
            icon: (
                <svg className="draw-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                    <line x1="6" y1="6" x2="6.01" y2="6" />
                    <line x1="6" y1="18" x2="6.01" y2="18" />
                </svg>
            ),
            text: t.quickFacts[0]
        },
        {
            icon: (
                <svg className="draw-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20M2 12h20M5.45 5.45l13.1 13.1M18.55 5.45L5.45 18.55" />
                </svg>
            ),
            text: t.quickFacts[1]
        },
        {
            icon: (
                <svg className="draw-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            ),
            text: t.quickFacts[2]
        },
        {
            icon: (
                <svg className="draw-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                    <path d="M22 12A10 10 0 0 0 12 2v10z" />
                </svg>
            ),
            text: t.quickFacts[3]
        }
    ];

    return (
        <div className="hero-copy">
            <h1 className="text-gradient" style={{ lineHeight: 1.2, paddingBottom: 10 }}>{t.heroTitle}</h1>
            <p className="lead">{t.heroLead}</p>
            <p className="lead muted">{t.subLead}</p>
            <div className="feature-grid">
                {quickFactsEnhanced.map((item, idx) => (
                    <div key={idx} className="feature-card">
                        <div className="feature-icon">{item.icon}</div>
                        <div className="feature-text">{item.text}</div>
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
