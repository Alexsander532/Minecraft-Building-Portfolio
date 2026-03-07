# Documentação - Region Protection 🛡️

## 📋 Visão Geral

**Region Protection** é um sistema profissional de regiões para Minecraft Bedrock Edition. Define áreas no mapa com regras específicas — cada região pode controlar independentemente: quebra de bloco, colocação de bloco, PvP e uso de habilidades. Muito usado em servidores SMP, RPG e minigames.

## 🎯 Funcionalidades

- 🛡️ **Proteção de blocos**: impede quebrar/colocar blocos por região
- ⚔️ **Controle de PvP**: liga/desliga PvP por área
- 💬 **Mensagens personalizadas**: ao entrar/sair de regiões
- 📐 **Geometria AABB**: detecção por bounding box 3D
- 🔀 **Sobreposição**: múltiplas regiões no mesmo lugar (regra de negação ganha)
- 📍 **Rastreamento**: detecta quando jogador entra/sai de regiões

## 📂 Estrutura do Projeto

```
10-region-protection/
├── src/                            # TypeScript source
│   ├── main.ts                     # Ponto de entrada
│   ├── regions/
│   │   ├── regionData.ts           # Interface, tipos, isInside()
│   │   └── regionManager.ts        # Registro e consulta de regiões
│   └── systems/
│       └── regionEvents.ts         # Eventos + definição de regiões
├── behavior_pack/
│   ├── manifest.json
│   └── scripts/                    # Compilado (não editar)
├── resource_pack/
├── tsconfig.json
├── package.json
├── README.md
├── DOCUMENTACAO_PT_BR.md
└── .gitignore
```

## 🛠️ Componentes Técnicos

### Behavior Pack (`behavior_pack/manifest.json`)

| Campo | Valor |
|-------|-------|
| Nome | Region Protection BP |
| UUID Header | a02e1111-0000-4000-9000-000000000001 |
| UUID Módulo | a02e1111-0000-4000-9000-000000000002 |
| Versão | 1.0.0 |
| Engine Mínimo | 1.20.0 |
| Dependência API | @minecraft/server 1.8.0 |

## 📝 Explicação dos Módulos

### 1. `src/regions/regionData.ts` — Tipos e Dados

#### Interface `RegionRules`

```typescript
interface RegionRules {
    pvp: boolean;           // PvP permitido?
    blockBreak: boolean;    // Quebrar blocos permitido?
    blockPlace: boolean;    // Colocar blocos permitido?
    abilities: boolean;     // Habilidades permitidas?
}
```

#### Interface `Region`

```typescript
interface Region {
    id: string;             // ID único
    name: string;           // Nome exibível
    dimension: string;      // "minecraft:overworld" | "minecraft:nether" | ...
    min: Vector3;           // Canto mínimo da região
    max: Vector3;           // Canto máximo da região
    rules: RegionRules;     // Regras da região
    enterMessage?: string;  // Mensagem ao entrar
    leaveMessage?: string;  // Mensagem ao sair
}
```

#### Função `isInside()`

```typescript
function isInside(point: Vector3, region: Region): boolean
```

Usa **AABB (Axis-Aligned Bounding Box)** — o método mais eficiente para detecção retangular:

$$\text{inside} = (x_{min} \leq p_x \leq x_{max}) \land (y_{min} \leq p_y \leq y_{max}) \land (z_{min} \leq p_z \leq z_{max})$$

Aceita `min`/`max` em qualquer ordem (normaliza internamente).

### 2. `src/regions/regionManager.ts` — Gerenciador

```typescript
class RegionManager {
    register(region: Region): void
    unregister(regionId: string): boolean
    getRegionsAt(point: Vector3, dimension: string): Region[]
    getRulesAt(point: Vector3, dimension: string): RegionRules
    updatePlayerRegions(player: Player): { entered: Region[]; left: Region[] }
}
```

#### Fusão de Regras (Merge)

```typescript
getRulesAt(point, dimension): RegionRules
```

Quando múltiplas regiões se sobrepõem, as regras são fundidas com lógica conservadora: **qualquer região que negar uma regra, a nega para todas**.

```
Região A: pvp=true,  blockBreak=false
Região B: pvp=false, blockBreak=true
Resultado: pvp=false, blockBreak=false
```

#### Rastreamento de Regiões

```typescript
updatePlayerRegions(player): { entered: Region[]; left: Region[] }
```

Compara as regiões atuais do jogador com as anteriores (cache por `player.id`):
- **entered**: regiões que o jogador acabou de entrar
- **left**: regiões que o jogador acabou de sair

### 3. `src/systems/regionEvents.ts` — Eventos

#### Proteção de Quebra de Bloco

```typescript
world.beforeEvents.playerBreakBlock.subscribe((event) => {
    const rules = regionManager.getRulesAt(event.block.location, ...);
    if (!rules.blockBreak) {
        event.cancel = true;  // Cancela o evento
    }
});
```

Usa `beforeEvents` (pré-evento) para **cancelar** antes que o bloco seja quebrado.

#### PvP usando `beforeEvents`

```typescript
world.beforeEvents.entityHitEntity.subscribe((event) => {
    if (!rules.pvp) {
        event.cancel = true;
    }
});
```

#### Loop de Notificações

```typescript
system.runInterval(() => {
    for (const player of world.getPlayers()) {
        const { entered, left } = regionManager.updatePlayerRegions(player);
        // Envia mensagens de enter/leave
    }
}, 10);
```

A cada 10 ticks (0.5s), verifica se algum jogador entrou ou saiu de uma região.

## 🗺️ Regiões Pré-Configuradas

| ID | Nome | PvP | Quebrar | Colocar |
|----|------|-----|---------|---------|
| `spawn` | Spawn Area | ❌ | ❌ | ❌ |
| `arena` | PvP Arena | ✅ | ❌ | ❌ |
| `city` | Player City | ❌ | ❌ | ✅ |

## ⚙️ Como Adicionar Regiões

Em `src/systems/regionEvents.ts`, função `setupRegions()`:

```typescript
regionManager.register({
    id: "dungeon",
    name: "Dungeon",
    dimension: "minecraft:overworld",
    min: { x: -200, y: -64, z: -200 },
    max: { x: -100, y: 100, z: -100 },
    rules: {
        pvp: true,
        blockBreak: false,
        blockPlace: false,
        abilities: true,
    },
    enterMessage: "§4⚠ You entered the Dungeon. Beware!",
    leaveMessage: "§7You escaped the Dungeon.",
});
```

## 🔨 Build e Compilação

```bash
# Instalar dependências
npm install

# Compilar TypeScript → JavaScript
npm run build

# Modo watch (recompila ao salvar)
npm run watch
```

O TypeScript compila `src/` → `behavior_pack/scripts/`.

## 🧠 O Que Você Aprende com Este Projeto

- ✅ Geometria espacial — AABB 3D
- ✅ `beforeEvents` vs `afterEvents` (cancelamento vs reação)
- ✅ Interfaces TypeScript (`Region`, `RegionRules`)
- ✅ Classes com estado encapsulado
- ✅ Fusão de regras com lógica booleana
- ✅ Rastreamento de estado por jogador
- ✅ Herança de regras e sobreposição de regiões
- ✅ Arquitetura modular profissional

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| Proteção não funciona | Verifique as coordenadas min/max da região |
| Mensagem não aparece | Confirme que o loop de `runInterval` está ativo |
| Sobreposição inesperada | Lembre: `deny` sempre ganha na fusão |
| Compilação falha | Rode `npm install` antes de `npm run build` |

## 🔐 Compatibilidade

- **Versão Mínima**: Minecraft 1.20.0+
- **Plataformas**: Windows 10/11, Xbox, Nintendo Switch, Mobile (Bedrock)
- **API**: @minecraft/server 1.8.0+
- **TypeScript**: 5.3.0+

## 👨‍💻 Autor e Versão

- **Versão**: 1.0.0
- **Data**: Março 2026
- **Status**: Completo
