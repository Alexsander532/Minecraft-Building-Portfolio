import { world, Entity } from "@minecraft/server";

const FREEZE_ITEMS: string[] = ["minecraft:stick", "minecraft:blaze_rod"];
const FREEZE_RADIUS = 10;
const FREEZE_DURATION = 100; // 5 seconds (20 ticks per second)

world.afterEvents.itemUse.subscribe((event) => {

    const player = event.source;
    const item = event.itemStack;

    if (!FREEZE_ITEMS.includes(item.typeId)) return;

    const dimension = player.dimension;

    const mobs: Entity[] = dimension.getEntities({
        location: player.location,
        maxDistance: FREEZE_RADIUS,
        excludeTypes: ["minecraft:player", "minecraft:item"],
    });

    for (const mob of mobs) {

        mob.addEffect("slowness", FREEZE_DURATION, {
            amplifier: 255,
            showParticles: true,
        });

    }

});
