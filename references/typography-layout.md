# Tipografia, espaçamento e grids

Use esta referência para construir a hierarquia de uma tela, revisar acabamento ou traduzir um painel de instrumentos. Defina os papéis primeiro e ajuste com o conteúdo real, sem compensar uma composição fraca com fontes pequenas ou tracking extremo.

## Geist e kerning

Geist Sans é a família padrão da interface; Geist Sans também é usada em medições, índices técnicos e código visível na interface; não use fontes serifadas nem monoespaçadas. Use arquivos locais ou o carregador do framework, pesos realmente disponíveis, fallback de sistema e `font-display: swap`. Não simule negrito ou itálico ausentes.

Kerning ajusta pares de letras; letter-spacing ajusta o intervalo geral. Preserve `font-kerning: normal` na fonte proporcional. Não transforme palavras em spans por letra nem insira espaços para alinhar títulos: isso destrói pares, seleção, tradução e leitura assistiva. Para medições, use Geist Sans com números tabulares. Não substitua a família por uma monoespaçada.

## Perfil de app e editor de nós

Preserve o ritmo compacto da base consultada, substituindo a família pela Geist solicitada. A escala semântica é **11, 12, 14, 16, 18, 20 e 24px**, com entrelinhas **1.25, 1.5 e 1.625** e pesos leves a moderados. Corpo de interface parte de 14px; 11–12px é reservado a metadados e legendas curtas, sem reduzir mensagens essenciais por falta de espaço.

A base contém estilos locais mais específicos, como texto de prompt de 12.726px, peso 350 e tracking 0.025em, além de legendas de 11–11.5px/peso 500. Trate esses valores como evidência de densidade, não como números universais: use tokens coerentes e confirme o resultado óptico em Geist. O arquivo legado de tipografia também colapsa vários papéis em 12px; preserve a hierarquia semântica do guia, sem repetir esse colapso no novo sistema.

| Papel | Tamanho inicial | Peso | Entrelinha | Tracking inicial |
| --- | --- | --- | --- | --- |
| Metadado técnico curto | 11–12px | 400–500 | 1.5 | `0` a `0.025em` |
| Texto secundário compacto | 12px | 400 | 1.5 | `0` |
| Corpo de interface | 14px | 400 | 1.5 | `0` |
| Texto importante ou campo de toque | 16px | 400–500 | 1.5 | `0` |
| Título de seção | 18px | 500–600 | 1.25 | `-0.01em` |
| Título principal | 20px | 400–500 | 1.25 | `-0.015em` |
| Título amplo de app | 24px | 400–500 | 1.25 | `-0.02em` |
| Corpo de leitura | 16–18px | 400 | 1.625 | `0` |

## Papéis de instrumento e composição editorial

A escala compacta não limita o número principal de um instrumento nem o título de uma capa. Defina esses papéis separadamente, mantendo as legendas e controles no ritmo do app.

| Papel | Tamanho inicial | Peso | Entrelinha | Tracking inicial |
| --- | --- | --- | --- | --- |
| Rótulo curto em caixa alta | 11–12px | 500 | 1.3–1.4 | `0.06em` a `0.10em` |
| Título editorial | 40–64px | 400–500 | 1.05–1.15 | `-0.025em` a `-0.04em` |
| Valor de instrumento | conforme espaço real | 300–500 | 1.0–1.15 | `0` a `-0.02em` |

As faixas são pontos de partida. Use tracking zero como referência e compare no tamanho final; não comprima texto pequeno nem aplique o mesmo valor a todos os papéis. Números que mudam usam `font-variant-numeric: tabular-nums`, largura reservada para o maior valor esperado e unidade em elemento separado, alinhada pela linha de base. Não use tabular-nums indiscriminadamente em títulos e prosa.

Para revisar, observe pares como AV, To, Ta, números 11/88, sinais negativos, decimais, unidades e palavras acentuadas. Confira a fonte final carregada e o fallback. Teste nomes longos, traduções e zoom de 200%. Ajustes ópticos são pequenos e locais; evite transformações que apenas escondem desalinhamento da caixa.

## Escala de espaço

Adote o ritmo da base: unidade de 4px e escala **4, 8, 12, 16, 24, 32, 48**. Use **64 e 96px** como extensão para composições amplas, quando o conteúdo justificar. Use 1–2px somente para filetes e ajustes ópticos, não como uma segunda escala de layout. Nomeie tokens pelo ritmo ou pelo papel e reutilize-os.

- Ícone e rótulo: 8px costuma ser um ponto de partida.
- Rótulo e valor/campo: 4–8px; mantenha-os mais próximos entre si que do grupo seguinte.
- Conteúdo interno de controles: 12–16px, preservando o alvo interativo.
- Padding de painel: 24–32px no desktop; 16–24px em largura pequena.
- Grupos relacionados: 16–24px; seções distintas: 32–64px.

Prefira `gap` ao combinar margens dispersas. Distinga padding interno, distância entre irmãos e respiro entre seções. A borda visível pode ser pequena, mas o alvo de um controle tátil deve continuar confortável: aproximadamente 44px é um bom padrão inicial. O espaço negativo indica agrupamento e hierarquia; não distribua tudo com a mesma distância.

## Grids que sustentam a composição

Escolha a grade pela largura disponível e pela tarefa. A base de app usa grupos de 2–4 colunas com gaps de 8px no mobile e 16px no desktop; reutilize esse ritmo em cards e configurações compactas. Uma referência útil é **12 colunas no desktop, 8 em largura intermediária e 4 no mobile**, com gutters de 24, 20 e 16px e margens de 32, 24 e 16px. Os pontos de quebra vêm do conteúdo que deixa de caber, não de uma lista fixa de aparelhos. Um painel de instrumento pode usar três zonas alinhadas dentro dessa grade.

- Estabeleça um container e eixos compartilhados para título, rótulos, valores, divisórias e controles. Use spans consistentes; evite larguras arbitrárias em cada cartão.
- Alinhe textos pela linha de base quando compartilham uma linha. O topo de uma caixa SVG não é necessariamente o topo óptico do ícone.
- Preserve alinhamento entre linhas de dados com colunas explícitas ou subgrid quando adequado; unidades e números não devem oscilar ao atualizar.
- Use CSS Grid para a estrutura e Flexbox para pequenos grupos lineares. Reserve posição absoluta para camadas decorativas ou instrumentos cuja geometria a exige.
- Reorganize zonas e preserve a ordem de leitura em telas estreitas; não reduza uma tela inteira proporcionalmente até tornar o texto ilegível. Use `minmax(0, 1fr)` e `min-width: 0` quando conteúdo flexível precisar encolher.
- Limite blocos longos de prosa a uma medida confortável, em torno de 55–75 caracteres. Não force essa medida em tabelas ou escalas numéricas.

Painéis curvos podem ter uma moldura SVG e graduadores posicionados geometricamente, mas os valores e rótulos essenciais devem permanecer legíveis, selecionáveis e acessíveis. A curvatura de uma referência não justifica distorcer glifos ou ocultar dados no mobile.

## Verificação óptica

Compare margens esquerda/direita, gutters, linha de base, ritmo vertical e distância entre grupos na mesma captura. Confira 375px, uma largura intermediária e desktop amplo, além de 200% de zoom. Teste as strings e os valores extremos reais. Verifique que títulos não quebram em palavras órfãs por uma largura acidental e que um número maior não empurra os comandos. A aprovação exige hierarquia perceptível em escala de cinza, conteúdo em fluxo e alinhamentos consistentes; não basta declarar que existe um grid.
