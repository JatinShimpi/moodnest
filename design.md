# moodnest — Design System (v1, locked)

Personal creative-workspace app: import/organize Pinterest pins into moodboards, with nested
sections shown in a sidebar tree. Dark, tool-like, image-forward. No AI features in this pass.

Base component primitive: **shadcn/ui** (Radix + Tailwind) — the same foundation most
21st.dev dark dashboard/sidebar components are built on. Hand-styled to the palette below
rather than pulled live from the 21st.dev registry (no API key connected yet — revisit if
`@21st-dev/registry` MCP gets wired up later).

Aesthetic reference: **Linear-style** — near-black, low-chrome, single accent, flat cards,
minimal borders. The UI should get out of the way; pin images carry the visual weight.

## Color tokens

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0B0C0E` | App background |
| `--bg-elevated` | `#111216` | Sidebar, header bar |
| `--panel` | `#17181C` | Cards, modals, board tiles |
| `--panel-hover` | `#1D1E23` | Hover state on cards/rows |
| `--border` | `#262832` | Hairline borders (1px, only where needed to separate regions) |
| `--border-subtle` | `#1E1F25` | Sidebar row dividers |
| `--text` | `#E6E6E9` | Primary text |
| `--text-muted` | `#8A8D96` | Secondary text, captions, metadata |
| `--text-faint` | `#5B5E68` | Placeholder text, disabled |
| `--accent` | `#6E56CF` | Active nav item, primary buttons, focus rings, links |
| `--accent-hover` | `#7C64E0` | Accent hover |
| `--danger` | `#E5484D` | Delete actions |

No board-specific colors in v1 — every board/section uses the same accent for its active
state. (Per-board color tagging is a nice-to-have, not MVP.)

## Typography

- Font: `Inter`, fallback `system-ui, sans-serif`
- Base size: 13.5px, line-height 1.5
- Sidebar items: 13px, `--text-muted` default / `--text` on hover-or-active
- Board title (page header): 20px, 600 weight
- Pin caption/note text: 13px, `--text-muted`, left-aligned under the image
- No serif, no decorative fonts anywhere

## Layout

```
┌───────────┬──────────────────────────────────────────┐
│  Sidebar  │  Header (board title, add-pin button)     │
│  240px    ├──────────────────────────────────────────┤
│  (56px    │                                            │
│  collapsed│  Masonry pin grid (board contents)         │
│  icon     │                                            │
│  rail)    │                                            │
└───────────┴──────────────────────────────────────────┘
```

- Sidebar: fixed 240px, collapsible to 56px icon rail (icon-only, tooltip on hover)
- No top nav bar beyond a slim in-content header — sidebar is the only persistent chrome
- Content area max-width: none — masonry grid fills available width, columns reflow by
  viewport (target 3–5 columns on a standard desktop window)

## Sidebar — nested board tree

- Boards are top-level entries. A board with sections shows a disclosure chevron; sections
  render nested one level under their parent board (indented ~16px, connected by a thin
  vertical guide line at `--border-subtle`).
- Only one level of nesting (board → section) — matches Pinterest's own board/section model,
  no arbitrary depth needed for MVP.
- Row states:
  - Default: `--text-muted`, transparent background
  - Hover: `--text`, background `--panel-hover`
  - Active (currently viewed board/section): `--text`, background `--panel`, 2px accent bar
    on the left edge (not a full accent background fill — keeps it subtle)
- Each row: small square placeholder thumbnail (16px, board cover or first pin) + label +
  pin count in `--text-faint`, right-aligned
- "+ New board" pinned at bottom of sidebar list, ghost-button style

## Pin card (masonry grid item)

- Container: `--panel` background, 1px `--border` outline, 8px radius, **no drop shadow**
- Image fills card width, natural aspect ratio preserved (this is what makes it masonry)
- Below the image, inside the same card: a text area for the user's note/caption
  - Empty state: `--text-faint` placeholder "Add a note…"
  - Filled state: `--text-muted`, 13px, up to ~3 lines visible then truncate with a "more" affordance
  - Click to edit inline (no separate modal needed for notes)
- Hover state: card background → `--panel-hover`, border → slightly lighter, small overlay
  top-right with a "•••" menu (move to board/section, delete)
- No accent color on the card itself — accent is reserved for nav/active states and primary
  actions only, so it doesn't compete with pin imagery

## Buttons & controls

- Primary button: `--accent` fill, white text, 6px radius, no shadow
- Secondary/ghost button: transparent, `--border` outline, `--text-muted` → `--text` on hover
- Inputs: `--panel` background, `--border` outline, `--accent` outline on focus (2px ring)
- Icons: outline-style icon set (Lucide) at 16–18px, `--text-muted` default

## Motion

- Minimal. 120–150ms ease-out on hover/active transitions only. No entrance animations,
  no parallax, nothing that competes with scanning images quickly.

## What's explicitly deferred (not in this design pass)

- AI analysis / tagging UI
- Color palette extraction UI
- Visual linking between pins
- Export flows (PureRef/PDF)
- Light theme
- Mobile layout (desktop-first for personal workflow use)
