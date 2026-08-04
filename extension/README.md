# moodnest board exporter (browser extension)

Collects pins from a Pinterest board/section you're viewing in your own logged-in browser
tab and sends them to your local moodnest app. Everything runs client-side in your browser
using your normal session — no password or cookie is ever sent to moodnest or anywhere else.

## Load it (Chrome / Edge / Brave)

1. Go to `chrome://extensions` (or `edge://extensions`)
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** and select this `extension/` folder
4. Make sure moodnest's dev server is running (`npm run dev` from the project root, at
   `http://localhost:5173`)

## Use it

1. Open a board on pinterest.com — a small "moodnest" panel appears bottom-right
2. Click **Collect this page** — it auto-scrolls the current page (board root, or whichever
   section tab you're on) and gathers every pin it finds
3. Click through each section tab on the board yourself, clicking **Collect this page** on
   each one — the extension remembers everything collected so far per board
4. Once you've covered the whole board (root + every section you care about), click
   **Send all to moodnest** — this creates the board and matching nested sections in
   moodnest and imports every pin, skipping any pin already imported before (deduped by its
   Pinterest URL)

## Why sections need a click each

Pinterest doesn't expose a single API call for "give me every section's pins" without
either using their private internal endpoints (fragile, against ToS, and requires session
cookies from a live login — the same risky pattern used by shady "board downloader" apps)
or reverse-engineering their tab navigation, which breaks the moment their DOM changes.
Clicking through tabs yourself is the same navigation you'd do manually anyway — the
extension just collects and accumulates instead of you copy-pasting.

## Known fragility

Pinterest's markup and class names change over time and aren't stable/semantic. If pin
counts stay at 0 after a "Collect this page" click, Pinterest likely changed something —
open devtools and check whether `a[href*="/pin/"]` elements still exist on the page; the
selectors in `content.js` may need updating.

## Known issue — recommendations filter (best-effort)

Collecting a section page also picks up Pinterest's "More ideas" / recommended pins shown
below the section's own pins (real pin-content images, same CDN pattern, so the image
filter alone can't tell them apart). Fixed with a text-based cutoff: `content.js` looks for
a heading matching known recommendation phrases ("Find some ideas for this board", "More
like this", etc.) and excludes any pin image that appears after it in document order.

This is a heuristic, not a verified fix — if Pinterest uses different wording than what's
in `RECOMMENDATION_HEADINGS`, it won't catch it. If pin counts are still too high after
collecting a section, check what heading text actually precedes the recommendations block
and add it to that list.
