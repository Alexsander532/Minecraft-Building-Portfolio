# AI NPC System 🤖

An AI-powered NPC conversation system for Minecraft Bedrock. NPCs remember context, have unique personalities, and can give quests — all powered by OpenAI via a Node.js backend.

## Features

- **AI Conversations**: NPCs respond with context-aware dialogue via OpenAI
- **Persistent Memory**: conversation history per player per NPC
- **Unique Personalities**: each NPC has its own personality and role
- **Cooldown System**: prevents interaction spam
- **Backend API**: Node.js + Express server bridges Minecraft to OpenAI
- **TypeScript source**: fully typed, modular architecture

## Architecture

```
Minecraft Bedrock
       ↓
  Script API  (playerInteractWithEntity)
       ↓
  HTTP Request  (@minecraft/server-net)
       ↓
  Node.js Backend  (Express)
       ↓
  OpenAI API  (gpt-4o-mini)
       ↓
  Response → player.sendMessage()
```

## NPC Profiles

| NPC | Name | Role | Personality |
|-----|------|------|-------------|
| `wizard` | Wizard Aldric | Quest Giver | Wise, speaks in riddles |
| `blacksmith` | Bjorn the Smith | Merchant | Tough, blunt, friendly |
| `innkeeper` | Martha | Information | Warm, gossipy |

## Installation

### Minecraft Side
1. Run `npm install` then `npm run build`
2. Import both packs into Minecraft Bedrock
3. Enable **Beta APIs** in Experiments
4. Requires **Bedrock Dedicated Server** for `@minecraft/server-net`
5. Name villagers to match NPC profiles (e.g., `Wizard Aldric`)

### Backend
1. `cd backend && npm install`
2. Copy `.env.example` to `.env` and add your OpenAI API key
3. `npm run dev` to start development server

## Project Structure

```
11-ai-npc-system/
├── src/                        ← TypeScript source (edit this)
│   ├── main.ts                 # Entry point
│   ├── config.ts               # API URL, cooldowns, settings
│   └── npc/
│       ├── npcManager.ts       # NPC profiles, memory, cooldowns
│       └── npcInteraction.ts   # Event handler, HTTP calls
├── backend/
│   ├── server.ts               # Express + OpenAI integration
│   ├── package.json
│   └── .env.example
├── behavior_pack/
│   ├── manifest.json
│   └── scripts/                ← compiled output (do not edit)
├── resource_pack/
├── README.md
└── DOCUMENTACAO_PT_BR.md
```
