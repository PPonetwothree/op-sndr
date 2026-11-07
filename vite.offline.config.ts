// Offline edition: one self-contained HTML file (code, styles, data and relief image inlined)
// that opens by double-click from any folder or USB stick – no server, Node or internet needed.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile({ removeViteModuleLoader: true })],
  resolve: { alias: [{ find: /^@\//, replacement: "/src/" }] },
  base: "./",
  define: { "import.meta.env.VITE_OFFLINE_EDITION": JSON.stringify("1") },
  build: {
    outDir: "dist-offline",
    emptyOutDir: true,
    assetsInlineLimit: 100_000_000, // inline everything, including the 2.4 MB relief image
    cssCodeSplit: false,
    chunkSizeWarningLimit: 10_000, // a single file is the point of this build
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});
