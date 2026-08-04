import type { Board, Pin, Section, Store } from "@/types";

async function req<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getData: () => req<Store>("/api/data"),

  createBoard: (name: string) => req<Board>("/api/boards", { method: "POST", body: JSON.stringify({ name }) }),
  renameBoard: (boardId: string, name: string) =>
    req<Board>(`/api/boards/${boardId}`, { method: "PATCH", body: JSON.stringify({ name }) }),
  deleteBoard: (boardId: string) => req(`/api/boards/${boardId}`, { method: "DELETE" }),

  createSection: (boardId: string, name: string) =>
    req<Section>("/api/sections", { method: "POST", body: JSON.stringify({ boardId, name }) }),
  renameSection: (sectionId: string, name: string) =>
    req<Section>(`/api/sections/${sectionId}`, { method: "PATCH", body: JSON.stringify({ name }) }),
  deleteSection: (sectionId: string) => req(`/api/sections/${sectionId}`, { method: "DELETE" }),

  createPin: (input: {
    boardId: string;
    sectionId: string | null;
    imageUrl: string;
    sourceUrl: string | null;
    title: string | null;
    note?: string;
  }) => req<Pin>("/api/pins", { method: "POST", body: JSON.stringify(input) }),
  updatePinNote: (pinId: string, note: string) =>
    req<Pin>(`/api/pins/${pinId}`, { method: "PATCH", body: JSON.stringify({ note }) }),
  movePin: (pinId: string, boardId: string, sectionId: string | null) =>
    req<Pin>(`/api/pins/${pinId}`, { method: "PATCH", body: JSON.stringify({ boardId, sectionId }) }),
  deletePin: (pinId: string) => req(`/api/pins/${pinId}`, { method: "DELETE" }),

  fetchOembed: (pinterestUrl: string) =>
    req<{ title: string | null; imageUrl: string | null; sourceUrl: string }>(
      `/api/oembed?url=${encodeURIComponent(pinterestUrl)}`
    ),
};
