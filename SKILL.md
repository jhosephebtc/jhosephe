---
name: jhosephe
description: Projetar, implementar e revisar interfaces web táteis em React, CSS e shadcn/ui, com tema claro monocromático, botões liquid glass, sliders rígidos de vidro, skeuomorfismo, tipografia Geist Sans e grids precisos, cantos contínuos e movimento responsivo. Use em novos componentes, sistemas visuais, refinamento visual e revisão de interação.
---

# jhosephe

Construa interfaces que pareçam objetos bem fabricados e sejam simples de operar. A assinatura é luz neutra suave, uma paleta acromática de branco, cinzas e preto, encaixes precisos, contraste legível e resposta imediata. Use Geist Sans, sem serifas, em toda a interface, inclusive instrumentos, números, escalas e legendas. Não use famílias serifadas nem monoespaçadas. Para números que mudam, use tabular-nums na própria Geist Sans. O realismo deve explicar hierarquia e uso.

## Regras da identidade

- **Superfícies sempre monocromáticas.** Use branco, cinzas neutros e preto em fundos, canvas, faces, gradientes, texturas, sombras, reflexos, foco, SVG e shaders. Cores só aparecem dentro de um controle feito para editar cor, nos trilhos de espectro e na amostra que representa o valor atual. Estados em outros componentes usam contraste, forma, ícone e texto. Preserve as cores de acessibilidade escolhidas pelo sistema em forced-colors.
- **Geist Sans em tudo.** Não use serifadas nem fontes mono. Ative o kerning da fonte, ajuste tracking por papel e tamanho e mantenha números de instrumentos estáveis. Confira o texto real, acentos, unidades e quebras antes de acertar a composição.
- **Grid e espaçamento deliberados.** Defina colunas, margens, gutters e uma escala de espaço antes de posicionar peças. Alinhe rótulos, valores e controles a eixos compartilhados; use ajustes ópticos localizados, sem espaçamentos arbitrários.

- **Tema claro integral.** Fundos, molduras, bases, visores e controles usam branco e cinzas claros. Grafite fica na informação. Não crie blocos escuros para simular instrumentos.
- **Glass, liquid glass e skeuomorfismo.** Botões são de vidro e podem ter uma pequena resposta liquid à pressão. Sliders usam puxador sólido de vidro, com reflexo localizado e volume coerente: sem deformação liquid, expansão, squash ou elasticidade durante arraste. Não use metal, acabamento cromado nem Liquid Metal, inclusive em detalhes. Paper pode produzir luz acromática suave atrás do vidro. Links ghost podem permanecer sem face. Preserve fallback CSS legível e movimento reduzido.
- **Switch simples e arredondado; ícones sem relevo.** Use um canal claro de vidro, um thumb pequeno com cantos suaves e espaço visível ao redor. Evite o trilho escuro com esfera branca e evite detalhes decorativos no thumb. Ícones são planos, suaves e semitransparentes: sem baixo-relevo, drop shadow ou contorno de sombra.
- **Separação por relevo.** Prefira respiro, planos, sombras de contato suaves e brilho interior. Divisórias decorativas são quase imperceptíveis; evite linhas contrastantes, molduras marcadas e grids que pareçam tabelas desenhadas. Foco, limites funcionais e escalas mantêm contraste suficiente.

## Decida antes de desenhar

Identifique a tarefa, o componente, a frequência de uso e os dispositivos. Leia os tokens e primitivas existentes. Preserve a stack, a semântica e o escopo solicitado. Em projeto novo, use React + TypeScript + CSS e componentes compatíveis com shadcn/ui. Em projeto existente, adapte os tokens em vez de introduzir um segundo tema global.

Defina um material dominante e um material secundário. O ponto de partida é mineral claro para conteúdo; botões e sliders são de vidro. Vidro também serve às superfícies que flutuam. O relevo skeuomórfico vem da luz e da profundidade do próprio vidro; uma textura narrativa pode destacar um objeto. Barras e escalas devem comunicar dados reais; gráficos decorativos devem ser identificados como ilustração. Não transforme todas as regiões em controles volumétricos.

## Carregue apenas o necessário

| Tarefa | Referência |
| --- | --- |
| Direção visual, composição e paleta monocromática | [Linguagem visual](references/design-language.md) |
| Kerning, tracking, hierarquia, espaçamento e grids | [Tipografia e layout](references/typography-layout.md) |
| Skeuomorfismo, glass, liquid glass e relevo | [Materiais](references/materials.md) |
| Radius, suavização, clipping e contorno | [Cantos contínuos](references/corners.md) |
| Pressão, molas, gestos e transições | [Movimento tátil](references/motion.md) |
| Linhas, barras e microinterações SVG | [Instrumentos e SVG](references/instruments.md) |
| Luz procedural e materiais com shaders | [Shaders](references/shaders.md) |
| React, CSS, Tailwind e integração shadcn/ui | [Implementação](references/react-shadcn.md) |
| Revisão, acessibilidade, desempenho e estados extremos | [Critérios de revisão](references/review.md) |
| Tradução de referências visuais em decisões | [Estudo visual](references/visual-study.md) |

## Contrato de construção

1. **Função antes do material.** Use button, input, link e primitivas acessíveis. Uma aparência de botão precisa corresponder a uma ação. Não invente rotação ou arraste para um comando binário.
2. **Luz coerente.** Uma direção predominante, brilho de borda estreito e sombra de contato. Profundidade maior significa camada mais alta ou elemento com maior curso, não maior importância indiscriminadamente.
3. **Texto protegido.** O conteúdo principal fica sobre fundo previsível. Vidro recebe tinta suficiente para preservar legibilidade sobre o fundo real. Rótulos, ícones e contorno de controle não podem depender somente da sombra.
4. **Forma explícita.** Raio e suavização são parâmetros distintos. Use 60% como ponto de partida da linguagem; não chame um border-radius maior de smoothing. Mantenha foco fora do recorte e fallback arredondado utilizável.
5. **Resposta contínua.** Pressionar dá feedback imediatamente, a ação confirma em click/ativação semântica. Durante arraste, o controle acompanha o ponteiro. Após soltar, o retorno pode amortecer. Nenhuma animação deve bloquear a próxima ação.
6. **Movimento proporcional.** Faça a frequência e o propósito definirem a intensidade. Entrada rápida, saída curta, repouso estável. Estados de hover dependem da capacidade de hover. Respeite movimento reduzido também no JavaScript.
7. **Acabamento resiliente.** Valide teclado, toque, zoom, texto longo, disabled, loading, erro, ausência de blur, transparência reduzida e cores forçadas. O sistema deve continuar compreensível sem os efeitos.

Os números sugeridos são pontos de partida ajustáveis à densidade e à matriz de suporte. A base visual monocromática é explícita; um controle de cor pode mostrar a cor que edita sem colorir a página ao redor.

## Recursos reutilizáveis

[assets/ui](assets/ui) contém CSS e componentes funcionais: Button, SmoothShape, Switch, Slider, Dial, Dialog, InstrumentBars, ShaderSurface, BarSlider, Calendar, DatePicker, DateTimePicker, Menu, ActionMenu, Toast, Gallery, Input, SearchInput, DataForm, RadioGroup, SegmentedControl, ScrollArea, TactileKey, Compass, SpectrumControl e StepNavigation. Leia [integração](references/react-shadcn.md) antes de copiá-los. A geometria usa uma dependência declarada; não exige outra skill. A home e a página de detalhes usam as mesmas implementações interativas do registro.

## Interação física e linguagem

- Use inglês americano em todo texto de produto, nomes acessíveis, estados, mensagens e exemplos. Geist Sans também em números e código.
- Sliders têm uma trilha um pouco mais larga, quase plana, com pouca sombra. O thumb translúcido parece vidro fosco, mas continua fácil de encontrar. O caminho preenchido é branco semitransparente, com blur e brilho discreto. Barras interativas acompanham arraste e teclado; mostre o valor verdadeiro.
- Switches têm canal claro, mais arredondado e simples, com respiro ao redor. Uma peça móvel de vidro comunica o estado por posição e forma.
- Ícones permanecem planos, suaves e semitransparentes, sem sombra ou efeito gravado. Preserve silhueta, espessura do traço e contraste em tamanhos pequenos.
- Campos de texto usam uma face clara rebaixada como a busca. Ao focar, mude a face e adicione um realce interno muito suave; não desenhe um anel externo escuro. O foco deve continuar perceptível por teclado.
- Menus de escolha devem compartilhar o material glass dos componentes; não deixe o dropdown padrão do navegador destoar da interface.
- Variações de hover dão retorno imediato e calmo, com reflexo, pequena mudança de sombra ou deslocamento curto. Evite mover controles sob o ponteiro, saltos entre estados e animação em dispositivos sem hover. Respeite movimento reduzido.
- O dia selecionado no calendário se distingue por valor e uma face clara quase plana; não use uma sombra escura para forçar a seleção.
- Dials usam o ângulo real do ponteiro para girar no mesmo lado e direção. Preserve o arco de valores, trate o trecho inferior sem escala como limite e mantenha alternativa de teclado.
- Modais complexos agrupam contexto, informações e ações em hierarquia legível. Pickers maiores combinam seleção, disponibilidade e confirmação sem esconder cancelar ou limpar.
- Não use ALL CAPS como estilo de texto de produto. Prefira sentence case em nomes, rótulos, estados, metadados e botões.
- Dials têm assento recuado, lateral visível e sombra de contato. A luz permanece fixa enquanto apenas o indicador gira. O ponteiro angular segue a posição e o sentido do cursor; limites, step, setor sem escala, teclado e cancelamento são explícitos.
- Use cursor grab em controles arrastáveis e grabbing durante o gesto. Evite animar o valor atrás do ponteiro.
- Traduza instrumentos vintage em proporções, escalas, alavancas e volume, mantendo a identidade clara, monocromática e sem metal.
- Navegação entre componentes mantém a estrutura da página, histórico, foco e rolagem; transições curtas e interrompíveis, removidas com movimento reduzido.
- Catálogos oferecem prévia, personalização, código real e instalação verificável; exemplos não fingem salvar dados em servidor.

## Fluxo de trabalho

- Comece por estrutura, estados, tokens, escala tipográfica e grid. Confira alinhamentos e relações de espaço com o conteúdo real. Aplique material ao componente funcionando.
- Para novo sistema, estabeleça uma pequena amostra: superfície, ação, entrada de dados e sobreposição. Só propague depois de conferir esses quatro casos.
- Para revisão, registre evidência por arquivo/linha ou captura. Diferencie erro funcional de preferência estética e de hipótese que ainda precisa de medição.
- Para gesto ou transição, teste interrupção, cancelamento, reversão e redução de movimento. Meça frames quando houver indício de custo; não prometa GPU ou desempenho a partir de uma propriedade CSS.
- Entregue o artefato, as decisões relevantes, a verificação feita e os limites reais. Não entregue apenas adjetivos ou uma lista de inspirações.

## Evite

Vidro em toda a tela; sombras simétricas que apagam limites; bloom sobre texto; textura em formulários; bounce em cada clique; transition: all; blur animado como disfarce universal; número importante rolando por decoração; elemento invisível ainda focável; máscara cortando foco; fontes pequenas para compensar falta de espaço.

Use a identidade **jhosephe** em títulos, instruções e exemplos. Não introduza personas ou assinaturas de autores de referências. Ao incorporar uma dependência ou código de terceiro, preserve os avisos que acompanham esse material; os recursos deste pacote são redigidos para esta identidade.
