'use client';

import Link from "next/link";
import Framework from "../components/Framework";
import FooterLinks from "../components/FooterLinks";
import Methodology from "../components/Methodology";
import { useLanguage } from "../context/LanguageContext";

const copy = {
  en: {
    title: "Video-based Social Media Marketing Analysis and Effectiveness Prediction",
    lead:
      "Video-based social media has become a transformative marketing force, dynamically reshaping consumer experiences through its multimodal nature (visual, audio, textual). This model can accurately analyze video social media content and predict its marketing effectiveness, providing support for strategy optimization and research on consumer cognition and behavior.",
    ctaUpload: "Go to Data Upload",
    ctaDocs: "View Architecture",
  },
  zh: {
    title: "Video-based Social Media Marketing Analysis and Effectiveness Prediction",
    lead:
      "面向酒店短视频营销的多模态分析与预测系统，支持内容质量、情感、一致性、东方美学等维度分析，并给出本号与全网的互动度预测。",
    ctaUpload: "前往数据上传",
    ctaDocs: "查看架构",
  },
};

export default function OverviewPage() {
  const { lang } = useLanguage();
  const t = copy[lang];

  return (
    <div className="page app-page page-enter">
      <div className="app-stack">
        <section className="glass app-section app-section-lg overview-hero overview-hero-refined">
          <div className="overview-hero-copy">
            <h1 className="overview-title">{t.title}</h1>
            <p className="lead overview-lead">{t.lead}</p>
            <div className="inline-actions overview-hero-actions">
              <Link className="primary-button overview-cta" href="/upload">
                {t.ctaUpload}
              </Link>
              <Link className="ghost-button overview-cta" href="#flow">
                {t.ctaDocs}
              </Link>
            </div>
          </div>
        </section>

        <Methodology />

        <Framework />

        <FooterLinks />
      </div>
    </div>
  );
}
