import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist",
    emptyOutDir: false,
  },
  server: {
    allowedHosts: true,    // allows cloudflared / ngrok tunnels in dev; has no effect on the production build
  },
});
