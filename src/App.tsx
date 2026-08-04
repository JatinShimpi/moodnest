import { useEffect, useState } from "react";
import type { Board, Pin, Section, SelectedView, Store } from "@/types";
import { api } from "@/lib/api";
import { Sidebar } from "@/components/Sidebar";
import { BoardView } from "@/components/BoardView";
import { AddPinDialog } from "@/components/AddPinDialog";
import { PromptDialog } from "@/components/PromptDialog";

export default function App() {
  const [store, setStore] = useState<Store | null>(null);
  const [selected, setSelected] = useState<SelectedView | null>(null);
  const [addPinOpen, setAddPinOpen] = useState(false);
  const [newBoardOpen, setNewBoardOpen] = useState(false);
  const [newSectionFor, setNewSectionFor] = useState<string | null>(null);

  useEffect(() => {
    api.getData().then((data) => {
      setStore(data);
      if (data.boards[0]) setSelected({ type: "board", boardId: data.boards[0].id });
    });
  }, []);

  if (!store) {
    return <div className="flex h-screen items-center justify-center text-text-faint">Loading…</div>;
  }

  const activeBoard: Board | undefined = store.boards.find(
    (b) => b.id === (selected?.type === "board" ? selected.boardId : selected?.boardId)
  );
  const activeSection: Section | undefined =
    selected?.type === "section" ? store.sections.find((s) => s.id === selected.sectionId) : undefined;

  const visiblePins: Pin[] =
    selected?.type === "section"
      ? store.pins.filter((p) => p.sectionId === selected.sectionId)
      : store.pins.filter((p) => p.boardId === activeBoard?.id && !p.sectionId);

  const boardSections = store.sections.filter((s) => s.boardId === activeBoard?.id);

  async function handleCreateBoard(name: string) {
    const board = await api.createBoard(name);
    setStore((s) => (s ? { ...s, boards: [...s.boards, board] } : s));
    setSelected({ type: "board", boardId: board.id });
  }

  async function handleCreateSection(name: string) {
    if (!newSectionFor) return;
    const section = await api.createSection(newSectionFor, name);
    setStore((s) => (s ? { ...s, sections: [...s.sections, section] } : s));
  }

  async function handleCreatePin(input: {
    imageUrl: string;
    sourceUrl: string | null;
    title: string | null;
    note: string;
    sectionId: string | null;
  }) {
    if (!activeBoard) return;
    const pin = await api.createPin({ boardId: activeBoard.id, ...input });
    setStore((s) => (s ? { ...s, pins: [...s.pins, pin] } : s));
  }

  async function handleUpdateNote(pinId: string, note: string) {
    await api.updatePinNote(pinId, note);
    setStore((s) => (s ? { ...s, pins: s.pins.map((p) => (p.id === pinId ? { ...p, note } : p)) } : s));
  }

  async function handleDeletePin(pinId: string) {
    await api.deletePin(pinId);
    setStore((s) => (s ? { ...s, pins: s.pins.filter((p) => p.id !== pinId) } : s));
  }

  const pageTitle = activeSection ? `${activeBoard?.name} / ${activeSection.name}` : activeBoard?.name ?? "";

  return (
    <div className="flex h-screen w-full">
      <Sidebar
        boards={store.boards}
        sections={store.sections}
        pins={store.pins}
        selected={selected}
        onSelect={setSelected}
        onCreateBoard={() => setNewBoardOpen(true)}
        onCreateSection={(boardId) => setNewSectionFor(boardId)}
      />

      <BoardView
        title={pageTitle}
        pins={visiblePins}
        onAddPin={() => setAddPinOpen(true)}
        onUpdateNote={handleUpdateNote}
        onDeletePin={handleDeletePin}
      />

      <AddPinDialog
        open={addPinOpen}
        onClose={() => setAddPinOpen(false)}
        sections={boardSections}
        onCreate={handleCreatePin}
      />

      <PromptDialog
        open={newBoardOpen}
        title="New board"
        placeholder="Board name"
        onClose={() => setNewBoardOpen(false)}
        onSubmit={handleCreateBoard}
      />

      <PromptDialog
        open={newSectionFor !== null}
        title="New section"
        placeholder="Section name"
        onClose={() => setNewSectionFor(null)}
        onSubmit={handleCreateSection}
      />
    </div>
  );
}
