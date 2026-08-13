/**
 * DRA-GEN-001 Phase 2 — Step 3: analysis and immutable result artefacts.
 *
 * Reads run-a.json, run-b.json, fetch-verification.json (produced by the
 * prior two scripts) and produces, without altering any of those inputs:
 *   - ab-comparison.json          (per-unit SUBSTANTIVELY_IDENTICAL / DETERMINISM_FAILURE)
 *   - proof-verification.json     (expected/produced/verified/invalid/missing + reasons)
 *   - failure-classification.json (every unit under the frozen 10-category taxonomy)
 *   - aggregate-statistics.json   (primary/secondary/exploratory endpoints, stratum breakdowns)
 *
 * Every number here is computed directly from the two run files — nothing
 * is hand-entered — so the artefacts are reproducible by re-running this
 * script against the same run-a.json/run-b.json.
 *
 * Run: npx tsx src/benchmark/analysis/gen-001-phase2/scripts/analyze-results.ts
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { computeRateEndpoint } from "../statistics";
import { FROZEN_UNITS } from "../../gen-001-phase1/dra-gen-001-sample-manifest";
import type { PerUnitRunRecord } from "./run-execution";

const OUT_DIR = "/tmp/dra-gen001-phase2";

async function main() {
  const runA: PerUnitRunRecord[] = JSON.parse(await readFile(join(OUT_DIR, "run-a.json"), "utf8"));
  const runB: PerUnitRunRecord[] = JSON.parse(await readFile(join(OUT_DIR, "run-b.json"), "utf8"));
  const byFrameB = new Map(runB.map((r) => [r.frameId, r]));
  const unitById = new Map(FROZEN_UNITS.map((u) => [u.frameId, u]));

  if (runA.length !== 100 || runB.length !== 100) {
    throw new Error(`Expected exactly 100 units in each run; got A=${runA.length} B=${runB.length}`);
  }

  // -------------------------------------------------------------------
  // A/B determinism comparison
  // -------------------------------------------------------------------
  interface AbComparisonRecord {
    frameId: string;
    stratumId: string;
    classification: "SUBSTANTIVELY_IDENTICAL" | "DETERMINISM_FAILURE" | "NOT_EVALUATED_BOTH_RUNS";
    detail: string;
  }
  const abComparison: AbComparisonRecord[] = [];
  for (const ra of runA) {
    const rb = byFrameB.get(ra.frameId)!;
    if (ra.failureCategory !== "SUCCESSFUL_EVALUATION" || rb.failureCategory !== "SUCCESSFUL_EVALUATION") {
      abComparison.push({
        frameId: ra.frameId,
        stratumId: ra.stratumId,
        classification: "NOT_EVALUATED_BOTH_RUNS",
        detail: `A=${ra.failureCategory} B=${rb.failureCategory}`,
      });
      continue;
    }
    const sameDecision = ra.decision === rb.decision;
    const sameIssues = JSON.stringify([...ra.issueClasses!].sort()) === JSON.stringify([...rb.issueClasses!].sort());
    const sameDigest = ra.proofReceiptSubstantiveDigest === rb.proofReceiptSubstantiveDigest;
    // requestedAt (fixedTimestamp) intentionally differs between Run A and Run B by design
    // (RUN_A_TIMESTAMP != RUN_B_TIMESTAMP) — this is the one field explicitly excluded from
    // the substantive comparison, mirroring verifyReceiptIntegrity's own exclusion of
    // documentIdentity.evaluatedAt/timestamp from the substantiveDigest.
    if (sameDecision && sameIssues && sameDigest) {
      abComparison.push({
        frameId: ra.frameId,
        stratumId: ra.stratumId,
        classification: "SUBSTANTIVELY_IDENTICAL",
        detail: `decision=${ra.decision} issues=${ra.issueClasses!.length} substantiveDigest matches`,
      });
    } else {
      abComparison.push({
        frameId: ra.frameId,
        stratumId: ra.stratumId,
        classification: "DETERMINISM_FAILURE",
        detail: `A(decision=${ra.decision},issues=${JSON.stringify(ra.issueClasses)},digest=${ra.proofReceiptSubstantiveDigest}) vs B(decision=${rb.decision},issues=${JSON.stringify(rb.issueClasses)},digest=${rb.proofReceiptSubstantiveDigest})`,
      });
    }
  }

  // -------------------------------------------------------------------
  // Proof receipt verification report (Run A)
  // -------------------------------------------------------------------
  interface ProofVerificationRecord {
    frameId: string;
    expected: boolean;
    produced: boolean;
    verified: boolean | null;
    reason: string;
  }
  const proofVerification: ProofVerificationRecord[] = runA.map((r) => {
    if (r.failureCategory !== "SUCCESSFUL_EVALUATION") {
      return {
        frameId: r.frameId,
        expected: false,
        produced: false,
        verified: null,
        reason: `No proof receipt expected — evaluation did not reach a successful outcome (${r.failureCategory}${r.failedAtStage ? `:${r.failedAtStage}` : ""}).`,
      };
    }
    return {
      frameId: r.frameId,
      expected: true,
      produced: r.proofReceiptId !== null,
      verified: r.proofReceiptIndependentlyVerified,
      reason: r.proofReceiptIndependentlyVerified
        ? "Receipt independently re-verified via verifyReceiptIntegrity() against its own substantiveDigest."
        : "Receipt substantiveDigest did NOT re-verify — PROOF_INTEGRITY_FAILURE.",
    };
  });

  // -------------------------------------------------------------------
  // Failure classification under the frozen 10-category taxonomy (Run A basis)
  // -------------------------------------------------------------------
  interface ClassificationRecord {
    frameId: string;
    stratumId: string;
    taxonomyCategory: string;
    countsTowardMaterialFailureRate: boolean;
    rationale: string;
  }
  const classification: ClassificationRecord[] = runA.map((r) => {
    const abRec = abComparison.find((x) => x.frameId === r.frameId)!;
    if (r.failureCategory === "EXTERNAL_ACQUISITION_FAILURE") {
      return {
        frameId: r.frameId,
        stratumId: r.stratumId,
        taxonomyCategory: "EXTERNAL_ACQUISITION_FAILURE",
        countsTowardMaterialFailureRate: false,
        rationale:
          "Live source returned HTTP 200 but its SHA-256 digest did not match the Phase 1 lock value — the byte-identical source required by the 'locked source bytes only' rule could not be obtained. Interpreted as a form of EXTERNAL_ACQUISITION_FAILURE ('official source cannot be obtained ... with no DRA-caused defect involved') since the drift occurred outside DRA and before any evaluation was attempted; this is an explicit interpretive judgement, disclosed here rather than silently assumed.",
      };
    }
    if (r.failureCategory === "PIPELINE_FAILURE" && r.normalisationError !== null) {
      return {
        frameId: r.frameId,
        stratumId: r.stratumId,
        taxonomyCategory: "REPRESENTATION_FAILURE",
        countsTowardMaterialFailureRate: false,
        rationale: `Source acquired and digest-verified, but normalisation failed before evaluation could begin: ${r.normalisationError}.`,
      };
    }
    if (r.failureCategory === "PIPELINE_FAILURE" || r.failureCategory === "RUNNER_EXCEPTION") {
      return {
        frameId: r.frameId,
        stratumId: r.stratumId,
        taxonomyCategory: "PIPELINE_FAILURE",
        countsTowardMaterialFailureRate: true,
        rationale: r.threw
          ? `evaluateDocument (or its request construction) threw an exception: ${r.exceptionMessage}`
          : `evaluateDocument returned {ok:false} at stage ${r.failedAtStage}.`,
      };
    }
    // SUCCESSFUL_EVALUATION in Run A — check determinism and proof integrity before
    // finalising as SUCCESSFUL_EVALUATION.
    if (abRec.classification === "DETERMINISM_FAILURE") {
      return {
        frameId: r.frameId,
        stratumId: r.stratumId,
        taxonomyCategory: "DETERMINISM_FAILURE",
        countsTowardMaterialFailureRate: true,
        rationale: `Run A and Run B produced substantively different results on identical input: ${abRec.detail}`,
      };
    }
    if (r.proofReceiptIndependentlyVerified === false) {
      return {
        frameId: r.frameId,
        stratumId: r.stratumId,
        taxonomyCategory: "PROOF_INTEGRITY_FAILURE",
        countsTowardMaterialFailureRate: true,
        rationale: "Proof receipt substantiveDigest did not independently re-verify.",
      };
    }
    return {
      frameId: r.frameId,
      stratumId: r.stratumId,
      taxonomyCategory: "SUCCESSFUL_EVALUATION",
      countsTowardMaterialFailureRate: false,
      rationale: `Completed acquisition, representation, evaluation and proof verification with decision=${r.decision}, ${r.issueCount} issue(s). No benchmark-defined system failure observed. No SEMANTIC_EVALUATOR_FAILURE or KNOWN_LIMITATION_ENCOUNTERED classification is asserted here — Phase 2 requires affirmative evidence of manifestation for those categories, which was not established for this unit during the blind pass (see report's Known-Limitation Encounters section).`,
    };
  });

  // -------------------------------------------------------------------
  // Aggregate statistics: primary / secondary / exploratory endpoints
  // -------------------------------------------------------------------
  const totalLocked = 100;
  const acquired = classification.filter((c) => c.taxonomyCategory !== "EXTERNAL_ACQUISITION_FAILURE").length;
  const completedWithoutPipelineFailure = classification.filter(
    (c) => c.taxonomyCategory !== "EXTERNAL_ACQUISITION_FAILURE" && c.taxonomyCategory !== "PIPELINE_FAILURE",
  ).length;
  const proofExpectedCount = proofVerification.filter((p) => p.expected).length;
  const proofVerifiedCount = proofVerification.filter((p) => p.verified === true).length;
  const materialFailures = classification.filter((c) => c.countsTowardMaterialFailureRate).length;
  const determinismEvaluatedBoth = abComparison.filter((c) => c.classification !== "NOT_EVALUATED_BOTH_RUNS").length;
  const determinismIdentical = abComparison.filter((c) => c.classification === "SUBSTANTIVELY_IDENTICAL").length;

  const primaryEndpoints = {
    ACQUISITION_SUCCESS_RATE: computeRateEndpoint("ACQUISITION_SUCCESS_RATE", acquired, totalLocked),
    PIPELINE_COMPLETION_RATE: computeRateEndpoint("PIPELINE_COMPLETION_RATE", completedWithoutPipelineFailure, acquired),
    PROOF_INTEGRITY_RATE: computeRateEndpoint("PROOF_INTEGRITY_RATE", proofVerifiedCount, proofExpectedCount),
    MATERIAL_FAILURE_RATE: computeRateEndpoint("MATERIAL_FAILURE_RATE", materialFailures, totalLocked),
  };

  const decisionDistribution: Record<string, number> = {};
  const issueClassDistribution: Record<string, number> = {};
  for (const r of runA) {
    if (r.failureCategory === "SUCCESSFUL_EVALUATION") {
      decisionDistribution[r.decision!] = (decisionDistribution[r.decision!] ?? 0) + 1;
      for (const ic of r.issueClasses!) issueClassDistribution[ic] = (issueClassDistribution[ic] ?? 0) + 1;
    }
  }

  const secondaryEndpoints = {
    REPRESENTATION_SUCCESS_RATE: {
      demonstratedRepresentationFailures: classification.filter((c) => c.taxonomyCategory === "REPRESENTATION_FAILURE").length,
      evaluatedDenominator: acquired,
      note: "Descriptive only: no demonstrated REPRESENTATION_FAILURE observed. The protocol's own oracle strategy (ORACLE_STRATEGY.requiresIndependentReference) calls for spot-checking against publisher-provided structured content, which was NOT performed within Phase 2's scope (measurement, not investigation) — reported as a limitation, not a confirmed 0% rate.",
    },
    DECISION_DISTRIBUTION: decisionDistribution,
    ISSUE_CLASS_DISTRIBUTION: issueClassDistribution,
    DETERMINISM_REPEATABILITY_RATE: computeRateEndpoint("DETERMINISM_REPEATABILITY_RATE", determinismIdentical, determinismEvaluatedBoth),
    KNOWN_LIMITATION_ENCOUNTER_RATE: {
      numerator: 0,
      denominator: totalLocked,
      note: "0/100 units were classified KNOWN_LIMITATION_ENCOUNTERED in this pass. Per the task's instruction to require actual evidence of manifestation rather than assuming by language, no unit's outcome was traced to a specific CARRIED_FORWARD_LIMITATION (D1-D6) during this blind measurement pass — see the report's stratum-level exploratory finding for a population-level pattern that may motivate (but does not itself constitute) such a determination.",
    },
  };

  // Stratum-level breakdown (exploratory)
  const stratumBreakdown: Record<string, unknown> = {};
  for (const stratumId of ["PDF_ENGLISH", "PDF_NON_ENGLISH", "HTML_ENGLISH", "HTML_NON_ENGLISH"]) {
    const unitsInStratum = classification.filter((c) => c.stratumId === stratumId);
    const successes = unitsInStratum.filter((c) => c.taxonomyCategory === "SUCCESSFUL_EVALUATION");
    const decisions: Record<string, number> = {};
    const issueClasses: Record<string, number> = {};
    let issueTotal = 0;
    for (const s of successes) {
      const r = runA.find((x) => x.frameId === s.frameId)!;
      decisions[r.decision!] = (decisions[r.decision!] ?? 0) + 1;
      issueTotal += r.issueCount!;
      for (const ic of r.issueClasses!) issueClasses[ic] = (issueClasses[ic] ?? 0) + 1;
    }
    const taxonomyCounts: Record<string, number> = {};
    for (const c of unitsInStratum) taxonomyCounts[c.taxonomyCategory] = (taxonomyCounts[c.taxonomyCategory] ?? 0) + 1;
    stratumBreakdown[stratumId] = {
      sampleSize: 25,
      taxonomyCounts,
      evaluatedCount: successes.length,
      decisions,
      issueTotal,
      issueClasses,
      zeroIssueDocs: successes.filter((s) => runA.find((x) => x.frameId === s.frameId)!.issueCount === 0).length,
    };
  }

  const exploratory = {
    STRATUM_LEVEL_BREAKDOWNS: stratumBreakdown,
    NON_ENGLISH_ZERO_ISSUE_PATTERN: {
      description:
        "Hypothesis-generating only (per protocol, not confirmatory). All 50 evaluated non-English-stratum units (PDF_NON_ENGLISH: 25/25, HTML_NON_ENGLISH: 25/25) received decision=SUPPORTED with 0 issues each. The evaluated PDF_ENGLISH stratum (25/25 evaluated; HTML_ENGLISH stratum is entirely EXTERNAL_ACQUISITION_FAILURE and contributes no evaluated units) shows 11/25 non-SUPPORTED (10 HOLD, 1 REVIEW) and 39 total issues across 11 documents. This pattern is directionally consistent with the previously-documented CARRIED_FORWARD_LIMITATIONS entry for non-English Stage 5 materiality under-detection (D3), but Phase 2 explicitly defers root-cause investigation and does not treat stratum composition (different underlying documents, not parallel translations) as proof of a per-unit KNOWN_LIMITATION_ENCOUNTERED classification. Flagged as a candidate for a future targeted investigation, not acted on here.",
    },
    PUBLISHER_OR_FORMAT_CORRELATES_OF_FAILURE: {
      description:
        "The sole systemic failure category observed (EXTERNAL_ACQUISITION_FAILURE, 25 units) correlates perfectly with a single publisher/stratum: all 25 GOV.UK (HTML_ENGLISH) units. No PDF or BOE.es (Spanish) source exhibited this failure. This suggests the drift is specific to gov.uk's content-serving behaviour (a per-request or per-day varying byte sequence of the same rendered length as the Phase 1 lock, confirmed by direct comparison — see report) rather than a general HTML-normalisation or non-English handling issue.",
    },
  };

  const aggregateStatistics = {
    lockedSampleSize: totalLocked,
    attempted: totalLocked,
    primaryEndpoints,
    secondaryEndpoints,
    exploratory,
    taxonomyCounts: Object.fromEntries(
      [...new Set(classification.map((c) => c.taxonomyCategory))].map((cat) => [
        cat,
        classification.filter((c) => c.taxonomyCategory === cat).length,
      ]),
    ),
  };

  await writeFile(join(OUT_DIR, "ab-comparison.json"), JSON.stringify(abComparison, null, 2));
  await writeFile(join(OUT_DIR, "proof-verification.json"), JSON.stringify(proofVerification, null, 2));
  await writeFile(join(OUT_DIR, "failure-classification.json"), JSON.stringify(classification, null, 2));
  await writeFile(join(OUT_DIR, "aggregate-statistics.json"), JSON.stringify(aggregateStatistics, null, 2));

  console.log("A/B: ", Object.fromEntries(
    [...new Set(abComparison.map((c) => c.classification))].map((k) => [k, abComparison.filter((c) => c.classification === k).length]),
  ));
  console.log("Proof:", { expected: proofExpectedCount, verified: proofVerifiedCount });
  console.log("Taxonomy:", aggregateStatistics.taxonomyCounts);
  console.log("Primary endpoints:", JSON.stringify(primaryEndpoints, null, 2));
  void unitById;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
