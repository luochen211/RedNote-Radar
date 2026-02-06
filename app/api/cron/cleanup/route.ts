import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const expectedSecret = process.env.CRON_SECRET;
    if (expectedSecret) {
        const authHeader = req.headers.get("authorization");
        if (authHeader !== `Bearer ${expectedSecret}`) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
    }

    try {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const deleted = await prisma.submission.deleteMany({
            where: {
                createdAt: {
                    lt: threeMonthsAgo
                }
            }
        });

        return NextResponse.json({ message: "Cleanup complete", count: deleted.count });
    } catch (error) {
        console.error("Cleanup error:", error);
        return NextResponse.json({ message: "Error" }, { status: 500 });
    }
}
