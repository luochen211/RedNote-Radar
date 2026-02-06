import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

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

async function saveUploadFile(submissionId: string, file: File, key: string) {
    const uploadDir = path.join("/tmp", "hotel-forecast-uploads", submissionId);
    await mkdir(uploadDir, { recursive: true });

    const originalExt = path.extname(file.name || "");
    const ext = originalExt || (file.type.includes("mp4") ? ".mp4" : ".bin");
    const savePath = path.join(uploadDir, `${key}${ext}`);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(savePath, buffer);
    return savePath;
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const video = formData.get("video");
        const cover = formData.get("cover");
        const title = String(formData.get("title") || "").trim();
        const textContent = String(formData.get("textContent") || "");
        const rawTags = String(formData.get("tags") || "[]");
        const followers = Number(formData.get("followers") || 0);
        const subscribers = Number(formData.get("subscribers") || 0);
        const likes = Number(formData.get("likes") || 0);
        const province = String(formData.get("province") || "");
        let tags: string[] = [];

        try {
            tags = JSON.parse(rawTags);
        } catch {
            tags = [];
        }

        // Basic validation
        if (!(video instanceof File) || !title || !province) {
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
                inputData: JSON.stringify({
                    title,
                    textContent,
                    tags,
                    followers,
                    subscribers,
                    likes,
                    province,
                    videoOriginalName: video.name
                }),
                status: "PROCESSING",
            },
        });

        const savedVideoPath = await saveUploadFile(submission.id, video, "video");
        let savedCoverPath = "";
        if (cover instanceof File) {
            savedCoverPath = await saveUploadFile(submission.id, cover, "cover");
        }

        await prisma.submission.update({
            where: { id: submission.id },
            data: {
                inputData: JSON.stringify({
                    title,
                    textContent,
                    tags,
                    followers,
                    subscribers,
                    likes,
                    province,
                    videoOriginalName: video.name,
                    coverOriginalName: cover instanceof File ? cover.name : "",
                    videoStoredPath: savedVideoPath,
                    coverStoredPath: savedCoverPath
                }),
            }
        });

        // Log upload action
        const role = (session.user as any).role as string | undefined;
        if (role !== "ADMIN") {
            const { ip, location } = getRequestMeta(req);
            await prisma.usageLog.create({
                data: {
                    userId: submission.userId,
                    action: "UPLOAD_CREATE",
                    ip,
                    location,
                }
            });
        }

        return NextResponse.json({ id: submission.id, message: "Upload successful" }, { status: 201 });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
