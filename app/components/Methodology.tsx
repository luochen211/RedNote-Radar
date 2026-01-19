'use client';

import { useLanguage } from "../context/LanguageContext";

const copy = {
    en: {
        heroTitle:
            "Video-based Social Media Marketing Analysis and Effectiveness Prediction",
        methodIntroTitle: "Method overview",
        methodIntroLead:
            "The Video-based Social Media Marketing Analysis and Effectiveness Prediction Model captures spatiotemporal features within video data modalities, mines semantic interaction information across different modalities, and integrates post attributes that attract user attention, thereby achieving more accurate prediction of user engagement on online platforms. This model comprises five integrated modules: (1) single-modal feature extraction module, (2) multimodal interaction module, (3) modal adaptive fusion module, (4) user attention module, and (5) engagement prediction module.",
        methodDetail:
            "Single-modal feature extraction module processes post content in three modalities: VGG for visual features from frames, VGGish for audio features, and BERT for token-level text features. For video and audio modalities, separate spatio-temporal CNNs capture intra-modality spatio-temporal interactions—temporal dynamics across frames and spatial correlations within frames. For text, a semantic attention layer extracts contextual relationships between adjacent words.",
        methodLong: [
            "Single-modal feature extraction module processes post content in three modalities: VGG for visual features from frames, VGGish for audio features, and BERT for token-level text features. For video and audio modalities, separate spatio-temporal CNNs capture intra-modality spatio-temporal interactions—temporal dynamics across frames and spatial correlations within frames. For text, a semantic attention layer extracts contextual relationships between adjacent words.",
            "The multimodal interaction module processes outputs from the single-modal extractors to enable cross-modal interactions. It specifically models relationships between text and other modalities using two dedicated layers: an audio-text cross-attention layer and a text-video cross-attention layer. This captures complementary information to enhance overall post understanding.",
            "The modal adaptive fusion module receives three types of modality features output by the multimodal interaction module, and uses an adaptive feature fusion method to determine the relative importance thresholds of different modality features, so as to optimize the final multimodal representation.",
            "The user attention module integrates multimodal fused features with user-attended engagement indicators (visual appeal, textual appeal, content congruence, account portrait) to enhance engagement prediction. It analyzes post similarity patterns through multimodal feature consistency to identify eye-catching presentation formats. By combining content information with these attention-shaping factors, the module refines the model’s focus on behaviorally relevant signals, improving prediction accuracy for short-form video posts.",
            "Finally, the engagement prediction module is a classifier composed of multilayer perceptron. The multimodal fusion feature is fed into the classifier which outputs predicted user engagement scores for social media video posts.",
        ],
        localGlobalTitle: "Local vs Global engagement",
        localGlobalDesc: "Local scope benchmarks Hotel Icon historical likes; Global scope benchmarks official hotel accounts across Xiaohongshu. Both delivered by one classifier head.",
        localTag: "Local · Hotel Icon history",
        globalTag: "Global · Industry-leading range",
    },
    zh: {
        heroTitle: "面向短视频的社交媒体营销分析与效果预测",
        methodIntroTitle: "方法介绍",
        methodIntroLead:
            "面向短视频的社交媒体营销分析与效果预测模型捕捉视频数据模态内的时空特征，挖掘不同模态间的语义交互信息，并整合吸引用户注意的帖子属性，从而实现对在线平台用户参与度的更精准预测。该模型包含五个集成模块：（1）单模态特征提取模块，（2）多模态交互模块，（3）模态自适应融合模块，（4）用户注意模块，以及（5）互动预测模块。",
        methodDetail:
            "单模态特征提取模块处理三种模态的帖子内容：用于帧视觉特征的VGG，用于音频特征的VGGish，以及用于词级文本特征的BERT。对于视频和音频模态，独立的时空CNN捕捉模态内的时空交互——跨帧的时间动态和帧内的空间相关性。对于文本，语义注意力层提取相邻词之间的上下文关系。",
        methodLong: [
            "单模态特征提取模块处理三种模态的帖子内容：用于帧视觉特征的VGG，用于音频特征的VGGish，以及用于词级文本特征的BERT。对于视频和音频模态，独立的时空CNN捕捉模态内的时空交互——跨帧的时间动态和帧内的空间相关性。对于文本，语义注意力层提取相邻词之间的上下文关系。",
            "多模态交互模块处理单模态提取器的输出，从而实现跨模态交互。它专门使用两个专用层对文本与其他模态之间的关系进行建模：音频-文本交叉注意力层和文本-视频交叉注意力层。这有助于捕捉互补信息，增强对帖子的整体理解。",
            "模态自适应融合模块接收多模态交互模块输出的三种模态特征，并采用自适应特征融合方法来确定不同模态特征的相对重要性阈值，从而优化最终的多模态表征。",
            "用户注意模块将多模态融合特征与用户关注的互动指标（视觉吸引力、文本吸引力、内容一致性、账号画像）相结合，以增强互动预测。它通过多模态特征一致性分析帖子的相似性模式，识别引人注目的呈现形式。通过将内容信息与这些注意力塑造因素相结合，该模块细化了模型对行为相关信号的关注，提高了短视频帖子预测的准确性。",
            "最后，互动预测模块是一个由多层感知机组成的分类器。多模态融合特征被输入到分类器中，输出预测的社交媒体视频帖子用户互动分数。",
        ],
        localGlobalTitle: "本地 vs 全局互动",
        localGlobalDesc: "本地范围对标 Hotel Icon 历史点赞，全局范围对标小红书官方酒店账号行业领先区间，统一分类头输出。",
        localTag: "本地 · Hotel Icon 历史基准",
        globalTag: "全局 · 行业领先区间",
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
                    <p className="muted" style={{ lineHeight: 1.8, fontSize: '1.05rem', marginTop: 16 }}>{t.methodDetail}</p>
                </div>
            </div>
            <div className="method-columns single">
                <div className="method-stack">
                    {t.methodLong.map((line, idx) => (
                        <div key={idx} className="method-item">
                            <div className="method-index" style={{
                                fontSize: 24,
                                fontWeight: 'bold',
                                color: '#6ae3ff',
                                border: '1px solid rgba(106, 227, 255, 0.3)',
                                background: 'rgba(106, 227, 255, 0.1)',
                                borderRadius: '12px',
                                display: 'grid',
                                placeItems: 'center',
                                width: 48,
                                height: 48,
                                flexShrink: 0
                            }}>{idx + 1}</div>
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
