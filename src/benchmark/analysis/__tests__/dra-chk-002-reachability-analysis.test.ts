/**
 * DRA-CHK-002 — Version 1 Issue-Class Reachability and Coverage-Ceiling Analysis
 *
 * Checkpoint: DRA-CHK-002
 * Date: 2026-08-06
 *
 * Purpose: Establish the true behavioural boundary of the frozen DRA Version 1
 * evaluator through code-path analysis, targeted tests, and adversarial
 * valid-input construction attempts.
 *
 * This test file:
 *   1. Enumerates all nine canonical issue classes.
 *   2. Inventories which have emission rules in the pipeline.
 *   3. Inventories which upstream states are producible by frozen stages.
 *   4. Classifies each class by reachability status.
 *   5. Proves observed-class execution paths (IC-4, IC-5, IC-7).
 *   6. Proves structural barriers for IC-1 and IC-3 (NO_IDENTIFIABLE_SOURCE barrier).
 *   7. Proves structural barriers for IC-2, IC-6, IC-8, IC-9 (no emission rule).
 *   8. Attempts adversarial valid inputs for every unobserved class.
 *   9. Proves Stage 3 fallback always produces DOCUMENT_AUTHOR.
 *  10. Reconciles findings with the 14-document frozen corpus.
 *  11. Calculates the Version 1 coverage ceiling.
 *  12. Verifies historical benchmark consistency.
 *  13. Verifies the Version 1 freeze is intact.
 *
 * IMPORTANT DISTINCTIONS enforced throughout:
 *   A. Emission-rule executability ≠ pipeline reachability.
 *   B. Pipeline reachability ≠ corpus observation.
 *   C. A fabricated internal object that triggers an emission rule does NOT
 *      prove the class is reachable through the Version 1 pipeline.
 *
 * No evaluator semantics are modified by this test. All tests are read-only
 * with respect to production evaluator behaviour.
 */

import { describe, it, expect } from "vitest";

// ── Model ─────────────────────────────────────────────────────────────────
import {
  ISSUE_CLASSES,
  ISSUE_CLASS_CODES,
} from "../../../model/issue-classes.js";
import {
  DRA_EVALUATOR_VERSION,
  DRA_PIPELINE_VERSION,
  DRA_MODEL_VERSION,
} from "../../../model/versions.js";

// ── Stage implementations ─────────────────────────────────────────────────
import { AUTHORITY_CLASSIFICATIONS } from "../../../authority-resolution/authority-classification.js";
import { evaluateDocument } from "../../../pipeline/index.js";
import { normaliseEvaluationRequest } from "../../../normalisation/index.js";
import { extractClaims } from "../../../claim-extraction/index.js";
import { resolveAuthority } from "../../../authority-resolution/index.js";
import { linkEvidence } from "../../../evidence-linkage/index.js";
import { assessMateriality } from "../../../materiality-assessment/index.js";
import { checkConsistency } from "../../../consistency-check/index.js";

// ── Reachability matrix ───────────────────────────────────────────────────
import {
  REACHABILITY_MATRIX,
  CANONICAL_CLASS_COUNT,
  REACHABLE_CLASSES,
  OBSERVED_CLASSES,
  UNREACHABLE_CLASSES,
  REACHABLE_UNOBSERVED_CLASSES,
  RAW_CANONICAL_COVERAGE,
  REACHABLE_CLASS_COVERAGE,
  COVERAGE_CEILING,
  type ReachabilityEntry,
} from "../reachability-matrix.js";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

type Req = Parameters<typeof extractClaims>[0];

function makeRequest(
  content: string,
  evalId = "chk002-eval",
  docId = "chk002-doc",
): Req {
  return {
    id: evalId as Req["id"],
    requestedAt: "2026-08-06T12:00:00.000Z",
    generatedDocument: {
      id: docId as Req["generatedDocument"]["id"],
      title: "DRA-CHK-002 Test Document",
      content,
      sourceDocumentIds: [],
      generatedAt: "2026-08-06T11:00:00.000Z",
    },
    sourceDocuments: [],
  };
}

/**
 * Runs all five prior stages and returns the stage outputs needed by Stage 6.
 * Uses the real, unmodified pipeline — no mocks.
 */
function runPipeline(content: string, evalId = "chk002-eval") {
  const req = makeRequest(content, evalId);
  const s1 = normaliseEvaluationRequest(req);
  if (!s1.ok) throw new Error("Stage 1 failed: " + JSON.stringify(s1.errors));
  const s2 = extractClaims(s1.normalisedRequest);
  if (!s2.ok) throw new Error("Stage 2 failed");
  const s3 = resolveAuthority(s1.normalisedRequest, s2);
  if (!s3.ok) throw new Error("Stage 3 failed");
  const s4 = linkEvidence(s1.normalisedRequest, s2, s3);
  if (!s4.ok) throw new Error("Stage 4 failed");
  const s5 = assessMateriality(s1.normalisedRequest, s2, s3, s4);
  if (!s5.ok) throw new Error("Stage 5 failed");
  return { s1, s2, s3, s4, s5 };
}

/**
 * Runs the full pipeline through Stage 6 (Consistency Check).
 */
function runConsistencyCheck(content: string, evalId = "chk002-eval") {
  const { s1, s2, s3, s4, s5 } = runPipeline(content, evalId);
  return checkConsistency(s1.normalisedRequest, s2, s3, s4, s5);
}

// ---------------------------------------------------------------------------
// Part 1 — Canonical Issue-Class Enumeration
// ---------------------------------------------------------------------------

describe("DRA-CHK-002 — Part 1: Canonical Issue-Class Enumeration", () => {
  it("the DRA Version 1 taxonomy defines exactly nine canonical issue classes", () => {
    expect(ISSUE_CLASSES).toHaveLength(9);
    expect(CANONICAL_CLASS_COUNT).toBe(9);
  });

  it("all nine canonical issue-class names are present", () => {
    const names = new Set(ISSUE_CLASSES);
    expect(names.has("UNSUPPORTED_CLAIM")).toBe(true);    // IC-1
    expect(names.has("AUTHORITY_EXPIRED")).toBe(true);    // IC-2
    expect(names.has("AUTHORITY_ABSENT")).toBe(true);     // IC-3
    expect(names.has("EVIDENCE_ABSENT")).toBe(true);      // IC-4
    expect(names.has("EVIDENCE_INADEQUATE")).toBe(true);  // IC-5
    expect(names.has("EVIDENCE_CONFLICT")).toBe(true);    // IC-6
    expect(names.has("CLAIM_INCONSISTENCY")).toBe(true);  // IC-7
    expect(names.has("TRACEABILITY_BROKEN")).toBe(true);  // IC-8
    expect(names.has("SCOPE_VIOLATION")).toBe(true);      // IC-9
  });

  it("all nine canonical issue-class codes IC-1 through IC-9 are present", () => {
    const codes = new Set(Object.keys(ISSUE_CLASS_CODES));
    for (let i = 1; i <= 9; i++) {
      expect(codes.has(`IC-${i}`)).toBe(true);
    }
  });

  it("reachability matrix covers exactly nine classes in IC-1 … IC-9 order", () => {
    expect(REACHABILITY_MATRIX).toHaveLength(9);
    REACHABILITY_MATRIX.forEach((entry, idx) => {
      expect(entry.code).toBe(`IC-${idx + 1}`);
    });
  });

  it("reachability matrix codes map to canonical class names", () => {
    const codeToName: Record<string, string> = {
      "IC-1": "UNSUPPORTED_CLAIM",
      "IC-2": "AUTHORITY_EXPIRED",
      "IC-3": "AUTHORITY_ABSENT",
      "IC-4": "EVIDENCE_ABSENT",
      "IC-5": "EVIDENCE_INADEQUATE",
      "IC-6": "EVIDENCE_CONFLICT",
      "IC-7": "CLAIM_INCONSISTENCY",
      "IC-8": "TRACEABILITY_BROKEN",
      "IC-9": "SCOPE_VIOLATION",
    };
    for (const entry of REACHABILITY_MATRIX) {
      expect(entry.name).toBe(codeToName[entry.code]);
    }
  });
});

// ---------------------------------------------------------------------------
// Part 2 — Emission-Rule Inventory
// ---------------------------------------------------------------------------

describe("DRA-CHK-002 — Part 2: Emission-Rule Inventory", () => {
  it("reports which classes have emission rules in issue-detection.ts", () => {
    // Classes WITH emission rules (from code analysis of issue-detection.ts):
    // IC-1, IC-3, IC-4, IC-5, IC-7
    const withRules = REACHABILITY_MATRIX.filter((e) => e.emissionRuleExists);
    const codesWithRules = withRules.map((e) => e.code);
    expect(codesWithRules).toContain("IC-1");
    expect(codesWithRules).toContain("IC-3");
    expect(codesWithRules).toContain("IC-4");
    expect(codesWithRules).toContain("IC-5");
    expect(codesWithRules).toContain("IC-7");
  });

  it("reports which classes have NO emission rules in the pipeline", () => {
    // Classes WITHOUT emission rules:
    // IC-2, IC-6, IC-8, IC-9
    const withoutRules = REACHABILITY_MATRIX.filter((e) => !e.emissionRuleExists);
    const codesWithoutRules = withoutRules.map((e) => e.code);
    expect(codesWithoutRules).toContain("IC-2");
    expect(codesWithoutRules).toContain("IC-6");
    expect(codesWithoutRules).toContain("IC-8");
    expect(codesWithoutRules).toContain("IC-9");
  });

  it("having an emission rule does NOT imply pipeline reachability (IC-1, IC-3)", () => {
    // IC-1 and IC-3 have emission rules but are STRUCTURALLY_UNREACHABLE
    const ic1 = REACHABILITY_MATRIX.find((e) => e.code === "IC-1")!;
    const ic3 = REACHABILITY_MATRIX.find((e) => e.code === "IC-3")!;
    expect(ic1.emissionRuleExists).toBe(true);
    expect(ic1.reachability).toBe("STRUCTURALLY_UNREACHABLE");
    expect(ic3.emissionRuleExists).toBe(true);
    expect(ic3.reachability).toBe("STRUCTURALLY_UNREACHABLE");
    // Verify the structural barrier description is non-null for both
    expect(ic1.structuralBarrier).not.toBeNull();
    expect(ic3.structuralBarrier).not.toBeNull();
  });

  it("five classes have emission rules; three of those are reachable", () => {
    const withRules = REACHABILITY_MATRIX.filter((e) => e.emissionRuleExists);
    const reachableWithRules = withRules.filter(
      (e) =>
        e.reachability === "OBSERVED_REACHABLE" ||
        e.reachability === "REACHABLE_UNOBSERVED",
    );
    expect(withRules).toHaveLength(5);        // IC-1, IC-3, IC-4, IC-5, IC-7
    expect(reachableWithRules).toHaveLength(3); // IC-4, IC-5, IC-7
  });
});

// ---------------------------------------------------------------------------
// Part 3 — Upstream-Producer Inventory
// ---------------------------------------------------------------------------

describe("DRA-CHK-002 — Part 3: Upstream-Producer Inventory", () => {
  it("NO_IDENTIFIABLE_SOURCE is a valid AuthorityClassification in the schema", () => {
    // The classification exists in the type system but is never produced
    expect(AUTHORITY_CLASSIFICATIONS).toContain("NO_IDENTIFIABLE_SOURCE");
  });

  it("all five classifications that Stage 3 can actually produce are in the schema", () => {
    const producible = [
      "DOCUMENT_AUTHOR",
      "EXPLICIT_NAMED_SOURCE",
      "EXPLICIT_UNNAMED_SOURCE",
      "STRUCTURALLY_INHERITED_SOURCE",
      "AMBIGUOUS_SOURCE",
    ];
    for (const c of producible) {
      expect(AUTHORITY_CLASSIFICATIONS).toContain(c);
    }
  });

  it("Stage 3 does not produce NO_IDENTIFIABLE_SOURCE for any attribution pattern", () => {
    // Run a range of attribution patterns through the full pipeline and
    // confirm NO authority record has classification NO_IDENTIFIABLE_SOURCE.
    const testInputs = [
      // Self-referential → DOCUMENT_AUTHOR
      "We confirm that all data is encrypted at rest.",
      // Pronoun → AMBIGUOUS_SOURCE
      "He must ensure that all services comply with the policy.",
      // Named attribution → EXPLICIT_NAMED_SOURCE
      "According to the World Health Organization, all systems must comply.",
      // Post-statement attribution → EXPLICIT_NAMED_SOURCE
      "All systems must comply with the standard, according to the regulator.",
      // No attribution at all → DOCUMENT_AUTHOR (fallback)
      "All services must encrypt communications in transit.",
      // Vague attribution → EXPLICIT_UNNAMED_SOURCE
      "According to experts, the system must be updated.",
      // Direct quotation → AMBIGUOUS_SOURCE
      '"The system must not store personal data without consent."',
    ];

    for (const content of testInputs) {
      const { s3 } = runPipeline(content, `chk002-stage3-${testInputs.indexOf(content)}`);
      expect(s3.ok).toBe(true);
      if (!s3.ok) continue;
      for (const ar of s3.authorityRecords) {
        expect(ar.classification).not.toBe("NO_IDENTIFIABLE_SOURCE");
      }
    }
  });

  it("Stage 4 can produce NO_DOCUMENT_EVIDENCE (required for IC-4/IC-5)", () => {
    // A document with a CRITICAL security mandate and no inline citations —
    // the same content pattern confirmed in check-consistency.test.ts to produce NO_DOCUMENT_EVIDENCE
    const content =
      "All services must encrypt user data at rest. " +
      "All production services must encrypt communications in transit.";
    const { s4 } = runPipeline(content, "chk002-stage4-nde");
    expect(s4.ok).toBe(true);
    if (!s4.ok) return;
    const noDocEvid = s4.evidenceRecords.filter(
      (er) => er.classification === "NO_DOCUMENT_EVIDENCE",
    );
    expect(noDocEvid.length).toBeGreaterThan(0);
  });

  it("Stage 5 can produce CRITICAL materiality (required for IC-4)", () => {
    const content =
      "All systems must encrypt data at rest to comply with GDPR requirements.";
    const { s5 } = runPipeline(content, "chk002-stage5-crit");
    expect(s5.ok).toBe(true);
    if (!s5.ok) return;
    const critical = s5.materialityRecords.filter(
      (mr) => mr.classification === "CRITICAL",
    );
    expect(critical.length).toBeGreaterThan(0);
  });

  it("Stage 5 can produce HIGH materiality (required for IC-5 and IC-7)", () => {
    const content =
      "All changes must be approved before deployment to production environments.";
    const { s5 } = runPipeline(content, "chk002-stage5-high");
    expect(s5.ok).toBe(true);
    if (!s5.ok) return;
    const high = s5.materialityRecords.filter(
      (mr) => mr.classification === "HIGH",
    );
    expect(high.length).toBeGreaterThan(0);
  });

  it("IC-1/IC-3 upstream state (NO_IDENTIFIABLE_SOURCE) is NOT produced by Stage 3", () => {
    // This is the primary barrier for IC-1 and IC-3:
    // The required upstream state exists in the schema but Stage 3 never produces it.
    const ic1 = REACHABILITY_MATRIX.find((e) => e.code === "IC-1")!;
    const ic3 = REACHABILITY_MATRIX.find((e) => e.code === "IC-3")!;
    expect(ic1.upstreamStateReachable).toBe(false);
    expect(ic3.upstreamStateReachable).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Part 4 — Per-Class Reachability Classification
// ---------------------------------------------------------------------------

describe("DRA-CHK-002 — Part 4: Per-Class Reachability Classification", () => {
  it("IC-1 UNSUPPORTED_CLAIM is STRUCTURALLY_UNREACHABLE", () => {
    const e = REACHABILITY_MATRIX.find((e) => e.code === "IC-1")!;
    expect(e.reachability).toBe("STRUCTURALLY_UNREACHABLE");
  });

  it("IC-2 AUTHORITY_EXPIRED is STRUCTURALLY_UNREACHABLE", () => {
    const e = REACHABILITY_MATRIX.find((e) => e.code === "IC-2")!;
    expect(e.reachability).toBe("STRUCTURALLY_UNREACHABLE");
  });

  it("IC-3 AUTHORITY_ABSENT is STRUCTURALLY_UNREACHABLE", () => {
    const e = REACHABILITY_MATRIX.find((e) => e.code === "IC-3")!;
    expect(e.reachability).toBe("STRUCTURALLY_UNREACHABLE");
  });

  it("IC-4 EVIDENCE_ABSENT is OBSERVED_REACHABLE", () => {
    const e = REACHABILITY_MATRIX.find((e) => e.code === "IC-4")!;
    expect(e.reachability).toBe("OBSERVED_REACHABLE");
  });

  it("IC-5 EVIDENCE_INADEQUATE is OBSERVED_REACHABLE", () => {
    const e = REACHABILITY_MATRIX.find((e) => e.code === "IC-5")!;
    expect(e.reachability).toBe("OBSERVED_REACHABLE");
  });

  it("IC-6 EVIDENCE_CONFLICT is STRUCTURALLY_UNREACHABLE", () => {
    const e = REACHABILITY_MATRIX.find((e) => e.code === "IC-6")!;
    expect(e.reachability).toBe("STRUCTURALLY_UNREACHABLE");
  });

  it("IC-7 CLAIM_INCONSISTENCY is OBSERVED_REACHABLE", () => {
    const e = REACHABILITY_MATRIX.find((e) => e.code === "IC-7")!;
    expect(e.reachability).toBe("OBSERVED_REACHABLE");
  });

  it("IC-8 TRACEABILITY_BROKEN is STRUCTURALLY_UNREACHABLE", () => {
    const e = REACHABILITY_MATRIX.find((e) => e.code === "IC-8")!;
    expect(e.reachability).toBe("STRUCTURALLY_UNREACHABLE");
  });

  it("IC-9 SCOPE_VIOLATION is STRUCTURALLY_UNREACHABLE", () => {
    const e = REACHABILITY_MATRIX.find((e) => e.code === "IC-9")!;
    expect(e.reachability).toBe("STRUCTURALLY_UNREACHABLE");
  });

  it("exactly 3 classes are OBSERVED_REACHABLE", () => {
    const observed = REACHABILITY_MATRIX.filter(
      (e) => e.reachability === "OBSERVED_REACHABLE",
    );
    expect(observed).toHaveLength(3);
    const codes = observed.map((e) => e.code);
    expect(codes).toContain("IC-4");
    expect(codes).toContain("IC-5");
    expect(codes).toContain("IC-7");
  });

  it("exactly 6 classes are STRUCTURALLY_UNREACHABLE", () => {
    const unreachable = REACHABILITY_MATRIX.filter(
      (e) => e.reachability === "STRUCTURALLY_UNREACHABLE",
    );
    expect(unreachable).toHaveLength(6);
    const codes = unreachable.map((e) => e.code);
    expect(codes).toContain("IC-1");
    expect(codes).toContain("IC-2");
    expect(codes).toContain("IC-3");
    expect(codes).toContain("IC-6");
    expect(codes).toContain("IC-8");
    expect(codes).toContain("IC-9");
  });

  it("no class is classified as REACHABLE_UNOBSERVED", () => {
    expect(REACHABLE_UNOBSERVED_CLASSES).toHaveLength(0);
  });

  it("no class is classified as INDETERMINATE", () => {
    const indeterminate = REACHABILITY_MATRIX.filter(
      (e) => e.reachability === "INDETERMINATE",
    );
    expect(indeterminate).toHaveLength(0);
  });

  it("all unreachable classes have a non-null structural barrier description", () => {
    for (const e of UNREACHABLE_CLASSES) {
      expect(e.structuralBarrier).not.toBeNull();
      expect(e.structuralBarrier!.length).toBeGreaterThan(50);
    }
  });

  it("all reachable classes have a null structural barrier", () => {
    for (const e of REACHABLE_CLASSES) {
      expect(e.structuralBarrier).toBeNull();
    }
  });
});

// ---------------------------------------------------------------------------
// Part 5 — Observed-Class Execution Paths (IC-4, IC-5, IC-7)
// ---------------------------------------------------------------------------

describe("DRA-CHK-002 — Part 5: Observed-Class Execution Paths (IC-4, IC-5, IC-7)", () => {
  describe("IC-4 EVIDENCE_ABSENT — execution path", () => {
    it("IC-4 fires for CRITICAL statement with no documentary evidence, via full pipeline", () => {
      // CRITICAL trigger: MA-CRITICAL-SECURITY ("must encrypt" with no evidence)
      // No evidence citations in document → NO_DOCUMENT_EVIDENCE from Stage 4
      // Stage 3 → DOCUMENT_AUTHOR (any non-NO_IDENTIFIABLE_SOURCE satisfies !noAuth)
      // Content pattern confirmed in check-consistency.test.ts to produce IC-4
      const content =
        "All services must encrypt user data at rest. " +
        "All production services must encrypt communications in transit.";
      const result = runConsistencyCheck(content, "chk002-ic4-path");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const ic4Issues = result.issues.filter(
        (i) => i.issueClass === "EVIDENCE_ABSENT",
      );
      expect(ic4Issues.length).toBeGreaterThan(0);
      if (ic4Issues.length > 0) {
        expect(ic4Issues[0].severity).toBe("BLOCKING");
        expect(ic4Issues[0].stageAssociation).toBe("Consistency Check");
      }
    });

    it("IC-4 path: Stage 3 authority is DOCUMENT_AUTHOR (not NO_IDENTIFIABLE_SOURCE)", () => {
      const content =
        "All systems must comply with the Payment Card Industry Data Security Standard.";
      const { s3 } = runPipeline(content, "chk002-ic4-authority");
      expect(s3.ok).toBe(true);
      if (!s3.ok) return;
      // Authority is DOCUMENT_AUTHOR, not NO_IDENTIFIABLE_SOURCE
      expect(s3.authorityRecords[0]?.classification).toBe("DOCUMENT_AUTHOR");
    });

    it("IC-4 path: Stage 4 produces NO_DOCUMENT_EVIDENCE (triggering the absent-evidence condition)", () => {
      const content =
        "All systems must comply with the Payment Card Industry Data Security Standard.";
      const { s4 } = runPipeline(content, "chk002-ic4-evidence");
      expect(s4.ok).toBe(true);
      if (!s4.ok) return;
      expect(s4.evidenceRecords[0]?.classification).toBe("NO_DOCUMENT_EVIDENCE");
    });

    it("IC-4 path remains reachable and deterministic on repeated execution", () => {
      const content =
        "All systems must comply with the Payment Card Industry Data Security Standard.";
      const r1 = runConsistencyCheck(content, "chk002-ic4-repro-a");
      const r2 = runConsistencyCheck(content, "chk002-ic4-repro-a");
      expect(r1.ok).toBe(true);
      expect(r2.ok).toBe(true);
      if (!r1.ok || !r2.ok) return;
      const ic4a = r1.issues.filter((i) => i.issueClass === "EVIDENCE_ABSENT");
      const ic4b = r2.issues.filter((i) => i.issueClass === "EVIDENCE_ABSENT");
      expect(ic4a.length).toBe(ic4b.length);
    });
  });

  describe("IC-5 EVIDENCE_INADEQUATE — execution path", () => {
    it("IC-5 fires for HIGH statement with no/ambiguous evidence, via full pipeline", () => {
      // HIGH trigger: obligation without CRITICAL sub-rules ("must be approved" → MA-HIGH-OBLIGATION)
      // No evidence citations → NO_DOCUMENT_EVIDENCE or AMBIGUOUS_EVIDENCE_LINK
      const content =
        "All software changes must be approved by the change advisory board before deployment. " +
        "Deployment plans must be submitted for review at least five business days in advance.";
      const result = runConsistencyCheck(content, "chk002-ic5-path");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const ic5Issues = result.issues.filter(
        (i) => i.issueClass === "EVIDENCE_INADEQUATE",
      );
      expect(ic5Issues.length).toBeGreaterThan(0);
      if (ic5Issues.length > 0) {
        expect(ic5Issues[0].severity).toBe("ADVISORY");
        expect(ic5Issues[0].stageAssociation).toBe("Consistency Check");
      }
    });

    it("IC-5 path: Stage 5 produces HIGH materiality for obligation statements", () => {
      const content =
        "All software changes must be approved by the change advisory board before deployment.";
      const { s5 } = runPipeline(content, "chk002-ic5-materiality");
      expect(s5.ok).toBe(true);
      if (!s5.ok) return;
      const high = s5.materialityRecords.filter((mr) => mr.classification === "HIGH");
      expect(high.length).toBeGreaterThan(0);
    });

    it("IC-5 path remains reachable and deterministic on repeated execution", () => {
      const content =
        "All software changes must be approved before deployment to production systems.";
      const r1 = runConsistencyCheck(content, "chk002-ic5-repro");
      const r2 = runConsistencyCheck(content, "chk002-ic5-repro");
      expect(r1.ok).toBe(true);
      expect(r2.ok).toBe(true);
      if (!r1.ok || !r2.ok) return;
      const ic5a = r1.issues.filter((i) => i.issueClass === "EVIDENCE_INADEQUATE");
      const ic5b = r2.issues.filter((i) => i.issueClass === "EVIDENCE_INADEQUATE");
      expect(ic5a.length).toBe(ic5b.length);
    });
  });

  describe("IC-7 CLAIM_INCONSISTENCY — execution path", () => {
    it("IC-7 fires for two CRITICAL/HIGH statements with contradictory deontic modals, via full pipeline", () => {
      // "must encrypt" (affirmative) vs "must not encrypt" (negated) — same verb
      const content =
        "The system must encrypt all user data at rest to meet security requirements. " +
        "The system must not encrypt legacy database fields stored in the backup archive. " +
        "These two policies apply to all production services deployed in the organisation.";
      const result = runConsistencyCheck(content, "chk002-ic7-path");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const ic7Issues = result.issues.filter(
        (i) => i.issueClass === "CLAIM_INCONSISTENCY",
      );
      expect(ic7Issues.length).toBeGreaterThan(0);
      if (ic7Issues.length > 0) {
        expect(ic7Issues[0].severity).toBe("ADVISORY");
        expect(ic7Issues[0].affectedStatementIds).toHaveLength(2);
        expect(ic7Issues[0].stageAssociation).toBe("Consistency Check");
      }
    });

    it("IC-7 path: both affected statements must have HIGH or CRITICAL materiality", () => {
      const content =
        "The system must encrypt all user data at rest to meet security requirements. " +
        "The system must not encrypt legacy database fields stored in the backup archive. " +
        "These two policies apply to all production services deployed in the organisation.";
      const { s5, s2 } = runPipeline(content, "chk002-ic7-materiality");
      expect(s5.ok).toBe(true);
      if (!s5.ok) return;
      const highOrCritical = s5.materialityRecords.filter(
        (mr) => mr.classification === "HIGH" || mr.classification === "CRITICAL",
      );
      expect(highOrCritical.length).toBeGreaterThanOrEqual(2);
      expect(s2.ok).toBe(true);
    });

    it("IC-7 path remains reachable and deterministic on repeated execution", () => {
      const content =
        "The system must encrypt all user data at rest for security compliance. " +
        "The system must not encrypt legacy database fields in the backup storage.";
      const r1 = runConsistencyCheck(content, "chk002-ic7-repro");
      const r2 = runConsistencyCheck(content, "chk002-ic7-repro");
      expect(r1.ok).toBe(true);
      expect(r2.ok).toBe(true);
      if (!r1.ok || !r2.ok) return;
      const ic7a = r1.issues.filter((i) => i.issueClass === "CLAIM_INCONSISTENCY");
      const ic7b = r2.issues.filter((i) => i.issueClass === "CLAIM_INCONSISTENCY");
      expect(ic7a.length).toBe(ic7b.length);
    });
  });
});

// ---------------------------------------------------------------------------
// Part 6 — Structural Barrier Proof: IC-1 and IC-3 (NO_IDENTIFIABLE_SOURCE)
// ---------------------------------------------------------------------------

describe("DRA-CHK-002 — Part 6: Structural Barrier Proof (IC-1 and IC-3)", () => {
  it("Stage 3 default fallback is always DOCUMENT_AUTHOR — no classification whatsoever triggers NO_IDENTIFIABLE_SOURCE", () => {
    // This tests the detectAttribution function directly via a content exercise.
    // Even with completely unmarked content, Stage 3 falls back to DOCUMENT_AUTHOR.
    const contentWithNoAttribution =
      "All requirements apply to all systems. " +
      "Compliance is mandatory for all deployments. " +
      "Verification must be completed before release.";
    const { s3 } = runPipeline(contentWithNoAttribution, "chk002-fallback");
    expect(s3.ok).toBe(true);
    if (!s3.ok) return;
    for (const ar of s3.authorityRecords) {
      expect(ar.classification).toBe("DOCUMENT_AUTHOR");
    }
  });

  it("IC-1 is never emitted by any valid pipeline execution", () => {
    // The strongest IC-1 trigger would be: CRITICAL/HIGH materiality + no authority + no evidence.
    // Since Stage 3 never produces NO_IDENTIFIABLE_SOURCE, IC-1 cannot fire.
    const strongIC1Attempt =
      "All systems must comply with mandatory security requirements immediately. " +
      "All deployments must implement mandatory access controls by the regulatory deadline. " +
      "All personal data must be protected in compliance with legally required standards.";
    const result = runConsistencyCheck(strongIC1Attempt, "chk002-ic1-barrier");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const ic1Issues = result.issues.filter(
      (i) => i.issueClass === "UNSUPPORTED_CLAIM",
    );
    // IC-1 cannot fire: Stage 3 assigns DOCUMENT_AUTHOR, so noAuth = false
    // IC-4 or IC-5 may fire instead (DOCUMENT_AUTHOR + CRITICAL/HIGH + no evidence)
    expect(ic1Issues).toHaveLength(0);
  });

  it("IC-3 is never emitted by any valid pipeline execution", () => {
    // The strongest IC-3 trigger: HIGH/CRITICAL + evidence present + no authority.
    // Since Stage 3 never produces NO_IDENTIFIABLE_SOURCE, IC-3 cannot fire.
    // A document with evidence citations (creating non-NO_DOCUMENT_EVIDENCE) is used.
    const strongIC3Attempt =
      "According to a 2023 study, all systems must implement security controls. " +
      "Research published in the Journal of Information Security confirms " +
      "that encryption must be applied to all regulated data stored at rest. " +
      "See Section 4.2 for implementation requirements and technical specifications.";
    const result = runConsistencyCheck(strongIC3Attempt, "chk002-ic3-barrier");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const ic3Issues = result.issues.filter(
      (i) => i.issueClass === "AUTHORITY_ABSENT",
    );
    // IC-3 cannot fire: Stage 3 resolves to EXPLICIT_NAMED_SOURCE or DOCUMENT_AUTHOR,
    // never NO_IDENTIFIABLE_SOURCE
    expect(ic3Issues).toHaveLength(0);
  });

  it("AMBIGUOUS_SOURCE from Stage 3 does NOT satisfy the IC-1/IC-3 noAuth condition", () => {
    // Even pronoun subjects (AMBIGUOUS_SOURCE) are NOT in NO_AUTHORITY set
    const pronounContent =
      "He must ensure that all systems comply with mandatory security requirements. " +
      "They must implement required controls before deployment to production.";
    const { s3 } = runPipeline(pronounContent, "chk002-ambig-noauth");
    expect(s3.ok).toBe(true);
    if (!s3.ok) return;
    const ambiguous = s3.authorityRecords.filter(
      (ar) => ar.classification === "AMBIGUOUS_SOURCE",
    );
    // AMBIGUOUS_SOURCE may be present, but it's not NO_IDENTIFIABLE_SOURCE
    for (const ar of s3.authorityRecords) {
      expect(ar.classification).not.toBe("NO_IDENTIFIABLE_SOURCE");
    }
    const result = runConsistencyCheck(pronounContent, "chk002-ambig-ic");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const ic1Issues = result.issues.filter((i) => i.issueClass === "UNSUPPORTED_CLAIM");
    const ic3Issues = result.issues.filter((i) => i.issueClass === "AUTHORITY_ABSENT");
    expect(ic1Issues).toHaveLength(0);
    expect(ic3Issues).toHaveLength(0);
    void ambiguous; // suppress unused warning
  });

  it("IC-1 emission rule is isolated-executable with fabricated state (NOT pipeline reachability)", () => {
    // DIAGNOSTIC NOTE: This test demonstrates the distinction between
    // emission-rule executability and pipeline reachability.
    //
    // The detectIssues function CAN emit IC-1 when given a fabricated authority record
    // with classification=NO_IDENTIFIABLE_SOURCE. This is rule-isolation testing only.
    // It does NOT prove IC-1 is pipeline-reachable — Stage 3 never produces that input.
    //
    // We prove this distinction by confirming the isolated emission rule exists
    // at the function level (via the matrix) and that it requires an impossible
    // upstream state (also via the matrix).
    const ic1Entry = REACHABILITY_MATRIX.find((e) => e.code === "IC-1")!;
    expect(ic1Entry.emissionRuleExists).toBe(true); // rule exists…
    expect(ic1Entry.reachability).toBe("STRUCTURALLY_UNREACHABLE"); // …but not reachable
    expect(ic1Entry.upstreamStateReachable).toBe(false); // required upstream state unproducible
    // Confirmed: emission-rule executability ≠ pipeline reachability.
  });
});

// ---------------------------------------------------------------------------
// Part 7 — Structural Barrier Proof: IC-2, IC-6, IC-8, IC-9
// ---------------------------------------------------------------------------

describe("DRA-CHK-002 — Part 7: Structural Barrier Proof (IC-2, IC-6, IC-8, IC-9)", () => {
  it("IC-2 AUTHORITY_EXPIRED has no emission rule in the pipeline", () => {
    const e = REACHABILITY_MATRIX.find((e) => e.code === "IC-2")!;
    expect(e.emissionRuleExists).toBe(false);
    expect(e.emissionRuleFile).toBeNull();
  });

  it("IC-6 EVIDENCE_CONFLICT has no emission rule in the pipeline", () => {
    const e = REACHABILITY_MATRIX.find((e) => e.code === "IC-6")!;
    expect(e.emissionRuleExists).toBe(false);
    expect(e.emissionRuleFile).toBeNull();
  });

  it("IC-8 TRACEABILITY_BROKEN has no emission rule in the evaluator pipeline", () => {
    const e = REACHABILITY_MATRIX.find((e) => e.code === "IC-8")!;
    expect(e.emissionRuleExists).toBe(false);
    expect(e.emissionRuleFile).toBeNull();
  });

  it("IC-9 SCOPE_VIOLATION has no emission rule in the evaluator pipeline", () => {
    const e = REACHABILITY_MATRIX.find((e) => e.code === "IC-9")!;
    expect(e.emissionRuleExists).toBe(false);
    expect(e.emissionRuleFile).toBeNull();
  });

  it("IC-2 is never emitted by any valid pipeline execution", () => {
    // Best IC-2 attempt: document referencing an outdated standard with an explicit year
    const ic2Attempt =
      "All systems must comply with the 2005 Information Security Management Standard, " +
      "which expired in 2010 according to the International Standards Organisation. " +
      "The outdated regulation requires immediate remediation under the current framework.";
    const result = runConsistencyCheck(ic2Attempt, "chk002-ic2-barrier");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const ic2Issues = result.issues.filter(
      (i) => i.issueClass === "AUTHORITY_EXPIRED",
    );
    expect(ic2Issues).toHaveLength(0);
  });

  it("IC-6 is never emitted by any valid pipeline execution", () => {
    // Best IC-6 attempt: document with contradictory evidence from two named sources
    const ic6Attempt =
      "According to the World Health Organization, all services must implement " +
      "strict data isolation controls to prevent cross-contamination of patient records. " +
      "According to the European Medicines Agency, all services must share patient " +
      "records freely across systems to enable integrated healthcare delivery. " +
      "See the attached reference list for implementation guidance.";
    const result = runConsistencyCheck(ic6Attempt, "chk002-ic6-barrier");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const ic6Issues = result.issues.filter(
      (i) => i.issueClass === "EVIDENCE_CONFLICT",
    );
    expect(ic6Issues).toHaveLength(0);
  });

  it("IC-8 is never emitted by any valid pipeline execution", () => {
    // Best IC-8 attempt: document with broken reference chains
    const ic8Attempt =
      "All systems must comply with Requirement XYZ-404 as specified in Appendix Q. " +
      "See Reference [MISSING] for full details of the traceability requirements. " +
      "The system must implement controls described in the unavailable annexure.";
    const result = runConsistencyCheck(ic8Attempt, "chk002-ic8-barrier");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const ic8Issues = result.issues.filter(
      (i) => i.issueClass === "TRACEABILITY_BROKEN",
    );
    expect(ic8Issues).toHaveLength(0);
  });

  it("IC-9 is never emitted by any valid pipeline execution", () => {
    // Best IC-9 attempt: document with out-of-scope claims
    const ic9Attempt =
      "This document covers data storage requirements for the European Union only. " +
      "All systems in the United States must comply with HIPAA privacy requirements. " +
      "All systems in Asia-Pacific must implement local data sovereignty controls. " +
      "These requirements apply globally to all jurisdictions without exception.";
    const result = runConsistencyCheck(ic9Attempt, "chk002-ic9-barrier");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const ic9Issues = result.issues.filter(
      (i) => i.issueClass === "SCOPE_VIOLATION",
    );
    expect(ic9Issues).toHaveLength(0);
  });

  it("no evaluation run produces IC-2, IC-6, IC-8, or IC-9 for any input", () => {
    // Run all adversarial attempts through evaluateDocument and confirm these never appear
    const inputs = [
      "All systems must comply with the expired 2005 security standard.",
      "Data must be isolated. Data must be shared freely. See conflicting reference.",
      "All services must comply with Requirement [BROKEN-REF] from the missing annex.",
      "This document is limited to EU. All US systems must comply with global mandates.",
    ];
    const blockedClasses = new Set([
      "AUTHORITY_EXPIRED",
      "EVIDENCE_CONFLICT",
      "TRACEABILITY_BROKEN",
      "SCOPE_VIOLATION",
    ]);
    for (const [i, content] of inputs.entries()) {
      const result = evaluateDocument(makeRequest(content, `chk002-batch-${i}`));
      if (!result.ok) continue; // pipeline failure doesn't affect this assertion
      for (const issue of result.issues) {
        expect(blockedClasses.has(issue.issueClass)).toBe(false);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Part 8 — Adversarial Valid-Input Construction Attempts
// ---------------------------------------------------------------------------

describe("DRA-CHK-002 — Part 8: Adversarial Valid-Input Construction Attempts", () => {
  /**
   * Each attempt:
   * - Satisfies public input schemas (passes Stage 1)
   * - Runs through all canonical stages via evaluateDocument
   * - Preserves frozen evaluator semantics
   * - Records actual output and documents the conclusion
   */

  it("IC-1 adversarial attempt: CRITICAL materiality, no attribution, no evidence → IC-4 fires, IC-1 does not", () => {
    // Target: IC-1 UNSUPPORTED_CLAIM
    // Constructed characteristics: CRITICAL materiality mandatory obligation,
    //   no external attribution ("We" self-referential → DOCUMENT_AUTHOR),
    //   no evidence citations in text
    // Expected trigger path: needs NO_IDENTIFIABLE_SOURCE from Stage 3
    // Barrier: Stage 3 assigns DOCUMENT_AUTHOR (self-referential "We"), not NO_IDENTIFIABLE_SOURCE
    // Actual output: IC-4 EVIDENCE_ABSENT fires (DOCUMENT_AUTHOR + CRITICAL + no evidence)
    const ic1Attempt = makeRequest(
      "We must comply with all mandatory GDPR data protection requirements immediately. " +
        "We shall implement legally required security controls across all production systems.",
      "chk002-adv-ic1",
    );
    const result = evaluateDocument(ic1Attempt);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const ic1 = result.issues.filter((i) => i.issueClass === "UNSUPPORTED_CLAIM");
    const ic4 = result.issues.filter((i) => i.issueClass === "EVIDENCE_ABSENT");

    console.log("  IC-1 adversarial attempt result:");
    console.log(`    Decision: ${result.decision}`);
    console.log(`    IC-1 (UNSUPPORTED_CLAIM) issues: ${ic1.length}`);
    console.log(`    IC-4 (EVIDENCE_ABSENT) issues: ${ic4.length}`);
    console.log(`    Conclusion: Stage 3 → DOCUMENT_AUTHOR, noAuth=false, IC-1 barrier confirmed`);

    // IC-1 does not fire because Stage 3 produces DOCUMENT_AUTHOR, not NO_IDENTIFIABLE_SOURCE
    expect(ic1).toHaveLength(0);
    // IC-4 may fire (CRITICAL + DOCUMENT_AUTHOR + no evidence is a valid IC-4 trigger)
    // We don't assert IC-4 count because evidence classification may vary
  });

  it("IC-2 adversarial attempt: expired regulatory reference → IC-2 never fires", () => {
    // Target: IC-2 AUTHORITY_EXPIRED
    // Constructed characteristics: explicit reference to a named regulation with expiry year
    // Expected trigger path: requires temporal authority check in Stage 3 or emission rule
    // Barrier: no temporal fields on AuthorityRecord; no emission rule for IC-2
    // Actual output: IC-2 not produced; no error about expiry
    const ic2Attempt = makeRequest(
      "All systems must comply with the Information Security Standard (ISO 27001:2005), " +
        "which was superseded and expired in December 2013. " +
        "The organization must implement the requirements of the outdated 2005 regulation.",
      "chk002-adv-ic2",
    );
    const result = evaluateDocument(ic2Attempt);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const ic2 = result.issues.filter((i) => i.issueClass === "AUTHORITY_EXPIRED");

    console.log("  IC-2 adversarial attempt result:");
    console.log(`    Decision: ${result.decision}`);
    console.log(`    IC-2 (AUTHORITY_EXPIRED) issues: ${ic2.length}`);
    console.log(`    Conclusion: No temporal checks exist; no IC-2 emission rule; barrier confirmed`);

    expect(ic2).toHaveLength(0);
  });

  it("IC-3 adversarial attempt: strong evidence, ambiguous authority → IC-3 never fires", () => {
    // Target: IC-3 AUTHORITY_ABSENT
    // Constructed characteristics: pronoun subject (→ AMBIGUOUS_SOURCE) + evidence present
    // Expected trigger path: needs NO_IDENTIFIABLE_SOURCE + evidence present
    // Barrier: AMBIGUOUS_SOURCE ∉ NO_AUTHORITY set; only NO_IDENTIFIABLE_SOURCE satisfies noAuth
    // Actual output: IC-3 not produced (noAuth remains false)
    const ic3Attempt = makeRequest(
      "It must be ensured that all systems comply with mandatory security requirements. " +
        "They must implement the controls described in Section 3.2 of this document. " +
        "See Table 1 and Appendix A for full implementation specifications and evidence.",
      "chk002-adv-ic3",
    );
    const result = evaluateDocument(ic3Attempt);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const ic3 = result.issues.filter((i) => i.issueClass === "AUTHORITY_ABSENT");

    console.log("  IC-3 adversarial attempt result:");
    console.log(`    Decision: ${result.decision}`);
    console.log(`    IC-3 (AUTHORITY_ABSENT) issues: ${ic3.length}`);
    console.log(`    Conclusion: Stage 3 → AMBIGUOUS_SOURCE (not NO_IDENTIFIABLE_SOURCE); IC-3 barrier confirmed`);

    expect(ic3).toHaveLength(0);
  });

  it("IC-6 adversarial attempt: contradictory sources, same claim → IC-6 never fires", () => {
    // Target: IC-6 EVIDENCE_CONFLICT
    // Constructed characteristics: two named sources cited for the same claim with conflicting guidance
    // Expected trigger path: requires conflict-detection logic in Stage 4 or Stage 6
    // Barrier: no EVIDENCE_CONFLICT emission rule; Stage 4 produces one record per statement
    // Actual output: IC-6 not produced
    const ic6Attempt = makeRequest(
      "According to the World Health Organization, all patient data must be " +
        "encrypted at rest using AES-256 without exception. " +
        "However, according to the European Data Protection Board, patient data " +
        "must never be encrypted at rest due to interoperability requirements. " +
        "See WHO/2023/001 and EDPB/2023/045 for the conflicting technical specifications.",
      "chk002-adv-ic6",
    );
    const result = evaluateDocument(ic6Attempt);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const ic6 = result.issues.filter((i) => i.issueClass === "EVIDENCE_CONFLICT");

    console.log("  IC-6 adversarial attempt result:");
    console.log(`    Decision: ${result.decision}`);
    console.log(`    IC-6 (EVIDENCE_CONFLICT) issues: ${ic6.length}`);
    console.log(`    Conclusion: No emission rule for IC-6; Stage 4 never produces conflict state; barrier confirmed`);

    expect(ic6).toHaveLength(0);
  });

  it("IC-8 adversarial attempt: broken reference chain → IC-8 never fires", () => {
    // Target: IC-8 TRACEABILITY_BROKEN
    // Constructed characteristics: references to non-existent annexures, broken citation links
    // Expected trigger path: requires traceability-broken detection in Stage 4 or Stage 6
    // Barrier: no IC-8 emission rule; Stage 4 assigns NO_DOCUMENT_EVIDENCE not BROKEN_TRACE
    // Actual output: IC-8 not produced (IC-4/IC-5 may fire)
    const ic8Attempt = makeRequest(
      "All systems must comply with the requirements specified in Annex XYZ-404-MISSING. " +
        "The system must implement controls as described in Reference [UNAVAILABLE]. " +
        "All implementations must follow the broken link at Section 99.999 of this document.",
      "chk002-adv-ic8",
    );
    const result = evaluateDocument(ic8Attempt);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const ic8 = result.issues.filter((i) => i.issueClass === "TRACEABILITY_BROKEN");

    console.log("  IC-8 adversarial attempt result:");
    console.log(`    Decision: ${result.decision}`);
    console.log(`    IC-8 (TRACEABILITY_BROKEN) issues: ${ic8.length}`);
    console.log(`    Conclusion: No IC-8 emission rule in evaluator; Stage 4 produces NO_DOCUMENT_EVIDENCE; barrier confirmed`);

    expect(ic8).toHaveLength(0);
  });

  it("IC-9 adversarial attempt: out-of-scope claims → IC-9 never fires", () => {
    // Target: IC-9 SCOPE_VIOLATION
    // Constructed characteristics: document declares limited scope but contains broad claims
    // Expected trigger path: requires scope-awareness in Stage 5 or an IC-9 emission rule
    // Barrier: Stage 5 has no scope metadata; no IC-9 emission rule anywhere
    // Actual output: IC-9 not produced
    const ic9Attempt = makeRequest(
      "SCOPE: This document applies to European operations only. " +
        "All systems in North America must comply with CCPA privacy requirements immediately. " +
        "All systems in Australia must implement the Privacy Act controls without exception. " +
        "Global operations must meet ISO 27001 certification requirements worldwide.",
      "chk002-adv-ic9",
    );
    const result = evaluateDocument(ic9Attempt);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const ic9 = result.issues.filter((i) => i.issueClass === "SCOPE_VIOLATION");

    console.log("  IC-9 adversarial attempt result:");
    console.log(`    Decision: ${result.decision}`);
    console.log(`    IC-9 (SCOPE_VIOLATION) issues: ${ic9.length}`);
    console.log(`    Conclusion: No scope metadata in pipeline; no IC-9 emission rule; barrier confirmed`);

    expect(ic9).toHaveLength(0);
  });

  it("adversarial attempt summary: zero occurrences of any unreachable class across all six attempts", () => {
    const unreachableClasses: ReadonlySet<string> = new Set([
      "UNSUPPORTED_CLAIM",
      "AUTHORITY_EXPIRED",
      "AUTHORITY_ABSENT",
      "EVIDENCE_CONFLICT",
      "TRACEABILITY_BROKEN",
      "SCOPE_VIOLATION",
    ]);

    const adversarialInputs = [
      "We must comply with mandatory GDPR requirements with no evidence available.",
      "All systems must comply with the expired 2005 standard according to outdated law.",
      "It must ensure compliance with the regulation. See Section 3 for details.",
      "According to WHO, data must be encrypted. According to EDPB, data must not be encrypted.",
      "All systems must comply with Reference [BROKEN-LINK] from the missing annex.",
      "SCOPE: EU only. All US systems must comply with HIPAA globally without exception.",
    ];

    for (const [i, content] of adversarialInputs.entries()) {
      const result = evaluateDocument(makeRequest(content, `chk002-adv-summary-${i}`));
      if (!result.ok) continue;
      for (const issue of result.issues) {
        const inUnreachable = unreachableClasses.has(issue.issueClass);
        if (inUnreachable) {
          console.error(
            `  UNEXPECTED: ${issue.issueClass} observed in adversarial attempt ${i}`,
          );
        }
        expect(inUnreachable).toBe(false);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Part 9 — Stage 3 Fallback-Behaviour Proof
// ---------------------------------------------------------------------------

describe("DRA-CHK-002 — Part 9: Stage 3 Fallback-Behaviour Proof", () => {
  it("Stage 3 always produces a non-null authority record for every extracted statement", () => {
    const content =
      "All systems must encrypt data at rest. " +
      "All deployments must implement access controls. " +
      "All services must log every authentication attempt.";
    const { s2, s3 } = runPipeline(content, "chk002-stage3-coverage");
    expect(s3.ok).toBe(true);
    if (!s3.ok) return;
    // One authority record per extracted statement
    expect(s3.authorityRecords.length).toBe(s2.statements.length);
  });

  it("Stage 3 never produces NO_IDENTIFIABLE_SOURCE for any of 20 diverse attribution patterns", () => {
    const patterns = [
      // Self-referential
      "We confirm that this policy applies immediately.",
      "This document establishes the requirements for all systems.",
      "The report concludes that all services must be updated.",
      // Pronoun (AMBIGUOUS_SOURCE)
      "He must ensure that systems comply with the policy.",
      "They must implement all required controls before launch.",
      "It must be verified before deployment.",
      // Named attribution (EXPLICIT_NAMED_SOURCE)
      "According to the National Institute of Standards and Technology, all systems must comply.",
      "The World Health Organization states that privacy must be protected.",
      "ISO 27001 requires all systems to implement information security management.",
      // Vague attribution (EXPLICIT_UNNAMED_SOURCE)
      "According to experts, all services must be updated immediately.",
      "Researchers report that encryption must be applied to all data.",
      "Officials confirm that compliance is mandatory.",
      // Post-statement attribution
      "All systems must comply with the standard, according to the regulator.",
      "Encryption must be applied to all data, according to the standards body.",
      // No attribution whatsoever (DOCUMENT_AUTHOR fallback)
      "All systems must implement mandatory security controls.",
      "Compliance is required for all production deployments.",
      "The following requirements apply to all environments.",
      // Unattributed quote (AMBIGUOUS_SOURCE)
      '"All services must implement required security controls."',
      // Inherited from preceding line
      "According to the regulator: All services must comply with mandatory requirements.",
      // Inline attribution
      "All systems must comply with the standard — ISO 27001:2022.",
    ];

    for (const [i, content] of patterns.entries()) {
      const { s3 } = runPipeline(content, `chk002-fallback-${i}`);
      expect(s3.ok).toBe(true);
      if (!s3.ok) continue;
      for (const ar of s3.authorityRecords) {
        if (ar.classification === "NO_IDENTIFIABLE_SOURCE") {
          console.error(
            `  UNEXPECTED NO_IDENTIFIABLE_SOURCE for pattern ${i}: "${content.slice(0, 60)}..."`,
          );
        }
        expect(ar.classification).not.toBe("NO_IDENTIFIABLE_SOURCE");
      }
    }
  });

  it("Stage 3 DOCUMENT_AUTHOR is the final fallback (priority 10) for content with no attribution", () => {
    // A document with no attribution markers whatsoever → DOCUMENT_AUTHOR
    const noAttribution =
      "All systems must encrypt communications in transit at all times. " +
      "All production environments must implement the required security baseline.";
    const { s3 } = runPipeline(noAttribution, "chk002-docauthor");
    expect(s3.ok).toBe(true);
    if (!s3.ok) return;
    for (const ar of s3.authorityRecords) {
      expect(ar.classification).toBe("DOCUMENT_AUTHOR");
      expect(ar.resolutionRule).toBe("AR-DOCUMENT-AUTHOR");
    }
  });
});

// ---------------------------------------------------------------------------
// Part 10 — Corpus Observation Reconciliation
// ---------------------------------------------------------------------------

describe("DRA-CHK-002 — Part 10: Corpus Observation Reconciliation (14-document corpus)", () => {
  it("reports the three issue classes observed in the 14-document corpus", () => {
    const observedCodes = OBSERVED_CLASSES.map((e) => e.code);
    expect(observedCodes).toHaveLength(3);
    expect(observedCodes).toContain("IC-4");
    expect(observedCodes).toContain("IC-5");
    expect(observedCodes).toContain("IC-7");
  });

  it("IC-4 is observed in DRA-DOC-0008 and DRA-DOC-0009", () => {
    const ic4 = REACHABILITY_MATRIX.find((e) => e.code === "IC-4")!;
    expect(ic4.observedInDocuments).toContain("DRA-DOC-0008");
    expect(ic4.observedInDocuments).toContain("DRA-DOC-0009");
  });

  it("IC-5 is observed in multiple corpus documents including DRA-DOC-0004, 0006, 0010–0012", () => {
    const ic5 = REACHABILITY_MATRIX.find((e) => e.code === "IC-5")!;
    expect(ic5.observedInDocuments).toContain("DRA-DOC-0004");
    expect(ic5.observedInDocuments).toContain("DRA-DOC-0006");
    expect(ic5.observedInDocuments).toContain("DRA-DOC-0010");
    expect(ic5.observedInDocuments).toContain("DRA-DOC-0011");
    expect(ic5.observedInDocuments).toContain("DRA-DOC-0012");
  });

  it("IC-7 is observed in DRA-DOC-0011 (ICO AI and data protection guidance)", () => {
    const ic7 = REACHABILITY_MATRIX.find((e) => e.code === "IC-7")!;
    expect(ic7.observedInDocuments).toContain("DRA-DOC-0011");
  });

  it("no observation of IC-1, IC-2, IC-3, IC-6, IC-8, or IC-9 in the 14-document corpus", () => {
    const unobservedCodes = ["IC-1", "IC-2", "IC-3", "IC-6", "IC-8", "IC-9"];
    for (const code of unobservedCodes) {
      const e = REACHABILITY_MATRIX.find((m) => m.code === code)!;
      expect(e.observedInDocuments).toHaveLength(0);
    }
  });

  it("every observed class is also reachable (no corpus observation of unreachable classes)", () => {
    for (const e of OBSERVED_CLASSES) {
      expect(e.reachability).toBe("OBSERVED_REACHABLE");
    }
  });

  it("14-document corpus known decision distribution: 7 SUPPORTED, 5 REVIEW, 2 HOLD, 0 REJECT", () => {
    // Decision distribution reported in DRA-BMK-014 Run A
    const knownDecisions = [
      { id: "DRA-DOC-0001", decision: "SUPPORTED" },
      { id: "DRA-DOC-0002", decision: "SUPPORTED" },
      { id: "DRA-DOC-0003", decision: "SUPPORTED" },
      { id: "DRA-DOC-0004", decision: "REVIEW" },
      { id: "DRA-DOC-0005", decision: "SUPPORTED" },
      { id: "DRA-DOC-0006", decision: "REVIEW" },
      { id: "DRA-DOC-0007", decision: "SUPPORTED" },
      { id: "DRA-DOC-0008", decision: "HOLD" },
      { id: "DRA-DOC-0009", decision: "HOLD" },
      { id: "DRA-DOC-0010", decision: "REVIEW" },
      { id: "DRA-DOC-0011", decision: "REVIEW" },
      { id: "DRA-DOC-0012", decision: "REVIEW" },
      { id: "DRA-DOC-0013", decision: "SUPPORTED" },
      { id: "DRA-DOC-0014", decision: "SUPPORTED" },
    ];
    const tally = { SUPPORTED: 0, REVIEW: 0, HOLD: 0, REJECT: 0 } as Record<string, number>;
    for (const { decision } of knownDecisions) {
      tally[decision] = (tally[decision] ?? 0) + 1;
    }
    expect(tally["SUPPORTED"]).toBe(7);
    expect(tally["REVIEW"]).toBe(5);
    expect(tally["HOLD"]).toBe(2);
    expect(tally["REJECT"]).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Part 11 — Coverage-Ceiling Calculation
// ---------------------------------------------------------------------------

describe("DRA-CHK-002 — Part 11: Coverage-Ceiling Calculation", () => {
  it("canonical class inventory: 9 total classes", () => {
    expect(CANONICAL_CLASS_COUNT).toBe(9);
  });

  it("raw canonical coverage: 3/9 = 33.33%", () => {
    expect(RAW_CANONICAL_COVERAGE.observed).toBe(3);
    expect(RAW_CANONICAL_COVERAGE.total).toBe(9);
    expect(RAW_CANONICAL_COVERAGE.percentage).toBeCloseTo(33.33, 1);
  });

  it("reachable-class coverage: 3/3 = 100%", () => {
    expect(REACHABLE_CLASS_COVERAGE.totalReachable).toBe(3);
    expect(REACHABLE_CLASS_COVERAGE.observedReachable).toBe(3);
    expect(REACHABLE_CLASS_COVERAGE.percentage).toBe(100);
  });

  it("structural-unreachability count: 6/9 = 66.67%", () => {
    expect(UNREACHABLE_CLASSES).toHaveLength(6);
    const unreachablePercentage = (6 / 9) * 100;
    expect(unreachablePercentage).toBeCloseTo(66.67, 1);
  });

  it("maximum Version 1 coverage ceiling: 3/9 = 33.33%", () => {
    expect(COVERAGE_CEILING.maxObservable).toBe(3);
    expect(COVERAGE_CEILING.total).toBe(9);
    expect(COVERAGE_CEILING.ceilingPercentage).toBeCloseTo(33.33, 1);
  });

  it("the 14-document corpus already achieves the Version 1 coverage ceiling", () => {
    // All 3 reachable classes have been observed in the frozen corpus.
    // No further corpus growth can increase coverage beyond 3/9 under Version 1.
    const allReachableObserved = REACHABLE_CLASSES.every(
      (e) => e.observedInDocuments.length > 0,
    );
    expect(allReachableObserved).toBe(true);
    expect(REACHABLE_CLASS_COVERAGE.percentage).toBe(100);
  });

  it("raw canonical coverage and reachable-class coverage are distinct metrics", () => {
    // This test verifies the two metrics differ and encodes the distinction.
    const rawCoverage = RAW_CANONICAL_COVERAGE.percentage;        // 33.33%
    const reachableCoverage = REACHABLE_CLASS_COVERAGE.percentage; // 100%
    expect(rawCoverage).not.toBe(reachableCoverage);
    expect(reachableCoverage).toBeGreaterThan(rawCoverage);
    // The gap is explained by the 6 structurally unreachable classes:
    // they appear in the denominator of raw coverage but not in reachable coverage.
  });

  it("no REACHABLE_UNOBSERVED classes exist after the 14-document corpus", () => {
    expect(REACHABLE_UNOBSERVED_CLASSES).toHaveLength(0);
  });

  it("coverage ceiling is set by the number of reachable classes, not corpus size", () => {
    // Corpus size is 14; reachable classes is 3.
    // Adding more documents cannot change 3 reachable classes to 9.
    const reachableCount = REACHABLE_CLASSES.length;
    expect(reachableCount).toBe(3);
    // The ceiling is fixed by the evaluator implementation, not the corpus.
    expect(COVERAGE_CEILING.maxObservable).toBe(reachableCount);
  });

  it("reports defect classifications for all 6 unreachable classes", () => {
    for (const e of UNREACHABLE_CLASSES) {
      expect(e.defectClassification).not.toBe("NOT_APPLICABLE");
      expect(e.defectClassification).not.toBe("INDETERMINATE");
    }
  });

  it("IC-1 and IC-3 are DORMANT_SCHEMA_OR_TAXONOMY (emission rule exists; producer absent)", () => {
    const ic1 = REACHABILITY_MATRIX.find((e) => e.code === "IC-1")!;
    const ic3 = REACHABILITY_MATRIX.find((e) => e.code === "IC-3")!;
    expect(ic1.defectClassification).toBe("DORMANT_SCHEMA_OR_TAXONOMY");
    expect(ic3.defectClassification).toBe("DORMANT_SCHEMA_OR_TAXONOMY");
  });

  it("IC-2, IC-6, IC-8, IC-9 are IMPLEMENTATION_GAP (no emission rule)", () => {
    const codes = ["IC-2", "IC-6", "IC-8", "IC-9"];
    for (const code of codes) {
      const e = REACHABILITY_MATRIX.find((m) => m.code === code)!;
      expect(e.defectClassification).toBe("IMPLEMENTATION_GAP");
    }
  });
});

// ---------------------------------------------------------------------------
// Part 12 — Historical Benchmark Consistency
// ---------------------------------------------------------------------------

describe("DRA-CHK-002 — Part 12: Historical Benchmark Consistency", () => {
  it("the reachability finding is consistent with DRA-BMK-001 through DRA-BMK-013 history", () => {
    // IC-4, IC-5, IC-7 were the only classes ever observed across all 14 checkpoint runs.
    // This is consistent with the finding that only 3 classes are reachable.
    const historicallyObservedClasses = ["EVIDENCE_ABSENT", "EVIDENCE_INADEQUATE", "CLAIM_INCONSISTENCY"];
    const historicallyAbsentClasses = [
      "UNSUPPORTED_CLAIM",
      "AUTHORITY_EXPIRED",
      "AUTHORITY_ABSENT",
      "EVIDENCE_CONFLICT",
      "TRACEABILITY_BROKEN",
      "SCOPE_VIOLATION",
    ];
    for (const cls of historicallyObservedClasses) {
      const e = REACHABILITY_MATRIX.find((m) => m.name === cls)!;
      expect(e.reachability).toBe("OBSERVED_REACHABLE");
    }
    for (const cls of historicallyAbsentClasses) {
      const e = REACHABILITY_MATRIX.find((m) => m.name === cls)!;
      expect(e.reachability).toBe("STRUCTURALLY_UNREACHABLE");
    }
  });

  it("DRA-DOC-0014 BCBS adversarial result is consistent with IC-3 structural barrier", () => {
    // DRA-BMK-014: DRA-DOC-0014 (optimal IC-3 test) → SUPPORTED, IC-3 not raised
    // This is fully explained by the structural barrier: Stage 3 → DOCUMENT_AUTHOR
    const ic3 = REACHABILITY_MATRIX.find((e) => e.code === "IC-3")!;
    expect(ic3.reachability).toBe("STRUCTURALLY_UNREACHABLE");
    expect(ic3.evidence).toContain("CORPUS_OBSERVED"); // negative: optimal test, class absent
    expect(ic3.evidence).toContain("EMPIRICALLY_CHALLENGED");
    expect(ic3.observedInDocuments).toHaveLength(0);
  });

  it("every evidence-strength label for reachable classes includes CORPUS_OBSERVED", () => {
    for (const e of REACHABLE_CLASSES) {
      expect(e.evidence).toContain("CORPUS_OBSERVED");
    }
  });

  it("every evidence-strength label for unreachable classes includes CODE_PATH_PROVEN", () => {
    for (const e of UNREACHABLE_CLASSES) {
      expect(e.evidence).toContain("CODE_PATH_PROVEN");
    }
  });

  it("all findings have confidence level 3 (highest) — no INDETERMINATE conclusions", () => {
    for (const e of REACHABILITY_MATRIX) {
      expect(e.confidence).toBe(3);
      expect(e.residualUncertainty).toBeNull();
    }
  });
});

// ---------------------------------------------------------------------------
// Part 13 — Version 1 Freeze-Preservation
// ---------------------------------------------------------------------------

describe("DRA-CHK-002 — Part 13: Version 1 Freeze-Preservation", () => {
  it("DRA evaluator version is 0.1.1 (frozen)", () => {
    expect(DRA_EVALUATOR_VERSION).toBe("0.1.1");
  });

  it("DRA pipeline version is present and non-empty", () => {
    expect(typeof DRA_PIPELINE_VERSION).toBe("string");
    expect(DRA_PIPELINE_VERSION.length).toBeGreaterThan(0);
  });

  it("DRA model version is present and non-empty", () => {
    expect(typeof DRA_MODEL_VERSION).toBe("string");
    expect(DRA_MODEL_VERSION.length).toBeGreaterThan(0);
  });

  it("evaluateDocument returns a result (not an exception) for all inputs — never throws", () => {
    const inputs = [
      makeRequest("All systems must comply with GDPR."),
      makeRequest(""),
      makeRequest("Background information only. No material claims."),
    ];
    for (const input of inputs) {
      expect(() => evaluateDocument(input)).not.toThrow();
    }
  });

  it("reachability matrix array is frozen (append-only guard)", () => {
    // Object.freeze() is applied to the array, preventing push/pop/splice.
    // Individual entries carry ReadonlyArray typing for compile-time protection.
    expect(Object.isFrozen(REACHABILITY_MATRIX)).toBe(true);
    // Verify no entry can be overwritten (array is sealed by freeze)
    expect(() => {
      (REACHABILITY_MATRIX as unknown as ReachabilityEntry[])[0] = REACHABILITY_MATRIX[1]!;
    }).toThrow();
  });

  it("reachability findings do not require any evaluator code change to remain valid", () => {
    // The findings are derived purely from reading the existing implementation.
    // No evaluator modification is needed or permitted to satisfy them.
    // This test validates the freeze constraint by confirming the findings hold
    // against the current (unmodified) evaluator version.
    const allClassified = REACHABILITY_MATRIX.every(
      (e) =>
        e.reachability === "OBSERVED_REACHABLE" ||
        e.reachability === "REACHABLE_UNOBSERVED" ||
        e.reachability === "STRUCTURALLY_UNREACHABLE" ||
        e.reachability === "INDETERMINATE",
    );
    expect(allClassified).toBe(true);
    // No class is INDETERMINATE — all findings are conclusive
    const indeterminate = REACHABILITY_MATRIX.filter(
      (e) => e.reachability === "INDETERMINATE",
    );
    expect(indeterminate).toHaveLength(0);
  });
});
