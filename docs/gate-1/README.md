# Gate 1 — Decisão de direção visual

Três composições estáticas do primeiro viewport, mesma copy, para decidir
**D1** (metáfora visual) e **D2** (paleta e tipografia), conforme
`docs/SPEC.md` §3.1 e `docs/superpowers/specs/2026-10-26-portfolio-visual-redesign-design.md`.

Nenhum arquivo de `src/` foi tocado. A escolha abre a Fase 2.

## Como avaliar

Ao vivo é melhor que a captura:

```bash
pnpm dev
# http://localhost:5173/design/comps/
```

As capturas abaixo são o registro da decisão, em `<comp>-<viewport>-<locale>.png`.

## Critérios

1. **Legibilidade antes de efeito.** O nome, a função e o caminho para os
   trabalhos se leem em segundos, sem gesto oculto?
2. **Originalidade.** Parece autoral ou parece um template reconhecível?
3. **Continuidade.** A passagem do hero para a lista de trabalhos é do mesmo
   mundo, ou são duas páginas coladas?
4. **Mobile.** 390px tem composição própria ou é a desktop espremida?
5. **Português.** A tipografia display aguenta "Desenvolvedor Full Stack" e os
   acentos sem quebrar?
6. **Futuro.** A linguagem aguenta oito projetos, ou só funciona com quatro?

## Comparação

| | 01 Inspection Slot | 02 Editorial Rolodex | 03 Spatial Gallery |
|---|---|---|---|
| Base | Escura, metálica | Clara, papel | Escura, luz |
| Composição dos trabalhos | Folha de contato: aberturas emolduradas, duas por linha | Pilha de lâminas de índice, filete entre elas | Placas suspensas, deslocadas alternadamente a partir de ~900px; em tablet empilham numa coluna só |
| Display | Archivo | Fraunces | Syne |
| Acento | Âmbar industrial `#FF6A1F` | Vermelho de arquivo `#A32114` | Luz fria `#AFC7FF` |
| Depende de mídia | Média — cada abertura tem um recorte vazio esperando imagem | Baixa — é tipográfico | Alta — as placas pedem mídia |
| Escala com muitos projetos | Boa | Muito boa | Média |
| Risco | Virar "industrial genérico" | Parecer sóbrio demais, perto do atual | Luz e profundidade custam caro em motion |

## Capturas

As 18 imagens desta pasta são geradas por `pnpm comps:capture` e regravadas a
cada execução. Não edite à mão. `pnpm comps` roda só as verificações e não
escreve nada aqui.

## Decisão

Registrar em `docs/DESIGN_DECISIONS.md` assim que o dono escolher.
