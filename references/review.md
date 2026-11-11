# Revisão e validação

Use esta lista conforme o escopo; uma revisão de código não comprova sensação tátil em hardware.

## Estrutura e estados

- O componente correto é usado para o trabalho: botão, link, campo, slider, switch, menu ou diálogo.
- Repouso, hover possível, pressionado, foco, selecionado, disabled, carregamento e erro não se confundem. A interface não espera a animação para aceitar outra ação.
- Teste rótulo longo, conteúdo traduzido, escala de 200%, ausência de dados, valores extremos e superfície estreita.
- O foco permanece visível sem ser cortado. Controle operável por toque tem alvo suficiente; nomes acessíveis são claros e não duplicados.

## Material e tipografia

- Meça contraste em cada combinação real de texto e fundo e nos extremos de vidro; não classifique uma cor por intuição.
- Desative backdrop-filter e confira se a face permanece legível.
- Teste `forced-colors` e, quando disponível, `prefers-reduced-transparency`.
- Confirme Geist e fallback sem mudança grave de layout, pesos carregados e números tabulares em medidas voláteis.

## Movimento

- Ação responde imediatamente. Abra e feche rapidamente; interrompa ou reverta antes de completar.
- Verifique `prefers-reduced-motion` em CSS, animações SVG e execução de shader. Conteúdo essencial sempre está presente.
- Confira origem do popover, direção coerente de saída, hover em dispositivo híbrido e `pointercancel` em gestos.
- Investigue quedas de frames com profiler: layout, repintura, blur, canvases, listeners e atualizações React por frame. Registre dispositivo, navegador e condições.

## Evidência

Ao revisar uma base, registre arquivo/linha e cenário de reprodução. Uma busca por `outline: none` ou `transition: all` gera candidatos, não defeitos confirmados: verifique a regra que efetivamente ganha no estado e ambiente. Diferencie problema comprovado, hipótese de desempenho e sugestão estética.
