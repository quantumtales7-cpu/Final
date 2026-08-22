# Universal AI — Netlify

Standalone Vite + React + Netlify Functions OpenRouter platform.

## Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- Node: 20

Add `OPENROUTER_API_KEY` in Netlify Site configuration → Environment variables. Do not use a `VITE_` prefix for the secret.

The included `netlify.toml` configures the build, functions, `/api/*` redirects and SPA fallback.