import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                active: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { email, role, name, password } = await req.json();

        if (!email || !role || !password) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 }
            );
        }

        // We use bcrypt for password hashing (already installed)
        const bcrypt = require("bcryptjs");
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                email,
                role,
                name: name || null,
                password: hashedPassword,
                active: true,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                active: true,
            },
        });

        return NextResponse.json(newUser);
    } catch (error) {
        console.error("Failed to create user", error);
        return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
        );
    }
}
