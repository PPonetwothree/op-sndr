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
          const p = id.split(String.fromCharCode(92)).join("/"); // normalise Windows paths
          if (p.includes("/src/data/geo/")) return "data-geo"; // basemap layers and pre-rendered symbols
          if (/\/src\/data\/(events|targets|weapons|sources)\.json/.test(p)) return "data-campaign";
          if (!p.includes("/node_modules/")) return undefined;
          const pkg = (names: string[]) => names.some((n) => p.includes(`/node_modules/${n}/`));
          if (pkg(["leaflet", "react-leaflet", "@react-leaflet"])) return "vendor-map";
          if (pkg(["react", "react-dom", "scheduler", "zustand"])) return "vendor-react";
          if (pkg(["zod", "@radix-ui", "lucide-react", "clsx", "tailwind-merge", "class-variance-authority"])) return "vendor-ui";
          return undefined;
        },
      },
    },
  },
});
