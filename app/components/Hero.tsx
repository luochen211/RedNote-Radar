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
    },
    zh: {
        brand: "酒店短视频智算台",
        heroTitle: "面向短视频的社交媒体营销分析与效果预测",
        heroLead: "短视频社交媒体已成为一股变革性的营销力量，通过其多模态特性（视觉、听觉、文本）重塑消费者体验。本模型能够精准分析视频社媒内容并预测其营销效果，为策略优化及消费者认知行为研究提供有力支持。",
        subLead: "兼容 Hotel Icon 与未来子系统，支持本地与行业对比基准。",
        scrollCta: "下滑查看详情",
    },
};

export default function Hero() {
    const { lang } = useLanguage();
    const t = copy[lang];

    return (
        <div className="hero-copy">
            <h1 className="text-gradient" style={{ lineHeight: 1.2, paddingBottom: 10 }}>{t.heroTitle}</h1>
            <p className="lead">{t.heroLead}</p>
            <p className="lead muted">{t.subLead}</p>
        </div>
    );
}
