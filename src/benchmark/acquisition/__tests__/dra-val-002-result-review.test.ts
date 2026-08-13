/**
 * DRA-VAL-002 — Benchmark Result Review for DRA-DOC-0008
 *
 * Analytical review only. Extracts the full pipeline output from the
 * frozen DRA-DOC-0008 evaluation for review purposes.
 *
 * No evaluator logic, governance rules, corpus entries, freeze records,
 * manifests, issue classes, decision semantics, proof receipts, or
 * benchmark artefacts are modified.
 */

import { describe, it, expect } from "vitest";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import { createHttpFetcher } from "../http-fetcher.js";
import { normaliseContent } from "../normalisation.js";
import {
  computeSourceDigest,
  computeApprovedMetadataDigest,
} from "../integrity.js";
import { createAcquisitionRequest } from "../request.js";
import {
  createAcquisitionFreezeRecord,
} from "../freeze.js";
import { integrateWithCorpus } from "../manifest-integration.js";
import { CorpusRegistry } from "../../corpus/registry.js";
import { evaluateFrozenBenchmarkDocument } from "../governed-pipeline.js";
import type { MaterialStatement } from "../../../model/statements.js";
import type { DraIssue } from "../../../model/issues.js";

const execFileAsync = promisify(execFile);

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const id = `dra-val002-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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

const FREEZE_TIMESTAMP = "2026-08-04T14:30:00.000Z";
const EVAL_TIMESTAMP   = "2026-08-04T15:00:00.000Z";

const REFERENCE_GUIDE_SOURCE_DIGEST =
  "a4c10388a0dcfd54dccaab0f7ba4c27319c1c4a93d3920d89cd14a06510ef300";
const REFERENCE_GUIDE_TEXT_DIGEST =
  "3b8f3472852feacd33a60d4a0ef93b4d9478f372111db87d4c076ff6c96d83a0";
const REFERENCE_CODE_TEXT_DIGEST =
  "c838df560af55a237c70275ed0dccd04a4aa53e67e51f8d600e150eb5e9abf40";

const APPROVED_METADATA = Object.freeze({
  title: "Discipline and grievances at work: the Acas guide",
  publisher: "Advisory, Conciliation and Arbitration Service (Acas)",
  publicationDate: "2020-07",
  domain: "BUSINESS" as const,
  documentType: "PROCEDURE" as const,
  difficulty: "LOW" as const,
  language: "en-GB",
});

describe("DRA-VAL-002 — Benchmark Result Review: DRA-DOC-0008", () => {
  it(
    "extracts full pipeline details for analytical review",
    async () => {
      // ── Reconstruct frozen inputs (identical to blind evaluation test) ────

      const fetcher = createHttpFetcher({
        timeoutMs: 120_000,
        maxRedirects: 5,
        maxBytes: 10_000_000,
        userAgent: "DRA-ENG-010/1.0",
      });
      const registry = new CorpusRegistry();

      const guideUrl =
        "https://www.acas.org.uk/sites/default/files/2024-08/discipline-and-grievances-at-work-the-acas-guide.pdf";
      const guideReq = createAcquisitionRequest({
        acquisitionId: "DRA-ACQ-000006",
        sourceUrl: guideUrl,
        requestedBy: "DRA-VAL-002-review-operator",
        requestedAt: EVAL_TIMESTAMP,
        expectedPublisher: "Advisory, Conciliation and Arbitration Service (Acas)",
        expectedTitle: "Discipline and grievances at work: the Acas guide",
      });
      expect(guideReq.ok).toBe(true);
      if (!guideReq.ok) return;

      const guideFetch = await fetcher(guideReq.request, {});
      expect(guideFetch.ok).toBe(true);
      if (!guideFetch.ok) return;
      const guideSource = guideFetch.source;

      const guideSourceDigest = computeSourceDigest(guideSource.rawBytes);
      expect(guideSourceDigest).toBe(REFERENCE_GUIDE_SOURCE_DIGEST);

      const normResult = await normaliseContent(
        guideSource.rawBytes, "application/pdf", guideSourceDigest, extractPdfText,
      );
      expect(normResult.ok).toBe(true);
      if (!normResult.ok) return;
      const normalised = normResult.document;
      expect(normalised.textDigest).toBe(REFERENCE_GUIDE_TEXT_DIGEST);

      const codeUrl =
        "https://www.acas.org.uk/acas-code-of-practice-on-disciplinary-and-grievance-procedures/html";
      const codeReq = createAcquisitionRequest({
        acquisitionId: "DRA-ACQ-000007",
        sourceUrl: codeUrl,
        requestedBy: "DRA-VAL-002-review-operator",
        requestedAt: EVAL_TIMESTAMP,
        expectedPublisher: "Advisory, Conciliation and Arbitration Service (Acas)",
        expectedTitle: "Acas Code of Practice on disciplinary and grievance procedures",
      });
      expect(codeReq.ok).toBe(true);
      if (!codeReq.ok) return;

      const codeFetch = await fetcher(codeReq.request, {});
      expect(codeFetch.ok).toBe(true);
      if (!codeFetch.ok) return;

      const codeSourceDigest = computeSourceDigest(codeFetch.source.rawBytes);
      const codeNorm = await normaliseContent(
        codeFetch.source.rawBytes, "text/html", codeSourceDigest,
      );
      expect(codeNorm.ok).toBe(true);
      if (!codeNorm.ok) return;
      expect(codeNorm.document.textDigest).toBe(REFERENCE_CODE_TEXT_DIGEST);
      const codeText = codeNorm.document.text;

      const metadataDigest = computeApprovedMetadataDigest(APPROVED_METADATA);
      const freezeRecord = createAcquisitionFreezeRecord({
        freezeRecordId: "DRA-FRZ-000002",
        corpusDocumentId: "DRA-DOC-0008",
        acquisitionId: "DRA-ACQ-000002",
        sourceUrl: guideUrl,
        finalUrl: guideSource.finalUrl,
        sourceDigest: guideSourceDigest,
        normalised,
        metadataDigest,
        frozenBy: "DRA-ACQ-002-freeze-operator",
        benchmarkVersion: "DRA-CORPUS-1.0.0",
        fixedTimestamp: FREEZE_TIMESTAMP,
      });

      const intResult = integrateWithCorpus(freezeRecord, APPROVED_METADATA, registry);
      expect(intResult.ok).toBe(true);
      if (!intResult.ok) return;

      // ── Run evaluation ─────────────────────────────────────────────────────

      const evalResult = evaluateFrozenBenchmarkDocument({
        freezeRecord,
        rawBytes: guideSource.rawBytes,
        normalisedText: normalised.text,
        approvedMetadata: APPROVED_METADATA,
        registry,
        additionalSourceText: codeText,
        fixedTimestamp: EVAL_TIMESTAMP,
      });

      expect(evalResult.ok).toBe(true);
      if (!evalResult.ok) return;

      const ev = evalResult.result.evaluationResult;
      expect(ev.ok).toBe(true);
      if (!ev.ok) return;

      const pipe = ev.pipeline;
      const statements = pipe.stage2.statements as MaterialStatement[];
      const issues     = ev.issues as DraIssue[];
      const cc         = pipe.consistencyCheck;
      const cs         = pipe.confidenceScoring;
      const receipt    = ev.proofReceipt as {
        id: string;
        schemaVersion: string;
        documentIdentity: Record<string, unknown>;
        evaluatorIdentity: Record<string, unknown>;
        stageOutputs: Array<{ stageNumber: number; stageName: string; output: Record<string, unknown> }>;
        issueRegister: DraIssue[];
        issueSummary: { total: number; blocking: number; advisory: number };
        decision: string;
        decisionRationale: string;
        timestamp: string;
        substantiveDigest: string;
      };

      // ── A. CLAIM EXTRACTION ANALYSIS ──────────────────────────────────────

      console.log("\n╔══════════════════════════════════════════════════════════╗");
      console.log("║  DRA-VAL-002 — BENCHMARK RESULT REVIEW: DRA-DOC-0008      ║");
      console.log("╚══════════════════════════════════════════════════════════╝");
      console.log("\n═══ A. CLAIM EXTRACTION ANALYSIS ═══════════════════════════\n");

      console.log(`  Total extracted statements: ${statements.length}`);

      // Length distribution
      const lengths = statements.map(s => s.text.trim().length);
      const avgLen = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
      const minLen = Math.min(...lengths);
      const maxLen = Math.max(...lengths);
      const under20  = lengths.filter(l => l < 20).length;
      const under50  = lengths.filter(l => l >= 20 && l < 50).length;
      const under100 = lengths.filter(l => l >= 50 && l < 100).length;
      const under200 = lengths.filter(l => l >= 100 && l < 200).length;
      const over200  = lengths.filter(l => l >= 200).length;

      console.log(`  Average statement length (chars): ${avgLen}`);
      console.log(`  Min length: ${minLen}  Max length: ${maxLen}`);
      console.log(`\n  Length distribution:`);
      console.log(`    <20 chars   : ${under20}  (likely headers/labels)`);
      console.log(`    20–49 chars : ${under50}  (short fragments)`);
      console.log(`    50–99 chars : ${under100}`);
      console.log(`    100–199 chars: ${under200}  (typical sentences)`);
      console.log(`    ≥200 chars  : ${over200}  (multi-sentence / over-captured)`);

      // Linked vs unlinked
      const linked   = statements.filter(s => s.linkedEvidenceUnitIds.length > 0).length;
      const unlinked = statements.length - linked;
      console.log(`\n  Evidence linkage:`);
      console.log(`    Linked to evidence  : ${linked}`);
      console.log(`    Unlinked            : ${unlinked}`);

      // Sample: first 5 statements
      console.log(`\n  Sample — first 5 statements:`);
      for (const s of statements.slice(0, 5)) {
        console.log(`    [${s.id}] (${s.text.trim().length} ch) "${s.text.trim().slice(0, 120)}"`);
      }

      // Sample: shortest 5 (potential over-fragmentation)
      const sortedAsc = [...statements].sort((a, b) => a.text.trim().length - b.text.trim().length);
      console.log(`\n  Sample — 5 shortest (potential over-fragmentation):`);
      for (const s of sortedAsc.slice(0, 5)) {
        console.log(`    [${s.id}] (${s.text.trim().length} ch) "${s.text.trim().slice(0, 120)}"`);
      }

      // Sample: longest 5 (potential under-fragmentation)
      const sortedDesc = [...statements].sort((a, b) => b.text.trim().length - a.text.trim().length);
      console.log(`\n  Sample — 5 longest (potential under-fragmentation):`);
      for (const s of sortedDesc.slice(0, 5)) {
        console.log(`    [${s.id}] (${s.text.trim().length} ch) "${s.text.trim().slice(0, 160)}…"`);
      }

      // SpanRef coverage
      const withSpan    = statements.filter(s => s.spanRef !== undefined).length;
      const withoutSpan = statements.length - withSpan;
      console.log(`\n  SpanRef coverage:`);
      console.log(`    With spanRef    : ${withSpan}`);
      console.log(`    Without spanRef : ${withoutSpan}`);

      // ── B. ISSUE ANALYSIS ─────────────────────────────────────────────────

      console.log("\n═══ B. ISSUE ANALYSIS ══════════════════════════════════════\n");
      console.log(`  Total issues: ${issues.length}`);
      console.log(`  Blocking: ${cc.blockingIssueCount}  Advisory: ${cc.advisoryIssueCount}`);

      // Group by class
      const byClass: Record<string, DraIssue[]> = {};
      for (const iss of issues) {
        (byClass[iss.issueClass] ??= []).push(iss);
      }
      console.log(`\n  Issues by class:`);
      for (const [cls, arr] of Object.entries(byClass)) {
        const blocking = arr.filter(i => i.severity === "BLOCKING").length;
        const advisory = arr.filter(i => i.severity === "ADVISORY").length;
        console.log(`    ${cls}: ${arr.length}  (BLOCKING: ${blocking}  ADVISORY: ${advisory})`);
      }

      // Full issue list
      console.log(`\n  Full issue list:`);
      for (let i = 0; i < issues.length; i++) {
        const iss = issues[i]!;
        const stmtSnippet = iss.affectedStatementIds.length > 0
          ? (() => {
              const sid = iss.affectedStatementIds[0]!;
              const stmt = statements.find(s => s.id === sid);
              return stmt ? `"${stmt.text.trim().slice(0, 80)}"` : `(stmt ${sid})`;
            })()
          : "(no affected statement)";
        console.log(
          `    [${String(i + 1).padStart(2)}] ${iss.id}` +
          `\n         class     : ${iss.issueClass}` +
          `\n         severity  : ${iss.severity}` +
          `\n         stmt IDs  : ${iss.affectedStatementIds.join(", ") || "(none)"}` +
          `\n         evid IDs  : ${iss.affectedEvidenceUnitIds.join(", ") || "(none)"}` +
          `\n         statement : ${stmtSnippet}` +
          `\n         explanation: "${iss.explanation.slice(0, 160)}"`,
        );
      }

      // ── C. BLOCKING ISSUE REVIEW ──────────────────────────────────────────

      console.log("\n═══ C. BLOCKING ISSUE REVIEW ═══════════════════════════════\n");
      const blockingIssues = issues.filter(i => i.severity === "BLOCKING");
      console.log(`  Blocking issue count: ${blockingIssues.length}`);
      for (const iss of blockingIssues) {
        const affectedTexts = iss.affectedStatementIds.map((sid: string) => {
          const stmt = statements.find(s => s.id === sid);
          return stmt ? `"${stmt.text.trim().slice(0, 200)}"` : `(id: ${sid})`;
        });
        console.log(`\n  Issue: ${iss.id}`);
        console.log(`  Class: ${iss.issueClass}`);
        console.log(`  Severity: ${iss.severity}`);
        console.log(`  Affected statement IDs: ${iss.affectedStatementIds.join(", ") || "(none)"}`);
        console.log(`  Affected evidence IDs : ${iss.affectedEvidenceUnitIds.join(", ") || "(none)"}`);
        console.log(`  Explanation: "${iss.explanation}"`);
        if (affectedTexts.length > 0) {
          console.log(`  Statement texts:`);
          for (const t of affectedTexts) console.log(`    ${t}`);
        }
      }

      // ── D. PROOF RECEIPT ASSESSMENT ───────────────────────────────────────

      console.log("\n═══ D. PROOF RECEIPT ASSESSMENT ════════════════════════════\n");
      console.log(`  id                : ${receipt.id}`);
      console.log(`  schemaVersion     : ${receipt.schemaVersion}`);
      console.log(`  decision          : ${receipt.decision}`);
      console.log(`  decisionRationale : "${receipt.decisionRationale}"`);
      console.log(`  timestamp         : ${receipt.timestamp}`);
      console.log(`  substantiveDigest : ${receipt.substantiveDigest}`);
      console.log(`\n  documentIdentity  :`, JSON.stringify(receipt.documentIdentity));
      console.log(`  evaluatorIdentity :`, JSON.stringify(receipt.evaluatorIdentity));
      console.log(`\n  issueSummary      :`, JSON.stringify(receipt.issueSummary));
      console.log(`\n  stageOutputs (${receipt.stageOutputs.length} records):`);
      for (const so of receipt.stageOutputs) {
        console.log(`    Stage ${so.stageNumber} — ${so.stageName}:`);
        console.log(`      ${JSON.stringify(so.output).slice(0, 200)}`);
      }
      console.log(`\n  issueRegister count: ${receipt.issueRegister.length}`);
      if (receipt.issueRegister.length > 0) {
        console.log(`  issueRegister sample (first 3):`);
        for (const iss of receipt.issueRegister.slice(0, 3)) {
          console.log(`    ${iss.id}: ${iss.issueClass} / ${iss.severity} — "${iss.explanation.slice(0, 100)}"`);
        }
      }

      // ── GUIDE TEXT EXTRACTION for reviewer assessment ──────────────────────

      console.log("\n═══ E. GUIDE TEXT (BOUNDARY SECTION) — FOR REVIEWER ASSESSMENT ═\n");

      // Extract the boundary section from the normalised guide text (pages 18–25)
      // by locating the section that starts with "Informing the employee" and
      // ends near "Allowing a worker to be accompanied".
      const guideText = normalised.text;

      // Locate boundary start
      const boundaryStartMarkers = [
        "Informing the employee",
        "INFORMING THE EMPLOYEE",
      ];
      const boundaryEndMarkers = [
        "Allowing a worker to be accompanied",
        "worker to be accompanied at",
        "What if a companion",
        "Possible outcomes",
      ];

      let boundaryStart = -1;
      for (const m of boundaryStartMarkers) {
        const idx = guideText.indexOf(m);
        if (idx !== -1) { boundaryStart = idx; break; }
      }

      // If not found, try a looser search
      if (boundaryStart === -1) {
        const idx = guideText.toLowerCase().indexOf("informing the employee");
        if (idx !== -1) boundaryStart = idx;
      }

      let boundaryEnd = guideText.length;
      if (boundaryStart !== -1) {
        for (const m of boundaryEndMarkers) {
          const idx = guideText.indexOf(m, boundaryStart + 1000);
          if (idx !== -1) { boundaryEnd = Math.min(boundaryEnd, idx + m.length + 500); break; }
        }
      }

      const guideSection = boundaryStart !== -1
        ? guideText.slice(boundaryStart, boundaryEnd)
        : "(boundary section not located by marker search — printing first 3000 chars of guide)\n" + guideText.slice(0, 3000);

      console.log("  Guide boundary section (pages 18–25):");
      console.log("  ─────────────────────────────────────");
      console.log(guideSection.slice(0, 8000));
      if (guideSection.length > 8000) {
        console.log(`  … [${guideSection.length - 8000} chars truncated — see full normalised text]`);
      }

      // Print Code text (paragraphs 9–17 context)
      console.log("\n  Code of Practice text (paragraphs 9–17 region):");
      console.log("  ─────────────────────────────────────────────────");
      // Find para 9 in the code text
      const codeParaStart = codeText.toLowerCase().indexOf("inform the employee");
      const codeParaEnd   = codeText.toLowerCase().indexOf("worker has been informed", codeParaStart + 100);
      const codeSection = codeParaStart !== -1
        ? codeText.slice(Math.max(0, codeParaStart - 200), codeParaEnd !== -1 ? codeParaEnd + 800 : codeParaStart + 5000)
        : codeText.slice(0, 4000);
      console.log(codeSection.slice(0, 5000));

      // ── CONFIDENCE SCORING ────────────────────────────────────────────────

      console.log("\n═══ CONFIDENCE SCORING DETAIL ═══════════════════════════════\n");
      console.log(`  statementCount: ${cs.statementCount}`);
      console.log(`  levelCounts   :`, JSON.stringify(cs.levelCounts));
      if (cs.warnings && cs.warnings.length > 0) {
        console.log(`  warnings      :`, cs.warnings.join("; "));
      }

      // ── Final assertions (structural only — no modification) ──────────────

      expect(statements.length).toBeGreaterThan(0);
      expect(issues.length).toBeGreaterThan(0);
      expect(receipt.decision).toBeTruthy();
      expect(receipt.substantiveDigest).toMatch(/^[0-9a-f]{64}$/);

      console.log("\n╔══════════════════════════════════════════════════════════╗");
      console.log("║  DRA-VAL-002 — DATA EXTRACTION COMPLETE                   ║");
      console.log("║  No artefacts modified                                    ║");
      console.log("╚══════════════════════════════════════════════════════════╝\n");
    },
    300_000,
  );
});
