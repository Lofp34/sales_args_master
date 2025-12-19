import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

        const argumentsData = await prisma.argument.findMany({
            where: isAdmin
                ? {}
                : {
                    OR: [
                        { status: "APPROVED" },
                        { userId: session?.user?.id || "unauthenticated" }
                    ]
                },
            include: {
                votes: true,
                user: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const formattedArguments = argumentsData.map((arg: any) => {
            const totalVotes = arg.votes.length;
            const averageRating =
                totalVotes > 0
                    ? arg.votes.reduce((acc: number, vote: any) => acc + vote.value, 0) / totalVotes
                    : 0;

            const userVote = session?.user
                ? arg.votes.find((v: any) => v.userId === session.user.id)?.value
                : undefined;

            return {
                id: arg.id,
                title: arg.title,
                impact: arg.impact,
                maieutique: arg.maieutique,
                status: arg.status,
                averageRating,
                userVote,
                userId: arg.userId,
                userName: arg.user.name,
            };
        });

        return NextResponse.json(formattedArguments);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch arguments" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { title, impact, maieutique } = await req.json();

        if (!title || !impact || !maieutique) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

        const newArgument = await prisma.argument.create({
            data: {
                title,
                impact,
                maieutique,
                userId: session.user.id,
                status: isAdmin ? "APPROVED" : "PENDING",
            },
        });

        return NextResponse.json(newArgument);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create argument" },
            { status: 500 }
        );
    }
}
