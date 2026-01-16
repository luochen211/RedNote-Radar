import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const subs = await prisma.submission.findMany({
        include: { user: { select: { username: true } } },
        orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(subs);
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

    await prisma.submission.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
}
