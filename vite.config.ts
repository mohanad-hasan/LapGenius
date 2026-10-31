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
          target: "https://lapgenius-ai.onrender.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ai-api/, ""),
        },
      },
    },
  },
});
