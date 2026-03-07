import type { Player } from "@minecraft/server";
import type { AbilityInput } from "../systems/abilityRegistry.js";

const MAGNET_RADIUS = 8;

export const magnetAbility: AbilityInput = {
    id: "magnet",
    name: "Item Magnet",
    item: "minecraft:iron_ingot",
    toggle: true,
    description: "Toggles item attraction. Pulls items toward you each tick.",
    execute: (player: Player, active?: boolean) => {
        const state = active ? "§aON" : "§cOFF";
        player.onScreenDisplay.setActionBar(`§6🧲 Magnet: ${state}`);
        player.setDynamicProperty("magnet_active", active ?? false);
    },
};
