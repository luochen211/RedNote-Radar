import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

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
        return NextResponse.json(submissions);
    } catch (error) {
        return NextResponse.json({ message: "Error fetching history" }, { status: 500 });
    }
}
