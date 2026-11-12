# Glass, liquid glass e skeuomorfismo

## Vocabulário

| Material | Face | Profundidade | Uso |
| --- | --- | --- | --- |
| Mineral claro | branco ou cinza claro, cobertura alta | sombra de contato tênue | conteúdo e formulários |
| Glass | vidro neutro translúcido com texto protegido | brilho interior estreito, lente e sombra suave | puxadores rígidos dos sliders e superfícies flutuantes |
| Liquid glass | vidro que responde ao toque | reflexo local, compressão mínima, retorno contínuo | feedback pontual em botões |
| Relevo skeuomórfico | planos claros encaixados | rebaixo, volume e iluminação coerente | dial, puxador e objeto manipulável |

Não use metal, cromado, alumínio ou Liquid Metal, nem como acabamento. A identidade se apoia em vidro e relevo. O tema inteiro permanece claro, inclusive visor, moldura, base e fundos. Preto/grafite é tinta para a informação.

## Controles e ícones

Switches usam um canal claro de vidro, arredondado e simples, com respiro em volta. O thumb pequeno e macio percorre um curso curto; posição e semântica deixam o estado claro. Evite o canal escuro com esfera branca e detalhes decorativos no thumb.

Ícones são planos, suaves e semitransparentes. Não aplique baixo-relevo, drop shadow ou contorno sombreado. Mantenha SVG nítido, reconhecível e com contraste suficiente; a opacidade não deve fazer um ícone ativo parecer desabilitado.

## Luz e sombras

Uma luz dominante vinda do alto organiza a cena. Diferencie sombra de contato curta de sombra ambiental larga e fraca. Os tokens `--jh-shadow-control`, `--jh-shadow-surface`, `--jh-shadow-overlay` e `--jh-shadow-pressed` em `assets/ui/theme.css` preservam as sombras discretas da base clara consultada. Dê maior curso apenas a peças realmente manipuláveis. Não recorte o foco com o material.

## Separação quase invisível

Separe áreas com espaçamento, profundidade do plano e sombra suave. Evite enquadrar cada seção com uma linha. Se uma divisória for necessária, use `--jh-divider` como ponto de partida: preto com 3,5% de opacidade sobre fundo claro, acompanhado quando fizer sentido de brilho branco interno. Ajuste pela percepção no tamanho real, sem transformar esse valor em contraste obrigatório.

Um rebaixo pode usar `inset 0 1px 3px rgb(0 0 0 / .025)` e um brilho inferior branco. Uma superfície elevada pode usar a sombra de superfície do tema. Não acumule sombras em wrappers consecutivos. A regra de discrição aplica-se a divisórias decorativas; foco, textos, escalas de dados e limites necessários para reconhecer um controle devem continuar legíveis.

## Glass confiável

1. Comece com uma face clara opaca legível. Use `backdrop-filter` como melhoria progressiva em área pequena e com algo neutro atrás que torne a transparência perceptível.
2. Brilho de borda fica por dentro e não altera o tamanho da caixa. Evite molduras marcadas, brilho intenso ou sucessivas camadas de blur.
3. Meça contraste sobre os fundos reais permitidos; dê tinta suficiente à face. Não deforme texto, ícones, foco ou área clicável.
4. Sem blur, com transparência reduzida ou em cores forçadas, preserve uma face sólida e a operação completa.

## Resposta liquid

`Button` usa variantes semânticas primary, secondary e ghost. A resposta começa no pointerdown, mas a ação confirma em click/ativação semântica. Um reflexo nasce no ponto do toque e a face comprime levemente, com retorno amortecido e sem bounce recorrente. Isso é uma aproximação visual em CSS, não refração física.

No slider, use uma trilha com largura suficiente para ser encontrada e rebaixo raso. O puxador é vidro fosco translúcido, com luz interior e sombras de contato muito curtas. A parte percorrida é branca semitransparente, levemente desfocada, com um brilho contido. Durante o arraste, o valor acompanha o ponteiro diretamente; o puxador não expande, deforma nem fica elástico. Teclado, foco e área de interação de 44px continuam ativos.

Campos de texto usam uma superfície clara sutilmente côncava, sem borda escura. No foco, clareie a face e adicione uma marca interna de baixa intensidade; preserve um indicador visível para navegação por teclado. Menus de escolha abrem em uma superfície glass com seleção e realce coerentes com os componentes.

O pacote opcional `liquid-glass` pode ser investigado para refração especializada. Confira a API e o suporte da versão escolhida; não é uma dependência do exemplo. SVG/WebGL são melhorias opcionais. A ação, a legibilidade e a sensação de volume devem sobreviver sem eles. Movimento reduzido remove deformação e movimento contínuo, preservando a confirmação de estado.
