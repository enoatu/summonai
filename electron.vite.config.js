import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        "@": resolve("src"),
        "@common": resolve("src/common")
      }
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        "@": resolve("src"),
        "@common": resolve("src/common")
      }
    }
  },
  renderer: {
    plugins: [react()],
    resolve: {
      alias: {
        "@": resolve("src"),
        "@common": resolve("src/common"),
        "@renderer": resolve("src/renderer/src")
      }
    },
  }
});
