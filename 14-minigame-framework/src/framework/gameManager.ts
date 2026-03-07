import { world, system, Player } from "@minecraft/server";
import { lobbySystem } from "./lobbySystem.js";
import { scoreboardManager } from "./scoreboard.js";

export type GameState = "LOBBY" | "STARTING" | "RUNNING" | "ENDING";

export interface MinigameConfig {
    id: string;
    name: string;
    minPlayers: number;
    maxPlayers: number;
    countdownSeconds: number;
    gameDurationSeconds: number;
}

export interface Minigame {
    getConfig(): MinigameConfig;
    onPlayerJoin(player: Player): void;
    onPlayerLeave(player: Player): void;
    onStart(players: Player[]): void;
    onTick(tick: number): void;
    onEnd(): void;
    checkWinCondition(players: Player[]): Player | undefined;
}

interface GameInstance {
    game: Minigame;
    state: GameState;
    players: Set<string>;
    startTick: number;
    countdownTick: number;
}

class GameManager {

    private games: Map<string, Minigame> = new Map();
    private activeInstances: Map<string, GameInstance> = new Map();

    registerGame(game: Minigame): void {
        const config = game.getConfig();
        this.games.set(config.id, game);
        this.activeInstances.set(config.id, {
            game,
            state: "LOBBY",
            players: new Set(),
            startTick: 0,
            countdownTick: 0,
        });
    }

    getGame(id: string): Minigame | undefined {
        return this.games.get(id);
    }

    getInstance(id: string): GameInstance | undefined {
        return this.activeInstances.get(id);
    }

    getAllGames(): Minigame[] {
        return [...this.games.values()];
    }

    joinGame(player: Player, gameId: string): boolean {
        const instance = this.activeInstances.get(gameId);
        if (!instance) return false;

        const config = instance.game.getConfig();

        if (instance.state !== "LOBBY" && instance.state !== "STARTING") {
            player.sendMessage("§cThis game is already in progress.");
            return false;
        }

        if (instance.players.size >= config.maxPlayers) {
            player.sendMessage("§cThis game is full.");
            return false;
        }

        // Remove from any other game
        for (const [otherId, otherInstance] of this.activeInstances) {
            if (otherId !== gameId && otherInstance.players.has(player.id)) {
                this.leaveGame(player, otherId);
            }
        }

        instance.players.add(player.id);
        instance.game.onPlayerJoin(player);

        this.broadcastToGame(gameId, `§a+ §f${player.name} §ajoined §e${config.name} §7(${instance.players.size}/${config.maxPlayers})`);

        // Check if we have enough to start countdown
        if (instance.state === "LOBBY" && instance.players.size >= config.minPlayers) {
            this.startCountdown(gameId);
        }

        return true;
    }

    leaveGame(player: Player, gameId: string): void {
        const instance = this.activeInstances.get(gameId);
        if (!instance) return;

        if (!instance.players.has(player.id)) return;

        instance.players.delete(player.id);
        instance.game.onPlayerLeave(player);

        const config = instance.game.getConfig();
        this.broadcastToGame(gameId, `§c- §f${player.name} §cleft §e${config.name}`);

        // If running and not enough players, end the game
        if (instance.state === "RUNNING" && instance.players.size < 2) {
            this.endGame(gameId);
        }

        // If in countdown and below min, cancel
        if (instance.state === "STARTING" && instance.players.size < config.minPlayers) {
            instance.state = "LOBBY";
            this.broadcastToGame(gameId, "§cNot enough players. Countdown cancelled.");
        }
    }

    private startCountdown(gameId: string): void {
        const instance = this.activeInstances.get(gameId);
        if (!instance) return;

        instance.state = "STARTING";
        instance.countdownTick = system.currentTick;
        const config = instance.game.getConfig();

        this.broadcastToGame(gameId, `§e${config.name} §astarting in §f${config.countdownSeconds}s§a...`);
    }

    startGame(gameId: string): void {
        const instance = this.activeInstances.get(gameId);
        if (!instance) return;

        instance.state = "RUNNING";
        instance.startTick = system.currentTick;

        const players = this.getPlayersInGame(gameId);
        instance.game.onStart(players);

        const config = instance.game.getConfig();
        this.broadcastToGame(gameId, `§a§l⚔ ${config.name} has started!`);

        scoreboardManager.resetGame(gameId);
        for (const p of players) {
            scoreboardManager.setScore(gameId, p.id, p.name, 0);
        }
    }

    endGame(gameId: string): void {
        const instance = this.activeInstances.get(gameId);
        if (!instance) return;

        instance.state = "ENDING";
        instance.game.onEnd();

        const config = instance.game.getConfig();
        const winner = scoreboardManager.getWinner(gameId);

        if (winner) {
            this.broadcastToGame(gameId, `§6§l🏆 ${winner.name} wins ${config.name}! §7(Score: ${winner.score})`);
        } else {
            this.broadcastToGame(gameId, `§e${config.name} §7has ended.`);
        }

        // Reset after 5 seconds
        system.runTimeout(() => {
            this.resetGame(gameId);
        }, 100);
    }

    private resetGame(gameId: string): void {
        const instance = this.activeInstances.get(gameId);
        if (!instance) return;

        const players = this.getPlayersInGame(gameId);
        for (const p of players) {
            lobbySystem.teleportToLobby(p);
        }

        instance.state = "LOBBY";
        instance.players.clear();
        instance.startTick = 0;
        instance.countdownTick = 0;
        scoreboardManager.resetGame(gameId);

        const config = instance.game.getConfig();
        for (const p of world.getPlayers()) {
            p.sendMessage(`§e${config.name} §7is now open. Type §f!join ${config.id} §7to play.`);
        }
    }

    tick(): void {
        const currentTick = system.currentTick;

        for (const [gameId, instance] of this.activeInstances) {
            const config = instance.game.getConfig();

            if (instance.state === "STARTING") {
                const elapsed = currentTick - instance.countdownTick;
                const remaining = config.countdownSeconds - Math.floor(elapsed / 20);

                if (remaining <= 0) {
                    this.startGame(gameId);
                } else if (elapsed % 20 === 0 && remaining <= 5) {
                    this.broadcastToGame(gameId, `§eStarting in §f${remaining}§e...`);
                }
            }

            if (instance.state === "RUNNING") {
                instance.game.onTick(currentTick);

                // Check win condition
                const players = this.getPlayersInGame(gameId);
                const winner = instance.game.checkWinCondition(players);
                if (winner) {
                    scoreboardManager.addScore(gameId, winner.id, winner.name, 1);
                    this.endGame(gameId);
                    continue;
                }

                // Time limit
                const elapsed = currentTick - instance.startTick;
                const maxTicks = config.gameDurationSeconds * 20;
                if (elapsed >= maxTicks) {
                    this.broadcastToGame(gameId, "§cTime's up!");
                    this.endGame(gameId);
                }
            }
        }
    }

    getPlayersInGame(gameId: string): Player[] {
        const instance = this.activeInstances.get(gameId);
        if (!instance) return [];

        const result: Player[] = [];
        for (const player of world.getPlayers()) {
            if (instance.players.has(player.id)) {
                result.push(player);
            }
        }
        return result;
    }

    getPlayerGame(playerId: string): string | undefined {
        for (const [gameId, instance] of this.activeInstances) {
            if (instance.players.has(playerId)) return gameId;
        }
        return undefined;
    }

    broadcastToGame(gameId: string, message: string): void {
        const players = this.getPlayersInGame(gameId);
        for (const p of players) {
            p.sendMessage(message);
        }
    }
}

export const gameManager = new GameManager();

function handleGameCommand(player: Player, message: string): boolean {
    const args = message.trim().split(/\s+/);
    const cmd = args[0]?.toLowerCase();

    if (cmd === "!join") {
        const gameId = args[1];
        if (!gameId) {
            player.sendMessage("§eUsage: §f!join <game>");
            player.sendMessage("§7Available: " + gameManager.getAllGames().map(g => g.getConfig().id).join(", "));
            return true;
        }
        gameManager.joinGame(player, gameId);
        return true;
    }

    if (cmd === "!leave") {
        const currentGame = gameManager.getPlayerGame(player.id);
        if (!currentGame) {
            player.sendMessage("§cYou are not in a game.");
            return true;
        }
        gameManager.leaveGame(player, currentGame);
        player.sendMessage("§7You left the game.");
        lobbySystem.teleportToLobby(player);
        return true;
    }

    if (cmd === "!games") {
        player.sendMessage("§6═══ Minigames ═══");
        for (const game of gameManager.getAllGames()) {
            const config = game.getConfig();
            const instance = gameManager.getInstance(config.id);
            const count = instance?.players.size ?? 0;
            const stateColor = instance?.state === "LOBBY" ? "§a" : instance?.state === "RUNNING" ? "§c" : "§e";
            player.sendMessage(`§f  ${config.name} §7[${stateColor}${instance?.state}§7] §f${count}/${config.maxPlayers} §7— !join ${config.id}`);
        }
        return true;
    }

    return false;
}

export function registerMinigameSystem(): GameManager {

    // Chat commands
    world.beforeEvents.chatSend.subscribe((event) => {
        const handled = handleGameCommand(event.sender, event.message);
        if (handled) {
            event.cancel = true;
        }
    });

    // Game tick loop
    system.runInterval(() => {
        gameManager.tick();
    }, 1);

    // Player leave cleanup
    world.afterEvents.playerLeave.subscribe((event) => {
        const gameId = gameManager.getPlayerGame(event.playerId);
        if (gameId) {
            const instance = gameManager.getInstance(gameId);
            if (instance) {
                instance.players.delete(event.playerId);
            }
        }
    });

    return gameManager;
}
