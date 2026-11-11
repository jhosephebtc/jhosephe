# Shaders e luz procedural

Os componentes de `@paper-design/shaders-react` são uma opção para uma peça visual que realmente se beneficia de luz, gradiente ou textura procedural. Procure o efeito e a API na documentação da versão instalada: os parâmetros podem mudar. Para um degradê simples, CSS é suficiente.

## Hierarquia de degradação

1. Uma superfície CSS estática é o padrão e também a base renderizada no servidor.
2. Só monte o canvas quando o elemento estiver visível e a página ativa; evite criar um contexto por item em listas.
3. Desative a animação quando a aba estiver oculta e quando movimento reduzido estiver habilitado; prefira não montar o canvas quando cores forçadas ou transparência reduzida estiverem ativas.
4. Limite área e densidade de pixels com os parâmetros disponíveis na versão do pacote. Desmonte observers e listeners; trate falha de inicialização e perda de contexto deixando o CSS visível.
5. Conteúdo, foco e semântica vivem em HTML sobre a camada decorativa. O canvas é `aria-hidden` e não recebe eventos.

Não declare que o efeito é barato apenas por rodar em GPU. Meça uso de memória, consumo e quadros em aparelho real; grandes áreas translúcidas, filtros empilhados e múltiplos canvases podem custar caro. Desative movimento contínuo em interfaces de uso intenso se não trouxer informação.

## Direção de cor

Para reflexo mineral, misture branco frio, cinza suave e azul muito dessaturado, com baixo movimento e sem interferir nos textos. Para metal, prefira um pequeno detalhe estático ou um shader recortado ao objeto. Reserve gradações mais dramáticas para uma visualização ou capa.
