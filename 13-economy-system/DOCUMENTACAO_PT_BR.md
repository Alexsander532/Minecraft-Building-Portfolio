# Documentação - Economy System 💰

## 📋 Visão Geral

**Economy System** é um sistema de economia persistente para Minecraft Bedrock Edition. Os saldos dos jogadores são armazenados em PostgreSQL via uma API REST Node.js, sobrevivendo a reinícios do servidor. Inclui recompensas por matar mobs, transferências entre jogadores, leaderboard e log completo de transações.

## 🎯 Funcionalidades

- 💾 **Persistência**: saldos salvos em PostgreSQL (sobrevive reinícios)
- ⚔️ **Recompensas por kill**: coins ao matar mobs (configurável por mob)
- 💸 **Transferências**: envio de coins entre jogadores
- 🏆 **Leaderboard**: ranking dos 10 mais ricos
- 📋 **Log de transações**: audit trail completo
- 🖥️ **HUD de saldo**: coins exibidos no action bar
- 📝 **TypeScript source**: arquitetura modular e tipada

## 📐 Arquitetura

```
Minecraft Bedrock
       ↓
  Script API  (eventos de kill, comandos)
       ↓
  HTTP Request  (@minecraft/server-net)
       ↓
  Node.js Backend  (Express)
       ↓
  PostgreSQL  (armazenamento persistente)
```

## 📂 Estrutura do Projeto

```
13-economy-system/
├── src/                            # TypeScript source
│   ├── main.ts                     # Ponto de entrada
│   ├── economy/
│   │   ├── economyApi.ts           # Cliente HTTP para backend
│   │   └── economyManager.ts       # Lógica de recompensas, comandos
│   └── systems/
│       └── economyEvents.ts        # Eventos, HUD, comandos
├── backend/
│   ├── server.ts                   # API REST Express
│   ├── database.ts                 # Queries PostgreSQL, transações
│   ├── package.json
│   └── .env.example
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
| Nome | Economy System BP |
| UUID Header | d13e1111-0000-4000-9000-000000000001 |
| UUID Módulo | d13e1111-0000-4000-9000-000000000002 |
| Versão | 1.0.0 |
| Engine Mínimo | 1.20.0 |
| Dependência API | @minecraft/server 1.8.0 |
| Dependência Net | @minecraft/server-net 1.0.0-beta |

## 📝 Explicação dos Módulos

### 1. `src/economy/economyApi.ts` — Cliente HTTP

Encapsula todas as chamadas HTTP ao backend usando `@minecraft/server-net`:

```typescript
async function getBalance(playerId: string): Promise<number>
async function addCoins(playerId: string, amount: number): Promise<TransactionResponse>
async function removeCoins(playerId: string, amount: number): Promise<TransactionResponse>
async function transferCoins(fromId: string, toId: string, amount: number): Promise<TransactionResponse>
async function getLeaderboard(limit: number): Promise<LeaderboardEntry[]>
```

#### Interface `TransactionResponse`

```typescript
interface TransactionResponse {
    id: string;
    coins: number;        // Saldo após transação
    success: boolean;     // Se a operação foi bem sucedida
}
```

### 2. `src/economy/economyManager.ts` — Gerenciador

#### Recompensas por Mob

| Mob | Coins | Mob | Coins |
|-----|-------|-----|-------|
| Zombie | 5 | Phantom | 10 |
| Skeleton | 5 | Witch | 12 |
| Spider | 3 | Enderman | 15 |
| Creeper | 8 | Blaze | 20 |
| Drowned | 6 | Wither Skeleton | 25 |

#### Cache de Saldo

```typescript
const balanceCache: Map<string, { coins: number; tick: number }> = new Map();
```

O cache evita chamadas HTTP excessivas. Atualizado a cada:
- Transação bem sucedida
- Sync periódico (200 ticks / 10 segundos)

### 3. `src/systems/economyEvents.ts` — Eventos

#### Comandos de Chat

| Comando | Ação |
|---------|------|
| `!bal` | `getBalance()` → `sendMessage()` |
| `!pay <player> <amount>` | `transferCoins()` → notifica ambos |
| `!top` | `getLeaderboard()` → ranking formatado |
| `!economy` | Lista de comandos |

#### Loop de HUD

```typescript
system.runInterval(() => {
    // A cada 60 ticks (3s), mostra saldo no action bar
    player.onScreenDisplay.setActionBar(`§6💰 ${cached} coins`);
}, 60);
```

#### Sync Periódico

```typescript
system.runInterval(() => {
    // A cada 200 ticks (10s), sincroniza saldo do servidor
    economyManager.showBalance(player);
}, 200);
```

### 4. `backend/database.ts` — Banco de Dados

#### Schema

```sql
CREATE TABLE players (
    id TEXT PRIMARY KEY,
    coins INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    player_id TEXT NOT NULL,
    type TEXT NOT NULL,        -- 'credit', 'debit', 'transfer_in', 'transfer_out'
    amount INT NOT NULL,
    balance_after INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Transações ACID

Todas as operações de moeda usam **transações PostgreSQL** para garantir consistência:

```typescript
await client.query("BEGIN");
// ... operações ...
await client.query("COMMIT");
// ou em caso de erro:
await client.query("ROLLBACK");
```

**Fluxo de transferência**:
1. Verifica saldo do remetente (dentro da transação)
2. Remove coins do remetente
3. Adiciona coins ao destinatário (INSERT ... ON CONFLICT DO UPDATE)
4. Registra 2 entries de transação (transfer_out + transfer_in)
5. COMMIT

### 5. `backend/server.ts` — API REST

#### Endpoints

| Método | Rota | Body | Resposta |
|--------|------|------|----------|
| GET | `/balance?id=` | — | `{ id, coins }` |
| POST | `/addCoins` | `{ id, amount }` | `{ id, coins, success }` |
| POST | `/removeCoins` | `{ id, amount }` | `{ id, coins, success }` |
| POST | `/transfer` | `{ from, to, amount }` | `{ from, to, coins, success }` |
| GET | `/leaderboard?limit=` | — | `[{ id, coins, rank }]` |
| GET | `/health` | — | `{ status: "ok" }` |

#### Validação de Input

Todas as rotas validam:
- Presença de campos obrigatórios
- `amount` deve ser número positivo
- Saldo suficiente para débitos/transferências

## 🔨 Setup do Banco de Dados

```bash
# Instalar PostgreSQL
sudo apt install postgresql

# Criar banco
sudo -u postgres createdb economy

# Configurar .env
cd backend
cp .env.example .env
# Edite .env com suas credenciais

# Iniciar backend (cria tabelas automaticamente)
npm run dev
```

## ⚙️ Como Adicionar Recompensas

Em `src/economy/economyManager.ts`:

```typescript
const MOB_REWARDS: Record<string, number> = {
    // ... existing
    "minecraft:guardian": 18,
    "minecraft:elder_guardian": 50,
};
```

## 🧠 O Que Você Aprende com Este Projeto

- ✅ Arquitetura cliente-servidor com persistência
- ✅ PostgreSQL: schema design, transações ACID
- ✅ REST API com Express.js
- ✅ HTTP client em Minecraft Script API
- ✅ Cache de dados com TTL
- ✅ Sistema de transferência com validação
- ✅ Leaderboard com window functions SQL
- ✅ Audit trail (log de transações)

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| Saldo não atualiza | Verifique se o backend está rodando (`npm run dev`) |
| Erro de conexão | Confirme credenciais PostgreSQL no `.env` |
| Transferência falha | Verifique saldo suficiente com `!bal` |
| `server-net` não disponível | Requer Bedrock Dedicated Server (BDS) |
| Tabelas não existem | O backend cria automaticamente ao iniciar |

## 🔐 Compatibilidade

- **Versão Mínima**: Minecraft 1.20.0+
- **Plataformas**: Bedrock Dedicated Server (necessário para server-net)
- **API**: @minecraft/server 1.8.0+, @minecraft/server-net 1.0.0-beta
- **Backend**: Node.js 18+, PostgreSQL 14+
- **TypeScript**: 5.3.0+

## 👨‍💻 Autor e Versão

- **Versão**: 1.0.0
- **Data**: Março 2026
- **Status**: Completo
