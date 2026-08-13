/**
 * DRA-VAL-002 Phase 2 — Step 3: analysis and immutable result artefacts.
 *
 * Reads run-a.json, run-b.json (produced by the prior two scripts) and produces, without
 * altering any of those inputs:
 *   - ab-comparison.json          (per-unit SUBSTANTIVELY_IDENTICAL / DETERMINISM_FAILURE)
 *   - proof-verification.json     (expected/produced/verified/invalid/missing + reasons)
 *   - failure-classification.json (every unit under the frozen failure taxonomy)
 *   - aggregate-statistics.json   (primary/secondary endpoints, family breakdowns)
 *
 * Every number is computed directly from the two run files — nothing is hand-entered — so the
 * artefacts are reproducible by re-running this script against the same run-a.json/run-b.json.
 * Mirrors gen-001-phase2/scripts/analyze-results.ts, reusing the same statistics module.
 *
 * Run: npx tsx src/benchmark/analysis/val-002-phase2/scripts/analyze-results.ts
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { computeRateEndpoint } from "../../gen-001-phase2/statistics";
import { FROZEN_UNITS } from "../../val-002-phase1/dra-val-002-sample-manifest";
import { RECOMMENDED_SAMPLE_SIZE, SOURCE_FAMILIES } from "../../dra-val-002-protocol";
import type { PerUnitRunRecord } from "./run-execution";

const OUT_DIR = "/tmp/dra-val002-phase2";

async function main() {
  const runA: PerUnitRunRecord[] = JSON.parse(await readFile(join(OUT_DIR, "run-a.json"), "utf8"));
  const runB: PerUnitRunRecord[] = JSON.parse(await readFile(join(OUT_DIR, "run-b.json"), "utf8"));
  const byFrameB = new Map(runB.map((r) => [r.frameId, r]));

  if (runA.length !== RECOMMENDED_SAMPLE_SIZE || runB.length !== RECOMMENDED_SAMPLE_SIZE) {
    throw new Error(`Expected exactly ${RECOMMENDED_SAMPLE_SIZE} units in each run; got A=${runA.length} B=${runB.length}`);
  }

  // -------------------------------------------------------------------
  // A/B determinism comparison
  // -------------------------------------------------------------------
  interface AbComparisonRecord {
    frameId: string;
    familyId: string;
    classification: "SUBSTANTIVELY_IDENTICAL" | "DETERMINISM_FAILURE" | "NOT_EVALUATED_BOTH_RUNS";
    detail: string;
  }
  const abComparison: AbComparisonRecord[] = [];
  for (const ra of runA) {
    const rb = byFrameB.get(ra.frameId)!;
    if (ra.failureCategory !== "SUCCESSFUL_EVALUATION" || rb.failureCategory !== "SUCCESSFUL_EVALUATION") {
      abComparison.push({
        frameId: ra.frameId,
        familyId: ra.familyId,
        classification: "NOT_EVALUATED_BOTH_RUNS",
        detail: `A=${ra.failureCategory} B=${rb.failureCategory}`,
      });
      continue;
    }
    const sameDecision = ra.decision === rb.decision;
    const sameIssues = JSON.stringify([...ra.issueClasses!].sort()) === JSON.stringify([...rb.issueClasses!].sort());
    const sameDigest = ra.proofReceiptSubstantiveDigest === rb.proofReceiptSubstantiveDigest;
    if (sameDecision && sameIssues && sameDigest) {
      abComparison.push({
        frameId: ra.frameId,
        familyId: ra.familyId,
        classification: "SUBSTANTIVELY_IDENTICAL",
        detail: `decision=${ra.decision} issues=${ra.issueClasses!.length} substantiveDigest matches`,
      });
    } else {
      abComparison.push({
        frameId: ra.frameId,
        familyId: ra.familyId,
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
  // Failure classification under the frozen taxonomy (Run A basis)
  // -------------------------------------------------------------------
  interface ClassificationRecord {
    frameId: string;
    familyId: string;
    taxonomyCategory: string;
    countsTowardMaterialFailureRate: boolean;
    rationale: string;
  }
  const classification: ClassificationRecord[] = runA.map((r) => {
    const abRec = abComparison.find((x) => x.frameId === r.frameId)!;
    if (r.failureCategory === "EXTERNAL_ACQUISITION_FAILURE") {
      return {
        frameId: r.frameId,
        familyId: r.familyId,
        taxonomyCategory: "EXTERNAL_ACQUISITION_FAILURE",
        countsTowardMaterialFailureRate: false,
        rationale:
          "The persisted frozen bytes for this unit did not verify against the Phase-1-locked SHA-256 (a corruption/integrity condition, not a live-drift condition, since Phase 2 reads from the persisted frozen file rather than the live network).",
      };
    }
    if (r.failureCategory === "PIPELINE_FAILURE" && r.normalisationError !== null) {
      return {
        frameId: r.frameId,
        familyId: r.familyId,
        taxonomyCategory: "REPRESENTATION_FAILURE",
        countsTowardMaterialFailureRate: false,
        rationale: `Source acquired and digest-verified, but normalisation failed before evaluation could begin: ${r.normalisationError}.`,
      };
    }
    if (r.failureCategory === "PIPELINE_FAILURE" || r.failureCategory === "RUNNER_EXCEPTION") {
      return {
        frameId: r.frameId,
        familyId: r.familyId,
        taxonomyCategory: "PIPELINE_FAILURE",
        countsTowardMaterialFailureRate: true,
        rationale: r.threw
          ? `evaluateDocument (or its request construction) threw an exception: ${r.exceptionMessage}`
          : `evaluateDocument returned {ok:false} at stage ${r.failedAtStage}.`,
      };
    }
    if (abRec.classification === "DETERMINISM_FAILURE") {
      return {
        frameId: r.frameId,
        familyId: r.familyId,
        taxonomyCategory: "DETERMINISM_FAILURE",
        countsTowardMaterialFailureRate: true,
        rationale: `Run A and Run B produced substantively different results on identical input: ${abRec.detail}`,
      };
    }
    if (r.proofReceiptIndependentlyVerified === false) {
      return {
        frameId: r.frameId,
        familyId: r.familyId,
        taxonomyCategory: "PROOF_INTEGRITY_FAILURE",
        countsTowardMaterialFailureRate: true,
        rationale: "Proof receipt substantiveDigest did not independently re-verify.",
      };
    }
    return {
      frameId: r.frameId,
      familyId: r.familyId,
      taxonomyCategory: "SUCCESSFUL_EVALUATION",
      countsTowardMaterialFailureRate: false,
      rationale: `Completed acquisition, representation, evaluation and proof verification with decision=${r.decision}, ${r.issueCount} issue(s). No benchmark-defined system failure observed.`,
    };
  });

  // -------------------------------------------------------------------
  // Aggregate statistics
  // -------------------------------------------------------------------
  const totalLocked = RECOMMENDED_SAMPLE_SIZE;
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
    DETERMINISM_REPEATABILITY_RATE: computeRateEndpoint("DETERMINISM_REPEATABILITY_RATE", determinismIdentical, determinismEvaluatedBoth),
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
    DECISION_DISTRIBUTION: decisionDistribution,
    ISSUE_CLASS_DISTRIBUTION: issueClassDistribution,
    REPRESENTATION_SUCCESS_RATE: {
      demonstratedRepresentationFailures: classification.filter((c) => c.taxonomyCategory === "REPRESENTATION_FAILURE").length,
      evaluatedDenominator: acquired,
      note: "Descriptive only: no independent-reference spot-check was performed within Phase 2's scope (measurement, not investigation) — reported as a limitation, not a confirmed 0% rate.",
    },
  };

  // Family-level breakdown (exploratory)
  const familyBreakdown: Record<string, unknown> = {};
  for (const family of SOURCE_FAMILIES) {
    const unitsInFamily = classification.filter((c) => c.familyId === family.id);
    const successes = unitsInFamily.filter((c) => c.taxonomyCategory === "SUCCESSFUL_EVALUATION");
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
    for (const c of unitsInFamily) taxonomyCounts[c.taxonomyCategory] = (taxonomyCounts[c.taxonomyCategory] ?? 0) + 1;
    familyBreakdown[family.id] = {
      sampleSize: unitsInFamily.length,
      taxonomyCounts,
      evaluatedCount: successes.length,
      decisions,
      issueTotal,
      issueClasses,
      zeroIssueDocs: successes.filter((s) => runA.find((x) => x.frameId === s.frameId)!.issueCount === 0).length,
    };
  }

  const aggregateStatistics = {
    lockedSampleSize: totalLocked,
    attempted: totalLocked,
    primaryEndpoints,
    secondaryEndpoints,
    familyBreakdown,
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

  console.log(
    "A/B: ",
    Object.fromEntries(
      [...new Set(abComparison.map((c) => c.classification))].map((k) => [k, abComparison.filter((c) => c.classification === k).length]),
    ),
  );
  console.log("Proof:", { expected: proofExpectedCount, verified: proofVerifiedCount });
  console.log("Taxonomy:", aggregateStatistics.taxonomyCounts);
  console.log("Primary endpoints:", JSON.stringify(primaryEndpoints, null, 2));
  console.log("Family breakdown:", JSON.stringify(familyBreakdown, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
