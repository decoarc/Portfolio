# Backlog

Itens adiados deliberadamente, com o motivo e o momento certo de pegá-los.
Item sem momento definido vira item esquecido.

## Interação e motion — Fase 5 (com conteúdo real)

### Preview de projeto no hover

Ao passar o mouse sobre um projeto na lista de trabalhos, revelar um preview
dele. Ideia do dono, registrada no Gate 1.

- **Depende de:** mídia de projeto autorizada. Hoje existe um único projeto
  verificado (`map-areas`) e nenhuma captura de produto liberada; sem isso o
  preview não tem o que mostrar. Por isso fica para a Fase 5, junto da troca
  dos mocks (decisão do dono, 2026-10-27): o tamanho e o formato da mídia real
  definem o desenho. A parte tipográfica vem antes, na segunda leva da Fase 3.
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
- **Referência levantada (2026-10-26):** a lista de trabalhos de
  dennissnellenberg.com — a prévia segue o cursor com um círculo "View", o
  título da linha recua e as outras linhas esmaecem.

## Interação e motion — Fase 3, segunda leva

A Fase 3 começou só com a abertura da home (nome se afastando e folha do índice
subindo com borda curva). Os efeitos abaixo vieram do mesmo levantamento de
referências (yasingenc.net e dennissnellenberg.com, 2026-10-26) e ficaram para
depois por decisão do dono. Momento (decidido em 2026-10-27): logo depois do
Gate 3, antes da Fase 4, ainda sobre o conteúdo mock. O que for calibrado no
texto mock (texto que acende, lista reagindo ao mouse) é revisto na Fase 5.
Todos seguem as regras de `docs/MOTION_SPEC.md` (reduced-motion, teclado,
fallback sem JS) e reaproveitam o scroll suave já instalado.

Ordem sugerida: os dois ajustes da abertura, links que se enchem de cor, lista
reagindo ao mouse, texto que acende, cortina do case study (a mais cara, mexe
no router).

### Ajustes pequenos da abertura

Dois pontos que ficaram do review da Fase 3:

- a abertura reescreve os valores a cada scroll mesmo depois que a folha chega
  ao topo — parar de escrever quando o estado final já foi aplicado;
- a opção `anchors` do Lenis repete o que o `ScrollManager` já faz — ficar com
  um só dono para a rolagem até âncoras.

### A folha cobre o nome no meio do afastamento

Na abertura aprovada, a folha do índice sobe ao mesmo tempo que o nome se
afasta e o cobre antes de o movimento terminar. O dono notou e escolheu manter
assim por ora. Já foram testadas e recusadas duas alternativas (protótipo v5):
segurar o hero até o nome terminar e só então subir a folha, e manter o nome por
cima da folha até ela chegar ao topo. Se voltar ao tema, partir de outra ideia.

### Texto que acende com o scroll

Parágrafos começam apagados e clareiam palavra por palavra conforme a rolagem
(referência: yasingenc.net). Candidatos: Abordagem e Sobre. Cuidado: o texto
precisa estar legível sem o efeito e para leitor de tela desde o primeiro frame.

### Lista de trabalhos reagindo ao mouse

A parte tipográfica do preview no hover (título recua, outras linhas esmaecem)
não depende de mídia e pode vir antes da prévia com imagem. Ver o item
"Preview de projeto no hover" acima.

### Cortina ao abrir um case study

Na troca da home para `/work/:slug`, uma tela com o nome do projeto antes do
conteúdo (referência: dennissnellenberg.com). Exige uma camada de transição
no router; o link precisa funcionar em `t=0` e o foco ir para o conteúdo novo.

### Botões e links que se enchem de cor no hover

Preenchimento subindo de baixo para cima nos links de ação do hero e do contato
(referência: dennissnellenberg.com). Precisa de equivalente em `:focus-visible`.

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

## Acabamento — Fase 4

### Metadados por idioma

Hoje só `<title>` e `lang` mudam com o locale (Fase 2). Faltam `hreflang`,
`description` e Open Graph por idioma. O mecanismo entra na Fase 4; os textos
de `description` e Open Graph são revistos na Fase 5, com o conteúdo real.

## Conteúdo real e publicação — Fase 5

O conteúdo mock fica até o fim e só é trocado quando o repositório for
publicado (decisão do dono, 2026-10-27). Hoje são 12 itens `mock: true`: três
projetos (Atlas Ledger, Field Notes, Token Killer) e os três princípios da
Abordagem, cada um em pt e en.

### `pnpm validate` falha por desenho enquanto houver mock

`validate` encadeia `build`, e `build` roda a trava de mock
(`scripts/assert-no-mock.ts`) antes de `tsc -b`. Enquanto algum item tiver
`mock: true`, `validate` sai com 1 — é o critério 8 da spec funcionando. O
critério 9 (`validate` verde) fecha na Fase 5, com conteúdo real no lugar dos
mocks.
