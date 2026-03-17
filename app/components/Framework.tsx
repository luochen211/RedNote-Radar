'use client';

import { useLanguage } from "../context/LanguageContext";
import Image from "next/image";

const copy = {
    en: {
        frameworkTitle: "Platform overview",
        frameworkText:
            "Upload video, cover, title and copy, then move through prediction, diagnostics and archive management in a single workflow.",
        architectureDiagram: "System flow diagram",
        desc: "This top section should help users understand the platform quickly before they enter the upload page.",
        cards: [
            { label: "Workflow", value: "Upload → Predict → Analyze" },
            { label: "Scopes", value: "Local / Global" },
            { label: "Style", value: "Glassmorphism UI" }
        ]
    },
    zh: {
        frameworkTitle: "平台总览",
        frameworkText:
            "上传视频、封面、标题和正文后，系统依次进入预测、诊断分析和历史归档，形成完整工作流。",
        architectureDiagram: "系统流程图",
        desc: "这一段用于在进入上传页前快速说明平台能力，而不是只展示研究架构。",
        cards: [
            { label: "工作流", value: "上传 → 预测 → 分析" },
            { label: "预测范围", value: "本号 / 全网" },
            { label: "视觉方向", value: "玻璃科技风" }
        ]
    },
};

export default function Framework() {
    const { lang } = useLanguage();
    const t = copy[lang];

    return (
        <section className="framework fade-up delay-1" id="flow">
            <div className="section-head">
                <div>
                    <h3>{t.frameworkTitle}</h3>
                    <p className="muted">{t.frameworkText}</p>
                    <p className="muted">{t.desc}</p>
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 18 }}>
                {t.cards.map((card) => (
                    <div key={card.label} className="glass" style={{ padding: 18, borderRadius: 18 }}>
                        <div className="muted tiny" style={{ marginBottom: 6 }}>{card.label}</div>
                        <div style={{ color: 'var(--text)', fontWeight: 700 }}>{card.value}</div>
                    </div>
                ))}
            </div>
            <div className="framework-img-wrapper" style={{ position: 'relative', width: '100%', height: 'auto', minHeight: '400px' }}>
                <Image
                    src="/framework.png"
                    alt="Model architecture"
                    width={1200}
                    height={600}
                    className="framework-img large"
                    style={{ width: '100%', height: 'auto', borderRadius: '14px', border: '1px solid var(--border)' }}
                    priority
                />
                <div className="caption">{t.architectureDiagram}</div>
            </div>
        </section>
    );
}
