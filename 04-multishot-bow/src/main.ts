import { world, Vector3 } from "@minecraft/server";

const SPREAD_ANGLE = 0.3;

world.afterEvents.entitySpawn.subscribe((event) => {

    const entity = event.entity;

    if (entity.typeId !== "minecraft:arrow") return;

    const projectile = entity.getComponent("minecraft:projectile");
    if (!projectile) return;

    const owner = (projectile as any).owner;
    if (!owner) return;
    if (owner.typeId !== "minecraft:player") return;

    const inventory = owner.getComponent("minecraft:inventory");
    if (!inventory) return;

    const container = inventory.container;
    if (!container) return;

    const item = container.getItem(owner.selectedSlotIndex);
    if (!item) return;
    if (item.typeId !== "minecraft:bow") return;

    const velocity: Vector3 = entity.getVelocity();
    const dimension = entity.dimension;
    const location = entity.location;

    const offsets: Vector3[] = [
        {
            x: velocity.x + velocity.z * SPREAD_ANGLE,
            y: velocity.y,
            z: velocity.z - velocity.x * SPREAD_ANGLE,
        },
        {
            x: velocity.x - velocity.z * SPREAD_ANGLE,
            y: velocity.y,
            z: velocity.z + velocity.x * SPREAD_ANGLE,
        },
    ];

    for (const offset of offsets) {
        const arrow = dimension.spawnEntity("minecraft:arrow", location);
        arrow.applyImpulse(offset);
    }

});
