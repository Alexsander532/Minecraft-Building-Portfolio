import { world, system, Player } from "@minecraft/server";
import { generateQuest } from "../quests/questGenerator.js";
import { questManager } from "../quests/questManager.js";
import { questTracker } from "../quests/questTracker.js";

function handleQuestCommand(player: Player, message: string): boolean {
    const args = message.trim().split(/\s+/);
    const cmd = args[0]?.toLowerCase();

    if (cmd === "!quest") {
        const sub = args[1]?.toLowerCase();

        if (!sub || sub === "list") {
            const lines = questManager.formatQuestList(player);
            player.sendMessage("§6═══ Your Quests ═══");
            for (const line of lines) {
                player.sendMessage(line);
            }
            return true;
        }

        if (sub === "new") {
            const quest = generateQuest();
            const assigned = questManager.assignQuest(player.id, quest, system.currentTick);
            if (assigned) {
                player.sendMessage(`§a✦ New Quest: §f${quest.title}`);
                player.sendMessage(`§7  ${quest.description}`);
                player.sendMessage(`§6  Reward: ${quest.reward.coins} coins, ${quest.reward.xp} XP`);
            } else {
                player.sendMessage("§cYou already have the maximum number of active quests (3).");
                player.sendMessage("§7Complete or abandon a quest first: §f!quest abandon <number>");
            }
            return true;
        }

        if (sub === "abandon") {
            const index = parseInt(args[2] ?? "0") - 1;
            const active = questManager.getActiveQuests(player.id);
            if (index < 0 || index >= active.length) {
                player.sendMessage("§cInvalid quest number. Use §f!quest list §cto see your quests.");
                return true;
            }
            const quest = active[index];
            questManager.abandonQuest(player.id, quest.quest.id);
            player.sendMessage(`§c✖ Abandoned: §f${quest.quest.title}`);
            return true;
        }

        if (sub === "stats") {
            const stats = questManager.getPlayerStats(player.id);
            player.sendMessage("§6═══ Quest Stats ═══");
            player.sendMessage(`§7Completed: §f${stats.completedCount}`);
            player.sendMessage(`§7Total Coins: §6${stats.totalCoinsEarned}`);
            player.sendMessage(`§7Total XP: §a${stats.totalXpEarned}`);
            return true;
        }

        player.sendMessage("§eQuest Commands:");
        player.sendMessage("§f  !quest new §7— get a new random quest");
        player.sendMessage("§f  !quest list §7— list active quests");
        player.sendMessage("§f  !quest abandon <n> §7— abandon quest #n");
        player.sendMessage("§f  !quest stats §7— view your stats");
        return true;
    }

    return false;
}

export function registerQuestEvents(): void {

    // Chat commands
    world.beforeEvents.chatSend.subscribe((event) => {
        const handled = handleQuestCommand(event.sender, event.message);
        if (handled) {
            event.cancel = true;
        }
    });

    // Kill tracking
    world.afterEvents.entityDie.subscribe((event) => {
        const source = event.damageSource.damagingEntity;
        if (!source || source.typeId !== "minecraft:player") return;

        const player = source as Player;
        const mobTypeId = event.deadEntity.typeId;

        const updated = questTracker.trackKill(player.id, mobTypeId);
        if (updated.length > 0) {
            questTracker.notifyProgress(player, updated);
        }
    });

    // Inventory check for collect quests — every 40 ticks (2 seconds)
    system.runInterval(() => {
        for (const player of world.getPlayers()) {
            questTracker.checkInventoryForCollect(player);
        }
    }, 40);

    // Quest HUD — every 20 ticks (1 second)
    system.runInterval(() => {
        for (const player of world.getPlayers()) {
            const active = questManager.getActiveQuests(player.id);
            if (active.length === 0) continue;

            const first = active.find(q => !q.completed);
            if (!first) continue;

            const progress = `${first.progress}/${first.quest.objective.amount}`;
            player.onScreenDisplay.setActionBar(`§e⚔ ${first.quest.title} §7[${progress}]`);
        }
    }, 20);
}
