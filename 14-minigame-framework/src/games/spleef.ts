import { world, Player } from "@minecraft/server";
import { Minigame, MinigameConfig } from "../framework/gameManager.js";
import { lobbySystem } from "../framework/lobbySystem.js";
import { scoreboardManager } from "../framework/scoreboard.js";

const SPLEEF_CONFIG: MinigameConfig = {
    id: "spleef",
    name: "Spleef",
    minPlayers: 2,
    maxPlayers: 8,
    countdownSeconds: 10,
    gameDurationSeconds: 180,
};

const ARENA_CENTER = { x: 1000, y: 100, z: 1000 };
const FALL_Y_THRESHOLD = 95;

const alivePlayers: Set<string> = new Set();

export class SpleefGame implements Minigame {

    private breakListener: ((event: any) => void) | undefined;

    getConfig(): MinigameConfig {
        return SPLEEF_CONFIG;
    }

    onPlayerJoin(player: Player): void {
        player.sendMessage("§bWelcome to §fSpleef§b! Break blocks under other players to eliminate them.");
    }

    onPlayerLeave(player: Player): void {
        alivePlayers.delete(player.id);
    }

    onStart(players: Player[]): void {
        alivePlayers.clear();

        lobbySystem.setGameSpawn("spleef", ARENA_CENTER);

        for (const player of players) {
            alivePlayers.add(player.id);
            lobbySystem.teleportToGame(player, "spleef");
            lobbySystem.preparePlayer(player);
            player.runCommandAsync("give @s minecraft:diamond_shovel 1");
            player.runCommandAsync("gamemode survival @s");
        }

        // Allow block breaking in spleef arena
        this.breakListener = undefined; // Spleef allows breaking — handled by default
    }

    onTick(tick: number): void {
        // Check if any alive player has fallen below threshold
        for (const player of world.getPlayers()) {
            if (!alivePlayers.has(player.id)) continue;

            if (player.location.y < FALL_Y_THRESHOLD) {
                alivePlayers.delete(player.id);
                player.sendMessage("§c☠ You fell! You are eliminated.");
                player.runCommandAsync("gamemode spectator @s");
                player.onScreenDisplay.setActionBar("§c☠ Eliminated!");

                // Notify others
                for (const other of world.getPlayers()) {
                    if (alivePlayers.has(other.id)) {
                        other.sendMessage(`§c☠ §f${player.name} §7has been eliminated! §f${alivePlayers.size} §7remaining.`);
                    }
                }
            }
        }

        // HUD for alive players
        if (tick % 20 === 0) {
            for (const player of world.getPlayers()) {
                if (alivePlayers.has(player.id)) {
                    player.onScreenDisplay.setActionBar(`§bSpleef §7| §fAlive: ${alivePlayers.size}`);
                }
            }
        }
    }

    onEnd(): void {
        alivePlayers.clear();

        for (const player of world.getPlayers()) {
            lobbySystem.restorePlayer(player);
        }
    }

    checkWinCondition(players: Player[]): Player | undefined {
        if (alivePlayers.size === 1) {
            const winnerId = [...alivePlayers][0];
            return players.find(p => p.id === winnerId);
        }

        if (alivePlayers.size === 0 && players.length > 0) {
            return players[0]; // Fallback
        }

        return undefined;
    }
}
