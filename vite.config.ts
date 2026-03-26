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

  // Build optimization
  build: {
    target: "esnext",
    minify: "esbuild",
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Tauri
            if (id.includes("@tauri-apps")) return "vendor-tauri";
            // Framer Motion
            if (id.includes("framer-motion")) return "vendor-framer";
            // Radix UI - explicit list for better splitting
            if (
              id.includes("radix-ui") ||
              id.includes("@radix-ui/react-dropdown-menu") ||
              id.includes("@radix-ui/react-select") ||
              id.includes("@radix-ui/react-tabs") ||
              id.includes("@radix-ui/react-scroll-area") ||
              id.includes("@radix-ui/react-label") ||
              id.includes("@radix-ui/react-progress") ||
              id.includes("@radix-ui/react-dialog") ||
              id.includes("@radix-ui/react-popover") ||
              id.includes("@radix-ui/react-checkbox")
            )
              return "vendor-radix";
            // Utils - explicit list
            if (
              id.includes("lucide-react") ||
              id.includes("sonner") ||
              id.includes("zustand") ||
              id.includes("clsx") ||
              id.includes("tailwind-merge") ||
              id.includes("class-variance-authority")
            )
              return "vendor-utils";
            // Everything else (Tailwind, fonts, etc.)
            return "vendor";
          }
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
