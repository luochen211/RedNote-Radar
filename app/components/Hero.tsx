'use client';

import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const copy = {
    en: {
        heroTitle:
            "Video-based Social Media Marketing Analysis and Effectiveness Prediction",
        heroLead:
            "Video-based social media has become a transformative marketing force, dynamically reshaping consumer experiences through its multimodal nature (visual, audio, textual). This model can accurately analyze video social media content and predict its marketing effectiveness, providing support for strategy optimization and research on consumer cognition and behavior.",
        subLead:
            "Built for Hotel Icon and future sub-systems; ready for local vs. industry benchmarks.",
        scrollCta: "Scroll to explore",
    },
    zh: {
        heroTitle: "酒店短视频智能平台",
        heroLead: "短视频社交媒体已成为一股变革性的营销力量，通过其多模态特性（视觉、听觉、文本）重塑消费者体验。本模型能够精准分析视频社媒内容并预测其营销效果，为策略优化及消费者认知行为研究提供有力支持。",
        subLead: "兼容 Hotel Icon 与未来子系统，支持本地与行业对比基准。",
    },
};

export default function Hero() {
    const { lang } = useLanguage();
    const t = copy[lang];
    const [titleText, setTitleText] = useState("");
    const [showLead, setShowLead] = useState(false);
    const [showSubLead, setShowSubLead] = useState(false);

    useEffect(() => {
        let active = true;
        let leadTimer: ReturnType<typeof setTimeout> | null = null;
        let subLeadTimer: ReturnType<typeof setTimeout> | null = null;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
        const stream = async (
            source: string,
            setter: (value: string) => void,
            stepMs: number
        ) => {
            let out = "";
            for (const ch of source) {
                if (!active) return false;
                out += ch;
                setter(out);
                await sleep(stepMs);
            }
            return true;
        };

        setTitleText("");
        setShowLead(false);
        setShowSubLead(false);

        if (reducedMotion) {
            setTitleText(t.heroTitle);
            setShowLead(true);
            setShowSubLead(true);
            return () => {
                active = false;
            };
        }

        (async () => {
            await sleep(180);
            const titleDone = await stream(t.heroTitle, setTitleText, lang === "en" ? 18 : 32);
            if (!titleDone) return;
            leadTimer = setTimeout(() => {
                if (active) setShowLead(true);
            }, 220);
            subLeadTimer = setTimeout(() => {
                if (active) setShowSubLead(true);
            }, 460);
        })();

        return () => {
            active = false;
            if (leadTimer) clearTimeout(leadTimer);
            if (subLeadTimer) clearTimeout(subLeadTimer);
        };
    }, [lang, t.heroTitle]);

    return (
        <div className="hero-copy">
            <h1 className="text-gradient" style={{ lineHeight: 1.2, paddingBottom: 10 }}>
                {titleText}
                {titleText.length > 0 && titleText.length < t.heroTitle.length ? <span className="stream-caret">|</span> : null}
            </h1>
            <p className={`lead stream-fade ${showLead ? "visible" : ""}`} style={{ minHeight: lang === "en" ? 110 : 84 }}>
                {t.heroLead}
            </p>
            <p className={`lead muted stream-fade ${showSubLead ? "visible" : ""}`} style={{ minHeight: 32 }}>
                {t.subLead}
            </p>
        </div>
    );
}
