import path from "path";
import { spawn } from "child_process";

export interface BottleModelOutput {
    modelVersion: string;
    engagementScore: {
        local: number;
        global: number;
    };
    raw?: {
        local?: number;
        global?: number;
    };
    testDimensions?: {
        input?: {
            textTokens?: number;
            videoFrames?: number;
            videoFeatureDim?: number;
            audioFrames?: number;
            audioFeatureDim?: number;
        };
        output?: {
            rawLocal?: number | null;
            rawGlobal?: number | null;
        };
    };
}

function clampScore(value: unknown) {
    const n = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
}

export async function runBottleInference(input: Record<string, unknown>): Promise<BottleModelOutput> {
    const scriptPath = path.join(process.cwd(), "scripts", "bottle_infer.py");

    return new Promise((resolve, reject) => {
        const child = spawn("python3", [scriptPath], {
            cwd: process.cwd(),
            env: {
                ...process.env,
                PYTHONUNBUFFERED: "1",
            },
            stdio: ["pipe", "pipe", "pipe"],
        });

        let stdout = "";
        let stderr = "";
        const timer = setTimeout(() => {
            child.kill("SIGKILL");
        }, 180000);

        child.stdout.on("data", (chunk: Buffer | string) => {
            stdout += String(chunk);
        });
        child.stderr.on("data", (chunk: Buffer | string) => {
            stderr += String(chunk);
        });

        child.on("error", (error) => {
            clearTimeout(timer);
            reject(error);
        });

        child.on("close", (code) => {
            clearTimeout(timer);

            const rawOut = stdout.trim();
            if (code !== 0) {
                reject(new Error(stderr.trim() || rawOut || `Python process exited with code ${code}`));
                return;
            }

            let parsed: any;
            try {
                parsed = JSON.parse(rawOut);
            } catch {
                reject(new Error(`Invalid model JSON output: ${rawOut.slice(0, 300)}`));
                return;
            }

            if (parsed?.error) {
                reject(new Error(String(parsed.error)));
                return;
            }

            const modelVersion = String(parsed?.modelVersion || "bottle-checkpoint-v1");
            const local = clampScore(parsed?.engagementScore?.local);
            const global = clampScore(parsed?.engagementScore?.global);

            resolve({
                modelVersion,
                engagementScore: { local, global },
                raw: parsed?.raw,
                testDimensions: parsed?.testDimensions,
            });
        });

        try {
            child.stdin.write(JSON.stringify(input));
            child.stdin.end();
        } catch (error) {
            clearTimeout(timer);
            child.kill("SIGKILL");
            reject(error);
        }
    });
}
