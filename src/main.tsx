import '@fontsource-variable/fraunces/full.css'
import '@fontsource-variable/instrument-sans'
import '@fontsource-variable/geist-mono'
import './styles/tokens.css'
import './styles/global.css'
import './motion/titleFlight.css'
import 'lenis/dist/lenis.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App.tsx'
import { startSmoothScroll } from '@/motion/smoothScroll.ts'
import { forgetTitleFlightOnTraversal } from '@/motion/titleFlight.ts'

const root = document.getElementById('root')
if (!root) throw new Error('Elemento #root ausente em index.html')

startSmoothScroll()
forgetTitleFlightOnTraversal()

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
