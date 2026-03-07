# Documentação - Dash com Cooldown ⚡

## 📋 Visão Geral

**Dash com Cooldown** é uma evolução do primeiro projeto (01-dash-ability). Adiciona um sistema de dash com gerenciamento de cooldown — o jogador só pode usar a habilidade a cada 5 segundos, com feedback visual na actionbar.

## 🎯 Funcionalidades

- ⚡ Dash na direção que o jogador está olhando
- ⏱️ Cooldown de 5 segundos entre usos
- 📊 Feedback visual na actionbar (tempo restante / confirmação)
- 👥 Funciona corretamente em multiplayer (cada jogador tem seu cooldown)
- 🪶 Ativado ao usar uma pena (feather)

## 📂 Estrutura do Projeto

```
05-dash-cooldown/
├── behavior_pack/
│   ├── manifest.json          # Configuração do behavior pack
│   └── scripts/
│       └── main.js            # Script principal com a lógica
├── resource_pack/
│   ├── manifest.json          # Configuração do resource pack
│   ├── textures/
│   ├── models/
│   └── sounds/
├── README.md
├── DOCUMENTACAO_PT_BR.md
└── .gitignore
```

## 🛠️ Componentes Técnicos

### Behavior Pack (`behavior_pack/manifest.json`)

| Campo | Valor |
|-------|-------|
| Nome | Dash Cooldown BP |
| UUID Header | 5a2e1111-0000-4000-9000-000000000001 |
| UUID Módulo | 5a2e1111-0000-4000-9000-000000000002 |
| Versão | 1.0.0 |
| Engine Mínimo | 1.20.0 |
| Dependência API | @minecraft/server 1.8.0 |

### Resource Pack (`resource_pack/manifest.json`)

| Campo | Valor |
|-------|-------|
| Nome | Dash Cooldown RP |
| UUID Header | 5a2e1111-0000-4000-9000-000000000003 |
| UUID Módulo | 5a2e1111-0000-4000-9000-000000000004 |
| Versão | 1.0.0 |
| Engine Mínimo | 1.20.0 |

## 📝 Explicação do Script

### Arquivo: `behavior_pack/scripts/main.js`

#### Importações e Constantes

```javascript
import { world, system } from "@minecraft/server";

const DASH_ITEM = "minecraft:feather";
const DASH_POWER = 2.5;
const COOLDOWN_TICKS = 100; // 5 segundos
```

- **DASH_ITEM**: O item que ativa o dash
- **DASH_POWER**: Força do impulso (quanto maior, mais longe)
- **COOLDOWN_TICKS**: 100 ticks = 5 segundos

#### Mapa de Cooldowns

```javascript
const cooldowns = new Map();
```

Armazena o último tick em que cada jogador usou o dash. A chave é o `player.id`, garantindo que funciona corretamente em multiplayer.

#### Verificação do Cooldown

```javascript
const now = system.currentTick;
const lastUsed = cooldowns.get(player.id) ?? 0;
const remaining = COOLDOWN_TICKS - (now - lastUsed);

if (remaining > 0) {
    const seconds = Math.ceil(remaining / 20);
    player.onScreenDisplay.setActionBar(`§cCooldown: ${seconds}s`);
    return;
}
```

- `system.currentTick` → tick atual do servidor
- `?? 0` → se nunca usou antes, considera tick 0 (cooldown expirado)
- Se o cooldown ainda está ativo, mostra mensagem vermelha (`§c`) na actionbar
- `Math.ceil(remaining / 20)` → converte ticks para segundos (arredondado para cima)

#### Execução do Dash

```javascript
cooldowns.set(player.id, now);

const direction = player.getViewDirection();
player.applyKnockback(direction.x, direction.z, DASH_POWER, 0.3);

player.onScreenDisplay.setActionBar("§a⚡ Dash!");
```

1. Salva o tick atual como último uso
2. Pega a direção que o jogador está olhando
3. Aplica knockback na direção da visão (dash!)
4. Mostra mensagem verde (`§a`) confirmando o dash

#### `applyKnockback(dirX, dirZ, horizontal, vertical)`

| Parâmetro | Descrição |
|-----------|-----------|
| `dirX` | Direção horizontal X |
| `dirZ` | Direção horizontal Z |
| `horizontal` | Força horizontal (2.5 = forte) |
| `vertical` | Força vertical (0.3 = leve subida) |

## ⚙️ Configurações Possíveis

### Item de Ativação

```javascript
const DASH_ITEM = "minecraft:feather";
```

Exemplos alternativos:
- `"minecraft:ender_pearl"` — pérola do ender
- `"minecraft:blaze_rod"` — vara de blaze
- `"minecraft:nether_star"` — estrela do nether

### Força do Dash

```javascript
const DASH_POWER = 2.5;
```

| Valor | Efeito |
|-------|--------|
| 1.0 | Dash leve |
| 2.5 | Padrão |
| 4.0 | Dash forte |
| 6.0 | Dash extremo |

### Tempo de Cooldown

```javascript
const COOLDOWN_TICKS = 100;
```

| Ticks | Segundos |
|-------|----------|
| 40 | 2s |
| 60 | 3s |
| 100 | 5s (padrão) |
| 200 | 10s |

## 🆚 Comparação: Dash Original vs Dash Cooldown

| Aspecto | Dash Ability (01) | Dash Cooldown (05) |
|---------|-------------------|-------------------|
| Cooldown | Nenhum | 5 segundos |
| Feedback visual | Nenhum | Actionbar |
| Multiplayer | Sem controle | Map por player.id |
| API usada | Básica | `system.currentTick`, `onScreenDisplay` |
| Estado | Stateless | Stateful (Map) |

## 🧠 O Que Você Aprende com Este Projeto

- ✅ Gerenciamento de estado com `Map<playerId, timestamp>`
- ✅ Timers e cooldowns usando `system.currentTick`
- ✅ Feedback visual com `player.onScreenDisplay.setActionBar()`
- ✅ Lógica multiplayer — cada jogador tem estado independente
- ✅ Códigos de formatação do Minecraft (`§c` vermelho, `§a` verde)

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| Dash não funciona | Verifique se está usando uma feather |
| Cooldown não aparece | Verifique se as APIs Beta estão ativas |
| Funciona para um jogador mas não outro | Confirme que `player.id` está sendo usado corretamente |
| Dash muito fraco/forte | Ajuste `DASH_POWER` |

## 🔐 Compatibilidade

- **Versão Mínima**: Minecraft 1.20.0+
- **Plataformas**: Windows 10/11, Xbox, Nintendo Switch, Mobile (Bedrock)
- **API**: @minecraft/server 1.8.0+

## 📌 Notas Importantes

1. O mapa de cooldowns fica na memória do servidor — se o servidor reiniciar, os cooldowns resetam
2. `player.id` é único por sessão (pode mudar entre sessões)
3. O `applyKnockback` não funciona se o jogador está montado em uma entidade
4. A actionbar é compartilhada — outros addons podem sobrescrever a mensagem

## 👨‍💻 Autor e Versão

- **Versão**: 1.0.0
- **Data**: Março 2026
- **Status**: Completo
