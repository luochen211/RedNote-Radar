import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { buildActualResult } from "@/lib/actualAnalysis";
import { requestAiDiagnosis } from "@/lib/aiDiagnosis";
import { isAdminRole } from "@/lib/roles";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;

    try {
        const submission = await prisma.submission.findUnique({
            where: { id },
        });

        if (!submission) {
            return NextResponse.json({ message: "Task not found" }, { status: 404 });
        }

        const sessionUserId = (session.user as any).id as string | undefined;
        const sessionUsername = session.user?.name;
        const resolvedUser =
            sessionUserId && !sessionUserId.startsWith("quick-")
                ? await prisma.user.findUnique({ where: { id: sessionUserId } })
                : sessionUsername
                    ? await prisma.user.findUnique({ where: { username: sessionUsername } })
                    : null;
        const currentUserId = resolvedUser?.id ?? sessionUserId;
        const currentRole = (session.user as any).role;
        if (submission.userId !== currentUserId && !isAdminRole(currentRole)) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        if (submission.status === 'PROCESSING') {
            const timeDiff = Date.now() - new Date(submission.createdAt).getTime();

            if (timeDiff > 1000) {
                const inputData = JSON.parse(submission.inputData);
                try {
                    const result = await buildActualResult(inputData);
                    const aiDiagnosis = await requestAiDiagnosis(inputData, result);
                    const completedResult = aiDiagnosis ? { ...result, aiDiagnosis } : result;
                    const updated = await prisma.submission.update({
                        where: { id },
                        data: {
                            status: 'COMPLETED',
                            resultData: JSON.stringify(completedResult)
                        }
                    });
                    return NextResponse.json(updated);
                } catch (error) {
                    console.error("Task processing failed:", error);
                    const failed = await prisma.submission.update({
                        where: { id },
                        data: {
                            status: 'FAILED',
                            resultData: JSON.stringify({
                                error: "Analysis failed"
                            })
                        }
                    });
                    return NextResponse.json(failed);
                }
            }
        }

        return NextResponse.json(submission);
    } catch (error) {
        return NextResponse.json({ message: "Internal error" }, { status: 500 });
    }
}
