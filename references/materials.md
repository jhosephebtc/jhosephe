# Materiais, transparência contínua, luz OKLCH e skeuomorfismo

## Vocabulário de superfícies

| Camada | Comportamento em Light | Comportamento em Black / Dark | Uso |
| --- | --- | --- | --- |
| **Canvas & Cavidades (Wells)** | `#f8f8f8` / `#eeeeee`–`#f1f1f1` | `#060606` plano (inputs `#070707`) | Fundos base, trilhos, leitos de dial, campos de entrada e bandejas segmentadas |
| **Superfícies elevadas (Cards / Overlays)** | `#ffffff` / `#f7f7f7` | `#0a0a0a` | Cartões, painéis, modais, menus, pickers, `.jh-scroll-frame`, instrumentos |
| **Faces manipuláveis (Controls / Thumbs)** | `#f7f7f7` / `#ffffff → #efefef` | `#0e0e0e → #0a0a0a` | Botões, puxadores rígidos de sliders, thumbs de switches e teclas |
| **Vidro translúcido contínuo** | `rgb(255 255 255 / var(--jh-surface-alpha))` + blur | `rgb(10 10 10 / var(--jh-surface-alpha))` + blur | Qualquer superfície sob `[data-jh-surface-custom="true"]` com transparência e desfoque calibrados pelo usuário |
| **Resposta liquid em botões** | Reflexo pontual `--jh-press-x/y` + afundamento uniforme | Reflexo especular contido + afundamento uniforme | Feedback tátil de clique em `Button` sem alterar a cor da face |
| **Relevo skeuomórfico** | Luz superior contida + sombra curta | Luz especular mínima (`.010–.022`) + sombra profunda | Dials, chaves mecânicas, alavancas, torres ópticas e molduras |

Não use metal, cromado, alumínio brilhante ou Liquid Metal, nem em detalhes decorativos. Os dois temas permanecem integralmente acromáticos em sua estrutura e dependem de contraste tonal, luz superior contida e profundidade física.

## Sistema contínuo de transparência e backdrop blur

Em vez de alternar presets discretos (`Solid | Glass | Liquid`) no customizador, a linguagem expõe dois parâmetros contínuos que modulam qualquer superfície de forma previsível nos temas **Light** e **Black / Dark**:

- **Transparency (`0–85%`, padrão `0%`)**: mapeado para `--jh-surface-alpha`, calculado como `(100 - transparency) / 100` (variando de `1` totalmente opaco até `0.15` translúcido).
- **Blur (`0–32px`, padrão `0px`)**: mapeado para `--jh-surface-blur: <valor>px` aplicado via `backdrop-filter: blur(var(--jh-surface-blur, 0px))`.

### Contrato CSS (`[data-jh-surface-custom="true"]`)

1. **Escopo estrito na camada de fundo**: `[data-jh-surface-custom="true"]` ajusta **exclusivamente** o canal alfa do fundo da superfície (`rgb(255 255 255 / var(--jh-surface-alpha, 1))` / `rgb(247 247 247 / var(--jh-surface-alpha, 1))` no Light; `rgb(10 10 10 / var(--jh-surface-alpha, 1))` / `rgb(14 14 14 / var(--jh-surface-alpha, 1))` no Dark; cavidades proporcionais com `rgb(238 238 238 / var(--jh-surface-alpha, 1))` e `rgb(6 6 6 / var(--jh-surface-alpha, 1))`, removendo `background-image` opacos) e `backdrop-filter: blur(var(--jh-surface-blur, 0px))`.
2. **Proteção absoluta de sombras, texto e ícones**: **NUNCA** use `opacity` no elemento raiz nem `filter: blur(...)` no componente. **NUNCA** atenue, desfoque ou degrade `box-shadow` externo de elevação, `color` tipográfico, leituras numéricas, ícones SVG ou miniaturas fotográficas (`.jh-vertical-gallery__item` e espécimes permanecem 100% nítidos e opacos).
3. **Propagação para portais**: quando customizado no nível de playground ou tema global, aplique `data-jh-surface-custom="true"`, `--jh-surface-alpha` e `--jh-surface-blur` também em `document.documentElement`, garantindo que superfícies renderizadas fora da árvore via React/Radix Portal (`Dialog`, `Menu`, `Popover`, `PickerPanel`, `CommandPalette`, `FinancialOrderModal`) herdem exatamente os mesmos valores.
4. **Camada neutra atrás do vidro**: sempre que `surfaceTransparency > 0 || surfaceBlur > 0`, posicione um plano acromático com luz sutil atrás do componente (`<ShaderSurface />`) para que transparência e difusão sejam perceptíveis sem contaminação cromática.
5. **Degradação acessível**: sob `@media (prefers-reduced-transparency: reduce)`, ausência de suporte a `backdrop-filter` ou `@media (forced-colors: active)`, restaure superfícies sólidas opacas e operação integral.

## Luzes emissoras OKLCH e confinamento físico

Controles emissivos (`Dial`, `DetentDial`, `Slider`, `BarSlider`, `TactileLever`, `InstrumentBars`, `AudioMeter`, `TactileKey`, `TactileKeypad`, `TactileConsole`, `CameraWheel`, `CameraDial`, `FilmstripGallery` e `LunarEphemeris`) seguem duas invariantes físicas nos dois temas:

- **Confinamento em baixo-relevo**: todo emissor habita um canal, fenda ou poço recuado (`overflow: hidden`, máscaras `<mask>`/`<clipPath>` nas ranhuras orbitais `.jh-dial__trough` e `.jh-lunar-ephemeris__trough`, poços `.jh-instrument__well` / `.jh-audio-meter__segments`, fendas `.jh-dial__mark::after` e pinholes de teclas), sempre abaixo de puxadores e faces (`z-index` inferior), sem vazar halo no fundo externo.
- **Standby em repouso vs. Emissão ativa**: em repouso, luzes de marcação e LEDs permanecem em standby suave (`opacity: .64–.72`); durante arraste (`[data-dragging="true"]`), pressão (`:active`) ou estado armado (`[data-pressed="true"]`), o emissor assume preenchimento OKLCH intenso e brilho interno estritamente contido.

## Controles, botões liquid e separação por relevo

- **Botões (`Button`)**: variantes `primary`, `secondary`, `ghost` e `working` (`loading` / `loadingLabel` com spinner acromático inline, `aria-busy="true"` e proteção contra duplo clique). A face elevada espelha o thumb do `SegmentedControl`, porém sem canal em baixo-relevo ao redor. Hover produz elevação quase imperceptível; **o clique (`:active`) nunca muda a cor da face** — responde apenas por afundamento curto e uniforme (`translateY(1px) scale(.985)`), compressão sutil da sombra externa e onda especular local (`--jh-press-x`, `--jh-press-y`) quando `liquid={true}`. Botões `ghost` permanecem sem fundo e sem sombra em repouso, hover e clique.
- **Sliders (`Slider`, `BarSlider`, `TactileLever`)**: puxador rígido de vidro com luz interior e sombra de contato curta; sem deformação liquid, squash ou elasticidade durante o arraste. Teclado e alvo mínimo de 44px permanecem ativos.
- **Switches e Ícones**: switches usam canal arredondado limpo com respiro ao redor e thumb de vidro proporcional. Ícones são planos, nítidos e suaves, sem baixo-relevo, `drop-shadow` ou contorno sombreado.
- **Campos de texto e Menus**: inputs usam superfície côncava sutil (`#f1f1f1` no Light; `#070707` no Dark) sem anéis escuros no foco; menus e comboboxes compartilham a mesma superfície elevada e respondem a `--jh-surface-alpha` / `--jh-surface-blur`.
- **Separação quase invisível**: prefira respiro, planos e `--jh-divider` (`rgb(0 0 0 / .035)` no Light; `rgb(255 255 255 / .018)` no Dark). Nunca acumule sombras de card dentro de outro card: containers como `AccordionScroll`, `VerticalGallery` e `PickerPanel` mantêm elevação única no `.jh-scroll-frame` ou painel externo.

## Scrollbars unificadas (`.jh-scroll-frame > .jh-scroll-area`)

`SimpleScroll`, `AccordionScroll`, `ScrollArea` e `VerticalGallery` compartilham exatamente o mesmo contrato de rolagem vertical nos dois temas:

- Um único invólucro elevado `.jh-scroll-frame` envolvendo `.jh-scroll-area` transparente (`box-shadow: none`), eliminando elevação duplicada.
- Barra fina de `7px` com thumb arredondado (`border-radius: 99px`), pista transparente e `::-webkit-scrollbar-button { display: none; width: 0; height: 0; }` (sem setas nativas).
- Revelação progressiva de borda via `useScrollItemReveal` / `syncScrollItemVisibility`, evitando corte abrupto de linhas ou miniaturas junto às extremidades.
