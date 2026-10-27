import { useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { createRoutes } from './routes.tsx'
import { rememberScroll } from './scrollMemory.ts'

export function App() {
  // Criado uma vez; o router mantém o próprio estado de navegação e grava a
  // posição de cada página ao sair dela (o `ScrollManager` restaura).
  const [router] = useState(() => {
    const created = createBrowserRouter(createRoutes())
    rememberScroll(created)
    return created
  })
  return <RouterProvider router={router} />
}
