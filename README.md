# jhosephe

Uma skill para construir interfaces táteis em **React, CSS e shadcn/ui**. UI clara, vidro com função, metal acetinado, cantos contínuos e movimento que responde ao usuário.

O pacote reúne instruções de projeto, receitas técnicas, componentes reutilizáveis e um laboratório interativo. A skill está em [SKILL.md](SKILL.md); o mapa de decisões está nas [referências](references/design-language.md).

## Experimentar

Requer Node.js 22.12 ou superior.

```sh
npm ci
npm run dev
```

Abra http://127.0.0.1:4173. O laboratório apresenta materiais e permite ajustar o dial, operar slider e switch, abrir um diálogo e comparar curvas de canto. Os controles funcionam com teclado.

```sh
npm run check
npx playwright install chromium
npm run test:browser
```

## Instalar a skill

Copie `SKILL.md`, `agents/`, `references/` e `assets/` para uma pasta `jhosephe` no diretório de skills do seu agente. Ou use o instalador, que exige destino explícito e não sobrescreve uma instalação existente:

```sh
node scripts/install-skill.mjs --dest /caminho/para/skills/jhosephe
```

Exemplo de uso: **“Use $jhosephe para criar um painel de configurações em React com superfície mineral clara, vidro apenas na barra flutuante e controles táteis.”**

## Conteúdo

- `references/`: linguagem, materiais, cantos, movimento, integração, revisão e estudo das referências.
- `assets/ui/`: a implementação reutilizável usada pelo laboratório.
- `examples/lab/`: demonstração executável.
- `docs/`: revisão da base consultada, cobertura e validação do pacote.
- `tests/`: geometria, acessibilidade e comportamento no navegador.

A distribuição contém texto e implementação próprios. Fotografias, vídeos, páginas salvas e dados mostrados nas referências visuais não fazem parte do pacote. Licença MIT para os arquivos originais; dependências mantêm suas licenças.
