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
    },
    build: {
      rollupOptions: {
        input: {
          browser: resolve(__dirname, 'src/preload/browser.js'),
          icon: resolve(__dirname, 'src/preload/icon.js')
        }
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
    build: {
      rollupOptions: {
        input: {
          browser: resolve(__dirname, 'src/renderer/browser.html'),
          icon: resolve(__dirname, 'src/renderer/icon.html')
        }
      }
    }
  }
});
