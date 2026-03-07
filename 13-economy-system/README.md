# Economy System 💰

A persistent economy system for Minecraft Bedrock with PostgreSQL backend. Player balances survive server restarts via REST API integration.

## Features

- **Persistent Storage**: PostgreSQL-backed balances that survive server restarts
- **Mob Kill Rewards**: earn coins by killing mobs (configurable per mob type)
- **Player Transfers**: send coins to other players in-game
- **Leaderboard**: top 10 richest players ranking
- **Transaction Log**: full audit trail of all transactions
- **Balance HUD**: live coin display on action bar
- **TypeScript source**: fully typed, modular architecture

## Architecture

```
Minecraft Bedrock
       ↓
  Script API  (kill events, commands)
       ↓
  HTTP Request  (@minecraft/server-net)
       ↓
  Node.js Backend  (Express)
       ↓
  PostgreSQL  (persistent storage)
```

## Mob Rewards

| Mob | Coins |
|-----|-------|
| Zombie | 5 |
| Skeleton | 5 |
| Creeper | 8 |
| Enderman | 15 |
| Blaze | 20 |
| Wither Skeleton | 25 |

## Commands

| Command | Description |
|---------|-------------|
| `!bal` | Check your balance |
| `!pay <player> <amount>` | Send coins to another player |
| `!top` | View leaderboard |
| `!economy` | Show all commands |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/balance?id=<playerId>` | Get player balance |
| POST | `/addCoins` | Add coins to player |
| POST | `/removeCoins` | Remove coins from player |
| POST | `/transfer` | Transfer between players |
| GET | `/leaderboard?limit=10` | Get top players |
| GET | `/health` | Health check |

## Installation

### Minecraft Side
1. Run `npm install` then `npm run build`
2. Import both packs into Minecraft Bedrock
3. Enable **Beta APIs** in Experiments
4. Requires **Bedrock Dedicated Server** for `@minecraft/server-net`

### Backend
1. Install PostgreSQL and create the `economy` database
2. `cd backend && npm install`
3. Copy `.env.example` to `.env` and configure database credentials
4. `npm run dev` to start development server

## Project Structure

```
13-economy-system/
├── src/                        ← TypeScript source (edit this)
│   ├── main.ts                 # Entry point
│   ├── economy/
│   │   ├── economyApi.ts       # HTTP client for backend
│   │   └── economyManager.ts   # Reward logic, commands
│   └── systems/
│       └── economyEvents.ts    # Event handlers, HUD
├── backend/
│   ├── server.ts               # Express REST API
│   ├── database.ts             # PostgreSQL queries, transactions
│   ├── package.json
│   └── .env.example
├── behavior_pack/
│   ├── manifest.json
│   └── scripts/                ← compiled output (do not edit)
├── resource_pack/
├── README.md
└── DOCUMENTACAO_PT_BR.md
```
