import { world, system, Player } from "@minecraft/server";
import { Minigame, MinigameConfig } from "../framework/gameManager.js";
import { lobbySystem } from "../framework/lobbySystem.js";
import { scoreboardManager } from "../framework/scoreboard.js";

const PARKOUR_CONFIG: MinigameConfig = {
    id: "parkour",
    name: "Parkour Race",
    minPlayers: 2,
    maxPlayers: 12,
    countdownSeconds: 5,
    gameDurationSeconds: 300,
};

const START_POINT = { x: 2000, y: 100, z: 2000 };
const FINISH_ZONE = {
    min: { x: 2090, y: 95, z: 2000 },
    max: { x: 2100, y: 110, z: 2010 },
};

interface CheckpointData {
    id: number;
    min: { x: number; y: number; z: number };
    max: { x: number; y: number; z: number };
}

const CHECKPOINTS: CheckpointData[] = [
    { id: 1, min: { x: 2020, y: 95, z: 2000 }, max: { x: 2030, y: 110, z: 2010 } },
    { id: 2, min: { x: 2050, y: 95, z: 2000 }, max: { x: 2060, y: 110, z: 2010 } },
    { id: 3, min: { x: 2070, y: 95, z: 2000 }, max: { x: 2080, y: 110, z: 2010 } },
];

const playerCheckpoints: Map<string, number> = new Map();
const finishedPlayers: Set<string> = new Set();
let finishOrder = 0;

function isInZone(loc: { x: number; y: number; z: number }, min: { x: number; y: number; z: number }, max: { x: number; y: number; z: number }): boolean {
    return loc.x >= min.x && loc.x <= max.x &&
           loc.y >= min.y && loc.y <= max.y &&
           loc.z >= min.z && loc.z <= max.z;
}

export class ParkourGame implements Minigame {

    getConfig(): MinigameConfig {
        return PARKOUR_CONFIG;
    }

    onPlayerJoin(player: Player): void {
        player.sendMessage("§dWelcome to §fParkour Race§d! Be the first to reach the finish line.");
    }

    onPlayerLeave(player: Player): void {
        playerCheckpoints.delete(player.id);
        finishedPlayers.delete(player.id);
    }

    onStart(players: Player[]): void {
        playerCheckpoints.clear();
        finishedPlayers.clear();
        finishOrder = 0;

        lobbySystem.setGameSpawn("parkour", START_POINT);

        for (const player of players) {
            playerCheckpoints.set(player.id, 0);
            lobbySystem.teleportToGame(player, "parkour");
            lobbySystem.preparePlayer(player);
            player.runCommandAsync("gamemode adventure @s");
        }
    }

    onTick(tick: number): void {
        if (tick % 5 !== 0) return; // Check every 5 ticks

        for (const player of world.getPlayers()) {
            if (finishedPlayers.has(player.id)) continue;
            if (!playerCheckpoints.has(player.id)) continue;

            const loc = player.location;
            const currentCheckpoint = playerCheckpoints.get(player.id) ?? 0;

            // Check finish zone
            if (isInZone(loc, FINISH_ZONE.min, FINISH_ZONE.max)) {
                finishedPlayers.add(player.id);
                finishOrder++;
                const points = Math.max(10 - finishOrder + 1, 1);
                scoreboardManager.addScore("parkour", player.id, player.name, points);

                player.sendMessage(`§a🏁 You finished in §f#${finishOrder}§a place! §6+${points} points`);
                player.onScreenDisplay.setActionBar(`§a🏁 Finished #${finishOrder}!`);

                // Broadcast to others
                for (const other of world.getPlayers()) {
                    if (other.id !== player.id && playerCheckpoints.has(other.id)) {
                        other.sendMessage(`§f${player.name} §7finished in §f#${finishOrder}§7 place!`);
                    }
                }
                continue;
            }

            // Check checkpoints
            for (const cp of CHECKPOINTS) {
                if (cp.id > currentCheckpoint && isInZone(loc, cp.min, cp.max)) {
                    playerCheckpoints.set(player.id, cp.id);
                    scoreboardManager.addScore("parkour", player.id, player.name, 1);
                    player.sendMessage(`§d✓ Checkpoint ${cp.id}/${CHECKPOINTS.length}`);
                    player.onScreenDisplay.setActionBar(`§d✓ Checkpoint ${cp.id}/${CHECKPOINTS.length}`);
                }
            }

            // Fall detection — reset to last checkpoint
            if (loc.y < 90) {
                const lastCp = playerCheckpoints.get(player.id) ?? 0;
                if (lastCp === 0) {
                    lobbySystem.teleportToGame(player, "parkour");
                } else {
                    const cp = CHECKPOINTS[lastCp - 1];
                    const { x, y, z } = cp.min;
                    player.runCommandAsync(`tp @s ${x + 5} ${y + 2} ${z + 5}`);
                }
                player.sendMessage("§cYou fell! Respawning at last checkpoint...");
            }
        }

        // HUD
        if (tick % 20 === 0) {
            for (const player of world.getPlayers()) {
                if (!playerCheckpoints.has(player.id) || finishedPlayers.has(player.id)) continue;
                const cp = playerCheckpoints.get(player.id) ?? 0;
                player.onScreenDisplay.setActionBar(`§dParkour §7| §fCheckpoint: ${cp}/${CHECKPOINTS.length}`);
            }
        }
    }

    onEnd(): void {
        playerCheckpoints.clear();
        finishedPlayers.clear();
        finishOrder = 0;

        for (const player of world.getPlayers()) {
            lobbySystem.restorePlayer(player);
        }
    }

    checkWinCondition(players: Player[]): Player | undefined {
        // All players finished
        const activePlayers = players.filter(p => playerCheckpoints.has(p.id));
        if (activePlayers.length > 0 && finishedPlayers.size >= activePlayers.length) {
            const ranking = scoreboardManager.getRanking("parkour");
            if (ranking.length > 0) {
                return players.find(p => p.id === ranking[0].playerId);
            }
        }
        return undefined;
    }
}
