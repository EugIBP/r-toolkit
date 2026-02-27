import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Split vendor chunks for better caching
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React ecosystem
          "vendor-react": ["react", "react-dom"],
          // Radix UI components
          "vendor-radix": [
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-label",
            "@radix-ui/react-progress",
            "@radix-ui/react-dialog",
            "@radix-ui/react-popover",
          ],
          // Other vendors
          "vendor-utils": ["lucide-react", "sonner", "framer-motion", "zustand", "clsx", "tailwind-merge"],
        },
      },
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
