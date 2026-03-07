# Minecraft Bedrock Addon Portfolio

A collection of **14 progressively complex Minecraft Bedrock addons**, built with the Script API using TypeScript and JavaScript. This portfolio demonstrates a full learning path — from single-file scripts to multi-layer full-stack architectures integrating AI, databases, and REST APIs.

> Built for Minecraft Bedrock Edition · Script API `@minecraft/server` · TypeScript · Node.js

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Projects](#projects)
  - [Phase 1 — Core Scripting](#phase-1--core-scripting)
  - [Phase 2 — Systems & Frameworks](#phase-2--systems--frameworks)
  - [Phase 3 — Full-Stack & Advanced](#phase-3--full-stack--advanced)
- [Architecture Progression](#architecture-progression)
- [Getting Started](#getting-started)

---

## Overview

Each project is a standalone Minecraft Bedrock addon with its own `behavior_pack/`, `resource_pack/`, and source code. Projects are numbered by complexity — earlier projects are simple single-file scripts, later ones introduce TypeScript, design patterns, backend APIs, databases, and AI.

```
Portfolio_Mine/
├── 01-dash-ability/
├── 02-item-magnet/
├── 03-freeze-spell/
├── 04-multishot-bow/
├── 05-dash-cooldown/
├── 06-player-tracker/
├── 07-gravity-wand/
├── 08-ability-framework/
├── 09-combat-system/
├── 10-region-protection/
├── 11-ai-npc-system/
├── 12-quest-system/
├── 13-economy-system/
└── 14-minigame-framework/
```

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Minecraft** | Bedrock Edition, Script API (`@minecraft/server` 1.8.0) |
| **Language** | TypeScript 5.x, JavaScript (ES Modules) |
| **Backend** | Node.js 18+, Express.js |
| **Database** | PostgreSQL 14+ |
| **AI** | OpenAI API (GPT-4o-mini) |
| **HTTP** | `@minecraft/server-net` (Bedrock Dedicated Server) |
| **Build** | TypeScript compiler (`tsc`) |

---

## Projects

### Phase 1 — Core Scripting

Simple, focused addons. Each teaches a fundamental concept of the Minecraft Script API.

---

#### 01 · Dash Ability ⚡

> Instant dash in the direction you're looking when right-clicking a stick.

- **Concept**: `applyImpulse()`, `getViewDirection()`
- **Tech**: JavaScript, `@minecraft/server`
- **Pattern**: single event listener, vector math

```
01-dash-ability/
├── behavior_pack/scripts/main.js
└── resource_pack/
```

---

#### 02 · Item Magnet 🧲

> Pulls all nearby dropped items to the player while holding a stick.

- **Concept**: entity filtering, `teleport()`, radius detection
- **Tech**: JavaScript
- **Pattern**: `runInterval` loop, entity querying

```
02-item-magnet/
├── behavior_pack/scripts/main.js
└── resource_pack/
```

---

#### 03 · Freeze Spell ❄️

> Freezes all nearby mobs on use — applies Slowness 255 in a 10-block radius.

- **Concept**: `addEffect()`, mob targeting, event system
- **Tech**: JavaScript
- **Pattern**: effect application, neighbor filtering

```
03-freeze-spell/
├── behavior_pack/scripts/main.js
└── resource_pack/
```

---

#### 04 · Multishot Bow 🏹

> Every bow shot spawns 2 extra arrows with spread — a custom multishot enchant.

- **Concept**: `projectileHit`, `spawnEntity()`, vector spread
- **Tech**: JavaScript
- **Pattern**: event reaction, entity spawning

```
04-multishot-bow/
├── behavior_pack/scripts/main.js
└── resource_pack/
```

---

#### 05 · Dash with Cooldown ⚡

> Improved version of Dash Ability — adds a 5-second cooldown with action bar feedback.

- **Concept**: tick-based cooldown, `setActionBar()`
- **Tech**: JavaScript
- **Pattern**: `Map`-based per-player state, tick expiration

```
05-dash-cooldown/
├── behavior_pack/scripts/main.js
└── resource_pack/
```

---

#### 06 · Player Tracker 🧭

> Hold a compass to see nearby player count and closest player distance on the HUD.

- **Concept**: distance calculation, HUD display
- **Tech**: JavaScript
- **Pattern**: periodic scan loop, `Math.sqrt` distance

```
06-player-tracker/
├── behavior_pack/scripts/main.js
└── resource_pack/
```

---

#### 07 · Gravity Wand 🌌

> A blaze rod that makes nearby mobs levitate for 3 seconds.

- **Concept**: Levitation effect, AOE radius, use event
- **Tech**: JavaScript
- **Pattern**: AOE effect application

```
07-gravity-wand/
├── behavior_pack/scripts/main.js
└── resource_pack/
```

---

### Phase 2 — Systems & Frameworks

Structured, multi-file projects. Introduces TypeScript, design patterns, and separation of concerns.

---

#### 08 · Ability Framework ⚙️

> A reusable ability system — register abilities with cooldowns, XP costs, toggles, and feedback.

- **Concept**: Registry pattern, modular abilities
- **Tech**: JavaScript (multi-file)
- **Pattern**: `AbilityRegistry`, `AbilitySystem`, `CooldownManager`

```
08-ability-framework/
└── behavior_pack/scripts/
    ├── main.js
    ├── abilities/   (dash, freeze, magnet)
    └── systems/     (abilityRegistry, abilitySystem, cooldown)
```

| Ability | Item | Cooldown | Effect |
|---------|------|----------|--------|
| Dash | Feather | 5s | Forward impulse |
| Freeze | Stick | 10s | Slowness 255 AOE |
| Magnet | Blaze Rod | Toggle | Item pull |

---

#### 09 · Combat System ⚔️

> A professional PvP combat logger for Minecraft servers — kill streaks, combat tagging, damage log.

- **Concept**: `entityHitEntity`, `entityDie`, player state tracking
- **Tech**: JavaScript (multi-file), event bus pattern
- **Pattern**: `combatLogger` (state), `combatEvents` (listeners)

```
09-combat-system/
└── behavior_pack/scripts/
    ├── main.js
    ├── events/combatEvents.js
    └── systems/combatLogger.js
```

| Feature | Description |
|---------|-------------|
| Combat Tag | 10s tag after hitting or being hit |
| Kill Streaks | Broadcast on 3, 5, 10+ kills |
| Combat Log | Alert when tagged player disconnects |
| Kill Feed | Server-wide kill messages |

---

#### 10 · Region Protection 🛡️

> Define protected areas with per-region rules — block breaking, block placing, PvP, and abilities.

- **Concept**: AABB geometry, `beforeEvents` cancellation, player tracking
- **Tech**: **TypeScript**, class-based architecture
- **Pattern**: `RegionManager` class, interface-driven data, merge rules

```
10-region-protection/
└── src/
    ├── main.ts
    ├── regions/   (regionData.ts, regionManager.ts)
    └── systems/   (regionEvents.ts)
```

Rule merging: when regions overlap, **deny always wins**.

$$\text{allowed} = \bigcap_{\text{regions}} \text{region.rule}$$

---

### Phase 3 — Full-Stack & Advanced

Multi-layer projects integrating Minecraft with external backends, databases, and AI APIs.

---

#### 11 · AI NPC System 🤖

> Villagers with AI personalities — context-aware conversations powered by OpenAI.

- **Concept**: HTTP from Minecraft → Node.js → OpenAI, conversation memory
- **Tech**: TypeScript + Node.js backend (Express + OpenAI SDK)
- **Pattern**: `NpcManager` (profiles, history), `@minecraft/server-net` HTTP

```
11-ai-npc-system/
├── src/
│   ├── npc/   (npcManager.ts, npcInteraction.ts)
│   └── config.ts
└── backend/
    └── server.ts   (Express + OpenAI)
```

**Architecture:**

```
Minecraft (playerInteractWithEntity)
    ↓ HTTP POST /npc-chat
Node.js Backend (Express)
    ↓ OpenAI Chat Completions
GPT-4o-mini → reply
    ↓
player.sendMessage()
```

| NPC | Personality | Role |
|-----|-------------|------|
| Wizard Aldric | Wise, speaks in riddles | Quest Giver |
| Bjorn the Smith | Tough, blunt, friendly | Merchant |
| Martha | Warm, gossipy | Information |

---

#### 12 · Quest System ⚔️

> Procedurally generated quests — kill, collect, explore, and craft objectives with dynamic rewards.

- **Concept**: procedural content generation, inventory scanning, per-player task tracking
- **Tech**: TypeScript (multi-module)
- **Pattern**: `QuestGenerator` (pools), `QuestManager` (state), `QuestTracker` (events)

```
12-quest-system/
└── src/
    ├── quests/   (questGenerator.ts, questManager.ts, questTracker.ts)
    └── systems/  (questEvents.ts)
```

**Quest types:**

| Type | Example | Amount | Reward |
|------|---------|--------|--------|
| Kill | Hunt 5 Zombies | 3–10 | 4×amount coins |
| Collect | Gather 10 Wheat | 5–20 | 3×amount coins |
| Explore | Find the Desert | 1 | 10 coins |
| Craft | Craft 2 Iron Swords | 1–3 | 5×amount coins |

**Commands:** `!quest new` · `!quest list` · `!quest abandon <n>` · `!quest stats`

---

#### 13 · Economy System 💰

> A persistent coin economy backed by PostgreSQL — balances survive server restarts.

- **Concept**: REST API integration, SQL transactions, persistent state
- **Tech**: TypeScript + Node.js backend (Express + PostgreSQL)
- **Pattern**: `economyApi` (HTTP client), `economyManager` (logic + cache), ACID transactions

```
13-economy-system/
├── src/
│   ├── economy/   (economyApi.ts, economyManager.ts)
│   └── systems/   (economyEvents.ts)
└── backend/
    ├── server.ts    (Express REST API)
    └── database.ts  (PostgreSQL queries)
```

**Architecture:**

```
Minecraft (kills, commands)
    ↓ HTTP → REST API
Node.js + Express
    ↓ SQL transactions
PostgreSQL (players + transactions tables)
```

**Endpoints:**

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/balance?id=` | Get player balance |
| POST | `/addCoins` | Credit coins |
| POST | `/removeCoins` | Debit coins |
| POST | `/transfer` | Player-to-player transfer |
| GET | `/leaderboard` | Top 10 richest players |

**Commands:** `!bal` · `!pay <player> <amount>` · `!top`

---

#### 14 · Minigame Framework 🎮

> An extensible framework for building minigames — lobby, scoreboard, state machine, and 2 example games.

- **Concept**: State machine, interface/polymorphism, game lifecycle management
- **Tech**: TypeScript (multi-module)
- **Pattern**: `Minigame` interface (strategy pattern), `GameManager` (state machine), `LobbySystem`, `ScoreboardManager`

```
14-minigame-framework/
└── src/
    ├── framework/   (gameManager.ts, lobbySystem.ts, scoreboard.ts)
    └── games/       (spleef.ts, parkour.ts)
```

**Game lifecycle:**

```
LOBBY ──▶ STARTING ──▶ RUNNING ──▶ ENDING ──▶ LOBBY
  ▲           │                                   │
  └───────────┘ (players drop below minimum)      │
  ◀──────────────────────────────────────────────┘ (auto reset after 5s)
```

**Included games:**

| Game | ID | Players | Duration | Win Condition |
|------|----|---------|----------|---------------|
| Spleef | `spleef` | 2–8 | 3 min | Last player alive |
| Parkour Race | `parkour` | 2–12 | 5 min | First to finish line |

**Commands:** `!games` · `!join <game>` · `!leave`

---

## Architecture Progression

```
Projects 01–04   Single file, single concept
                 main.js → event → effect

Projects 05–07   Per-player state management
                 Map<playerId, data> · tick loops · HUD

Projects 08–09   Multi-file modular architecture
                 events/ · systems/ · registry pattern

Project  10      TypeScript + class-based design
                 interfaces · AABB geometry · beforeEvents

Projects 11–13   Full-stack: Minecraft ↔ Node.js ↔ Database/AI
                 REST API · OpenAI · PostgreSQL · ACID transactions

Project  14      Framework design
                 State machine · Strategy pattern · extensibility
```

---

## Getting Started

### Requirements

- Minecraft Bedrock Edition 1.20.0+
- Node.js 18+ (for TypeScript projects)
- PostgreSQL 14+ (project 13 only)
- OpenAI API key (project 11 only)
- Bedrock Dedicated Server (projects 11 & 13, for `@minecraft/server-net`)

### Running a JavaScript Project (01–09)

```bash
# Copy behavior_pack/ and resource_pack/ to your Minecraft worlds folder
# Enable Beta APIs in Experiments
# Apply both packs to your world
```

### Running a TypeScript Project (10–14)

```bash
cd 10-region-protection     # or any 10+ project
npm install
npm run build               # compiles src/ → behavior_pack/scripts/
# Then import both packs into Minecraft
```

### Running a Backend Project (11, 13)

```bash
cd 11-ai-npc-system/backend   # or 13-economy-system/backend
npm install
cp .env.example .env          # add your API key / DB credentials
npm run dev
```

---

## Project Overview

| # | Project | Type | Key Concepts |
|---|---------|------|--------------|
| 01 | Dash Ability | JS | `applyImpulse`, vector math |
| 02 | Item Magnet | JS | Entity filtering, `teleport` |
| 03 | Freeze Spell | JS | `addEffect`, AOE |
| 04 | Multishot Bow | JS | Projectile events, entity spawn |
| 05 | Dash Cooldown | JS | Tick-based cooldown, action bar |
| 06 | Player Tracker | JS | Distance math, HUD |
| 07 | Gravity Wand | JS | Levitation, AOE |
| 08 | Ability Framework | JS | Registry pattern, modular abilities |
| 09 | Combat System | JS | PvP state, kill streaks, combat log |
| 10 | Region Protection | **TS** | AABB, `beforeEvents`, `RegionManager` class |
| 11 | AI NPC System | **TS** + Node | HTTP, OpenAI, conversation memory |
| 12 | Quest System | **TS** | Procedural gen, inventory scan, `Map` state |
| 13 | Economy System | **TS** + Node + PG | REST API, ACID SQL, persistent state |
| 14 | Minigame Framework | **TS** | State machine, strategy pattern, game lifecycle |

---

## Author

**Alexsander** — Minecraft Bedrock Script API Developer

> Building from simple ability scripts to full-stack AI-powered game systems.
