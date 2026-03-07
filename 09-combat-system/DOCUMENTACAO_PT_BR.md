# Documentação - Combat System ⚔️

## 📋 Visão Geral

**Combat System** é um sistema profissional de eventos de combate para Minecraft Bedrock Edition, muito usado em servidores PvP. Detecta ataques entre jogadores, registra dano, rastreia kill streaks, impede combat logging e envia mensagens globais de kill feed.

## 🎯 Funcionalidades

- ⚔️ **Combat Tag**: Jogadores ficam marcados por 10s após PvP
- 🔥 **Kill Streaks**: Rastreia e anuncia sequências de kills (3+)
- 📝 **Damage Log**: Registra cada hit com nome da arma
- ☠️ **Kill Feed**: Mensagem global quando alguém morre em PvP
- ⚠️ **Anti Combat Log**: Detecta jogadores que saem durante combate
- 📊 **Combat HUD**: Timer na actionbar durante combate

## 📂 Estrutura do Projeto

```
09-combat-system/
├── behavior_pack/
│   ├── manifest.json
│   └── scripts/
│       ├── main.js                     # Ponto de entrada + HUD loop
│       ├── events/
│       │   └── combatEvents.js         # Handlers: hit, die, leave
│       └── systems/
│           └── combatLogger.js         # Core: tags, streaks, log
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

### Fluxo de Eventos

```
Jogador A ataca Jogador B
    ↓
entityHitEntity
    ├── tagPlayer(A) → 10s combat tag
    ├── tagPlayer(B) → 10s combat tag
    ├── logDamage(A, B, weapon)
    └── actionbar feedback para ambos

Jogador B morre
    ↓
entityDie
    ├── addKill(A) → incrementa streak
    ├── resetStreak(B) → zera streak
    ├── logKill(A, B)
    ├── broadcast kill message
    └── streak notification (se >= 3)

Jogador sai do jogo
    ↓
playerLeave
    ├── isInCombat()?
    │   ├── SIM → broadcast "combat logged!"
    │   └── NÃO → nada
```

## 📝 Explicação dos Módulos

### 1. `systems/combatLogger.js` — Sistema Central

#### Combat Tags

```javascript
tagPlayer(playerId)          // Marca jogador como "em combate" por 10s
isInCombat(playerId)         // Verifica se está em combate
getCombatTimeRemaining(id)   // Segundos restantes do tag
```

Baseado em `system.currentTick` — quando o tick atual ultrapassa o tick de expiração, o tag é removido.

#### Kill Streaks

```javascript
addKill(playerId)    // Incrementa e retorna nova streak
resetStreak(playerId) // Reseta e retorna streak anterior
getStreak(playerId)   // Consulta streak atual
```

Kill streak é o número de kills seguidas sem morrer. Reseta quando o jogador morre.

#### Damage Log

```javascript
logDamage(attackerName, victimName, damage, weapon)
logKill(killerName, victimName)
```

Armazena os últimos 100 eventos (FIFO — First In First Out). Cada entrada contém:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `tick` | number | Tick do evento |
| `attacker`/`killer` | string | Nome do atacante |
| `victim` | string | Nome da vítima |
| `damage` | number | Dano causado |
| `weapon` | string | Arma utilizada |

### 2. `events/combatEvents.js` — Handlers de Eventos

#### `entityHitEntity` — Jogador Ataca

```javascript
world.afterEvents.entityHitEntity.subscribe((event) => {
    const attacker = event.damagingEntity;
    const victim = event.hitEntity;
    // ...
});
```

- Verifica se ambos são jogadores (PvP)
- Aplica combat tag em ambos
- Registra log de dano
- Mostra feedback na actionbar

#### `entityDie` — Entidade Morre

```javascript
world.afterEvents.entityDie.subscribe((event) => {
    const victim = event.deadEntity;
    const killer = event.damageSource.damagingEntity;
    // ...
});
```

- Verifica se é PvP kill (ambos jogadores)
- Incrementa streak do killer
- Reseta streak da vítima
- Broadcast kill message para todos
- Notificação de streak (se >= 3)

#### `playerLeave` — Jogador Sai

```javascript
world.afterEvents.playerLeave.subscribe((event) => {
    if (combatLogger.isInCombat(event.playerId)) {
        // Broadcast "combat logged!"
    }
});
```

Detecta combat logging — sair do jogo durante combate ativo.

### 3. `main.js` — Ponto de Entrada

```javascript
registerCombatEvents(); // Registra todos os listeners

system.runInterval(() => {
    // Mostra timer de combate na actionbar
}, 20);
```

Loop a cada 20 ticks (1 segundo) para atualizar o HUD de combate.

## 🎮 Exemplos de Mensagens

### Hit
```
§e⚔ Hit Steve          (para o atacante)
§c⚔ Hit by Alex [diamond_sword]  (para a vítima)
```

### Kill
```
§c☠ Alex killed Steve    (broadcast)
```

### Kill Streak
```
§6🔥 Alex is on a 5 kill streak!    (broadcast)
§7💀 Steve lost a 3 kill streak     (broadcast)
```

### Combat Tag
```
§c⚔ In Combat: 7s | Do not leave!  (actionbar)
```

### Combat Log
```
§c⚠ Steve combat logged!    (broadcast)
```

## ⚙️ Configurações Possíveis

### Duração do Combat Tag

```javascript
const COMBAT_TAG_DURATION = 200; // 10 segundos
```

| Ticks | Segundos |
|-------|----------|
| 100 | 5s |
| 200 | 10s (padrão) |
| 400 | 20s |
| 600 | 30s |

### Streak Mínima para Notificação

Em `combatEvents.js`:
```javascript
if (streak >= 3) {  // Altere o valor mínimo
```

### Tamanho do Log

```javascript
this.maxLogSize = 100; // Últimos 100 eventos
```

## 🆚 Comparação com Projetos Anteriores

| Aspecto | Freeze Spell (03) | Combat System (09) |
|---------|-------------------|-------------------|
| Eventos | `itemUse` | `entityHitEntity`, `entityDie`, `playerLeave` |
| Alvo | Mobs | Jogadores (PvP) |
| Estado | Nenhum | Combat tags, streaks, logs |
| Mensagens | Nenhuma | Broadcast global, actionbar |
| Arquitetura | Script único | Módulos separados |

## 🧠 O Que Você Aprende com Este Projeto

- ✅ Eventos de combate: `entityHitEntity`, `entityDie`
- ✅ Evento de saída: `playerLeave`
- ✅ Combat tagging (impedir combat logging)
- ✅ Kill streaks (gerenciamento de estado)
- ✅ Broadcast de mensagens (`sendMessage` para todos)
- ✅ Damage logging (FIFO buffer)
- ✅ Separação events/systems

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| Nenhuma mensagem aparece | Precisa de 2+ jogadores para PvP |
| Streak não incrementa | Confirme que ambos são players |
| Combat tag não expira | Verifique `COMBAT_TAG_DURATION` |
| Log muito grande | Ajuste `maxLogSize` |

## 🔐 Compatibilidade

- **Versão Mínima**: Minecraft 1.20.0+
- **Plataformas**: Windows 10/11, Xbox, Nintendo Switch, Mobile (Bedrock)
- **API**: @minecraft/server 1.8.0+

## 📌 Notas Importantes

1. O sistema só funciona para PvP — mobs contra jogadores não ativam combate
2. Combat tags são em memória — reiniciar servidor reseta tudo
3. O damage log é circular — quando ultrapassa 100 entradas, remove as mais antigas
4. `entityHitEntity` não fornece o valor de dano diretamente — seria necessário `entityHurt` para dano preciso

## 👨‍💻 Autor e Versão

- **Versão**: 1.0.0
- **Data**: Março 2026
- **Status**: Completo
