import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Root-relative alias avoids duplicate module instances from Windows absolute paths.
  resolve: { alias: [{ find: /^@\//, replacement: "/src/" }] },
  server: { port: 5173, host: "127.0.0.1" },
});
