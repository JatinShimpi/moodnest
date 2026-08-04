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

export type Store = { boards: Board[]; sections: Section[]; pins: Pin[] };

export type SelectedView =
  | { type: "board"; boardId: string }
  | { type: "section"; boardId: string; sectionId: string };
