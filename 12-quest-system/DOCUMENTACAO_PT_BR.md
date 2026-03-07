# Documentação - Quest System ⚔️

## 📋 Visão Geral

**Quest System** é um sistema de missões procedurais para Minecraft Bedrock Edition. Cada quest é gerada aleatoriamente a partir de pools de objetivos — matar mobs, coletar itens, explorar biomas ou craftar itens — com recompensas dinâmicas que escalam com a dificuldade. Ideal para servidores RPG, SMP e minigames.

## 🎯 Funcionalidades

- 🎲 **Geração procedural**: quests montadas aleatoriamente a partir de pools
- ⚔️ **4 tipos de quest**: kill, collect, explore, craft
- 💰 **Recompensas dinâmicas**: coins e XP escalando com dificuldade
- 📊 **Rastreamento em tempo real**: monitoramento de kills e inventário
- 🖥️ **Quest HUD**: action bar mostra progresso da quest ativa
- 💬 **Comandos no chat**: `!quest new`, `!quest list`, `!quest abandon`, `!quest stats`
- 📝 **TypeScript source**: arquitetura modular e tipada

## 📂 Estrutura do Projeto

```
12-quest-system/
├── src/                            # TypeScript source
│   ├── main.ts                     # Ponto de entrada
│   ├── quests/
│   │   ├── questGenerator.ts       # Geração aleatória de quests
│   │   ├── questManager.ts         # Atribuição, progresso, conclusão
│   │   └── questTracker.ts         # Rastreamento de kills/coleta/craft
│   └── systems/
│       └── questEvents.ts          # Eventos, HUD, comandos
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
| Nome | Quest System BP |
| UUID Header | c12e1111-0000-4000-9000-000000000001 |
| UUID Módulo | c12e1111-0000-4000-9000-000000000002 |
| Versão | 1.0.0 |
| Engine Mínimo | 1.20.0 |
| Dependência API | @minecraft/server 1.8.0 |

## 📝 Explicação dos Módulos

### 1. `src/quests/questGenerator.ts` — Gerador

#### Tipos de Quest

```typescript
type QuestType = "kill" | "collect" | "explore" | "craft";
```

#### Interface `Quest`

```typescript
interface Quest {
    id: string;              // ID único gerado
    title: string;           // Título da quest
    description: string;     // Descrição
    objective: QuestObjective;
    reward: QuestReward;
    timeLimit?: number;      // Limite de tempo (opcional)
}
```

#### Interface `QuestObjective`

```typescript
interface QuestObjective {
    type: QuestType;         // Tipo de objetivo
    target: string;          // ID do alvo (mob, item, bioma)
    amount: number;          // Quantidade necessária
}
```

#### Interface `QuestReward`

```typescript
interface QuestReward {
    coins: number;           // Moedas
    xp: number;              // Experiência
    items?: { itemId: string; amount: number }[];  // Itens opcionais
}
```

#### Pools de Geração

| Pool | Exemplos | Quantidade |
|------|----------|------------|
| Kill | Zombie, Skeleton, Spider, Creeper... | 3-10 |
| Collect | Wheat, Iron Ingot, Diamond, Gold... | 5-20 |
| Explore | Plains, Desert, Forest, Mountains... | 1 |
| Craft | Iron Sword, Pickaxe, Bread, Cake... | 1-3 |

#### Cálculo de Recompensa

$$\text{coins} = \text{base}_{\text{type}} \times \text{amount} + \text{random}(0, 5)$$

| Tipo | Base Coins | Base XP |
|------|-----------|---------|
| kill | 4 | 2 |
| collect | 3 | 1 |
| explore | 10 | 5 |
| craft | 5 | 3 |

#### Função `generateQuest()`

```typescript
function generateQuest(): Quest
```

1. Seleciona tipo aleatório de `QUEST_TYPES`
2. Seleciona alvo aleatório do pool correspondente
3. Gera quantidade aleatória dentro do range do tipo
4. Calcula recompensa baseada no tipo e quantidade
5. Retorna quest completa com ID único

### 2. `src/quests/questManager.ts` — Gerenciador

#### Classe `QuestManager`

```typescript
class QuestManager {
    assignQuest(playerId: string, quest: Quest, currentTick: number): boolean
    getActiveQuests(playerId: string): ActiveQuest[]
    addProgress(playerId: string, questId: string, amount: number): ActiveQuest | undefined
    completeQuest(playerId: string, questId: string): ActiveQuest | undefined
    abandonQuest(playerId: string, questId: string): boolean
    getPlayerStats(playerId: string): PlayerQuestData
    getQuestsByObjective(playerId: string, type: string, target: string): ActiveQuest[]
    formatQuestList(player: Player): string[]
}
```

**Limites**:
- Máximo de **3 quests ativas** simultâneas
- Não permite quests duplicadas

**Estado por jogador**:

```typescript
interface PlayerQuestData {
    active: ActiveQuest[];      // Quests ativas
    completedCount: number;     // Total completadas
    totalCoinsEarned: number;   // Coins acumulados
    totalXpEarned: number;      // XP acumulado
}
```

### 3. `src/quests/questTracker.ts` — Rastreador

#### Rastreamento de Kill

```
entityDie event → player matou mob
    → verifica se mob.typeId = quest.objective.target
    → addProgress(playerId, questId, 1)
```

#### Rastreamento de Coleta

```
A cada 40 ticks → escaneia inventário do jogador
    → conta itens por typeId
    → compara com quests "collect" ativas
    → atualiza progresso se quantidade suficiente
```

#### Fluxo de Completar Quest

```
progress >= objective.amount
    → quest.completed = true
    → notifyProgress() → sendMessage + setActionBar
    → completeQuest() → remove da lista ativa
    → giveRewards() → xp + items via runCommandAsync
```

### 4. `src/systems/questEvents.ts` — Eventos

#### Comandos de Chat

Usa `beforeEvents.chatSend` para interceptar mensagens que começam com `!quest`:

| Comando | Ação |
|---------|------|
| `!quest new` | `generateQuest()` → `assignQuest()` |
| `!quest list` | `formatQuestList()` → `sendMessage()` |
| `!quest abandon <n>` | `abandonQuest()` |
| `!quest stats` | `getPlayerStats()` → `sendMessage()` |

#### Loop de HUD

```typescript
system.runInterval(() => {
    // A cada 20 ticks (1s), mostra quest ativa no action bar
    player.onScreenDisplay.setActionBar(`§e⚔ ${title} §7[${progress}]`);
}, 20);
```

## ⚙️ Como Adicionar Novos Alvos

### Novo mob para quests de kill

Em `src/quests/questGenerator.ts`:

```typescript
const KILL_TARGETS: KillPool[] = [
    // ... existing
    { mob: "minecraft:phantom", label: "Phantoms" },
];
```

### Novo tipo de quest

1. Adicione o tipo em `QuestType`
2. Crie um pool de alvos
3. Implemente o case em `generateQuest()`
4. Adicione tracking no `questTracker.ts`

## 🔨 Build e Compilação

```bash
npm install
npm run build
npm run watch   # modo watch (recompila ao salvar)
```

## 🧠 O Que Você Aprende com Este Projeto

- ✅ Geração procedural de conteúdo
- ✅ Padrão de pools/loot tables
- ✅ Sistema de rastreamento de estado por jogador
- ✅ Comandos de chat customizados
- ✅ Escaneamento de inventário
- ✅ HUD dinâmico com action bar
- ✅ Cálculos de recompensa escaláveis
- ✅ Gerenciamento de múltiplas quests simultâneas

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| Quest não progride ao matar mob | Verifique se o `typeId` do mob é exatamente o mesmo do pool |
| Coleta não detecta itens | O scan roda a cada 40 ticks — aguarde até 2 segundos |
| Comando não funciona | Escreva `!quest` (com exclamação) no chat |
| Máximo de quests atingido | Abandone ou complete uma quest antes de aceitar nova |

## 🔐 Compatibilidade

- **Versão Mínima**: Minecraft 1.20.0+
- **Plataformas**: Windows 10/11, Xbox, Nintendo Switch, Mobile (Bedrock)
- **API**: @minecraft/server 1.8.0+
- **TypeScript**: 5.3.0+

## 👨‍💻 Autor e Versão

- **Versão**: 1.0.0
- **Data**: Março 2026
- **Status**: Completo
