import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

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
        const submission = await prisma.submission.findUnique({
            where: { id },
        });

        if (!submission) {
            return NextResponse.json({ message: "Task not found" }, { status: 404 });
        }

        // Checking if user owns this submission
        // (Optional: Admin can view all)
        // const userId = (session.user as any).id; 
        // if (submission.userId !== userId && (session.user as any).role !== 'admin') ...

        // MOCK PROCESSING LOGIC
        // If status is PROCESSING, checks time. If > 10 seconds have passed, mark as COMPLETED.
        if (submission.status === 'PROCESSING') {
            const timeDiff = Date.now() - new Date(submission.createdAt).getTime();

            if (timeDiff > 10000) { // 10 seconds mock delay
                // Generate mock result
                const mockResult = {
                    engagementScore: { local: Math.floor(Math.random() * 20) + 80, global: Math.floor(Math.random() * 30) + 60 },
                    analysis: {
                        quality: {
                            aesthetic: (Math.random() * 20 + 80).toFixed(1),
                            readability: (Math.random() * 10 + 85).toFixed(1),
                            coverQuality: (Math.random() * 15 + 80).toFixed(1),
                            coverAesthetic: (Math.random() * 20 + 70).toFixed(1),
                            voice: Math.random() > 0.5 ? "Yes" : "No",
                            face: Math.random() > 0.5 ? "Yes" : "No"
                        },
                        sentiment: {
                            title: Math.floor(Math.random() * 30 + 70) + "%",
                            text: Math.floor(Math.random() * 30 + 70) + "%",
                            textArousal: Math.floor(Math.random() * 40 + 50) + "%",
                            audio: Math.floor(Math.random() * 20 + 80) + "%",
                            audioArousal: Math.floor(Math.random() * 30 + 60) + "%"
                        },
                        consistency: {
                            titleTags: Math.floor(Math.random() * 10 + 90) + "%",
                            titleCover: Math.floor(Math.random() * 20 + 80) + "%",
                            titleVideo: Math.floor(Math.random() * 15 + 85) + "%",
                            textAudio: Math.floor(Math.random() * 20 + 75) + "%",
                            textVideo: Math.floor(Math.random() * 10 + 88) + "%",
                            videoAudio: Math.floor(Math.random() * 10 + 90) + "%"
                        },
                        orientalAesthetics: {
                            richness: Number((Math.random() * 0.4 + 0.6).toFixed(2)),
                            harmony: Number((Math.random() * 0.3 + 0.7).toFixed(2)),
                            adaption: Number((Math.random() * 0.2 + 0.8).toFixed(2)),
                            modern: Number((Math.random() * 0.3 + 0.6).toFixed(2)),
                            oriental: Number((Math.random() * 0.2 + 0.8).toFixed(2)),
                            western: Number((Math.random() * 0.4 + 0.4).toFixed(2))
                        }
                    }
                };

                const updated = await prisma.submission.update({
                    where: { id },
                    data: {
                        status: 'COMPLETED',
                        resultData: JSON.stringify(mockResult)
                    }
                });

                const viewerId = (session.user as any).id as string | undefined;
                const role = (session.user as any).role as string | undefined;
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

                return NextResponse.json(updated);
            }
        }

        const viewerId = (session.user as any).id as string | undefined;
        const role = (session.user as any).role as string | undefined;
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

        return NextResponse.json(submission);
    } catch (error) {
        return NextResponse.json({ message: "Internal error" }, { status: 500 });
    }
}
