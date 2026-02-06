'use client';

import { useLanguage } from "../context/LanguageContext";
import { useMemo } from "react";

const copy = {
    en: {
        modulesTitle: "Five-module architecture",
        modulesSubtitle: "From multimodal signals to accurate engagement scoring",
    },
    zh: {
        modulesTitle: "五大模块架构",
        modulesSubtitle: "从多模态信号到精准互动预测",
    },
};

interface ModuleItem {
    title: string;
    zhTitle: string;
    detail: string;
    zhDetail: string;
}

const modules: ModuleItem[] = [
    {
        title: "Single-modal extraction",
        zhTitle: "单模态特征提取",
        detail: "VGG (visual), VGGish (audio), BERT (text) capture rich base signals.",
        zhDetail: "利用 VGG（视觉）、VGGish（音频）、BERT（文本）提取丰富的基础信号。"
    },
    {
        title: "Multimodal interaction",
        zhTitle: "多模态交互",
        detail: "Audio-text and text-video cross-attention to align semantics.",
        zhDetail: "利用音文和文视交叉注意力机制对齐语义。"
    },
    {
        title: "Adaptive fusion",
        zhTitle: "自适应融合",
        detail: "Learned thresholds weight each modality for optimal representation.",
        zhDetail: "学习阈值对各模态进行加权，以实现最佳表征。"
    },
    {
        title: "User attention layer",
        zhTitle: "用户注意模块",
        detail:
            "Blends fused features with attention factors (appeal, congruence, portrait).",
        zhDetail: "融合特征与注意力因子（吸引力、一致性、画像）。"
    },
    {
        title: "Engagement prediction",
        zhTitle: "互动度预测",
        detail: "MLP classifier outputs local and global engagement probabilities.",
        zhDetail: "MLP 分类器输出局部和全局互动概率。"
    },
];

export default function Modules() {
    const { lang } = useLanguage();
    const t = copy[lang];

    const moduleTitle = useMemo(
        () => (lang === "en" ? (item: ModuleItem) => item.title : (item: ModuleItem) => item.zhTitle),
        [lang]
    );

    const moduleDetail = useMemo(
        () => (lang === "en" ? (item: ModuleItem) => item.detail : (item: ModuleItem) => item.zhDetail),
        [lang]
    );

    return (
        <section className="modules glass fade-up delay-3" id="architecture">
            <div className="section-head">
                <div>
                    <h2>{t.modulesTitle}</h2>
                    <p className="muted">{t.modulesSubtitle}</p>
                </div>
            </div>
            <div className="module-grid">
                {modules.map((item, idx) => (
                    <div key={item.title} className="module-card sheen-effect">
                        <div className="module-header">
                            <span className="module-number">{idx + 1}</span>
                            <h4 className="module-title">{moduleTitle(item)}</h4>
                        </div>
                        <p className="module-desc">{moduleDetail(item)}</p>
                    </div>
                ))}
            </div>
            <style jsx>{`
        .module-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            padding: 10px;
        }
        .module-card {
            background: rgba(255, 255, 255, 0.78);
            border: 1px solid rgba(2, 132, 199, 0.16);
            border-radius: 12px;
            padding: 20px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        .module-card:hover {
            transform: translateY(-5px);
            background: rgba(255, 255, 255, 0.94);
            border-color: rgba(2, 132, 199, 0.3);
            box-shadow: 0 12px 28px rgba(2, 132, 199, 0.12);
        }
        .module-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at top right, rgba(2, 132, 199, 0.12), transparent 60%);
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .module-card:hover::before {
            opacity: 1;
        }
        .module-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
        }
        .module-number {
            font-size: 24px;
            font-weight: 800;
            color: rgba(2, 132, 199, 0.58);
            font-family: monospace;
        }
        .module-title {
            margin: 0;
            font-size: 18px;
            color: var(--text);
            font-weight: 600;
        }
        .module-desc {
            color: var(--muted);
            font-size: 14px;
            line-height: 1.6;
            margin: 0;
        }
      `}</style>
        </section>
    );
}
