import { world, system } from "@minecraft/server";
import { regionManager } from "./regions/regionManager.js";

// Pre-defined regions — edit here to define your map's protected areas
function setupRegions(): void {

    regionManager.register({
        id: "spawn",
        name: "Spawn Area",
        dimension: "minecraft:overworld",
        min: { x: -50, y: -64, z: -50 },
        max: { x: 50, y: 320, z: 50 },
        rules: {
            pvp: false,
            blockBreak: false,
            blockPlace: false,
            abilities: true,
        },
        enterMessage: "§aYou entered the §eSpawn Area§a. PvP and building are disabled.",
        leaveMessage: "§7You left the Spawn Area.",
    });

    regionManager.register({
        id: "arena",
        name: "PvP Arena",
        dimension: "minecraft:overworld",
        min: { x: 200, y: -64, z: 200 },
        max: { x: 300, y: 320, z: 300 },
        rules: {
            pvp: true,
            blockBreak: false,
            blockPlace: false,
            abilities: true,
        },
        enterMessage: "§cYou entered the §4PvP Arena§c. Fight!",
        leaveMessage: "§7You left the PvP Arena.",
    });

    regionManager.register({
        id: "city",
        name: "Player City",
        dimension: "minecraft:overworld",
        min: { x: 500, y: -64, z: 500 },
        max: { x: 700, y: 320, z: 700 },
        rules: {
            pvp: false,
            blockBreak: false,
            blockPlace: true,
            abilities: true,
        },
        enterMessage: "§bYou entered the §3Player City§b.",
        leaveMessage: "§7You left the Player City.",
    });

}

export function registerRegionEvents(): void {

    setupRegions();

    // Block break protection
    world.beforeEvents.playerBreakBlock.subscribe((event) => {
        const player = event.player;
        const rules = regionManager.getRulesAt(event.block.location, player.dimension.id);

        if (!rules.blockBreak) {
            event.cancel = true;
            player.onScreenDisplay.setActionBar("§c✖ Block breaking is disabled in this region.");
        }
    });

    // Block place protection
    world.beforeEvents.playerPlaceBlock.subscribe((event) => {
        const player = event.player;
        const rules = regionManager.getRulesAt(event.block.location, player.dimension.id);

        if (!rules.blockPlace) {
            event.cancel = true;
            player.onScreenDisplay.setActionBar("§c✖ Block placing is disabled in this region.");
        }
    });

    // PvP protection
    world.beforeEvents.entityHitEntity.subscribe((event) => {
        const attacker = event.damagingEntity;
        const victim = event.hitEntity;

        if (attacker.typeId !== "minecraft:player") return;
        if (victim.typeId !== "minecraft:player") return;

        const rules = regionManager.getRulesAt(attacker.location, attacker.dimension.id);

        if (!rules.pvp) {
            event.cancel = true;
            if (attacker.typeId === "minecraft:player") {
                (attacker as import("@minecraft/server").Player)
                    .onScreenDisplay.setActionBar("§c✖ PvP is disabled in this region.");
            }
        }
    });

    // Region enter/leave notifications — checked every 10 ticks
    system.runInterval(() => {
        for (const player of world.getPlayers()) {
            const { entered, left } = regionManager.updatePlayerRegions(player);

            for (const region of entered) {
                if (region.enterMessage) {
                    player.sendMessage(region.enterMessage);
                }
            }

            for (const region of left) {
                if (region.leaveMessage) {
                    player.sendMessage(region.leaveMessage);
                }
            }
        }
    }, 10);

}
