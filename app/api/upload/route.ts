import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { mkdir, readdir, rename, writeFile } from "fs/promises";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import bcrypt from "bcryptjs";

const execFileAsync = promisify(execFile);

function sanitizeFilename(filename: string) {
    return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function generateDefaultCover(videoPath: string, uploadDir: string) {
    const thumbDir = path.join(uploadDir, "__thumb");
    await mkdir(thumbDir, { recursive: true });

    await execFileAsync("/usr/bin/qlmanage", [
        "-t",
        "-s",
        "1200",
        "-o",
        thumbDir,
        videoPath,
    ]);

    const generatedFiles = await readdir(thumbDir);
    const thumbnailName = generatedFiles.find((file) => file.endsWith(".png"));
    if (!thumbnailName) return null;

    const finalName = "cover.png";
    await rename(path.join(thumbDir, thumbnailName), path.join(uploadDir, finalName));
    return `/uploads/${path.basename(uploadDir)}/${finalName}`;
}

async function resolveSessionUser(session: any) {
    const sessionUserId = (session.user as any).id as string | undefined;
    const username = session.user?.name;

    if (!username) return null;

    if (sessionUserId && !sessionUserId.startsWith("quick-")) {
        const existingById = await prisma.user.findUnique({ where: { id: sessionUserId } });
        if (existingById) return existingById;
    }

    const existingByName = await prisma.user.findUnique({ where: { username } });
    if (existingByName) return existingByName;

    const fallbackPassword = await bcrypt.hash("dev-user", 10);
    return prisma.user.create({
        data: {
            username,
            password: fallbackPassword,
            role: (session.user as any).role ?? "USER",
        },
    });
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
        const title = String(formData.get("title") ?? "").trim();
        const textContent = String(formData.get("textContent") ?? "");
        const tags = JSON.parse(String(formData.get("tags") ?? "[]"));
        const followers = Number(formData.get("followers") ?? 0) || 0;
        const subscribers = Number(formData.get("subscribers") ?? 0) || 0;
        const likes = Number(formData.get("likes") ?? 0) || 0;
        const province = String(formData.get("province") ?? "").trim();

        // Basic validation
        if (!(video instanceof File) || !title || !province) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const currentUser = await resolveSessionUser(session);
        if (!currentUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const submission = await prisma.submission.create({
            data: {
                userId: currentUser.id,
                inputData: JSON.stringify({ title, textContent, tags, followers, subscribers, likes, province }),
                status: "PROCESSING",
            },
        });

        const uploadDir = path.join(process.cwd(), "public", "uploads", submission.id);
        await mkdir(uploadDir, { recursive: true });

        const savedVideoName = `video${path.extname(video.name || ".mp4") || ".mp4"}`;
        const videoPath = path.join(uploadDir, sanitizeFilename(savedVideoName));
        const videoBuffer = Buffer.from(await video.arrayBuffer());
        await writeFile(videoPath, videoBuffer);

        let publicCoverPath: string | undefined;
        if (cover instanceof File && cover.size > 0) {
            const savedCoverName = `cover${path.extname(cover.name || ".jpg") || ".jpg"}`;
            const coverPath = path.join(uploadDir, sanitizeFilename(savedCoverName));
            const coverBuffer = Buffer.from(await cover.arrayBuffer());
            await writeFile(coverPath, coverBuffer);
            publicCoverPath = `/uploads/${submission.id}/${sanitizeFilename(savedCoverName)}`;
        } else {
            try {
                publicCoverPath = await generateDefaultCover(videoPath, uploadDir) ?? undefined;
            } catch (error) {
                console.warn("Failed to generate default cover from first frame:", error);
            }
        }

        const enrichedInput = {
            title,
            textContent,
            tags,
            followers,
            subscribers,
            likes,
            province,
            videoName: video.name,
            coverName: cover instanceof File ? cover.name : "",
            videoPath: `/uploads/${submission.id}/${sanitizeFilename(savedVideoName)}`,
            coverPath: publicCoverPath,
        };

        await prisma.submission.update({
            where: { id: submission.id },
            data: {
                inputData: JSON.stringify(enrichedInput),
            }
        });

        // Log upload action
        await prisma.usageLog.create({
            data: {
                userId: submission.userId,
                action: "UPLOAD",
                location: "Localhost",
            }
        });

        return NextResponse.json({ id: submission.id, message: "Upload successful" }, { status: 201 });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
