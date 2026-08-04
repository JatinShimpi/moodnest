import { useState } from "react";
import { Dialog } from "./ui/Dialog";
import { Input, Textarea } from "./ui/Input";
import { Button } from "./ui/Button";
import { api } from "@/lib/api";
import type { Section } from "@/types";

export function AddPinDialog({
  open,
  onClose,
  sections,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  sections: Section[];
  onCreate: (input: {
    imageUrl: string;
    sourceUrl: string | null;
    title: string | null;
    note: string;
    sectionId: string | null;
  }) => Promise<void>;
}) {
  const [pinterestUrl, setPinterestUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setPinterestUrl("");
    setImageUrl("");
    setTitle("");
    setNote("");
    setSectionId(null);
    setFetchError(null);
  }

  async function handleFetch() {
    if (!pinterestUrl.trim()) return;
    setFetching(true);
    setFetchError(null);
    try {
      const data = await api.fetchOembed(pinterestUrl.trim());
      if (data.imageUrl) setImageUrl(data.imageUrl);
      if (data.title) setTitle(data.title);
      if (!data.imageUrl) setFetchError("No image returned — paste the image URL manually below.");
    } catch {
      setFetchError("Couldn't reach Pinterest's oEmbed endpoint — paste the image URL manually below.");
    } finally {
      setFetching(false);
    }
  }

  async function handleSubmit() {
    if (!imageUrl.trim()) return;
    setSubmitting(true);
    try {
      await onCreate({
        imageUrl: imageUrl.trim(),
        sourceUrl: pinterestUrl.trim() || null,
        title: title.trim() || null,
        note: note.trim(),
        sectionId,
      });
      reset();
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={() => { reset(); onClose(); }} title="Add pin">
      <div className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-[12px] text-text-muted">Pinterest pin URL</label>
          <div className="flex gap-2">
            <Input
              value={pinterestUrl}
              onChange={(e) => setPinterestUrl(e.target.value)}
              placeholder="https://www.pinterest.com/pin/..."
            />
            <Button variant="ghost" onClick={handleFetch} disabled={fetching || !pinterestUrl.trim()}>
              {fetching ? "Fetching…" : "Fetch"}
            </Button>
          </div>
          {fetchError && <p className="mt-1 text-[12px] text-danger">{fetchError}</p>}
        </div>

        <div>
          <label className="mb-1 block text-[12px] text-text-muted">Image URL</label>
          <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
        </div>

        {imageUrl && (
          <img src={imageUrl} alt="" className="max-h-40 w-full rounded-md object-cover" />
        )}

        <div>
          <label className="mb-1 block text-[12px] text-text-muted">Title (optional)</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Untitled" />
        </div>

        <div>
          <label className="mb-1 block text-[12px] text-text-muted">Note</label>
          <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note…" />
        </div>

        {sections.length > 0 && (
          <div>
            <label className="mb-1 block text-[12px] text-text-muted">Section (optional)</label>
            <select
              value={sectionId ?? ""}
              onChange={(e) => setSectionId(e.target.value || null)}
              className="w-full rounded-md border border-border bg-panel px-2.5 py-1.5 text-[13px] text-text focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">No section (board root)</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-1 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => { reset(); onClose(); }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!imageUrl.trim() || submitting}>
            {submitting ? "Adding…" : "Add pin"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
