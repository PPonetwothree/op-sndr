import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Root-relative alias avoids duplicate module instances from Windows absolute paths.
  resolve: { alias: [{ find: /^@\//, replacement: "/src/" }] },
  server: { port: 5173, host: "127.0.0.1" },
  preview: { port: 4173, host: "127.0.0.1" },
  build: {
    rollupOptions: {
      output: {
        // Long-lived vendor chunks cache separately from app code and data.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (/[\/](leaflet|react-leaflet|@react-leaflet)[\/]/.test(id)) return "vendor-map";
          if (/[\/](react|react-dom|scheduler|zustand)[\/]/.test(id)) return "vendor-react";
          if (/[\/](zod|@radix-ui|lucide-react|clsx|tailwind-merge|class-variance-authority)[\/]/.test(id)) return "vendor-ui";
          return undefined;
        },
      },
    },
  },
});
