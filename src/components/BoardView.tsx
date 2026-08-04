import { Plus } from "lucide-react";
import type { Pin } from "@/types";
import { PinCard } from "./PinCard";
import { Button } from "./ui/Button";

export function BoardView({
  title,
  pins,
  onAddPin,
  onUpdateNote,
  onDeletePin,
}: {
  title: string;
  pins: Pin[];
  onAddPin: () => void;
  onUpdateNote: (pinId: string, note: string) => void;
  onDeletePin: (pinId: string) => void;
}) {
  return (
    <div className="flex h-full flex-1 flex-col overflow-y-auto">
      <header className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
        <h1 className="text-[20px] font-semibold text-text">{title}</h1>
        <Button onClick={onAddPin}>
          <Plus size={14} /> Add pin
        </Button>
      </header>

      <div className="flex-1 px-6 py-5">
        {pins.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-text-faint">
            <p className="text-[13px]">No pins here yet.</p>
            <button onClick={onAddPin} className="mt-1 text-[13px] text-accent hover:text-accent-hover">
              Add your first pin
            </button>
          </div>
        ) : (
          <div className="columns-2 gap-3 md:columns-3 lg:columns-4 xl:columns-5">
            {pins.map((pin) => (
              <PinCard
                key={pin.id}
                pin={pin}
                onUpdateNote={(note) => onUpdateNote(pin.id, note)}
                onDelete={() => onDeletePin(pin.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
