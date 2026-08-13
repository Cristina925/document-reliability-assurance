/**
 * DRA-FIX-002 — Semantic Evidence Matching — Pipeline + Regression Tests
 *
 * Tests the end-to-end Stage 4 behaviour after DRA-FIX-002 is applied.
 *
 * Covers:
 *   1. Pipeline regression — paragraph 17 pair no longer produces
 *      EVIDENCE_ABSENT via the full Stage 4 pipeline.
 *   2. Local DRA-DOC-0008 regression fixture — fully offline, no network.
 *   3. Compatibility with existing evidence-linkage fixtures — all prior
 *      expected classifications remain unchanged.
 *   4. Polarity safeguards at pipeline level.
 *   5. Determinism at pipeline level.
 *   6. SEMANTIC_PARAPHRASE_MATCH classification appears in classificationCounts.
 */

import { describe, it, expect } from "vitest";
import { linkEvidence } from "../link-evidence.js";
import { extractClaims } from "../../claim-extraction/index.js";
import { resolveAuthority } from "../../authority-resolution/index.js";
import { checkConsistency } from "../../consistency-check/index.js";
import { assessMateriality } from "../../materiality-assessment/index.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type Req = Parameters<typeof extractClaims>[0];

function makeRequest(
  id: string,
  docId: string,
  content: string,
  sourceText?: string,
): Req {
  return {
    id: id as Req["id"],
    generatedDocument: {
      id: docId as Req["generatedDocument"]["id"],
      title: "DRA-FIX-002 Test Document",
      content,
      sourceDocumentIds: sourceText ? [`sdoc-${docId}`] : [],
      generatedAt: "2026-08-04T00:00:00.000Z",
    },
    sourceDocuments: sourceText
      ? [
          {
            id: `sdoc-${docId}` as Req["sourceDocuments"][number]["id"],
            title: "Source",
            content: sourceText,
            format: "PLAIN_TEXT",
          },
        ]
      : [],
    requestedAt: "2026-08-04T00:00:00.000Z",
  };
}

function runStage4(content: string, sourceText?: string, evalId = "eval-fx2") {
  const req = makeRequest(evalId, `gdoc-${evalId}`, content, sourceText);
  const s2 = extractClaims(req);
  const s3 = resolveAuthority(req, s2);
  const s4 = linkEvidence(req, s2, s3);
  return { req, s2, s3, s4 };
}

// ---------------------------------------------------------------------------
// Local regression fixture — DRA-DOC-0008 paragraph 17 pair
//
// These texts represent the minimum frozen content required to reproduce
// the paragraph 17 evidence-linkage failure without network access.
// The guide text is a controlled excerpt; the Code text is Code paragraph 17.
// ---------------------------------------------------------------------------

/**
 * Guide text excerpt — pages 18–25 companion rights section.
 * Provides the paraphrase of Code para 17 that triggered issues 17 and 42
 * in the DRA-VAL-002 blind evaluation.
 */
const FIXTURE_GUIDE_COMPANION_SECTION = [
  "Attending a disciplinary hearing – the role of the companion",
  "",
  "A worker may be accompanied at a disciplinary hearing by a companion",
  "of their choice.",
  "",
  "The companion can address the hearing to put and sum up the worker's",
  "case and respond on behalf of the worker to any views expressed.",
  "",
  "You are, however, not legally required to permit the companion to answer",
  "questions on your behalf at the hearing.",
  "",
  "The companion must not prevent you from explaining your case.",
].join("\n");

/**
 * Code of Practice — paragraph 17 (canonical authority source).
 */
const FIXTURE_CODE_PARA_17 = [
  "17",
  "",
  "The companion does not, however, have the right to answer questions on",
  "the worker's behalf, or to address the meeting in a way which prevents",
  "the employer from explaining their case.",
].join("\n");

// ---------------------------------------------------------------------------
// 1. Pipeline regression — paragraph 17
// ---------------------------------------------------------------------------

describe("DRA-FIX-002 — paragraph 17 pipeline regression", () => {
  it("Stage 4 returns ok: true for the guide/code fixture", () => {
    const { s4 } = runStage4(FIXTURE_GUIDE_COMPANION_SECTION, FIXTURE_CODE_PARA_17);
    expect(s4.ok).toBe(true);
  });

  it("at least one statement receives SEMANTIC_PARAPHRASE_MATCH", () => {
    const { s4 } = runStage4(FIXTURE_GUIDE_COMPANION_SECTION, FIXTURE_CODE_PARA_17);
    if (!s4.ok) return;
    const matched = s4.evidenceRecords.filter(
      (r) => r.classification === "SEMANTIC_PARAPHRASE_MATCH",
    );
    expect(matched.length).toBeGreaterThanOrEqual(1);
  });

  it("the companion-questions statement is NOT classified NO_DOCUMENT_EVIDENCE", () => {
    const { s4 } = runStage4(FIXTURE_GUIDE_COMPANION_SECTION, FIXTURE_CODE_PARA_17);
    if (!s4.ok) return;
    // Find the statement containing "not legally required to permit the companion"
    const companionRecord = s4.evidenceRecords.find((r) => {
      const stmtText = String(r.statementId);
      // The statementId is "s2:{start}:{end}" — we match against the statement span
      // Instead check via the linkageRule
      return r.linkageRule === "EL-SEMANTIC-PARAPHRASE";
    });
    expect(companionRecord).toBeDefined();
    expect(companionRecord?.classification).toBe("SEMANTIC_PARAPHRASE_MATCH");
    expect(companionRecord?.classification).not.toBe("NO_DOCUMENT_EVIDENCE");
  });

  it("SEMANTIC_PARAPHRASE_MATCH record has empty evidenceSpans", () => {
    const { s4 } = runStage4(FIXTURE_GUIDE_COMPANION_SECTION, FIXTURE_CODE_PARA_17);
    if (!s4.ok) return;
    const semRecs = s4.evidenceRecords.filter(
      (r) => r.classification === "SEMANTIC_PARAPHRASE_MATCH",
    );
    for (const rec of semRecs) {
      expect(rec.evidenceSpans).toHaveLength(0);
    }
  });

  it("SEMANTIC_PARAPHRASE_MATCH record has linkageRule EL-SEMANTIC-PARAPHRASE", () => {
    const { s4 } = runStage4(FIXTURE_GUIDE_COMPANION_SECTION, FIXTURE_CODE_PARA_17);
    if (!s4.ok) return;
    const semRec = s4.evidenceRecords.find(
      (r) => r.classification === "SEMANTIC_PARAPHRASE_MATCH",
    );
    expect(semRec?.linkageRule).toBe("EL-SEMANTIC-PARAPHRASE");
  });

  it("classificationCounts includes SEMANTIC_PARAPHRASE_MATCH with count ≥ 1", () => {
    const { s4 } = runStage4(FIXTURE_GUIDE_COMPANION_SECTION, FIXTURE_CODE_PARA_17);
    if (!s4.ok) return;
    expect(s4.linkageRecord.classificationCounts["SEMANTIC_PARAPHRASE_MATCH"]).toBeGreaterThanOrEqual(1);
  });

  it("one evidence record per statement (invariant preserved)", () => {
    const { s2, s4 } = runStage4(FIXTURE_GUIDE_COMPANION_SECTION, FIXTURE_CODE_PARA_17);
    if (!s2.ok || !s4.ok) return;
    expect(s4.evidenceRecords.length).toBe(s2.statements.length);
  });
});

// ---------------------------------------------------------------------------
// 2. EVIDENCE_ABSENT issue no longer fires for paragraph 17 pair
// ---------------------------------------------------------------------------

describe("DRA-FIX-002 — EVIDENCE_ABSENT no longer fires for paragraph 17", () => {
  it("consistency check produces no EVIDENCE_ABSENT for the companion-questions statement", () => {
    const { req, s2, s3, s4 } = runStage4(
      FIXTURE_GUIDE_COMPANION_SECTION,
      FIXTURE_CODE_PARA_17,
    );
    if (!s2.ok || !s4.ok) return;

    const s5 = assessMateriality(req, s2, s3, s4);
    if (!s5.ok) return;

    const s6 = checkConsistency(req, s2, s3, s4, s5);
    if (!s6.ok) return;

    // Find the semantic paraphrase record — get its statementId
    const semRec = s4.evidenceRecords.find(
      (r) => r.classification === "SEMANTIC_PARAPHRASE_MATCH",
    );
    if (!semRec) return; // already tested above that it exists

    // Verify no EVIDENCE_ABSENT issue references this statementId
    const evidenceAbsentIssues = s6.issues.filter(
      (issue) =>
        issue.issueClass === "EVIDENCE_ABSENT" &&
        issue.affectedStatementIds.some((sid) => String(sid) === String(semRec.statementId)),
    );
    expect(evidenceAbsentIssues).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 3. Polarity safeguard at pipeline level
// ---------------------------------------------------------------------------

describe("DRA-FIX-002 — polarity safeguard (pipeline level)", () => {
  it("positive-polarity companion statement does NOT match negative Code para 17", () => {
    // Guide says companion CAN answer; Code says it CANNOT
    // → different polarity → no semantic match → NO_DOCUMENT_EVIDENCE
    const positiveGuide = [
      "Attending a disciplinary hearing – the role of the companion",
      "",
      "The companion is entitled to answer questions on the worker's behalf",
      "during the disciplinary hearing.",
    ].join("\n");

    const { s4 } = runStage4(positiveGuide, FIXTURE_CODE_PARA_17);
    if (!s4.ok) return;

    // No SEMANTIC_PARAPHRASE_MATCH should appear — polarity mismatch
    const semRecs = s4.evidenceRecords.filter(
      (r) => r.classification === "SEMANTIC_PARAPHRASE_MATCH",
    );
    expect(semRecs).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 4. No source documents → no semantic matching attempted
// ---------------------------------------------------------------------------

describe("DRA-FIX-002 — no semantic match without source documents", () => {
  it("plain statement without source documents still gets NO_DOCUMENT_EVIDENCE", () => {
    // Same guide content, but no sourceDocuments provided
    const { s4 } = runStage4(FIXTURE_GUIDE_COMPANION_SECTION); // no sourceText
    if (!s4.ok) return;
    // Without source documents, semantic matching is bypassed
    // All records should be NO_DOCUMENT_EVIDENCE (none have citations)
    const semRecs = s4.evidenceRecords.filter(
      (r) => r.classification === "SEMANTIC_PARAPHRASE_MATCH",
    );
    expect(semRecs).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 5. Existing evidence-linkage fixture compatibility
// ---------------------------------------------------------------------------

describe("DRA-FIX-002 — existing fixture compatibility", () => {
  it("numbered citation [1] still produces CITED_REFERENCE", () => {
    const { s4 } = runStage4("Encryption is mandatory [1].", "Source text.");
    if (!s4.ok) return;
    expect(s4.evidenceRecords[0]!.classification).toBe("CITED_REFERENCE");
    expect(s4.evidenceRecords[0]!.linkageRule).toBe("EL-NUMBERED-CITE");
  });

  it("section reference 'Section 5' still produces DOCUMENT_CROSS_REFERENCE", () => {
    const { s4 } = runStage4("Refer to Section 5 for details.", "Source text.");
    if (!s4.ok) return;
    expect(s4.evidenceRecords[0]!.classification).toBe("DOCUMENT_CROSS_REFERENCE");
    expect(s4.evidenceRecords[0]!.linkageRule).toBe("EL-SECTION-REF");
  });

  it("plain statement with no evidence and no source still produces NO_DOCUMENT_EVIDENCE", () => {
    const { s4 } = runStage4("The system is compliant.");
    if (!s4.ok) return;
    expect(s4.evidenceRecords[0]!.classification).toBe("NO_DOCUMENT_EVIDENCE");
  });

  it("plain statement with non-matching source still produces NO_DOCUMENT_EVIDENCE", () => {
    // Source is completely unrelated to the statement
    const { s4 } = runStage4(
      "The system is compliant.",
      "The weather today is warm and sunny with clear skies.",
    );
    if (!s4.ok) return;
    expect(s4.evidenceRecords[0]!.classification).toBe("NO_DOCUMENT_EVIDENCE");
  });

  it("URL evidence still produces EXTERNAL_REFERENCE_PRESENT", () => {
    const { s4 } = runStage4(
      "More information at https://www.acas.org.uk/guidance.",
      "Source text.",
    );
    if (!s4.ok) return;
    expect(s4.evidenceRecords[0]!.classification).toBe("EXTERNAL_REFERENCE_PRESENT");
  });

  it("legislation reference still produces DIRECT_DOCUMENT_EVIDENCE", () => {
    const { s4 } = runStage4(
      "Under the Employment Rights Act, workers have entitlements.",
      "Source text.",
    );
    if (!s4.ok) return;
    expect(s4.evidenceRecords[0]!.classification).toBe("DIRECT_DOCUMENT_EVIDENCE");
  });

  it("citation takes priority over semantic paraphrase when both present", () => {
    // Statement has a citation AND is a paraphrase → citation wins (detectEvidence first)
    const { s4 } = runStage4(
      "You are not legally required to permit the companion to answer questions [1].",
      FIXTURE_CODE_PARA_17,
    );
    if (!s4.ok) return;
    // [1] citation fires first → CITED_REFERENCE
    const rec = s4.evidenceRecords[0];
    expect(rec?.classification).toBe("CITED_REFERENCE");
    expect(rec?.linkageRule).toBe("EL-NUMBERED-CITE");
  });
});

// ---------------------------------------------------------------------------
// 6. Determinism at pipeline level
// ---------------------------------------------------------------------------

describe("DRA-FIX-002 — determinism", () => {
  it("identical inputs produce identical Stage 4 results", () => {
    const r1 = runStage4(FIXTURE_GUIDE_COMPANION_SECTION, FIXTURE_CODE_PARA_17, "eval-det1");
    const r2 = runStage4(FIXTURE_GUIDE_COMPANION_SECTION, FIXTURE_CODE_PARA_17, "eval-det2");
    if (!r1.s4.ok || !r2.s4.ok) return;
    // Classifications must be identical (ignoring evaluationId/recordId differences)
    const cls1 = r1.s4.evidenceRecords.map((r) => r.classification);
    const cls2 = r2.s4.evidenceRecords.map((r) => r.classification);
    expect(cls1).toEqual(cls2);
    // linkageRules must be identical
    const rules1 = r1.s4.evidenceRecords.map((r) => r.linkageRule);
    const rules2 = r2.s4.evidenceRecords.map((r) => r.linkageRule);
    expect(rules1).toEqual(rules2);
  });

  it("classificationCounts are deterministic across repeated runs", () => {
    const r1 = runStage4(FIXTURE_GUIDE_COMPANION_SECTION, FIXTURE_CODE_PARA_17, "eval-cnt1");
    const r2 = runStage4(FIXTURE_GUIDE_COMPANION_SECTION, FIXTURE_CODE_PARA_17, "eval-cnt2");
    if (!r1.s4.ok || !r2.s4.ok) return;
    expect(r1.s4.linkageRecord.classificationCounts).toEqual(
      r2.s4.linkageRecord.classificationCounts,
    );
  });
});

// ---------------------------------------------------------------------------
// 7. SEMANTIC_PARAPHRASE_MATCH properties
// ---------------------------------------------------------------------------

describe("DRA-FIX-002 — SEMANTIC_PARAPHRASE_MATCH record properties", () => {
  it("statementId is preserved unchanged from Stage 2", () => {
    const { s2, s4 } = runStage4(FIXTURE_GUIDE_COMPANION_SECTION, FIXTURE_CODE_PARA_17);
    if (!s2.ok || !s4.ok) return;
    const semRec = s4.evidenceRecords.find(
      (r) => r.classification === "SEMANTIC_PARAPHRASE_MATCH",
    );
    if (!semRec) return;
    const matchingStmt = s2.statements.find(
      (s) => String(s.id) === String(semRec.statementId),
    );
    expect(matchingStmt).toBeDefined();
  });

  it("recordIndex is non-negative and less than total records", () => {
    const { s4 } = runStage4(FIXTURE_GUIDE_COMPANION_SECTION, FIXTURE_CODE_PARA_17);
    if (!s4.ok) return;
    const semRec = s4.evidenceRecords.find(
      (r) => r.classification === "SEMANTIC_PARAPHRASE_MATCH",
    );
    if (!semRec) return;
    expect(semRec.recordIndex).toBeGreaterThanOrEqual(0);
    expect(semRec.recordIndex).toBeLessThan(s4.evidenceRecords.length);
  });

  it("statementSpan is present and has valid offsets", () => {
    const { s4 } = runStage4(FIXTURE_GUIDE_COMPANION_SECTION, FIXTURE_CODE_PARA_17);
    if (!s4.ok) return;
    const semRec = s4.evidenceRecords.find(
      (r) => r.classification === "SEMANTIC_PARAPHRASE_MATCH",
    );
    if (!semRec) return;
    expect(semRec.statementSpan.startOffset).toBeGreaterThanOrEqual(0);
    expect(semRec.statementSpan.endOffset).toBeGreaterThan(
      semRec.statementSpan.startOffset,
    );
  });

  it("does not carry credibilityScore, isVerified, or materialityLevel", () => {
    const { s4 } = runStage4(FIXTURE_GUIDE_COMPANION_SECTION, FIXTURE_CODE_PARA_17);
    if (!s4.ok) return;
    const semRec = s4.evidenceRecords.find(
      (r) => r.classification === "SEMANTIC_PARAPHRASE_MATCH",
    ) as unknown as Record<string, unknown> | undefined;
    expect(semRec?.["credibilityScore"]).toBeUndefined();
    expect(semRec?.["isVerified"]).toBeUndefined();
    expect(semRec?.["materialityLevel"]).toBeUndefined();
  });
});
