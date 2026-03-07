# Region Protection 🛡️

A professional region protection system for Minecraft Bedrock servers.

## Features

- **Block Break Protection**: prevent block breaking per region
- **Block Place Protection**: prevent block placing per region
- **PvP Control**: enable/disable PvP per region
- **Enter/Leave messages**: custom messages when entering or leaving regions
- **Multi-region support**: overlapping regions with merged rules (deny wins)
- **TypeScript source**: fully typed, modular architecture

## Architecture

```
src/
├── main.ts                         # Entry point
├── regions/
│   ├── regionData.ts               # Region interface, rules, isInside()
│   └── regionManager.ts            # Register, query, player tracking
└── systems/
    └── regionEvents.ts             # Event handlers + region setup
```

## Adding a Region

In `src/systems/regionEvents.ts`, inside `setupRegions()`:

```typescript
regionManager.register({
    id: "market",
    name: "Market",
    dimension: "minecraft:overworld",
    min: { x: 100, y: -64, z: 100 },
    max: { x: 200, y: 320, z: 200 },
    rules: {
        pvp: false,
        blockBreak: false,
        blockPlace: true,
        abilities: true,
    },
    enterMessage: "§aWelcome to the Market!",
    leaveMessage: "§7You left the Market.",
});
```

## Installation

1. Run `npm install` then `npm run build`
2. Import both packs into Minecraft Bedrock
3. Enable **Beta APIs** in Experiments
4. Apply to your world

## Project Structure

```
10-region-protection/
├── src/                    ← TypeScript source (edit this)
├── behavior_pack/
│   ├── manifest.json
│   └── scripts/           ← compiled output (do not edit)
├── resource_pack/
├── tsconfig.json
├── package.json
├── README.md
├── DOCUMENTACAO_PT_BR.md
└── .gitignore
```
