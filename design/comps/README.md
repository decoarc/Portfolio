# Comps — Fase 0 (descartável)

Três composições estáticas do primeiro viewport para decidir D1 (metáfora
visual) e D2 (paleta e tipografia). Mesma copy nos três, servida por
`content.ts`, para que a comparação isole a composição.

Esta pasta é apagada ao fim da Fase 2, junto com as `devDependencies` de fontes
perdedoras e a entrada `design/comps` em `tsconfig.app.json`.

## Como ver

```bash
pnpm dev
# http://localhost:5173/design/comps/
```

`?locale=pt` troca o idioma. `?chrome=0` esconde a barra de desenvolvimento.

## Como verificar

```bash
pnpm comps
```

Roda, para os três comps × três viewports × dois idiomas: ausência de overflow
horizontal, ausência de animação declarada, contraste WCAG AA. Também regrava
as capturas em `docs/gate-1/`.

## O que cada comp propõe

### 01 — Inspection Slot

Bancada de inspeção. Superfície escura com recortes emoldurados; o nome sangra
a moldura esquerda; os projetos são gavetas numeradas.

- **Paleta:** `#16181A` fundo · `#1F2225` superfície · `#E8E6E1` tinta ·
  `#A8A49C` tinta suave · `#4A4F55` filete · `#FF6A1F` acento
- **Tipografia:** Archivo Variable · Instrument Sans Variable · JetBrains Mono Variable
- **Na Fase 3 se moveria:** a moldura do recorte se abriria no hover de cada
  gaveta, revelando a mídia do projeto por trás; o número da gaveta deslizaria
  junto. Nada disso está implementado aqui.

### 02 — Editorial Rolodex

Arquivo editorial. Papel tipo manila, margem larga, medida curta; hero puramente
tipográfico; projetos como lâminas de índice com o número recuado na margem.

- **Paleta:** `#E8DCC0` fundo · `#F2EAD6` superfície · `#16130F` tinta ·
  `#5A534A` tinta suave · `#A89771` filete · `#A32114` acento
- **Tipografia:** Fraunces Variable · Instrument Sans Variable · Geist Mono Variable
- **Na Fase 3 se moveria:** as lâminas se separariam verticalmente na entrada em
  viewport, como fichas folheadas; o eixo óptico da Fraunces mudaria com o
  tamanho, não com o tempo.

### 03 — Spatial Gallery

Galeria espacial. Escuridão com uma fonte de luz fria atrás do nome; projetos
como placas suspensas, deslocadas alternadamente, com luz de borda.

- **Paleta:** `#08090B` fundo · `#121519` superfície · `#F0F2F5` tinta ·
  `#949CA6` tinta suave · `#333A43` filete · `#AFC7FF` acento
- **Tipografia:** Syne Variable · Space Grotesk Variable · Geist Mono Variable
- **Na Fase 3 se moveria:** a fonte de luz seguiria o cursor em deslocamento
  curto e amortecido; as placas teriam parallax leve entre si. Ambos desligados
  em `prefers-reduced-motion` e em touch.

## Contraste

Todos os pares de texto foram medidos e passam WCAG AA (≥ 4.5:1 para corpo).
Cor nova só entra depois de medida — `pnpm comps` falha se não passar.
