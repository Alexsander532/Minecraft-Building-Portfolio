import { world, system } from "@minecraft/server";
import { CombatLogger } from "./systems/combatLogger.js";
import { registerCombatEvents } from "./events/combatEvents.js";

const logger = new CombatLogger();

registerCombatEvents(logger);

// HUD: show combat tag status to each player
system.runInterval(() => {
    const now = system.currentTick;

    for (const player of world.getPlayers()) {
        if (logger.isTagged(player.id, now)) {
            const streak = logger.getKillStreak(player.id);
            const streakText = streak > 0 ? ` §6| Streak: ${streak}` : "";
            player.onScreenDisplay.setActionBar(`§c⚔ In combat!${streakText}`);
        }
    }
}, 20);
