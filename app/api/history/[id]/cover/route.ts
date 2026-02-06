import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { readFile } from "fs/promises";
import path from "path";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

const UPLOAD_ROOT = path.resolve(path.join("/tmp", "hotel-forecast-uploads"));

function mimeTypeFor(filePath: string) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case ".jpg":
        case ".jpeg":
            return "image/jpeg";
        case ".png":
            return "image/png";
        case ".webp":
            return "image/webp";
        default:
            return "application/octet-stream";
    }
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role as string | undefined;
    const where = role === "ADMIN"
        ? { id: params.id }
        : {
            id: params.id,
            user: { username: session.user?.name! },
        };

    try {
        const submission = await prisma.submission.findFirst({ where });
        if (!submission) {
            return NextResponse.json({ message: "Not found" }, { status: 404 });
        }

        let coverStoredPath = "";
        try {
            const input = JSON.parse(submission.inputData || "{}") as { coverStoredPath?: string };
            coverStoredPath = input.coverStoredPath || "";
        } catch {
            coverStoredPath = "";
        }

        if (!coverStoredPath) {
            return NextResponse.json({ message: "Cover not found" }, { status: 404 });
        }

        const resolvedPath = path.resolve(coverStoredPath);
        if (!resolvedPath.startsWith(`${UPLOAD_ROOT}${path.sep}`)) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const fileBuffer = await readFile(resolvedPath);
        return new NextResponse(new Uint8Array(fileBuffer), {
            headers: {
                "Content-Type": mimeTypeFor(resolvedPath),
                "Cache-Control": "private, max-age=60",
            },
        });
    } catch (error) {
        return NextResponse.json({ message: "Internal error" }, { status: 500 });
    }
}
