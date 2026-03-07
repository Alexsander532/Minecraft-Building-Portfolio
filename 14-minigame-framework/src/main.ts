import { registerMinigameSystem } from "./framework/gameManager.js";
import { SpleefGame } from "./games/spleef.js";
import { ParkourGame } from "./games/parkour.js";

const manager = registerMinigameSystem();

manager.registerGame(new SpleefGame());
manager.registerGame(new ParkourGame());
