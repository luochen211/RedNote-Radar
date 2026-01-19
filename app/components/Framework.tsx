'use client';

import { useRef } from 'react';
import { useLanguage } from "../context/LanguageContext";
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from "next/image";

const copy = {
    en: {
        frameworkTitle: "Model Architecture",
        frameworkText:
            "Visual frames + audio tracks + text tokens → cross-modal attention → adaptive fusion",
        architectureDiagram: "Architecture diagram",
        desc: "End-to-End Multimodal Analysis",
    },
    zh: {
        frameworkTitle: "模型架构全览",
        frameworkText:
            "视频帧 + 音频轨 + 文本 → 跨模态注意力 → 自适应融合",
        architectureDiagram: "架构图示意",
        desc: "端到端多模态分析流程",
    },
};

export default function Framework() {
    const { lang } = useLanguage();
    const t = copy[lang];
    const containerRef = useRef<HTMLDivElement>(null);

    // Track scroll progress relative to this container
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    // Transform scroll progress into scale and opacity values
    const scale = useTransform(scrollYProgress, [0, 0.5], [0.7, 0.95]);
    const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
    const textOpacity = useTransform(scrollYProgress, [0.1, 0.4], [0, 1]);
    const captionOpacity = useTransform(scrollYProgress, [0.4, 0.55], [0, 1]);
    const width = useTransform(scrollYProgress, [0, 0.55], ['60vw', '85vw']);
    const borderRadius = useTransform(scrollYProgress, [0, 0.55], [24, 8]);
    const titleScale = useTransform(scrollYProgress, [0, 0.5], [0.9, 1]);

    return (
        <section
            id="flow"
            ref={containerRef}
            className="framework-section"
            style={{
                height: '180vh',
                position: 'relative',
                marginTop: '120px', // Extra breathing room from the Hero section
                marginBottom: '200px',
                zIndex: 10
            }}
        >
            <div style={{ position: 'sticky', top: '2%', height: '95vh', overflow: 'visible', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '2vh' }}>

                {/* Title - Always above the image */}
                <motion.div
                    style={{
                        textAlign: 'center',
                        zIndex: 50,
                        opacity: textOpacity,
                        pointerEvents: 'none',
                        marginBottom: '2rem',
                        flexShrink: 0
                    }}
                >
                    <motion.h2 style={{
                        fontSize: 'clamp(2rem, 6vw, 4.5rem)',
                        fontWeight: 900,
                        color: '#fff',
                        margin: 0,
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        lineHeight: 1,
                        display: 'inline-block',
                        scale: titleScale,
                        textShadow: '0 0 30px rgba(106, 227, 255, 0.3)'
                    }}>
                        {t.frameworkTitle}
                    </motion.h2>
                </motion.div>

                {/* Framed Image Container - Below the title */}
                <motion.div
                    style={{
                        width,
                        aspectRatio: '735 / 328',
                        borderRadius,
                        boxShadow: '0 50px 100px rgba(0,0,0,0.8)',
                        scale,
                        opacity,
                        position: 'relative',
                        zIndex: 1,
                        background: 'rgba(255, 255, 255, 0.95)',
                        padding: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                >
                    <motion.div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: borderRadius === 0 ? 0 : 12, overflow: 'hidden' }}>
                        <Image
                            src="/framework.png"
                            alt="Model architecture"
                            fill
                            style={{
                                objectFit: 'contain',
                                objectPosition: 'center',
                                background: '#fff',
                                filter: 'brightness(0.98)' // Slight dim to reduce glare
                            }}
                            priority
                        />

                        {/* Glossy overlay */}
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(255,255,255,0.05), transparent 40%)', pointerEvents: 'none', borderRadius: 'inherit' }}></div>

                        {/* Scanner Effect */}
                        <div className="scanner-line"></div>
                        <div className="scanner-overlay"></div>
                    </motion.div>
                </motion.div>

                {/* Caption below image */}
                <motion.div
                    style={{
                        marginTop: '2rem',
                        background: 'rgba(7, 11, 19, 0.85)',
                        backdropFilter: 'blur(16px)',
                        padding: '18px 32px',
                        borderRadius: '100px',
                        border: '1px solid rgba(106, 227, 255, 0.2)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                        opacity: captionOpacity,
                        zIndex: 20,
                        flexShrink: 0
                    }}
                >
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: 600 }}>
                            {t.desc}
                        </p>
                        <p style={{ margin: '4px 0 0', color: '#6ae3ff', fontSize: '0.9rem' }}>
                            {t.frameworkText}
                        </p>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
