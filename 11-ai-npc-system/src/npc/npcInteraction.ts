import { world, system, Player, Entity } from "@minecraft/server";
import { http, HttpRequest, HttpRequestMethod, HttpHeader } from "@minecraft/server-net";
import { npcManager, ChatMessage } from "./npcManager.js";
import { NPC_CONFIG } from "../config.js";

function setupNpcs(): void {
    npcManager.register({
        id: "wizard",
        name: "Wizard Aldric",
        personality: "A wise and mysterious wizard who speaks in riddles. Knows ancient lore and forgotten spells.",
        role: "quest_giver",
    });

    npcManager.register({
        id: "blacksmith",
        name: "Bjorn the Smith",
        personality: "A tough, no-nonsense blacksmith. Friendly but blunt. Loves talking about weapons.",
        role: "merchant",
    });

    npcManager.register({
        id: "innkeeper",
        name: "Martha",
        personality: "A warm and gossipy innkeeper. Always knows the latest rumors about the town.",
        role: "information",
    });
}

async function sendChatToBackend(
    playerName: string,
    npcId: string,
    message: string,
    history: ChatMessage[]
): Promise<string> {
    const request = new HttpRequest(`${NPC_CONFIG.API_URL}${NPC_CONFIG.CHAT_ENDPOINT}`);
    request.method = HttpRequestMethod.Post;
    request.headers = [new HttpHeader("Content-Type", "application/json")];
    request.body = JSON.stringify({
        player: playerName,
        npc: npcId,
        message,
        history,
    });

    const response = await http.request(request);

    if (response.status === 200) {
        const data = JSON.parse(response.body);
        return data.reply ?? "...";
    }

    return "§c[NPC is not responding]";
}

function handleNpcChat(player: Player, entity: Entity): void {
    const profile = npcManager.getProfileByEntity(entity);
    if (!profile) return;

    const currentTick = system.currentTick;
    if (npcManager.isOnCooldown(player.id, currentTick)) return;
    npcManager.setCooldown(player.id, currentTick, NPC_CONFIG.INTERACTION_COOLDOWN);

    const history = npcManager.getConversation(player.id, profile.id);
    const playerMessage = history.length === 0 ? "Hello!" : "Tell me more.";

    npcManager.addMessage(player.id, profile.id, { role: "player", content: playerMessage }, NPC_CONFIG.MAX_HISTORY);

    player.sendMessage(`${NPC_CONFIG.NPC_NAME_COLOR}[${profile.name}] §7Thinking...`);

    sendChatToBackend(player.name, profile.id, playerMessage, history)
        .then((reply) => {
            npcManager.addMessage(player.id, profile.id, { role: "npc", content: reply }, NPC_CONFIG.MAX_HISTORY);
            player.sendMessage(`${NPC_CONFIG.NPC_NAME_COLOR}[${profile.name}] ${NPC_CONFIG.RESPONSE_COLOR}${reply}`);
            player.onScreenDisplay.setActionBar(`${NPC_CONFIG.NPC_NAME_COLOR}${profile.name} §7is talking to you`);
        })
        .catch(() => {
            player.sendMessage(`${NPC_CONFIG.NPC_NAME_COLOR}[${profile.name}] §c[Connection error]`);
        });
}

export function registerNpcEvents(): void {
    setupNpcs();

    world.afterEvents.playerInteractWithEntity.subscribe((event) => {
        const player = event.player;
        const entity = event.target;

        if (entity.typeId !== NPC_CONFIG.NPC_ENTITY_TYPE) return;

        handleNpcChat(player, entity);
    });
}
