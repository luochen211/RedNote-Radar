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

    const logs = await prisma.usageLog.findMany({
        include: {
            user: {
                select: {
                    username: true,
                    role: true,
                }
            }
        },
        orderBy: { timestamp: "desc" },
        take: 100,
    });

    return NextResponse.json(logs);
}
