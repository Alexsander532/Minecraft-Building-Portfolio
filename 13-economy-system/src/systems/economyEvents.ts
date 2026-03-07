import { world, system, Player } from "@minecraft/server";
import { economyManager } from "../economy/economyManager.js";

function handleEconomyCommand(player: Player, message: string): boolean {
    const args = message.trim().split(/\s+/);
    const cmd = args[0]?.toLowerCase();

    if (cmd === "!bal" || cmd === "!balance") {
        economyManager.showBalance(player).catch(() => {
            player.sendMessage("§c[Economy] Connection error.");
        });
        return true;
    }

    if (cmd === "!pay") {
        const targetName = args[1];
        const amount = parseInt(args[2] ?? "0");

        if (!targetName || amount <= 0) {
            player.sendMessage("§eUsage: §f!pay <player> <amount>");
            return true;
        }

        const allPlayers = [...world.getPlayers()];
        economyManager.pay(player, targetName, amount, allPlayers).catch(() => {
            player.sendMessage("§c[Economy] Connection error.");
        });
        return true;
    }

    if (cmd === "!top" || cmd === "!leaderboard") {
        economyManager.showLeaderboard(player).catch(() => {
            player.sendMessage("§c[Economy] Connection error.");
        });
        return true;
    }

    if (cmd === "!economy") {
        player.sendMessage("§6═══ Economy Commands ═══");
        player.sendMessage("§f  !bal §7— check your balance");
        player.sendMessage("§f  !pay <player> <amount> §7— send coins");
        player.sendMessage("§f  !top §7— view leaderboard");
        return true;
    }

    return false;
}

export function registerEconomyEvents(): void {

    // Chat commands
    world.beforeEvents.chatSend.subscribe((event) => {
        const handled = handleEconomyCommand(event.sender, event.message);
        if (handled) {
            event.cancel = true;
        }
    });

    // Mob kill rewards
    world.afterEvents.entityDie.subscribe((event) => {
        const source = event.damageSource.damagingEntity;
        if (!source || source.typeId !== "minecraft:player") return;

        const player = source as Player;
        const mobTypeId = event.deadEntity.typeId;

        economyManager.rewardKill(player, mobTypeId).catch(() => {
            // Silent fail — no spam on repeated kills
        });
    });

    // Balance HUD — every 60 ticks (3 seconds)
    system.runInterval(() => {
        for (const player of world.getPlayers()) {
            const cached = economyManager.getCachedBalance(player.id);
            if (cached !== undefined) {
                player.onScreenDisplay.setActionBar(`§6💰 ${cached} coins`);
            }
        }
    }, 60);

    // Sync balance from server — every 200 ticks (10 seconds)
    system.runInterval(() => {
        for (const player of world.getPlayers()) {
            economyManager.showBalance(player).catch(() => {});
        }
    }, 200);
}
