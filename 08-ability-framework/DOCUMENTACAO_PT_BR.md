# Documentação - Ability Framework ⚙️

## 📋 Visão Geral

**Ability Framework** é um sistema profissional de habilidades para Minecraft Bedrock Edition. Fornece uma arquitetura modular onde cada habilidade é registrada com cooldown, custo, ativação e feedback — seguindo padrões usados em addons de servidores grandes.

## 🎯 Funcionalidades

- ⚙️ Framework de registro de habilidades (`AbilityRegistry`)
- ⏱️ Sistema de cooldown centralizado (`CooldownManager`)
- 💰 Sistema de custo de itens (consome itens do inventário)
- 🔄 Suporte a habilidades toggle (liga/desliga)
- 📊 Feedback automático na actionbar
- 🧩 Arquitetura modular — cada habilidade em arquivo separado

## 📂 Estrutura do Projeto

```
08-ability-framework/
├── behavior_pack/
│   ├── manifest.json
│   └── scripts/
│       ├── main.js                     # Ponto de entrada
│       ├── abilities/
│       │   ├── dash.js                 # Habilidade: Dash
│       │   ├── freeze.js              # Habilidade: Freeze Spell
│       │   └── magnet.js             # Habilidade: Item Magnet (toggle)
│       └── systems/
│           ├── abilityRegistry.js     # Registro de habilidades
│           ├── abilitySystem.js       # Sistema central de ativação
│           └── cooldown.js            # Gerenciador de cooldowns
├── resource_pack/
│   ├── manifest.json
│   ├── textures/
│   ├── models/
│   └── sounds/
├── README.md
├── DOCUMENTACAO_PT_BR.md
└── .gitignore
```

## 🏗️ Arquitetura do Sistema

### Fluxo de Execução

```
Jogador usa item
    ↓
main.js → itemUse event
    ↓
abilitySystem.tryActivateAbility(player, itemTypeId)
    ↓
abilityRegistry.getByItem(itemTypeId)
    ↓
Toggle?
├── SIM → handleToggle() → liga/desliga estado
└── NÃO → handleCooldown()
             ├── cooldownManager.isReady()? 
             │   ├── NÃO → mostra tempo restante
             │   └── SIM → tem custo?
             │              ├── SIM → consumeCostItem()
             │              └── NÃO → ability.execute(player)
             └── cooldownManager.set() → registra cooldown
```

## 📝 Explicação dos Módulos

### 1. `systems/cooldown.js` — Gerenciador de Cooldowns

```javascript
class CooldownManager {
    set(playerId, abilityId, durationTicks)   // Registra cooldown
    isReady(playerId, abilityId)               // Verifica se pode usar
    getRemaining(playerId, abilityId)          // Ticks restantes
    getRemainingSeconds(playerId, abilityId)   // Segundos restantes
}
```

- Usa `Map` com chave `playerId:abilityId` para cooldowns independentes
- Baseado em `system.currentTick` — preciso e sem drift

### 2. `systems/abilityRegistry.js` — Registro de Habilidades

```javascript
class AbilityRegistry {
    register(ability)         // Registra uma habilidade
    get(abilityId)           // Busca por ID
    getByItem(itemTypeId)    // Busca pelo item de ativação
    getAll()                 // Lista todas
}
```

Cada habilidade registrada tem:

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `id` | string | Identificador único |
| `name` | string | Nome exibido ao jogador |
| `item` | string | Item que ativa (typeId) |
| `cooldown` | number | Cooldown em segundos |
| `cost` | number | Quantidade de itens consumidos |
| `costItem` | string | Tipo do item de custo |
| `toggle` | boolean | Se é liga/desliga |
| `execute` | function | Função de execução |
| `description` | string | Descrição |

### 3. `systems/abilitySystem.js` — Sistema Central

```javascript
tryActivateAbility(player, itemTypeId)  // Tenta ativar uma habilidade
isToggleActive(playerId, abilityId)     // Verifica estado de toggle
```

Gerencia:
- Verificação de cooldown
- Consumo de custo (remove itens do inventário)
- Estado de toggle (Map separado)
- Feedback na actionbar

### 4. `abilities/dash.js` — Habilidade Dash

```javascript
abilityRegistry.register({
    id: "dash",
    name: "Dash",
    item: "minecraft:feather",
    cooldown: 5,
    execute(player) {
        const dir = player.getViewDirection();
        player.applyKnockback(dir.x, dir.z, 2.5, 0.3);
    }
});
```

- Item: Pena (feather)
- Cooldown: 5 segundos
- Efeito: Impulso na direção da visão

### 5. `abilities/freeze.js` — Habilidade Freeze Spell

```javascript
abilityRegistry.register({
    id: "freeze",
    name: "Freeze Spell",
    item: "minecraft:stick",
    cooldown: 10,
    execute(player) {
        // Aplica slowness 255 em mobs no raio de 10 blocos
    }
});
```

- Item: Stick (graveto)
- Cooldown: 10 segundos
- Efeito: Congela mobs por 5 segundos

### 6. `abilities/magnet.js` — Habilidade Item Magnet (Toggle)

```javascript
abilityRegistry.register({
    id: "magnet",
    name: "Item Magnet",
    item: "minecraft:blaze_rod",
    toggle: true,
    execute(player, active) { }
});
```

- Item: Blaze Rod
- Tipo: Toggle (liga/desliga)
- Efeito: Puxa itens dropados a cada tick (quando ativo)

## 🚀 Como Adicionar Uma Nova Habilidade

### Passo 1: Criar o arquivo

Crie `abilities/heal.js`:

```javascript
import { abilityRegistry } from "../systems/abilityRegistry.js";

abilityRegistry.register({
    id: "heal",
    name: "Heal",
    item: "minecraft:golden_apple",
    cooldown: 15,
    cost: 1,
    costItem: "minecraft:diamond",
    description: "Heals the player with regeneration",
    execute(player) {
        player.addEffect("regeneration", 100, { amplifier: 2, showParticles: true });
    }
});
```

### Passo 2: Importar em main.js

```javascript
import "./abilities/heal.js";
```

Pronto! A habilidade já funciona com cooldown de 15s e consome 1 diamante.

## ⚙️ Configurações

### Habilidades Incluídas

| Habilidade | Item | Cooldown | Tipo |
|-----------|------|----------|------|
| Dash | Feather | 5s | Cooldown |
| Freeze Spell | Stick | 10s | Cooldown |
| Item Magnet | Blaze Rod | — | Toggle |

### Parâmetros Configuráveis por Habilidade

| Parâmetro | Padrão | Descrição |
|-----------|--------|-----------|
| `cooldown` | 0 | Segundos entre usos |
| `cost` | 0 | Itens consumidos por uso |
| `costItem` | null | Tipo do item de custo |
| `toggle` | false | Se é liga/desliga |

## 🆚 Comparação com Projetos Anteriores

| Aspecto | Projetos 01-07 | Ability Framework (08) |
|---------|----------------|----------------------|
| Estrutura | Script único | Módulos separados |
| Cooldown | Implementação manual | CooldownManager |
| Registro | Hardcoded | AbilityRegistry |
| Custo | Nenhum | Sistema de consumo |
| Toggle | Não suporta | Suporte nativo |
| Adicionar feature | Editar main.js | Criar novo arquivo |
| Reutilização | Nenhuma | Total |

## 🧠 O Que Você Aprende com Este Projeto

- ✅ Arquitetura de código modular
- ✅ Padrão Registry (registro de componentes)
- ✅ Separação de responsabilidades (SoC)
- ✅ Gerenciamento de estado centralizado
- ✅ Sistema de custo com manipulação de inventário
- ✅ Toggle vs Cooldown como padrões de ativação
- ✅ Exportação/importação de módulos ES

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| Habilidade não registra | Verifique se importou em `main.js` |
| Cooldown não funciona | Confirme que `cooldown` está em segundos (não ticks) |
| Custo não consome item | Verifique `costItem` e `cost` |
| Toggle não persiste | Estado é em memória — reiniciar servidor reseta |

## 🔐 Compatibilidade

- **Versão Mínima**: Minecraft 1.20.0+
- **Plataformas**: Windows 10/11, Xbox, Nintendo Switch, Mobile (Bedrock)
- **API**: @minecraft/server 1.8.0+

## 👨‍💻 Autor e Versão

- **Versão**: 1.0.0
- **Data**: Março 2026
- **Status**: Completo
