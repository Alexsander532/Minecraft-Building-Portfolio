# Quest System ⚔️

A procedural quest generation system for Minecraft Bedrock. Quests are randomly generated with unique objectives — kill, collect, explore, or craft — each with dynamic rewards.

## Features

- **Procedural Generation**: quests are randomly assembled from pools of targets and objectives
- **4 Quest Types**: kill mobs, collect items, explore biomes, craft items
- **Dynamic Rewards**: coins and XP scale with quest difficulty
- **Progress Tracking**: real-time kill/collect monitoring
- **Quest HUD**: action bar shows active quest progress
- **Chat Commands**: `!quest new`, `!quest list`, `!quest abandon`, `!quest stats`
- **TypeScript source**: fully typed, modular architecture

## Quest Types

| Type | Example | Tracking |
|------|---------|----------|
| `kill` | Kill 5 Zombies | `entityDie` event |
| `collect` | Gather 10 Wheat | Inventory scanning |
| `explore` | Find the Desert | Biome detection |
| `craft` | Craft 2 Iron Swords | Craft event |

## Commands

| Command | Description |
|---------|-------------|
| `!quest new` | Generate a new random quest |
| `!quest list` | List all active quests |
| `!quest abandon <n>` | Abandon quest number n |
| `!quest stats` | View completion stats |

## Installation

1. Run `npm install` then `npm run build`
2. Import both packs into Minecraft Bedrock
3. Enable **Beta APIs** in Experiments
4. Apply to your world

## Project Structure

```
12-quest-system/
├── src/                        ← TypeScript source (edit this)
│   ├── main.ts                 # Entry point
│   ├── quests/
│   │   ├── questGenerator.ts   # Random quest assembly
│   │   ├── questManager.ts     # Assignment, progress, completion
│   │   └── questTracker.ts     # Kill/collect/craft tracking
│   └── systems/
│       └── questEvents.ts      # Event listeners, HUD, commands
├── behavior_pack/
│   ├── manifest.json
│   └── scripts/                ← compiled output (do not edit)
├── resource_pack/
├── README.md
└── DOCUMENTACAO_PT_BR.md
```
