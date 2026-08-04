import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, "data.json");

export type Board = { id: string; name: string; createdAt: number };
export type Section = { id: string; boardId: string; name: string; createdAt: number };
export type Pin = {
  id: string;
  boardId: string;
  sectionId: string | null;
  imageUrl: string;
  sourceUrl: string | null;
  title: string | null;
  note: string;
  createdAt: number;
};

type Store = { boards: Board[]; sections: Section[]; pins: Pin[] };

function seed(): Store {
  const boardId = "board-welcome";
  return {
    boards: [{ id: boardId, name: "Welcome", createdAt: Date.now() }],
    sections: [],
    pins: [],
  };
}

function load(): Store {
  if (!existsSync(DATA_FILE)) {
    const initial = seed();
    writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(readFileSync(DATA_FILE, "utf-8"));
}

function save(store: Store) {
  writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const db = {
  getAll(): Store {
    return load();
  },
  createBoard(name: string): Board {
    const store = load();
    const board: Board = { id: id("board"), name, createdAt: Date.now() };
    store.boards.push(board);
    save(store);
    return board;
  },
  createSection(boardId: string, name: string): Section {
    const store = load();
    const section: Section = { id: id("section"), boardId, name, createdAt: Date.now() };
    store.sections.push(section);
    save(store);
    return section;
  },
  createPin(input: {
    boardId: string;
    sectionId: string | null;
    imageUrl: string;
    sourceUrl: string | null;
    title: string | null;
    note?: string;
  }): Pin {
    const store = load();
    const pin: Pin = {
      id: id("pin"),
      boardId: input.boardId,
      sectionId: input.sectionId ?? null,
      imageUrl: input.imageUrl,
      sourceUrl: input.sourceUrl ?? null,
      title: input.title ?? null,
      note: input.note ?? "",
      createdAt: Date.now(),
    };
    store.pins.push(pin);
    save(store);
    return pin;
  },
  updatePinNote(pinId: string, note: string): Pin | null {
    const store = load();
    const pin = store.pins.find((p) => p.id === pinId);
    if (!pin) return null;
    pin.note = note;
    save(store);
    return pin;
  },
  movePin(pinId: string, boardId: string, sectionId: string | null): Pin | null {
    const store = load();
    const pin = store.pins.find((p) => p.id === pinId);
    if (!pin) return null;
    pin.boardId = boardId;
    pin.sectionId = sectionId;
    save(store);
    return pin;
  },
  deletePin(pinId: string) {
    const store = load();
    store.pins = store.pins.filter((p) => p.id !== pinId);
    save(store);
  },
  deleteBoard(boardId: string) {
    const store = load();
    store.boards = store.boards.filter((b) => b.id !== boardId);
    store.sections = store.sections.filter((s) => s.boardId !== boardId);
    store.pins = store.pins.filter((p) => p.boardId !== boardId);
    save(store);
  },
  deleteSection(sectionId: string) {
    const store = load();
    store.sections = store.sections.filter((s) => s.id !== sectionId);
    for (const pin of store.pins) {
      if (pin.sectionId === sectionId) pin.sectionId = null;
    }
    save(store);
  },
  renameBoard(boardId: string, name: string) {
    const store = load();
    const board = store.boards.find((b) => b.id === boardId);
    if (board) board.name = name;
    save(store);
    return board ?? null;
  },
  renameSection(sectionId: string, name: string) {
    const store = load();
    const section = store.sections.find((s) => s.id === sectionId);
    if (section) section.name = name;
    save(store);
    return section ?? null;
  },
};
