'use client';

import { useLanguage } from "../context/LanguageContext";
import Image from "next/image";

const copy = {
    en: {
        frameworkTitle: "Model flow at a glance",
        frameworkText:
            "Visual frames + audio tracks + text tokens → cross-modal attention → adaptive fusion → attention-weighted features → engagement classifier.",
        architectureDiagram: "Architecture diagram",
        desc: "Architecture snapshot that powers the Hotel Video InsightHub experience.",
    },
    zh: {
        frameworkTitle: "流程速览",
        frameworkText:
            "视频帧 + 音频轨 + 文本 → 跨模态注意力 → 自适应融合 → 注意力加权特征 → 互动度分类器。",
        architectureDiagram: "架构图示意",
        desc: "支撑酒店短视频智算台体验的模型流程速览。",
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
