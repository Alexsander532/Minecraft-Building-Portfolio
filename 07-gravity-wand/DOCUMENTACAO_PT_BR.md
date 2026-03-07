# Documentação - Gravity Wand 🌌

## 📋 Visão Geral

**Gravity Wand** é um addon para Minecraft Bedrock Edition que transforma a vara de blaze em uma varinha de gravidade. Ao usar o item, todos os mobs em um raio de 8 blocos recebem o efeito de Levitação e sobem no ar por 3 segundos.

## 🎯 Funcionalidades

- 🌌 Faz mobs levitarem ao usar uma vara de blaze
- 📍 Afeta mobs em raio de 8 blocos
- ⏱️ Efeito de levitação dura 3 segundos
- 📊 Feedback na actionbar (contagem de mobs afetados)
- 👁️ Exibe partículas visuais do efeito

## 📂 Estrutura do Projeto

```
07-gravity-wand/
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
| Nome | Gravity Wand BP |
| UUID Header | 7a2e1111-0000-4000-9000-000000000001 |
| UUID Módulo | 7a2e1111-0000-4000-9000-000000000002 |
| Versão | 1.0.0 |
| Engine Mínimo | 1.20.0 |
| Dependência API | @minecraft/server 1.8.0 |

### Resource Pack (`resource_pack/manifest.json`)

| Campo | Valor |
|-------|-------|
| Nome | Gravity Wand RP |
| UUID Header | 7a2e1111-0000-4000-9000-000000000003 |
| UUID Módulo | 7a2e1111-0000-4000-9000-000000000004 |
| Versão | 1.0.0 |
| Engine Mínimo | 1.20.0 |

## 📝 Explicação do Script

### Arquivo: `behavior_pack/scripts/main.js`

#### Importações e Constantes

```javascript
import { world } from "@minecraft/server";

const WAND_ITEM = "minecraft:blaze_rod";
const LEVITATE_RADIUS = 8;
const LEVITATE_DURATION = 60;  // 3 segundos
const LEVITATE_AMPLIFIER = 5;
```

- **WAND_ITEM**: Vara de blaze como varinha
- **LEVITATE_RADIUS**: Raio de detecção (8 blocos)
- **LEVITATE_DURATION**: 60 ticks = 3 segundos
- **LEVITATE_AMPLIFIER**: Nível 5 de levitação (sobe rápido)

#### Evento de Uso de Item

```javascript
world.afterEvents.itemUse.subscribe((event) => {
    const player = event.source;
    const item = event.itemStack;
    if (item.typeId !== WAND_ITEM) return;
    // ...
});
```

Mesmo padrão do projeto 03 (Freeze Spell) — escuta uso de item e filtra pelo tipo.

#### Busca de Mobs

```javascript
const mobs = dimension.getEntities({
    location: player.location,
    maxDistance: LEVITATE_RADIUS,
    excludeTypes: ["minecraft:player", "minecraft:item"]
});
```

Busca todos mobs no raio, excluindo jogadores e itens dropados.

#### Aplicação do Efeito de Levitação

```javascript
for (const mob of mobs) {
    mob.addEffect("levitation", LEVITATE_DURATION, {
        amplifier: LEVITATE_AMPLIFIER,
        showParticles: true
    });
    count++;
}
```

- **"levitation"**: Efeito que faz a entidade flutuar para cima
- **amplifier: 5**: Nível VI — sobe a uma velocidade considerável
- **count**: Conta quantos mobs foram afetados

#### Feedback Visual

```javascript
if (count > 0) {
    player.onScreenDisplay.setActionBar(`§d🌌 ${count} mob(s) levitating!`);
} else {
    player.onScreenDisplay.setActionBar("§7No mobs nearby");
}
```

- `§d` → Rosa/Magenta (temático para magia)
- `§7` → Cinza (nenhum mob encontrado)

## ⚙️ Configurações Possíveis

### Item da Varinha

```javascript
const WAND_ITEM = "minecraft:blaze_rod";
```

Exemplos:
- `"minecraft:stick"` — graveto simples
- `"minecraft:end_rod"` — bastão do end (temático!)
- `"minecraft:amethyst_shard"` — fragmento de ametista

### Raio de Efeito

```javascript
const LEVITATE_RADIUS = 8;
```

| Valor | Uso |
|-------|-----|
| 4 | Precisão |
| 8 | Padrão |
| 15 | Grande alcance |

### Duração do Efeito

```javascript
const LEVITATE_DURATION = 60;
```

| Ticks | Segundos | Resultado |
|-------|----------|-----------|
| 20 | 1s | Pulo leve |
| 60 | 3s | Sobe bastante (padrão) |
| 100 | 5s | Sobe muito alto |
| 200 | 10s | Sobe às nuvens |

### Nível de Levitação

```javascript
const LEVITATE_AMPLIFIER = 5;
```

| Amplifier | Velocidade de Subida |
|-----------|---------------------|
| 0 | Muito lenta |
| 2 | Lenta |
| 5 | Moderada (padrão) |
| 10 | Rápida |
| 20 | Muito rápida |

⚠️ Amplificadores muito altos + duração longa = mobs sobem muito alto e tomam dano de queda!

## 🆚 Comparação: Freeze Spell vs Gravity Wand

| Aspecto | Freeze Spell (03) | Gravity Wand (07) |
|---------|-------------------|-------------------|
| Efeito | `slowness` (congela) | `levitation` (flutua) |
| Amplifier | 255 (máximo) | 5 (moderado) |
| Feedback | Nenhum | Actionbar com contagem |
| Resultado | Mob parado | Mob no ar |
| Perigo para mobs | Nenhum | Dano de queda ao cair |

## 🧠 O Que Você Aprende com Este Projeto

- ✅ Manipulação de física usando efeito de levitação
- ✅ Diferença entre efeitos: `slowness` vs `levitation`
- ✅ Contagem de entidades afetadas
- ✅ Feedback condicional na actionbar
- ✅ Impacto do `amplifier` na intensidade dos efeitos

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| Mobs não levitam | Verifique se está usando blaze rod |
| Mobs morrem ao cair | Reduza `LEVITATE_DURATION` ou `LEVITATE_AMPLIFIER` |
| Não afeta mobs | Certifique-se que há mobs no raio de 8 blocos |
| Afeta outros jogadores | `excludeTypes` já exclui players |

## 🔐 Compatibilidade

- **Versão Mínima**: Minecraft 1.20.0+
- **Plataformas**: Windows 10/11, Xbox, Nintendo Switch, Mobile (Bedrock)
- **API**: @minecraft/server 1.8.0+

## 📌 Notas Importantes

1. Mobs sofrem **dano de queda** ao retornar ao chão — cuidado com animais passivos!
2. O efeito pode ser "cancelado" se dar leite ao mob (balde de leite remove efeitos)
3. Levitação NÃO funciona em certas entidades (ex: Ender Dragon)
4. Combinado com o Freeze Spell: congele e depois levite para combo!

## 📚 Resumo da Série Completa

| # | Projeto | API Principal |
|---|---------|--------------|
| 01 | Dash Ability | `applyKnockback` |
| 02 | Item Magnet | `getEntities`, `teleport` |
| 03 | Freeze Spell | `addEffect(slowness)` |
| 04 | Multishot Bow | `spawnEntity`, `applyImpulse` |
| 05 | Dash Cooldown | `Map`, `system.currentTick` |
| 06 | Player Tracker | `onScreenDisplay`, distância |
| 07 | Gravity Wand | `addEffect(levitation)` |

## 👨‍💻 Autor e Versão

- **Versão**: 1.0.0
- **Data**: Março 2026
- **Status**: Completo
