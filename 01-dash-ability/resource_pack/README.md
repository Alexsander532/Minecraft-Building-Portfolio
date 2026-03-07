# Resource Pack

This pack handles all **client-side assets** for the Dash Ability addon — textures, models, and sounds. It is currently a skeleton pack with no custom assets, but it is fully wired and ready to be extended.

The Resource Pack is **required** by the Behavior Pack. Its UUID (`b1b8c7f0-0000-4b0c-9000-000000000003`) is declared as a dependency in the Behavior Pack's `manifest.json`.

---

## Structure

```
resource_pack/
├── manifest.json    # Pack identity and module type ("resources")
├── textures/        # PNG textures for custom items, blocks, or UI
├── models/          # JSON geometry models for custom entities or items
└── sounds/          # OGG/WAV audio files for custom sound effects
```

---

## manifest.json

Declares the pack to the game engine. Key fields:

- **`type: "resources"`** — marks this as a client-side asset pack.
- **`uuid`** — must match the UUID referenced in the Behavior Pack's dependency list.

---

## Extending This Pack

| Folder     | What to add                                              |
|------------|----------------------------------------------------------|
| `textures/` | Custom item sprites, block textures, UI icons           |
| `models/`   | `.geo.json` geometry files for custom entities or items |
| `sounds/`   | Audio clips for dash sound effects (`.ogg` recommended) |

To add a dash sound effect, place a `.ogg` file in `sounds/` and reference it in a `sounds/sound_definitions.json` file.
