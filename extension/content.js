// moodnest board exporter — content script
//
// Runs on pinterest.com pages. Collects pins visible on whatever board/section page
// you're currently on (auto-scrolling to trigger lazy-load), and accumulates them in
// chrome.storage.local per board so you can click through each section tab yourself
// and send everything to your local moodnest app in one final step.
//
// Note: Pinterest's DOM structure changes over time and uses non-semantic class names,
// so the selectors below use multiple fallback strategies. If pin/board-name detection
// stops working after a Pinterest redesign, that's the first place to look.

(function () {
  const STORAGE_PREFIX = "moodnest_collect_";

  function getPathSegments() {
    return location.pathname.split("/").filter(Boolean);
  }

  function isBoardPage() {
    const segments = getPathSegments();
    const reserved = ["pin", "search", "today", "explore", "ideas", "topics", "login", "settings"];
    return segments.length >= 2 && segments.length <= 3 && !reserved.includes(segments[0]);
  }

  function getBoardKey() {
    const segments = getPathSegments();
    return segments.slice(0, 2).join("/"); // username/boardSlug — stable identity for a board
  }

  function getSectionName() {
    const segments = getPathSegments();
    if (segments.length < 3) return null;
    // Prefer the visible active tab label over the URL slug if we can find it.
    const activeTab = document.querySelector('[aria-selected="true"], [data-test-id*="section"][aria-current]');
    if (activeTab?.textContent?.trim()) return activeTab.textContent.trim();
    return segments[2].replace(/-/g, " ");
  }

  function getBoardName() {
    const h1 = document.querySelector("h1");
    if (h1?.textContent?.trim()) return h1.textContent.trim();
    const og = document.querySelector('meta[property="og:title"]');
    if (og?.content) return og.content.split("|")[0].trim();
    return document.title.split("|")[0].trim() || "Untitled board";
  }

  function upsizeImage(url) {
    if (!url) return url;
    // Pinterest's image CDN encodes size as a path segment, e.g. /236x/ or /474x/.
    // Swap for a larger known-good size rather than guessing "originals" exists.
    return url.replace(/\/(\d+x\d*|\d+x)\//, "/736x/");
  }

  function extractPinId(href) {
    const match = href.match(/\/pin\/(\d+)/);
    return match ? match[1] : null;
  }

  function collectVisiblePins() {
    const seen = new Map();
    const anchors = document.querySelectorAll('a[href*="/pin/"]');
    anchors.forEach((a) => {
      const pinId = extractPinId(a.getAttribute("href") || "");
      if (!pinId || seen.has(pinId)) return;
      const img = a.querySelector("img");
      if (!img) return;
      const rawSrc = img.getAttribute("src") || img.getAttribute("srcset")?.split(" ")[0];
      if (!rawSrc) return;
      seen.set(pinId, {
        sourceUrl: `https://www.pinterest.com/pin/${pinId}/`,
        imageUrl: upsizeImage(rawSrc),
        title: img.getAttribute("alt")?.trim() || null,
      });
    });
    return Array.from(seen.values());
  }

  async function autoScrollAndCollect(onProgress) {
    let lastCount = 0;
    let stableRounds = 0;
    const maxRounds = 60; // safety cap so a huge/infinite board doesn't loop forever
    let all = new Map(collectVisiblePins().map((p) => [p.sourceUrl, p]));

    for (let round = 0; round < maxRounds; round++) {
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise((r) => setTimeout(r, 700));

      collectVisiblePins().forEach((p) => all.set(p.sourceUrl, p));
      onProgress?.(all.size);

      if (all.size === lastCount) {
        stableRounds++;
        if (stableRounds >= 3) break; // no new pins after 3 scroll attempts — assume we hit the bottom
      } else {
        stableRounds = 0;
      }
      lastCount = all.size;
    }

    return Array.from(all.values());
  }

  async function getStoredCollection(boardKey) {
    const data = await chrome.storage.local.get(STORAGE_PREFIX + boardKey);
    return data[STORAGE_PREFIX + boardKey] || { boardName: getBoardName(), sections: {} };
  }

  async function setStoredCollection(boardKey, collection) {
    await chrome.storage.local.set({ [STORAGE_PREFIX + boardKey]: collection });
  }

  async function clearStoredCollection(boardKey) {
    await chrome.storage.local.remove(STORAGE_PREFIX + boardKey);
  }

  function buildOverlay() {
    if (document.getElementById("moodnest-overlay")) return;

    const el = document.createElement("div");
    el.id = "moodnest-overlay";
    el.innerHTML = `
      <div class="mn-header">
        <div class="mn-title"><span class="mn-badge">m</span> moodnest</div>
        <button class="mn-close" title="Hide">&times;</button>
      </div>
      <div class="mn-row"><span>Board</span><strong class="mn-board-name">—</strong></div>
      <div class="mn-list"></div>
      <div class="mn-status"></div>
      <div class="mn-buttons">
        <button class="mn-btn" data-action="collect-page">Collect this page</button>
        <button class="mn-btn primary" data-action="send-all">Send all to moodnest</button>
      </div>
    `;
    document.body.appendChild(el);

    el.querySelector(".mn-close").addEventListener("click", () => el.remove());
    el.querySelector('[data-action="collect-page"]').addEventListener("click", handleCollectPage);
    el.querySelector('[data-action="send-all"]').addEventListener("click", handleSendAll);

    refreshOverlay();
    return el;
  }

  function setStatus(text, kind) {
    const status = document.querySelector("#moodnest-overlay .mn-status");
    if (!status) return;
    status.textContent = text;
    status.className = "mn-status" + (kind ? " " + kind : "");
  }

  async function refreshOverlay() {
    const boardKey = getBoardKey();
    const collection = await getStoredCollection(boardKey);
    const list = document.querySelector("#moodnest-overlay .mn-list");
    const nameEl = document.querySelector("#moodnest-overlay .mn-board-name");
    if (nameEl) nameEl.textContent = collection.boardName;
    if (!list) return;

    const rootCount = collection.root?.length || 0;
    const rows = [`<div class="mn-row"><span>(board root)</span><strong>${rootCount}</strong></div>`];
    for (const [name, pins] of Object.entries(collection.sections || {})) {
      rows.push(`<div class="mn-row"><span>${name}</span><strong>${pins.length}</strong></div>`);
    }
    list.innerHTML = rows.join("");
  }

  async function handleCollectPage() {
    const boardKey = getBoardKey();
    const sectionName = getSectionName();
    setStatus("Scrolling and collecting…");

    const pins = await autoScrollAndCollect((count) => setStatus(`Collecting… ${count} pins found so far`));

    const collection = await getStoredCollection(boardKey);
    collection.boardName = getBoardName();
    if (sectionName) {
      collection.sections = collection.sections || {};
      collection.sections[sectionName] = pins;
    } else {
      collection.root = pins;
    }
    await setStoredCollection(boardKey, collection);
    await refreshOverlay();
    setStatus(`Collected ${pins.length} pins from ${sectionName || "board root"}.`, "success");
  }

  async function handleSendAll() {
    const boardKey = getBoardKey();
    const collection = await getStoredCollection(boardKey);
    const totalPins =
      (collection.root?.length || 0) +
      Object.values(collection.sections || {}).reduce((sum, p) => sum + p.length, 0);

    if (totalPins === 0) {
      setStatus('Nothing collected yet — click "Collect this page" first.', "error");
      return;
    }

    setStatus(`Sending ${totalPins} pins to moodnest…`);

    const batches = [];
    if (collection.root?.length) {
      batches.push({ boardName: collection.boardName, sectionName: null, pins: collection.root });
    }
    for (const [sectionName, pins] of Object.entries(collection.sections || {})) {
      batches.push({ boardName: collection.boardName, sectionName, pins });
    }

    let created = 0;
    let skipped = 0;
    for (const batch of batches) {
      const result = await sendBatch(batch);
      if (!result.ok) {
        setStatus(`Failed: ${result.error}`, "error");
        return;
      }
      created += result.data.created ?? 0;
      skipped += result.data.skipped ?? 0;
    }

    setStatus(`Done — ${created} pins added, ${skipped} already existed.`, "success");
    await clearStoredCollection(boardKey);
    await refreshOverlay();
  }

  function sendBatch(payload) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: "SEND_TO_MOODNEST", payload }, (response) => {
        resolve(response || { ok: false, error: "No response from extension background" });
      });
    });
  }

  if (isBoardPage()) {
    buildOverlay();
  }

  let lastPath = location.pathname;
  setInterval(() => {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname;
      document.getElementById("moodnest-overlay")?.remove();
      if (isBoardPage()) buildOverlay();
    }
  }, 800);
})();
