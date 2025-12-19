import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { argumentId, value } = await req.json();

        if (!argumentId || !value || value < 1 || value > 5) {
            return NextResponse.json({ error: "Invalid vote" }, { status: 400 });
        }

        const vote = await prisma.vote.upsert({
            where: {
                argumentId_userId: {
                    argumentId,
                    userId: session.user.id,
                },
            },
            update: {
                value,
            },
            create: {
                argumentId,
                userId: session.user.id,
                value,
            },
        });

        return NextResponse.json(vote);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to submit vote" },
            { status: 500 }
        );
    }
}
