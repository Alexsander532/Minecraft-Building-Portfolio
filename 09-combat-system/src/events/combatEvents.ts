import { world, system } from "@minecraft/server";
import type { PlayerLeaveAfterEvent } from "@minecraft/server";
import { CombatLogger } from "../systems/combatLogger.js";
import type { DamageLogEntry, KillLogEntry } from "../systems/combatLogger.js";

export function registerCombatEvents(logger: CombatLogger): void {

    // Detect PvP hits
    world.afterEvents.entityHitEntity.subscribe((event) => {
        const attacker = event.damagingEntity;
        const victim = event.hitEntity;

        if (attacker.typeId !== "minecraft:player") return;
        if (victim.typeId !== "minecraft:player") return;

        const entry: DamageLogEntry = {
            attackerId: attacker.id,
            attackerName: (attacker as any).name ?? attacker.id,
            victimId: victim.id,
            victimName: (victim as any).name ?? victim.id,
            tick: system.currentTick,
        };

        logger.logDamage(entry, system.currentTick);

        // Notify both players of combat tag
        const attackerPlayer = world.getPlayers().find(p => p.id === attacker.id);
        const victimPlayer = world.getPlayers().find(p => p.id === victim.id);

        attackerPlayer?.onScreenDisplay.setActionBar("§c⚔ Combat tagged!");
        victimPlayer?.onScreenDisplay.setActionBar("§c⚔ You are being attacked!");

        // Kill feed notification
        world.sendMessage(`§6[Combat] §f${entry.attackerName} §ehit §f${entry.victimName}`);
    });

    // Detect player kills
    world.afterEvents.entityDie.subscribe((event) => {
        const victim = event.deadEntity;
        const cause = event.damageSource;

        if (victim.typeId !== "minecraft:player") return;
        if (!cause.damagingEntity) return;
        if (cause.damagingEntity.typeId !== "minecraft:player") return;

        const killer = cause.damagingEntity;
        const entry: KillLogEntry = {
            killerId: killer.id,
            killerName: (killer as any).name ?? killer.id,
            victimId: victim.id,
            victimName: (victim as any).name ?? victim.id,
            tick: system.currentTick,
        };

        logger.logKill(entry);

        const streak = logger.getKillStreak(killer.id);
        const streakText = streak > 1 ? ` §6(${streak} kill streak!)` : "";

        world.sendMessage(
            `§c💀 §f${entry.killerName} §ckilled §f${entry.victimName}${streakText}`
        );
    });

    // Anti-combat-log: warn players who leave while tagged
    world.beforeEvents.playerLeave?.subscribe?.((event: PlayerLeaveAfterEvent) => {
        const player = (event as any).player;
        if (!player) return;
        if (logger.isTagged(player.id, system.currentTick)) {
            world.sendMessage(`§4[!] §f${player.name} §cleft during combat! (Combat log)`);
        }
    });
}
