import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: true,

  tanstackStart: {
    server: {
      entry: "server",
    },
  },

  vite: {
    server: {
      proxy: {
        "/ai-api": {
          target: "https://lapgeniusai-production.up.railway.app",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ai-api/, ""),
        },
      },
    },
  },
});
