import { world, system } from "@minecraft/server";
import type { Vector3 } from "@minecraft/server";

const TRACKER_ITEM = "minecraft:compass";
const SCAN_RADIUS = 100;
const UPDATE_INTERVAL = 10; // ticks

function getDistance(loc1: Vector3, loc2: Vector3): number {
    const dx = loc1.x - loc2.x;
    const dy = loc1.y - loc2.y;
    const dz = loc1.z - loc2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

system.runInterval(() => {
    const allPlayers = [...world.getPlayers()];

    for (const player of allPlayers) {
        const inventory = player.getComponent("minecraft:inventory");
        if (!inventory) continue;
        const item = inventory.container?.getItem(player.selectedSlotIndex);
        if (!item || item.typeId !== TRACKER_ITEM) continue;

        let nearbyCount = 0;
        let closestDist = Infinity;
        let closestName = "None";

        for (const other of allPlayers) {
            if (other.id === player.id) continue;
            const dist = getDistance(player.location, other.location);
            if (dist <= SCAN_RADIUS) {
                nearbyCount++;
                if (dist < closestDist) {
                    closestDist = dist;
                    closestName = other.name;
                }
            }
        }

        const distText = closestDist === Infinity ? "—" : closestDist.toFixed(1);
        player.onScreenDisplay.setActionBar(
            `§bPlayers nearby: §f${nearbyCount}  §6| §eClosest: §f${closestName} §a(${distText} blocks)`
        );
    }
}, UPDATE_INTERVAL);
