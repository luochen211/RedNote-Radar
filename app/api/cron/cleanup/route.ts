import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    // Check for some secret header in production to prevent abuse
    // const authHeader = req.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) ...

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
