import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("node_modules/recharts")) return "charts";
          if (id.includes("node_modules/react-icons")) return "icons";
          return "vendor";
        },
      },
    },
  },
});
