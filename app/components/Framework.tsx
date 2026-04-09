'use client';

import { useLanguage } from "../context/LanguageContext";
import Image from "next/image";

const copy = {
    en: {
        frameworkTitle: "Platform overview",
        frameworkText:
            "Upload video, cover, title and copy, then move through prediction, diagnostics and archive management in a single workflow.",
        architectureDiagram: "System flow diagram",
    },
    zh: {
        frameworkTitle: "平台总览",
        frameworkText:
            "上传视频、封面、标题和正文后，系统依次进入预测、诊断分析和历史归档，形成完整工作流。",
        architectureDiagram: "系统流程图",
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
                </div>
            </div>
            <div
                className="framework-img-wrapper"
                style={{
                    position: 'relative',
                    width: '100%',
                    height: 'auto',
                    minHeight: '400px',
                    padding: '18px 18px 22px',
                    borderRadius: '22px',
                    background: 'linear-gradient(180deg, rgba(8, 15, 28, 0.92) 0%, rgba(11, 19, 34, 0.98) 100%)',
                    border: '1px solid rgba(148, 163, 184, 0.14)',
                    boxShadow: '0 22px 48px rgba(2, 6, 23, 0.28)'
                }}
            >
                <Image
                    src="/framework.jpg?v=20260409-1"
                    alt="Model architecture"
                    width={3017}
                    height={1280}
                    className="framework-img large"
                    style={{ width: '100%', height: 'auto', borderRadius: '16px', border: '1px solid rgba(148, 163, 184, 0.12)' }}
                    unoptimized
                    priority
                />
                <div className="caption">{t.architectureDiagram}</div>
            </div>
        </section>
    );
}
