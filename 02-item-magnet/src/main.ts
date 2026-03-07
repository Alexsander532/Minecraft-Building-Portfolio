import { world, system, Entity } from "@minecraft/server";

const MAGNET_ITEM = "minecraft:stick";
const MAGNET_RADIUS = 8;

system.runInterval(() => {

    const players = world.getPlayers();

    for (const player of players) {

        const inventory = player.getComponent("minecraft:inventory");
        if (!inventory) continue;

        const container = inventory.container;
        if (!container) continue;

        const slot: number = player.selectedSlotIndex;
        const item = container.getItem(slot);

        if (!item) continue;
        if (item.typeId !== MAGNET_ITEM) continue;

        const dimension = player.dimension;

        const items: Entity[] = dimension.getEntities({
            type: "minecraft:item",
            location: player.location,
            maxDistance: MAGNET_RADIUS,
        });

        for (const itemEntity of items) {
            itemEntity.teleport(player.location);
        }

    }

}, 1);
