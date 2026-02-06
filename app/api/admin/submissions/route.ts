import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

function toCsvCell(value: unknown) {
    const raw = String(value ?? "");
    return `"${raw.replace(/"/g, '""')}"`;
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const subs = await prisma.submission.findMany({
        include: { user: { select: { username: true } } },
        orderBy: { createdAt: 'desc' }
    });

    const { searchParams } = new URL(req.url);
    const exportType = searchParams.get("export");

    if (exportType === "upload") {
        const header = [
            "id",
            "username",
            "status",
            "createdAt",
            "title",
            "textContent",
            "tags",
            "followers",
            "subscribers",
            "likes",
            "province",
            "videoOriginalName",
            "coverOriginalName"
        ];
        const rows = subs.map((sub) => {
            let input: any = {};
            try {
                input = JSON.parse(sub.inputData || "{}");
            } catch {
                input = {};
            }
            return [
                sub.id,
                sub.user.username,
                sub.status,
                sub.createdAt.toISOString(),
                input.title || "",
                input.textContent || "",
                Array.isArray(input.tags) ? input.tags.join("|") : "",
                input.followers ?? "",
                input.subscribers ?? "",
                input.likes ?? "",
                input.province || "",
                input.videoOriginalName || "",
                input.coverOriginalName || "",
            ].map(toCsvCell).join(",");
        });
        const csv = [header.join(","), ...rows].join("\n");
        return new Response(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": "attachment; filename=admin-upload-data.csv"
            }
        });
    }

    if (exportType === "result") {
        const header = [
            "id",
            "username",
            "status",
            "createdAt",
            "localScore",
            "globalScore",
            "videoAesthetic",
            "textReadability",
            "titleSentiment",
            "textSentiment",
            "audioSentiment",
            "richness",
            "harmony",
            "adaption",
            "modern",
            "oriental",
            "western"
        ];
        const rows = subs.map((sub) => {
            let result: any = {};
            try {
                result = JSON.parse(sub.resultData || "{}");
            } catch {
                result = {};
            }
            return [
                sub.id,
                sub.user.username,
                sub.status,
                sub.createdAt.toISOString(),
                result.engagementScore?.local ?? "",
                result.engagementScore?.global ?? "",
                result.analysis?.quality?.aesthetic ?? "",
                result.analysis?.quality?.readability ?? "",
                result.analysis?.sentiment?.title ?? "",
                result.analysis?.sentiment?.text ?? "",
                result.analysis?.sentiment?.audio ?? "",
                result.analysis?.orientalAesthetics?.richness ?? "",
                result.analysis?.orientalAesthetics?.harmony ?? "",
                result.analysis?.orientalAesthetics?.adaption ?? "",
                result.analysis?.orientalAesthetics?.modern ?? "",
                result.analysis?.orientalAesthetics?.oriental ?? "",
                result.analysis?.orientalAesthetics?.western ?? "",
            ].map(toCsvCell).join(",");
        });
        const csv = [header.join(","), ...rows].join("\n");
        return new Response(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": "attachment; filename=admin-results.csv"
            }
        });
    }

    return NextResponse.json(subs);
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });
    await prisma.submission.delete({ where: { id } });

    return NextResponse.json({ message: "Deleted" });
}
