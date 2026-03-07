import { world, system } from "@minecraft/server";

const DASH_ITEM = "minecraft:feather";
const DASH_POWER = 2.5;
const COOLDOWN_TICKS = 100; // 5 seconds (20 ticks per second)

const cooldowns = new Map<string, number>();

world.afterEvents.itemUse.subscribe((event) => {

    const player = event.source;
    const item = event.itemStack;

    if (item.typeId !== DASH_ITEM) return;

    const now: number = system.currentTick;
    const lastUsed: number = cooldowns.get(player.id) ?? 0;
    const remaining: number = COOLDOWN_TICKS - (now - lastUsed);

    if (remaining > 0) {
        const seconds = Math.ceil(remaining / 20);
        player.onScreenDisplay.setActionBar(`§cCooldown: ${seconds}s`);
        return;
    }

    cooldowns.set(player.id, now);

    const direction = player.getViewDirection();
    player.applyKnockback(direction.x, direction.z, DASH_POWER, 0.3);

    player.onScreenDisplay.setActionBar("§a⚡ Dash!");

});
