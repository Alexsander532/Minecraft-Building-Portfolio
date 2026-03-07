# Documentação - Multishot Bow 🏹

## 📋 Visão Geral

**Multishot Bow** é um addon para Minecraft Bedrock Edition que adiciona um sistema de multishot customizado. Cada flecha disparada com um arco gera mais 2 flechas extras com direções levemente diferentes, simulando o encantamento "Multishot" da besta.

## 🎯 Funcionalidades

- 🏹 Dispara 3 flechas de uma vez ao usar o arco
- 📐 Flechas extras têm espalhamento angular configurável
- ⚡ Detecta apenas flechas disparadas por jogadores
- 🎮 Funciona automaticamente — basta usar o arco normalmente

## 📂 Estrutura do Projeto

```
04-multishot-bow/
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
| Nome | Multishot Bow BP |
| UUID Header | 4a2e1111-0000-4000-9000-000000000001 |
| UUID Módulo | 4a2e1111-0000-4000-9000-000000000002 |
| Versão | 1.0.0 |
| Engine Mínimo | 1.20.0 |
| Dependência API | @minecraft/server 1.8.0 |

### Resource Pack (`resource_pack/manifest.json`)

| Campo | Valor |
|-------|-------|
| Nome | Multishot Bow RP |
| UUID Header | 4a2e1111-0000-4000-9000-000000000003 |
| UUID Módulo | 4a2e1111-0000-4000-9000-000000000004 |
| Versão | 1.0.0 |
| Engine Mínimo | 1.20.0 |

## 📝 Explicação do Script

### Arquivo: `behavior_pack/scripts/main.js`

#### Importações e Constantes

```javascript
import { world } from "@minecraft/server";

const SPREAD_ANGLE = 0.3;
```

- **SPREAD_ANGLE**: Ângulo de espalhamento das flechas extras (quanto maior, mais espalhadas)

#### Evento de Spawn de Entidade

```javascript
world.afterEvents.entitySpawn.subscribe((event) => {
    const entity = event.entity;
    if (entity.typeId !== "minecraft:arrow") return;
    // ...
});
```

Escuta quando qualquer entidade é spawnada no mundo. Filtra apenas flechas (`minecraft:arrow`).

#### Verificação do Dono da Flecha

```javascript
const owner = entity.getComponent("minecraft:projectile")?.owner;
if (!owner) return;
if (owner.typeId !== "minecraft:player") return;
```

- `getComponent("minecraft:projectile")` → componente de projétil da flecha
- `.owner` → quem disparou a flecha
- Verifica se o dono é um jogador (ignora flechas de esqueletos, dispensers, etc.)

#### Verificação do Item na Mão

```javascript
const item = owner.getComponent("minecraft:inventory")?.container?.getItem(owner.selectedSlotIndex);
if (!item) return;
if (item.typeId !== "minecraft:bow") return;
```

Confirma que o jogador está segurando um arco.

#### Cálculo de Direções

```javascript
const velocity = entity.getVelocity();

const offsets = [
    { x: velocity.x + velocity.z * SPREAD_ANGLE, y: velocity.y, z: velocity.z - velocity.x * SPREAD_ANGLE },
    { x: velocity.x - velocity.z * SPREAD_ANGLE, y: velocity.y, z: velocity.z + velocity.x * SPREAD_ANGLE }
];
```

Usa a velocidade da flecha original para calcular 2 direções deslocadas:
- Uma flecha vai levemente para a **esquerda**
- Outra vai levemente para a **direita**
- O cálculo usa rotação 2D no plano XZ

#### Spawn das Flechas Extras

```javascript
for (const offset of offsets) {
    const arrow = dimension.spawnEntity("minecraft:arrow", location);
    arrow.applyImpulse(offset);
}
```

- `spawnEntity()` → cria uma nova flecha na mesma posição da original
- `applyImpulse()` → aplica a velocidade calculada na flecha

## ⚙️ Configurações Possíveis

### Ângulo de Espalhamento

```javascript
const SPREAD_ANGLE = 0.3;
```

| Valor | Efeito |
|-------|--------|
| 0.1 | Flechas quase paralelas |
| 0.3 | Espalhamento padrão |
| 0.5 | Espalhamento grande |
| 1.0 | Espalhamento extremo |

### Número de Flechas Extras

Adicione mais entradas no array `offsets` para mais flechas:

```javascript
const offsets = [
    { x: velocity.x + velocity.z * SPREAD_ANGLE, y: velocity.y, z: velocity.z - velocity.x * SPREAD_ANGLE },
    { x: velocity.x - velocity.z * SPREAD_ANGLE, y: velocity.y, z: velocity.z + velocity.x * SPREAD_ANGLE },
    // Adicionar mais uma acima:
    { x: velocity.x, y: velocity.y + SPREAD_ANGLE, z: velocity.z }
];
```

## 🆚 Comparação com Projetos Anteriores

| Aspecto | Freeze Spell (03) | Multishot Bow (04) |
|---------|-------------------|-------------------|
| Trigger | `itemUse` | `entitySpawn` |
| Ação | Aplicar efeito | Spawnar entidades |
| API nova | `addEffect()` | `spawnEntity()`, `applyImpulse()` |
| Alvo | Mobs existentes | Criar novas entidades |

## 🧠 O Que Você Aprende com Este Projeto

- ✅ Eventos de projétil via `entitySpawn`
- ✅ Spawn de entidades com `spawnEntity()`
- ✅ Manipulação de direção/velocidade com `applyImpulse()`
- ✅ Componente `minecraft:projectile` e propriedade `owner`
- ✅ Cálculo de espalhamento vetorial

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| Flechas não aparecem | Verifique se está usando um arco |
| Flechas de esqueletos ativam | O filtro `owner.typeId` já previne isso |
| Muitas flechas (lag) | Reduza o número de offsets |
| Flechas vão para cima | Ajuste o `SPREAD_ANGLE` |

## 🔐 Compatibilidade

- **Versão Mínima**: Minecraft 1.20.0+
- **Plataformas**: Windows 10/11, Xbox, Nintendo Switch, Mobile (Bedrock)
- **API**: @minecraft/server 1.8.0+

## 👨‍💻 Autor e Versão

- **Versão**: 1.0.0
- **Data**: Março 2026
- **Status**: Completo
