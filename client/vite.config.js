import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves the app from /gym-app; Vercel serves it from the
  // domain root (Vercel sets VERCEL=1 during builds). Trailing slash
  // matters: BASE_URL is used verbatim to build the service-worker URL.
  base: process.env.VERCEL ? "/" : "/gym-app/",
})
