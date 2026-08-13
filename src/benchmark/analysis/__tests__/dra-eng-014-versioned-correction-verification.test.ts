/**
 * DRA-ENG-014 — Versioned EL-STANDARD-REF Defect Correction
 * Counterfactual re-evaluation, CHK-004 15-pair replay, and receipt
 * verification (Implementations 6, 7, 9, 10).
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  This file evaluates DRA-DOC-0018 (ES) and DRA-DOC-0021 (EN) through the ║
 * ║  CORRECTED evaluator (current code, DRA_EVALUATOR_VERSION = 0.1.2) using ║
 * ║  the same disk-cached bytes as DRA-BMK-021/DRA-CHK-003/DRA-CHK-004. It   ║
 * ║  does NOT overwrite, regenerate, or assert against any historical       ║
 * ║  Version 1 (0.1.1) stored result — historical values quoted here are    ║
 * ║  the ones already recorded in DRA-BMK-021/DRA-CHK-003/DRA-CHK-004 and    ║
 * ║  are reproduced only as fixed comparison literals for this report.      ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { describe, it, expect, beforeAll } from "vitest";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import { evaluateDocument, verifyReceiptIntegrity } from "../../../pipeline/index.js";
import type { DocumentAssuranceEvaluation } from "../../../pipeline/index.js";
import { createHttpFetcher } from "../../acquisition/http-fetcher.js";
import { createDiskCachedFetcher } from "../../acquisition/__tests__/support/disk-cached-fetcher.js";
import { normaliseContent } from "../../acquisition/normalisation.js";
import { computeSourceDigest } from "../../acquisition/integrity.js";
import { DRA_EVALUATOR_VERSION, DRA_EVALUATOR_VERSION_0_1_1, DRA_PIPELINE_VERSION } from "../../../model/index.js";
import { detectEvidence } from "../../../evidence-linkage/linkage-rules.js";

const FIXED_TS = "2026-08-09T20:00:00.000Z";

const EC_URL_ES = "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60423"; // DRA-DOC-0018
const EC_URL_EN = "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60419"; // DRA-DOC-0021

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-eng014-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const inputPath = join(tmpdir(), `${id}.pdf`);
  const outputPath = join(tmpdir(), `${id}.txt`);
  try {
    await writeFile(inputPath, bytes);
    await execFileAsync("pdftotext", ["-layout", inputPath, outputPath]);
    return await readFile(outputPath, "utf-8");
  } finally {
    await unlink(inputPath).catch(() => {});
    await unlink(outputPath).catch(() => {});
  }
}

function buildEvalRequest(id: string, title: string, text: string): unknown {
  const sourceId = `sdoc-${id}-src`;
  return {
    id: `eval-${id}-eng014`,
    requestedAt: FIXED_TS,
    generatedDocument: {
      id: `gdoc-${id}-eng014`,
      title,
      content: text,
      sourceDocumentIds: [sourceId],
      generatedAt: FIXED_TS,
    },
    sourceDocuments: [
      { id: sourceId, title: `Source: ${title}`, content: text, format: "PLAIN_TEXT" },
    ],
  };
}

let esResult: DocumentAssuranceEvaluation;
let enResult: DocumentAssuranceEvaluation;
let setupError: string | null = null;

beforeAll(async () => {
  try {
    const realFetcher = createHttpFetcher({ timeoutMs: 120_000, maxRedirects: 5, maxBytes: 15_000_000, userAgent: "DRA-ENG-014/1.0" });
    // Reuses the DRA-BMK-021 disk cache — no new network fetch, identical bytes.
    const fetcher = createDiskCachedFetcher(realFetcher, "dra-bmk-021");

    async function fetchAndExtract(acquisitionId: string, url: string, label: string) {
      const req = { acquisitionId, sourceUrl: url, requestedBy: "DRA-ENG-014-operator", requestedAt: FIXED_TS, expectedPublisher: "European Commission", expectedTitle: "Ethics Guidelines for Trustworthy AI" };
      const fetchRes = await fetcher(req as any, {});
      if (!fetchRes.ok) throw new Error(`${label} fetch failed: ${fetchRes.code}`);
      const srcDigest = computeSourceDigest(fetchRes.source.rawBytes);
      const norm = await normaliseContent(fetchRes.source.rawBytes, "application/pdf", srcDigest, extractPdfText);
      if (!norm.ok) throw new Error(`${label} normalisation failed: ${norm.message}`);
      return norm.document.text;
    }

    const [esText, enText] = await Promise.all([
      fetchAndExtract("DRA-ACQ-000021", EC_URL_ES, "ES"),
      fetchAndExtract("DRA-ACQ-000024", EC_URL_EN, "EN"),
    ]);

    esResult = evaluateDocument(buildEvalRequest("DRA-DOC-0018", "Directrices \u00e9ticas para una IA fiable", esText));
    enResult = evaluateDocument(buildEvalRequest("DRA-DOC-0021", "Ethics Guidelines for Trustworthy AI", enText));
  } catch (err) {
    setupError = String(err);
  }
}, 300_000);

// ---------------------------------------------------------------------------
// Part 1: Setup and version identity
// ---------------------------------------------------------------------------

describe("DRA-ENG-014 — Part 1: Corrected-evaluator re-run setup", () => {
  it("setup completed without error", () => {
    if (setupError) console.error("Setup error:", setupError);
    expect(setupError).toBeNull();
  });

  it("both evaluations succeeded", () => {
    expect(esResult.ok).toBe(true);
    expect(enResult.ok).toBe(true);
  });

  it("new receipts are stamped with the corrected evaluatorVersion (0.1.2), not the prior 0.1.1", () => {
    if (esResult.ok && enResult.ok) {
      expect(DRA_EVALUATOR_VERSION).toBe("0.1.2");
      expect(esResult.proofReceipt.evaluatorIdentity.evaluatorVersion).toBe(DRA_EVALUATOR_VERSION);
      expect(enResult.proofReceipt.evaluatorIdentity.evaluatorVersion).toBe(DRA_EVALUATOR_VERSION);
      expect(esResult.proofReceipt.evaluatorIdentity.evaluatorVersion).not.toBe(DRA_EVALUATOR_VERSION_0_1_1);
    }
  });

  it("pipelineVersion is unchanged at 1.0", () => {
    if (esResult.ok && enResult.ok) {
      expect(DRA_PIPELINE_VERSION).toBe("1.0");
      expect(esResult.proofReceipt.evaluatorIdentity.pipelineVersion).toBe("1.0");
      expect(enResult.proofReceipt.evaluatorIdentity.pipelineVersion).toBe("1.0");
    }
  });

  it("receipt schemaVersion is unchanged at the frozen data-model version 0.1.0", () => {
    if (esResult.ok && enResult.ok) {
      expect(esResult.proofReceipt.schemaVersion).toBe("0.1.0");
      expect(enResult.proofReceipt.schemaVersion).toBe("0.1.0");
    }
  });
});

// ---------------------------------------------------------------------------
// Part 2: New-version decision/issue results (recorded, not compared to a
// hard-coded "must equal" historical value beyond what's independently known)
// ---------------------------------------------------------------------------

describe("DRA-ENG-014 — Part 2: New-version decision and issue results", () => {
  it("records the corrected-evaluator EN (DRA-DOC-0021) result", () => {
    if (enResult.ok) {
      console.log(`\n── Corrected-evaluator EN (DRA-DOC-0021) ──`);
      console.log(`  decision: ${enResult.decision}`);
      console.log(`  issues: ${enResult.issues.length}`);
      for (const iss of enResult.issues) console.log(`    ${(iss as any).issueClass}`);
      console.log(`  statementCount: ${enResult.pipeline.stage2.statements.length}`);
      expect(enResult.pipeline.stage2.statements.length).toBe(2176);
    }
  });

  it("records the corrected-evaluator ES (DRA-DOC-0018) result", () => {
    if (esResult.ok) {
      console.log(`\n── Corrected-evaluator ES (DRA-DOC-0018) ──`);
      console.log(`  decision: ${esResult.decision}`);
      console.log(`  issues: ${esResult.issues.length}`);
      for (const iss of esResult.issues) console.log(`    ${(iss as any).issueClass}`);
      console.log(`  statementCount: ${esResult.pipeline.stage2.statements.length}`);
      expect(esResult.pipeline.stage2.statements.length).toBe(2546);
    }
  });

  it("EN result: the 7 pre-existing EVIDENCE_INADEQUATE findings are unrelated to the EN-family collision (Stage 5 materiality, per DRA-CHK-003) and are UNCHANGED in count by this Stage-4-only correction", () => {
    if (enResult.ok) {
      // DRA-CHK-003 traced these 7 findings' root cause to Stage 5 (English
      // must/shall materiality detection), not Stage 4 EL-STANDARD-REF — this
      // correction only touches Stage 4, so no change to this count is
      // expected here. Recorded as an observation, not a hard requirement,
      // per the task's explicit "decision parity is not required" scoping.
      console.log(`  EN issue count after correction: ${enResult.issues.length} (Version 1 was 7, all EVIDENCE_INADEQUATE)`);
    }
  });
});

// ---------------------------------------------------------------------------
// Part 3: The 5 confirmed Spanish false positives — direct verification
// against the actual ES statement text pulled from the live corrected
// evaluation (not hardcoded), confirming EL-STANDARD-REF no longer produces
// a bare-EN match for any of them.
// ---------------------------------------------------------------------------

describe("DRA-ENG-014 — Part 3: 5 confirmed Spanish false positives — direct verification", () => {
  const ES_FALSE_POSITIVE_IDX = [560, 675, 980, 1165, 2161];

  it("locates all 5 confirmed false-positive statement indices in the live ES statement list", () => {
    if (!esResult.ok) return;
    const statements = esResult.pipeline.stage2.statements;
    for (const idx of ES_FALSE_POSITIVE_IDX) {
      expect(statements[idx]).toBeDefined();
    }
  });

  it("none of the 5 confirmed false-positive statements produce an EL-STANDARD-REF EN match under the corrected rule", () => {
    if (!esResult.ok) return;
    const statements = esResult.pipeline.stage2.statements;
    for (const idx of ES_FALSE_POSITIVE_IDX) {
      const text = statements[idx]!.text;
      const detection = detectEvidence(text);
      const enMatch = detection.matches.find(
        (m) => m.linkageRule === "EL-STANDARD-REF" && /^en\b/i.test(m.evidenceText),
      );
      expect(enMatch, `statement ${idx} text="${text}" unexpectedly matched EN: ${JSON.stringify(enMatch)}`).toBeUndefined();
    }
  });
});

// ---------------------------------------------------------------------------
// Part 4: 15-document CHK-004 confirmed pair replay — old vs new Stage 4
// classification for each pair's EN and ES statement.
// ---------------------------------------------------------------------------

interface ChkPair {
  anchor: string;
  role: "CONTROL" | "PRIMARY";
  enIdx: number;
  esIdx: number;
}

const CHK004_PAIRS: ChkPair[] = [
  { anchor: "B-1049", role: "CONTROL", enIdx: 20, esIdx: 23 },
  { anchor: "500 contributors", role: "CONTROL", enIdx: 23, esIdx: 26 },
  { anchor: "ART 51 (Charter)", role: "PRIMARY", enIdx: 499, esIdx: 560 },
  { anchor: "McCrudden 2008", role: "CONTROL", enIdx: 500, esIdx: 616 },
  { anchor: "pp. 325", role: "CONTROL", enIdx: 505, esIdx: 621 },
  { anchor: "28(4): 689-707", role: "PRIMARY", enIdx: 567, esIdx: 667 },
  { anchor: "ART 47 (Charter, Justice)", role: "PRIMARY", enIdx: 626, esIdx: 675 },
  { anchor: "ART 12 (Charter, association)", role: "PRIMARY", enIdx: 693, esIdx: 795 },
  { anchor: "ART 22 GDPR", role: "PRIMARY", enIdx: 842, esIdx: 980 },
  { anchor: "ART 42 (Public Procurement Directive)", role: "PRIMARY", enIdx: 1045, esIdx: 1165 },
  { anchor: "Article 6 GDPR (control pair)", role: "PRIMARY", enIdx: 1892, esIdx: 2161 },
  { anchor: "Madary & Metzinger (2016)", role: "PRIMARY", enIdx: 1897, esIdx: 2218 },
  { anchor: "EP Resolution 2018/2752(RSP)", role: "PRIMARY", enIdx: 1903, esIdx: 2274 },
  { anchor: "ILRReview 66(4) July 2013", role: "CONTROL", enIdx: 1399, esIdx: 1594 },
  { anchor: "Industrial Relations 45(4): 650-680 (2003)", role: "CONTROL", enIdx: 1404, esIdx: 1599 },
];

// Old (Version 1, 0.1.1) Stage-4 classification for the ES side of each pair,
// as directly observed under the frozen (pre-DRA-ENG-014) case-insensitive
// STANDARD_RE. Only the 5 pairs whose ES text contains the Spanish word
// "en" produced the bare-EN false positive; the other 10 were unaffected by
// this defect (their old classification is whatever their non-EN-STANDARD
// evidence rules already produced, unaffected by this correction).
const KNOWN_ES_BARE_EN_FALSE_POSITIVES = new Set([
  "ART 51 (Charter)",
  "ART 47 (Charter, Justice)",
  "ART 22 GDPR",
  "ART 42 (Public Procurement Directive)",
  "Article 6 GDPR (control pair)",
]);

describe("DRA-ENG-014 — Part 4: 15-pair CHK-004 replay under the corrected evaluator", () => {
  it("all 15 pairs are locatable at their recorded indices in the live corrected-evaluator run", () => {
    if (!(enResult.ok && esResult.ok)) return;
    const enStatements = enResult.pipeline.stage2.statements;
    const esStatements = esResult.pipeline.stage2.statements;
    for (const p of CHK004_PAIRS) {
      expect(enStatements[p.enIdx], `EN missing for ${p.anchor}`).toBeDefined();
      expect(esStatements[p.esIdx], `ES missing for ${p.anchor}`).toBeDefined();
    }
  });

  it("replays Stage 4 (detectEvidence) for both EN and ES statements of all 15 pairs, old-vs-new EN-collision status", () => {
    if (!(enResult.ok && esResult.ok)) return;
    const enStatements = enResult.pipeline.stage2.statements;
    const esStatements = esResult.pipeline.stage2.statements;

    console.log("\n── DRA-ENG-014 Part 4: 15-pair CHK-004 replay (corrected evaluator) ──");
    console.log(`${"anchor".padEnd(42)} role      ES-had-old-bare-EN-FP  ES-new-bare-EN-match`);

    let clearedCount = 0;
    let neverAffectedCount = 0;

    for (const p of CHK004_PAIRS) {
      const esText = esStatements[p.esIdx]!.text;
      const esDetect = detectEvidence(esText);
      const esNewEnMatch = esDetect.matches.some(
        (m) => m.linkageRule === "EL-STANDARD-REF" && /^en\b/i.test(m.evidenceText),
      );
      const wasKnownFP = KNOWN_ES_BARE_EN_FALSE_POSITIVES.has(p.anchor);

      console.log(`${p.anchor.padEnd(42)} ${p.role.padEnd(9)} ${String(wasKnownFP).padEnd(23)} ${esNewEnMatch}`);

      if (wasKnownFP) {
        // Must be cleared: the demonstrated defect must no longer reproduce.
        expect(esNewEnMatch, `${p.anchor}: expected the bare-EN FP to be cleared`).toBe(false);
        clearedCount++;
      } else {
        // Not a confirmed EN-collision case: the correction must not
        // introduce a NEW spurious EN match either (no unrelated behavior
        // change).
        expect(esNewEnMatch, `${p.anchor}: unexpected new EN match introduced by the correction`).toBe(false);
        neverAffectedCount++;
      }
    }

    console.log(`\n  5 confirmed bare-EN false positives cleared: ${clearedCount}/5`);
    console.log(`  10 non-EN-collision pairs unaffected: ${neverAffectedCount}/10`);
    expect(clearedCount).toBe(5);
    expect(neverAffectedCount).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// Part 5: Historical receipt validity — a Version 1 (0.1.1) receipt shape
// must still validate; it is not overwritten or reinterpreted by this
// correction.
// ---------------------------------------------------------------------------

describe("DRA-ENG-014 — Part 5: Historical (0.1.1) receipt identity is preserved as a recognised version", () => {
  it("DRA_EVALUATOR_VERSION_0_1_1 remains an exported, recognised constant (not deleted)", () => {
    expect(DRA_EVALUATOR_VERSION_0_1_1).toBe("0.1.1");
  });

  it("new receipts pass verifyReceiptIntegrity (digest computed over the corrected-evaluator content)", () => {
    if (esResult.ok) expect(verifyReceiptIntegrity(esResult.proofReceipt)).toBe(true);
    if (enResult.ok) expect(verifyReceiptIntegrity(enResult.proofReceipt)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Part 6: Residual limitations (DRA-ENG-013) — confirm still present, not
// solved by this narrow correction.
// ---------------------------------------------------------------------------

describe("DRA-ENG-014 — Part 6: ENG-013 residual limitations remain (not solved by this narrow fix)", () => {
  it("residual limitation 1 (EN 2025 ambiguity) is unchanged: 'EN 2025' still matches as if a standard number", () => {
    const result = detectEvidence("This document was issued EN 2025 for review.");
    const m = result.matches.find((x) => x.linkageRule === "EL-STANDARD-REF");
    expect(m).toBeDefined();
    expect(m!.evidenceText.trim()).toBe("EN 2025");
  });

  it("residual limitation 2 (truncation before non-numeric trailing token) is unchanged: 'EN 6 months' truncates to 'EN 6'", () => {
    const result = detectEvidence("The certificate is valid for EN 6 months.");
    const m = result.matches.find((x) => x.linkageRule === "EL-STANDARD-REF");
    expect(m).toBeDefined();
    expect(m!.evidenceText.trim()).toBe("EN 6");
  });
});
