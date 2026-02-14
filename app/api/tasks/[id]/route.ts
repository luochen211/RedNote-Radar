import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { buildPredictionResult } from "@/lib/predictionEngine";
import { runBottleInference } from "@/lib/bottleModel";

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

        const submission = await prisma.submission.findFirst({
            where: role === "ADMIN"
                ? { id }
                : {
                    id,
                    ...ownershipFilter!,
                },
        });

        if (!submission) {
            return NextResponse.json({ message: "Task not found" }, { status: 404 });
        }

        let currentSubmission = submission;
        const shouldProcess =
            (currentSubmission.status === "PENDING" || currentSubmission.status === "PROCESSING")
            && !currentSubmission.resultData;

        if (shouldProcess) {
            try {
                let inputData: Record<string, unknown> = {};
                try {
                    inputData = JSON.parse(currentSubmission.inputData || "{}");
                } catch {
                    inputData = {};
                }

                const analysisBase = await buildPredictionResult(inputData);
                const modelResult = await runBottleInference(inputData);
                const result = {
                    ...analysisBase,
                    modelVersion: modelResult.modelVersion,
                    processedAt: new Date().toISOString(),
                    engagementScore: {
                        local: modelResult.engagementScore.local,
                        global: modelResult.engagementScore.global,
                    },
                };

                currentSubmission = await prisma.submission.update({
                    where: { id: currentSubmission.id },
                    data: {
                        status: "COMPLETED",
                        resultData: JSON.stringify(result),
                    },
                });
            } catch (error) {
                currentSubmission = await prisma.submission.update({
                    where: { id: currentSubmission.id },
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

        if (viewerId && role !== "ADMIN") {
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

        return NextResponse.json(currentSubmission);
    } catch (error) {
        return NextResponse.json({ message: "Internal error" }, { status: 500 });
    }
}
