import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import OpenAI from "openai";
import { authOptions } from "@/lib/auth";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
Tu es un assistant commercial. Aide l'utilisateur à structurer un argument de vente.
Pose des questions courtes si des informations manquent.
Réponds en JSON strict avec ce schéma:
{
  "message": "réponse courte à l'utilisateur",
  "draft": { "title": "...", "impact": "...", "maieutique": "..." }
}
Si un champ n'est pas prêt, laisse-le vide.
`.trim();

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: "OPENAI_API_KEY manquante" },
                { status: 500 }
            );
        }

        const { messages, currentDraft } = await req.json();

        if (!Array.isArray(messages)) {
            return NextResponse.json(
                { error: "Messages invalides" },
                { status: 400 }
            );
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.5,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...(currentDraft
                    ? [
                        {
                            role: "system",
                            content: `Brouillon actuel: ${JSON.stringify(currentDraft)}`,
                        },
                    ]
                    : []),
                ...messages.map((message: { role: string; content: string }) => ({
                    role: message.role === "assistant" ? "assistant" : "user",
                    content: message.content,
                })),
            ],
        });

        const raw = response.choices[0]?.message?.content ?? "";
        let parsed: { message?: string; draft?: { title?: string; impact?: string; maieutique?: string } } | null = null;

        try {
            parsed = JSON.parse(raw);
        } catch {
            parsed = null;
        }

        if (!parsed) {
            return NextResponse.json({
                message: raw || "Pouvez-vous préciser votre contexte ?",
                draft: {
                    title: currentDraft?.title ?? "",
                    impact: currentDraft?.impact ?? "",
                    maieutique: currentDraft?.maieutique ?? "",
                },
            });
        }

        return NextResponse.json({
            message: parsed.message || "Parfait, continuons.",
            draft: {
                title: parsed.draft?.title ?? currentDraft?.title ?? "",
                impact: parsed.draft?.impact ?? currentDraft?.impact ?? "",
                maieutique: parsed.draft?.maieutique ?? currentDraft?.maieutique ?? "",
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Impossible de générer un brouillon" },
            { status: 500 }
        );
    }
}
