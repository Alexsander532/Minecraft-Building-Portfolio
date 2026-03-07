export type QuestType = "kill" | "collect" | "explore" | "craft";

export interface QuestObjective {
    type: QuestType;
    target: string;
    amount: number;
}

export interface QuestReward {
    coins: number;
    xp: number;
    items?: { itemId: string; amount: number }[];
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    objective: QuestObjective;
    reward: QuestReward;
    timeLimit?: number;
}

interface KillPool { mob: string; label: string }
interface CollectPool { item: string; label: string }
interface ExplorePool { biome: string; label: string }
interface CraftPool { item: string; label: string }

const KILL_TARGETS: KillPool[] = [
    { mob: "minecraft:zombie", label: "Zombies" },
    { mob: "minecraft:skeleton", label: "Skeletons" },
    { mob: "minecraft:spider", label: "Spiders" },
    { mob: "minecraft:creeper", label: "Creepers" },
    { mob: "minecraft:enderman", label: "Endermen" },
    { mob: "minecraft:witch", label: "Witches" },
    { mob: "minecraft:drowned", label: "Drowneds" },
];

const COLLECT_TARGETS: CollectPool[] = [
    { item: "minecraft:wheat", label: "Wheat" },
    { item: "minecraft:iron_ingot", label: "Iron Ingots" },
    { item: "minecraft:diamond", label: "Diamonds" },
    { item: "minecraft:gold_ingot", label: "Gold Ingots" },
    { item: "minecraft:coal", label: "Coal" },
    { item: "minecraft:oak_log", label: "Oak Logs" },
    { item: "minecraft:cobblestone", label: "Cobblestone" },
];

const EXPLORE_TARGETS: ExplorePool[] = [
    { biome: "plains", label: "Plains" },
    { biome: "desert", label: "Desert" },
    { biome: "forest", label: "Forest" },
    { biome: "mountains", label: "Mountains" },
    { biome: "swamp", label: "Swamp" },
];

const CRAFT_TARGETS: CraftPool[] = [
    { item: "minecraft:iron_sword", label: "Iron Sword" },
    { item: "minecraft:iron_pickaxe", label: "Iron Pickaxe" },
    { item: "minecraft:bread", label: "Bread" },
    { item: "minecraft:cake", label: "Cake" },
    { item: "minecraft:shield", label: "Shield" },
];

const QUEST_TYPES: QuestType[] = ["kill", "collect", "explore", "craft"];

let questIdCounter = 0;

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function calculateReward(type: QuestType, amount: number): QuestReward {
    const baseCoins = type === "kill" ? 4 : type === "collect" ? 3 : type === "explore" ? 10 : 5;
    const baseXp = type === "kill" ? 2 : type === "collect" ? 1 : type === "explore" ? 5 : 3;
    return {
        coins: baseCoins * amount + randomInt(0, 5),
        xp: baseXp * amount,
    };
}

export function generateQuest(): Quest {
    const type = randomItem(QUEST_TYPES);
    questIdCounter++;
    const id = `quest_${questIdCounter}_${Date.now()}`;

    switch (type) {
        case "kill": {
            const pool = randomItem(KILL_TARGETS);
            const amount = randomInt(3, 10);
            return {
                id,
                title: `Hunt ${pool.label}`,
                description: `Eliminate ${amount} ${pool.label} to prove your strength.`,
                objective: { type: "kill", target: pool.mob, amount },
                reward: calculateReward("kill", amount),
            };
        }
        case "collect": {
            const pool = randomItem(COLLECT_TARGETS);
            const amount = randomInt(5, 20);
            return {
                id,
                title: `Gather ${pool.label}`,
                description: `Collect ${amount} ${pool.label} and bring them back.`,
                objective: { type: "collect", target: pool.item, amount },
                reward: calculateReward("collect", amount),
            };
        }
        case "explore": {
            const pool = randomItem(EXPLORE_TARGETS);
            const amount = 1;
            return {
                id,
                title: `Explore the ${pool.label}`,
                description: `Travel to the ${pool.label} biome and discover its secrets.`,
                objective: { type: "explore", target: pool.biome, amount },
                reward: calculateReward("explore", amount),
            };
        }
        case "craft": {
            const pool = randomItem(CRAFT_TARGETS);
            const amount = randomInt(1, 3);
            return {
                id,
                title: `Craft ${pool.label}`,
                description: `Craft ${amount} ${pool.label} for the village supply.`,
                objective: { type: "craft", target: pool.item, amount },
                reward: calculateReward("craft", amount),
            };
        }
    }
}
