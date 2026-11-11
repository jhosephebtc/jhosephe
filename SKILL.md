---
name: jhosephe
description: Projetar, implementar e revisar interfaces web táteis em React, CSS e shadcn/ui, com tema claro monocromático, glass, liquid glass, skeuomorfismo, tipografia Geist Sans e grids precisos, cantos contínuos e movimento responsivo. Use em novos componentes, sistemas visuais, refinamento visual e revisão de interação.
---

# jhosephe

Construa interfaces que pareçam objetos bem fabricados e sejam simples de operar. A assinatura é luz neutra suave, uma paleta acromática de branco, cinzas e preto, encaixes precisos, contraste legível e resposta imediata. Use Geist Sans, sem serifas, em toda a interface, inclusive instrumentos, números, escalas e legendas. Não use famílias serifadas nem monoespaçadas. Para números que mudam, use tabular-nums na própria Geist Sans. O realismo deve explicar hierarquia e uso.

## Regras da identidade

- **Sempre monocromática.** Use branco, cinzas neutros e preto em fundos, canvas, faces, gradientes, texturas, sombras, reflexos, foco, SVG e shaders. Fundos também são sempre monocromáticos. Não introduza azul, dourado ou acentos cromáticos. Estados usam contraste, forma, ícone e texto. Preserve as cores de acessibilidade escolhidas pelo sistema em forced-colors.
- **Geist Sans em tudo.** Não use serifadas nem fontes mono. Ative o kerning da fonte, ajuste tracking por papel e tamanho e mantenha números de instrumentos estáveis. Confira o texto real, acentos, unidades e quebras antes de acertar a composição.
- **Grid e espaçamento deliberados.** Defina colunas, margens, gutters e uma escala de espaço antes de posicionar peças. Alinhe rótulos, valores e controles a eixos compartilhados; use ajustes ópticos localizados, sem espaçamentos arbitrários.

- **Tema claro integral.** Fundos, molduras, bases, visores e controles usam branco e cinzas claros. Grafite fica na informação. Não crie blocos escuros para simular instrumentos.
- **Glass, liquid glass e skeuomorfismo.** Botões e sliders são de vidro, com reflexo localizado, pequena deformação na pressão/arraste e volume coerente. Não use metal, acabamento cromado nem Liquid Metal, inclusive em detalhes. Paper pode produzir luz acromática suave atrás do vidro. Links ghost podem permanecer sem face. Preserve fallback CSS legível e movimento reduzido.
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

Os números sugeridos são pontos de partida ajustáveis à densidade e à matriz de suporte. A paleta monocromática é uma decisão explícita desta identidade; uma referência colorida não altera essa regra.

## Recursos reutilizáveis

[assets/ui](assets/ui) contém CSS e componentes funcionais: Button, SmoothShape, Switch, Slider, Dial, Dialog, InstrumentBars e ShaderSurface. Leia [integração](references/react-shadcn.md) antes de copiá-los. A geometria usa uma dependência declarada; não exige outra skill. O laboratório do repositório exercita os mesmos arquivos, sem uma implementação paralela.

## Fluxo de trabalho

- Comece por estrutura, estados, tokens, escala tipográfica e grid. Confira alinhamentos e relações de espaço com o conteúdo real. Aplique material ao componente funcionando.
- Para novo sistema, estabeleça uma pequena amostra: superfície, ação, entrada de dados e sobreposição. Só propague depois de conferir esses quatro casos.
- Para revisão, registre evidência por arquivo/linha ou captura. Diferencie erro funcional de preferência estética e de hipótese que ainda precisa de medição.
- Para gesto ou transição, teste interrupção, cancelamento, reversão e redução de movimento. Meça frames quando houver indício de custo; não prometa GPU ou desempenho a partir de uma propriedade CSS.
- Entregue o artefato, as decisões relevantes, a verificação feita e os limites reais. Não entregue apenas adjetivos ou uma lista de inspirações.

## Evite

Vidro em toda a tela; sombras simétricas que apagam limites; bloom sobre texto; textura em formulários; bounce em cada clique; transition: all; blur animado como disfarce universal; número importante rolando por decoração; elemento invisível ainda focável; máscara cortando foco; fontes pequenas para compensar falta de espaço.

Use a identidade **jhosephe** em títulos, instruções e exemplos. Não introduza personas ou assinaturas de autores de referências. Ao incorporar uma dependência ou código de terceiro, preserve os avisos que acompanham esse material; os recursos deste pacote são redigidos para esta identidade.
