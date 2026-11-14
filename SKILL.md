---
name: jhosephe
description: Projetar, implementar e revisar interfaces web táteis em React 19, TypeScript, CSS e shadcn/ui com tema duplo monocromático (Light Porcelain e Black/Dark Obsidian), transparência e blur contínuos (--jh-surface-alpha e --jh-surface-blur), emissão OKLCH em canais táteis, scrollbars unificados (.jh-scroll-frame > .jh-scroll-area), tipografia Geist Variable, cantos contínuos e 64 componentes registrados.
---

# Jhosephe Tactile Interface System (`jhosephe`)

Use esta skill sempre que o trabalho envolver criar, estilizar, evoluir ou revisar interfaces web, bibliotecas de componentes, superfícies físicas táteis, instrumentos, galerias, controles de áudio/óptica, dashboards financeiros ou painéis astronômicos no sistema **Jhosephe UI**.

Traduza o objetivo de engenharia em uma interface calma, monocromática, tátil e fisicamente legível, onde **profundidade óptica, transparência contínua, borda suave e emissão cromática confinada** substituem decoração supérflua.

---

## Princípios Não Negociáveis

1. **Tema Duplo Acromático Calibrado (Light Porcelain & Black/Dark Obsidian)**
   - **Light (`:root`)**: base em papel/porcelana `#f8f8f8` e superfícies elevadas `#ffffff`.
   - **Black / Dark (`:is([data-jh-theme="dark"], .dark)`)**: obsidian calibrado `#060606` (canvas) e `#0a0a0a` / `#0e0e0e` (superfícies e cards), derivado de forma determinística via `node scripts/generate-dark-theme.mjs`.
   - **Pureza estrutural**: toda estrutura (canvas, painéis, bordas, textos, sombras, trilhas inativas e gráficos base) permanece **100% acromática (`R = G = B`, `C = 0` em OKLCH)**. Proibido qualquer tom de metal prateado, cromo, ruído metálico ou gradiente frio/quente na arquitetura base.

2. **Superfície Contínua: Transparency (`0–85%`) & Backdrop Blur (`0–32px`)**
   - O sistema substitui presets discretos antigos (`Solid | Glass | Liquid`) por controle contínuo aplicado via `[data-jh-surface-custom="true"]` com duas variáveis CSS:
     - `--jh-surface-alpha`: calculada como `(100 - transparency) / 100` (de `1` em `0%` até `0.15` em `85%`).
     - `--jh-surface-blur`: raio de `backdrop-filter: blur(...)` de `0px` até `32px`.
   - **Sincronização global para portals**: ao personalizar superfícies no app ou lab, sincronize `--jh-surface-alpha`, `--jh-surface-blur` e `data-jh-surface-custom="true"` em `document.documentElement` para que portals (`Dialog`, `Menu`, `ContextMenu`, `Popover`, `Toast`, `Combobox`, `Picker`, `CommandPalette`) herdem o mesmo estado.
   - **Invariante de preservação estrita**: ajuste **exclusivamente** a transparência do background da superfície e o `backdrop-filter` de fundo. **NUNCA** reduza, apague ou desfoque a elevação externa (`box-shadow`), a nitidez/cor da tipografia (`color`), ícones SVG, gráficos internos ou tiles de imagens.
   - **Fundo neutro e fallback acessível**: sempre posicione `<ShaderSurface />` monocromático atrás de palcos translúcidos e garanta fallback opaco limpo em `@media (prefers-reduced-transparency: reduce)`.

3. **Física Tátil Líquida & Emissão OKLCH Confinada**
   - **Botões líquidos (`.jh-button`)**: depressão responsiva ao ponteiro (`translateY(1px) scale(.985)`) e specular sutil no hover/pointer sem jamais trocar bruscamente a cor da face no `:active`; suporte explícito a estado `loading` (`aria-busy="true"`).
   - **Emissão OKLCH estrita**: cor cromática em OKLCH existe apenas para emissores controlados pelo usuário, espectros e pinos LED de hardware (`SpectrumControl`, `OKLCHPalette`, `Dial`, `DetentDial`, `Slider`, `BarSlider`, `TactileLever`, `TactileKey`, `TactileKeypad`, `TactileConsole`, `InstrumentBars`, `AudioMeter`, `LunarEphemeris`), sempre confinados em canais de baixo relevo (wells) com estado standby neutro vs. estado ativo iluminado.
   - **Grips rígidos de vidro**: cursores de slider mantêm corpo rígido e legível acima do canal iluminado.

4. **Contrato Unificado de Scrollbars & Galerias**
   - `ScrollArea`, `SimpleScroll`, `AccordionScroll` e `VerticalGallery` compartilham exatamente a mesma moldura `.jh-scroll-frame > .jh-scroll-area` (elevação única no frame externo, sem cartão aninhado interno, barra fina sem setas de `7px` e respiro lateral simétrico).
   - Listas e grades roláveis utilizam revelação progressiva na entrada/saída da viewport (`useScrollItemReveal` / `syncScrollItemVisibility`).
   - `VerticalGallery` inclui seletor inline de proporção (`1:1 | 3:4 | 4:5 | 9:16 | 16:9`) e tiles elevados não rebaixados.

5. **Tipografia Geist Variable, Cantos Contínuos & Copy em Inglês Americano**
   - Todo texto da UI (títulos, métricas, tabelas e blocos de código) usa `--jh-font: 'Geist Variable', system-ui, sans-serif` (`@fontsource-variable/geist`) com `font-variant-numeric: tabular-nums` em leituras numéricas.
   - Cantos contínuos com `SmoothShape` / squircle onde indicado e contraste de sombra realista (`#` em Light, rim light sutil + oclusão em Black/Dark).
   - Todo texto voltado ao usuário em componentes e exemplos (rótulos, placeholders, nomes acessíveis e status) deve estar em **American English (`en-US`)** e **sentence case** (exceção apenas para siglas consolidadas e termos próprios).
   - Zero movimento decorativo ocioso: animações respondem apenas a ponteiro, teclado, foco, scroll ou telemetria ativa, respeitando `prefers-reduced-motion: reduce`.

---

## Catálogo dos 64 Componentes & Registry Público

Todos os **64 componentes** são isolados por prefixos `--jh-*` / `.jh-*`, compatíveis com React 19, Radix UI e shadcn CLI, e servidos diretamente pelo registry público hospedado em `https://jhosephe.vercel.app/r/<id>.json` (showcase interativo em `https://jhosephe.vercel.app`, rotas `/components`, `/lab` e `/solar`):

- **Controls (15)**: `button`, `slider`, `switch`, `dial`, `bar-slider`, `radio-group`, `tactile-key`, `tactile-keypad`, `tactile-console`, `camera-wheel`, `camera-dial`, `spectrum-control`, `oklch-palette`, `detent-dial`, `tactile-lever`
- **Surfaces (10)**: `dialog`, `smooth-shape`, `shader-surface`, `scroll-area`, `simple-scroll`, `accordion-scroll`, `vertical-gallery`, `filmstrip-gallery`, `image-frame`, `data-table`
- **Instruments (8)**: `instrument`, `image-inspector`, `compass`, `audio-meter`, `weather-instrument`, `attitude-indicator`, `navigation-instrument`, `race-telemetry`
- **Inputs (8)**: `calendar`, `date-picker`, `input`, `search-input`, `data-form`, `date-time-picker`, `file-transfer`, `combobox`
- **Navigation (9)**: `menu`, `gallery`, `segmented-control`, `context-menu`, `step-navigation`, `accordion`, `finance-navigation`, `tabs`, `command-palette`
- **Feedback (3)**: `toast`, `progress-bar`, `metric-card`
- **Finance (4)**: `financial-chart`, `market-picker`, `currency-picker`, `financial-order-modal`
- **Astronomy (4)**: `astronomy-instrument`, `ephemeris-picker`, `astrology-wheel`, `lunar-ephemeris`
- **Weather (3)**: `weather-conditions`, `wind-instrument`, `tide-instrument`

Instalação direta via CLI:

```sh
npx shadcn@latest add https://jhosephe.vercel.app/r/button.json
```

---

## Fluxo de Trabalho Recomendado

1. **Definir linguagem, tema e paleta acromática**: leia [design-language.md](references/design-language.md) para tokens de superfície Light/Black, regras OKLCH, idioma `en-US` e proibição de metal.
2. **Estruturar grid, escalas e tipografia Geist Variable**: siga [typography-layout.md](references/typography-layout.md) e [corners.md](references/corners.md).
3. **Aplicar física de materiais, transparência contínua e scrollbars**: siga [materials.md](references/materials.md) e consulte [shaders.md](references/shaders.md) e [motion.md](references/motion.md).
4. **Instrumentação, óptica e React/shadcn**: consulte [instruments.md](references/instruments.md) para hardware, câmeras e efemérides, e [react-shadcn.md](references/react-shadcn.md) para contratos de tokens `--jh-*`, portals e build do registry.
5. **Revisão técnica e visual**: verifique a entrega contra [review.md](references/review.md), [visual-study.md](references/visual-study.md) e a documentação canônica em [design-system.md](docs/design-system.md).

## Recursos no Repositório

- Primitivos de UI, estilos e tokens de referência em [assets/ui](assets/ui)
- Especificação detalhada do Design System em [docs/design-system.md](docs/design-system.md)
- Guias focados por domínio em `references/` (todos linkados acima)
