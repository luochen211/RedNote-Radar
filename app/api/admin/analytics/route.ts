import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const [totalUsers, totalSubmissions, logRows] = await Promise.all([
        prisma.user.count({
            where: { role: { not: "ADMIN" } }
        }),
        prisma.submission.count({
            where: {
                user: {
                    is: {
                        role: { not: "ADMIN" }
                    }
                }
            }
        }),
        prisma.usageLog.findMany({
            where: {
                user: {
                    is: {
                        role: "USER",
                    }
                }
            },
            select: {
                action: true,
                location: true,
                timestamp: true,
            }
        }),
    ]);

    const totalLogs = logRows.length;
    const actionMap: Record<string, number> = {};
    const locationMap: Record<string, number> = {};
    const dailyMap: Record<string, number> = {};
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);

    for (const row of logRows) {
        actionMap[row.action] = (actionMap[row.action] || 0) + 1;
        const location = row.location || "unknown";
        locationMap[location] = (locationMap[location] || 0) + 1;

        if (row.timestamp >= fromDate) {
            const key = row.timestamp.toISOString().slice(0, 10);
            dailyMap[key] = (dailyMap[key] || 0) + 1;
        }
    }

    const actionCounts = Object.entries(actionMap).map(([action, count]) => ({ action, count }));
    const locationCounts = Object.entries(locationMap).map(([location, count]) => ({ location, count }));
    const dailyUsage = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

    return NextResponse.json({
        summary: {
            totalUsers,
            totalSubmissions,
            totalLogs,
        },
        actionCounts,
        locationCounts,
        dailyUsage,
    });
}
