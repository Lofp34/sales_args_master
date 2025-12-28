import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import OpenAI from "openai";
import { authOptions } from "@/lib/auth";

type AllowedRole = "system" | "user" | "assistant";

const allowedRoles = new Set<AllowedRole>(["system", "user", "assistant"]);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const isAllowedRole = (role: string): role is AllowedRole => allowedRoles.has(role as AllowedRole);

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const rawMessages = Array.isArray(body?.messages) ? body.messages : [];

        const messages = rawMessages
            .filter((message: { role?: string; content?: string }) => {
                return Boolean(message?.content) && isAllowedRole(message?.role ?? "");
            })
            .map((message: { role: AllowedRole; content: string }) => ({
                role: message.role,
                content: message.content,
            }));

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.5,
            messages: [
                {
                    role: "system",
                    content:
                        "Tu es un assistant commercial. Aide l'utilisateur à structurer un argument clair avec un titre, un impact psychologique et une question maïeutique. Termine en renvoyant un JSON strict avec title, impact, maieutique.",
                },
                ...messages,
            ],
        });

        return NextResponse.json({
            message: response.choices[0]?.message?.content ?? "",
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to generate assistant response" },
            { status: 500 }
        );
    }
}
