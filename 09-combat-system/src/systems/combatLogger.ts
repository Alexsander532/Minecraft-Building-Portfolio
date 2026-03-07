export interface DamageLogEntry {
    attackerId: string;
    attackerName: string;
    victimId: string;
    victimName: string;
    tick: number;
}

export interface KillLogEntry {
    killerId: string;
    killerName: string;
    victimId: string;
    victimName: string;
    tick: number;
}

export class CombatLogger {
    private readonly combatTags = new Map<string, number>(); // playerId → expiry tick
    private readonly killStreaks = new Map<string, number>();
    readonly damageLog: DamageLogEntry[] = [];
    readonly killLog: KillLogEntry[] = [];

    static readonly COMBAT_TAG_DURATION = 200; // 10 seconds in ticks

    logDamage(entry: DamageLogEntry, currentTick: number): void {
        this.damageLog.push(entry);
        this.setTag(entry.attackerId, currentTick);
        this.setTag(entry.victimId, currentTick);
    }

    logKill(entry: KillLogEntry): void {
        this.killLog.push(entry);
        const streak = (this.killStreaks.get(entry.killerId) ?? 0) + 1;
        this.killStreaks.set(entry.killerId, streak);
        this.killStreaks.delete(entry.victimId);
    }

    isTagged(playerId: string, currentTick: number): boolean {
        const expiry = this.combatTags.get(playerId) ?? 0;
        return currentTick < expiry;
    }

    getKillStreak(playerId: string): number {
        return this.killStreaks.get(playerId) ?? 0;
    }

    clearTag(playerId: string): void {
        this.combatTags.delete(playerId);
    }

    private setTag(playerId: string, currentTick: number): void {
        this.combatTags.set(playerId, currentTick + CombatLogger.COMBAT_TAG_DURATION);
    }
}
