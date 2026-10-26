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

**Investigado em 2026-10-26 (rtk 0.37.2)** com sondas de erro proposital
(tipo, teste, lint) e controle pelo PowerShell, que não passa pelo hook — o
hook `rtk hook claude` só casa com o tool `Bash`.

| Comando | O que o rtk faz de fato | Mensagem | Exit |
| --- | --- | --- | --- |
| `rtk pnpm typecheck` | subcomando embutido: roda `npx tsc` **sem argumentos**, ignorando o script do `package.json` | `No errors found` — **falso** | 0 — **falso** |
| `rtk tsc --noEmit` / `npx tsc --noEmit` (reescrito) | idem: sem `-b`, o `tsconfig.json` raiz tem `"files": []` e nada é checado | `No errors found` — **falso** | 0 — **falso** |
| `rtk prettier --check` / `npx`/`pnpm exec prettier` (reescrito) | o filtro só lê stdout; o prettier escreve os `[warn]` no stderr | `All files formatted correctly` — **falso** | 1 — correto |
| `rtk vitest` / `pnpm exec vitest run` (reescrito) | parser falha (`All parsing tiers failed`), sobra só a linha do relatório JSON | sem conteúdo | correto |
| `rtk tsc -b`, `rtk lint`, `rtk pnpm lint`, `rtk pnpm build` | repassa ou filtra corretamente | correta | correto |
| `pnpm typecheck`, `pnpm build`, `pnpm test`, `pnpm validate` sem prefixo | o hook **não** reescreve | — | correto |

**Causa raiz da Fase 0:** os agentes seguiram a instrução global "sempre
prefixe com `rtk`" e rodaram `rtk pnpm typecheck` (confirmado nos
transcripts). Esse subcomando não é passthrough — troca `tsc -b --pretty
false` por `tsc`, que num tsconfig de referências checa zero arquivos. O exit
0 é do próprio `tsc`; o rtk só converte silêncio em afirmação. Onde aparecia
`| tail`, o pipe sem `pipefail` mascarava o exit code de qualquer jeito.

**Critérios de validação confiáveis:**

1. Verificação que decide verde/vermelho roda como **script do projeto sem
   prefixo** (`pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`,
   `pnpm validate`). O hook não os toca.
2. Nunca `rtk pnpm <script>` para script com nome de subcomando do rtk
   (`typecheck`, `list`, `install`, `outdated`): o rtk executa a versão dele,
   não a do projeto.
3. O exit code é a fonte de verdade, nunca a frase-resumo. Ler com
   `cmd; echo "exit=$?"` — nunca atrás de `| tail`/`| head` sem
   `set -o pipefail`.
4. Toda verificação nova precisa ter sido vista falhando uma vez (sonda com
   erro proposital) antes de ter o verde aceito.
5. Quando a saída do rtk estiver vazia ou estranha, `rtk proxy <cmd>` dá a
   saída crua; o log completo de falhas fica em `~/AppData/Local/rtk/tee/`.

**Correção no ambiente (feita em 2026-10-26):**

- `%APPDATA%\rtk\config.toml`, `[hooks] exclude_commands`: a exclusão casa
  por **prefixo**, então cada forma de invocação tem entrada própria — `tsc`,
  `npx tsc`, `pnpm exec tsc`, `pnpm tsc`, `npm exec tsc`, e o mesmo para
  `prettier` e `vitest`. Conferido com `rtk rewrite`: os 15 prefixos passam
  crus; `eslint`, `git` e `pnpm list` continuam filtrados. Backup do config
  anterior ao lado, em `config.toml.bak-2026-10-26`.
- `~/CLAUDE.md` e `~/.claude/RTK.md` ganharam a exceção "comandos de
  verificação nunca passam pelo `rtk`", com os critérios acima. O exclude não
  cobre o `rtk pnpm typecheck` digitado explicitamente; quem cobre é essa
  regra. Atenção: o bloco do `~/CLAUDE.md` é gerado por `rtk init`, e rodar
  de novo pode sobrescrever a exceção.

**Upstream (`rtk-ai/rtk`), ainda abertos na v1.1.0:** #2809 (`rtk pnpm
typecheck` ignora o script) e #2878 (prettier só lê stdout, com a correção em
aberto no #3571). O caso do sucesso falso em tsconfig de referências não
estava relatado; o comentário para o #2809 está redigido e aguarda o
`gh auth login`.

**Quando revisitar:** ao atualizar o rtk, se #2809 e #2878 estiverem
fechados, testar de novo com sonda de erro antes de remover as exclusões.

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
