# Dash Ability — Documentação Completa em Português Brasileiro

## 📖 Índice
1. [Visão Geral](#visão-geral)
2. [O Que É?](#o-que-é)
3. [Como Funciona?](#como-funciona)
4. [Estrutura do Projeto](#estrutura-do-projeto)
5. [Componentes Detalhados](#componentes-detalhados)
6. [Instalação e Configuração](#instalação-e-configuração)
7. [Como Usar a Habilidade](#como-usar-a-habilidade)
8. [Explicação Técnica do Código](#explicação-técnica-do-código)
9. [Modificações e Extensões](#modificações-e-extensões)
10. [Troubleshooting](#troubleshooting)

---

## 🎮 Visão Geral

**Dash Ability** é um addon profissional para Minecraft Bedrock Edition que adiciona uma habilidade de **dash** ao jogo. O jogador pode usar um bastão (`minecraft:stick`) para ser lançado instantaneamente na direção que está olhando, criando um efeito de movimento rápido e dinâmico.

Este projeto serve como **base reutilizável** para criar outros addons, mantendo a estrutura profissional com Behavior Pack + Resource Pack completos.

---

## ❓ O Que É?

### Behavior Pack vs Resource Pack?

| Aspecto | Behavior Pack | Resource Pack |
|---------|---------------|---------------|
| **Responsável por** | Lógica, scripts, mecânicas | Visuais, sons, texturas |
| **Linguagem** | JavaScript (`@minecraft/server`) | JSON, texturas PNG, sons OGG |
| **Roda em** | Servidor/Host | Cliente (máquina do jogador) |
| **Exemplo neste projeto** | Script que detecta click e faz knockback | Diretórios vazios (preparados) |

**Ambos são necessários** para um addon funcionar completamente. Neste projeto:
- **BP** implementa a lógica do dash
- **RP** é estruturado para futuras adições (sons, efeitos visuais)

---

## 🔧 Como Funciona?

### Fluxo de Execução

```
1. Jogador segura um bastão na mão
                ↓
2. Jogador clica direito (usa o item)
                ↓
3. O evento beforeEvents.itemUse dispara
                ↓
4. Script verifica: é um bastão? 
                ↓
5. SIM → Pega a direção que jogador está olhando
                ↓
6. Aplica knockback (empurrão) naquela direção
                ↓
7. Jogador é lançado em alta velocidade! 🚀
```

### O que é Knockback?

**Knockback** é uma força aplicada a uma entidade (neste caso, o jogador) que o empurra em uma direção específica. No Minecraft, é usado para:
- Cano knockback de arcos
- Efeito de hit de uma espada
- Explosões
- Neste addon: simular o dash

---

## 📁 Estrutura do Projeto

```
dash-ability/
│
├── 📂 behavior_pack/
│   ├── 📄 manifest.json          ← Identidade e dependências do BP
│   └── 📂 scripts/
│       └── 📄 main.js            ← Script principal (lógica do dash)
│
├── 📂 resource_pack/
│   ├── 📄 manifest.json          ← Identidade do RP
│   ├── 📂 textures/              ← Texturas customizadas (vazio por enquanto)
│   ├── 📂 models/                ← Modelos 3D (vazio por enquanto)
│   └── 📂 sounds/                ← Efeitos sonoros (vazio por enquanto)
│
├── 📂 world_test/                ← Pasta para mundo de testes
│
├── 📄 README.md                  ← Resumo em inglês
├── 📄 DOCUMENTACAO_PT_BR.md       ← Esta documentação
└── 📄 .gitignore                 ← Arquivos ignorados pelo Git
```

---

## 🔍 Componentes Detalhados

### 1. behavior_pack/manifest.json

O **manifest** é o "documento de identidade" do Behavior Pack. Ele informa ao Minecraft:

```json
{
  "format_version": 2,
  "header": {
    "name": "Dash Ability BP",
    "description": "Dash ability behavior pack",
    "uuid": "b1b8c7f0-0000-4b0c-9000-000000000001",
    "version": [1, 0, 0],
    "min_engine_version": [1, 20, 0]
  },
  "modules": [
    {
      "type": "script",
      "uuid": "b1b8c7f0-0000-4b0c-9000-000000000002",
      "version": [1, 0, 0],
      "entry": "scripts/main.js"
    }
  ],
  "dependencies": [
    {
      "uuid": "b1b8c7f0-0000-4b0c-9000-000000000003",
      "version": [1, 0, 0]
    },
    {
      "module_name": "@minecraft/server",
      "version": "1.8.0"
    }
  ]
}
```

**Campos importantes:**

| Campo | Explicação |
|-------|-----------|
| `format_version` | Versão do formato (sempre 2 para novos addons) |
| `header.uuid` | ID único do BP (não mude sem motivo) |
| `header.version` | Versão do seu addon (aumenta quando atualiza) |
| `min_engine_version` | Versão mínima do Minecraft necessária |
| `modules[].type` | "script" = usa JavaScript API |
| `modules[].entry` | Arquivo que o Minecraft carrega e executa |
| `dependencies` | Dependências (RP e módulos externos) |

### 2. behavior_pack/scripts/main.js

O coração do addon. Explicado em detalhes na seção [Explicação Técnica](#explicação-técnica-do-código).

### 3. resource_pack/manifest.json

Similar ao BP, mas marca o tipo como "resources":

```json
{
  "format_version": 2,
  "header": {
    "name": "Dash Ability RP",
    "description": "Dash ability resource pack",
    "uuid": "b1b8c7f0-0000-4b0c-9000-000000000003",
    "version": [1, 0, 0],
    "min_engine_version": [1, 20, 0]
  },
  "modules": [
    {
      "type": "resources",
      "uuid": "b1b8c7f0-0000-4b0c-9000-000000000004",
      "version": [1, 0, 0]
    }
  ]
}
```

**Nota:** O UUID do `header` do RP (`...000000000003`) deve coincidir com o UUID referenciado nas `dependencies` do BP.

---

## 🚀 Instalação e Configuração

### Pré-requisitos

- ✅ Minecraft Bedrock Edition 1.20.0 ou superior
- ✅ Acesso a folders de desenvolvimento
- ✅ Beta APIs habilitadas no mundo

### Passo 1: Localizar as Pastas de Desenvolvimento

**Windows:**
```
C:\Users\[seu_usuario]\AppData\Local\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\
```

**macOS:**
```
~/Library/Application Support/minecraft/
```

**Android/iOS:** Use um gerenciador de arquivos ou a própria pasta do Minecraft.

### Passo 2: Copiar os Packs

1. Copie a pasta `behavior_pack` para:
   ```
   com.mojang/development_behavior_packs/dash-ability-bp/
   ```

2. Copie a pasta `resource_pack` para:
   ```
   com.mojang/development_resource_packs/dash-ability-rp/
   ```

### Passo 3: Configurar o Mundo

1. Abra ou crie um novo mundo
2. Acesse **Configurações do Mundo**
3. Em **Comportamento**, clique em **Adicionar** e selecione `Dash Ability BP`
4. Em **Recursos**, clique em **Adicionar** e selecione `Dash Ability RP`
5. Ative **Experiments → Beta APIs**
6. Clique em **Criar** para confirmar

### Passo 4: Testar

1. Entre no mundo
2. Pegue um bastão (`/give @s stick`)
3. Aponte para uma direção
4. Clique direito com o bastão
5. Você deve ser lançado na direção que está olhando! 🚀

---

## 🎮 Como Usar a Habilidade

### Na Prática

1. **Obter um bastão:** 
   - Garfo crafting (3 blocos de madeira verticalmente)
   - Ou comando: `/give @s stick`

2. **Ativar o dash:**
   - Aponte a câmera para a direção desejada
   - Click direito para usar o item
   - Será lançado instantaneamente naquela direção

3. **Dicas de uso:**
   - Olhe para o chão para pular para cima
   - Olhe para baixo para cair mais rápido
   - Combine com water buckets para controlar quedas
   - Use para fugir de mobs ou alcançar plataformas altas

---

## 🔬 Explicação Técnica do Código

### Linha por Linha

```javascript
import { world } from "@minecraft/server";
```
Importa o objeto `world` da API oficial do Minecraft. Este é o ponto de entrada para interagir com eventos globais do jogo.

```javascript
world.beforeEvents.itemUse.subscribe((event) => {
```
- **`beforeEvents`**: Events que disparam ANTES da ação ser processada
- **`itemUse`**: Especificamente quando alguém usa um item
- **`subscribe`**: Registra uma função que será chamada cada vez que o evento ocorre
- **`(event) =>`**: Função seta (sintaxe moderna do JavaScript) que recebe os dados do evento

```javascript
    const player = event.source;
    const item = event.itemStack;
```
Extrai duas informações do evento:
- `player`: Quem disparou o evento (entidade que usou o item)
- `item`: Qual item estava sendo usado

```javascript
    if (item.typeId !== "minecraft:stick") return;
```
**Filtro crucial:** Verifica se o item NÃO é um bastão. Se não for, a função retorna (sai) sem fazer nada.

Isto garante que a habilidade SÓ funciona com bastões.

```javascript
    const direction = player.getViewDirection();
```
Obtém para onde o jogador está olhando. Retorna um objeto como:
```js
{
  x: 0.707,   // -1 (oeste) até 1 (leste)
  y: 0.0,     // -1 (baixo) até 1 (cima)
  z: -0.707   // -1 (norte) até 1 (sul)
}
```

Esses valores são **normalizados** (entre -1 e 1), representando a direção.

```javascript
    player.applyKnockback(
        direction.x,
        direction.z,
        3,
        0.5
    );
```

**`applyKnockback()`** aplica uma força ao jogador:

| Parâmetro | O que é | Valor | Efeito |
|-----------|---------|-------|--------|
| `direction.x` | Horizontal X | -1 a 1 | Vai para oeste ou leste |
| `direction.z` | Horizontal Z | -1 a 1 | Vai para norte ou sul |
| `3` | Intensidade horizontal | Qualquer número | Quanto mais alto, mais rápido o dash |
| `0.5` | Impulsão vertical | 0 a 1+ | Faz o jogador subir durante o dash |

### Por Que `beforeEvents`?

Se usássemos `afterEvents.itemUse`, o evento dispararia **depois** que o Minecraft já processou a ação do item. Com `beforeEvents`, nós interceptamos a ação ANTES, permitindo controlar exatamente o que acontece.

---

## 🛠 Modificações e Extensões

### Mudar a Intensidade do Dash

No arquivo `main.js`, altere o número `3` para mais ou menos:

```javascript
player.applyKnockback(
    direction.x,
    direction.z,
    5,  // ← Aumentar para mais rápido, diminuir para mais lento
    0.5
);
```

- **3**: Padrão (velocidade balanceada)
- **5+**: Muito rápido (pode ser perigoso)
- **1-2**: Mais lento (mais controle)

### Adicionar Som ao Dash

1. Coloque um arquivo `.ogg` em `resource_pack/sounds/` (ex: `dash.ogg`)
2. Crie `resource_pack/sounds/sound_definitions.json`:

```json
{
  "sound_definitions": {
    "block.note.chime": {
      "category": "record",
      "sounds": [
        "sounds/dash"
      ]
    }
  }
}
```

3. No `main.js`, adicione:

```javascript
player.playSound("block.note.chime");
```

### Adicionar Partículas ao Dash

Importe partículas no `main.js`:

```javascript
import { world, MolangVariableMap } from "@minecraft/server";

// ... resto do código ...
player.dimension.spawnParticle(
    "minecraft:basic_smoke_particle",
    player.location,
    new MolangVariableMap()
);
player.applyKnockback(
    direction.x,
    direction.z,
    3,
    0.5
);
```

### Usar Outro Item ao Invés de Bastão

Altere a linha:

```javascript
if (item.typeId !== "minecraft:diamond_sword") return;
```

Substitua `minecraft:diamond_sword` por qualquer ID de item válido (ex: `minecraft:golden_carrot`, `minecraft:glowstone_dust`).

### Adicionar Cooldown (Tempo de Espera)

Para não poder usar o dash infinitamente, adicione um sistema de cooldown:

```javascript
import { world } from "@minecraft/server";

const cooldowns = new Map(); // Armazena quem está em cooldown

world.beforeEvents.itemUse.subscribe((event) => {
    const player = event.source;
    const item = event.itemStack;

    if (item.typeId !== "minecraft:stick") return;

    // Verificar cooldown
    const now = Date.now();
    const lastUse = cooldowns.get(player.name) || 0;
    const cooldownTime = 1000; // 1 segundo em milissegundos

    if (now - lastUse < cooldownTime) {
        player.sendMessage("§cAguarde antes de usar novamente!");
        return;
    }

    // Atualizar cooldown
    cooldowns.set(player.name, now);

    const direction = player.getViewDirection();

    player.applyKnockback(
        direction.x,
        direction.z,
        3,
        0.5
    );
});
```

---

## 🐛 Troubleshooting

### Problema: O Dash Não Funciona

**Possíveis causas:**

1. **Beta APIs não ativadas**
   - Solução: Vá em Configurações do Mundo → Experiments → Ative "Beta APIs"

2. **Pack não está carregado**
   - Solução: Verifique em Configurações do Mundo se ambos os packs aparecem na lista

3. **Usando o item errado**
   - Solução: Certifique-se de que está usando um BASTÃO (`minecraft:stick`), não outro item

4. **Versão do Minecraft muito antiga**
   - Solução: Atualize para Minecraft 1.20.0 ou superior

### Problema: Minecraft Travou ao Carregar o Mundo

**Possíveis causas:**

1. **Erro na sintaxe do `main.js`**
   - Solução: Verifique se não há erros de digitação (faltam chaves, ponto-e-vírgula, etc)

2. **UUID duplicado**
   - Solução: Cada UUID no manifest deve ser único

3. **Dependência faltante**
   - Solução: Certifique-se de que o `@minecraft/server` versão `1.8.0` está disponível

### Problema: Script Carrega mas o Dash é Muito Fraco

1. Aumente o valor de intensidade em `main.js` (de `3` para `5`, por exemplo)
2. Teste diferentes valores até encontrar o que gosta

### Problema: Jogador é Lançado Para Cima em Vez de Para Frente

O parâmetro `0.5` (impulsão vertical) está muito alto. Reduza para `0.1` ou experimente valores menores.

---

## 📚 Recursos Complementares

### Documentação Oficial
- [Minecraft Creator Documentation](https://learn.microsoft.com/en-us/minecraft/creator/)
- [Scripting API Reference](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/world)

### IDs de Itens Minecraft
- [Completa lista de IDs](https://wiki.bedrock.dev/documentation/bedrock-itemid.html)

### Ferramentas Úteis
- **Blockbench**: Para criar modelos 3D customizados
- **Code Editor**: VS Code com extensão "Minecraft Tools"

---

## 📝 Conclusão

Este projeto demonstra como criar um addon profissional de Minecraft Bedrock com:
- ✅ Estrutura correta (BP + RP)
- ✅ Manifests bem configurados
- ✅ Código limpo e documentado
- ✅ Fácil de estender

Sinta-se à vontade para copiar esta estrutura para outros projetos de addons!

---

**Versão da Documentação:** 1.0  
**Data:** 7 de março de 2026  
**Autor:** Portfolio Mine
