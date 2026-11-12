# React, CSS e shadcn/ui

## Adoção

Leia as convenções locais antes de instalar bibliotecas. Em uma aplicação shadcn/ui existente, mapeie os papéis visuais para os tokens semânticos já utilizados (`background`, `foreground`, `card`, `primary`, `muted`, `border`, `ring` e pares de foreground). Mantenha esses papéis em branco, cinza neutro e preto, inclusive primary, destructive e ring; expresse o significado do estado também em texto e ícone. Adapte a sintaxe de cor e o Tailwind à versão do projeto. Evite substituir toda a folha de tema ou impor uma fonte quando o usuário especificar outra.

Para projeto novo use Geist Sans. Em ambiente Vite, os pacotes de fonte variável podem ser importados como CSS local; em ambientes com carregador de fontes próprio, use o mecanismo do framework. Mantenha fallback do sistema, `font-kerning: normal` e tokens tipográficos por papel. Use [Tipografia e layout](typography-layout.md) para tracking, entrelinha, spacing e grids. O laboratório é um exemplo, não um requisito para uso da skill.

## Primitivas reutilizáveis

Os arquivos em `assets/ui` foram pensados para cópia e adaptação: as faces e tokens são separados dos controles semânticos. Instale as dependências que os arquivos escolhidos realmente importam; não copie `node_modules`. Componentes de formulário e sobreposição se beneficiam de primitivas que já oferecem teclado, foco e ARIA.

- `button`: botão nativo glass com variantes semânticas e feedback liquid, foco fora da superfície e conteúdo em fluxo normal.
- `smooth-shape`: path responsivo decorativo, com fallback por raio.
- `slider` e `switch`: valor exposto para tecnologias assistivas; rótulo visível associado. Slider usa puxador sólido de vidro, sem deformação liquid.
- `dialog`: foco preso no diálogo, Escape, título acessível e retorno de foco ao gatilho.
- `dial`: se representar um valor contínuo, preserve orientação por teclado e alternativa semântica de slider. Não transforme valores em falsos botões.
- `instrument`: valor em texto; SVG opcionalmente decorativo.

## Acessibilidade e integração

O rótulo descreve a ação, não o material. Desabilitado significa indisponível; não simule desabilitado apenas com opacidade. Ícone sem texto precisa de nome acessível. Área de toque confortável, foco visível, navegação com teclado, rótulos de campos, zoom e contraste são parte do componente.

`prefers-reduced-transparency`, `forced-colors` e `prefers-reduced-motion` são complementares. Preserve um fallback sólido quando filtros não são suportados e não assuma que `corner-shape` funciona em todos os browsers. Não esconda informações dentro de pseudo-elementos ou texturas.

Se gerar componentes shadcn por CLI, valide o arquivo de configuração, alias de caminho, versão e temas do projeto real. Não execute geradores destrutivos sobre arquivos existentes sem verificar colisões.


## Catálogo instalável

O catálogo em `/components` usa os mesmos 17 componentes de `assets/ui`. `npm run registry:build` gera `/r/<id>.json` com código completo, CSS com prefixo jh e dependências explícitas. O registro não deve instalar resets globais nem trocar o tema da aplicação hospedeira. Verifique uma instalação real com CLI e compilação, além da validade JSON. Menus e notificações incluem o botão usado no exemplo. Calendários respeitam teclado e seleção; formulários usam validação nativa e feedback de operação real.
