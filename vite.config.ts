import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import path from "path"
import tailwindcss from "@tailwindcss/vite"
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@/components": path.resolve(__dirname, "./src/react-app/components"),
      "@/hooks": path.resolve(__dirname, "./src/react-app/hooks"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
      "@/pages": path.resolve(__dirname, "./src/react-app/pages"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
})