import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") || 200), 1000);

    const logs = await prisma.usageLog.findMany({
        where: {
            user: {
                is: {
                    role: "USER",
                }
            }
        },
        include: {
            user: {
                select: {
                    username: true,
                    role: true,
                }
            }
        },
        orderBy: { timestamp: "desc" },
        take: limit,
    });

    return NextResponse.json(logs);
}
