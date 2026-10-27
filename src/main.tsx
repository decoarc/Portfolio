import '@fontsource-variable/fraunces/full.css'
import '@fontsource-variable/instrument-sans'
import '@fontsource-variable/geist-mono'
import './styles/tokens.css'
import './styles/global.css'
import './motion/titleFlight.css'
import 'lenis/dist/lenis.css'
import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { App } from '@/app/App.tsx'
import { startSmoothScroll } from '@/motion/smoothScroll.ts'
import { forgetTitleFlightOnTraversal } from '@/motion/titleFlight.ts'

const root = document.getElementById('root')
if (!root) throw new Error('Elemento #root ausente em index.html')

startSmoothScroll()
forgetTitleFlightOnTraversal()

const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// O build grava o HTML de cada rota em #root (scripts/prerender.ts): hidrata.
// No dev, #root só tem o comentário <!--app--> do molde: renderiza do zero.
if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)
