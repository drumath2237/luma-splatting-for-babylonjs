import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: resolve(__dirname, "lib/index.ts"),
      name: "luma-splatting-for-babylonjs",
      fileName: "index",
      formats: ["es", "umd"],
    },
    rollupOptions: {
      external: ["@babylonjs/core"],
      output: {
        globals: {
          "@babylonjs/core": "BABYLON",
        },
      },
    },
  },
});
