import { world } from "@minecraft/server";

const DASH_ITEM = "minecraft:stick";
const DASH_POWER = 3;
const DASH_UP = 0.5;

world.beforeEvents.itemUse.subscribe((event) => {
    const player = event.source;
    const item = event.itemStack;

    if (item.typeId !== DASH_ITEM) return;

    const direction = player.getViewDirection();

    player.applyKnockback(direction.x, direction.z, DASH_POWER, DASH_UP);
});
