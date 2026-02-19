import { existsSync } from "fs";
import path from "path";

const MODEL_ASSETS_ENV = "MODEL_ASSETS_DIR";
const STANDARD_ASSETS_REL = "model_assets";
const LEGACY_ASSETS_REL = "网页代码/1.预测页代码与部分分析页代码";

function hasAssetMarkers(candidate: string) {
    return [
        path.join(candidate, "weight"),
        path.join(candidate, "benchmarks"),
        path.join(candidate, "zyj_exceltojason"),
        path.join(candidate, "szz_featureextraction"),
    ].some((item) => existsSync(item));
}

function toAbsolutePath(rawPath: string) {
    const value = rawPath.trim();
    if (!value) return "";
    return path.isAbsolute(value) ? value : path.join(process.cwd(), value);
}

export function getModelAssetsDirCandidates() {
    const envPath = toAbsolutePath(process.env[MODEL_ASSETS_ENV] || "");
    const standardPath = path.join(process.cwd(), STANDARD_ASSETS_REL);
    const legacyPath = path.join(process.cwd(), LEGACY_ASSETS_REL);

    const candidates = [envPath, standardPath, legacyPath].filter(Boolean);
    return Array.from(new Set(candidates));
}

export function resolveModelAssetsDir() {
    const candidates = getModelAssetsDirCandidates();
    const existing = candidates.find((candidate) => existsSync(candidate) && hasAssetMarkers(candidate));
    if (existing) return existing;

    const fallbackExisting = candidates.find((candidate) => existsSync(candidate));
    if (fallbackExisting) return fallbackExisting;

    return candidates[0];
}

export function getModelScriptPath() {
    return path.join(process.cwd(), "scripts", "bottle_infer.py");
}

export function getWeightRootDir() {
    return path.join(resolveModelAssetsDir(), "weight");
}

export function getModelCodeRootDir() {
    return path.join(getWeightRootDir(), "code");
}

export function getBertDir() {
    return path.join(getWeightRootDir(), "bert");
}

export function getCheckpointPaths() {
    const codeRoot = getModelCodeRootDir();
    return {
        all: path.join(codeRoot, "checkpoints/XIAOHONGSHU/BOTTLE/BOTTLE_best_all29_bs1.pth"),
        icon: path.join(codeRoot, "checkpoints/XIAOHONGSHU/BOTTLE/BOTTLE_best_icon0_bs1_new.pth"),
    };
}

export function getGlobalBenchmarkFiles() {
    const assetsRoot = resolveModelAssetsDir();
    return [
        path.join(assetsRoot, "benchmarks/global_likes.json"),
        path.join(assetsRoot, "zyj_exceltojason/xiaohongshu_.json"),
        path.join(assetsRoot, "zyj_exceltojason/xiaohongshu.json"),
        path.join(assetsRoot, "zyj_exceltojason/xhs.json"),
    ];
}

export function getLocalBenchmarkFiles() {
    const assetsRoot = resolveModelAssetsDir();
    return [
        path.join(assetsRoot, "benchmarks/local_likes.json"),
        path.join(assetsRoot, "szz_featureextraction/icon_data_all.json"),
        path.join(assetsRoot, "szz_featureextraction/icon_data_1.json"),
        path.join(assetsRoot, "zyj_exceltojason/icon_data_feature.json"),
    ];
}

export function getModelAssetsConfigHint() {
    return `Use env ${MODEL_ASSETS_ENV} to point to model assets root`;
}
