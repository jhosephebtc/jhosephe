# Revisão da base clara

A base anterior foi consultada sem alteração. A varredura de arquivos em `src/`, `components/` e `lib/` identificou 700 arquivos no inventário e 345 com alguma ocorrência de padrões relacionados a tema claro, vidro, transição ou preferências de acessibilidade. Foi uma busca textual ampla: uma ocorrência não equivale automaticamente a um problema.

## Achados que orientam a jhosephe

| Aspecto | Evidência consultada | Decisão para a nova skill |
| --- | --- | --- |
| Tons claros | `src/styles/themes.css`, `src/styles/theme-variants.css` | A base do tema possui uma paleta clara; variantes e overrides podem mudar os valores efetivos. Criar tokens semânticos próprios e medir o resultado. |
| Sombras | `src/styles/theme-variants.css` e `src/ui/theme/shadows.ts` | Os tokens genéricos podem ser `none`; a interface clara do estúdio define sombras muito suaves para controle, superfície, sobreposição e pressão. A jhosephe registra essa hierarquia em `assets/ui/theme.css`. |
| Cantos | `src/ui/utils/superellipse.ts`, `src/ui/components/Squircle.tsx` | A base usa path medido por elemento, raio limitado e fallback. A nova implementação usa um gerador explícito e mantém o foco fora da face recortada. Técnicas distintas não são consideradas pixel-idênticas. |
| Interações | `src/ui/theme/interaction-tokens.js`, `src/styles/interactions.css` | Retomar feedback imediato, tamanhos de controle, hover condicionado ao ponteiro e movimento reduzido. |
| Foco | `src/styles/interactions.css`, `src/ui/useInputModality.ts` | Há restauração específica de foco de teclado e regras que removem outline em outros casos. O novo pacote oferece foco visível próprio; qualquer hipótese sobre a base antiga exigiria reprodução no navegador. |
| Sobrecamadas | `src/ui/components/ModalShadowManager.tsx` | Não duplicar sombra exterior em superfícies sobrepostas. Preferir composição clara de camada em componentes novos. |

A busca local também encontrou padrões como `transition: all` em arquivos de estilos e código. Esses resultados são apenas candidatos para uma revisão futura, pois seletor, escopo e cascata determinam se uma ocorrência afeta a UI clara. Não houve teste visual de todas as telas, nem medição de desempenho do projeto anterior.

## Limite

Essa revisão embasou a skill e o laboratório independentes; ela não modifica a interface anterior e não substitui uma auditoria de acessibilidade ou de desempenho em dispositivos reais.
