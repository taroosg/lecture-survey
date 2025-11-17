import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  test: {
    pool: "forks",
    projects: [
      {
        test: {
          name: "convex",
          include: ["convex/**/*.test.ts"],
          environment: "edge-runtime",
          server: { deps: { inline: ["convex-test"] } },
        },
      },
      {
        test: {
          name: "components",
          include: ["components/**/*.test.tsx", "app/**/*.test.tsx"],
          environment: "jsdom",
          setupFiles: ["./vitest.setup.ts"],
        },
      },
      {
        test: {
          name: "lib",
          include: ["lib/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        test: {
          name: "utils",
          include: ["utils/**/*.test.ts"],
          environment: "node",
        },
      },
    ],
  },
});
