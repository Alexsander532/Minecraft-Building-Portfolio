import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({
    host: process.env.DB_HOST ?? "localhost",
    port: parseInt(process.env.DB_PORT ?? "5432"),
    database: process.env.DB_NAME ?? "economy",
    user: process.env.DB_USER ?? "postgres",
    password: process.env.DB_PASSWORD ?? "postgres",
});

export async function initDatabase(): Promise<void> {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS players (
            id TEXT PRIMARY KEY,
            coins INT NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS transactions (
            id SERIAL PRIMARY KEY,
            player_id TEXT NOT NULL,
            type TEXT NOT NULL,
            amount INT NOT NULL,
            balance_after INT NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
}

export async function getBalance(playerId: string): Promise<number> {
    const result = await pool.query("SELECT coins FROM players WHERE id = $1", [playerId]);
    if (result.rows.length === 0) {
        await pool.query("INSERT INTO players (id, coins) VALUES ($1, 0)", [playerId]);
        return 0;
    }
    return result.rows[0].coins;
}

export async function addCoins(playerId: string, amount: number, description?: string): Promise<{ coins: number; success: boolean }> {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        await client.query(
            "INSERT INTO players (id, coins) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET coins = players.coins + $2, updated_at = CURRENT_TIMESTAMP",
            [playerId, amount]
        );

        const result = await client.query("SELECT coins FROM players WHERE id = $1", [playerId]);
        const coins = result.rows[0].coins;

        await client.query(
            "INSERT INTO transactions (player_id, type, amount, balance_after, description) VALUES ($1, 'credit', $2, $3, $4)",
            [playerId, amount, coins, description ?? "credit"]
        );

        await client.query("COMMIT");
        return { coins, success: true };
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}

export async function removeCoins(playerId: string, amount: number, description?: string): Promise<{ coins: number; success: boolean }> {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const check = await client.query("SELECT coins FROM players WHERE id = $1", [playerId]);
        if (check.rows.length === 0 || check.rows[0].coins < amount) {
            await client.query("ROLLBACK");
            return { coins: check.rows[0]?.coins ?? 0, success: false };
        }

        await client.query(
            "UPDATE players SET coins = coins - $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
            [playerId, amount]
        );

        const result = await client.query("SELECT coins FROM players WHERE id = $1", [playerId]);
        const coins = result.rows[0].coins;

        await client.query(
            "INSERT INTO transactions (player_id, type, amount, balance_after, description) VALUES ($1, 'debit', $2, $3, $4)",
            [playerId, amount, coins, description ?? "debit"]
        );

        await client.query("COMMIT");
        return { coins, success: true };
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}

export async function transferCoins(fromId: string, toId: string, amount: number): Promise<{ coins: number; success: boolean }> {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const check = await client.query("SELECT coins FROM players WHERE id = $1", [fromId]);
        if (check.rows.length === 0 || check.rows[0].coins < amount) {
            await client.query("ROLLBACK");
            return { coins: check.rows[0]?.coins ?? 0, success: false };
        }

        await client.query("UPDATE players SET coins = coins - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [amount, fromId]);
        await client.query(
            "INSERT INTO players (id, coins) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET coins = players.coins + $2, updated_at = CURRENT_TIMESTAMP",
            [toId, amount]
        );

        const fromResult = await client.query("SELECT coins FROM players WHERE id = $1", [fromId]);
        const fromCoins = fromResult.rows[0].coins;
        const toResult = await client.query("SELECT coins FROM players WHERE id = $1", [toId]);
        const toCoins = toResult.rows[0].coins;

        await client.query(
            "INSERT INTO transactions (player_id, type, amount, balance_after, description) VALUES ($1, 'transfer_out', $2, $3, $4)",
            [fromId, amount, fromCoins, `transfer to ${toId}`]
        );
        await client.query(
            "INSERT INTO transactions (player_id, type, amount, balance_after, description) VALUES ($1, 'transfer_in', $2, $3, $4)",
            [toId, amount, toCoins, `transfer from ${fromId}`]
        );

        await client.query("COMMIT");
        return { coins: fromCoins, success: true };
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}

export async function getLeaderboard(limit: number = 10): Promise<{ id: string; coins: number; rank: number }[]> {
    const result = await pool.query(
        "SELECT id, coins, ROW_NUMBER() OVER (ORDER BY coins DESC) as rank FROM players ORDER BY coins DESC LIMIT $1",
        [limit]
    );
    return result.rows.map(row => ({
        id: row.id,
        coins: row.coins,
        rank: parseInt(row.rank),
    }));
}
