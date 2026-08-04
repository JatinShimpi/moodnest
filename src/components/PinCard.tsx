import { useState } from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import type { Pin } from "@/types";
import { Textarea } from "./ui/Input";

export function PinCard({
  pin,
  onUpdateNote,
  onDelete,
}: {
  pin: Pin;
  onUpdateNote: (note: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(pin.note);

  function commit() {
    setEditing(false);
    if (note !== pin.note) onUpdateNote(note);
  }

  return (
    <div className="group mb-3 break-inside-avoid overflow-hidden rounded-card border border-border bg-panel transition-colors duration-150 hover:bg-panel-hover">
      <div className="relative">
        <img src={pin.imageUrl} alt={pin.title ?? ""} className="w-full object-cover" loading="lazy" />
        <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {pin.sourceUrl && (
            <a
              href={pin.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="flex h-6 w-6 items-center justify-center rounded-md bg-bg/80 text-text-muted hover:text-text"
            >
              <ExternalLink size={12} />
            </a>
          )}
          <button
            onClick={onDelete}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-bg/80 text-text-muted hover:text-danger"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div className="p-2.5">
        {pin.title && <p className="mb-1 text-[12px] font-medium text-text-muted">{pin.title}</p>}
        {editing ? (
          <Textarea
            autoFocus
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commit();
              if (e.key === "Escape") {
                setNote(pin.note);
                setEditing(false);
              }
            }}
            rows={3}
            placeholder="Add a note…"
          />
        ) : (
          <p
            onClick={() => setEditing(true)}
            className={
              note
                ? "cursor-text whitespace-pre-wrap text-[13px] text-text-muted"
                : "cursor-text text-[13px] text-text-faint"
            }
          >
            {note || "Add a note…"}
          </p>
        )}
      </div>
    </div>
  );
}
