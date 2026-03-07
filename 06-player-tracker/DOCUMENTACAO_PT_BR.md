# Documentação - Player Tracker 🧭

## 📋 Visão Geral

**Player Tracker** é um addon para Minecraft Bedrock Edition ideal para minigames e servidores SMP. Quando o jogador segura uma bússola, a actionbar mostra informações em tempo real sobre outros jogadores: quantos estão próximos e qual é o mais perto (com nome e distância).

## 🎯 Funcionalidades

- 🧭 Mostra número de jogadores próximos (raio de 100 blocos)
- 📍 Identifica o jogador mais próximo com nome e distância
- 📊 Informações em tempo real na actionbar
- 🎮 Ativado ao segurar uma bússola

## 📂 Estrutura do Projeto

```
06-player-tracker/
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
| Nome | Player Tracker BP |
| UUID Header | 6a2e1111-0000-4000-9000-000000000001 |
| UUID Módulo | 6a2e1111-0000-4000-9000-000000000002 |
| Versão | 1.0.0 |
| Engine Mínimo | 1.20.0 |
| Dependência API | @minecraft/server 1.8.0 |

### Resource Pack (`resource_pack/manifest.json`)

| Campo | Valor |
|-------|-------|
| Nome | Player Tracker RP |
| UUID Header | 6a2e1111-0000-4000-9000-000000000003 |
| UUID Módulo | 6a2e1111-0000-4000-9000-000000000004 |
| Versão | 1.0.0 |
| Engine Mínimo | 1.20.0 |

## 📝 Explicação do Script

### Arquivo: `behavior_pack/scripts/main.js`

#### Importações e Constantes

```javascript
import { world, system } from "@minecraft/server";

const TRACKER_ITEM = "minecraft:compass";
const SCAN_RADIUS = 100;
```

- **TRACKER_ITEM**: Item que ativa o tracker (bússola)
- **SCAN_RADIUS**: Raio para contar jogadores "próximos" (100 blocos)

#### Função de Distância

```javascript
function getDistance(loc1, loc2) {
    const dx = loc1.x - loc2.x;
    const dy = loc1.y - loc2.y;
    const dz = loc1.z - loc2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
```

Calcula a distância euclidiana 3D entre dois pontos. Fórmula:

$$d = \sqrt{(x_2-x_1)^2 + (y_2-y_1)^2 + (z_2-z_1)^2}$$

#### Loop Principal

```javascript
system.runInterval(() => {
    // ...
}, 10);
```

Roda a cada 10 ticks (0.5 segundos) — suficiente para atualização suave sem causar lag.

#### Filtrar Outros Jogadores

```javascript
const otherPlayers = players.filter(p => p.id !== player.id);
```

Remove o próprio jogador da lista usando `player.id`.

#### Encontrar o Jogador Mais Próximo

```javascript
let closestName = "";
let closestDist = Infinity;

for (const other of otherPlayers) {
    const dist = getDistance(player.location, other.location);
    if (dist < closestDist) {
        closestDist = dist;
        closestName = other.name;
    }
}
```

Algoritmo clássico de "encontrar o mínimo" — percorre todos os jogadores e guarda o que tem menor distância.

#### Contar Jogadores Próximos

```javascript
const nearbyCount = otherPlayers.filter(
    p => getDistance(player.location, p.location) <= SCAN_RADIUS
).length;
```

Filtra apenas jogadores que estão dentro do raio de scan (100 blocos).

#### Exibir na Actionbar

```javascript
player.onScreenDisplay.setActionBar(
    `§bPlayers nearby: §f${nearbyCount}  §6| §eClosest: §f${closestName} §a(${distText} blocks)`
);
```

Códigos de formatação usados:
| Código | Cor |
|--------|-----|
| `§b` | Aqua (azul claro) |
| `§f` | Branco |
| `§6` | Ouro |
| `§e` | Amarelo |
| `§a` | Verde |
| `§7` | Cinza |
| `§c` | Vermelho |

## ⚙️ Configurações Possíveis

### Item de Ativação

```javascript
const TRACKER_ITEM = "minecraft:compass";
```

Exemplos:
- `"minecraft:recovery_compass"` — bússola de recuperação
- `"minecraft:clock"` — relógio
- `"minecraft:spyglass"` — luneta (temático!)

### Raio de Detecção

```javascript
const SCAN_RADIUS = 100;
```

| Valor | Uso |
|-------|-----|
| 50 | Minigames pequenos |
| 100 | Padrão |
| 200 | Mapas grandes |
| 500 | Servidores SMP |

### Frequência de Atualização

```javascript
system.runInterval(() => { ... }, 10);
```

| Ticks | Frequência |
|-------|-----------|
| 1 | Cada tick (pesado) |
| 10 | 2x por segundo (padrão) |
| 20 | 1x por segundo |
| 40 | A cada 2 segundos |

## 🆚 Comparação com Projetos Anteriores

| Aspecto | Item Magnet (02) | Player Tracker (06) |
|---------|-----------------|-------------------|
| Loop | `runInterval(1)` | `runInterval(10)` |
| Alvo | Itens dropados | Outros jogadores |
| Output | Teleporte | Texto na actionbar |
| API nova | `getEntities` | `onScreenDisplay`, cálculo de distância |
| UX | Sem feedback visual | UI na actionbar |

## 🧠 O Que Você Aprende com Este Projeto

- ✅ Trabalhar com lista de players (`world.getPlayers()`)
- ✅ UI simples com `player.onScreenDisplay.setActionBar()`
- ✅ Cálculo de distância euclidiana 3D
- ✅ Filtrar arrays com `.filter()`
- ✅ Encontrar o mínimo em um array (algoritmo clássico)
- ✅ Códigos de formatação de cor do Minecraft (`§`)

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| Nada aparece na tela | Verifique se está segurando uma bússola |
| "No other players online" | Precisa de outro jogador no mundo |
| Lag | Aumente o intervalo do `runInterval` |
| Distância imprecisa | Distância é 3D incluindo altura |

## 🔐 Compatibilidade

- **Versão Mínima**: Minecraft 1.20.0+
- **Plataformas**: Windows 10/11, Xbox, Nintendo Switch, Mobile (Bedrock)
- **API**: @minecraft/server 1.8.0+

## 📌 Notas Importantes

1. A contagem "nearby" usa um raio de 100 blocos, mas "closest" considera qualquer distância
2. É necessário mais de 1 jogador no mundo para exibir informações
3. A atualização ocorre a cada 0.5 segundos para evitar lag
4. Funciona entre dimensões diferentes (overworld/nether/end)?  Não — `getPlayers()` retorna todos, mas a distância entre dimensões não é significativa

## 👨‍💻 Autor e Versão

- **Versão**: 1.0.0
- **Data**: Março 2026
- **Status**: Completo
