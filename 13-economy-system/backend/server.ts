import express from "express";
import dotenv from "dotenv";
import {
    initDatabase,
    getBalance,
    addCoins,
    removeCoins,
    transferCoins,
    getLeaderboard,
} from "./database.js";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/balance", async (req, res) => {
    const id = req.query.id as string;
    if (!id) {
        res.status(400).json({ error: "Missing 'id' query parameter" });
        return;
    }
    const coins = await getBalance(id);
    res.json({ id, coins });
});

app.post("/addCoins", async (req, res) => {
    const { id, amount, description } = req.body as { id: string; amount: number; description?: string };
    if (!id || typeof amount !== "number" || amount <= 0) {
        res.status(400).json({ error: "Invalid id or amount" });
        return;
    }
    const result = await addCoins(id, amount, description);
    res.json({ id, ...result });
});

app.post("/removeCoins", async (req, res) => {
    const { id, amount, description } = req.body as { id: string; amount: number; description?: string };
    if (!id || typeof amount !== "number" || amount <= 0) {
        res.status(400).json({ error: "Invalid id or amount" });
        return;
    }
    const result = await removeCoins(id, amount, description);
    res.json({ id, ...result });
});

app.post("/transfer", async (req, res) => {
    const { from, to, amount } = req.body as { from: string; to: string; amount: number };
    if (!from || !to || typeof amount !== "number" || amount <= 0) {
        res.status(400).json({ error: "Invalid from, to, or amount" });
        return;
    }
    const result = await transferCoins(from, to, amount);
    res.json({ from, to, ...result });
});

app.get("/leaderboard", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const entries = await getLeaderboard(Math.min(limit, 100));
    res.json(entries);
});

app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

const PORT = process.env.PORT ?? 3002;

initDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Economy Backend running on port ${PORT}`);
            console.log("Database initialized successfully");
        });
    })
    .catch((err) => {
        console.error("Failed to initialize database:", err);
        process.exit(1);
    });
