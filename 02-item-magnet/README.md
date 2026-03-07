# Item Magnet

A Minecraft Bedrock addon that pulls nearby dropped items to the player when holding a stick.

## How it works

- Hold a **stick** in your hand
- All dropped items within **8 blocks** radius are teleported to your location every tick

## Installation

1. Import the behavior pack and resource pack into Minecraft Bedrock
2. Apply both packs to your world
3. Make sure to enable **Beta APIs** in the world settings (Experiments)

## Usage

1. Drop some items on the ground
2. Hold a stick in your hand
3. Watch the items fly to you!

## Project Structure

```
02-item-magnet/
├── behavior_pack/
│   ├── manifest.json
│   └── scripts/
│       └── main.js
├── resource_pack/
│   ├── manifest.json
│   ├── textures/
│   ├── models/
│   └── sounds/
└── README.md
```
