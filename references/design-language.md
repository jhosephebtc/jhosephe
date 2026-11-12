# Linguagem visual

## Personalidade

Uma interface de instrumentos: precisa, serena e silenciosa. Faça o conteúdo se organizar em planos claros com espaçamento deliberado e poucas linhas técnicas; use volume para os elementos manipuláveis. Escolha uma peça principal por área e deixe o resto respirar. O resultado precisa funcionar em um produto real, não apenas em uma composição de portfólio.

## Paleta monocromática

A identidade usa sempre branco, cinzas neutros e preto. Monocromática aqui significa acromática, sem matiz azulado, bege ou dourado. A regra inclui todos os fundos e canvas, texturas, sombras, gradientes, foco, iluminação de vidro e shaders. Em RGB, use canais iguais; em OKLCH, use croma zero.

| Papel | Valor inicial | Uso |
| --- | --- | --- |
| Fundo mineral | `#f8f8f8` | canvas do app e espaço vazio |
| Superfície | `#ffffff` | cartões e leitura |
| Vidro | `rgb(255 255 255 / 0.772)` | painéis e barras sobre fundo neutro |
| Vidro elevado | `rgb(255 255 255 / 0.952)` | faces com mais cobertura |
| Hover claro | #f5f5f5 | feedback de superfície |
| Estrutura | #b0b0b0 | divisórias decorativas e estrutura secundária |
| Tinta auxiliar | #8c8c8c | apoio visual somente onde o contraste medido permitir |
| Contorno funcional | `#737373` | limites de controles quando necessários para reconhecê-los |
| Tinta principal | `#2e2e2e` | texto, ícones e foco sobre superfícies claras |
| Tinta secundária | `#6b6b6b` | legendas e descrições |
| Divisória decorativa | `rgb(0 0 0 / .035)` | separação quase invisível, somente quando necessária |

O ponto de partida preserva os papéis neutros da base clara do app e do editor de nós: canvas quase branco, superfícies brancas, texto principal escuro, texto secundário moderado e vidro com coberturas distintas. São amostras, não garantias de contraste. Meça cada par aplicado, inclusive sobre vidro e gradiente. Opacidade sobre um fundo colorido pode produzir cor: mantenha o fundo acromático ou use uma face opaca. Não aplique um filtro grayscale ao aplicativo inteiro para corrigir tokens inconsistentes.

O tema é integralmente claro: canvas, visores, molduras, pedestal e controles. Use grafite em números, texto e escalas; não crie áreas pretas para simular um instrumento. Botões usam glass com resposta liquid pontual; sliders usam puxadores sólidos de vidro, táteis e sem deformação liquid. Relevo skeuomórfico organiza o volume, sem metal.

## Estados sem acentos de cor

- Selecionado: rebaixo sutil ou mudança de cobertura do vidro, com marcador, ícone ou texto quando necessário; mantenha a face clara.
- Erro: mensagem explícita e ícone reconhecível; não dependa de vermelho ou apenas de borda.
- Sucesso: confirmação em texto ou símbolo, sem depender de verde.
- Foco: contorno neutro contrastante e separado da sombra; teste sobre todas as coberturas de vidro.
- Disabled: semântica correta e aparência diferenciada que preserve leitura.
- Cores forçadas: respeite as cores do sistema e a preferência de acessibilidade do usuário.

## Tipografia e composição

Use Geist Sans em toda a interface, incluindo medições, eixos, código e índices. Não use serifadas nem monoespaçadas. Leia [Tipografia e layout](typography-layout.md) ao definir hierarquia, kerning, espaçamento e grids.

A grade pode evocar um console, mas o fluxo segue o conteúdo e se reorganiza para telas pequenas. Respiro, relevo suave, marcas de escala funcionais e alinhamento entre rótulo, valor e comando criam precisão. Divisórias decorativas são quase imperceptíveis; prefira volume e sombras suaves a linhas contrastantes. Use respiros amplos ao redor de um objeto expressivo; em configurações densas priorize leitura e alvos suficientes. Um plano pode ter cantos suaves enquanto instrumentos e linhas internas mantêm geometria mais firme.

## Tradução de referências

Escolha materiais para o contexto da tela. Uma lista longa, um painel de dados e uma landing page precisam de níveis diferentes de profundidade. Extraia proporção, contraste, textura, luz e ritmo das referências; traduza seus acentos coloridos para diferenças de luminância, forma e relevo. A inspiração não muda a paleta da identidade nem autoriza redesenhar partes fora do escopo.
