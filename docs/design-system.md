# Jhosephe UI — Design System (Light & Black/Dark)

Documentação técnica unificada da linguagem visual, tokens semânticos, escalas tipográficas, hierarquia tonal, relevos táteis, margens, espaçamentos, materiais e comportamento entre os temas **Light** (mineral claro) e **Black / Dark** (obsidiana monocromática).

---

## 1. Arquitetura de Temas & Geração

| Tema | Seletor CSS | `color-scheme` | Persistência (`localStorage`) | `<meta name="theme-color">` |
| --- | --- | --- | --- | --- |
| **Light** (padrão) | `:root` | `light` | `'jhosephe-theme' = 'light'` | `#fafafa` |
| **Black / Dark** | `:is([data-jh-theme="dark"], .dark)` | `dark` | `'jhosephe-theme' = 'dark'` | `#0a0a0a` |

- Controle de tema em runtime: [`examples/lab/src/theme.tsx`](../examples/lab/src/theme.tsx) (`applyJhosepheTheme`, `initJhosepheTheme`, `useJhosepheTheme`, `ThemeToggle`).
- Fonte única dos tokens base e de componentes: [`assets/ui/theme.css`](../assets/ui/theme.css).
- Gerador determinístico do tema escuro (`/* === JH_BLACK_THEME_START === */` ... `/* === JH_BLACK_THEME_END === */`): [`scripts/generate-dark-theme.mjs`](../scripts/generate-dark-theme.mjs).
- Alvos atualizados pelo gerador:
  - [`assets/ui/theme.css`](../assets/ui/theme.css) (`DARK_TOKENS` + `DARK_COMPONENT_POLISH`)
  - [`examples/lab/src/library/library.css`](../examples/lab/src/library/library.css) (`DARK_LIBRARY_POLISH`)
  - [`examples/lab/src/lab.css`](../examples/lab/src/lab.css) (`DARK_LAB_POLISH`)
  - [`examples/lab/src/solar/solar.css`](../examples/lab/src/solar/solar.css) (`DARK_SOLAR_POLISH`)

> A paleta estrutural de ambos os temas é estritamente acromática (`R = G = B` em RGB; `C = 0` em OKLCH). Cor cromática aparece exclusivamente como luz emissora opcional controlada pelo usuário (`OKLCH Palette`, `Spectrum Control`, `Slider`, `Dial`, `Bar Slider`, `Tactile Lever`, `Instrument`, `Audio Meter`).

---

## 2. Tons & Hierarquia de Superfícies (Light vs. Black/Dark)

### 2.1 Tokens Semânticos Base

| Token CSS | Light (`:root`) | Dark / Black (`[data-jh-theme="dark"], .dark`) | Papel na hierarquia |
| --- | --- | --- | --- |
| `--background` | `#f8f8f8` | `#060606` | Canvas principal da página / fundo base |
| `--foreground` | `#2e2e2e` | `#ededed` | Texto e ícones principais |
| `--card` / `--popover` / `--jh-popover` | `#ffffff` | `#0a0a0a` | Cartões, popovers, modais e menus |
| `--card-foreground` / `--popover-foreground` | `#2e2e2e` | `#ededed` | Texto em superfícies elevadas e overlays |
| `--primary` | `#9a9a9a` | `#4c4c4c` | Acento neutro primário |
| `--primary-foreground` | `#242424` | `#f2f2f2` | Conteúdo sobre elemento primário |
| `--secondary` | `#ebebeb` | `#0e0e0e` | Botões e ações secundárias |
| `--secondary-foreground` | `#2e2e2e` | `#ededed` | Conteúdo secundário |
| `--muted` | `#f5f5f5` | `#090909` | Superfície atenuada |
| `--muted-foreground` | `#6b6b6b` | `#8f8f8f` | Subtítulos, descrições e metadados |
| `--accent` | `#dadada` | `#121212` | Estado de realce / hover neutro |
| `--destructive` | `#525252` | `#9c9c9c` | Ênfase destrutiva acromática |
| `--border` | `#d6d6d6` | `rgb(255 255 255 / .014)` | Filetes estruturais (quando necessários) |
| `--input` | `#b0b0b0` | `#070707` | Campos de entrada |
| `--ring` / `--jh-ring` | `#525252` | `#383838` | Anel de foco (`:focus-visible`) |
| `--jh-divider` | `rgb(0 0 0 / .035)` | `rgb(255 255 255 / .018)` | Divisórias quase imperceptíveis |
| `::selection` | `bg: #dadada` / `fg: #2e2e2e` | `bg: #242424` / `fg: #f4f4f4` | Seleção de texto |

### 2.2 Escala de Tinta (Tipografia & Ícones)

| Token CSS | Light | Dark / Black | Uso |
| --- | --- | --- | --- |
| Texto primário | `#2e2e2e` | `#ededed` | Títulos, rótulos e valores principais |
| `--jh-text-secondary` | `#6b6b6b` | `#989898` | Subtítulos, descrições e instruções |
| `--jh-text-tertiary` | `#8c8c8c` | `#6e6e6e` | Notas auxiliares e unidades secundárias |
| `--jh-text-disabled` | `rgb(46 46 46 / .25)` | `rgb(237 237 237 / .28)` | Rótulos e controles desabilitados |
| `--jh-action-hover` / `--jh-action-pressed` | `#a4a4a4` / `#929292` | `#2c2c2c` / `#222222` | Estados neutros de ação |

### 2.3 Hierarquia Tonal por Camada no Tema Escuro (`Black`)

O tema escuro evita clareamento excessivo e mantém contraste sutil entre planos sólidos por luminância contida e sombras profundas:

| Camada | Valor | Comportamento / Observação |
| --- | --- | --- |
| **Canvas / Trilhos em baixo-relevo (Wells)** | `#060606` (plano, sem gradiente) | `.jh-segmented`, `.jh-tabs__list`, `.jh-slider__track`, `.jh-tactile-lever__track`, `.jh-progress__track`, `.jh-switch::before`, `.jh-dial__bed`, `--jh-surface-well`. Mais escuro que os cards (`#0a0a0a`). |
| **Campos de entrada (Inputs)** | `#070707` (repouso) → `#090909` (foco) | `.jh-input`, `.jh-search-input`, `.jh-currency-picker__trigger`, `.jh-financial-order__type-trigger`, `.jh-picker-overlay__search`, `.library-text-field`, `.library-search`. Superfície côncava plana (sem `background-image`). |
| **Palco de demonstração (Preview Stage)** | `#080808` | `.library-card-preview`, `.library-preview-stage`. Recuado discretamente atrás dos componentes Solid `#0a0a0a`. |
| **Cards, Modais, Pickers, Calendários & Scroll** | `#0a0a0a` | Padrão unificado para `.jh-scroll-frame`, `.jh-calendar`, `.jh-dialog`, `.jh-dialog__content`, `.jh-menu`, `.jh-context-menu`, `.jh-date-popover`, `.jh-date-time-popover`, `.jh-data-form`, `.jh-toast`, `.jh-weather`, `.jh-navigation-instrument`, `.jh-file-transfer`, `.jh-financial-chart`, `.jh-market-picker`, `.jh-currency-picker__popover`, `.jh-financial-order`, `.jh-astronomy`, `.jh-ephemeris-picker__panel`, `.jh-astrology-wheel`, `.jh-race-telemetry`, `.jh-metric-card`, `.jh-command-dialog`, `.jh-command-palette`, `.jh-accordion`, `.jh-picker-overlay`, `.library-customizer`, `.library-select-menu`, `.library-demo-switch`. |
| **Faces elevadas / Botões / Thumbs ativos** | `#0e0e0e` → `#0a0a0a` (ou `#0f0f0f` → `#0b0b0b`) | `--jh-surface-face`, `.jh-button__face`, `.jh-segmented__thumb`, `.jh-tabs__trigger[data-state="active"]`, `.jh-switch__thumb`, `.jh-glass-shape`. |
| **Scrim de Modais** | `rgb(0 0 0 / .74)` | `.jh-dialog-overlay`, `.jh-financial-order__backdrop` (`backdrop-filter` suave em blur). |

### 2.4 Tokens Específicos de Instrumentos (Dark)

- **Solar Observatory** (`--solar-*`): `--solar-glass-1: #0e0e0e`, `--solar-glass-2: #080808`, `--solar-glass-3: #0b0b0b`, `--solar-housing: #0a0a0a`, `--solar-edge-1..4: #161616 / #1c1c1c / #242424 / #161616`, `--solar-edge-spec: rgb(255 255 255 / .03)`, `--solar-curve: #b8b8b8`, `--solar-now: #5e5e5e`, `--solar-marker: #ececec`, `--solar-wing-fade: #000000` → `#060606`.
- **Astrology Wheel & Lunar Ephemeris**: `--jh-wheel-face-1/2: #101010 / #0a0a0a`, `--jh-wheel-well-1/2: #060606`, `--jh-lunar-bezel-1..3: #121212 / #0a0a0a / #0e0e0e`, `--jh-lunar-night-1..3: #0e0e0e / #090909 / #050505`, `--jh-lunar-lit-1..3: #d4d4d4 / #a6a6a6 / #6f6f6f`, `--jh-lunar-dome-hi: #ffffff`.

---

## 3. Relevo, Contornos & Sombras (Skeuomorfismo Silencioso)

A iluminação em ambos os temas parte de **luz superior contida**, evitando linhas externas pesadas (`border`) em favor de luz especular interna no topo e sombra de contato na base:

| Token | Light Mode | Dark Mode (`Black`) |
| --- | --- | --- |
| `--jh-depth-well` | `inset 0 1px 3px #0000000c, inset 0 0 0 1px #00000006, inset 0 -1px 1px #ffffffeb` | `inset 0 1px 2px rgb(0 0 0 / .52), inset 0 -1px 0 rgb(255 255 255 / .012)` |
| `--jh-depth-face` | `inset 0 1px 1px #ffffffed, inset 0 0 0 1px #ffffffad, 0 1px 3px -2px #00000018` | `inset 0 1px 0 rgb(255 255 255 / .02), inset 0 -1px 1px rgb(0 0 0 / .68), 0 3px 8px -2px rgb(0 0 0 / .92)` |
| `--jh-depth-contact` | `inset 0 1px 2px #0000000b, inset 0 0 0 1px #00000006, inset 0 -1px #ffffffd9` | `inset 0 1px 2px rgb(0 0 0 / .55), inset 0 -1px 0 rgb(255 255 255 / .012)` |
| `--jh-depth-panel` | `inset 0 1px #ffffffd9, 0 2px 8px -6px #00000016` | `inset 0 1px 0 rgb(255 255 255 / .016), 0 14px 32px -12px rgb(0 0 0 / .95)` |
| `--jh-shadow-control` | `0 1px 4px -1px rgb(40 40 40 / .035)` | `0 3px 8px -2px rgb(0 0 0 / .88)` |
| `--jh-shadow-surface` | `0 1px 6px -3px rgb(40 40 40 / .025), 0 4px 14px -6px rgb(40 40 40 / .02)` | `0 8px 24px -8px rgb(0 0 0 / .92), 0 18px 40px -14px rgb(0 0 0 / .86)` |
| `--jh-shadow-overlay` | `0 2px 8px -4px rgb(45 45 45 / .02), 0 6px 24px -8px rgb(45 45 45 / .018)` | `0 14px 36px -10px rgb(0 0 0 / .94), 0 26px 56px -14px rgb(0 0 0 / .9)` |
| `--jh-shadow-pressed` | `0 2px 10px -4px rgb(80 80 80 / .018)` | `0 1px 3px -1px rgb(0 0 0 / .9)` |

### Regras de Contorno no Tema Escuro

1. **Alto-relevo sutil**: contornos claros superiores permanecem entre `rgb(255 255 255 / .010)` e `.022` (`.015` nos painéis e cards, `.018`–`.02` em faces e botões), sem halos brancos artificiais.
2. **Baixo-relevo plano e sem gradiente**: cavidades (`.jh-segmented`, `.jh-tabs__list`, `.jh-input`, `.jh-search-input`, trilhos) usam cor sólida plana (`#060606` ou `#070707`, `background-image: none`) com sombra interna curta (`inset 0 1px 2px rgb(0 0 0 / .52)`) e filete inferior quase imperceptível (`rgb(255 255 255 / .012)`).
3. **Estudo de cantos contínuos (`SmoothCornerStudy`)**: usa face elevada `#0e0e0e → #0a0a0a`, traço especular `.library-demo-shape__specular` contido em `.018` (Solid) / `.038` (Glass/Liquid) e guias técnicas internas em `.045` / `.035`.

---

## 4. Tipografia (Geist Variable)

### 4.1 Família e Atributos Globais

- **Fonte única**: `'Geist Variable', system-ui, sans-serif` (`--jh-font`, via `@fontsource-variable/geist` — incluindo medições técnicas, labels, UI e blocos de código; **não usar fontes serifadas nem monoespaçadas**).
- **Renderização padrão**: `font-kerning: normal; font-optical-sizing: auto; font-synthesis: none; -webkit-font-smoothing: antialiased;`.
- **Números dinâmicos e instrumentos**: `font-variant-numeric: tabular-nums lining-nums` em readouts, eixos, sliders, tabelas e horários; números de botōes usam `lining-nums`.

### 4.2 Tokens Tipográficos Base (`assets/ui/theme.css`)

| Categoria | Token | Valor |
| --- | --- | --- |
| Tamanhos estáticos | `--jh-text-caption` | `.75rem` (`12px`) |
| | `--jh-text-body` | `.875rem` (`14px`) |
| | `--jh-text-heading` | `1.25rem` (`20px`) |
| Escala fluida de componentes | `--jh-type-meta` | `clamp(.6875rem, .66rem + .12vw, .75rem)` (`11px`–`12px`) |
| | `--jh-type-control` | `clamp(.8125rem, .78rem + .14vw, .875rem)` (`13px`–`14px`) |
| | `--jh-type-title` | `clamp(1.125rem, 1rem + .35vw, 1.25rem)` (`18px`–`20px`) |
| Entrelinhas (`line-height`) | `--jh-leading-body` | `1.5` |
| | `--jh-leading-heading` | `1.25` |
| Tracking (`letter-spacing`) | `--jh-tracking-body` | `0em` |
| | `--jh-tracking-heading` | `-.02em` |
| | `--jh-tracking-label` | `.06em` |

### 4.3 Escala Editorial, Componentes e Instrumentos

| Papel Visual | Tamanho | Peso | Entrelinha | Tracking | Onde aparece |
| --- | --- | --- | --- | --- | --- |
| Display Solar / Hero | `108px` (SVG) / `clamp(64px, 7.6vw, 112px)` (Lab) / `clamp(42px, 6.3vw, 78px)` (Library) | `350`–`500` | `0.98`–`1.06` | `-.02em` a `-.065em` | `.instrument__main`, `.intro h1`, `.library-hero h1` |
| Leitura de Deck / Output | `74px` (Deck) / `62px` (Instrument) / `clamp(28px, 5vw, 34px)` (Dial) | `340`–`450` | `1.0`–`1.2` | `-.04em` a `-.06em` | `.display__value output`, `.library-demo-instrument output`, `.library-demo-dial output` |
| Título de Página (Catalog/Detail) | `clamp(32px, 4vw, 48px)` | `470` | `1.15` | `-.055em` | `.library-page-heading h1` |
| Título de Dialog / Section | `24px` (Dialog) / `clamp(20px, 1.1rem + .35vw, 24px)` (Form) / `24px` (Section) | `450`–`500` | `1.2`–`1.3` | `-.025em` a `-.04em` | `.jh-dialog-title`, `.jh-data-form h2`, `.library-section-head h2` |
| Título Compacto / Card / Toast | `13px`–`19px` | `460`–`500` | `1.25`–`1.35` | `-.01em` a `-.03em` | `.library-card-copy h2` (`13px`), `.jh-toast__title` (`13–15px`) |
| Controles & Botões | `13px`–`14px` (`--jh-type-control`), `11px`–`12px` em controles de catálogo | `450`–`550` | `1.45` | `0em` | `.jh-button`, `.jh-input`, `.jh-search-input` |
| Eyebrows, Labels & Notas Técnicas | `8px`–`11px` (`--jh-type-meta`: `11px`–`12px`) | `450`–`500` | `1.3`–`1.7` | `.02em` a `.14em` | `.eyebrow`, `.library-eyebrow`, `.library-card-index`, `.solar-label` |

---

## 5. Espaçamento, Margens, Raios & Grids Responsivos

### 5.1 Ritmo de Espaçamento (Base 4px)

| Token CSS | Valor | Pixels equivalentes |
| --- | --- | --- |
| `--jh-space-1` | `.25rem` | `4px` |
| `--jh-space-2` | `.5rem` | `8px` |
| `--jh-space-3` | `.75rem` | `12px` |
| `--jh-space-4` | `1rem` | `16px` |
| `--jh-space-5` | `1.25rem` | `20px` |
| `--jh-space-6` | `1.5rem` | `24px` |
| `--jh-space-8` | `2rem` | `32px` |
| `--jh-space-10` | `2.5rem` | `40px` |
| `--jh-space-12` | `3rem` | `48px` |
| `--jh-space-page` | `clamp(1rem, 3vw, 2rem)` | `16px`–`32px` |
| `--jh-space-panel` | `clamp(1rem, 2.5vw, 1.5rem)` | `16px`–`24px` |

### 5.2 Margens, Containers & Padding por Contexto

- **Library (`/`, `/components/*`)**:
  - Header interno (`.library-header-inner`): altura `80px`, `max-width: 1536px`, `padding: 0 40px`, `gap: 64px` (reduz para `0 28px` em `<= 1200px` e `height: 68px; padding: 0 22px` em `<= 760px`).
  - Layout principal (`.library-layout`): `grid-template-columns: 224px minmax(0, 1fr)`, `max-width: 1440px`, `padding: 0 40px`, `gap: 56px`.
  - Sidebar (`.library-sidebar`): `position: sticky; top: 80px; height: calc(100vh - 80px); padding: 38px 24px 32px 0`.
  - Main (`.library-main`): `padding: 36px 0 72px` (`24px` topo em `<= 760px`).
  - Stage do playground (`.library-preview-stage`): `min-height: 380px` (`340px` em `<= 520px`), `padding: 22px 28px 24px`, `gap: 16px`, `border-radius: 20px`.
  - Customizer (`.library-customizer`): `padding: 22px 20px`, `border-radius: 18px`; margem entre campos `18px` (`.library-text-field`), controles slider `margin-top: 16px`, divisória da nota `margin-top: 28px; padding-top: 17px`.
  - Grade do catálogo (`.library-card-grid`): `3` colunas desktop (`column-gap: 22px; row-gap: 34px`) → `2` colunas em `<= 1200px` → `1` coluna em `<= 520px`.
- **Laboratory (`/lab`)**:
  - `.topbar` / `.footer`: `max-width: 1440px`, `padding: 0 5.5%`, altura mínima `92px`.
  - `.hero-grid`: `max-width: 1440px`, `padding: 78px 8.2% 110px`, `gap: clamp(44px, 7vw, 120px)`.
  - `.deck`: `padding: var(--jh-space-5)` (`20px`), `border-radius: 30px`; anel interno decorativo com `inset: 4px; border-radius: 26px`.
- **Solar Observatory (`/solar`)**:
  - `.solar-topbar`: `min-height: 88px`, `margin: 0 4.5%`.
  - `.solar-heading`: `max-width: 1320px`, `margin: 48px auto 0`, `padding: 0 32px`.
  - `.solar-instrument`: `width: min(1600px, 100%)`, `padding-bottom: 112px`.
  - `.solar-console`: `width: min(760px, calc(100% - 64px))`, `margin: -24px auto 0`, `padding: 20px 40px`.
  - `.solar-bottom`: `max-width: 1100px`, `padding: 0 32px`, `margin: 38px auto 0`.
- **Alvos táteis mínimos**:
  - Botões padrão / ícones: `min-height: 44px` (`44×44px` para ícone), variante pequena `min-height: 36px` (`padding: 0 16px`), controles de catálogo `min-height: 36px–38px`.

### 5.3 Raios Concêntricos & Superelipses

- Raio base do tema: `--radius: 1rem` (`16px`), painel `--jh-radius-panel: 1.25rem` (`20px`), subtrações `--radius-sm` (`-4px`), `--radius-md` (`-2px`), `--jh-radius-inset: max(.5rem, calc(var(--jh-radius-panel) - var(--jh-space-3)))`.
- Regra concêntrica de componentes (`--jh-corner-outer` / `--jh-corner-inset`):
  - `--jh-corner-inset: max(6px, calc(var(--jh-corner-outer) - var(--jh-space-panel, 24px) * .55))`.
- Suavização contínua (`SmoothShape` em [`assets/ui/smooth-shape.tsx`](../assets/ui/smooth-shape.tsx)): padrão de botão `radius={16}` (`12` em small) e `smoothing={0.6}` (60% via `figma-squircle`), mantendo foco e sombra no container pai sem recorte por `clip-path`.

### 5.4 Breakpoints Responsivos (`library.css`)

- `@media (min-width: 1500px)`: preview de cards sobe de `220px` para `245px`.
- `@media (max-width: 1200px)`: sidebar reduz para `190px`, grid do catálogo passa a `2` colunas, playground reduz customizer para `210px`.
- `@media (max-width: 1000px)`: playground empilha para `1` coluna com customizer em grid de `2` colunas.
- `@media (max-width: 760px)`: sidebar fixa ocultada, header reduzido para `68px`, menu mobile em `2` colunas ativo.
- `@media (max-width: 520px)`: grid passa para `1` coluna, paddings compactados e tipografia hero reduzida (`clamp(37px, 10vw, 50px)`).

---

## 6. Materiais (`data-jh-material`), Luzes OKLCH & Acessibilidade

### 6.1 Três Acabamentos Suportados

| Atributo / Classe | Comportamento Visual | Observação entre Temas |
| --- | --- | --- |
| `solid` (`.library-card-preview`, `[data-jh-material="solid"]`) | Superfície opaca sem `backdrop-filter`. Light: `#ffffff` / `#f7f7f7`; Dark: `#0a0a0a` (cards/modais) e `#0e0e0e → #0a0a0a` (botões/thumbs). | Base funcional obrigatória quando `prefers-reduced-transparency: reduce` está ativo. |
| `liquid-glass` | Vidro fosco translúcido com `backdrop-filter: blur(...) saturate(...)`. Light: `rgb(255 255 255 / .772)`–`.952`; Dark atual: `rgb(10 10 10 / .84)`–`.95` + `.jh-glass-shape` em `rgb(12 12 12 / .82)`. | Preserva o mesmo posicionamento cromático do Solid, preparando a camada translúcida. |
| `liquid` | Camada especular com `backdrop-filter` ampliado e ponto de luz dinâmico (`--jh-press-x`, `--jh-press-y` no `Button` quando `data-liquid="true"`). | Clique usa compressão sutil sem alterar bruscamente a cor da face. |

### 6.2 Luzes Emissoras OKLCH (Semitransparentes)

Controles com indicador luminoso (`Slider`, `Dial`, `Bar Slider`, `Tactile Lever`, `Instrument`, `Audio Meter`) usam variáveis OKLCH com mistura transparente (`color-mix(in oklch, ...)`):
- Variáveis: `--jh-slider-accent-color` (padrão `oklch(100% 0 0)`), `--jh-slider-accent-color-end`, `--jh-bar-cell-accent`, `--jh-slider-glow-color`, `--jh-slider-glow-strength` (`68%`), `--jh-slider-glow-strength-mid` (`42%`), `--jh-slider-glow-strength-edge` (`20%`), `--jh-slider-glow-blur` (`5px`).
- Suporte a modo gradiente (`data-accent-gradient="true"`) entre cor inicial e final sem opacidade chapada (`70%–76%` de mistura transparente + halo discreto no tema escuro).

### 6.3 Scrollbars (Dark Mode) & Preferências de Acessibilidade

- **Scrollbars Dark**: pista transparente (`transparent`), thumb `9px` arredondado (`border-radius: 99px`) com `border: 2.5px solid transparent; background: #282828 padding-box` (`#3d3d3d` no hover), e `::-webkit-scrollbar-button { display: none; width: 0; height: 0; }` em toda a página e em `.jh-scroll-frame` / sidebars para eliminar setas nativas do sistema operacional. Fallback para Firefox/não-WebKit via `scrollbar-width: thin; scrollbar-color: #2b2b2b transparent;`.
- **Acessibilidade**:
  - `:focus-visible`: `outline: 3px solid var(--ring); outline-offset: 3px` no tema global (anéis ajustados para inputs/thumbs sem recorte pelo `clip-path`).
  - `@media (prefers-reduced-motion: reduce)`: remove animações de entrada, pulso contínuo e transições.
  - `@media (prefers-reduced-transparency: reduce)` & `@media (forced-colors: active)`: garantem degradação para superfícies opacas legíveis (`Canvas`, `CanvasText`, `Highlight`).
