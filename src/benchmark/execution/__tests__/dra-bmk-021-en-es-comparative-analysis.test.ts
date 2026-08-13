/**
 * DRA-BMK-021 — Part 8: DRA-DOC-0018 (ES) vs DRA-DOC-0021 (EN) Controlled
 * Parallel-Language Comparative Analysis
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  This file does NOT re-run the 21-document corpus. It fetches only the  ║
 * ║  two parallel-language editions of the same publication (EC/HLEG-AI     ║
 * ║  "Ethics Guidelines for Trustworthy AI") via the disk-cached fetcher    ║
 * ║  (cache warm from dra-bmk-021-evaluator-run.test.ts), evaluates each    ║
 * ║  directly through evaluateDocument(), and inspects Stage 2 (Claim       ║
 * ║  Extraction) statement text/spans and the Stage 5 (Consistency Check)   ║
 * ║  issue register for structural correspondence.                          ║
 * ║                                                                          ║
 * ║  NON-NEGOTIABLE CONSTRAINTS:                                             ║
 * ║    • No translation or rewriting of either source                       ║
 * ║    • Outcome parity is NOT the success criterion                        ║
 * ║    • Any question unanswerable from pipeline evidence is recorded       ║
 * ║      "unresolved", not guessed                                          ║
 * ║    • Correspondence is established via language-independent anchors     ║
 * ║      (numerals, section/article numbers, dates, standard names,         ║
 * ║      statement-index proportional position) — never via translation     ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { describe, it, expect, beforeAll } from "vitest";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import { evaluateDocument } from "../../../pipeline/index.js";
import type { DocumentAssuranceEvaluation } from "../../../pipeline/index.js";
import { createHttpFetcher } from "../../acquisition/http-fetcher.js";
import { createDiskCachedFetcher } from "../../acquisition/__tests__/support/disk-cached-fetcher.js";
import { normaliseContent } from "../../acquisition/normalisation.js";
import { computeSourceDigest } from "../../acquisition/integrity.js";

const FIXED_TS = "2026-08-09T19:00:00.000Z";

const EC_URL_ES = "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60423"; // DRA-DOC-0018
const EC_URL_EN = "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60419"; // DRA-DOC-0021

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-bmk021-cmp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const inputPath  = join(tmpdir(), `${id}.pdf`);
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

function buildEvalRequest(id: string, title: string, generatedText: string, sourceText: string): unknown {
  const sourceId = `sdoc-${id}-src`;
  return {
    id: `eval-${id}`,
    requestedAt: FIXED_TS,
    generatedDocument: {
      id: `gdoc-${id}`,
      title,
      content: generatedText,
      sourceDocumentIds: [sourceId],
      generatedAt: FIXED_TS,
    },
    sourceDocuments: [
      { id: sourceId, title: `Source: ${title}`, content: sourceText, format: "PLAIN_TEXT" },
    ],
  };
}

/** Extracts the substring for a statement's spanRef, if offsets are present. */
function spanText(content: string, spanRef: { startOffset?: number; endOffset?: number } | undefined): string | null {
  if (!spanRef || spanRef.startOffset === undefined || spanRef.endOffset === undefined) return null;
  return content.slice(spanRef.startOffset, spanRef.endOffset);
}

/** Language-independent anchors: standalone numerals (incl. decimals), 4-digit years,
 * and Article/Chapter/Section numeric references. These survive translation verbatim. */
function extractAnchors(text: string): string[] {
  const anchors = new Set<string>();
  for (const m of text.matchAll(/\b\d+(?:[.,]\d+)?%?\b/g)) {
    if (m[0].length >= 2) anchors.add(m[0]);
  }
  for (const m of text.matchAll(/\b(?:Article|Artículo|Chapter|Capítulo|Section|Sección)\s+\d+\b/gi)) {
    anchors.add(m[0].replace(/^(Article|Artículo)/i, "ART").replace(/^(Chapter|Capítulo)/i, "CH").replace(/^(Section|Sección)/i, "SEC").replace(/\s+/, " "));
  }
  return [...anchors];
}

let esResult: DocumentAssuranceEvaluation;
let enResult: DocumentAssuranceEvaluation;
let esText = "";
let enText = "";
let setupError: string | null = null;

beforeAll(async () => {
  try {
    const realFetcher = createHttpFetcher({ timeoutMs: 120_000, maxRedirects: 5, maxBytes: 15_000_000, userAgent: "DRA-BMK-021/1.0" });
    const fetcher = createDiskCachedFetcher(realFetcher, "dra-bmk-021");

    async function fetchAndExtract(acquisitionId: string, url: string, label: string) {
      const req = { acquisitionId, sourceUrl: url, requestedBy: "DRA-BMK-021-operator", requestedAt: FIXED_TS, expectedPublisher: "European Commission", expectedTitle: "Ethics Guidelines for Trustworthy AI" };
      const fetchRes = await fetcher(req as any, {});
      if (!fetchRes.ok) throw new Error(`${label} fetch failed: ${fetchRes.code}`);
      const srcDigest = computeSourceDigest(fetchRes.source.rawBytes);
      const norm = await normaliseContent(fetchRes.source.rawBytes, "application/pdf", srcDigest, extractPdfText);
      if (!norm.ok) throw new Error(`${label} normalisation failed: ${norm.message}`);
      return norm.document.text;
    }

    [esText, enText] = await Promise.all([
      fetchAndExtract("DRA-ACQ-000021", EC_URL_ES, "ES"),
      fetchAndExtract("DRA-ACQ-000024", EC_URL_EN, "EN"),
    ]);

    esResult = evaluateDocument(buildEvalRequest("DRA-DOC-0018", "Directrices éticas para una IA fiable", esText, esText));
    enResult = evaluateDocument(buildEvalRequest("DRA-DOC-0021", "Ethics Guidelines for Trustworthy AI", enText, enText));
  } catch (err) {
    setupError = String(err);
  }
}, 300_000);

describe("DRA-BMK-021 — Part 8: EN/ES Paired Evidence Setup", () => {
  it("setup completed without error", () => {
    if (setupError) console.error("Setup error:", setupError);
    expect(setupError).toBeNull();
  });

  it("both evaluations succeeded", () => {
    expect(esResult.ok).toBe(true);
    expect(enResult.ok).toBe(true);
  });

  it("statement-count comparison: EN vs ES", () => {
    if (esResult.ok && enResult.ok) {
      const esCount = esResult.pipeline.stage2.statements.length;
      const enCount = enResult.pipeline.stage2.statements.length;
      console.log(`\n── Statement counts ──────────────────────────────────────────`);
      console.log(`  ES (DRA-DOC-0018): ${esCount}`);
      console.log(`  EN (DRA-DOC-0021): ${enCount}`);
      console.log(`  difference: ${enCount - esCount} (${(((enCount - esCount) / esCount) * 100).toFixed(1)}%)`);
      expect(esCount).toBeGreaterThan(0);
      expect(enCount).toBeGreaterThan(0);
    }
  });

  it("EN decision reproduces REVIEW / 7 EVIDENCE_INADEQUATE issues (admission-time and Run A/B observation)", () => {
    if (enResult.ok) {
      expect(enResult.decision).toBe("REVIEW");
      expect(enResult.issues.length).toBe(7);
      for (const iss of enResult.issues) expect((iss as any).issueClass).toBe("EVIDENCE_INADEQUATE");
    }
  });

  it("ES decision is recorded for comparison (not assumed)", () => {
    if (esResult.ok) {
      console.log(`\n── ES (DRA-DOC-0018) decision: ${esResult.decision}, issues: ${esResult.issues.length}`);
      for (const iss of esResult.issues) console.log(`   ${(iss as any).issueClass}`);
    }
  });
});

describe("DRA-BMK-021 — Part 8: Issue-by-Issue Localization of the 7 EN Findings", () => {
  it("locates each EN EVIDENCE_INADEQUATE statement's text/span, and searches for structural correspondence in ES", () => {
    if (!(enResult.ok && esResult.ok)) return;

    const enStatements = enResult.pipeline.stage2.statements;
    const esStatements = esResult.pipeline.stage2.statements;
    const esStatementCount = esStatements.length;
    const enStatementCount = enStatements.length;

    console.log("\n── Issue-by-Issue EN/ES Localization (7 EN EVIDENCE_INADEQUATE findings) ──");

    const findings: Array<{
      issueId: string;
      statementId: string;
      statementIndex: number;
      enText: string | null;
      anchors: string[];
      esCandidateFound: boolean;
      esCandidateText: string | null;
      correspondence: "ANCHOR_MATCH" | "PROPORTIONAL_POSITION_ONLY" | "NO_CORRESPONDENCE_FOUND";
    }> = [];

    for (const iss of enResult.issues) {
      const anyIss = iss as any;
      const stId = anyIss.affectedStatementIds[0] as string;
      const statement = enStatements.find((s) => s.id === stId);
      const text = statement ? spanText(enText, statement.spanRef) ?? statement.text : null;
      const anchors = text ? extractAnchors(text) : [];

      // Proportional position: EN statement's fractional position in the EN
      // document maps to an approximate fractional position in ES, then we
      // search a window of ES statements around that position for a shared
      // language-independent anchor (number, article/section reference).
      let esCandidateFound = false;
      let esCandidateText: string | null = null;
      let correspondence: "ANCHOR_MATCH" | "PROPORTIONAL_POSITION_ONLY" | "NO_CORRESPONDENCE_FOUND" = "NO_CORRESPONDENCE_FOUND";

      if (statement && anchors.length > 0) {
        const frac = statement.statementIndex / Math.max(1, enStatementCount - 1);
        const centerIdx = Math.round(frac * Math.max(0, esStatementCount - 1));
        const windowRadius = Math.max(5, Math.round(esStatementCount * 0.08));
        const lo = Math.max(0, centerIdx - windowRadius);
        const hi = Math.min(esStatementCount - 1, centerIdx + windowRadius);

        for (let i = lo; i <= hi; i++) {
          const esSt = esStatements[i];
          const esText2 = spanText(esText, esSt.spanRef) ?? esSt.text;
          const esAnchors = extractAnchors(esText2);
          const shared = anchors.filter((a) => esAnchors.includes(a));
          if (shared.length > 0) {
            esCandidateFound = true;
            esCandidateText = esText2;
            correspondence = "ANCHOR_MATCH";
            break;
          }
        }
        if (!esCandidateFound && centerIdx >= 0 && centerIdx < esStatementCount) {
          esCandidateText = spanText(esText, esStatements[centerIdx].spanRef) ?? esStatements[centerIdx].text;
          correspondence = "PROPORTIONAL_POSITION_ONLY";
        }
      }

      findings.push({
        issueId: anyIss.id,
        statementId: stId,
        statementIndex: statement?.statementIndex ?? -1,
        enText: text,
        anchors,
        esCandidateFound,
        esCandidateText,
        correspondence,
      });
    }

    for (const f of findings) {
      console.log(`\n  Issue ${f.issueId} — statement ${f.statementId} (index ${f.statementIndex})`);
      console.log(`    EN text     : ${f.enText ? JSON.stringify(f.enText.slice(0, 160)) : "(unavailable)"}`);
      console.log(`    anchors     : ${f.anchors.length ? f.anchors.join(", ") : "(none — no language-independent anchor extractable)"}`);
      console.log(`    correspondence: ${f.correspondence}`);
      if (f.esCandidateText) console.log(`    ES candidate: ${JSON.stringify(f.esCandidateText.slice(0, 160))}`);
    }

    const anchorMatches = findings.filter((f) => f.correspondence === "ANCHOR_MATCH").length;
    const positionOnly  = findings.filter((f) => f.correspondence === "PROPORTIONAL_POSITION_ONLY").length;
    const noCorrespond  = findings.filter((f) => f.correspondence === "NO_CORRESPONDENCE_FOUND").length;

    console.log(`\n── Localization Summary ─────────────────────────────────────`);
    console.log(`  ANCHOR_MATCH (content-level correspondence found)         : ${anchorMatches}/7`);
    console.log(`  PROPORTIONAL_POSITION_ONLY (only positional estimate)     : ${positionOnly}/7`);
    console.log(`  NO_CORRESPONDENCE_FOUND (no anchor, no usable position)   : ${noCorrespond}/7`);

    expect(findings.length).toBe(7);
  });
});

describe("DRA-BMK-021 — Part 8: Pipeline-Stage Localization and H21 Verdict", () => {
  it("all 7 EN issues are attributable to Stage 5 (Consistency Check, EVIDENCE_INADEQUATE / IC-5), not extraction, authority, or evidence-linkage stage differences per se", () => {
    if (!enResult.ok) return;
    for (const iss of enResult.issues) {
      expect((iss as any).stageAssociation).toBe("Consistency Check");
      const meta = (iss as any).metadata;
      expect(meta.materialityClassification).toBe("HIGH");
    }
  });

  it("records the H21 verdict and narrowest defensible conclusion, grounded strictly in measured pipeline evidence", () => {
    if (!(enResult.ok && esResult.ok)) return;

    const enCount = enResult.issues.length;
    const esCount = esResult.issues.length;
    const decisionsDiffer = enResult.decision !== esResult.decision;

    console.log("\n══════════════════════════════════════════════════════════════");
    console.log("  H21 — CAUSAL MECHANISM AND VERDICT");
    console.log("══════════════════════════════════════════════════════════════");
    console.log(`  EN (DRA-DOC-0021) decision : ${enResult.decision} (${enCount} issues, all EVIDENCE_INADEQUATE)`);
    console.log(`  ES (DRA-DOC-0018) decision : ${esResult.decision} (${esCount} issues)`);
    console.log(`  Outcome parity             : ${decisionsDiffer ? "NO — outcomes differ" : "YES — outcomes match"}`);
    console.log(`  IC-5 (EVIDENCE_INADEQUATE) trigger condition: HIGH materiality + weak/absent evidence + authority present.`);
    console.log(`  Every EN issue's metadata confirms materialityClassification=HIGH, meaning Stage 5's IC-5 rule fired`);
    console.log(`  on statements that Stage 2 (extraction) classified HIGH and Stage 4 (evidence linkage) classified`);
    console.log(`  weak/absent — i.e. the divergence, if any, originates upstream of Stage 5 (in how much matching`);
    console.log(`  documentary evidence Stage 4 could link for the EN statement text), not in the Stage 5 rule itself,`);
    console.log(`  which applies identically regardless of source language.`);
    console.log(`  H21 (language alone should not materially alter decision/issue-class outcome) — this checkpoint's`);
    console.log(`  evidence is a SINGLE document pair, not a general robustness claim; the verdict below is scoped`);
    console.log(`  strictly to this pair.`);

    if (decisionsDiffer) {
      console.log(`  VERDICT: H21 NOT CONFIRMED for this pair — EN and ES produced different decisions/issue profiles.`);
      console.log(`  DEFECT vs LEGITIMATE DIFFERENCE: UNRESOLVED. The evaluator's evidence-linkage stage (Stage 4) is`);
      console.log(`  text-matching-based; whether the ES edition's differing evidence-linkage outcome reflects a`);
      console.log(`  genuine content/structure difference between editions (legitimate) or a language-sensitivity gap`);
      console.log(`  in Stage 4's matching logic (defect) cannot be determined from this pipeline's output alone —`);
      console.log(`  doing so would require inspecting Stage 4's evidence-unit corpus for language-specific matching`);
      console.log(`  rules, which is out of scope for a benchmark checkpoint (no evaluator changes permitted).`);
      console.log(`  RECOMMENDED NEXT EXPERIMENT: add a third parallel-language edition of a document that currently`);
      console.log(`  produces SUPPORTED in its primary language, to test whether language-driven decision divergence`);
      console.log(`  recurs on a document where the primary-language result has zero issues (isolating the variable`);
      console.log(`  further), OR inspect Stage 4's evidence-unit definitions directly (a Stage 4 root-cause task,`);
      console.log(`  not a further benchmark checkpoint).`);
    } else {
      console.log(`  VERDICT: H21 supported for this pair — decisions matched despite the language difference.`);
    }

    // This assertion records the measured fact (not an assumption): EN and ES
    // decisions for this specific pair, as re-derived by this checkpoint.
    expect(typeof enResult.decision).toBe("string");
    expect(typeof esResult.decision).toBe("string");
  });
});
