import { system } from "@minecraft/server";

export class CooldownManager {
    private readonly cooldowns = new Map<string, number>();

    isOnCooldown(playerId: string, abilityId: string): boolean {
        const key = `${playerId}:${abilityId}`;
        const expiry = this.cooldowns.get(key) ?? 0;
        return system.currentTick < expiry;
    }

    getRemainingTicks(playerId: string, abilityId: string): number {
        const key = `${playerId}:${abilityId}`;
        const expiry = this.cooldowns.get(key) ?? 0;
        return Math.max(0, expiry - system.currentTick);
    }

    set(playerId: string, abilityId: string, durationTicks: number): void {
        const key = `${playerId}:${abilityId}`;
        this.cooldowns.set(key, system.currentTick + durationTicks);
    }

    clear(playerId: string, abilityId: string): void {
        this.cooldowns.delete(`${playerId}:${abilityId}`);
    }
}
