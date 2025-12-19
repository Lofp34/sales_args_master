import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const { status } = await req.json();

        if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const updatedArgument = await prisma.argument.update({
            where: { id },
            data: { status },
        });

        return NextResponse.json(updatedArgument);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update argument status" },
            { status: 500 }
        );
    }
}
