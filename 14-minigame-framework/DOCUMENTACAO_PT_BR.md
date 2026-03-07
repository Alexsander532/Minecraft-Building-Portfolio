# Documentação - Minigame Framework 🎮

## 📋 Visão Geral

**Minigame Framework** é um framework extensível para minigames no Minecraft Bedrock Edition. Permite registrar minigames customizados com gerenciamento de lobby, scoreboards e máquina de estados. Muito usado por servidores grandes para criar experiências de jogo variadas. Inclui 2 minigames de exemplo: Spleef e Parkour Race.

## 🎯 Funcionalidades

- 🔄 **Máquina de estados**: ciclo LOBBY → STARTING → RUNNING → ENDING
- 🏠 **Sistema de lobby**: preparação, teleporte, gerenciamento de inventário
- 🏆 **Scoreboard Manager**: pontuação por jogo, ranking, detecção de vencedor
- ⏱️ **Countdown automático**: inicia quando mínimo de jogadores atingido
- 🎮 **2 jogos incluídos**: Spleef e Parkour Race
- 🔌 **Registro fácil**: implemente interface `Minigame` para adicionar jogos
- 📝 **TypeScript source**: arquitetura modular e tipada

## 📂 Estrutura do Projeto

```
14-minigame-framework/
├── src/                            # TypeScript source
│   ├── main.ts                     # Ponto de entrada + registro de jogos
│   ├── framework/
│   │   ├── gameManager.ts          # Máquina de estados, comandos, loop
│   │   ├── lobbySystem.ts          # Teleporte, preparação, restauração
│   │   └── scoreboard.ts           # Pontuação, ranking, vencedor
│   └── games/
│       ├── spleef.ts               # Minigame Spleef
│       └── parkour.ts              # Minigame Parkour Race
├── behavior_pack/
│   ├── manifest.json
│   └── scripts/                    # Compilado (não editar)
├── resource_pack/
├── README.md
├── DOCUMENTACAO_PT_BR.md
└── .gitignore
```

## 🛠️ Componentes Técnicos

### Behavior Pack (`behavior_pack/manifest.json`)

| Campo | Valor |
|-------|-------|
| Nome | Minigame Framework BP |
| UUID Header | e14e1111-0000-4000-9000-000000000001 |
| UUID Módulo | e14e1111-0000-4000-9000-000000000002 |
| Versão | 1.0.0 |
| Engine Mínimo | 1.20.0 |
| Dependência API | @minecraft/server 1.8.0 |

## 📝 Explicação dos Módulos

### 1. `src/framework/gameManager.ts` — Gerenciador de Jogos

#### Estados do Jogo

```typescript
type GameState = "LOBBY" | "STARTING" | "RUNNING" | "ENDING";
```

```
LOBBY      → Aguardando jogadores
STARTING   → Countdown ativo (ex: 10, 9, 8...)
RUNNING    → Jogo em andamento
ENDING     → Jogo terminando (mostra vencedor, 5s delay)
→ Reset → LOBBY
```

#### Interface `MinigameConfig`

```typescript
interface MinigameConfig {
    id: string;               // ID único do jogo
    name: string;             // Nome exibível
    minPlayers: number;       // Mínimo para iniciar
    maxPlayers: number;       // Máximo por partida
    countdownSeconds: number; // Tempo de countdown
    gameDurationSeconds: number; // Duração máxima
}
```

#### Interface `Minigame`

Todo minigame deve implementar:

```typescript
interface Minigame {
    getConfig(): MinigameConfig;
    onPlayerJoin(player: Player): void;
    onPlayerLeave(player: Player): void;
    onStart(players: Player[]): void;
    onTick(tick: number): void;
    onEnd(): void;
    checkWinCondition(players: Player[]): Player | undefined;
}
```

#### Classe `GameManager`

```typescript
class GameManager {
    registerGame(game: Minigame): void
    joinGame(player: Player, gameId: string): boolean
    leaveGame(player: Player, gameId: string): void
    startGame(gameId: string): void
    endGame(gameId: string): void
    tick(): void                                    // Chamado todo tick
    getPlayersInGame(gameId: string): Player[]
    broadcastToGame(gameId: string, message: string): void
}
```

#### Fluxo do Game Loop

```
tick() — executado a cada tick
  │
  ├── STARTING?
  │   ├── Calcula tempo restante do countdown
  │   ├── Se <= 0 → startGame()
  │   └── Se <= 5s → mostra countdown no chat
  │
  └── RUNNING?
      ├── game.onTick(tick)
      ├── game.checkWinCondition(players)
      │   └── Se winner → endGame()
      └── Verifica tempo limite
          └── Se expirou → endGame()
```

#### Comandos de Chat

| Comando | Ação |
|---------|------|
| `!join <game>` | `joinGame()` — entra no lobby |
| `!leave` | `leaveGame()` + teleporta ao lobby |
| `!games` | Lista todos os jogos com estado e contagem |

### 2. `src/framework/lobbySystem.ts` — Sistema de Lobby

```typescript
class LobbySystem {
    setLobbySpawn(spawn: Vector3): void
    setGameSpawn(gameId: string, spawn: Vector3): void
    teleportToLobby(player: Player): void
    teleportToGame(player: Player, gameId: string): void
    preparePlayer(player: Player): void     // Limpa inventário, efeitos
    restorePlayer(player: Player): void     // Restaura modo de jogo
}
```

#### Preparação do Jogador

```
preparePlayer():
  1. clear @s          — limpa inventário
  2. effect @s clear   — remove efeitos
  3. gamemode adventure — modo adventure
  4. saturation ∞       — sem fome
```

### 3. `src/framework/scoreboard.ts` — Pontuação

```typescript
class ScoreboardManager {
    setScore(gameId: string, playerId: string, name: string, score: number): void
    addScore(gameId: string, playerId: string, name: string, amount: number): number
    getScore(gameId: string, playerId: string): number
    getRanking(gameId: string): ScoreEntry[]     // Ordenado por score desc
    getWinner(gameId: string): ScoreEntry | undefined
    resetGame(gameId: string): void
    formatScoreboard(gameId: string): string[]
}
```

### 4. `src/games/spleef.ts` — Spleef

#### Regras

- Jogadores ficam numa plataforma de blocos
- Recebem uma diamond shovel
- Quebram blocos sob outros jogadores
- Quem cai abaixo de Y=95 é eliminado
- Último sobrevivente vence

#### Fluxo

```
onStart() → teleporta + dá shovel + gamemode survival
onTick()  → verifica Y < threshold → elimina jogador
checkWin  → alivePlayers.size === 1 → vencedor
onEnd()   → restaura todos
```

#### Configuração

| Propriedade | Valor |
|-------------|-------|
| Arena Center | x:1000, y:100, z:1000 |
| Fall Threshold | Y < 95 |
| Min Players | 2 |
| Max Players | 8 |
| Duração | 180s |

### 5. `src/games/parkour.ts` — Parkour Race

#### Regras

- Jogadores correm uma pista de parkour
- Passam por checkpoints (3 no total)
- Primeiro a chegar na zona de chegada vence
- Cair reseta ao último checkpoint
- Pontuação por ordem de chegada (10, 9, 8...)

#### Fluxo

```
onStart() → teleporta ao início
onTick()  → verifica checkpoints + zona final + queda
checkWin  → todos terminaram → maior score vence
onEnd()   → restaura todos
```

#### Configuração

| Propriedade | Valor |
|-------------|-------|
| Start Point | x:2000, y:100, z:2000 |
| Finish Zone | x:2090-2100, y:95-110, z:2000-2010 |
| Checkpoints | 3 |
| Min Players | 2 |
| Max Players | 12 |
| Duração | 300s |

## ⚙️ Como Adicionar um Novo Minigame

### 1. Criar o arquivo do jogo

```typescript
// src/games/myGame.ts
import { Player } from "@minecraft/server";
import { Minigame, MinigameConfig } from "../framework/gameManager.js";

export class MyGame implements Minigame {
    getConfig(): MinigameConfig {
        return {
            id: "mygame",
            name: "My Game",
            minPlayers: 2,
            maxPlayers: 10,
            countdownSeconds: 10,
            gameDurationSeconds: 120,
        };
    }

    onPlayerJoin(player: Player): void { ... }
    onPlayerLeave(player: Player): void { ... }
    onStart(players: Player[]): void { ... }
    onTick(tick: number): void { ... }
    onEnd(): void { ... }
    checkWinCondition(players: Player[]): Player | undefined { ... }
}
```

### 2. Registrar em main.ts

```typescript
import { MyGame } from "./games/myGame.js";
manager.registerGame(new MyGame());
```

### 3. Pronto!

Jogadores podem usar `!join mygame` no chat.

## 🔨 Build e Compilação

```bash
npm install
npm run build
npm run watch   # modo watch (recompila ao salvar)
```

## 🧠 O Que Você Aprende com Este Projeto

- ✅ Máquina de estados (State Machine pattern)
- ✅ Interface + polimorfismo em TypeScript
- ✅ Padrão de registro (Registry pattern)
- ✅ Sistema de lobby e preparação de jogadores
- ✅ Scoreboard e ranking
- ✅ Game loop com tick-based logic
- ✅ Detecção de zona (AABB) para checkpoints
- ✅ Countdown e temporizadores
- ✅ Broadcast para grupo específico de jogadores
- ✅ Framework extensível (novo jogo = novo arquivo)

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| Jogo não inicia | Verifique se `minPlayers` foi atingido |
| Jogador não teleporta | Confirme coordenadas do spawn em `lobbySystem` |
| Score não aparece | Verifique se `scoreboardManager.setScore()` foi chamado no `onStart()` |
| Countdown cancela | Alguém saiu e ficou abaixo do `minPlayers` |
| Dois jogos ao mesmo tempo | Cada jogador só pode estar em um jogo |

## 🔐 Compatibilidade

- **Versão Mínima**: Minecraft 1.20.0+
- **Plataformas**: Windows 10/11, Xbox, Nintendo Switch, Mobile (Bedrock)
- **API**: @minecraft/server 1.8.0+
- **TypeScript**: 5.3.0+

## 👨‍💻 Autor e Versão

- **Versão**: 1.0.0
- **Data**: Março 2026
- **Status**: Completo
