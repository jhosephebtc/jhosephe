# Materiais e luz

## Vocabulário

| Material | Face | Borda e relevo | Situação adequada |
| --- | --- | --- | --- |
| Mineral fosco | branco ou cinza levemente frio, cobertura alta | filete claro em cima e sombra curta | conteúdo e formulários |
| Vidro | cor translúcida, com tinta suficiente | brilho fino e sombra de separação | barra flutuante, popover, camada transitória |
| Metal acetinado | gradiente estreito de cinzas frios | realce e sombra de contato direcionais | dial, pegador ou acionador |
| Plástico escuro | carvão com brilho controlado | contorno e luz difusa | face de instrumento ou ação de alto contraste |
| Textura narrativa | detalhe superficial discreto | borda e sombra coerentes | objeto expressivo, com conteúdo fora da textura |

Uma luz dominante vinda do alto organiza todas as sombras da mesma cena. Diferencie sombra de contato, que é curta, de sombra ambiental, que é larga e fraca. Em repouso, o controle tem uma face. Ao pressionar, diminua o relevo e desloque a face poucos pixels ou reduza levemente a escala. Não esconda estado selecionado dentro de um reflexo.

## Sombra leve da interface clara

A base consultada usa uma hierarquia muito discreta: controles próximos ao plano, superfícies com duas sombras suaves e sobreposições com dispersão maior, mas pouca opacidade. Os tokens `--jh-shadow-control`, `--jh-shadow-surface`, `--jh-shadow-overlay` e `--jh-shadow-pressed` em `assets/ui/theme.css` preservam esse ponto de partida. Em casos onde duas faces coincidem, mantenha apenas uma sombra externa; aplique-a ao wrapper, sem recortar o foco.

O relevo mais pronunciado fica reservado para uma peça de destaque, como um dial metálico. Não aplique essa intensidade a todos os campos, listas e painéis. As definições da base variam conforme o tema e os overrides ativos; valide o resultado na superfície real em vez de assumir um único valor para todas as telas.

## Vidro confiável

1. Comece com uma cor opaca legível. Aplique `backdrop-filter` só quando suportado, sobre uma área pequena com fundo que realmente se beneficia da translucidez.
2. Adicione brilho de borda por dentro, sem alterar o tamanho da caixa. Evite empilhar múltiplas superfícies translúcidas no mesmo eixo.
3. Meça contraste sobre o fundo mais claro e mais escuro que o produto permite; dê à face tinta opaca suficiente.
4. Sob transparência reduzida e cores forçadas, use uma face sólida. Um fallback de recurso ausente também deve ser sólido.
5. Filtros de deslocamento, reflexo especular e WebGL têm suporte e custo variáveis. Use-os apenas quando o efeito faz diferença e valide por navegador, GPU e estado da página.

O pacote opcional `liquid-glass` oferece caminhos SVG, canvas e WebGL e primitivas React. É uma biblioteca experimental: confira sua versão e API antes de integrar, teste os fallbacks e mantenha seus avisos de licença. Não é necessária para um painel translúcido simples.

## Detalhes que criam realismo

- Uma faixa estreita de brilho, não um contorno branco grosso.
- Mínima variação tonal na face; não dependa de ruído para revelar texto.
- Ranhuras discretas em controles rotativos; se for SVG decorativo, deixe fora da árvore acessível.
- Um reflexo faz sentido se acompanha a orientação do objeto e não altera o significado do estado.
- Evite aparência quebrada quando sombras, filtros ou imagens não forem carregados.
