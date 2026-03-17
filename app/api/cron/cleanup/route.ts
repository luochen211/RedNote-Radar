import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { removeSubmissionUploads } from "@/lib/submissions";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    // Check for some secret header in production to prevent abuse
    // const authHeader = req.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) ...

    try {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const expiredSubmissions = await prisma.submission.findMany({
            where: {
                createdAt: {
                    lt: threeMonthsAgo
                }
            },
            select: {
                id: true
            }
        });

        if (expiredSubmissions.length === 0) {
            return NextResponse.json({ message: "Cleanup complete", count: 0 });
        }

        await prisma.submission.deleteMany({
            where: {
                id: {
                    in: expiredSubmissions.map((submission) => submission.id)
                }
            }
        });

        await Promise.all(expiredSubmissions.map((submission) => removeSubmissionUploads(submission.id)));

        return NextResponse.json({ message: "Cleanup complete", count: expiredSubmissions.length });
    } catch (error) {
        console.error("Cleanup error:", error);
        return NextResponse.json({ message: "Error" }, { status: 500 });
    }
}
