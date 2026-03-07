# Documentação - AI NPC System 🤖

## 📋 Visão Geral

**AI NPC System** é um sistema de NPCs com inteligência artificial para Minecraft Bedrock Edition. Villagers nomeados se tornam NPCs que conversam com o jogador usando linguagem natural, lembram do contexto da conversa e possuem personalidades únicas — tudo alimentado pela API da OpenAI via um backend Node.js.

## 🎯 Funcionalidades

- 🧠 **Conversas com IA**: NPCs respondem com diálogos contextuais via OpenAI
- 💬 **Memória persistente**: histórico de conversa por jogador por NPC
- 🎭 **Personalidades únicas**: cada NPC tem personalidade e função próprias
- ⏱️ **Sistema de cooldown**: previne spam de interação
- 🌐 **Backend API**: servidor Node.js + Express ponte entre Minecraft e OpenAI
- 📝 **TypeScript source**: arquitetura modular e tipada

## 📐 Arquitetura

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

## 📂 Estrutura do Projeto

```
11-ai-npc-system/
├── src/                            # TypeScript source
│   ├── main.ts                     # Ponto de entrada
│   ├── config.ts                   # URL da API, cooldowns, configurações
│   └── npc/
│       ├── npcManager.ts           # Perfis, memória, cooldowns
│       └── npcInteraction.ts       # Eventos, chamadas HTTP
├── backend/
│   ├── server.ts                   # Express + OpenAI
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
| Nome | AI NPC System BP |
| UUID Header | b11e1111-0000-4000-9000-000000000001 |
| UUID Módulo | b11e1111-0000-4000-9000-000000000002 |
| Versão | 1.0.0 |
| Engine Mínimo | 1.20.0 |
| Dependência API | @minecraft/server 1.8.0 |
| Dependência Net | @minecraft/server-net 1.0.0-beta |

## 📝 Explicação dos Módulos

### 1. `src/config.ts` — Configuração

```typescript
export const NPC_CONFIG = {
    API_URL: "http://localhost:3001",
    CHAT_ENDPOINT: "/npc-chat",
    INTERACTION_COOLDOWN: 40,     // ticks (2 segundos)
    NPC_ENTITY_TYPE: "minecraft:villager",
    MAX_HISTORY: 20,              // mensagens mantidas no contexto
};
```

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `API_URL` | string | URL base do backend Node.js |
| `CHAT_ENDPOINT` | string | Rota POST para chat |
| `INTERACTION_COOLDOWN` | number | Ticks entre interações |
| `NPC_ENTITY_TYPE` | string | Tipo da entidade NPC |
| `MAX_HISTORY` | number | Máximo de mensagens no histórico |

### 2. `src/npc/npcManager.ts` — Gerenciador de NPCs

#### Interface `NpcProfile`

```typescript
interface NpcProfile {
    id: string;             // ID único do NPC
    name: string;           // Nome exibido (nameTag do villager)
    personality: string;    // Descrição da personalidade para a IA
    role: string;           // Função: quest_giver, merchant, information
}
```

#### Interface `ChatMessage`

```typescript
interface ChatMessage {
    role: "player" | "npc";     // Quem falou
    content: string;            // Conteúdo da mensagem
}
```

#### Classe `NpcManager`

```typescript
class NpcManager {
    register(profile: NpcProfile): void
    getProfile(npcId: string): NpcProfile | undefined
    getProfileByEntity(entity: Entity): NpcProfile | undefined
    getConversation(playerId: string, npcId: string): ChatMessage[]
    addMessage(playerId: string, npcId: string, msg: ChatMessage, maxHistory: number): void
    isOnCooldown(playerId: string, currentTick: number): boolean
    setCooldown(playerId: string, currentTick: number, duration: number): void
    clearConversation(playerId: string, npcId: string): void
}
```

**Armazenamento**:
- `profiles`: `Map<npcId, NpcProfile>` — perfis registrados
- `conversations`: `Map<playerId:npcId, ChatMessage[]>` — histórico de conversa
- `interactionCooldowns`: `Map<playerId, tickExpiration>` — cooldown de interação

**Matching de NPC**: compara `entity.nameTag` com `profile.name`.

### 3. `src/npc/npcInteraction.ts` — Interação

#### Fluxo de Interação

```
1. playerInteractWithEntity → villager
2. Verifica se entity.nameTag = algum NPC registrado
3. Verifica cooldown
4. Monta histórico de conversa
5. Envia POST /npc-chat para backend
6. Recebe resposta da IA
7. Exibe via player.sendMessage()
```

#### HTTP Request (via `@minecraft/server-net`)

```typescript
const request = new HttpRequest(url);
request.method = HttpRequestMethod.Post;
request.headers = [new HttpHeader("Content-Type", "application/json")];
request.body = JSON.stringify({ player, npc, message, history });
const response = await http.request(request);
```

**Payload enviado**:
```json
{
    "player": "Alex",
    "npc": "wizard",
    "message": "Hello!",
    "history": [
        { "role": "player", "content": "Hello!" },
        { "role": "npc", "content": "Greetings, traveler..." }
    ]
}
```

**Resposta esperada**:
```json
{
    "reply": "Ah, you seek knowledge? The ancient library holds many secrets..."
}
```

### 4. `backend/server.ts` — Backend Node.js

#### Rota `POST /npc-chat`

Recebe a mensagem do jogador, monta o prompt do sistema com a personalidade do NPC e envia para a OpenAI.

**System Prompt**:
```
You are "wizard", a Minecraft NPC. A wise and mysterious wizard...
Your role is: quest_giver. You are talking to player "Alex".
Keep responses SHORT (1-2 sentences max). Stay in character.
```

#### Configuração do OpenAI

| Parâmetro | Valor | Descrição |
|-----------|-------|-----------|
| `model` | gpt-4o-mini | Modelo rápido e barato |
| `max_tokens` | 100 | Respostas curtas |
| `temperature` | 0.8 | Criatividade moderada |

## 🎭 NPCs Pré-Configurados

| ID | Nome | Função | Personalidade |
|----|------|--------|--------------|
| `wizard` | Wizard Aldric | Quest Giver | Sábio, fala em enigmas |
| `blacksmith` | Bjorn the Smith | Merchant | Durão, direto, amigável |
| `innkeeper` | Martha | Information | Calorosa, fofoqueira |

## ⚙️ Como Adicionar NPCs

### 1. Registrar no Minecraft (src/npc/npcInteraction.ts)

```typescript
npcManager.register({
    id: "guard",
    name: "Captain Sylas",
    personality: "A stern captain of the guard. Speaks formally.",
    role: "protector",
});
```

### 2. Registrar no Backend (backend/server.ts)

```typescript
const npcProfiles = {
    // ... existing
    guard: {
        personality: "A stern captain of the guard. Speaks formally.",
        role: "protector",
    },
};
```

### 3. No jogo

Nomeie um villager com `Captain Sylas` (usando name tag).

## 🔨 Build e Compilação

```bash
# Minecraft side
npm install
npm run build

# Backend
cd backend
npm install
cp .env.example .env    # adicione sua API key
npm run dev
```

## 🧠 O Que Você Aprende com Este Projeto

- ✅ Integração Minecraft Script API ↔ Backend externo
- ✅ HTTP requests via `@minecraft/server-net`
- ✅ Arquitetura cliente-servidor
- ✅ API da OpenAI (chat completions)
- ✅ Gerenciamento de estado conversacional
- ✅ System prompts e engenharia de prompts
- ✅ Cooldown por jogador com ticks
- ✅ Express.js com TypeScript

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| NPC não responde | Verifique se o nameTag do villager está exatamente igual ao `name` do perfil |
| Erro de conexão | Confirme que o backend está rodando (`npm run dev`) |
| `server-net` não disponível | Requer Bedrock Dedicated Server (BDS) |
| Resposta genérica | Ajuste a `personality` e `temperature` no prompt |
| Cooldown muito longo | Reduza `INTERACTION_COOLDOWN` em `config.ts` |

## 🔐 Compatibilidade

- **Versão Mínima**: Minecraft 1.20.0+
- **Plataformas**: Bedrock Dedicated Server (necessário para server-net)
- **API**: @minecraft/server 1.8.0+, @minecraft/server-net 1.0.0-beta
- **Backend**: Node.js 18+, OpenAI API key
- **TypeScript**: 5.3.0+

## 👨‍💻 Autor e Versão

- **Versão**: 1.0.0
- **Data**: Março 2026
- **Status**: Completo
