import { useState } from "react";
import { ChevronRight, LayoutGrid, Plus } from "lucide-react";
import clsx from "clsx";
import type { Board, Section, SelectedView, Pin } from "@/types";
import { Button } from "./ui/Button";

export function Sidebar({
  boards,
  sections,
  pins,
  selected,
  onSelect,
  onCreateBoard,
  onCreateSection,
}: {
  boards: Board[];
  sections: Section[];
  pins: Pin[];
  selected: SelectedView | null;
  onSelect: (view: SelectedView) => void;
  onCreateBoard: () => void;
  onCreateSection: (boardId: string) => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(boardId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(boardId) ? next.delete(boardId) : next.add(boardId);
      return next;
    });
  }

  return (
    <aside className="flex h-full w-60 flex-shrink-0 flex-col border-r border-border-subtle bg-bg-elevated">
      <div className="flex items-center gap-2 px-3 py-3.5">
        <div className="flex h-5 w-5 items-center justify-center rounded bg-accent text-[11px] font-bold text-white">
          m
        </div>
        <span className="text-[13px] font-semibold text-text">moodnest</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-1">
        {boards.map((board) => {
          const boardSections = sections.filter((s) => s.boardId === board.id);
          const isExpanded = expanded.has(board.id);
          const isBoardActive = selected?.type === "board" && selected.boardId === board.id;
          const pinCount = pins.filter((p) => p.boardId === board.id && !p.sectionId).length;

          return (
            <div key={board.id}>
              <Row
                active={isBoardActive}
                onClick={() => onSelect({ type: "board", boardId: board.id })}
                icon={
                  boardSections.length > 0 ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(board.id);
                      }}
                      className="flex h-4 w-4 items-center justify-center text-text-faint hover:text-text"
                    >
                      <ChevronRight
                        size={12}
                        className={clsx("transition-transform duration-150", isExpanded && "rotate-90")}
                      />
                    </button>
                  ) : (
                    <LayoutGrid size={13} className="text-text-faint" />
                  )
                }
                label={board.name}
                count={pinCount}
              />

              {isExpanded && (
                <div className="ml-3 border-l border-border-subtle pl-2">
                  {boardSections.map((section) => {
                    const isSectionActive =
                      selected?.type === "section" && selected.sectionId === section.id;
                    const sectionPinCount = pins.filter((p) => p.sectionId === section.id).length;
                    return (
                      <Row
                        key={section.id}
                        active={isSectionActive}
                        onClick={() => onSelect({ type: "section", boardId: board.id, sectionId: section.id })}
                        icon={<span className="block h-1 w-1 rounded-full bg-text-faint" />}
                        label={section.name}
                        count={sectionPinCount}
                      />
                    );
                  })}
                  <button
                    onClick={() => onCreateSection(board.id)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-[12px] text-text-faint hover:text-text-muted"
                  >
                    <Plus size={11} /> New section
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-border-subtle p-2">
        <Button variant="ghost" className="w-full justify-center" onClick={onCreateBoard}>
          <Plus size={13} /> New board
        </Button>
      </div>
    </aside>
  );
}

function Row({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "group relative flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors duration-150",
        active ? "bg-panel text-text" : "text-text-muted hover:bg-panel-hover hover:text-text"
      )}
    >
      {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-accent" />}
      <span className="flex h-4 w-4 items-center justify-center">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {count > 0 && <span className="text-[11px] text-text-faint">{count}</span>}
    </button>
  );
}
