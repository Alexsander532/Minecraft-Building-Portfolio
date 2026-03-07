import { world } from "@minecraft/server";
import type { Entity } from "@minecraft/server";

const WAND_ITEM = "minecraft:blaze_rod";
const LEVITATE_RADIUS = 8;
const LEVITATE_DURATION = 60; // ticks (3 seconds)
const LEVITATE_AMPLIFIER = 5;

const EXCLUDE_TYPES = [
    "minecraft:player",
    "minecraft:item",
    "minecraft:arrow",
    "minecraft:experience_orb",
];

world.afterEvents.itemUse.subscribe((event) => {
    const player = event.source;
    const item = event.itemStack;

    if (item.typeId !== WAND_ITEM) return;

    const mobs: Entity[] = player.dimension.getEntities({
        location: player.location,
        maxDistance: LEVITATE_RADIUS,
        excludeTypes: EXCLUDE_TYPES,
    });

    for (const mob of mobs) {
        mob.addEffect("levitation", LEVITATE_DURATION, {
            amplifier: LEVITATE_AMPLIFIER,
            showParticles: true,
        });
    }

    if (mobs.length > 0) {
        player.onScreenDisplay.setActionBar(`§d🌌 ${mobs.length} mob(s) levitating!`);
    } else {
        player.onScreenDisplay.setActionBar("§7No mobs nearby.");
    }
});
