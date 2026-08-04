import type { Plugin, Connect } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";
import { db } from "./store";

function readJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function send(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

export function devApiPlugin(): Plugin {
  return {
    name: "moodnest-dev-api",
    configureServer(server) {
      const handler: Connect.NextHandleFunction = async (req, res, next) => {
        if (!req.url?.startsWith("/api/")) return next();

        // Allow the browser extension (running from a chrome-extension:// origin) to call
        // this local API directly. Fine for a single-user local dev server.
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          return res.end();
        }

        const url = new URL(req.url, "http://localhost");
        const path = url.pathname;
        const method = req.method ?? "GET";

        try {
          // GET /api/data — full snapshot
          if (path === "/api/data" && method === "GET") {
            return send(res, 200, db.getAll());
          }

          // GET /api/oembed?url=<pinterest pin url> — proxy Pinterest's public oEmbed endpoint
          if (path === "/api/oembed" && method === "GET") {
            const pinUrl = url.searchParams.get("url");
            if (!pinUrl) return send(res, 400, { error: "Missing url param" });
            const oembedUrl = `https://www.pinterest.com/oembed.json?url=${encodeURIComponent(pinUrl)}`;
            const r = await fetch(oembedUrl);
            if (!r.ok) return send(res, 502, { error: "Pinterest oEmbed lookup failed" });
            const data = await r.json();
            return send(res, 200, {
              title: data.title ?? null,
              imageUrl: data.thumbnail_url ?? null,
              sourceUrl: pinUrl,
            });
          }

          if (path === "/api/boards" && method === "POST") {
            const { name } = await readJsonBody(req);
            if (!name?.trim()) return send(res, 400, { error: "name required" });
            return send(res, 201, db.createBoard(name.trim()));
          }

          const boardMatch = path.match(/^\/api\/boards\/([^/]+)$/);
          if (boardMatch && method === "DELETE") {
            db.deleteBoard(boardMatch[1]);
            return send(res, 200, { ok: true });
          }
          if (boardMatch && method === "PATCH") {
            const { name } = await readJsonBody(req);
            return send(res, 200, db.renameBoard(boardMatch[1], name));
          }

          if (path === "/api/sections" && method === "POST") {
            const { boardId, name } = await readJsonBody(req);
            if (!boardId || !name?.trim()) return send(res, 400, { error: "boardId and name required" });
            return send(res, 201, db.createSection(boardId, name.trim()));
          }

          const sectionMatch = path.match(/^\/api\/sections\/([^/]+)$/);
          if (sectionMatch && method === "DELETE") {
            db.deleteSection(sectionMatch[1]);
            return send(res, 200, { ok: true });
          }
          if (sectionMatch && method === "PATCH") {
            const { name } = await readJsonBody(req);
            return send(res, 200, db.renameSection(sectionMatch[1], name));
          }

          if (path === "/api/pins" && method === "POST") {
            const body = await readJsonBody(req);
            if (!body.boardId || !body.imageUrl) {
              return send(res, 400, { error: "boardId and imageUrl required" });
            }
            return send(res, 201, db.createPin(body));
          }

          const pinMatch = path.match(/^\/api\/pins\/([^/]+)$/);
          if (pinMatch && method === "PATCH") {
            const body = await readJsonBody(req);
            if (typeof body.note === "string") {
              return send(res, 200, db.updatePinNote(pinMatch[1], body.note));
            }
            if (body.boardId !== undefined) {
              return send(res, 200, db.movePin(pinMatch[1], body.boardId, body.sectionId ?? null));
            }
            return send(res, 400, { error: "Nothing to update" });
          }
          if (pinMatch && method === "DELETE") {
            db.deletePin(pinMatch[1]);
            return send(res, 200, { ok: true });
          }

          if (path === "/api/import/bulk" && method === "POST") {
            const body = await readJsonBody(req);
            if (!body.boardName || !Array.isArray(body.pins)) {
              return send(res, 400, { error: "boardName and pins[] required" });
            }
            return send(res, 201, db.bulkImport(body));
          }

          return send(res, 404, { error: "Not found" });
        } catch (err) {
          console.error(err);
          return send(res, 500, { error: "Internal error" });
        }
      };
      server.middlewares.use(handler);
    },
  };
}
