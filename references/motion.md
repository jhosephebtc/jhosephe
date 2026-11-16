# Movimento tátil

## Antes de animar

Determine frequência, intenção e estado inicial/final. Ação frequente pede resposta imediata e pouca viagem. Use transição para explicar uma mudança, dar feedback, indicar origem espacial ou comunicar progresso real. Em dados que precisam ser lidos, preserve a estabilidade.

| Interação | Ponto de partida | Observação |
| --- | --- | --- |
| Pressão | 100–160ms; escala ~0,97 | feedback visual no início, ativação semântica no click |
| Tooltip / popover | 120–200ms | popover parte do gatilho; tooltip frequente pode ser instantâneo |
| Menu | 150–220ms | entrada pequena e reversível |
| Diálogo | 180–280ms | opacidade e movimento contido; sem travar o foco |
| Troca de aba | cerca de 180ms | painel entra com opacidade e deslocamento curto; sem reanimar texto por palavra |
| Retorno de gesto | mola amortecida | velocidade inicial deriva do gesto; evite salto |

Esses valores são ponto de partida, não limites universais. Uma transição espacial complexa pode precisar de outro tempo; valide com os usuários e o conteúdo. Para entradas, uma curva que comece rápida costuma comunicar resposta. Em progresso determinado, a visualização deve refletir o valor e não inventar uma duração.

## Pressão e gesto

`button:active` dá feedback a mouse e toque sem disparar ações no pointerdown. `:focus-visible` é independente de hover. Use `@media (hover: hover) and (pointer: fine)` para efeitos exclusivos de hover.

Durante arraste, acompanhe o ponteiro sem atraso e preserve o ponto de contato. Capture o ponteiro, trate `pointercancel` e perda de captura, ofereça teclado e defina `touch-action` conforme o eixo. Depois da soltura, uma mola amortecida pode continuar a velocidade e ser interrompida; não esconda conteúdo ou deixe foco preso no elemento descartado.

Coordene elementos de um mesmo objeto com uma família temporal. Um painel que entra pode carregar seu conteúdo junto; não acrescente atrasos em todas as linhas. Menus e tarefas repetidas precisam estar prontos imediatamente.

## Implementação e respeito a preferências

- Prefira `transform` e `opacity` para movimento; o navegador decide se vai compor em GPU. Meça com conteúdo real.
- Transições retargetáveis funcionam para estados simples. Use motor de mola apenas quando interrupção/velocidade for necessária. Não instale uma biblioteca para um fade.
- Especifique propriedades; evite `transition: all`. Não adicione `will-change` globalmente.
- Popovers se originam do gatilho; diálogos centrados não têm gatilho espacial equivalente.
- Painéis de abas podem entrar com `opacity` e `translateY` de poucos pixels. Preserve o layout, aceite mudanças rápidas e remova o deslocamento sob movimento reduzido.
- Sob `prefers-reduced-motion: reduce`, remova deslocamento e oscilação não essenciais e apresente estados finais sem atraso. Também pare animação JS, SVG e canvas, não apenas CSS.
- Em teste de qualidade, alterne rapidamente, navegue por teclado, teste cancelamento e perfil de desempenho com o dispositivo real disponível.

## Animações em SVG & Vídeo Social (MP4 60fps)

Para posts editoriais, gráficos vetoriais animados e exportação em vídeo (`3:2` `1620×1080`, `16:9`, `1:1`, `4:5`, `9:16`), siga [jhosephe-svg-motion](../.agents/skills/jhosephe-svg-motion/SKILL.md):
- **Rascunho estático primeiro**: gere e valide visualmente os SVGs estáticos com `--preview` antes de animar ou renderizar MP4.
- **Presença imediata (`<= 0.5s`)**: título, eyebrow e hardware tátil devem estar presentes no frame `0` (com qualquer transição de texto concluída em no máximo `500ms`) para nunca deixar cena vazia no feed.
- **Sombras 3D e textura sutil**: confine textura de papel (`<feTurbulence>`) apenas ao fundo, eleve objetos com `drop-shadow` direcional em camadas via CSS GPU sRGB e restrinja emissão luminosa a LEDs, arcos e cursores ativos.
