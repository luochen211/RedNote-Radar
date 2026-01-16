import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await req.json();

        // Basic validation
        if (!data.video || !data.title) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const userId = (session.user as any).id;

        if (!userId) {
            // Fallback if id is missing in session (shouldn't happen with correct callbacks)
            const user = await prisma.user.findUnique({ where: { username: session.user.name! } });
            if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const submission = await prisma.submission.create({
            data: {
                userId: userId || (await prisma.user.findUnique({ where: { username: session.user.name! } }))!.id,
                inputData: JSON.stringify(data),
                status: "PROCESSING",
            },
        });

        // Log upload action
        await prisma.usageLog.create({
            data: {
                userId: submission.userId,
                action: "UPLOAD",
                location: "Localhost",
            }
        });

        // Simulate async task (Mock)
        // In a real scenario, this would push to a queue or external service.
        // Here we just let it be 'PROCESSING' and the client will poll.
        // We can simulate a background process updating it after a delay, 
        // but in serverless, we can't easily fire-and-forget long tasks without a queue.
        // For this MVP, we might handle it in the polling API or just assume it finishes quickly.

        // Let's create a "Mock" completion in the background if possible, or just rely on the polling endpoint to "fake" progress.

        return NextResponse.json({ id: submission.id, message: "Upload successful" }, { status: 201 });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
