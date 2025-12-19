import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { role } = await req.json();

        if (!["USER", "ADMIN", "SUPER_ADMIN"].includes(role)) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { role },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update user role" },
            { status: 500 }
        );
    }
}
