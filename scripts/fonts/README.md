# Fontes

## `src/styles/fonts/fraunces-latin.woff2`

A Fraunces latin do site. É o `fraunces-latin-full-normal.woff2` do
`@fontsource-variable/fraunces` com o eixo `SOFT` fixado em 0 e subsetada para
o mesmo `unicode-range` do latin do fontsource. Os eixos `wght`, `opsz` e
`WONK` ficam inteiros. O `src/styles/fonts.css` declara esse arquivo para o
latin e os arquivos do fontsource para vietnamese e latin-ext.

O arquivo fica em `src/` (e não em `public/`) para o Vite pôr hash no nome: o
build o publica como `/assets/fraunces-latin-<hash>.woff2`, sob a regra de
cache `immutable` de `/assets/*` (`scripts/headers.ts`). O
`e2e/motion.spec.ts` confere o caminho e o `Cache-Control`.

Licença: SIL OFL 1.1, em `public/fonts/LICENSE-Fraunces.txt` (cópia do
`LICENSE` do pacote). A OFL da Fraunces não declara Reserved Font Name, então a
versão modificada mantém o nome.

### Regenerar

Depois de atualizar o `@fontsource-variable/fraunces`:

```sh
py -3.12 -m venv <fora-do-repo>/venv-fonts
<fora-do-repo>/venv-fonts/Scripts/python -m pip install fonttools brotli
<fora-do-repo>/venv-fonts/Scripts/python -I scripts/fonts/instance-fraunces.py
```

O `fonttools` não entra no `package.json`. Depois de regenerar, `pnpm test:e2e`
tem de passar sem diferença no projeto `visual`.

### O que o site usa (medido em 2026-10-27)

Pesos e cortes computados de todo elemento (e pseudo-elemento) com família
Fraunces, nas `GATE_ROUTES`, nos três viewports, com e sem reduced motion:

- `font-weight`: só 600.
- `font-variation-settings`: `"SOFT" 0, "WONK" 1, "opsz" 144` (display),
  `"WONK" 1, "opsz" 72` (title), `"opsz" 48` (heading) e `normal` (opsz
  automático pelo tamanho).
- `SOFT`: sempre 0.

### Por que o `wght` não foi reduzido

O padrão do eixo `wght` no arquivo é 900. Fixar em 600 (34,7 kB) ou restringir
a 600–900 (61,1 kB) obriga o `instancer` a recalcular os deltas e arredondá-los
para unidades inteiras. A regressão visual (`threshold: 0`) acusou de 16 a 215
pixels diferentes por captura em 24 das 24 capturas, e o mesmo com o UPM
escalado para 16000 antes de fixar. Fixar `SOFT` em 0, o valor padrão do eixo,
só descarta deltas e não arredonda nada: 67,0 kB, 44,7% menor que os 121,0 kB
do fontsource, sem diferença visual. `--wght-min/--wght-max` reproduzem a
tentativa.
