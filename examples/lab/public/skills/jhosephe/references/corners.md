# Cantos contínuos

Raio determina o tamanho da curva; suavização determina a transição entre a linha reta e a curva. Use 60% como referência inicial para componentes arredondados desta linguagem. Uma superelipse amostrada, um canto contínuo de Figma e `corner-shape: squircle` são aproximações diferentes: não afirme paridade exata sem comparar geometria e renderização.

## Escolha da técnica

1. Se um arredondamento comum atende, use `border-radius`: tem ótimo suporte e acompanha sombra e foco.
2. Se o formato precisa do valor de smoothing, gere um path para as dimensões reais. O pacote `figma-squircle` recebe `cornerRadius` e `cornerSmoothing` de 0 a 1; 60% corresponde a `0.6`. Verifique a versão e os termos da dependência.
3. Para superfícies responsivas, meça o border box com `ResizeObserver`, regenere apenas ao mudar as dimensões e remova o observer no unmount. Com SSR e antes da medição, use `border-radius`.
4. `corner-shape` é um aprimoramento progressivo, não uma equivalência comprovada do percentual pedido. Confira suporte da matriz do produto.

## Invariantes

- Raio limitado a `min(width, height) / 2`; dimensões não finitas ou não positivas não geram path.
- O clipping afeta apenas a face decorativa; mantenha sombra e `:focus-visible` no elemento externo, sem recorte.
- IDs de SVG devem ser únicos por instância, incluindo listas e renderização no servidor.
- Caminhos de dimensões fixas não se adaptam automaticamente ao redimensionamento. Evite esticar um `path()` antigo.
- Com zoom, raio máximo, retângulo estreito, dimensões zero, SSR e lista longa, verifique custo e integridade do formato.
- Não faça valores animados de smoothing dispararem renderizações de toda a árvore por frame.

O componente de referência em `assets/ui/smooth-shape.tsx` dá forma a uma face decorativa e preserva o fallback CSS. Se a geometria for parte do conteúdo em vez de decoração, adapte sem esconder informação acessível.
