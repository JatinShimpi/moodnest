# moodnest

Local-only creative workspace for organizing Pinterest pins into moodboards, with nested
sections shown in the sidebar. No cloud, no AI — just import, organize, annotate.

See [design.md](./design.md) for the locked design system.

## Run it

```
npm install
npm run dev
```

Opens at http://localhost:5173. Data is stored locally in `server/data.json` (gitignored —
it's your personal board data, not source).

## Adding pins

Paste a Pinterest pin URL into "Add pin" and hit Fetch — it calls Pinterest's public oEmbed
endpoint (`pinterest.com/oembed.json`) via a tiny local dev-server proxy to pull the image and
title automatically. If that fails (network/CORS-dependent), paste the image URL directly.

## Stack

- Vite + React + TypeScript + Tailwind
- No backend/deploy: a Vite dev-server middleware (`server/devApiPlugin.ts`) provides a small
  REST API backed by a JSON file (`server/store.ts`) — good enough for single-user local use
- Hand-built UI primitives styled to `design.md`'s Linear-dark palette (shadcn/ui-style
  structure, not pulled from a live registry — see design.md for why)

## Not in this pass

AI tagging/analysis, color extraction, visual linking between pins, export (PureRef/PDF),
light theme, mobile layout, real Pinterest OAuth/board sync.
