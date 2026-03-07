import { Player } from "@minecraft/server";
import { Quest } from "./questGenerator.js";

export interface ActiveQuest {
    quest: Quest;
    progress: number;
    assignedAt: number;
    completed: boolean;
}

export interface PlayerQuestData {
    active: ActiveQuest[];
    completedCount: number;
    totalCoinsEarned: number;
    totalXpEarned: number;
}

const MAX_ACTIVE_QUESTS = 3;

class QuestManager {

    private playerQuests: Map<string, PlayerQuestData> = new Map();

    private getOrCreate(playerId: string): PlayerQuestData {
        let data = this.playerQuests.get(playerId);
        if (!data) {
            data = { active: [], completedCount: 0, totalCoinsEarned: 0, totalXpEarned: 0 };
            this.playerQuests.set(playerId, data);
        }
        return data;
    }

    assignQuest(playerId: string, quest: Quest, currentTick: number): boolean {
        const data = this.getOrCreate(playerId);
        if (data.active.length >= MAX_ACTIVE_QUESTS) return false;

        const alreadyHas = data.active.some(aq => aq.quest.id === quest.id);
        if (alreadyHas) return false;

        data.active.push({
            quest,
            progress: 0,
            assignedAt: currentTick,
            completed: false,
        });
        return true;
    }

    getActiveQuests(playerId: string): ActiveQuest[] {
        return this.getOrCreate(playerId).active;
    }

    addProgress(playerId: string, questId: string, amount: number): ActiveQuest | undefined {
        const data = this.getOrCreate(playerId);
        const aq = data.active.find(q => q.quest.id === questId && !q.completed);
        if (!aq) return undefined;

        aq.progress = Math.min(aq.progress + amount, aq.quest.objective.amount);

        if (aq.progress >= aq.quest.objective.amount) {
            aq.completed = true;
        }
        return aq;
    }

    completeQuest(playerId: string, questId: string): ActiveQuest | undefined {
        const data = this.getOrCreate(playerId);
        const index = data.active.findIndex(q => q.quest.id === questId && q.completed);
        if (index === -1) return undefined;

        const [removed] = data.active.splice(index, 1);
        data.completedCount++;
        data.totalCoinsEarned += removed.quest.reward.coins;
        data.totalXpEarned += removed.quest.reward.xp;
        return removed;
    }

    abandonQuest(playerId: string, questId: string): boolean {
        const data = this.getOrCreate(playerId);
        const index = data.active.findIndex(q => q.quest.id === questId);
        if (index === -1) return false;
        data.active.splice(index, 1);
        return true;
    }

    getPlayerStats(playerId: string): PlayerQuestData {
        return this.getOrCreate(playerId);
    }

    getQuestsByObjective(playerId: string, type: string, target: string): ActiveQuest[] {
        const data = this.getOrCreate(playerId);
        return data.active.filter(
            aq => !aq.completed && aq.quest.objective.type === type && aq.quest.objective.target === target
        );
    }

    formatQuestList(player: Player): string[] {
        const data = this.getOrCreate(player.id);
        if (data.active.length === 0) return ["§7No active quests. Talk to an NPC to get one!"];

        return data.active.map((aq, i) => {
            const status = aq.completed ? "§a✔" : "§e⏳";
            const progress = `${aq.progress}/${aq.quest.objective.amount}`;
            return `${status} §f${i + 1}. ${aq.quest.title} §7[${progress}] §6+${aq.quest.reward.coins} coins`;
        });
    }
}

export const questManager = new QuestManager();
