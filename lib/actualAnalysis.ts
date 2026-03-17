import { execFile } from "child_process";
import { stat } from "fs/promises";
import path from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

type SubmissionInput = {
  title?: string;
  textContent?: string;
  tags?: string[];
  followers?: number;
  subscribers?: number;
  likes?: number;
  videoPath?: string;
  coverPath?: string;
};

type MediaMeta = {
  duration: number;
  width: number;
  height: number;
  fileSize: number;
  audioBitRate: number;
  totalBitRate: number;
};

type CoverMeta = {
  width: number;
  height: number;
  fileSize: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function toPercent(value: number) {
  return `${clamp(Math.round(value), 0, 100)}%`;
}

function softNormalize(value: number, ceiling: number) {
  if (ceiling <= 0) return 0;
  return clamp(value / ceiling, 0, 1);
}

function scoreRange(value: number, idealMin: number, idealMax: number, floor: number, ceil: number) {
  if (value >= idealMin && value <= idealMax) return 1;
  if (value < floor || value > ceil) return 0;
  if (value < idealMin) return (value - floor) / (idealMin - floor);
  return (ceil - value) / (ceil - idealMax);
}

function tokenize(text: string) {
  return (text.toLowerCase().match(/[A-Za-z0-9]+|[\u4e00-\u9fff]+/g) ?? [])
    .map((token) => token.toLowerCase())
    .filter(Boolean);
}

function unique<T>(values: T[]) {
  return values.filter((value, index) => values.indexOf(value) === index);
}

function jaccardScore(a: string[], b: string[]) {
  const setA = unique(a);
  const setB = unique(b);
  if (setA.length === 0 || setB.length === 0) return 0;
  let intersection = 0;
  for (const item of setA) {
    if (setB.indexOf(item) >= 0) intersection += 1;
  }
  return intersection / (setA.length + setB.length - intersection);
}

const POSITIVE_WORDS = [
  "好", "美", "暖", "静", "舒适", "浪漫", "喜欢", "放松", "治愈", "惊艳", "优雅", "奢华",
  "nice", "beautiful", "luxury", "calm", "relax", "great", "love", "elegant", "warm"
];

const NEGATIVE_WORDS = [
  "差", "吵", "旧", "失望", "糟", "挤", "乱", "bad", "poor", "noisy", "disappoint", "dirty"
];

const AROUSAL_WORDS = [
  "燃", "冲", "快", "派对", "狂欢", "惊喜", "限时", "开业", "立刻", "马上",
  "party", "wow", "limited", "launch", "now", "hot"
];

const CALM_WORDS = [
  "静", "慢", "舒缓", "安静", "治愈", "闲适", "chill", "quiet", "soft", "calm"
];

function countMatches(tokens: string[], lexicon: string[]) {
  let count = 0;
  for (const token of tokens) {
    if (lexicon.some((item) => token.includes(item))) count += 1;
  }
  return count;
}

function analyzeSentiment(text: string) {
  const tokens = tokenize(text);
  const positive = countMatches(tokens, POSITIVE_WORDS);
  const negative = countMatches(tokens, NEGATIVE_WORDS);
  const arousal = countMatches(tokens, AROUSAL_WORDS);
  const calm = countMatches(tokens, CALM_WORDS);

  const sentimentScore = clamp(55 + positive * 10 - negative * 10, 5, 95);
  const arousalScore = clamp(50 + arousal * 10 - calm * 6, 5, 95);

  return {
    sentiment: sentimentScore,
    arousal: arousalScore,
  };
}

function analyzeReadability(text: string) {
  const cleaned = text.trim();
  const sentences = cleaned.split(/[。！？!?；;\n]+/).filter(Boolean);
  const tokens = tokenize(cleaned);
  const lengthScore = scoreRange(cleaned.length, 35, 180, 8, 420);
  const sentenceAvg = cleaned.length / Math.max(sentences.length, 1);
  const sentenceScore = scoreRange(sentenceAvg, 12, 36, 4, 90);
  const vocabScore = softNormalize(unique(tokens).length, 45);
  const punctuationScore = clamp((cleaned.match(/[，。！？,.!?]/g) ?? []).length / Math.max(sentences.length, 1) / 3, 0, 1);

  return round1((lengthScore * 0.35 + sentenceScore * 0.35 + vocabScore * 0.2 + punctuationScore * 0.1) * 100);
}

async function readMdls(pathname: string, fields: string[]) {
  const args = fields.flatMap((field) => ["-raw", "-name", field]);
  args.push(pathname);
  const { stdout } = await execFileAsync("/usr/bin/mdls", args);
  const values = stdout
    .trim()
    .split("\n")
    .map((line) => line.trim());

  const result: Record<string, string> = {};
  for (let index = 0; index < fields.length; index += 1) {
    result[fields[index]] = values[index] ?? "";
  }
  return result;
}

async function readSips(pathname: string) {
  const { stdout } = await execFileAsync("/usr/bin/sips", ["-g", "pixelWidth", "-g", "pixelHeight", pathname]);
  const width = Number(stdout.match(/pixelWidth:\s*(\d+)/)?.[1] ?? 0);
  const height = Number(stdout.match(/pixelHeight:\s*(\d+)/)?.[1] ?? 0);
  return { width, height };
}

async function getVideoMeta(videoPath: string): Promise<MediaMeta> {
  const absolutePath = path.join(process.cwd(), "public", videoPath.replace(/^\/+/, ""));
  const [meta, fileStats] = await Promise.all([
    readMdls(absolutePath, [
      "kMDItemDurationSeconds",
      "kMDItemPixelWidth",
      "kMDItemPixelHeight",
      "kMDItemAudioBitRate",
      "kMDItemTotalBitRate",
    ]),
    stat(absolutePath),
  ]);

  return {
    duration: Number(meta.kMDItemDurationSeconds ?? 0) || 0,
    width: Number(meta.kMDItemPixelWidth ?? 0) || 0,
    height: Number(meta.kMDItemPixelHeight ?? 0) || 0,
    audioBitRate: Number(meta.kMDItemAudioBitRate ?? 0) || 0,
    totalBitRate: Number(meta.kMDItemTotalBitRate ?? 0) || 0,
    fileSize: fileStats.size,
  };
}

async function getCoverMeta(coverPath?: string): Promise<CoverMeta | null> {
  if (!coverPath) return null;
  const absolutePath = path.join(process.cwd(), "public", coverPath.replace(/^\/+/, ""));
  const [imageMeta, fileStats] = await Promise.all([readSips(absolutePath), stat(absolutePath)]);
  return {
    width: imageMeta.width,
    height: imageMeta.height,
    fileSize: fileStats.size,
  };
}

function buildQuality(video: MediaMeta, cover: CoverMeta | null) {
  const pixels = video.width * video.height;
  const resolutionScore = softNormalize(pixels, 1920 * 1080);
  const durationScore = scoreRange(video.duration, 10, 45, 3, 120);
  const bitrateScore = softNormalize(video.totalBitRate, 3500);
  const aesthetic = round1((resolutionScore * 0.4 + durationScore * 0.35 + bitrateScore * 0.25) * 100);

  let coverQuality = 0;
  let coverAesthetic = 0;
  let face = "Unknown";

  if (cover) {
    const coverPixels = cover.width * cover.height;
    const coverResolution = softNormalize(coverPixels, 1500 * 2000);
    const bytesPerPixel = cover.fileSize / Math.max(coverPixels, 1);
    const densityScore = softNormalize(bytesPerPixel, 0.25);
    coverQuality = round1((coverResolution * 0.7 + densityScore * 0.3) * 100);

    const aspect = cover.width / Math.max(cover.height, 1);
    const portraitScore = 1 - Math.min(Math.abs(aspect - 0.75), 0.75) / 0.75;
    coverAesthetic = round1((coverResolution * 0.45 + densityScore * 0.2 + portraitScore * 0.35) * 100);
    face = cover.height > cover.width ? "Likely" : "Unknown";
  }

  return {
    aesthetic,
    coverQuality: cover ? coverQuality : 0,
    coverAesthetic: cover ? coverAesthetic : 0,
    voice: video.audioBitRate > 0 ? "Yes" : "No",
    face,
  };
}

function buildOrientalAesthetics(input: SubmissionInput, video: MediaMeta, cover: CoverMeta | null) {
  const combinedText = `${input.title ?? ""} ${input.textContent ?? ""}`;
  const tokens = tokenize(combinedText);
  const orientalWords = ["东方", "国风", "中式", "禅", "茶", "庭院", "山水", "雅", "唐", "宋", "汉", "古", "锦", "瓷"];
  const westernWords = ["法式", "欧式", "圣诞", "复古", "disco", "cocktail", "western", "bar", "party"];
  const modernWords = ["现代", "科技", "设计", "商务", "都市", "极简", "智能", "luxury", "modern"];

  const textOriental = countMatches(tokens, orientalWords);
  const textWestern = countMatches(tokens, westernWords);
  const textModern = countMatches(tokens, modernWords);

  const richness = round2(clamp((unique(tokens).length / 28) + (cover ? 0.12 : 0) + softNormalize(video.duration, 60) * 0.18, 0, 1));
  const harmony = round2(clamp(
    scoreRange(video.width / Math.max(video.height, 1), 0.65, 0.9, 0.3, 1.8) * 0.45 +
      scoreRange(video.duration, 8, 40, 3, 90) * 0.25 +
      (cover ? scoreRange(cover.width / Math.max(cover.height, 1), 0.7, 0.85, 0.3, 1.8) * 0.3 : 0.15),
    0,
    1
  ));
  const adaption = round2(clamp(
    softNormalize(video.audioBitRate, 128) * 0.25 +
      softNormalize(video.totalBitRate, 3000) * 0.3 +
      scoreRange(video.duration, 10, 45, 3, 120) * 0.45,
    0,
    1
  ));

  const oriental = round2(clamp(0.18 + textOriental * 0.18 - textWestern * 0.04, 0, 1));
  const western = round2(clamp(0.12 + textWestern * 0.18 - textOriental * 0.03, 0, 1));
  const modern = round2(clamp(0.2 + textModern * 0.18 + softNormalize(video.totalBitRate, 3500) * 0.22, 0, 1));

  return { richness, harmony, adaption, modern, oriental, western };
}

function buildConsistency(input: SubmissionInput, coverQuality: number, videoAesthetic: number, textSentiment: number, textArousal: number, video: MediaMeta) {
  const titleTokens = tokenize(input.title ?? "");
  const textTokens = tokenize(input.textContent ?? "");
  const tagTokens = tokenize((input.tags ?? []).join(" "));

  const overlapTitleTags = jaccardScore(titleTokens, tagTokens);
  const overlapTitleText = jaccardScore(titleTokens, textTokens);
  const mediaStructure = (
    scoreRange(video.duration, 8, 40, 3, 120) * 0.4 +
    softNormalize(video.totalBitRate, 3200) * 0.35 +
    softNormalize(video.audioBitRate, 128) * 0.25
  );

  const audioSentiment = clamp(video.audioBitRate > 0 ? 45 + softNormalize(video.totalBitRate, 2500) * 35 : 40, 0, 100);
  const audioArousal = clamp(35 + mediaStructure * 55, 0, 100);
  const titleTags = round1((overlapTitleTags * 0.7 + Math.min((input.tags ?? []).filter(Boolean).length / 5, 1) * 0.3) * 100);
  const titleCover = round1((overlapTitleText * 0.35 + coverQuality / 100 * 0.65) * 100);
  const titleVideo = round1((overlapTitleText * 0.4 + videoAesthetic / 100 * 0.6) * 100);
  const textAudio = round1((1 - Math.abs(textSentiment - audioSentiment) / 100) * 100);
  const textVideo = round1((1 - Math.abs(textArousal - audioArousal) / 100) * 100);
  const videoAudio = round1((1 - Math.abs(videoAesthetic - audioArousal) / 100) * 100);

  return {
    metrics: {
      titleTags: toPercent(titleTags),
      titleCover: toPercent(titleCover),
      titleVideo: toPercent(titleVideo),
      textAudio: toPercent(textAudio),
      textVideo: toPercent(textVideo),
      videoAudio: toPercent(videoAudio),
    },
    audioSentiment,
    audioArousal,
  };
}

export async function buildActualResult(input: SubmissionInput) {
  if (!input.videoPath) {
    throw new Error("Missing uploaded video path");
  }

  const [video, cover] = await Promise.all([getVideoMeta(input.videoPath), getCoverMeta(input.coverPath)]);
  const titleAnalysis = analyzeSentiment(input.title ?? "");
  const textAnalysis = analyzeSentiment(input.textContent ?? "");
  const readability = analyzeReadability(input.textContent ?? "");
  const quality = buildQuality(video, cover);
  const orientalAesthetics = buildOrientalAesthetics(input, video, cover);
  const consistency = buildConsistency(
    input,
    quality.coverQuality,
    quality.aesthetic,
    textAnalysis.sentiment,
    textAnalysis.arousal,
    video
  );

  const creatorBase = clamp(
    Math.log10(Math.max(Number(input.followers ?? 0), 1)) * 12 +
      Math.log10(Math.max(Number(input.subscribers ?? 0), 1)) * 8 +
      Math.log10(Math.max(Number(input.likes ?? 0), 1)) * 6,
    0,
    35
  );

  const contentBase =
    quality.aesthetic * 0.18 +
    readability * 0.12 +
    Number(consistency.metrics.titleVideo.replace("%", "")) * 0.14 +
    Number(consistency.metrics.textVideo.replace("%", "")) * 0.14 +
    orientalAesthetics.harmony * 18 +
    orientalAesthetics.richness * 10;

  const localScore = round1(clamp(contentBase * 0.55 + creatorBase, 0, 100));
  const globalScore = round1(clamp(contentBase * 0.5 + creatorBase * 0.65, 0, 100));

  return {
    source: "actual-upload",
    engagementScore: {
      local: localScore,
      global: globalScore,
    },
    analysis: {
      quality: {
        aesthetic: quality.aesthetic.toFixed(1),
        readability: readability.toFixed(1),
        coverQuality: quality.coverQuality.toFixed(1),
        coverAesthetic: quality.coverAesthetic.toFixed(1),
        voice: quality.voice,
        face: quality.face,
      },
      sentiment: {
        title: toPercent(titleAnalysis.sentiment),
        text: toPercent(textAnalysis.sentiment),
        textArousal: toPercent(textAnalysis.arousal),
        audio: toPercent(consistency.audioSentiment),
        audioArousal: toPercent(consistency.audioArousal),
      },
      consistency: consistency.metrics,
      orientalAesthetics,
    },
  };
}
