import type { Player } from "@minecraft/server";
import type { AbilityInput } from "../systems/abilityRegistry.js";

const DASH_POWER = 3;
const DASH_UP = 0.5;

export const dashAbility: AbilityInput = {
    id: "dash",
    name: "Dash",
    item: "minecraft:feather",
    cooldown: 100,
    description: "Propels you forward at high speed.",
    execute: (player: Player) => {
        const dir = player.getViewDirection();
        player.applyKnockback(dir.x, dir.z, DASH_POWER, DASH_UP);
        player.onScreenDisplay.setActionBar("§a⚡ Dash!");
    },
};
