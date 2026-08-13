import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "src/tests/**/*.test.ts",
      "src/model/__tests__/**/*.test.ts",
      "src/normalisation/__tests__/**/*.test.ts",
      "src/claim-extraction/__tests__/**/*.test.ts",
      "src/authority-resolution/__tests__/**/*.test.ts",
      "src/evidence-linkage/__tests__/**/*.test.ts",
      "src/materiality-assessment/__tests__/**/*.test.ts",
      "src/consistency-check/__tests__/**/*.test.ts",
      "src/confidence-scoring/__tests__/**/*.test.ts",
      "src/pipeline/__tests__/**/*.test.ts",
      "src/citation-integrity/__tests__/**/*.test.ts",
      "src/shared/__tests__/**/*.test.ts",
      "src/benchmark/**/__tests__/**/*.test.ts",
    ],
    environment: "node",
  },
});
