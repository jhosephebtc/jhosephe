# Revisão e validação

Use esta lista conforme o escopo; uma revisão de código não comprova sensação tátil em hardware.

## Estrutura e estados

- O componente correto é usado para o trabalho: botão, link, campo, slider, switch, menu ou diálogo.
- Repouso, hover possível, pressionado, foco, selecionado, disabled, carregamento e erro não se confundem. A interface não espera a animação para aceitar outra ação.
- Teste rótulo longo, conteúdo traduzido, escala de 200%, ausência de dados, valores extremos e superfície estreita.
- O foco permanece visível sem ser cortado. Controle operável por toque tem alvo suficiente; nomes acessíveis são claros e não duplicados.
- Switches claros não parecem um capsule escuro com esfera branca; posição do rocker e estado acessível permanecem reconhecíveis. O baixo-relevo dos ícones não reduz a leitura em tamanho real nem em 200%.

## Material, tipografia e composição

- Meça contraste em cada combinação real de texto e fundo e nos extremos de vidro; não classifique uma cor por intuição.
- Desative backdrop-filter e confira se a face permanece legível.
- Teste `forced-colors` e, quando disponível, `prefers-reduced-transparency`.
- Confirme Geist Sans e fallback sans-serif sem mudança grave de layout, pesos carregados, kerning ativo e números tabulares em medidas voláteis.
- Confira a paleta acromática também em fundos, canvas, gradientes, texturas, sombras, foco, SVG e shaders. Confira ausência de serifadas e de fontes mono. Estados continuam claros por texto, ícone, forma e contraste. Cores forçadas seguem o sistema.
- Revise tracking no tamanho final, pares de letras, acentos, alinhamento de unidades e largura reservada para números que mudam. Não aceite espaçamento manual entre caracteres.
- Confira colunas e eixos comuns, gutters, ritmo de 4px, relações entre espaços internos e entre grupos. Faça ajustes ópticos localizados, sem perder o grid.
- Compare desktop, largura intermediária, 375px e zoom de 200% com conteúdo real. A adaptação deve reorganizar a composição, mantendo texto legível e ordem de leitura.

## Movimento

- Ação responde imediatamente. Abra e feche rapidamente; interrompa ou reverta antes de completar.
- Verifique `prefers-reduced-motion` em CSS, animações SVG e execução de shader. Conteúdo essencial sempre está presente.
- Confira origem do popover, direção coerente de saída, hover em dispositivo híbrido e `pointercancel` em gestos.
- Investigue quedas de frames com profiler: layout, repintura, blur, canvases, listeners e atualizações React por frame. Registre dispositivo, navegador e condições.

## Evidência

Ao revisar uma base, registre arquivo/linha e cenário de reprodução. Uma busca por `outline: none` ou `transition: all` gera candidatos, não defeitos confirmados: verifique a regra que efetivamente ganha no estado e ambiente. Diferencie problema comprovado, hipótese de desempenho e sugestão estética.


Confira botões e sliders glass: texto, valor e foco permanecem legíveis sem blur/WebGL. Liquid feedback respeita movimento reduzido, mouse, toque e teclado. Não há metal, inclusive em detalhes. Visores e bases permanecem claros. Divisórias decorativas quase desaparecem; volume, relevo e sombra suave organizam a hierarquia sem comprometer foco e leitura.
