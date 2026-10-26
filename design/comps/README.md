# Comps — Fase 0 (descartável)

Três composições estáticas do primeiro viewport para decidir D1 (metáfora
visual) e D2 (paleta e tipografia). Mesma copy nos três, servida por
`content.ts`, para que a comparação isole a composição.

Esta pasta é apagada ao fim da Fase 2. O desmonte não é só apagar a pasta —
estas edições permanentes no repositório saem junto:

- as `devDependencies` de fontes perdedoras em `package.json`;
- os scripts `comps` e `comps:capture` em `package.json`;
- `playwright.comps.config.ts`;
- o exclude `'**/design/comps/checks/**'` em `vite.config.ts`;
- a entrada `design/comps` no `"include"` e o `"exclude"` de
  `design/comps/static.test.ts` em `tsconfig.app.json`;
- a entrada `design/comps/static.test.ts` no `"include"` de
  `tsconfig.node.json`;
- as 18 capturas e o `README.md` de `docs/gate-1/`, se a decisão já estiver
  registrada em `docs/DESIGN_DECISIONS.md`.

## Como ver

```bash
pnpm dev
# http://localhost:5173/design/comps/
```

`?locale=pt` troca o idioma. `?chrome=0` esconde a barra de desenvolvimento.
`?flat=1` liga o modo plano — ver a seção de contraste.

## Como verificar

```bash
pnpm comps          # só as verificações; não escreve nada na árvore
pnpm comps:capture  # regrava as 18 capturas em docs/gate-1/
```

`pnpm comps` roda, para os três comps × três viewports × dois idiomas:
ausência de overflow horizontal no documento **e em cada `[data-region]`**,
ausência de animação declarada, carregamento efetivo da tipografia display de
cada comp, e contraste WCAG AA sem nenhum par deixado por medir.

## O que cada comp propõe

### 01 — Inspection Slot

Bancada de inspeção. O hero é uma abertura emoldurada recortada na chapa, e o
nome atravessa a moldura até a borda da página. Cada projeto é apresentado
dentro da sua própria abertura: moldura visível, interior em `--surface`, um
recorte escuro com marca de registro esperando a mídia, e o número cravado na
moldura como etiqueta. Em 1200px as aberturas viram duas colunas e a seção se
lê como folha de contato.

- **Paleta:** `#16181A` fundo · `#1F2225` superfície · `#E8E6E1` tinta ·
  `#A8A49C` tinta suave · `#4A4F55` filete · `#FF6A1F` acento
- **Tipografia:** Archivo Variable · Instrument Sans Variable · JetBrains Mono Variable
- **Na Fase 3 se moveria:** a moldura do recorte se abriria no hover de cada
  abertura, revelando a mídia do projeto por trás; a etiqueta numerada
  deslizaria junto. Nada disso está implementado aqui.

### 02 — Editorial Rolodex

Arquivo editorial. Papel tipo manila, margem larga, medida curta; hero
puramente tipográfico; projetos como lâminas de índice com o número recuado na
margem. A folha de índice usa `--surface`, um papel mais claro que a capa:
passar do hero para os trabalhos é virar a página.

- **Paleta:** `#E8DCC0` fundo · `#F2EAD6` superfície · `#16130F` tinta ·
  `#5A534A` tinta suave · `#A89771` filete · `#A32114` acento
- **Tipografia:** Fraunces Variable · Instrument Sans Variable · Geist Mono Variable
- **Na Fase 3 se moveria:** as lâminas se separariam verticalmente na entrada em
  viewport, como fichas folheadas; o eixo óptico da Fraunces mudaria com o
  tamanho, não com o tempo.

### 03 — Spatial Gallery

Galeria espacial. Escuridão com uma fonte de luz fria atrás do nome; projetos
como placas suspensas, com luz de borda, deslocadas alternadamente a partir de
~900px — abaixo disso a placa ocupa a largura toda e as quatro empilham numa
coluna só.

- **Paleta:** `#08090B` fundo · `#121519` superfície · `#F0F2F5` tinta ·
  `#949CA6` tinta suave · `#333A43` filete · `#AFC7FF` acento
- **Tipografia:** Syne Variable · Space Grotesk Variable · Geist Mono Variable
- **Na Fase 3 se moveria:** a fonte de luz seguiria o cursor em deslocamento
  curto e amortecido; as placas teriam parallax leve entre si. Ambos desligados
  em `prefers-reduced-motion` e em touch.

## Contraste

Todos os pares de texto foram medidos e passam WCAG AA (≥ 4.5:1 para corpo).
Cor nova só entra depois de medida — `pnpm comps` falha se não passar.

**Modo plano (`?flat=1`).** O axe não sabe compor um gradiente com o que está
atrás e devolve o nó como `incomplete` em vez de medi-lo. Antes disso o comp 03
passava no portão de contraste com 0 violations e **os 32 nós de texto por
medir**. Sob `?flat=1` o harness marca o documento com `data-flat` e cada comp
troca as suas camadas de gradiente pela cor sólida de base; o spec então exige
`violations` **e** `incomplete` vazios. O modo plano existe só para a trava: as
capturas do dossiê e a visualização normal continuam com os gradientes.

**O que o modo plano não mede, medido à mão.** As camadas de luz do comp 03
clareiam o fundo sob o texto, e o pior caso é sempre o ponto mais claro:

| camada | fundo efetivo | tinta suave `#949CA6` | tinta `#F0F2F5` |
|---|---|---|---|
| centro do `radial-gradient` do hero, `rgb(175 199 255 / 14%)` sobre `#08090B` | `#1F242D` | 5,61:1 | 13,89:1 |
| topo do `linear-gradient` da placa, `rgb(175 199 255 / 6%)` sobre `#121519` | `#1B2027` | 5,90:1 | 14,60:1 |
| superfície sólida da placa (o que o modo plano mede) | `#121519` | 6,60:1 | 16,32:1 |
| fundo puro | `#08090B` | 7,18:1 | 17,76:1 |

Ou seja: a luz reduz o contraste, mas o pior par iluminado continua em 5,61:1,
acima do mínimo de 4,5:1 para corpo. A camada de luz foi medida, não contornada.
