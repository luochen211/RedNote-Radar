export interface CompatiblePredictionResult {
    modelVersion: string;
    processedAt: string;
    engagementScore: {
        local: number;
        global: number;
    };
    analysis: {
        quality: {
            aesthetic: string;
            readability: string;
            coverQuality: string;
            coverAesthetic: string;
            voice: number;
            face: number;
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
    testDimensions?: {
        input: {
            textTokens: number;
            videoFrames: number;
            videoFeatureDim: number;
            audioFrames: number;
            audioFeatureDim: number;
        };
        output: {
            rawLocal: number | null;
            rawGlobal: number | null;
        };
    };
}

function asObj(value: unknown): Record<string, any> {
    return value && typeof value === "object" ? value as Record<string, any> : {};
}

function asNum(value: unknown, fallback = 0) {
    const n = typeof value === "number" ? value : Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function asPct(value: unknown, fallback = "0%") {
    if (typeof value === "string" && /%$/.test(value.trim())) return value;
    const n = asNum(value, NaN);
    if (Number.isFinite(n)) return `${Math.max(0, Math.min(100, Math.round(n)))}%`;
    return fallback;
}

function asScoreString(value: unknown, fallback = "0.0") {
    if (typeof value === "string") return value;
    const n = asNum(value, NaN);
    if (!Number.isFinite(n)) return fallback;
    return (Math.round(n * 10) / 10).toFixed(1);
}

function asBinary(value: unknown) {
    if (value === 1 || value === true || value === "1" || value === "true") return 1;
    return 0;
}

export function ensureResultCompatibility(raw: unknown): CompatiblePredictionResult {
    const r = asObj(raw);
    const analysis = asObj(r.analysis);
    const quality = asObj(analysis.quality);
    const sentiment = asObj(analysis.sentiment);
    const consistency = asObj(analysis.consistency);
    const oriental = asObj(analysis.orientalAesthetics);
    const score = asObj(r.engagementScore);
    const testDimensions = asObj(r.testDimensions);
    const testInput = asObj(testDimensions.input);
    const testOutput = asObj(testDimensions.output);

    return {
        modelVersion: String(r.modelVersion || "unknown-model"),
        processedAt: String(r.processedAt || new Date().toISOString()),
        engagementScore: {
            local: Math.max(0, Math.min(100, Math.round(asNum(score.local, 0)))),
            global: Math.max(0, Math.min(100, Math.round(asNum(score.global, 0)))),
        },
        analysis: {
            quality: {
                aesthetic: asScoreString(quality.aesthetic, "0.0"),
                readability: asScoreString(quality.readability, "0.0"),
                coverQuality: asScoreString(quality.coverQuality, "0.0"),
                coverAesthetic: asScoreString(quality.coverAesthetic, "0.0"),
                voice: asBinary(quality.voice),
                face: asBinary(quality.face),
            },
            sentiment: {
                title: asPct(sentiment.title, "0%"),
                text: asPct(sentiment.text, "0%"),
                textArousal: asPct(sentiment.textArousal, "0%"),
                audio: asPct(sentiment.audio, "0%"),
                audioArousal: asPct(sentiment.audioArousal, "0%"),
            },
            consistency: {
                titleTags: asPct(consistency.titleTags, "0%"),
                titleCover: asPct(consistency.titleCover, "0%"),
                titleVideo: asPct(consistency.titleVideo, "0%"),
                textAudio: asPct(consistency.textAudio, "0%"),
                textVideo: asPct(consistency.textVideo, "0%"),
                videoAudio: asPct(consistency.videoAudio, "0%"),
            },
            orientalAesthetics: {
                richness: Number(asNum(oriental.richness, 0).toFixed(2)),
                harmony: Number(asNum(oriental.harmony, 0).toFixed(2)),
                adaption: Number(asNum(oriental.adaption, 0).toFixed(2)),
                modern: Number(asNum(oriental.modern, 0).toFixed(2)),
                oriental: Number(asNum(oriental.oriental, 0).toFixed(2)),
                western: Number(asNum(oriental.western, 0).toFixed(2)),
            },
        },
        testDimensions: {
            input: {
                textTokens: Math.max(0, Math.round(asNum(testInput.textTokens, 0))),
                videoFrames: Math.max(0, Math.round(asNum(testInput.videoFrames, 0))),
                videoFeatureDim: Math.max(0, Math.round(asNum(testInput.videoFeatureDim, 0))),
                audioFrames: Math.max(0, Math.round(asNum(testInput.audioFrames, 0))),
                audioFeatureDim: Math.max(0, Math.round(asNum(testInput.audioFeatureDim, 0))),
            },
            output: {
                rawLocal: Number.isFinite(asNum(testOutput.rawLocal, NaN)) ? asNum(testOutput.rawLocal, 0) : null,
                rawGlobal: Number.isFinite(asNum(testOutput.rawGlobal, NaN)) ? asNum(testOutput.rawGlobal, 0) : null,
            },
        },
    };
}
