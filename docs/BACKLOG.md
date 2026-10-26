# Backlog

Itens adiados deliberadamente, com o motivo e o momento certo de pegá-los.
Item sem momento definido vira item esquecido.

## Interação e motion — Fase 3

### Preview de projeto no hover

Ao passar o mouse sobre um projeto na lista de trabalhos, revelar um preview
dele. Ideia do dono, registrada no Gate 1.

- **Depende de:** mídia de projeto autorizada. Hoje existe um único projeto
  verificado (`map-areas`) e nenhuma captura de produto liberada; sem isso o
  preview não tem o que mostrar.
- **Restrições que já valem:** `docs/SPEC.md` §5.2 e §6 — todo hover precisa de
  equivalente por teclado e por toque, o preview não pode esconder conteúdo nem
  mover o alvo de clique para longe do cursor, e tudo desliga em
  `prefers-reduced-motion`.
- **Nota de direção:** a nota de motion do comp vencedor previa as lâminas se
  separando verticalmente na entrada em viewport. O preview no hover é uma
  camada a mais, não um substituto; decidir na Fase 3 se as duas coexistem ou
  se uma substitui a outra.
- **Registrar em:** `docs/MOTION_SPEC.md` quando implementado — objetivo,
  gatilho, estados, duração, alternativa reduced-motion, fallback sem JS.

## Ferramental — depois da implementação visual

### O wrapper `rtk` reporta sucesso falso

Durante a Fase 0 o `rtk` reportou `TypeScript: No errors found` com código de
saída 0 **enquanto cinco erros de tipo reais existiam**, e mascarou o código de
saída. Um build quebrado passou por seis verificações independentes porque os
implementadores confiaram nessa saída; só apareceu no review final da branch.

Observado também, por um dos agentes:

- intercepta comandos mesmo sem o prefixo `rtk`;
- `npx prettier --check` e `pnpm exec prettier` imprimiram
  `All files formatted correctly` com código de saída 1;
- `pnpm exec vitest` também é interceptado;
- scripts de `package.json` cujo nome não bate com nenhum filtro
  (`typecheck`, `build`, `format:check`) passam crus.

**Impacto:** qualquer verificação feita através do `rtk` pode estar mentindo.
Enquanto não for investigado, rode `pnpm typecheck` e `pnpm build` **sem** o
prefixo antes de confiar num resultado verde.

**Por que está no backlog e não resolvido:** é ferramenta do ambiente, não
código deste repositório, e a correção da Fase 0 que importava — o build — já
está feita (commit `4efd9d2`).

### `pnpm format:check` falha em ~80 arquivos

Falha em todo o `src/` e inclusive no próprio `.prettierrc.json`. É
pré-existente, anterior a esta direção, e está **fora** do `pnpm validate`, por
isso não bloqueia nada hoje.

**Momento certo:** rodar `pnpm format` de uma vez na Fase 2, quando o `src/`
for reescrito — formatar agora criaria ruído num diff que vai ser descartado.

## Dívidas pequenas da Fase 0

Nenhuma bloqueia a Fase 2; todas somem quando `design/comps/` for apagado,
exceto a primeira.

- `CompProject.stack` é uma string já concatenada com `·`. A camada de conteúdo
  da Fase 2 deve usar `string[]` e deixar o separador para a apresentação.
- A varredura de `design/comps/static.test.ts` cobre só `design/comps/*.css` —
  não `<style>` inline, não subdiretórios, não `el.style.animation` atribuído
  por JS. A limitação está anotada no próprio teste.
- `docs/m4b-review/home-1280.png` é reescrito por `pnpm test:e2e` a cada
  execução, sujando a árvore. Vale fixar a captura ou tirá-la do controle de
  versão.

## Desmonte da Fase 0

Quando a Fase 2 terminar, remover — a lista completa está em
`design/comps/README.md`: a pasta `design/comps/`, as `devDependencies` de
fontes não escolhidas, `playwright.comps.config.ts`, os scripts `comps` e
`comps:capture`, o exclude de `vite.config.ts` e as entradas nos dois
`tsconfig`. As capturas em `docs/gate-1/` ficam como registro da decisão.
