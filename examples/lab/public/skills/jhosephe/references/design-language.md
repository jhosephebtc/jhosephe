# Linguagem visual

## Personalidade

Uma interface de instrumentos: precisa, serena e tátil. Organize o conteúdo em planos neutros com espaçamento deliberado e poucas linhas técnicas; reserve volume físico e emissão luminosa para os elementos manipuláveis. Escolha uma peça principal por área e deixe o restante respirar. O sistema precisa funcionar em produtos reais em **Light Porcelain** e **Black / Dark Obsidian**, não apenas em composições estáticas de portfólio.

## Dupla paleta monocromática (Light Porcelain & Black / Dark Obsidian)

A identidade estrutural opera em dois temas acromáticos calibrados — **Light** (`:root`, `color-scheme: light`) e **Black / Dark** (`:is([data-jh-theme="dark"], .dark)`, `color-scheme: dark`). Monocromática aqui significa **estritamente acromática**: sem matiz azulado, bege, sépia ou dourado em fundos, canvas, faces, gradientes estruturais, texturas, sombras, reflexos, foco, divisórias, SVG estrutural ou shaders (`R = G = B` em RGB; `C = 0` em OKLCH).

### Tema claro (`Light Porcelain` — `:root`)

| Papel | Token / Valor | Uso |
| --- | --- | --- |
| Canvas mineral | `--background: #f8f8f8` | Fundo principal da aplicação e espaço negativo |
| Superfície elevada | `--card` / `--popover: #ffffff` | Cartões, popovers, modais, menus e faces (`#f7f7f7` em controles sólidos) |
| Cavidade / Input | `--jh-surface-well` / `#eeeeee`–`#f1f1f1` | Trilhos, assentos em baixo-relevo e campos de texto |
| Hover claro | `--muted: #f5f5f5` | Feedback sutil de superfície |
| Estrutura | `--border: #d6d6d6` / `--input: #b0b0b0` | Filetes estruturais quando estritamente necessários |
| Tinta principal | `--foreground: #2e2e2e` | Texto, valores numéricos e ícones principais |
| Tinta secundária | `--jh-text-secondary: #6b6b6b` | Subtítulos, legendas e descrições |
| Tinta auxiliar | `--jh-text-tertiary: #8c8c8c` | Notas técnicas e unidades onde o contraste medido permitir |
| Foco acessível | `--ring: #525252` | Anel de `:focus-visible` fora de recortes |
| Divisória discreta | `--jh-divider: rgb(0 0 0 / .035)` | Separação quase imperceptível |

### Tema escuro (`Black / Dark Obsidian` — `:is([data-jh-theme="dark"], .dark)`)

| Papel | Token / Valor | Uso |
| --- | --- | --- |
| Canvas & Cavidades (Wells) | `--background: #060606` | Canvas da página, trilhos em baixo-relevo, leito do dial e bandejas segmentadas |
| Campos de entrada | `#070707` → `#090909` (foco) | Superfície côncava plana em inputs, buscas e triggers de pickers |
| Palcos de preview | `#080808` | Palco recuado atrás de componentes elevados no catálogo |
| Cards, Modais & Scroll | `--card` / `--popover: #0a0a0a` | Cartões, diálogos, menus, calendários, `.jh-scroll-frame` e painéis |
| Faces elevadas & Thumbs | `--jh-surface-face: #0e0e0e` → `#0a0a0a` | Botões, thumbs ativos e superfícies manipuláveis |
| Tinta principal | `--foreground: #ededed` | Texto e ícones principais em fundo escuro |
| Tinta secundária | `--jh-text-secondary: #989898` | Subtítulos, legendas e instruções |
| Tinta auxiliar | `--jh-text-tertiary: #6e6e6e` | Notas auxiliares e metadados |
| Foco acessível | `--ring: #383838` | Anel de foco calibrado para fundo escuro |
| Divisória discreta | `--jh-divider: rgb(255 255 255 / .018)` | Separação sutil sem halos brancos |

A geração dos tokens e regras do tema escuro é determinística via `node scripts/generate-dark-theme.mjs`. Nunca aplique `filter: grayscale(...)` globalmente para corrigir tokens desalinhados, nem crie blocos escuros arbitrários dentro do tema claro para simular visores: cada componente respeita o tema ativo por meio de tokens semânticos.

### Onde a cor cromática é permitida (emissão OKLCH controlada)

Cor cromática entra **exclusivamente** como luz emissora controlada pelo usuário ou espectro funcional — nunca como fundo estrutural da página:

- Controles de edição de cor e matrizes cromáticas: `SpectrumControl`, `OklchPalette`.
- Emissores internos de instrumentos e hardware tátil: `Dial`, `DetentDial`, `Slider`, `BarSlider`, `TactileLever`, `TactileKey`, `TactileKeypad`, `TactileConsole`, `CameraWheel`, `CameraDial`, `FilmstripGallery`, `InstrumentBars`, `AudioMeter` e `LunarEphemeris`.

Toda emissão luminosa permanece confinada dentro de cavidades, ranhuras em baixo-relevo ou fendas fresadas (`overflow: hidden` ou máscara SVG), entrando em standby contido em repouso e ganhando intensidade durante manipulação ativa.

## Estados sem acentos cromáticos estruturais

- **Selecionado**: marcador discreto, elevação de face ou mudança de luminância coerente com o tema ativo; preserve contraste legível em Light e Black/Dark.
- **Erro**: mensagem explícita e ícone reconhecível; não dependa de vermelho nem apenas de borda.
- **Sucesso**: confirmação em texto ou símbolo, sem depender de verde.
- **Foco**: contorno neutro contrastante (`:focus-visible`) separado da sombra externa e livre de clipping; teste em todas as faixas de transparência e blur (`0–85%` / `0–32px`).
- **Disabled**: semântica nativa (`disabled`) e contraste diferenciado sem esconder o papel do controle.
- **Loading / Working**: spinner acromático inline com `aria-busy="true"` e bloqueio de clique duplicado, sem alterar o layout do botão.
- **Cores forçadas (`forced-colors: active`)**: respeite `Canvas`, `CanvasText`, `ButtonText` e `Highlight`.

## Tipografia, idioma de produto e composição

- **Geist Variable em tudo**: use `'Geist Variable', system-ui, sans-serif` em toda a hierarquia, incluindo medições, tabelas, eixos e blocos de código. Não use famílias serifadas nem monoespaçadas. Use `font-variant-numeric: tabular-nums lining-nums` em readouts dinâmicos. Consulte [Tipografia e layout](typography-layout.md).
- **Inglês americano (`en-US`) e sentence case**: redija rótulos, estados, mensagens de validação, nomes acessíveis e exemplos de produto em inglês americano natural, usando **sentence case** (evite ALL CAPS como estilo decorativo de UI; preserve siglas técnicas legítimas como `EV`, `ISO`, `OKLCH`, `CUT`, `RES`, `dBFS`, `UTC`).

A grade pode evocar um console de precisão, mas o fluxo acompanha o conteúdo e se reorganiza em telas estreitas. Prefira respiro, planos, sombras de contato calibradas e superfícies em baixo-relevo a divisórias contrastantes ou molduras desenhadas.

## Tradução de referências

Escolha a profundidade do material conforme o contexto da tela. Extraia proporção, escala, ritmo e iluminação das referências físicas; traduza acentos coloridos estruturais para luminância acromática, forma e relevo, deixando cor viva apenas onde o usuário escolhe emitir luz OKLCH.
