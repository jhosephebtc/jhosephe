# Instrumentos, SVG e microinterações

## Visual

Use escalas de linhas finas, indicadores de barra, marcadores e valores como instrumentos: um número principal claro, unidade próxima e linhas secundárias discretas. A geometria e o espaçamento criam ritmo; não reduza texto importante a uma textura. Em dados reais, preserve zero, negativos, unidade e domínio de escala. Uma barra não deve sugerir que um limite é zero ou 100 quando não é.

Uma ilustração editorial pode combinar pontos, linhas, tipografia sans-serif com números tabulares, padrões ASCII e blocos. Identifique-a como decoração quando não carregar dados. Nunca anime uma métrica financeira para inventar valores, atrasar o valor real ou sugerir trabalho que não está acontecendo.

## SVG com propósito

- `viewBox` estável; `vector-effect: non-scaling-stroke` quando a espessura precisa permanecer constante. Defina comportamento para tamanhos pequenos.
- Para revelar uma linha, use `pathLength="1"`, `stroke-dasharray="1"` e altere `stroke-dashoffset`; o estado final deve existir sem animação.
- Para uma escala de barras, mantenha o comprimento máximo fixo e altere a aparência das barras preenchidas. Estabilize o tamanho do valor numérico.
- Interação pequena: enfatize o marcador ou iconografia, não toda a tela. A escala funcional tem alternativa acessível em texto e controle semântico.
- SVG decorativo recebe `aria-hidden="true"` e `focusable="false"`. Um gráfico significativo precisa de nome e alternativa textual/tabela, de acordo com sua complexidade.
- Em movimento reduzido, mostre imediatamente o valor e o desenho final. Não deixe o gráfico desaparecer porque o traço começou com offset oculto.
- Para dados atualizados, preserve a precisão: a informação textual muda na hora; uma transição visual breve e interrompível é opcional.

## Receita de microinteração

1. Uma ação mostra feedback local na pressão.
2. Na confirmação, o ícone ou rótulo muda para um estado inteligível sem bloquear nova ação.
3. Um indicador visual acompanha a ação, sempre com dados verdadeiros.
4. Ao falhar, uma mensagem persistente e acionável substitui uma animação de sucesso.

Não recrie literalmente uma marca, dashboard ou obra de referência; traduza a intenção em padrões próprios.
