/**
 * DRA-001-04C — Corpus Validator Tests
 */

import { describe, it, expect } from "vitest";
import { validateCorpus } from "../corpus-validator.js";
import { AcquisitionPipeline } from "../pipeline.js";
import type { AcquiredDocument } from "../pipeline.js";
import { buildMinimalProtocol, transitionProtocol } from "../../governance/schema.js";
import { buildProvenance } from "../provenance.js";
import { buildContentPayload } from "../../governance/eligibility.js";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const PROTOCOL = transitionProtocol(buildMinimalProtocol(), "APPROVED");

// Six documents matching the buildMinimalProtocol allocation exactly:
// Domain: 1 each × 6; DocType: SUMMARY×2, REPORT×2, POLICY×2; Difficulty: LOW×2, MEDIUM×2, HIGH×2
const SIX_INPUTS = [
  { domain: "GENERAL",    documentType: "SUMMARY", difficulty: "LOW",    text: "The history of renewable energy spans centuries. Solar, wind, and hydroelectric power have transformed how civilisations generate electricity across various regions of the globe." },
  { domain: "BUSINESS",   documentType: "REPORT",  difficulty: "MEDIUM", text: "Quarterly financial performance of the technology sector demonstrates consistent revenue growth driven by cloud computing adoption and artificial intelligence investments." },
  { domain: "TECHNICAL",  documentType: "POLICY",  difficulty: "HIGH",   text: "Software architectural patterns for distributed microservices must address fault tolerance, service discovery, and asynchronous communication protocols in production environments." },
  { domain: "LEGAL",      documentType: "SUMMARY", difficulty: "MEDIUM", text: "Contract law principles governing offer and acceptance require mutual assent between parties and consideration exchanged to form a legally binding agreement enforceable in court." },
  { domain: "HEALTHCARE", documentType: "REPORT",  difficulty: "HIGH",   text: "Clinical trial methodology demands randomised controlled study designs with statistically powered sample sizes to establish causal efficacy of pharmaceutical interventions." },
  { domain: "FINANCE",    documentType: "POLICY",  difficulty: "LOW",    text: "Investment portfolio diversification strategies reduce systematic risk by allocating assets across uncorrelated financial instruments spanning equity, fixed income, and alternative markets." },
] as const;

function buildSixDocs(): AcquiredDocument[] {
  const pipeline = new AcquisitionPipeline();
  return SIX_INPUTS.map(({ domain, documentType, difficulty, text }) =>
    pipeline.acquire({
      originalFilename: `${domain.toLowerCase()}.txt`,
      acquisitionSource: "SYNTHETIC",
      documentOrigin: "internal:test",
      licenceStatus: "INTERNAL",
      acquisitionDate: "2026-07-27T00:00:00.000Z",
      title: `${domain} ${documentType}`,
      domain: domain as never,
      documentType: documentType as never,
      difficulty: difficulty as never,
      sourceType: "AI_GENERATED",
      language: "en",
      generator: "TestGen",
      creationMethod: "automated",
      sourceReference: "internal:test",
      benchmarkStatus: "DRAFT",
      sourceText: `Source for ${domain} ${documentType}: ${text}`,
      generatedText: text,
      evaluatorInfluenced: false,
      hasPreannotatedOutcome: false,
      sourceVerifiable: true,
    }),
  );
}

// ---------------------------------------------------------------------------
// All checks pass
// ---------------------------------------------------------------------------

describe("validateCorpus — all checks pass", () => {
  it("returns ok=true for a valid 6-document corpus", () => {
    const result = validateCorpus(buildSixDocs(), PROTOCOL);
    expect(result.ok).toBe(true);
    expect(result.failedCheckNames).toHaveLength(0);
  });

  it("returns all six named checks", () => {
    const result = validateCorpus(buildSixDocs(), PROTOCOL);
    const names = result.checks.map((c) => c.name);
    expect(names).toContain("eligibility");
    expect(names).toContain("uniqueIds");
    expect(names).toContain("uniqueDigests");
    expect(names).toContain("nearDuplicates");
    expect(names).toContain("provenance");
    expect(names).toContain("allocation");
  });
});

// ---------------------------------------------------------------------------
// Check 1 — Eligibility
// ---------------------------------------------------------------------------

describe("validateCorpus — eligibility check fails", () => {
  it("fails eligibility when a document has evaluatorInfluenced=true", () => {
    const docs = buildSixDocs();
    // Replace first doc with one that is evaluator-influenced
    const pipeline = new AcquisitionPipeline(100);
    const bad = pipeline.acquire({
      originalFilename: "bad.txt",
      acquisitionSource: "SYNTHETIC",
      documentOrigin: "internal:test",
      licenceStatus: "INTERNAL",
      acquisitionDate: "2026-07-27T00:00:00.000Z",
      title: "Bad",
      domain: "GENERAL",
      documentType: "SUMMARY",
      difficulty: "LOW",
      sourceType: "AI_GENERATED",
      language: "en",
      generator: "G",
      creationMethod: "test",
      sourceReference: "r",
      benchmarkStatus: "DRAFT",
      sourceText: "Source text here for the bad document that is evaluator influenced.",
      generatedText: "Generated text unique here for the bad evaluator-influenced document example.",
      evaluatorInfluenced: true,   // <-- ineligible
      hasPreannotatedOutcome: false,
      sourceVerifiable: true,
    });
    const mixed = [bad, ...docs.slice(1)];
    const result = validateCorpus(mixed, PROTOCOL);
    const eligibilityCheck = result.checks.find((c) => c.name === "eligibility")!;
    expect(eligibilityCheck.passed).toBe(false);
    expect(eligibilityCheck.failures.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Check 2 — Unique IDs
// ---------------------------------------------------------------------------

describe("validateCorpus — unique ID check fails", () => {
  it("fails uniqueIds when two documents share a corpusId", () => {
    const docs = buildSixDocs();
    // Simulate a duplicate by constructing a doc with the same corpusId
    const dup: AcquiredDocument = { ...docs[0]!, generatedContent: buildContentPayload("Completely different generated content for the duplicate entry here.", "GENERATED") };
    const withDup = [docs[0]!, dup, ...docs.slice(1)];
    const result = validateCorpus(withDup, PROTOCOL);
    const check = result.checks.find((c) => c.name === "uniqueIds")!;
    expect(check.passed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Check 3 — Unique Digests
// ---------------------------------------------------------------------------

describe("validateCorpus — unique digest check fails", () => {
  it("fails uniqueDigests when two documents have identical generated content", () => {
    const docs = buildSixDocs();
    // Construct a doc that has identical generatedContent as docs[0]
    const pipeline = new AcquisitionPipeline(200);
    const dupContent: AcquiredDocument = {
      ...pipeline.acquire({
        originalFilename: "dup.txt",
        acquisitionSource: "SYNTHETIC",
        documentOrigin: "internal:test",
        licenceStatus: "INTERNAL",
        acquisitionDate: "2026-07-27T00:00:00.000Z",
        title: "Duplicate Content",
        domain: "BUSINESS",
        documentType: "REPORT",
        difficulty: "MEDIUM",
        sourceType: "AI_GENERATED",
        language: "en",
        generator: "G",
        creationMethod: "test",
        sourceReference: "r",
        benchmarkStatus: "DRAFT",
        sourceText: "Source for duplicate.",
        generatedText: SIX_INPUTS[0]!.text, // same as docs[0]
        evaluatorInfluenced: false,
        hasPreannotatedOutcome: false,
        sourceVerifiable: true,
      }),
    };
    const withDup = [...docs, dupContent];
    const result = validateCorpus(withDup, PROTOCOL);
    const check = result.checks.find((c) => c.name === "uniqueDigests")!;
    expect(check.passed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Check 4 — Near-duplicates
// ---------------------------------------------------------------------------

describe("validateCorpus — near-duplicate check fails", () => {
  it("fails nearDuplicates when two documents are nearly identical", () => {
    const docs = buildSixDocs();
    // Build a near-duplicate of docs[0] by repeating its text with one word changed
    const nearDupText = SIX_INPUTS[0]!.text.replace("civilisations", "societies");
    const pipeline = new AcquisitionPipeline(300);
    const nearDup: AcquiredDocument = pipeline.acquire({
      originalFilename: "near.txt",
      acquisitionSource: "SYNTHETIC",
      documentOrigin: "internal:test",
      licenceStatus: "INTERNAL",
      acquisitionDate: "2026-07-27T00:00:00.000Z",
      title: "Near Dup",
      domain: "BUSINESS",
      documentType: "REPORT",
      difficulty: "MEDIUM",
      sourceType: "AI_GENERATED",
      language: "en",
      generator: "G",
      creationMethod: "test",
      sourceReference: "r",
      benchmarkStatus: "DRAFT",
      sourceText: "Source.",
      generatedText: nearDupText,
      evaluatorInfluenced: false,
      hasPreannotatedOutcome: false,
      sourceVerifiable: true,
    });
    const withNearDup = [...docs, nearDup];
    const result = validateCorpus(withNearDup, PROTOCOL);
    const check = result.checks.find((c) => c.name === "nearDuplicates")!;
    expect(check.passed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Check 5 — Provenance
// ---------------------------------------------------------------------------

describe("validateCorpus — provenance check fails", () => {
  it("fails provenance when a document has an incomplete provenance record", () => {
    const docs = buildSixDocs();
    // Construct a doc with a truncated (incomplete) provenanceDigest
    const badProvenance = buildProvenance({
      acquisitionSource: "SYNTHETIC",
      acquisitionDate: "2026-07-27T00:00:00.000Z",
      documentOrigin: "x",
      originalFilename: "y.txt",
      licenceStatus: "INTERNAL",
      contentDigest: "a".repeat(64),
    });
    // Tamper: shorten the provenanceDigest to trigger isProvenanceComplete=false
    const incompleteProv = { ...badProvenance, provenanceDigest: "short" };
    const docWithBadProv: AcquiredDocument = { ...docs[0]!, provenance: incompleteProv };
    const result = validateCorpus([docWithBadProv, ...docs.slice(1)], PROTOCOL);
    const check = result.checks.find((c) => c.name === "provenance")!;
    expect(check.passed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Check 6 — Allocation
// ---------------------------------------------------------------------------

describe("validateCorpus — allocation check fails", () => {
  it("fails allocation when actual distribution does not match protocol targets", () => {
    // Use only 4 docs (wrong count) — some protocol target cells will be 0 instead of the target
    const docs = buildSixDocs().slice(0, 4);
    const result = validateCorpus(docs, PROTOCOL);
    const check = result.checks.find((c) => c.name === "allocation")!;
    expect(check.passed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Multiple independent failures
// ---------------------------------------------------------------------------

describe("validateCorpus — multiple failures", () => {
  it("reports all failed checks even when multiple checks fail", () => {
    // Pass an empty corpus — will fail eligibility (empty), uniqueIds (trivially pass), uniqueDigests (pass), nearDuplicates (pass), provenance (pass), allocation (fail)
    const result = validateCorpus([], PROTOCOL);
    // Allocation will fail (0 ≠ targets); eligibility says "all 0 eligible" → passes
    expect(result.ok).toBe(false);
    expect(result.failedCheckNames).toContain("allocation");
  });
});
