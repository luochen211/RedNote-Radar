import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

function toCsvCell(value: unknown) {
    const raw = String(value ?? "");
    return `"${raw.replace(/"/g, '""')}"`;
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
        select: { id: true, username: true, role: true, hotelName: true, employeeId: true, createdAt: true },
        orderBy: { createdAt: "desc" }
    });

    const { searchParams } = new URL(req.url);
    const exportType = searchParams.get("export");

    if (exportType === "csv") {
        const header = ["id", "username", "role", "hotelName", "employeeId", "createdAt"];
        const rows = users.map((user) => ([
            user.id,
            user.username,
            user.role,
            user.hotelName || "",
            user.employeeId || "",
            user.createdAt.toISOString()
        ].map(toCsvCell).join(",")));
        const csv = [header.join(","), ...rows].join("\n");
        return new Response(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": "attachment; filename=admin-users.csv"
            }
        });
    }

    return NextResponse.json(users);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const username = String(body.username || "").trim();
        const password = String(body.password || "");
        const role = String(body.role || "USER").toUpperCase() === "ADMIN" ? "ADMIN" : "USER";
        const hotelName = String(body.hotelName || "").trim();
        const employeeId = String(body.employeeId || "").trim();

        if (!username || !password) {
            return NextResponse.json({ message: "Missing username or password" }, { status: 400 });
        }

        const exists = await prisma.user.findUnique({ where: { username } });
        if (exists) {
            return NextResponse.json({ message: "User already exists" }, { status: 409 });
        }

        const hashed = await bcrypt.hash(password, 10);
        const created = await prisma.user.create({
            data: {
                username,
                password: hashed,
                role,
                hotelName: hotelName || null,
                employeeId: employeeId || null,
            },
            select: { id: true, username: true, role: true, hotelName: true, employeeId: true, createdAt: true }
        });

        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        console.error("Admin create user failed:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(_req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
        { message: "Deleting user accounts is disabled by policy" },
        { status: 405 }
    );
}
