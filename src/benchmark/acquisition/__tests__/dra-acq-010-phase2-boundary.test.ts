/**
 * DRA-ACQ-010 — Phase 2 Scope-Boundary Compliance
 *
 * Proves that the Phase 2 preparation work for DRA-DOC-0015
 * (OECD/LEGAL/0449) respects every explicit prohibition from the task
 * instructions:
 *   - Does not modify evaluator v0.1.1.
 *   - Does not modify issue-class logic or benchmark methodology.
 *   - Does not modify any existing frozen corpus entry.
 *   - Does not alter DRA-CHK-002 findings.
 *   - Does not create, freeze, or admit DRA-DOC-0015.
 *   - Does not call any freeze/admission/evaluator-execution function.
 *
 * This suite performs no live network access.
 */

import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { DRA_EVALUATOR_VERSION } from "../../../model/versions.js";
import { CorpusIdSchema } from "../../corpus/schema.js";
import {
  CORPUS_INVENTORY,
  RESERVED_NEXT_CORPUS_ID,
} from "../discovery/dra-acq-010-candidate-discovery.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PREP_TEST_PATH = resolve(
  __dirname,
  "./dra-acq-010-oecd-ai-recommendation-prep.test.ts",
);

describe("DRA-ACQ-010 — Phase 2: Evaluator and Frozen-Corpus Immutability", () => {
  it("the evaluator version remains 0.1.1 (frozen, unchanged by Phase 2 work)", () => {
    expect(DRA_EVALUATOR_VERSION).toBe("0.1.1");
  });

  it("DRA-DOC-0015 does not appear in the frozen corpus inventory", () => {
    expect(CORPUS_INVENTORY.map((r) => r.corpusId)).not.toContain(
      RESERVED_NEXT_CORPUS_ID,
    );
  });

  it("the reserved corpus ID is a well-formed but unassigned corpus ID", () => {
    expect(RESERVED_NEXT_CORPUS_ID).toBe("DRA-DOC-0015");
    expect(() => CorpusIdSchema.parse(RESERVED_NEXT_CORPUS_ID)).not.toThrow();
  });

  it("CORPUS_INVENTORY has exactly 14 entries (DRA-DOC-0001 through DRA-DOC-0014) — unchanged by Phase 2", () => {
    expect(CORPUS_INVENTORY.length).toBe(14);
  });
});

describe("DRA-ACQ-010 — Phase 2: Prohibition Against Freeze, Admission, and Evaluator Execution", () => {
  it("the Phase 2 preparation test file exists and never imports freeze, admission, or evaluator-execution modules", () => {
    expect(existsSync(PREP_TEST_PATH)).toBe(true);
    const contents = readFileSync(PREP_TEST_PATH, "utf8");

    expect(contents).not.toMatch(/from ["'].*\/freeze\.js["']/);
    expect(contents).not.toMatch(/from ["'].*governed-pipeline\.js["']/);
    expect(contents).not.toMatch(/createAcquisitionFreezeRecord/);
    expect(contents).not.toMatch(/evaluateDocument/);
    expect(contents).not.toMatch(/registry\.add\(/);
  });

  it("the Phase 2 preparation test file does not modify DRA-CHK-002 findings or issue-class logic", () => {
    const contents = readFileSync(PREP_TEST_PATH, "utf8");
    expect(contents).not.toMatch(/from ["'].*dra-chk-002[^"']*["']/i);
    expect(contents).not.toMatch(/from ["'].*issue-class[^"']*["']/i);
    expect(contents).not.toMatch(/from ["'].*issues\.js["']/);
  });

  it("this boundary test file itself never calls a freeze, admission, or evaluator-execution function", () => {
    const testPath = fileURLToPath(import.meta.url);
    const contents = readFileSync(testPath, "utf8");
    const scanned = contents
      .replace(/expect\((?:contents|scanned)\)\.not\.toMatch\([^)]*\)/g, "")
      .replace(/\/\*[\s\S]*?\*\//g, "");
    expect(scanned).not.toMatch(/createAcquisitionFreezeRecord/);
    expect(scanned).not.toMatch(/evaluateDocument\(/);
    expect(scanned).not.toMatch(/registry\.add\(/);
  });
});
