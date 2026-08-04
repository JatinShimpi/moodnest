const MOODNEST_URL = "http://localhost:5173";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "SEND_TO_MOODNEST") {
    fetch(`${MOODNEST_URL}/api/import/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message.payload),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
        sendResponse({ ok: true, data });
      })
      .catch((err) => {
        sendResponse({ ok: false, error: err.message || "Could not reach moodnest. Is `npm run dev` running?" });
      });
    return true; // keep the message channel open for the async response
  }
});
