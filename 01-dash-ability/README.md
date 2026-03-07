# Dash Ability — Minecraft Bedrock Addon

A Minecraft Bedrock Edition addon that grants players a **dash ability** when using a stick. The player is instantly propelled in the direction they are looking, simulating a quick dash movement.

This project is structured as a full addon with a **Behavior Pack** and a **Resource Pack**, following real Bedrock addon conventions.

---

## How It Works

1. The player holds a **stick** (`minecraft:stick`) in their hand.
2. When they **right-click / use** the item, the addon intercepts that event.
3. The player's current view direction is captured.
4. `applyKnockback` launches the player horizontally in that direction with a vertical boost.

---

## Project Structure

```
dash-ability/
├── behavior_pack/       # Game logic and scripting (JavaScript API)
│   ├── manifest.json    # Pack metadata and dependencies
│   └── scripts/
│       └── main.js      # Core dash ability logic
│
├── resource_pack/       # Visual and audio assets
│   ├── manifest.json    # Pack metadata
│   ├── textures/        # Custom textures (reserved for future use)
│   ├── models/          # Custom entity/item models (reserved for future use)
│   └── sounds/          # Custom sounds (reserved for future use)
│
└── world_test/          # Test world for in-game validation
```

---

## Requirements

| Requirement         | Version  |
|---------------------|----------|
| Minecraft Bedrock   | 1.20.0+  |
| `@minecraft/server` | 1.8.0    |
| Scripting API       | Enabled  |

---

## Installation

1. Copy `behavior_pack/` into:
   ```
   com.mojang/development_behavior_packs/dash-ability-bp/
   ```
2. Copy `resource_pack/` into:
   ```
   com.mojang/development_resource_packs/dash-ability-rp/
   ```
3. Create or open a world, enable **both packs**, and activate **Beta APIs** in world settings.
4. Grab a stick in-game and right-click to dash.

---

## Pack UUIDs

| Pack           | Header UUID                          |
|----------------|--------------------------------------|
| Behavior Pack  | `b1b8c7f0-0000-4b0c-9000-000000000001` |
| Resource Pack  | `b1b8c7f0-0000-4b0c-9000-000000000003` |

> The Behavior Pack declares a dependency on the Resource Pack via its UUID.
