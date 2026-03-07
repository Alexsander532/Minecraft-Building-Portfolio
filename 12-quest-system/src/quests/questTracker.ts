import { world, Player } from "@minecraft/server";
import { questManager, ActiveQuest } from "./questManager.js";

class QuestTracker {

    trackKill(playerId: string, mobTypeId: string): ActiveQuest[] {
        const matching = questManager.getQuestsByObjective(playerId, "kill", mobTypeId);
        const updated: ActiveQuest[] = [];

        for (const aq of matching) {
            const result = questManager.addProgress(playerId, aq.quest.id, 1);
            if (result) updated.push(result);
        }

        return updated;
    }

    trackCollect(playerId: string, itemTypeId: string, amount: number): ActiveQuest[] {
        const matching = questManager.getQuestsByObjective(playerId, "collect", itemTypeId);
        const updated: ActiveQuest[] = [];

        for (const aq of matching) {
            const result = questManager.addProgress(playerId, aq.quest.id, amount);
            if (result) updated.push(result);
        }

        return updated;
    }

    trackCraft(playerId: string, itemTypeId: string, amount: number): ActiveQuest[] {
        const matching = questManager.getQuestsByObjective(playerId, "craft", itemTypeId);
        const updated: ActiveQuest[] = [];

        for (const aq of matching) {
            const result = questManager.addProgress(playerId, aq.quest.id, amount);
            if (result) updated.push(result);
        }

        return updated;
    }

    notifyProgress(player: Player, updated: ActiveQuest[]): void {
        for (const aq of updated) {
            if (aq.completed) {
                player.sendMessage(`§a✔ Quest Complete: §f${aq.quest.title} §6[+${aq.quest.reward.coins} coins, +${aq.quest.reward.xp} XP]`);
                player.onScreenDisplay.setActionBar(`§a✔ Quest Complete!`);

                questManager.completeQuest(player.id, aq.quest.id);
                this.giveRewards(player, aq);
            } else {
                const progress = `${aq.progress}/${aq.quest.objective.amount}`;
                player.onScreenDisplay.setActionBar(`§e${aq.quest.title}: §f${progress}`);
            }
        }
    }

    private giveRewards(player: Player, aq: ActiveQuest): void {
        player.runCommandAsync(`xp ${aq.quest.reward.xp} @s`);

        if (aq.quest.reward.items) {
            for (const item of aq.quest.reward.items) {
                player.runCommandAsync(`give @s ${item.itemId} ${item.amount}`);
            }
        }
    }

    checkInventoryForCollect(player: Player): void {
        const inv = player.getComponent("minecraft:inventory");
        if (!inv) return;

        const container = inv.container;
        if (!container) return;

        const itemCounts: Map<string, number> = new Map();

        for (let i = 0; i < container.size; i++) {
            const stack = container.getItem(i);
            if (!stack) continue;
            const current = itemCounts.get(stack.typeId) ?? 0;
            itemCounts.set(stack.typeId, current + stack.amount);
        }

        for (const [itemId, count] of itemCounts) {
            const matching = questManager.getQuestsByObjective(player.id, "collect", itemId);
            for (const aq of matching) {
                if (count >= aq.quest.objective.amount && aq.progress < aq.quest.objective.amount) {
                    const diff = aq.quest.objective.amount - aq.progress;
                    const result = questManager.addProgress(player.id, aq.quest.id, diff);
                    if (result) this.notifyProgress(player, [result]);
                }
            }
        }
    }
}

export const questTracker = new QuestTracker();
