# Behavior Pack

This pack contains all the **game logic** for the Dash Ability addon. It uses the Minecraft Bedrock **Scripting API** (`@minecraft/server`) to listen for item use events and apply physics to the player.

---

## Structure

```
behavior_pack/
├── manifest.json    # Pack identity, version, module type, and dependencies
└── scripts/
    └── main.js      # Entry point — contains the dash ability logic
```

---

## manifest.json

Declares the pack to the game engine. Key fields:

- **`type: "script"`** — tells Minecraft this pack runs JavaScript via the Scripting API.
- **`entry: "scripts/main.js"`** — the file the engine loads on world start.
- **Dependencies** — links to the Resource Pack (by UUID) and to the `@minecraft/server` module (version `1.8.0`).

---

## scripts/main.js

The core of the addon. Uses `world.beforeEvents.itemUse` to intercept item use **before** it is processed by the game, allowing fine-grained control.

### Logic breakdown

```js
world.beforeEvents.itemUse.subscribe((event) => {
    const player = event.source;       // The player who used the item
    const item = event.itemStack;      // The item that was used

    if (item.typeId !== "minecraft:stick") return; // Only trigger on sticks

    const direction = player.getViewDirection();   // Where the player is looking

    player.applyKnockback(
        direction.x,   // Horizontal X force
        direction.z,   // Horizontal Z force
        3,             // Horizontal strength
        0.5            // Vertical boost
    );
});
```

### Why `beforeEvents`?

`beforeEvents.itemUse` fires before the game processes the item action, making it ideal for custom ability triggers that should not interfere with default item behavior.
