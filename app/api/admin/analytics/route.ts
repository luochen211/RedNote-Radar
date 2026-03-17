import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !isAdminRole((session.user as any).role)) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const [users, submissions, logs] = await Promise.all([
        prisma.user.count(),
        prisma.submission.count(),
        prisma.usageLog.count(),
    ]);

    const [actions, locations] = await Promise.all([
        prisma.usageLog.groupBy({
            by: ["action"],
            _count: { action: true },
            orderBy: { _count: { action: "desc" } },
            take: 5,
        }),
        prisma.usageLog.groupBy({
            by: ["location"],
            _count: { location: true },
            orderBy: { _count: { location: "desc" } },
            take: 5,
        }),
    ]);

    return NextResponse.json({
        totals: { users, submissions, logs },
        topActions: actions.map((item) => ({
            label: item.action || "Unknown",
            count: item._count.action,
        })),
        topLocations: locations.map((item) => ({
            label: item.location || "Unknown",
            count: item._count.location,
        })),
    });
}
