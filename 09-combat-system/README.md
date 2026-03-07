# Combat System ⚔️

A professional combat logging system for Minecraft Bedrock PvP servers.

## Features

- **Combat Tagging**: Players are tagged for 10s after PvP — leaving = combat log alert
- **Kill Streaks**: Track and broadcast kill streaks (3+)
- **Damage Log**: Records all PvP hits with weapon info
- **Kill Feed**: Server-wide kill messages
- **Combat HUD**: Actionbar shows combat timer

## Installation

1. Import both packs into Minecraft Bedrock
2. Enable **Beta APIs** in Experiments
3. Apply to your world

## Architecture

```
scripts/
├── main.js                     # Entry point + combat HUD loop
├── events/
│   └── combatEvents.js         # Event handlers: hit, die, leave
└── systems/
    └── combatLogger.js         # Core: tags, streaks, damage log
```

## Project Structure

```
09-combat-system/
├── behavior_pack/
│   ├── manifest.json
│   └── scripts/
├── resource_pack/
│   ├── manifest.json
│   ├── textures/
│   ├── models/
│   └── sounds/
├── README.md
├── DOCUMENTACAO_PT_BR.md
└── .gitignore
```
