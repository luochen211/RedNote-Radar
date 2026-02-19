import { readFile, stat } from "fs/promises";
import path from "path";
import { getGlobalBenchmarkFiles, getLocalBenchmarkFiles } from "@/lib/modelAssetPaths";

interface SubmissionInput {
    title?: string;
    textContent?: string;
    tags?: string[] | string;
    followers?: number | string;
    subscribers?: number | string;
    likes?: number | string;
    province?: string;
    videoStoredPath?: string;
    coverStoredPath?: string;
}

interface Benchmarks {
    globalLikes: number[];
    localLikes: number[];
}

interface PredictionResult {
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
}

let benchmarkCache: Benchmarks | null = null;

const GLOBAL_BENCHMARK_FILES = getGlobalBenchmarkFiles();
const LOCAL_BENCHMARK_FILES = getLocalBenchmarkFiles();

const POSITIVE_WORDS = [
    "luxury", "elegant", "premium", "amazing", "beautiful", "great", "excellent", "best",
    "喜欢", "推荐", "高端", "舒适", "奢华", "精致", "治愈", "惊艳", "值得", "放松", "体验",
];

const NEGATIVE_WORDS = [
    "bad", "poor", "worse", "worst", "boring", "noisy", "crowded",
    "差", "一般", "失望", "拥挤", "吵", "糟糕", "问题", "不推荐",
];

const AROUSAL_WORDS = [
    "now", "today", "must", "wow", "hot", "limited", "trend", "viral",
    "立刻", "马上", "必看", "冲", "爆款", "限时", "超", "绝了", "太", "必住",
];

const ORIENTAL_WORDS = [
    "东方", "中式", "禅", "古风", "园林", "茶", "竹", "山水", "亭", "院", "飞檐", "青瓦",
    "宫", "汉服", "书法", "瓷", "国风", "东方美学",
];

const WESTERN_WORDS = [
    "western", "gothic", "cathedral", "castle", "bar", "champagne", "steak", "villa",
    "欧式", "西式", "教堂", "城堡", "酒吧", "牛排", "红酒", "咖啡馆",
];

const MODERN_WORDS = [
    "modern", "minimal", "business", "smart", "design", "metro", "city", "tech",
    "现代", "极简", "商务", "科技", "设计", "城市", "天际线", "高级感",
];

const VOICE_CUES = ["说", "讲", "访谈", "旁白", "口播", "讲解", "voice", "talk", "speech", "podcast"];
const FACE_CUES = ["人像", "人脸", "人物", "主持", "主播", "vlog", "portrait", "selfie", "couple"];

const COLOR_WORD_GROUPS = {
    black: ["黑", "black", "墨", "玄"],
    white: ["白", "white", "雪", "素"],
    red: ["红", "赤", "red", "朱"],
    yellow: ["黄", "金", "yellow", "gold"],
    cyan: ["青", "蓝", "绿", "cyan", "blue", "green"],
};

const PROVINCE_ORIENT_BIAS: Record<string, { oriental: number; modern: number; western: number; adaption: number }> = {
    Beijing: { oriental: 0.14, modern: 0.15, western: 0.11, adaption: 0.92 },
    Shanghai: { oriental: 0.1, modern: 0.2, western: 0.15, adaption: 0.88 },
    Guangdong: { oriental: 0.11, modern: 0.18, western: 0.14, adaption: 0.87 },
    Zhejiang: { oriental: 0.15, modern: 0.14, western: 0.1, adaption: 0.9 },
    Sichuan: { oriental: 0.16, modern: 0.12, western: 0.08, adaption: 0.91 },
    HongKongSAR: { oriental: 0.1, modern: 0.2, western: 0.18, adaption: 0.86 },
};

function clamp(value: number, min = 0, max = 1) {
    return Math.min(max, Math.max(min, value));
}

function toHundred(value: number) {
    return Math.round(clamp(value, 0, 1) * 100);
}

function toFixed1(value: number) {
    return (Math.round(value * 1000) / 10).toFixed(1);
}

function normalizeLikeValue(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value !== "string") return null;

    const cleaned = value.replace(/[,+\s]/g, "").trim().toLowerCase();
    if (!cleaned) return null;

    if (cleaned.endsWith("w") || cleaned.includes("万")) {
        const n = parseFloat(cleaned.replace("w", "").replace("万", ""));
        return Number.isFinite(n) ? n * 10000 : null;
    }

    if (cleaned.endsWith("k")) {
        const n = parseFloat(cleaned.replace("k", ""));
        return Number.isFinite(n) ? n * 1000 : null;
    }

    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : null;
}

function tokenize(text: string): string[] {
    const tokens = text
        .toLowerCase()
        .match(/[a-z0-9\u4e00-\u9fa5]+/g);
    return tokens ?? [];
}

function uniqueCount(values: string[]) {
    return new Set(values).size;
}

function jaccard(a: string[], b: string[]) {
    if (a.length === 0 || b.length === 0) return 0;
    const setA = new Set(a);
    const setB = new Set(b);
    let inter = 0;
    for (const item of Array.from(setA)) {
        if (setB.has(item)) inter += 1;
    }
    const union = new Set(a.concat(b)).size;
    return union === 0 ? 0 : inter / union;
}

function countKeywordHits(text: string, words: string[]) {
    const normalized = text.toLowerCase();
    let count = 0;
    for (const word of words) {
        if (normalized.includes(word.toLowerCase())) count += 1;
    }
    return count;
}

function sentimentPolarity(text: string) {
    const pos = countKeywordHits(text, POSITIVE_WORDS);
    const neg = countKeywordHits(text, NEGATIVE_WORDS);
    if (pos === 0 && neg === 0) return 0;
    return clamp((pos - neg) / (pos + neg), -1, 1);
}

function arousalStrength(text: string) {
    const marks = (text.match(/[!！?？]/g) ?? []).length;
    const cueHits = countKeywordHits(text, AROUSAL_WORDS);
    const base = cueHits * 0.12 + Math.min(marks, 6) * 0.05;
    return clamp(base, 0, 1);
}

function percentileRank(sortedValues: number[], value: number) {
    if (!sortedValues.length) return 0.5;
    let lo = 0;
    let hi = sortedValues.length;
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (sortedValues[mid] <= value) lo = mid + 1;
        else hi = mid;
    }
    return lo / sortedValues.length;
}

async function readJsonFile(filePath: string): Promise<unknown[] | null> {
    try {
        const content = await readFile(filePath, "utf-8");
        const parsed = JSON.parse(content);
        return Array.isArray(parsed) ? parsed : null;
    } catch {
        return null;
    }
}

function extractLikes(records: unknown[] | null): number[] {
    if (!records) return [];
    const result: number[] = [];

    for (const item of records) {
        if (!item || typeof item !== "object") continue;
        const obj = item as Record<string, unknown>;

        const likes =
            normalizeLikeValue(obj.likes)
            ?? normalizeLikeValue(obj.praises)
            ?? normalizeLikeValue(obj.like)
            ?? normalizeLikeValue(obj.favors)
            ?? normalizeLikeValue(obj.点赞数);

        if (likes !== null && likes >= 0) result.push(likes);
    }

    return result.sort((a, b) => a - b);
}

async function loadBenchmarks(): Promise<Benchmarks> {
    if (benchmarkCache) return benchmarkCache;

    let globalLikes: number[] = [];
    for (const file of GLOBAL_BENCHMARK_FILES) {
        const likes = extractLikes(await readJsonFile(file));
        if (likes.length) {
            globalLikes = likes;
            break;
        }
    }

    let localLikes: number[] = [];
    for (const file of LOCAL_BENCHMARK_FILES) {
        const likes = extractLikes(await readJsonFile(file));
        if (likes.length) {
            localLikes = likes;
            break;
        }
    }

    if (!globalLikes.length) globalLikes = [20, 45, 80, 120, 180, 260, 380, 520, 860, 1200];
    if (!localLikes.length) localLikes = [6, 12, 20, 28, 36, 44, 55, 70, 95, 130];

    benchmarkCache = { globalLikes, localLikes };
    return benchmarkCache;
}

function asNumber(value: unknown) {
    const n = typeof value === "number" ? value : Number(value ?? 0);
    return Number.isFinite(n) ? n : 0;
}

function normalizeProvince(raw: string) {
    return raw.replace(/\s+/g, "").replace(/SAR/i, "SAR");
}

async function fileSizeMb(filePath: string | undefined) {
    if (!filePath) return 0;
    try {
        const info = await stat(path.resolve(filePath));
        return info.size / (1024 * 1024);
    } catch {
        return 0;
    }
}

function colorRichnessScore(text: string) {
    let groups = 0;
    for (const words of Object.values(COLOR_WORD_GROUPS)) {
        if (words.some((word) => text.includes(word.toLowerCase()))) groups += 1;
    }
    return clamp(groups / 5, 0, 1);
}

function normalizeCultureTriplet(oriental: number, western: number, modern: number) {
    const safeOriental = Math.max(0, oriental);
    const safeWestern = Math.max(0, western);
    const safeModern = Math.max(0, modern);
    const total = safeOriental + safeWestern + safeModern;

    if (total <= 0) return { oriental: 0.34, western: 0.33, modern: 0.33 };

    return {
        oriental: safeOriental / total,
        western: safeWestern / total,
        modern: safeModern / total,
    };
}

export async function buildPredictionResult(input: SubmissionInput): Promise<PredictionResult> {
    const benchmarks = await loadBenchmarks();

    const title = String(input.title ?? "").trim();
    const textContent = String(input.textContent ?? "").trim();
    const rawTags = input.tags;
    const tags = Array.isArray(rawTags)
        ? rawTags.map((tag) => String(tag).trim()).filter(Boolean)
        : typeof rawTags === "string"
            ? rawTags.split(/[;,，]/).map((tag) => tag.trim()).filter(Boolean)
            : [];

    const followers = Math.max(0, asNumber(input.followers));
    const subscribers = Math.max(0, asNumber(input.subscribers));
    const likes = Math.max(0, asNumber(input.likes));

    const mergedText = `${title} ${textContent} ${tags.join(" ")}`.trim();
    const mergedLower = mergedText.toLowerCase();

    const titleTokens = tokenize(title);
    const textTokens = tokenize(textContent);
    const tagTokens = tokenize(tags.join(" "));
    const mergedTokens = tokenize(mergedText);

    const titleSent = sentimentPolarity(title);
    const textSent = sentimentPolarity(textContent || title);
    const textArousal = arousalStrength(textContent || title);

    const videoMb = await fileSizeMb(input.videoStoredPath);
    const coverMb = await fileSizeMb(input.coverStoredPath);

    const lexicalDiversity = mergedTokens.length ? uniqueCount(mergedTokens) / mergedTokens.length : 0;
    const titleTagOverlap = jaccard(titleTokens, tagTokens);
    const titleTextOverlap = jaccard(titleTokens, textTokens.length ? textTokens : mergedTokens);

    const accountSignal = clamp(
        (Math.log1p(followers) * 0.45 + Math.log1p(subscribers) * 0.35 + Math.log1p(likes) * 0.2) / 25,
        0,
        1,
    );

    const readability = clamp(
        0.78
        + lexicalDiversity * 0.28
        - Math.max(0, (title.length + textContent.length - 220)) / 900,
        0,
        1,
    );

    const coverQuality = clamp(0.52 + Math.min(coverMb, 5) / 10 + lexicalDiversity * 0.18, 0, 1);
    const coverAesthetic = clamp(0.5 + Math.min(coverMb, 4) / 10 + titleTagOverlap * 0.22, 0, 1);
    const videoAesthetic = clamp(0.48 + Math.min(videoMb, 60) / 140 + titleTextOverlap * 0.2, 0, 1);

    const hasVoice = countKeywordHits(mergedLower, VOICE_CUES) > 0 ? 1 : 0;
    const hasFace = countKeywordHits(mergedLower, FACE_CUES) > 0 ? 1 : 0;

    const audioSent = clamp((textSent + (hasVoice ? 0.08 : 0)) * 0.5 + 0.5, 0, 1);
    const audioArousal = clamp(textArousal * 0.8 + (hasVoice ? 0.12 : 0.05), 0, 1);

    const consistencyTitleTags = clamp(0.4 + titleTagOverlap * 0.6, 0, 1);
    const consistencyTitleCover = clamp(0.45 + (coverMb > 0 ? 0.2 : 0) + titleTagOverlap * 0.35, 0, 1);
    const consistencyTitleVideo = clamp(0.45 + titleTextOverlap * 0.55, 0, 1);
    const consistencyTextAudio = clamp(1 - Math.abs((textSent + 1) / 2 - audioSent), 0, 1);
    const videoMood = clamp(0.5 + (videoAesthetic - 0.5) * 0.7, 0, 1);
    const consistencyTextVideo = clamp(1 - Math.abs((textSent + 1) / 2 - videoMood), 0, 1);
    const consistencyVideoAudio = clamp(1 - Math.abs(videoMood - audioSent), 0, 1);

    const orientHits = countKeywordHits(mergedLower, ORIENTAL_WORDS);
    const westHits = countKeywordHits(mergedLower, WESTERN_WORDS);
    const modernHits = countKeywordHits(mergedLower, MODERN_WORDS);

    const provinceKey = normalizeProvince(String(input.province ?? ""));
    const provinceBias = PROVINCE_ORIENT_BIAS[provinceKey] ?? { oriental: 0.11, modern: 0.13, western: 0.1, adaption: 0.86 };

    const richness = clamp(0.35 + colorRichnessScore(mergedLower) * 0.55, 0, 1);
    const harmony = clamp(0.4 + consistencyTitleCover * 0.35 + readability * 0.25, 0, 1);
    const adaption = clamp(provinceBias.adaption * 0.65 + consistencyTitleVideo * 0.35, 0, 1);

    const culture = normalizeCultureTriplet(
        orientHits * 0.28 + provinceBias.oriental,
        westHits * 0.28 + provinceBias.western,
        modernHits * 0.28 + provinceBias.modern,
    );

    const contentQuality = clamp(
        videoAesthetic * 0.24
        + readability * 0.15
        + coverQuality * 0.14
        + coverAesthetic * 0.14
        + consistencyTitleVideo * 0.15
        + consistencyTitleTags * 0.09
        + consistencyTextAudio * 0.09,
        0,
        1,
    );

    const localPercentile = percentileRank(benchmarks.localLikes, likes);
    const globalPercentile = percentileRank(benchmarks.globalLikes, likes);

    const localScore = toHundred(
        contentQuality * 0.5
        + accountSignal * 0.28
        + localPercentile * 0.22,
    );

    const globalScore = toHundred(
        contentQuality * 0.46
        + accountSignal * 0.22
        + globalPercentile * 0.32,
    );

    return {
        modelVersion: "deterministic-data-v1",
        processedAt: new Date().toISOString(),
        engagementScore: {
            local: localScore,
            global: globalScore,
        },
        analysis: {
            quality: {
                aesthetic: toFixed1(videoAesthetic),
                readability: toFixed1(readability),
                coverQuality: toFixed1(coverQuality),
                coverAesthetic: toFixed1(coverAesthetic),
                voice: hasVoice,
                face: hasFace,
            },
            sentiment: {
                title: `${toHundred((titleSent + 1) / 2)}%`,
                text: `${toHundred((textSent + 1) / 2)}%`,
                textArousal: `${toHundred(textArousal)}%`,
                audio: `${toHundred(audioSent)}%`,
                audioArousal: `${toHundred(audioArousal)}%`,
            },
            consistency: {
                titleTags: `${toHundred(consistencyTitleTags)}%`,
                titleCover: `${toHundred(consistencyTitleCover)}%`,
                titleVideo: `${toHundred(consistencyTitleVideo)}%`,
                textAudio: `${toHundred(consistencyTextAudio)}%`,
                textVideo: `${toHundred(consistencyTextVideo)}%`,
                videoAudio: `${toHundred(consistencyVideoAudio)}%`,
            },
            orientalAesthetics: {
                richness: Number(richness.toFixed(2)),
                harmony: Number(harmony.toFixed(2)),
                adaption: Number(adaption.toFixed(2)),
                modern: Number(culture.modern.toFixed(2)),
                oriental: Number(culture.oriental.toFixed(2)),
                western: Number(culture.western.toFixed(2)),
            },
        },
    };
}
