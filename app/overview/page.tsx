'use client';

import Link from "next/link";
import Image from "next/image";
import Modules from "../components/Modules";
import Methodology from "../components/Methodology";
import { useLanguage } from "../context/LanguageContext";

const copy = {
  en: {
    title: "Hotel Video InsightHub Overview",
    lead:
      "A multimodal analytics and prediction system built for hotel short-video marketing. Analyze content quality, sentiment, consistency, and forecast engagement at local and industry scales.",
    ctaUpload: "Go to Data Upload",
    ctaDocs: "View Architecture",
    highlightsTitle: "What this platform delivers",
    highlights: [
      "8-type data intake: video, cover, title, text, tags, followers, subscribers, likes.",
      "Dual-scope prediction (Local vs. Global) with live task polling.",
      "Deep analysis dashboards: quality, sentiment, consistency, oriental aesthetics (dual radar).",
      "Admin console for user, dataset, and result governance.",
    ],
    archTitle: "System architecture",
    archDesc:
      "Video frames, audio tracks, and text tokens flow through VGG / VGGish / BERT encoders, cross-modal attention, adaptive fusion, attention layers, and an MLP that outputs engagement probabilities.",
    flowTitle: "End-to-end user journey",
    flow: [
      { label: "Upload", detail: "Users submit media + metadata; basic client-side validation" },
      { label: "Prediction", detail: "Async task evaluates content and returns local/global scores" },
      { label: "Analysis", detail: "Rich visual dashboard with hover tooltips and bilingual labels" },
      { label: "Admin", detail: "Manage users, uploads, and history exports" },
    ],
    techTitle: "Tech stack",
    tech: ["Next.js 14 (App Router)", "TypeScript", "Tailwind + custom glass UI", "NextAuth", "Prisma + SQLite", "Framer Motion"],
    modulesTitle: "Five core modules",
  },
  zh: {
    title: "酒店短视频智算台 · 项目介绍",
    lead:
      "面向酒店短视频营销的多模态分析与预测系统，支持内容质量、情感、一致性、东方美学等维度分析，并给出本号与全网的互动度预测。",
    ctaUpload: "前往数据上传",
    ctaDocs: "查看架构",
    highlightsTitle: "平台能做什么",
    highlights: [
      "8 类核心数据采集：视频、封面、标题、文本、标签、粉丝、订阅、点赞。",
      "双范围预测（本号 / 全网），任务实时轮询。",
      "深度分析看板：质量、情感、一致性、东方美学（双三角雷达）。",
      "管理后台：用户与上传记录治理、结果导出。",
    ],
    archTitle: "系统架构",
    archDesc:
      "视频帧、音频轨与文本分别进入 VGG / VGGish / BERT 编码，经跨模态注意力与自适应融合，再通过注意力层与 MLP 输出互动度概率。",
    flowTitle: "端到端使用流程",
    flow: [
      { label: "上传", detail: "用户提交素材与元信息，前端完成基础校验" },
      { label: "预测", detail: "异步任务计算内容表现，返回本号 / 全网得分" },
      { label: "分析", detail: "多维度可视化看板，悬停提示中英双语定义" },
      { label: "管理", detail: "管理员管理用户、上传与历史记录导出" },
    ],
    techTitle: "技术栈",
    tech: ["Next.js 14 (App Router)", "TypeScript", "Tailwind + 自定义玻璃拟态", "NextAuth", "Prisma + SQLite", "Framer Motion"],
    modulesTitle: "五大模块",
  },
};

export default function OverviewPage() {
  const { lang } = useLanguage();
  const t = copy[lang];

  return (
    <div className="page page-enter" style={{ paddingTop: 32, paddingBottom: 120 }}>
      <section
        className="glass"
        style={{ padding: 28, display: "grid", gap: 20, gridTemplateColumns: "1.2fr 1fr", alignItems: "center" }}
      >
        <div>
          <div className="pill accent" style={{ display: "inline-flex" }}>InsightHub</div>
          <h1 style={{ marginTop: 8 }}>{t.title}</h1>
          <p className="lead" style={{ marginTop: 12 }}>{t.lead}</p>
          <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
            <Link
              className="primary-button"
              href="/upload"
              style={{ textDecoration: "none", padding: "12px 18px", borderRadius: 10, background: "var(--accent)", color: "white", fontWeight: 600 }}
            >
              {t.ctaUpload}
            </Link>
            <Link
              className="ghost-button"
              href="#system-arch"
              style={{ textDecoration: "none", padding: "12px 18px", borderRadius: 10, border: "1px solid var(--border)", fontWeight: 600 }}
            >
              {t.ctaDocs}
            </Link>
          </div>
        </div>
        <div
          className="glass"
          style={{ padding: 16, background: "linear-gradient(135deg, rgba(37,99,235,0.06), rgba(79,70,229,0.04))" }}
        >
          <Image
            src="/framework.png"
            alt="Architecture diagram"
            width={900}
            height={420}
            style={{ width: "100%", height: "auto", borderRadius: 12, border: "1px solid rgba(0,0,0,0.05)" }}
            priority
          />
          <div style={{ marginTop: 8, color: "var(--muted)", fontSize: 13 }}>{t.archDesc}</div>
        </div>
      </section>

      <section id="system-arch" className="glass" style={{ padding: 24, marginTop: 20 }}>
        <h3 style={{ marginBottom: 12 }}>{t.highlightsTitle}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          {t.highlights.map((item, idx) => (
            <div
              key={idx}
              className="upload-box"
              style={{ padding: 16, borderRadius: 12, border: "1px solid var(--border)", background: "rgba(0,0,0,0.02)" }}
            >
              <div style={{ fontWeight: 700, color: "var(--accent)" }}>0{idx + 1}</div>
              <div style={{ marginTop: 6, color: "var(--text)" }}>{item}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="glass" style={{ padding: 24, marginTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h3 style={{ margin: 0 }}>{t.archTitle}</h3>
          <div
            className="pill accent"
            style={{ display: "inline-flex", background: "rgba(37,99,235,0.08)", color: "var(--accent)" }}
          >
            VGG · VGGish · BERT · MLP
          </div>
        </div>
        <Methodology />
      </section>

      <section className="glass" style={{ padding: 24, marginTop: 20 }}>
        <h3 style={{ marginBottom: 12 }}>{t.modulesTitle}</h3>
        <Modules />
      </section>

      <section className="glass" style={{ padding: 24, marginTop: 20 }}>
        <h3 style={{ marginBottom: 12 }}>{t.flowTitle}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {t.flow.map((step, idx) => (
            <div
              key={step.label}
              className="upload-box"
              style={{ padding: 16, borderRadius: 12, border: "1px solid var(--border)", background: "linear-gradient(135deg, rgba(37,99,235,0.03), rgba(79,70,229,0.02))" }}
            >
              <div style={{ fontSize: 13, color: "var(--muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Step {idx + 1}
              </div>
              <div style={{ fontWeight: 700, marginTop: 6 }}>{step.label}</div>
              <div style={{ marginTop: 6, color: "var(--muted)" }}>{step.detail}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="glass" style={{ padding: 24, marginTop: 20 }}>
        <h3 style={{ marginBottom: 12 }}>{t.techTitle}</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {t.tech.map((item) => (
            <span
              key={item}
              className="pill accent"
              style={{ display: "inline-flex", background: "rgba(0,0,0,0.03)", color: "var(--text)", border: "1px solid var(--border)", padding: "8px 12px" }}
            >
              {item}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
