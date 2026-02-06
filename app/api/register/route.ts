import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { email, password, hotelName, employeeId } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { message: "Missing email or password" },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { username: email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username: email,
                password: hashedPassword,
                hotelName: hotelName || null,
                employeeId: employeeId || null,
            },
        });

        await prisma.usageLog.create({
            data: {
                userId: user.id,
                action: "REGISTER",
                ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
                location: [req.headers.get("x-vercel-ip-country"), req.headers.get("x-vercel-ip-city")].filter(Boolean).join("/") || "unknown",
            }
        });

        return NextResponse.json(
            { message: "User created", userId: user.id },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
