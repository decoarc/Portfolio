import { createBrowserRouter, RouterProvider } from 'react-router'
import { Providers } from './providers'
import { createAppRoutes } from './router'

const router = createBrowserRouter(createAppRoutes())

export default function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  )
}
