'use client';

import { useLanguage } from "../context/LanguageContext";

type SectionItem = {
    title: string;
    dependencies: string;
    keyPath: string;
    input: string;
    output: string;
    note?: string;
};

const copy = {
    en: {
        modulesTitle: "Core analysis capabilities",
        modulesSubtitle: "Organized for demo and delivery: each block shows what the model reads, what it computes and what the page should display.",
        labels: {
            dependencies: "Core dependencies",
            keyPath: "Key path / variable",
            input: "Input",
            output: "Output",
            note: "Note",
        },
        sections: [
            {
                title: "Human voice presence",
                dependencies: "faster-whisper, pandas, tqdm, optional GPU PyTorch",
                keyPath: "Replace the folder_path variable with the actual audio folder path",
                input: "MP3 audio files",
                output: "DataFrame containing segmented speech text",
                note: "If no GPU is available, adjust device and compute_type."
            },
            {
                title: "Text sentiment score & Text arousal score",
                dependencies: "cntext, pandas, jieba, tqdm",
                keyPath: "Replace the target note content with the text to be analyzed",
                input: "Chinese text content",
                output: "DataFrame containing sentiment / arousal totals and averages",
            },
            {
                title: "Audio sentiment score & Audio arousal score",
                dependencies: "music2emo, pydub, pandas, ffmpeg",
                keyPath: "Replace audio_file_path with the actual audio file path",
                input: "MP3 and other audio paths",
                output: "Audio sentiment and arousal results",
            },
            {
                title: "Title-video content consistency & Text-video sentiment consistency",
                dependencies: "clip, opencv-python, torch, pillow, pandas",
                keyPath: "Replace temp_path with the video file path and text_content with Title / Text",
                input: "Video file path plus matching text",
                output: "Similarity score between video and text",
            },
            {
                title: "Text-audio / Text-video / Video-audio consistency",
                dependencies: "opencv-python, pandas, nltk, scipy, NLTK corpora, DeepSentiBank",
                keyPath: "Update the video folder, JSON file, sentibank.py path, frame path and temp path",
                input: "Video / audio / text sentiment data",
                output: "DataFrame containing multiple multimodal consistency indicators",
                note: "Documented execution order: extract frames -> generate JSON -> compute video sentiment mean -> calculate consistency."
            }
        ] as SectionItem[],
    },
    zh: {
        modulesTitle: "核心分析能力",
        modulesSubtitle: "按演示和交付视角整理：每个模块都说明系统读取什么、计算什么、页面展示什么。",
        labels: {
            dependencies: "核心依赖",
            keyPath: "关键修改位置",
            input: "输入",
            output: "输出",
            note: "注意事项",
        },
        sections: [
            {
                title: "Human voice presence",
                dependencies: "faster-whisper、pandas、tqdm，GPU 加速需额外安装对应版本的 PyTorch",
                keyPath: "将代码中的 folder_path 变量改为音频文件实际路径",
                input: "MP3 文件",
                output: "包含分段文字的 DataFrame",
                note: "无 GPU 时需调整 device 和 compute_type。"
            },
            {
                title: "Text sentiment score & Text arousal score",
                dependencies: "cntext、pandas、jieba、tqdm",
                keyPath: "将“笔记内容”修改为要分析的目标文本",
                input: "中文文本",
                output: "包含效价 / 唤醒度总分、均值的 DataFrame",
            },
            {
                title: "Audio sentiment score & Audio arousal score",
                dependencies: "music2emo、pydub、pandas、ffmpeg",
                keyPath: "将 audio_file_path 修改为音频文件实际路径",
                input: "MP3 等音频文件路径",
                output: "包含效价、唤醒度的结果",
            },
            {
                title: "Title-video content consistency & Text-video sentiment consistency",
                dependencies: "clip、opencv-python、torch、pillow、pandas",
                keyPath: "temp_path 替换为视频文件路径，text_content 替换为 Title / Text",
                input: "视频文件路径、匹配文本",
                output: "视频与文本的相似度",
            },
            {
                title: "Text-audio / Text-video / Video-audio consistency",
                dependencies: "opencv-python、pandas、nltk、scipy、NLTK 语料库、DeepSentiBank",
                keyPath: "修改视频文件夹、JSON 文件、sentibank.py、帧路径和临时文件路径",
                input: "视频 / 音频 / 文本情感数据",
                output: "包含多个一致性指标的 DataFrame",
                note: "运行顺序：先提取视频帧，再生成 JSON、计算视频情感均值，最后计算多模态一致性。"
            }
        ] as SectionItem[],
    },
};

export default function Modules() {
    const { lang } = useLanguage();
    const t = copy[lang];

    return (
        <section className="modules glass fade-up delay-3" id="architecture">
            <div className="section-head">
                <div>
                    <h2>{t.modulesTitle}</h2>
                    <p className="muted">{t.modulesSubtitle}</p>
                </div>
            </div>

            <div className="doc-sheet-grid">
                {t.sections.map((section, index) => (
                    <article key={section.title} className="doc-sheet-card">
                        <div className="doc-sheet-head">
                            <div className="doc-sheet-index">{String(index + 1).padStart(2, "0")}</div>
                            <h4>{section.title}</h4>
                        </div>

                        <div className="doc-sheet-body">
                            <div className="doc-line">
                                <span>{t.labels.dependencies}</span>
                                <p>{section.dependencies}</p>
                            </div>
                            <div className="doc-line">
                                <span>{t.labels.keyPath}</span>
                                <p>{section.keyPath}</p>
                            </div>
                            <div className="doc-line">
                                <span>{t.labels.input}</span>
                                <p>{section.input}</p>
                            </div>
                            <div className="doc-line">
                                <span>{t.labels.output}</span>
                                <p>{section.output}</p>
                            </div>
                            {section.note && (
                                <div className="doc-line note">
                                    <span>{t.labels.note}</span>
                                    <p>{section.note}</p>
                                </div>
                            )}
                        </div>
                    </article>
                ))}
            </div>

            <style jsx>{`
                .doc-sheet-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 16px;
                }
                .doc-sheet-card {
                    background: rgba(22, 31, 54, 0.78);
                    border: 1px solid rgba(140, 198, 255, 0.14);
                    border-radius: 18px;
                    overflow: hidden;
                    box-shadow: 0 18px 40px rgba(8, 14, 28, 0.18);
                    backdrop-filter: blur(16px);
                }
                .doc-sheet-head {
                    display: flex;
                    gap: 14px;
                    align-items: center;
                    padding: 18px 20px;
                    border-bottom: 1px solid rgba(140, 198, 255, 0.12);
                    background: rgba(122, 166, 255, 0.08);
                }
                .doc-sheet-head h4 {
                    margin: 0;
                    font-size: 18px;
                    color: #edf4ff;
                    line-height: 1.4;
                }
                .doc-sheet-index {
                    width: 42px;
                    height: 42px;
                    border-radius: 12px;
                    display: grid;
                    place-items: center;
                    background: rgba(122, 166, 255, 0.12);
                    color: #cfe4ff;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    font-family: monospace;
                    border: 1px solid rgba(140, 198, 255, 0.16);
                }
                .doc-sheet-body {
                    padding: 8px 20px 20px;
                }
                .doc-line {
                    display: grid;
                    grid-template-columns: 132px 1fr;
                    gap: 14px;
                    padding: 14px 0;
                    border-bottom: 1px solid rgba(140, 198, 255, 0.10);
                }
                .doc-line:last-child {
                    border-bottom: none;
                }
                .doc-line span {
                    color: #93accf;
                    font-size: 12px;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    padding-top: 2px;
                }
                .doc-line p {
                    margin: 0;
                    color: #edf4ff;
                    line-height: 1.7;
                    font-size: 14px;
                }
                .doc-line.note p {
                    color: #d2def4;
                }
                @media (max-width: 640px) {
                    .doc-line {
                        grid-template-columns: 1fr;
                        gap: 6px;
                    }
                    .doc-line span {
                        padding-top: 0;
                    }
                }
            `}</style>
        </section>
    );
}
