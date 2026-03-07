import { Player, Vector3 } from "@minecraft/server";

export interface LobbyConfig {
    spawnPoint: Vector3;
    dimension: string;
}

const DEFAULT_LOBBY: LobbyConfig = {
    spawnPoint: { x: 0, y: 100, z: 0 },
    dimension: "minecraft:overworld",
};

class LobbySystem {

    private config: LobbyConfig = DEFAULT_LOBBY;
    private gameSpawnPoints: Map<string, Vector3> = new Map();

    setLobbySpawn(spawn: Vector3, dimension?: string): void {
        this.config.spawnPoint = spawn;
        if (dimension) this.config.dimension = dimension;
    }

    setGameSpawn(gameId: string, spawn: Vector3): void {
        this.gameSpawnPoints.set(gameId, spawn);
    }

    getGameSpawn(gameId: string): Vector3 {
        return this.gameSpawnPoints.get(gameId) ?? this.config.spawnPoint;
    }

    teleportToLobby(player: Player): void {
        const { x, y, z } = this.config.spawnPoint;
        player.runCommandAsync(`tp @s ${x} ${y} ${z}`);
        player.sendMessage("§7Teleported to lobby.");
    }

    teleportToGame(player: Player, gameId: string): void {
        const spawn = this.getGameSpawn(gameId);
        const { x, y, z } = spawn;
        player.runCommandAsync(`tp @s ${x} ${y} ${z}`);
    }

    preparePlayer(player: Player): void {
        player.runCommandAsync("clear @s");
        player.runCommandAsync("effect @s clear");
        player.runCommandAsync("gamemode adventure @s");
        player.runCommandAsync("effect @s saturation 999999 255 true");
    }

    restorePlayer(player: Player): void {
        player.runCommandAsync("clear @s");
        player.runCommandAsync("effect @s clear");
        player.runCommandAsync("gamemode survival @s");
    }
}

export const lobbySystem = new LobbySystem();
