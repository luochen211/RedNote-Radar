import path from "path";
import { spawn, type ChildProcessWithoutNullStreams } from "child_process";

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

interface WorkerResponse {
    requestId?: string;
    ok?: boolean;
    result?: BottleModelOutput;
    error?: string;
}

interface PendingRequest {
    resolve: (value: BottleModelOutput) => void;
    reject: (reason?: unknown) => void;
    timer: NodeJS.Timeout;
}

let worker: ChildProcessWithoutNullStreams | null = null;
let stdoutBuffer = "";
let requestSeq = 0;
const pendingRequests = new Map<string, PendingRequest>();

function clampScore(value: unknown) {
    const n = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
}

function resetWorker(reason: string) {
    if (worker) {
        try {
            worker.kill("SIGKILL");
        } catch {
            // ignore
        }
    }
    worker = null;
    stdoutBuffer = "";

    pendingRequests.forEach((pending, id) => {
        clearTimeout(pending.timer);
        pending.reject(new Error(`Model worker reset (${reason}), request=${id}`));
    });
    pendingRequests.clear();
}

function handleWorkerLine(line: string) {
    let parsed: WorkerResponse;
    try {
        parsed = JSON.parse(line);
    } catch {
        return;
    }

    const requestId = String(parsed.requestId || "");
    if (!requestId) return;

    const pending = pendingRequests.get(requestId);
    if (!pending) return;
    pendingRequests.delete(requestId);
    clearTimeout(pending.timer);

    if (!parsed.ok) {
        pending.reject(new Error(parsed.error || "Unknown worker error"));
        return;
    }

    const result = parsed.result || ({} as BottleModelOutput);
    const modelVersion = String(result.modelVersion || "bottle-checkpoint-v2");
    const local = clampScore(result.engagementScore?.local);
    const global = clampScore(result.engagementScore?.global);

    pending.resolve({
        modelVersion,
        engagementScore: { local, global },
        raw: result.raw,
        testDimensions: result.testDimensions,
    });
}

function ensureWorker(): ChildProcessWithoutNullStreams {
    if (worker && !worker.killed) return worker;

    const scriptPath = path.join(process.cwd(), "scripts", "bottle_infer.py");
    worker = spawn("python3", [scriptPath, "--serve"], {
        cwd: process.cwd(),
        env: {
            ...process.env,
            PYTHONUNBUFFERED: "1",
        },
        stdio: ["pipe", "pipe", "pipe"],
    });

    worker.stdout.on("data", (chunk: Buffer | string) => {
        stdoutBuffer += String(chunk);
        let index = stdoutBuffer.indexOf("\n");
        while (index >= 0) {
            const line = stdoutBuffer.slice(0, index).trim();
            stdoutBuffer = stdoutBuffer.slice(index + 1);
            if (line) handleWorkerLine(line);
            index = stdoutBuffer.indexOf("\n");
        }
    });

    worker.stderr.on("data", (_chunk: Buffer | string) => {
        // Keep stderr attached for debugging if needed, but avoid noisy logs in production route.
    });

    worker.on("error", (error) => {
        resetWorker(error.message || "spawn error");
    });

    worker.on("close", (code, signal) => {
        resetWorker(`closed code=${code ?? "null"} signal=${signal ?? "null"}`);
    });

    return worker;
}

export async function runBottleInference(input: Record<string, unknown>): Promise<BottleModelOutput> {
    const proc = ensureWorker();
    const requestId = `req_${Date.now()}_${++requestSeq}`;

    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            pendingRequests.delete(requestId);
            reject(new Error(`Model inference timeout for ${requestId}`));
        }, 120000);

        pendingRequests.set(requestId, { resolve, reject, timer });

        try {
            proc.stdin.write(JSON.stringify({ requestId, payload: input }) + "\n");
        } catch (error) {
            clearTimeout(timer);
            pendingRequests.delete(requestId);
            reject(error);
        }
    });
}
