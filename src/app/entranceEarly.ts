/**
 * Script inline do `<head>` das duas homes (design §5.3). Com o HTML
 * pré-renderizado o nome pinta antes do JS: sem este script, o `Opening`
 * o esconderia depois, e ele piscaria.
 *
 * Abrindo no topo, sem hash e sem `prefers-reduced-motion: reduce`, marca
 * `<html data-entrance-early="pending">` (o CSS do hero esconde o nome como
 * no `data-entrance="pending"`). Se em 3000 ms o `Opening` ainda não tirou a
 * marca, troca para `expired`: o nome aparece parado e a entrada não roda.
 *
 * Texto fixo, sem valores interpolados: o CSP (Task 6) usa o hash exato dele.
 * O `scripts/prerender.ts` o grava como `<script>…</script>`.
 */
export const ENTRANCE_EARLY_SCRIPT =
  "(function(){var d=document.documentElement;if(window.scrollY!==0||location.hash||matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.dataset.entranceEarly='pending';setTimeout(function(){if(d.dataset.entranceEarly==='pending')d.dataset.entranceEarly='expired'},3000)})()"
