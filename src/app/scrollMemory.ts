import type { createBrowserRouter } from 'react-router'

type Router = Pick<
  ReturnType<typeof createBrowserRouter>,
  'enableScrollRestoration'
>

/**
 * Posição de rolagem de cada entrada do histórico, pela `key` da location. O
 * router grava no início de cada navegação, antes de a página trocar; ler a
 * posição depois (num efeito) já pegaria o valor cortado pela página nova.
 */
export const savedScroll: Record<string, number> = {}

/**
 * Liga a gravação. Só grava: quem restaura é o `ScrollManager`, no voltar e
 * avançar. A restauração nativa do navegador não basta quando a troca de
 * página acontece dentro de uma View Transition (o router repete a do título
 * que viaja no voltar): o navegador restaura antes, ainda sobre a página
 * anterior, e corta a posição.
 */
export function rememberScroll(router: Router): () => void {
  return router.enableScrollRestoration(
    savedScroll,
    () => window.scrollY,
    (location) => location.key,
  )
}
