import { defineConfig, UserConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [dts({ rollupTypes: true })],
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      //formats: ["es"],
      name: "GNAP Client JS",
      fileName: (format) => `index.${format}.js`,
    },
  },
  resolve: { alias: { src: resolve("src/") } },
} satisfies UserConfig);
