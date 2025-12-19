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
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { title, impact, maieutique } = await req.json();

        const updatedArgument = await prisma.argument.update({
            where: { id },
            data: {
                title,
                impact,
                maieutique,
            },
        });

        return NextResponse.json(updatedArgument);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update argument" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await prisma.argument.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Argument deleted" });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete argument" },
            { status: 500 }
        );
    }
}
