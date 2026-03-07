# Documentação - Item Magnet

## 📋 Visão Geral

**Item Magnet** é um addon para Minecraft Bedrock Edition que implementa um sistema de "ímã de itens". Quando o jogador segura um stick (graveto), todos os itens dropados nas proximidades são automaticamente puxados para o jogador.

## 🎯 Funcionalidades

- ✨ Puxa itens dropados automaticamente quando segurando um stick
- 📍 Detecta itens em um raio de 8 blocos
- ⚡ Funciona a cada tick (20 vezes por segundo)
- 🔧 Usa a API do Minecraft Server 1.8.0

## 📂 Estrutura do Projeto

```
02-item-magnet/
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
| Nome | Item Magnet BP |
| UUID Header | 9a2e1111-0000-4000-9000-000000000001 |
| UUID Módulo | 9a2e1111-0000-4000-9000-000000000002 |
| Versão | 1.0.0 |
| Engine Mínimo | 1.20.0 |
| Dependência API | @minecraft/server 1.8.0 |

### Resource Pack (`resource_pack/manifest.json`)

| Campo | Valor |
|-------|-------|
| Nome | Item Magnet RP |
| UUID Header | 9a2e1111-0000-4000-9000-000000000003 |
| UUID Módulo | 9a2e1111-0000-4000-9000-000000000004 |
| Versão | 1.0.0 |
| Engine Mínimo | 1.20.0 |

## 📝 Explicação do Script

### Arquivo: `behavior_pack/scripts/main.js`

#### Importações

```javascript
import { world, system } from "@minecraft/server";
```

- **world**: Acesso aos jogadores e entidades do mundo
- **system**: Acesso ao sistema de ticks do jogo

#### Loop Principal

```javascript
system.runInterval(() => {
    // Código executa a cada tick
}, 1)
```

O parâmetro `1` significa que a função roda a cada 1 tick (20 vezes por segundo).

#### Iteração de Jogadores

```javascript
const players = world.getPlayers()

for (const player of players) {
    // Processa cada jogador
}
```

Obtém todos os jogadores conectados no servidor/mundo.

#### Verificação do Inventário

```javascript
const inventory = player.getComponent("minecraft:inventory")
const container = inventory.container
const slot = player.selectedSlotIndex
const item = container.getItem(slot)

if (!item) continue
if (item.typeId !== "minecraft:stick") continue
```

1. Obtém o componente de inventário do jogador
2. Pega o container de itens
3. Obtém o índice do slot selecionado (mão)
4. Pega o item em mão
5. Se não houver item, passa para o próximo jogador
6. Se o item não for um stick, passa para o próximo jogador

#### Busca de Itens

```javascript
const dimension = player.dimension

const items = dimension.getEntities({
    type: "minecraft:item",
    location: player.location,
    maxDistance: 8
})
```

- **dimension**: Obtém a dimensão do jogador (sobremundo, nether, end)
- **getEntities()**: Procura todas as entidades do tipo `minecraft:item` (itens dropados)
- **maxDistance**: Define o raio de busca em 8 blocos

#### Teleportação dos Itens

```javascript
for (const itemEntity of items) {
    itemEntity.teleport(player.location)
}
```

Teletransporta cada item encontrado para a localização do jogador.

## 🚀 Como Usar

### Instalação

1. **Preparação do Mundo**
   - Abra Minecraft Bedrock Edition
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

1. Vá para o modo Criativo ou obtenha um stick
2. Pegue o stick na mão
3. Drop alguns itens no chão (Q)
4. Observe os itens serem puxados para você!

## ⚙️ Configurações Possíveis

Para modificar o comportamento do addon, você pode alterar os seguintes valores em `main.js`:

### Distância de Detecção

```javascript
maxDistance: 8  // Altere para aumentar/diminuir o raio
```

Valores recomendados:
- `4`: Apenas itens bem próximos
- `8`: Padrão (balanceado)
- `16`: Muito distante (pode ficar pesado)

### Tipo de Item Requerido

```javascript
if (item.typeId !== "minecraft:stick") continue
```

Altere `"minecraft:stick"` para outro item. Exemplos:
- `"minecraft:diamond_sword"`
- `"minecraft:golden_apple"`
- `"minecraft:amethyst_shard"`

### Frequência de Execução

```javascript
system.runInterval(() => {
    // ...
}, 1)  // Altere o número de ticks
```

- `1`: A cada tick (máxima frequência)
- `5`: A cada 5 ticks
- `10`: A cada 10 ticks (reduz lag)

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| O addon não funciona | Verifique se as APIs Beta estão ativadas no mundo |
| Os itens não são puxados | Confirme que o item em mão é um stick |
| Lag/Travamento | Reduza a frequência ou distância de detecção |
| Erro ao carregar | Verifique os UUIDs no manifest.json |

## 🔐 Compatibilidade

- **Versão Mínima**: Minecraft 1.20.0+
- **Plataformas**: Windows 10/11, Xbox, Nintendo Switch, Mobile (Bedrock)
- **API**: @minecraft/server 1.8.0+

## 📌 Notas Importantes

1. Este addon requer **Experimental APIs** ativadas
2. A distância de 8 blocos é ideal para evitar lag
3. O teleporte é instantâneo (sem animação)
4. Funciona com itens, não com mobs

## 📚 Referências Úteis

- [Documentação Oficial - Minecraft Bedrock](https://learn.microsoft.com/en-us/minecraft/creator/)
- [API do Server - @minecraft/server](https://learn.microsoft.com/en-us/minecraft/creator/documents/scriptingintroduction/)

## 👨‍💻 Autor e Versão

- **Versão**: 1.0.0
- **Data**: Março 2026
- **Status**: Completo
