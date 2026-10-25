import '@fontsource/ibm-plex-sans/latin-400.css'
import '@fontsource/ibm-plex-sans/latin-600.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import '@fontsource/ibm-plex-mono/latin-500.css'
import '@fontsource-variable/archivo/wdth.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import './styles/graph.css'
import './styles/chapter.css'
import './styles/viewer.css'

import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { App } from './App'

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// The production page is prerendered, so React attaches to the existing HTML.
// The dev server serves the bare template, so it renders from scratch.
if (import.meta.env.DEV) createRoot(root).render(app)
else hydrateRoot(root, app)

window.__appReady = true
