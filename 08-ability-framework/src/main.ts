import { world, system } from "@minecraft/server";
import { AbilityRegistry } from "./systems/abilityRegistry.js";
import { tryActivateAbility } from "./systems/abilitySystem.js";
import { dashAbility } from "./abilities/dash.js";
import { freezeAbility } from "./abilities/freeze.js";
import { magnetAbility } from "./abilities/magnet.js";

const registry = new AbilityRegistry();

registry.register(dashAbility);
registry.register(freezeAbility);
registry.register(magnetAbility);

// Activate abilities on item use
world.afterEvents.itemUse.subscribe((event) => {
    const player = event.source;
    const item = event.itemStack;

    const ability = registry.findByItem(item.typeId);
    if (!ability) return;

    tryActivateAbility(player, ability);
});

// Tick-based magnet pull for players who have it toggled on
system.runInterval(() => {
    for (const player of world.getPlayers()) {
        const isActive = player.getDynamicProperty("magnet_active");
        if (!isActive) continue;

        const items = player.dimension.getEntities({
            type: "minecraft:item",
            location: player.location,
            maxDistance: 8,
        });

        for (const item of items) {
            item.teleport(player.location);
        }
    }
}, 1);
