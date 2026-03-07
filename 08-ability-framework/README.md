# Ability Framework ⚙️

A professional ability system framework for Minecraft Bedrock. Register abilities with cooldowns, costs, toggles, and feedback — all modular and reusable.

## How it works

- **Feather** → Dash (5s cooldown)
- **Stick** → Freeze Spell (10s cooldown)
- **Blaze Rod** → Item Magnet (toggle on/off)

Each ability is registered through `AbilityRegistry` and managed by `AbilitySystem` + `CooldownManager`.

## Architecture

```
scripts/
├── main.js                     # Entry point — registers abilities & listens to events
├── abilities/
│   ├── dash.js                 # Dash ability definition
│   ├── freeze.js               # Freeze ability definition
│   └── magnet.js               # Magnet ability definition (toggle + loop)
└── systems/
    ├── abilityRegistry.js      # Registry for all abilities
    ├── abilitySystem.js        # Core logic: cooldown check, cost, toggle, activation
    └── cooldown.js             # Cooldown manager (tick-based)
```

## Adding a New Ability

```javascript
import { abilityRegistry } from "../systems/abilityRegistry.js";

abilityRegistry.register({
    id: "heal",
    name: "Heal",
    item: "minecraft:golden_apple",
    cooldown: 15,
    execute(player) {
        player.addEffect("regeneration", 100, { amplifier: 2 });
    }
});
```

Then import it in `main.js`:
```javascript
import "./abilities/heal.js";
```

## Installation

1. Import both packs into Minecraft Bedrock
2. Enable **Beta APIs** in Experiments
3. Apply to your world
