import type { Player, Entity } from "@minecraft/server";
import type { AbilityInput } from "../systems/abilityRegistry.js";

const FREEZE_RADIUS = 10;
const FREEZE_DURATION = 100;
const FREEZE_AMPLIFIER = 255;

const EXCLUDE_TYPES = [
    "minecraft:player",
    "minecraft:item",
    "minecraft:arrow",
    "minecraft:experience_orb",
];

export const freezeAbility: AbilityInput = {
    id: "freeze",
    name: "Freeze Spell",
    item: "minecraft:snowball",
    cooldown: 60,
    description: "Freezes all nearby mobs in place.",
    execute: (player: Player) => {
        const mobs: Entity[] = player.dimension.getEntities({
            location: player.location,
            maxDistance: FREEZE_RADIUS,
            excludeTypes: EXCLUDE_TYPES,
        });

        for (const mob of mobs) {
            mob.addEffect("slowness", FREEZE_DURATION, { amplifier: FREEZE_AMPLIFIER, showParticles: false });
        }

        player.onScreenDisplay.setActionBar(`§b❄ ${mobs.length} mob(s) frozen!`);
    },
};
