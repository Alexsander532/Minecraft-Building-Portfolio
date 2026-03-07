import { Entity } from "@minecraft/server";

export interface NpcProfile {
    id: string;
    name: string;
    personality: string;
    role: string;
}

export interface ChatMessage {
    role: "player" | "npc";
    content: string;
}

class NpcManager {

    private profiles: Map<string, NpcProfile> = new Map();
    private conversations: Map<string, ChatMessage[]> = new Map();
    private interactionCooldowns: Map<string, number> = new Map();

    register(profile: NpcProfile): void {
        this.profiles.set(profile.id, profile);
    }

    getProfile(npcId: string): NpcProfile | undefined {
        return this.profiles.get(npcId);
    }

    getProfileByEntity(entity: Entity): NpcProfile | undefined {
        for (const profile of this.profiles.values()) {
            if (entity.nameTag === profile.name) {
                return profile;
            }
        }
        return undefined;
    }

    getConversation(playerId: string, npcId: string): ChatMessage[] {
        const key = `${playerId}:${npcId}`;
        return this.conversations.get(key) ?? [];
    }

    addMessage(playerId: string, npcId: string, message: ChatMessage, maxHistory: number): void {
        const key = `${playerId}:${npcId}`;
        const history = this.conversations.get(key) ?? [];
        history.push(message);
        if (history.length > maxHistory) {
            history.splice(0, history.length - maxHistory);
        }
        this.conversations.set(key, history);
    }

    isOnCooldown(playerId: string, currentTick: number): boolean {
        const lastTick = this.interactionCooldowns.get(playerId) ?? 0;
        return currentTick < lastTick;
    }

    setCooldown(playerId: string, currentTick: number, durationTicks: number): void {
        this.interactionCooldowns.set(playerId, currentTick + durationTicks);
    }

    clearConversation(playerId: string, npcId: string): void {
        const key = `${playerId}:${npcId}`;
        this.conversations.delete(key);
    }

    getAllProfiles(): NpcProfile[] {
        return [...this.profiles.values()];
    }
}

export const npcManager = new NpcManager();
