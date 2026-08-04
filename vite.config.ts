import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { devApiPlugin } from "./server/devApiPlugin";
import path from "node:path";

export default defineConfig({
  plugins: [react(), devApiPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
