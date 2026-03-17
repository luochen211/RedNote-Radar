'use client';

import { useLanguage } from "../context/LanguageContext";

const copy = {
    en: {
        heroTitle:
            "System workflow and intelligence modules",
        methodIntroTitle: "Workflow overview",
        methodIntroLead:
            "The current system focuses on a complete web flow: upload, prediction, analysis and archive. The interface should explain capabilities in business language rather than only research terminology.",
        methodDetail:
            "Each module maps to a visible user journey: what is uploaded, what the system infers, and how the result is displayed for decision making.",
        methodLong: [
            "Step 1. Upload the target video, optional cover image, title and text content.",
            "Step 2. The system extracts media metadata and text features from the uploaded materials.",
            "Step 3. Voice, sentiment, arousal and consistency indicators are generated based on the selected inputs.",
            "Step 4. Prediction and analysis pages display the structured results for this submission.",
            "Step 5. The final record is stored in History for later comparison and review."
        ],
        localGlobalTitle: "Frontend presentation focus",
        localGlobalDesc: "For the web page, the most important thing is to show upload input, analysis process and structured output in a way that matches the documentation.",
        localTag: "Input · Video / Audio / Text",
        globalTag: "Output · Scores / Consistency / DataFrame-style results",
    },
    zh: {
        heroTitle: "系统流程与智算模块",
        methodIntroTitle: "流程说明",
        methodIntroLead:
            "当前系统强调完整网页流程：上传、预测、分析与归档。界面表达应更贴近业务展示，而不是只停留在研究型术语。",
        methodDetail:
            "每个模块都应让用户看清楚输入了什么、系统分析了什么、最终返回了什么结果，便于演示和汇报。",
        methodLong: [
            "步骤 1：上传目标视频、可选封面、标题与正文内容。",
            "步骤 2：系统从上传素材中提取媒体元数据与文本特征。",
            "步骤 3：围绕输入内容生成语音、人声、情感、激活度与一致性指标。",
            "步骤 4：在预测页与分析页中展示本次提交的结构化结果。",
            "步骤 5：最终记录进入历史页，便于后续回看和对比。"
        ],
        localGlobalTitle: "前端展示重点",
        localGlobalDesc: "网页展示应重点突出上传输入、分析过程与结构化输出，并与文档中的字段说明保持一致。",
        localTag: "输入 · 视频 / 音频 / 文本",
        globalTag: "输出 · 分数 / 一致性 / 类 DataFrame 结果",
    },
};

export default function Methodology() {
    const { lang } = useLanguage();
    const t = copy[lang];

    return (
        <section className="overview fade-up delay-2" id="overview">
            <div className="section-head">
                <div>
                    <p className="pill accent">{t.methodIntroTitle}</p>
                    <h2>{t.heroTitle}</h2>
                    <p className="muted">{t.methodIntroLead}</p>
                    <p className="muted">{t.methodDetail}</p>
                </div>
            </div>
            <div className="method-columns single">
                <div className="method-stack">
                    {t.methodLong.map((line, idx) => (
                        <div key={idx} className="method-item">
                            <div className="method-index">{idx + 1}</div>
                            <div className="method-text">{line}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="local-global-row">
                <div className="local-global-title">{t.localGlobalTitle}</div>
                <div className="local-global-desc">{t.localGlobalDesc}</div>
                <div className="local-global-tags">
                    <span className="label-chip">{t.localTag}</span>
                    <span className="label-chip">{t.globalTag}</span>
                </div>
            </div>
        </section>
    );
}
