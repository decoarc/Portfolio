import { useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { createRoutes } from './routes.tsx'

export function App() {
  // Criado uma vez; o router mantém o próprio estado de navegação.
  const [router] = useState(() => createBrowserRouter(createRoutes()))
  return <RouterProvider router={router} />
}
