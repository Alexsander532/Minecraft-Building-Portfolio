# Documentação - Freeze Spell ❄️

## 📋 Visão Geral

**Freeze Spell** é um addon para Minecraft Bedrock Edition que implementa um feitiço de congelamento. Quando o jogador usa um stick (graveto) ou uma blaze rod, todos os mobs em um raio de 10 blocos recebem Lentidão 255 por 5 segundos, efetivamente paralisando-os.

## 🎯 Funcionalidades

- ❄️ Congela mobs ao usar stick ou blaze rod
- 📍 Detecta mobs em raio de 10 blocos
- ⏱️ Efeito dura 5 segundos (100 ticks)
- 👁️ Exibe partículas visuais do efeito
- 🎮 Ativado por evento de uso de item (não consome ticks desnecessários)

## 📂 Estrutura do Projeto

```
03-freeze-spell/
├── behavior_pack/
│   ├── manifest.json          # Configuração do behavior pack
│   └── scripts/
│       └── main.js            # Script principal com a lógica
├── resource_pack/
│   ├── manifest.json          # Configuração do resource pack
│   ├── textures/              # Pastas para texturas (vazio)
│   ├── models/                # Pastas para modelos (vazio)
│   └── sounds/                # Pastas para sons (vazio)
├── README.md                  # Instruções em inglês
└── DOCUMENTACAO_PT_BR.md      # Esta documentação
```

## 🛠️ Componentes Técnicos

### Behavior Pack (`behavior_pack/manifest.json`)

| Campo | Valor |
|-------|-------|
| Nome | Freeze Spell BP |
| UUID Header | 3f2e1111-0000-4000-9000-000000000001 |
| UUID Módulo | 3f2e1111-0000-4000-9000-000000000002 |
| Versão | 1.0.0 |
| Engine Mínimo | 1.20.0 |
| Dependência API | @minecraft/server 1.8.0 |

### Resource Pack (`resource_pack/manifest.json`)

| Campo | Valor |
|-------|-------|
| Nome | Freeze Spell RP |
| UUID Header | 3f2e1111-0000-4000-9000-000000000003 |
| UUID Módulo | 3f2e1111-0000-4000-9000-000000000004 |
| Versão | 1.0.0 |
| Engine Mínimo | 1.20.0 |

## 📝 Explicação do Script

### Arquivo: `behavior_pack/scripts/main.js`

#### Importações e Constantes

```javascript
import { world } from "@minecraft/server";

const FREEZE_ITEMS = ["minecraft:stick", "minecraft:blaze_rod"];
const FREEZE_RADIUS = 10;
const FREEZE_DURATION = 100; // 5 segundos (20 ticks por segundo)
```

- **FREEZE_ITEMS**: Lista de itens que ativam o feitiço
- **FREEZE_RADIUS**: Raio de detecção em blocos
- **FREEZE_DURATION**: Duração do efeito em ticks (100 ticks = 5 segundos)

#### Diferença em relação ao projeto anterior

Ao invés de `system.runInterval` (loop de ticks), aqui usamos um **evento de uso de item**:

```javascript
world.afterEvents.itemUse.subscribe((event) => { ... })
```

Isso é mais eficiente: o código só executa quando o jogador usa um item, e não 20 vezes por segundo.

#### Verificação do Item Usado

```javascript
const player = event.source;
const item = event.itemStack;

if (!FREEZE_ITEMS.includes(item.typeId)) return;
```

- `event.source` → o jogador que usou o item
- `event.itemStack` → o item que foi usado
- `.includes()` → verifica se o item está na lista de itens permitidos

#### Busca de Mobs

```javascript
const dimension = player.dimension;

const mobs = dimension.getEntities({
    location: player.location,
    maxDistance: FREEZE_RADIUS,
    excludeTypes: ["minecraft:player", "minecraft:item"]
});
```

- `excludeTypes` → exclui jogadores e itens dropados da busca (queremos apenas mobs)

#### Aplicação do Efeito

```javascript
for (const mob of mobs) {
    mob.addEffect("slowness", FREEZE_DURATION, {
        amplifier: 255,
        showParticles: true
    });
}
```

- **"slowness"**: Tipo do efeito (Lentidão)
- **FREEZE_DURATION**: 100 ticks = 5 segundos
- **amplifier: 255**: Nível máximo do efeito — Lentidão 255 = movimento impossível
- **showParticles: true**: Exibe as partículas do efeito visualmente

## 🚀 Como Usar

### Instalação

1. **Preparação do Mundo**
   - Abra o Minecraft Bedrock Edition
   - Crie um novo mundo ou abra um existente
   - Acesse as configurações do mundo

2. **Importar os Packs**
   - Vá para: Configurações → Comportamento e Recursos
   - Importe o `behavior_pack` e o `resource_pack`

3. **Ativar APIs Beta**
   - Em Configurações do Mundo → Experimentos
   - Ative: "Experimental APIs for Script"

4. **Aplicar ao Mundo**
   - Ative ambos os packs na lista de packs ativos
   - Confirme e salve

### Uso no Jogo

1. Obtenha um **stick** ou **blaze rod** (modo Criativo ou sobrevivência)
2. Segure o item na mão
3. **Clique com o botão direito** (use o item)
4. Todos os mobs em 10 blocos de distância serão congelados por 5 segundos!

## ⚙️ Configurações Possíveis

### Lista de Itens que Ativam o Feitiço

```javascript
const FREEZE_ITEMS = ["minecraft:stick", "minecraft:blaze_rod"];
```

Adicione ou remova itens conforme desejar. Exemplos:
- `"minecraft:diamond_sword"` — espada de diamante
- `"minecraft:snowball"` — bola de neve (temático!)
- `"minecraft:ice"` — gelo

### Distância de Detecção

```javascript
const FREEZE_RADIUS = 10;
```

- `5`: Apenas mobs próximos
- `10`: Padrão (balanceado)
- `20`: Área grande

### Duração do Congelamento

```javascript
const FREEZE_DURATION = 100; // 5 segundos
```

| Ticks | Segundos |
|-------|----------|
| 20 | 1s |
| 60 | 3s |
| 100 | 5s |
| 200 | 10s |
| 400 | 20s |

### Nível do Efeito

```javascript
amplifier: 255
```

- `0` → Lentidão I (levemente lento)
- `5` → Lentidão VI (muito lento)
- `255` → Lentidão 256 (parado completamente)

## 🆚 Comparação com o Projeto Anterior

| Aspecto | Item Magnet (02) | Freeze Spell (03) |
|---------|-----------------|-------------------|
| Trigger | Loop de ticks | Evento de uso de item |
| API usada | `system.runInterval` | `world.afterEvents.itemUse` |
| Entidades alvo | Itens dropados | Mobs |
| Ação | Teleportar | Aplicar efeito |
| Performance | Executa 20x/segundo | Executa apenas no clique |

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| O addon não funciona | Verifique se as APIs Beta estão ativadas |
| Mobs não congelam | Verifique se está usando o item correto |
| Jogadores congelam | Isso não deve ocorrer — `excludeTypes` exclui players |
| Efeito muito fraco | Confirme `amplifier: 255` no código |

## 🧠 O Que Você Aprende com Este Projeto

- ✅ Como usar `getEntities()` para buscar mobs por localização
- ✅ Como usar `addEffect()` para aplicar efeitos de poção
- ✅ A diferença entre eventos (`afterEvents`) e loops (`runInterval`)
- ✅ Como usar `excludeTypes` para filtrar entidades
- ✅ O conceito de `amplifier` em efeitos do Minecraft

## 🔐 Compatibilidade

- **Versão Mínima**: Minecraft 1.20.0+
- **Plataformas**: Windows 10/11, Xbox, Nintendo Switch, Mobile (Bedrock)
- **API**: @minecraft/server 1.8.0+

## 📌 Notas Importantes

1. Este addon requer **Experimental APIs** ativadas
2. `amplifier: 255` congela o mob completamente (não pode se mover)
3. Mobs ainda podem atacar mesmo congelados (lentidão afeta movimento, não ações)
4. Jogadores são excluídos do efeito via `excludeTypes`

## 👨‍💻 Autor e Versão

- **Versão**: 1.0.0
- **Data**: Março 2026
- **Status**: Completo
