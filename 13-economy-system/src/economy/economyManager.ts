import { Player } from "@minecraft/server";
import { getBalance, addCoins, removeCoins, transferCoins, getLeaderboard } from "./economyApi.js";

const MOB_REWARDS: Record<string, number> = {
    "minecraft:zombie": 5,
    "minecraft:skeleton": 5,
    "minecraft:spider": 3,
    "minecraft:creeper": 8,
    "minecraft:enderman": 15,
    "minecraft:witch": 12,
    "minecraft:drowned": 6,
    "minecraft:phantom": 10,
    "minecraft:blaze": 20,
    "minecraft:wither_skeleton": 25,
};

const balanceCache: Map<string, { coins: number; tick: number }> = new Map();
const CACHE_TTL = 100; // ticks

class EconomyManager {

    getMobReward(mobTypeId: string): number {
        return MOB_REWARDS[mobTypeId] ?? 0;
    }

    async showBalance(player: Player): Promise<void> {
        const coins = await getBalance(player.id);
        balanceCache.set(player.id, { coins, tick: Date.now() });
        player.sendMessage(`§6💰 Balance: §f${coins} coins`);
    }

    async rewardKill(player: Player, mobTypeId: string): Promise<void> {
        const reward = this.getMobReward(mobTypeId);
        if (reward <= 0) return;

        const result = await addCoins(player.id, reward);
        if (result.success) {
            player.onScreenDisplay.setActionBar(`§a+${reward} coins §7(${result.coins} total)`);
        }
    }

    async pay(from: Player, toName: string, amount: number, allPlayers: Player[]): Promise<void> {
        if (amount <= 0) {
            from.sendMessage("§cAmount must be positive.");
            return;
        }

        const target = allPlayers.find(p => p.name.toLowerCase() === toName.toLowerCase());
        if (!target) {
            from.sendMessage(`§cPlayer "${toName}" not found.`);
            return;
        }

        if (target.id === from.id) {
            from.sendMessage("§cYou cannot pay yourself.");
            return;
        }

        const result = await transferCoins(from.id, target.id, amount);
        if (result.success) {
            from.sendMessage(`§a✔ Sent §f${amount} coins §ato §f${target.name}`);
            target.sendMessage(`§a✔ Received §f${amount} coins §afrom §f${from.name}`);
        } else {
            from.sendMessage("§cInsufficient funds.");
        }
    }

    async showLeaderboard(player: Player): Promise<void> {
        const entries = await getLeaderboard(10);
        player.sendMessage("§6═══ Leaderboard (Top 10) ═══");
        for (const entry of entries) {
            const medal = entry.rank === 1 ? "§6🥇" : entry.rank === 2 ? "§f🥈" : entry.rank === 3 ? "§c🥉" : "§7 ";
            player.sendMessage(`${medal} §f#${entry.rank} §7${entry.id} §6${entry.coins} coins`);
        }
    }

    getCachedBalance(playerId: string): number | undefined {
        const cached = balanceCache.get(playerId);
        if (!cached) return undefined;
        return cached.coins;
    }

    updateCache(playerId: string, coins: number): void {
        balanceCache.set(playerId, { coins, tick: Date.now() });
    }
}

export const economyManager = new EconomyManager();
