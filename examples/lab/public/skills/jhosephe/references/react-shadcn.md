# React, CSS e shadcn/ui

## Adoção e arquitetura dual de temas

Leia as convenções locais antes de instalar dependências. Em uma aplicação shadcn/ui existente, mapeie os tokens semânticos (`--background`, `--foreground`, `--card`, `--popover`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`) para a dupla paleta acromática do sistema:

- **Light Porcelain (`:root`)**: canvas `#f8f8f8`, superfícies elevadas `#ffffff`, texto `#2e2e2e`, cavidades `#eeeeee`–`#f1f1f1`, foco `#525252`.
- **Black / Dark Obsidian (`:is([data-jh-theme="dark"], .dark)`)**: canvas e cavidades `#060606`, inputs `#070707` (foco `#090909`), superfícies elevadas `#0a0a0a`, faces manipuláveis `#0e0e0e` → `#0a0a0a`, texto `#ededed`, foco `#383838`.

O gerador determinístico [`scripts/generate-dark-theme.mjs`](../scripts/generate-dark-theme.mjs) mantém o bloco dark sincronizado com os estilos claros em `assets/ui/theme.css` e nos estilos do laboratório. Ao incorporar componentes via registry, todos os estilos distribuídos usam classes e tokens prefixados em `--jh-*` / `.jh-*`, sem aplicar resets globais nem sobrescrever `body` da aplicação hospedeira.

Use `'Geist Variable', system-ui, sans-serif` (`@fontsource-variable/geist`) em toda a interface, inclusive números de instrumentos, tabelas e blocos de código, mantendo `font-kerning: normal` e `tabular-nums lining-nums` em leituras numéricas. Consulte [Tipografia e layout](typography-layout.md) para escalas, tracking e grids.

## Primitivas reutilizáveis e contratos

Os arquivos em `assets/ui` são independentes e copiáveis via CLI ou manualmente (preservando imports relativos e dependências declaradas):

- **`button`**: botão tátil (`primary | secondary | ghost | working`) com `SmoothShape` contínuo, `--jh-press-x/y` para resposta liquid sem mudança de cor no clique, estado `loading`/`loadingLabel` (`aria-busy="true"`), e foco externo à face.
- **`smooth-shape`**: path superelíptico via `figma-squircle` (`radius`, `smoothing = 0.6`) com `ResizeObserver` e fallback `border-radius`.
- **`slider`, `bar-slider`, `tactile-lever`, `switch`**: controles Radix UI com puxadores rígidos de vidro, emissores OKLCH confinados (`accentColor`, `accentColorEnd`, `accentGradient`, `glowIntensity`, `glowBlur`) e suporte completo a teclado.
- **`dial`, `detent-dial`**: seletores rotativos (`classic | arc | vernier | monolith` no `Dial`) com cálculo angular absoluto do ponteiro, setor inferior morto explícito, emissão confinada em canaletas orbitais e `<input type="range">` acessível por teclado.
- **`simple-scroll`, `accordion-scroll`, `scroll-area`, `vertical-gallery`**: compartilham a arquitetura `.jh-scroll-frame > .jh-scroll-area` (elevação única no frame externo, scrollbar fina sem setas de `7px`, revelação progressiva por interseção via `useScrollItemReveal`). `VerticalGallery` exibe grade `4 × 12` com seletor de proporção inline (`1:1 | 3:4 | 4:5 | 9:16 | 16:9`) e tiles elevados não-rebaixados.
- **`dialog`, `menu`, `context-menu`, `command-palette`, `picker-panel`, `combobox`**: superfícies sobrepostas com gerenciamento de foco, `Escape` e posicionamento seguro.
- **`shader-surface`**: `MeshGradient` acromático lazy-loaded com WebGL2 (`LIGHT_COLORS` e `DARK_COLORS` dinâmicos conforme `data-jh-theme` / `.dark`) e degradação automática para CSS estático sob `prefers-reduced-motion`, `prefers-reduced-transparency`, `forced-colors` ou ausência de WebGL2.

### Transparência contínua e propagação em portais

Para personalizar translucidez e desfoque de superfícies em runtime sem degradar sombras ou legibilidade:

1. Aplique `data-jh-surface-custom="true"` junto das variáveis CSS `--jh-surface-alpha` (`(100 - transparency) / 100`, para `transparency` de `0` a `85`) e `--jh-surface-blur` (`0px` a `32px`) no wrapper do componente.
2. Quando o controle for aplicado em playgrounds ou no nível da página, sincronize `data-jh-surface-custom`, `--jh-surface-alpha` e `--jh-surface-blur` em `document.documentElement` dentro de `useEffect` (limpando no unmount ou quando ambos retornam a `0`) para que overlays portados (`Dialog`, `Menu`, `Popover`, `PickerPanel`, `CommandPalette`, `FinancialOrderModal`) recebam os mesmos valores.
3. Combine superfícies translúcidas com `<ShaderSurface />` atrás do palco para manter profundidade perceptível sem alterar `box-shadow`, `color` de texto ou ícones SVG.

## Acessibilidade e integração

- O rótulo descreve a função do controle, nunca o material; ícones sem texto visível exigem `aria-label`.
- `prefers-reduced-transparency`, `prefers-reduced-motion` e `forced-colors` são tratados diretamente em CSS e JS (`ShaderSurface`, transições, fallbacks opacos).
- Controles compostos (`DataTable`, `Tabs`, `Accordion`, `CommandPalette`, `Combobox`, `Calendar`, `DateTimePicker`) implementam navegação por teclado, `aria-sort`, `aria-selected`, `aria-expanded` e retorno de foco.
- Valide `components.json` e aliases (`@/components/jhosephe/...`) antes de executar a CLI shadcn sobre um projeto existente.

## Catálogo instalável e Registry público (64 componentes)

O catálogo em `/components` reúne **64 componentes** (`8` primitivas base em `examples/lab/src/library/data.ts` + `56` componentes estendidos em `examples/lab/src/library/extra-data.ts`), organizados em 9 categorias (`Controls`, `Surfaces`, `Instruments`, `Inputs`, `Navigation`, `Feedback`, `Finance`, `Astronomy`, `Weather`). Todos os 64 itens são empacotados por `npm run registry:build` (`scripts/build-registry.mjs`) em `/r/<id>.json` e indexados em `/registry.json`:

```sh
npx shadcn@latest add https://jhosephe.vercel.app/r/button.json
```

Além das primitivas essenciais, o registro inclui:
- **Scroll & Galerias**: `scroll-area`, `simple-scroll`, `accordion-scroll`, `vertical-gallery`, `gallery`, `image-frame`, `filmstrip-gallery`, `image-inspector`.
- **Hardware Tátil & Ótica**: `tactile-key`, `tactile-keypad`, `tactile-console`, `camera-wheel`, `camera-dial`.
- **Aplicação & Dados**: `combobox`, `tabs`, `data-table`, `command-palette`, `metric-card`, `accordion`, `step-navigation`, `progress-bar`, `file-transfer`, `data-form`.
- **Finanças**: `financial-chart`, `market-picker`, `currency-picker`, `financial-order-modal`, `finance-navigation`.
- **Astronomia, Clima & Telemetria**: `astronomy-instrument`, `ephemeris-picker`, `astrology-wheel`, `lunar-ephemeris`, `weather-conditions`, `wind-instrument`, `tide-instrument`, `weather-instrument`, `compass`, `attitude-indicator`, `navigation-instrument`, `race-telemetry`.
