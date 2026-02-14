import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { buildPredictionResult } from "@/lib/predictionEngine";
import { runBottleInference } from "@/lib/bottleModel";
import { ensureResultCompatibility } from "@/lib/resultCompatibility";

const LOCK_TTL_MS = 10 * 60 * 1000;
const VIEW_LOG_THROTTLE_MS = 60 * 1000;

function getRequestMeta(req: Request) {
    const ipForwarded = req.headers.get("x-forwarded-for");
    const ip = ipForwarded?.split(",")[0]?.trim()
        || req.headers.get("x-real-ip")
        || "unknown";
    const country = req.headers.get("x-vercel-ip-country");
    const city = req.headers.get("x-vercel-ip-city");
    const location = [country, city].filter(Boolean).join("/") || "unknown";
    return { ip, location };
}

function parseProcessingLock(resultData: string | null) {
    if (!resultData) return null;
    try {
        const parsed = JSON.parse(resultData) as { _processingLock?: { token?: string; startedAt?: string } };
        const lock = parsed?._processingLock;
        if (!lock?.startedAt) return null;
        const startedMs = new Date(lock.startedAt).getTime();
        if (!Number.isFinite(startedMs)) return null;
        return { token: String(lock.token || ""), startedMs };
    } catch {
        return null;
    }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;

    try {
        const role = (session.user as any).role as string | undefined;
        const viewerId = (session.user as any).id as string | undefined;
        const username = session.user?.name || "";
        const ownershipFilter = viewerId
            ? { userId: viewerId }
            : username
                ? { user: { username } }
                : null;

        if (role !== "ADMIN" && !ownershipFilter) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const submissionWhere = role === "ADMIN"
            ? { id }
            : {
                id,
                ...ownershipFilter!,
            };

        const submission = await prisma.submission.findFirst({ where: submissionWhere });

        if (!submission) {
            return NextResponse.json({ message: "Task not found" }, { status: 404 });
        }

        let currentSubmission = submission;
        const lock = parseProcessingLock(currentSubmission.resultData);
        const lockExpired = lock ? (Date.now() - lock.startedMs > LOCK_TTL_MS) : false;
        const shouldAttemptProcess =
            (currentSubmission.status === "PENDING" || currentSubmission.status === "PROCESSING")
            && (!currentSubmission.resultData || lockExpired);

        if (shouldAttemptProcess) {
            const lockPayload = JSON.stringify({
                _processingLock: {
                    token: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                    startedAt: new Date().toISOString(),
                }
            });

            const claimWhere: Record<string, unknown> = {
                id: currentSubmission.id,
                status: { in: ["PENDING", "PROCESSING"] },
            };
            if (!currentSubmission.resultData) {
                claimWhere.resultData = null;
            } else if (lockExpired) {
                claimWhere.resultData = currentSubmission.resultData;
            }

            const claimed = await prisma.submission.updateMany({
                where: claimWhere as any,
                data: {
                    status: "PROCESSING",
                    resultData: lockPayload,
                },
            });

            if (claimed.count === 1) {
                try {
                    let inputData: Record<string, unknown> = {};
                    try {
                        inputData = JSON.parse(currentSubmission.inputData || "{}");
                    } catch {
                        inputData = {};
                    }

                    const analysisBase = await buildPredictionResult(inputData);
                    const modelResult = await runBottleInference(inputData);
                    const result = ensureResultCompatibility({
                        ...analysisBase,
                        modelVersion: modelResult.modelVersion,
                        processedAt: new Date().toISOString(),
                        engagementScore: {
                            local: modelResult.engagementScore.local,
                            global: modelResult.engagementScore.global,
                        },
                        testDimensions: modelResult.testDimensions,
                    });

                    await prisma.submission.updateMany({
                        where: {
                            id: currentSubmission.id,
                            resultData: lockPayload,
                        },
                        data: {
                            status: "COMPLETED",
                            resultData: JSON.stringify(result),
                        },
                    });
                } catch (error) {
                    await prisma.submission.updateMany({
                        where: {
                            id: currentSubmission.id,
                            resultData: lockPayload,
                        },
                        data: {
                            status: "FAILED",
                            resultData: JSON.stringify({
                                message: "Prediction pipeline failed",
                                detail: error instanceof Error ? error.message : "Unknown error",
                            }),
                        },
                    });
                }
            }

            const latest = await prisma.submission.findFirst({ where: submissionWhere });
            if (latest) currentSubmission = latest;
        }

        if (viewerId && role !== "ADMIN") {
            const lastView = await prisma.usageLog.findFirst({
                where: {
                    userId: viewerId,
                    action: "VIEW_TASK_STATUS",
                },
                orderBy: { timestamp: "desc" },
                select: { timestamp: true },
            });

            const shouldWriteViewLog = !lastView
                || (Date.now() - new Date(lastView.timestamp).getTime()) > VIEW_LOG_THROTTLE_MS;

            if (shouldWriteViewLog) {
                const { ip, location } = getRequestMeta(req);
                await prisma.usageLog.create({
                    data: {
                        userId: viewerId,
                        action: "VIEW_TASK_STATUS",
                        ip,
                        location,
                    }
                });
            }
        }

        return NextResponse.json(currentSubmission);
    } catch (error) {
        return NextResponse.json({ message: "Internal error" }, { status: 500 });
    }
}
