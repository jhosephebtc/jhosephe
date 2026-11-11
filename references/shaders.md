# Shaders para luz e vidro

`@paper-design/shaders-react` fornece luz procedural localizada. Na identidade jhosephe, use o shader para enriquecer o vidro e manter a base clara; não use Liquid Metal, materiais cromados ou reflexos metálicos. Para degradê simples, CSS basta.

## Receita do pacote

`ShaderSurface` usa MeshGradient com `#dedede`, `#f6f6f6`, `#c8c8c8` e `#f1f1f1`, velocidade baixa e ruído mínimo. A camada permanece decorativa, sem receber eventos. O vidro e a ação são HTML/CSS acima dela. A resposta liquid dos botões e sliders é local ao gesto, não exige um canvas por controle e não implica refração física.

## Degradação progressiva

1. Uma superfície CSS clara é a base completa, inclusive no servidor.
2. Monte canvas somente se WebGL2 estiver disponível, a peça visível e a aba ativa. Não crie um contexto para cada item de uma lista.
3. Desmonte o efeito sob movimento reduzido, transparência reduzida e cores forçadas; desligue listeners/observers ao sair.
4. Limite a área e a densidade de pixels. Falha de inicialização deixa o fallback visível. Valide perda de contexto nos browsers de destino.
5. Conteúdo, valor, foco e semântica permanecem em HTML. Textos nunca são deformados pelo shader.

Use apenas branco, cinzas neutros e preto nos uniforms e na composição final. Fundos são claros e monocromáticos. Desative dispersão cromática; entradas neutras sozinhas não garantem saída neutra em todo shader. Confira a saída renderizada.

A versão do pacote está fixada. Ao trocar de efeito, confira os tipos instalados e a [documentação oficial](https://shaders.paper.design/). Meça quadros, memória e consumo em hardware real quando o custo importar; GPU não garante desempenho. Não adicione metal para tornar um efeito mais visível: ajuste luz, relevo e translucidez do vidro.
