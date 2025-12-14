import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const hmrProtocol = process.env.VITE_HMR_PROTOCOL || "ws"; // ← wss
const hmrHost = process.env.VITE_HMR_HOST || "localhost"; // ← localhost
const hmrClientPort = Number(process.env.VITE_HMR_CLIENT_PORT || 3000); // ← 443

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  assetsInclude: ["**/*.svg"],
  server: {
    port: 3000,
    host: true,
    hmr: {
      protocol: hmrProtocol as "ws" | "wss",
      host: hmrHost,
      clientPort: hmrClientPort,
    },
    allowedHosts: [
      ...new Set([
        "localhost",
        "127.0.0.1",
        "0.0.0.0",
        process.env.HOST || "localhost",
      ]),
    ],
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
});
