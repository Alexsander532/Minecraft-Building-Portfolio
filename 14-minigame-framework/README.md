# Minigame Framework 🎮

An extensible minigame framework for Minecraft Bedrock servers. Register custom minigames with lobby management, scoreboards, and game state machines.

## Features

- **Game State Machine**: LOBBY → STARTING → RUNNING → ENDING lifecycle
- **Lobby System**: player preparation, teleportation, inventory management
- **Scoreboard Manager**: per-game scoring, rankings, winner detection
- **Auto Countdown**: starts when minimum players reached
- **2 Example Games**: Spleef and Parkour Race included
- **Easy Registration**: implement `Minigame` interface to add new games
- **TypeScript source**: fully typed, modular architecture

## Game States

```
LOBBY  ──→  STARTING  ──→  RUNNING  ──→  ENDING  ──→  LOBBY
  ↑           │                              │           ↑
  └───────────┘ (not enough players)         └───────────┘ (auto reset)
```

## Included Games

| Game | ID | Min Players | Max Players | Duration |
|------|----|-------------|-------------|----------|
| Spleef | `spleef` | 2 | 8 | 3 min |
| Parkour Race | `parkour` | 2 | 12 | 5 min |

## Commands

| Command | Description |
|---------|-------------|
| `!games` | List all available minigames |
| `!join <game>` | Join a minigame lobby |
| `!leave` | Leave current game |

## Installation

1. Run `npm install` then `npm run build`
2. Import both packs into Minecraft Bedrock
3. Enable **Beta APIs** in Experiments
4. Apply to your world

## Adding a New Minigame

Implement the `Minigame` interface:

```typescript
import { Minigame, MinigameConfig } from "../framework/gameManager.js";

export class MyGame implements Minigame {
    getConfig(): MinigameConfig { ... }
    onPlayerJoin(player: Player): void { ... }
    onPlayerLeave(player: Player): void { ... }
    onStart(players: Player[]): void { ... }
    onTick(tick: number): void { ... }
    onEnd(): void { ... }
    checkWinCondition(players: Player[]): Player | undefined { ... }
}
```

Then register in `main.ts`:

```typescript
manager.registerGame(new MyGame());
```

## Project Structure

```
14-minigame-framework/
├── src/                        ← TypeScript source (edit this)
│   ├── main.ts                 # Entry point + game registration
│   ├── framework/
│   │   ├── gameManager.ts      # State machine, commands, game loop
│   │   ├── lobbySystem.ts      # Teleport, prep, restore
│   │   └── scoreboard.ts       # Scoring, ranking, winner
│   └── games/
│       ├── spleef.ts           # Spleef minigame
│       └── parkour.ts          # Parkour Race minigame
├── behavior_pack/
│   ├── manifest.json
│   └── scripts/                ← compiled output (do not edit)
├── resource_pack/
├── README.md
└── DOCUMENTACAO_PT_BR.md
```
