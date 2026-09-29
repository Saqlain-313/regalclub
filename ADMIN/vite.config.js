import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/admin/",
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:9099",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "http://localhost:9099",
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
