import type { Player } from "@minecraft/server";
import type { Ability } from "./abilityRegistry.js";
import { CooldownManager } from "./cooldown.js";

const cooldownManager = new CooldownManager();
const toggleStates = new Map<string, boolean>();

export { cooldownManager };

function getToggleKey(playerId: string, abilityId: string): string {
    return `${playerId}:${abilityId}`;
}

function consumeCostItem(player: Player, itemTypeId: string, amount: number): boolean {
    const inventory = player.getComponent("minecraft:inventory");
    if (!inventory) return false;
    const container = inventory.container;
    if (!container) return false;

    for (let i = 0; i < container.size; i++) {
        const item = container.getItem(i);
        if (item?.typeId === itemTypeId) {
            if (item.amount >= amount) {
                item.amount -= amount;
                container.setItem(i, item.amount === 0 ? undefined : item);
                return true;
            }
        }
    }
    return false;
}

export function tryActivateAbility(player: Player, ability: Ability): void {
    if (ability.cost > 0 && ability.costItem) {
        if (!consumeCostItem(player, ability.costItem, ability.cost)) {
            player.onScreenDisplay.setActionBar(`§cNot enough ${ability.costItem}!`);
            return;
        }
    }

    if (ability.toggle) {
        handleToggle(player, ability);
        return;
    }

    handleCooldown(player, ability);
}

function handleCooldown(player: Player, ability: Ability): void {
    if (cooldownManager.isOnCooldown(player.id, ability.id)) {
        const remaining = cooldownManager.getRemainingTicks(player.id, ability.id);
        const seconds = Math.ceil(remaining / 20);
        player.onScreenDisplay.setActionBar(`§c${ability.name} — Cooldown: ${seconds}s`);
        return;
    }

    ability.execute(player);

    if (ability.cooldown > 0) {
        cooldownManager.set(player.id, ability.id, ability.cooldown);
    }
}

function handleToggle(player: Player, ability: Ability): void {
    const key = getToggleKey(player.id, ability.id);
    const current = toggleStates.get(key) ?? false;
    const next = !current;
    toggleStates.set(key, next);
    ability.execute(player, next);
}
