import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const npcProfiles: Record<string, { personality: string; role: string }> = {
    wizard: {
        personality: "A wise and mysterious wizard who speaks in riddles. Knows ancient lore and forgotten spells.",
        role: "quest_giver",
    },
    blacksmith: {
        personality: "A tough, no-nonsense blacksmith. Friendly but blunt. Loves talking about weapons.",
        role: "merchant",
    },
    innkeeper: {
        personality: "A warm and gossipy innkeeper. Always knows the latest rumors about the town.",
        role: "information",
    },
};

interface ChatMessage {
    role: "player" | "npc";
    content: string;
}

app.post("/npc-chat", async (req, res) => {
    const { player, npc, message, history } = req.body as {
        player: string;
        npc: string;
        message: string;
        history: ChatMessage[];
    };

    if (!player || !npc || !message) {
        res.status(400).json({ error: "Missing required fields: player, npc, message" });
        return;
    }

    const profile = npcProfiles[npc];
    if (!profile) {
        res.status(404).json({ error: "NPC not found" });
        return;
    }

    const systemPrompt = [
        `You are "${npc}", a Minecraft NPC.`,
        profile.personality,
        `Your role is: ${profile.role}.`,
        `You are talking to player "${player}".`,
        "Keep responses SHORT (1-2 sentences max).",
        "Stay in character at all times.",
        "Do NOT break the fourth wall or mention you are an AI.",
    ].join(" ");

    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
        { role: "system", content: systemPrompt },
    ];

    if (history) {
        for (const msg of history) {
            messages.push({
                role: msg.role === "player" ? "user" : "assistant",
                content: msg.content,
            });
        }
    }

    messages.push({ role: "user", content: message });

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 100,
        temperature: 0.8,
    });

    const reply = completion.choices[0]?.message?.content ?? "...";
    res.json({ reply });
});

app.get("/health", (_req, res) => {
    res.json({ status: "ok", npcs: Object.keys(npcProfiles) });
});

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
    console.log(`NPC AI Backend running on port ${PORT}`);
});
