'use client';

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { useLanguage } from "../../context/LanguageContext";

type AnalysisData = {
  quality: {
    aesthetic: string;
    readability: string;
    coverQuality: string;
    coverAesthetic: string;
    voice: string;
    face: string;
  };
  sentiment: {
    title: string;
    text: string;
    textArousal: string;
    audio: string;
    audioArousal: string;
  };
  consistency: {
    titleTags: string;
    titleCover: string;
    titleVideo: string;
    textAudio: string;
    textVideo: string;
    videoAudio: string;
  };
  orientalAesthetics: {
    richness: number;
    harmony: number;
    adaption: number;
    modern: number;
    oriental: number;
    western: number;
  };
};

type ResultData = {
  source?: string;
  engagementScore?: {
    local: number;
    global: number;
  };
  analysis: AnalysisData;
};

type SubmissionInput = {
  title?: string;
  textContent?: string;
  tags?: string[];
  videoName?: string;
  coverPath?: string;
};

type DiagnosticStep = {
  priority: string;
  tag: string;
  title: string;
  detail: string;
};

type MetricTabKey = "quality" | "sentiment" | "consistency" | "oriental";

const copy = {
  en: {
    loading: "Loading analysis report...",
    fetchError: "Failed to load analysis result",
    pageLabel: "AI Diagnosis Report",
    pageTitle: "Hotel Video InsightHub",
    pageIntro: "Turn structured indicators into a management-ready video diagnosis and an execution plan.",
    currentUpload: "Current upload",
    reportSource: "Actual upload analysis",
    fallbackTitle: "Untitled submission",
    summaryLabel: "Executive Summary",
    coreProblemLabel: "Core Problem",
    roiLabel: "Expected ROI",
    dimensionsLabel: "Dimension Analysis",
    audienceLabel: "Audience Persona",
    platformLabel: "Primary Platform",
    actionsLabel: "Action Plan",
    metricsLabel: "Underlying Metrics",
    scoreLocal: "Local score",
    scoreGlobal: "Global score",
    metricQuality: "Content quality",
    metricSentiment: "Sentiment signals",
    metricConsistency: "Consistency",
    metricOriental: "Eastern aesthetics",
    qualityAesthetic: "Video aesthetics",
    qualityReadability: "Text readability",
    qualityCover: "Cover quality",
    qualityCoverAesthetic: "Cover aesthetics",
    qualityVoice: "Human voice",
    qualityFace: "Human face",
    sentimentTitle: "Title sentiment",
    sentimentText: "Text sentiment",
    sentimentTextArousal: "Text arousal",
    sentimentAudio: "Audio sentiment",
    sentimentAudioArousal: "Audio arousal",
    consistencyTitleTags: "Title-tags consistency",
    consistencyTitleCover: "Title-cover consistency",
    consistencyTitleVideo: "Title-video consistency",
    consistencyTextAudio: "Text-audio consistency",
    consistencyTextVideo: "Text-video consistency",
    consistencyVideoAudio: "Video-audio consistency",
    orientalRichness: "Richness",
    orientalHarmony: "Harmony",
    orientalAdaption: "Adaption",
    orientalModern: "Modern",
    orientalOriental: "Eastern",
    orientalWestern: "Western",
    personaReasoningLabel: "Why this audience",
    platformReasoningLabel: "Why this platform",
    statusReady: "Report generated",
    statusModel: "Derived from real metrics",
    noText: "No long caption provided",
  },
  zh: {
    loading: "正在生成分析报告...",
    fetchError: "分析结果加载失败",
    pageLabel: "AI 诊断报告",
    pageTitle: "酒店短视频智算平台",
    pageIntro: "将结构化指标转成可汇报、可执行、可复盘的酒店短视频诊断报告。",
    currentUpload: "当前上传内容",
    reportSource: "实际上传分析",
    fallbackTitle: "未命名提交",
    summaryLabel: "执行摘要",
    coreProblemLabel: "核心问题",
    roiLabel: "预期收益",
    dimensionsLabel: "多维度深度剖析",
    audienceLabel: "目标受众画像",
    platformLabel: "优选平台",
    actionsLabel: "优化处方与执行清单",
    metricsLabel: "底层指标工作台",
    scoreLocal: "本号预测",
    scoreGlobal: "全网预测",
    metricQuality: "内容质量",
    metricSentiment: "情绪信号",
    metricConsistency: "一致性",
    metricOriental: "东方美学",
    qualityAesthetic: "视频美学评分",
    qualityReadability: "文本可读性",
    qualityCover: "封面图像质量分",
    qualityCoverAesthetic: "封面美学评分",
    qualityVoice: "人声存在",
    qualityFace: "人脸存在",
    sentimentTitle: "标题情感分",
    sentimentText: "文本情感分",
    sentimentTextArousal: "文本激活度",
    sentimentAudio: "音频情感分",
    sentimentAudioArousal: "音频激活度",
    consistencyTitleTags: "标题-标签内容一致性",
    consistencyTitleCover: "标题-封面内容一致性",
    consistencyTitleVideo: "标题-视频内容一致性",
    consistencyTextAudio: "文本-音频情感一致性",
    consistencyTextVideo: "文本-视频情感一致性",
    consistencyVideoAudio: "视频-音频情感一致性",
    orientalRichness: "丰富度",
    orientalHarmony: "和谐度",
    orientalAdaption: "适配度",
    orientalModern: "现代",
    orientalOriental: "东方",
    orientalWestern: "西方",
    personaReasoningLabel: "判断依据",
    platformReasoningLabel: "平台逻辑",
    statusReady: "报告已生成",
    statusModel: "基于真实指标推导",
    noText: "未提供长文案",
  },
} as const;

function numberValue(input: string | number | undefined) {
  if (typeof input === "number") return input;
  if (!input) return 0;
  return Number(String(input).replace("%", "")) || 0;
}

function percentText(value: number) {
  return `${Math.round(value)}%`;
}

function toFixedText(value: number) {
  return Number(value).toFixed(2);
}

function isPositiveFlag(value: string | undefined) {
  if (!value) return false;
  return value.toLowerCase() === "yes" || value.toLowerCase() === "likely";
}

function buildDiagnosis(data: AnalysisData, result: ResultData | null, lang: "zh" | "en") {
  const aesthetic = numberValue(data.quality.aesthetic);
  const readability = numberValue(data.quality.readability);
  const coverQuality = numberValue(data.quality.coverQuality);
  const coverAesthetic = numberValue(data.quality.coverAesthetic);
  const titleVideo = numberValue(data.consistency.titleVideo);
  const textVideo = numberValue(data.consistency.textVideo);
  const textAudio = numberValue(data.consistency.textAudio);
  const audioArousal = numberValue(data.sentiment.audioArousal);
  const textArousal = numberValue(data.sentiment.textArousal);
  const harmony = data.orientalAesthetics.harmony;
  const richness = data.orientalAesthetics.richness;
  const oriental = data.orientalAesthetics.oriental;
  const western = data.orientalAesthetics.western;
  const modern = data.orientalAesthetics.modern;
  const hasVoice = isPositiveFlag(data.quality.voice);
  const hasFace = isPositiveFlag(data.quality.face);
  const globalScore = result?.engagementScore?.global ?? 0;
  const localScore = result?.engagementScore?.local ?? 0;

  const strongestVisual = coverQuality >= 75 && aesthetic >= 70;
  const titleGap = titleVideo < 45;
  const emotionGap = !hasVoice || textAudio < 65 || audioArousal < 55;
  const readabilityGap = readability < 55;

  if (lang === "zh") {
    const conclusion = strongestVisual
      ? `该视频具备较强种草潜力，视觉完成度突出，但仍存在影响分发效率的结构性短板。`
      : `该视频具备基础传播能力，但画面抓手和内容表达尚未形成高端酒店内容应有的完成度。`;

    const coreProblem = titleGap
      ? `标题与视频内容一致性仅 ${percentText(titleVideo)}，前几秒的信息承诺与实际画面存在断裂，容易拉高跳出率。`
      : emotionGap
        ? `情绪唤起链路偏弱，${hasVoice ? "虽有人声" : "缺少人声"}且文音一致性仅 ${percentText(textAudio)}，信任感和代入感不够。`
        : `当前瓶颈主要在文案表达层，文本可读性为 ${percentText(readability)}，信息密度与转化表达仍偏“通稿化”。`;

    const expectedRoi = titleGap || emotionGap
      ? `优先修正标题承诺与情绪引导后，预计可提升 ${percentText(Math.max(globalScore * 0.18, 18))}-${percentText(Math.max(globalScore * 0.32, 30))} 的完播与互动效率。`
      : `在保留当前视觉优势的前提下，补齐文案与节奏，预计可继续放大 ${percentText(Math.max(globalScore * 0.12, 12))}-${percentText(Math.max(globalScore * 0.22, 22))} 的互动空间。`;

    const targetGroup =
      harmony >= 0.72 && richness >= 0.62
        ? "追求审美秩序与度假松弛感的一二线城市女性客群。"
        : modern >= oriental && modern >= western
          ? "偏好现代设计、效率决策的都市商旅与轻奢消费人群。"
          : oriental > western
            ? "偏好在地文化、东方审美与仪式感住宿体验的人群。"
            : "更关注氛围感与生活方式表达的泛旅行内容受众。";

    const targetReasoning = `画面和谐度 ${toFixedText(harmony)}、丰富度 ${toFixedText(richness)}，${
      modern >= oriental && modern >= western
        ? `同时现代倾向 ${toFixedText(modern)} 更强，说明内容更容易吸引重设计感与品质效率的人群。`
        : oriental > western
          ? `东方文化倾向 ${toFixedText(oriental)} 高于西方倾向 ${toFixedText(western)}，更适合承接高质感在地体验心智。`
          : `整体风格没有明显东方文化优势，更适合走氛围种草和场景消费路线。`
    }`;

    const platform =
      coverQuality >= 75 && harmony >= 0.68
        ? "小红书"
        : hasVoice && audioArousal >= 60 && textArousal >= 60
          ? "抖音"
          : "视频号";

    const platformReasoning =
      platform === "小红书"
        ? `封面质量 ${percentText(coverQuality)}、画面和谐度 ${toFixedText(harmony)}，更适合依靠封面点击与搜索长尾承接种草流量。`
        : platform === "抖音"
          ? `音频激活度 ${percentText(audioArousal)}、文本激活度 ${percentText(textArousal)} 具备更强的滑动场景抓手，适合快节奏分发。`
          : `整体内容偏稳态表达，适合在熟人传播与品牌私域链路中承接信任型曝光。`;

    const dimensions = [
      {
        title: "视觉与美学",
        body: `视频美学 ${percentText(aesthetic)}、封面质量 ${percentText(coverQuality)}、封面美学 ${percentText(coverAesthetic)}。${
          strongestVisual
            ? "画面有足够的高端感和第一眼抓手，适合承担酒店产品的溢价表达。"
            : "目前视觉抓手还不够尖锐，封面与首屏还需要更明确地承载卖点。"
        }`,
      },
      {
        title: "叙事与一致性",
        body: `标题-视频一致性 ${percentText(titleVideo)}、文本-视频一致性 ${percentText(textVideo)}。${
          titleGap
            ? "最大风险不是内容差，而是承诺错位，平台很难准确识别内容标签。"
            : "主叙事链路基本成立，但还可以进一步压缩无效信息，让卖点更早出现。"
        }`,
      },
      {
        title: "情感与沉浸感",
        body: `文本-音频一致性 ${percentText(textAudio)}、音频激活度 ${percentText(audioArousal)}。${
          emotionGap
            ? "目前情绪唤起偏弱，缺少带人进入场景的声音或旁白。"
            : "情绪链路较完整，后续重点是把沉浸感进一步转化为评论和收藏动作。"
        }`,
      },
    ];

    const steps: DiagnosticStep[] = [];

    steps.push(
      titleGap
        ? {
            priority: "P0",
            tag: "内容重构",
            title: "先修标题与首屏承诺",
            detail: `标题-视频一致性只有 ${percentText(titleVideo)}。先把标题改成与画面主卖点直接对应的写实表达，避免“悬念式标题”造成无效点击。`,
          }
        : {
            priority: "P0",
            tag: "结构优化",
            title: "把核心卖点提前到前 3 秒",
            detail: `当前标题与视频基本对齐，下一步应压缩铺垫，让最强场景和最强房型信息更早出现，继续提升首屏留存。`,
          }
    );

    steps.push(
      emotionGap
        ? {
            priority: "P1",
            tag: "视听优化",
            title: hasVoice ? "增强原声层次与情绪设计" : "补充旁白或环境原声",
            detail: `${hasVoice ? "虽然已有音轨，但" : ""}文本-音频一致性为 ${percentText(textAudio)}，音频激活度 ${percentText(audioArousal)}。建议加入开门、落座、窗景、浴缸等场景原声，必要时补轻旁白。`,
          }
        : {
            priority: "P1",
            tag: "节奏优化",
            title: "强化镜头切换与情绪峰值",
            detail: `当前情绪链路基础较好，建议增加 1-2 个明显的情绪峰值镜头，把观众从“看完”推向“想收藏/想咨询”。`,
          }
    );

    steps.push(
      readabilityGap
        ? {
            priority: "P2",
            tag: "文案重写",
            title: "把正文从酒店通稿改成用户视角",
            detail: `文本可读性仅 ${percentText(readability)}。建议缩短句长，直接提炼 3 个记忆点，用“我住到的感受”替代“酒店官方介绍”。`,
          }
        : {
            priority: "P2",
            tag: "平台运营",
            title: "按平台心智重排文案与标签",
            detail: `在可读性基础尚可的情况下，应围绕 ${platform} 的分发逻辑重新编排标题、正文和标签，保证点击心智与搜索心智统一。`,
          }
    );

    return {
      conclusion,
      coreProblem,
      expectedRoi,
      targetGroup,
      targetReasoning,
      platform,
      platformReasoning,
      dimensions,
      steps,
      highlightStats: [
        { label: "本号预测", value: percentText(localScore) },
        { label: "全网预测", value: percentText(globalScore) },
        { label: "标题-视频一致性", value: percentText(titleVideo) },
        { label: "封面质量", value: percentText(coverQuality) },
      ],
    };
  }

  const conclusion = strongestVisual
    ? "The video has real seeding potential with strong visual polish, but structural issues are still limiting distribution efficiency."
    : "The video has baseline distribution potential, but its visual hook and message framing are not yet premium enough.";

  const coreProblem = titleGap
    ? `Title-to-video consistency is only ${percentText(titleVideo)}, so the promise made up front is not aligned with the actual footage.`
    : emotionGap
      ? `The emotional layer is weak: voice presence is ${hasVoice ? "available" : "missing"} and text-audio consistency is only ${percentText(textAudio)}.`
      : `The main bottleneck is still copy expression, with text readability at ${percentText(readability)}.`;

  const expectedRoi = titleGap || emotionGap
    ? `Fixing the promise gap and emotional guidance should unlock roughly ${percentText(Math.max(globalScore * 0.18, 18))}-${percentText(Math.max(globalScore * 0.32, 30))} better completion and interaction efficiency.`
    : `With the current visual advantage preserved, refining copy and pacing should still unlock ${percentText(Math.max(globalScore * 0.12, 12))}-${percentText(Math.max(globalScore * 0.22, 22))} more engagement headroom.`;

  const targetGroup =
    harmony >= 0.72 && richness >= 0.62
      ? "Urban female travelers seeking calm luxury and visual order."
      : modern >= oriental && modern >= western
        ? "Design-led business and premium lifestyle travelers."
        : oriental > western
          ? "Travelers who value local culture and an Eastern sense of ritual."
          : "Lifestyle-driven travel audiences focused on atmosphere.";

  const targetReasoning = `Harmony is ${toFixedText(harmony)} and richness is ${toFixedText(richness)}. ${
    modern >= oriental && modern >= western
      ? `Modern orientation at ${toFixedText(modern)} suggests stronger appeal to design and efficiency-driven viewers.`
      : oriental > western
        ? `Eastern orientation at ${toFixedText(oriental)} is higher than Western at ${toFixedText(western)}, which supports local-culture positioning.`
        : `The style leans more toward general atmosphere than a distinct cultural narrative.`
  }`;

  const platform =
    coverQuality >= 75 && harmony >= 0.68
      ? "Xiaohongshu"
      : hasVoice && audioArousal >= 60 && textArousal >= 60
        ? "Douyin"
        : "WeChat Video";

  const platformReasoning =
    platform === "Xiaohongshu"
      ? `Cover quality at ${percentText(coverQuality)} and harmony at ${toFixedText(harmony)} fit click-through and search-driven seeding better than fast-feed entertainment.`
      : platform === "Douyin"
        ? `Audio arousal at ${percentText(audioArousal)} and text arousal at ${percentText(textArousal)} are better suited to fast-scroll distribution.`
        : `The video currently reads as a steadier brand expression and is better aligned with trust-based exposure.`;

  return {
    conclusion,
    coreProblem,
    expectedRoi,
    targetGroup,
    targetReasoning,
    platform,
    platformReasoning,
    dimensions: [
      {
        title: "Visual Aesthetics",
        body: `Video aesthetics is ${percentText(aesthetic)}, cover quality is ${percentText(coverQuality)}, and cover aesthetics is ${percentText(coverAesthetic)}. ${
          strongestVisual
            ? "The visual layer already carries premium hotel value."
            : "The visual hook still needs to be sharper in the cover and early frames."
        }`,
      },
      {
        title: "Narrative Logic",
        body: `Title-video consistency is ${percentText(titleVideo)} and text-video consistency is ${percentText(textVideo)}. ${
          titleGap
            ? "The issue is not weak content but a mismatched promise."
            : "The narrative structure works, but the strongest selling point should surface earlier."
        }`,
      },
      {
        title: "Emotional Resonance",
        body: `Text-audio consistency is ${percentText(textAudio)} and audio arousal is ${percentText(audioArousal)}. ${
          emotionGap
            ? "The emotional bridge into the scene is still too weak."
            : "The emotional chain is in place and can be pushed toward more saves and comments."
        }`,
      },
    ],
    steps: [
      titleGap
        ? {
            priority: "P0",
            tag: "Content",
            title: "Rewrite the opening promise",
            detail: `Title-video consistency is only ${percentText(titleVideo)}. Replace vague curiosity hooks with a direct statement of the real visual payoff.`,
          }
        : {
            priority: "P0",
            tag: "Structure",
            title: "Move the strongest scene into the first 3 seconds",
            detail: "The content is aligned enough. The next gain comes from surfacing the strongest room or view earlier.",
          },
      emotionGap
        ? {
            priority: "P1",
            tag: "Audio",
            title: hasVoice ? "Increase sonic texture" : "Add voice or environmental sound",
            detail: `Text-audio consistency is ${percentText(textAudio)} and audio arousal is ${percentText(audioArousal)}. Layer in opening, walking, water, or window-side sound cues.`,
          }
        : {
            priority: "P1",
            tag: "Pacing",
            title: "Add one stronger emotional peak",
            detail: "The emotional base is working. Add one clearer release moment to drive saves and comments.",
          },
      readabilityGap
        ? {
            priority: "P2",
            tag: "Copy",
            title: "Rewrite the caption from the traveler perspective",
            detail: `Readability is only ${percentText(readability)}. Shorten sentences and reduce brochure-style description.`,
          }
        : {
            priority: "P2",
            tag: "Ops",
            title: "Re-sequence copy for platform fit",
            detail: `The copy foundation is acceptable. Now optimize title, caption, and tags specifically for ${platform}.`,
          },
    ],
    highlightStats: [
      { label: "Local score", value: percentText(localScore) },
      { label: "Global score", value: percentText(globalScore) },
      { label: "Title-video", value: percentText(titleVideo) },
      { label: "Cover quality", value: percentText(coverQuality) },
    ],
  };
}

function MetricGrid({
  items,
}: {
  items: { label: string; value: string }[];
}) {
  return (
    <div className="diagnosis-metric-grid">
      {items.map((item) => (
        <article key={item.label} className="diagnosis-metric-card">
          <div className="diagnosis-metric-label">{item.label}</div>
          <div className="diagnosis-metric-value">{item.value}</div>
        </article>
      ))}
    </div>
  );
}

export default function AnalysisPage({ params }: { params: { id: string } }) {
  const { lang } = useLanguage();
  const t = copy[lang];
  const [activeTab, setActiveTab] = useState<MetricTabKey>("quality");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResultData | null>(null);
  const [submissionInput, setSubmissionInput] = useState<SubmissionInput | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/tasks/${params.id}`);
        if (!res.ok) {
          setError(t.fetchError);
          setLoading(false);
          return;
        }

        const json = await res.json();
        if (json.status === "COMPLETED" && json.resultData) {
          const parsedResult = JSON.parse(json.resultData) as ResultData;
          const input = json.inputData ? (JSON.parse(json.inputData) as SubmissionInput) : null;
          setResult(parsedResult);
          setSubmissionInput(input);
          setLoading(false);
          return;
        }

        setError(t.fetchError);
        setLoading(false);
      } catch (requestError) {
        console.error(requestError);
        setError(t.fetchError);
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, t.fetchError]);

  if (loading || !result?.analysis) {
    return (
      <div className="page workspace-page workspace-soft analysis-page diagnosis-page">
        <Navbar />
        <section className="diagnosis-loading-panel">
          <div className="spinner" />
          <p className="muted">{error || t.loading}</p>
        </section>
      </div>
    );
  }

  const diagnosis = buildDiagnosis(result.analysis, result, lang);
  const tabItems: Record<MetricTabKey, { title: string; items: { label: string; value: string }[] }> = {
    quality: {
      title: t.metricQuality,
      items: [
        { label: t.qualityAesthetic, value: result.analysis.quality.aesthetic },
        { label: t.qualityReadability, value: result.analysis.quality.readability },
        { label: t.qualityCover, value: result.analysis.quality.coverQuality },
        { label: t.qualityCoverAesthetic, value: result.analysis.quality.coverAesthetic },
        { label: t.qualityVoice, value: result.analysis.quality.voice },
        { label: t.qualityFace, value: result.analysis.quality.face },
      ],
    },
    sentiment: {
      title: t.metricSentiment,
      items: [
        { label: t.sentimentTitle, value: result.analysis.sentiment.title },
        { label: t.sentimentText, value: result.analysis.sentiment.text },
        { label: t.sentimentTextArousal, value: result.analysis.sentiment.textArousal },
        { label: t.sentimentAudio, value: result.analysis.sentiment.audio },
        { label: t.sentimentAudioArousal, value: result.analysis.sentiment.audioArousal },
      ],
    },
    consistency: {
      title: t.metricConsistency,
      items: [
        { label: t.consistencyTitleTags, value: result.analysis.consistency.titleTags },
        { label: t.consistencyTitleCover, value: result.analysis.consistency.titleCover },
        { label: t.consistencyTitleVideo, value: result.analysis.consistency.titleVideo },
        { label: t.consistencyTextAudio, value: result.analysis.consistency.textAudio },
        { label: t.consistencyTextVideo, value: result.analysis.consistency.textVideo },
        { label: t.consistencyVideoAudio, value: result.analysis.consistency.videoAudio },
      ],
    },
    oriental: {
      title: t.metricOriental,
      items: [
        { label: t.orientalRichness, value: toFixedText(result.analysis.orientalAesthetics.richness) },
        { label: t.orientalHarmony, value: toFixedText(result.analysis.orientalAesthetics.harmony) },
        { label: t.orientalAdaption, value: toFixedText(result.analysis.orientalAesthetics.adaption) },
        { label: t.orientalModern, value: toFixedText(result.analysis.orientalAesthetics.modern) },
        { label: t.orientalOriental, value: toFixedText(result.analysis.orientalAesthetics.oriental) },
        { label: t.orientalWestern, value: toFixedText(result.analysis.orientalAesthetics.western) },
      ],
    },
  };

  return (
    <div className="page workspace-page workspace-soft analysis-page diagnosis-page">
      <Navbar />

      <section className="diagnosis-hero">
        <div className="diagnosis-hero-copy">
          <div className="diagnosis-kicker">{t.pageLabel}</div>
          <h1>{submissionInput?.title || t.fallbackTitle}</h1>
          <p>{t.pageIntro}</p>
          <div className="diagnosis-status-row">
            <span className="diagnosis-status-chip">{t.statusReady}</span>
            <span className="diagnosis-status-chip subtle">{t.statusModel}</span>
          </div>
        </div>

        <div className="diagnosis-hero-panel">
          <div className="diagnosis-panel-label">{t.currentUpload}</div>
          <div className="diagnosis-panel-title">{submissionInput?.videoName || submissionInput?.title || t.fallbackTitle}</div>
          <div className="diagnosis-panel-copy">{submissionInput?.textContent || t.noText}</div>
          {(submissionInput?.tags?.length ?? 0) > 0 && (
            <div className="diagnosis-tag-row">
              {submissionInput?.tags?.map((tag) => (
                <span key={tag} className="diagnosis-tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="diagnosis-report-grid">
        <article className="diagnosis-summary-card">
          <div className="diagnosis-section-label">{t.summaryLabel}</div>
          <h2>{diagnosis.conclusion}</h2>
          <div className="diagnosis-summary-split">
            <div>
              <div className="diagnosis-sub-label">{t.coreProblemLabel}</div>
              <p>{diagnosis.coreProblem}</p>
            </div>
            <div>
              <div className="diagnosis-sub-label">{t.roiLabel}</div>
              <p>{diagnosis.expectedRoi}</p>
            </div>
          </div>
        </article>

        <aside className="diagnosis-highlight-panel">
          {diagnosis.highlightStats.map((item) => (
            <div key={item.label} className="diagnosis-highlight-item">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </aside>
      </section>

      {submissionInput?.coverPath && (
        <section className="diagnosis-cover-strip">
          <img src={submissionInput.coverPath} alt={submissionInput.title || "cover"} />
          <div className="diagnosis-cover-copy">
            <div className="diagnosis-section-label">{t.reportSource}</div>
            <h3>{t.pageTitle}</h3>
            <p>{diagnosis.conclusion}</p>
          </div>
        </section>
      )}

      <section className="diagnosis-detail-grid">
        <article className="diagnosis-card">
          <div className="diagnosis-section-label">{t.dimensionsLabel}</div>
          <div className="diagnosis-dimension-list">
            {diagnosis.dimensions.map((item) => (
              <div key={item.title} className="diagnosis-dimension-item">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </article>

        <div className="diagnosis-side-stack">
          <article className="diagnosis-card compact">
            <div className="diagnosis-section-label">{t.audienceLabel}</div>
            <h3>{diagnosis.targetGroup}</h3>
            <div className="diagnosis-sub-label">{t.personaReasoningLabel}</div>
            <p>{diagnosis.targetReasoning}</p>
          </article>

          <article className="diagnosis-card compact">
            <div className="diagnosis-section-label">{t.platformLabel}</div>
            <h3>{diagnosis.platform}</h3>
            <div className="diagnosis-sub-label">{t.platformReasoningLabel}</div>
            <p>{diagnosis.platformReasoning}</p>
          </article>
        </div>
      </section>

      <section className="diagnosis-card">
        <div className="diagnosis-section-label">{t.actionsLabel}</div>
        <div className="diagnosis-action-grid">
          {diagnosis.steps.map((step) => (
            <article key={`${step.priority}-${step.title}`} className="diagnosis-action-item">
              <div className="diagnosis-action-top">
                <span className="diagnosis-priority">{step.priority}</span>
                <span className="diagnosis-action-tag">{step.tag}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="diagnosis-card">
        <div className="diagnosis-metrics-head">
          <div>
            <div className="diagnosis-section-label">{t.metricsLabel}</div>
            <h3>{tabItems[activeTab].title}</h3>
          </div>
          <div className="diagnosis-tab-row">
            {(
              [
                ["quality", t.metricQuality],
                ["sentiment", t.metricSentiment],
                ["consistency", t.metricConsistency],
                ["oriental", t.metricOriental],
              ] as [MetricTabKey, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`diagnosis-tab ${activeTab === key ? "active" : ""}`}
                onClick={() => setActiveTab(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <MetricGrid items={tabItems[activeTab].items} />
      </section>
    </div>
  );
}
