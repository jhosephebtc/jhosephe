# Linguagem visual

## Personalidade

Uma interface de instrumentos: precisa, serena e silenciosa. Faça o conteúdo se organizar em planos claros com espaçamento deliberado e poucas linhas técnicas; use volume para os elementos manipuláveis. Escolha uma peça principal por área e deixe o resto respirar. O resultado precisa funcionar em um produto real, não apenas em uma composição de portfólio.

## Paleta de partida

| Papel | Valor inicial | Uso |
| --- | --- | --- |
| Fundo mineral | `#e8ebec` | plano geral e espaço vazio |
| Superfície | `#f6f7f6` | cartões e leitura |
| Superfície elevada | `#ffffff` | faces, campos e cartões em foco |
| Aço | `#aab5be` | estrutura, borda e traços de controle |
| Sombra azul | `#344552` | sombras e áreas de contraste |
| Tinta principal | `#192026` | texto e ícones |
| Tinta secundária | `#52606a` | legendas e descrições legíveis |
| Dourado pontual | `#b78d34` | referência e detalhe de comando |

São amostras, não garantias de contraste. Meça cada par aplicado, inclusive texto sobre vidro ou gradiente. Para informações essenciais ou estados, use também forma, posição e texto. O dourado não precisa estar presente em todas as telas.

## Tipografia

Use Geist Sans como padrão e Geist Mono para medições, eixos, código e índices. Carregue somente os pesos necessários, com fallback de sistema e `font-display: swap`. Dados numéricos que mudam usam `font-variant-numeric: tabular-nums`. Preserve os ajustes de fonte pedidos pelo projeto que recebe a skill.

Hierarquia inicial: 12–13px para metadados legíveis, 14–16px para interface, 18–24px para títulos de seção; tamanhos variam conforme plataforma e densidade. Dê line-height suficiente e mantenha tamanho de input confortável em toque. Nunca use baixa opacidade como única forma de indicar importância.

## Composição

- A grade pode evocar um console, mas o fluxo segue o conteúdo e se reorganiza para telas pequenas.
- Divisórias finas, marcas de escala e alinhamento entre rótulo, valor e comando criam precisão sem exigir ornamentos.
- Use respiros amplos ao redor de um objeto expressivo; em configurações densas priorize leitura e alvos suficientes.
- Um plano pode ter cantos suaves enquanto instrumentos e linhas internas mantêm geometria mais firme.
- Acentos aparecem para orientar um estado ou ação; não pinte todos os controles com a cor de destaque.

## Não confunda inspiração com regra

Escolha materiais para o contexto da tela. Uma lista longa, um painel financeiro e uma landing page precisam de níveis diferentes de profundidade. Respeite a marca e o conteúdo do projeto existente.
