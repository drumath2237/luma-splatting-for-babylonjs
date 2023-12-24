import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "./lib/index.ts",
      name: "luma-splatting-for-babylonjs",
      fileName: "index",
      formats: ["es", "umd"],
    },
  },
});
