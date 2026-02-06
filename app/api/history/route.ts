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

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const submissions = await prisma.submission.findMany({
            where: {
                user: { username: session.user?.name! }
            },
            orderBy: { createdAt: 'desc' }
        });

        const userId = (session.user as any).id as string | undefined;
        const role = (session.user as any).role as string | undefined;
        if (userId && role !== "ADMIN") {
            const { ip, location } = getRequestMeta(req);
            await prisma.usageLog.create({
                data: {
                    userId,
                    action: "VIEW_HISTORY",
                    ip,
                    location,
                }
            });
        }

        return NextResponse.json(submissions);
    } catch (error) {
        return NextResponse.json({ message: "Error fetching history" }, { status: 500 });
    }
}
