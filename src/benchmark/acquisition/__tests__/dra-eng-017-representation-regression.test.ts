/**
 * DRA-ENG-017 — Representation Provenance and OCR Fidelity
 * Validation-ladder tests: DRA-DOC-0027 regression, native-text corpus
 * false-positive checks, freeze-record digest invariance (Part I), the
 * evaluation-input propagation path (Part B), and the 1901-alternate
 * cross-engine stress fixture (Part D generalisation; NOT a corpus
 * admission).
 *
 * No production behaviour for pre-existing freeze records is changed by
 * this file; it only measures the corrected architecture's output against
 * real, already-cached PDF bytes. DRA-DOC-0027's original corpus admission
 * (DRA-FRZ-000021 / DRA-ACQ-000030, HOLD / 11 issues / 5,323 statements) is
 * never re-created, re-frozen, or altered here — see
 * dra-acq-023-metric-system-admission.test.ts (run unmodified as part of
 * the validation ladder) for that historical evidence.
 */

import { describe, it, expect, beforeAll } from "vitest";

import { createHttpFetcher } from "../http-fetcher.js";
import { createDiskCachedFetcher } from "./support/disk-cached-fetcher.js";
import { probePdfRepresentation } from "./support/pdf-representation-prober.js";
import { createAcquisitionRequest } from "../request.js";
import { normaliseContent } from "../normalisation.js";
import { computeSourceDigest, computeApprovedMetadataDigest } from "../integrity.js";
import { createAcquisitionFreezeRecord, verifyAcquisitionFreezeRecordDigest } from "../freeze.js";
import { assessRepresentationProvenance } from "../representation-provenance.js";
import { evaluateDocument } from "../../../pipeline/index.js";

const FIXED_TS = "2026-08-10T21:00:00.000Z";

const CHRG_PDF_URL = "https://www.govinfo.gov/content/pkg/CHRG-87hhrg72535/pdf/CHRG-87hhrg72535.pdf";
// 1901 alternate candidate (DRA-CAND-023-02) from DRA-ACQ-023 Phase 1 discovery.
// STRESS FIXTURE ONLY — never admitted to the corpus, no document-specific
// logic anywhere in the detector keyed to this document's identity.
const SERIALSET_1901_PDF_URL =
  "https://www.govinfo.gov/content/pkg/SERIALSET-04155_00_00-040-0273-0000/pdf/SERIALSET-04155_00_00-040-0273-0000.pdf";
// Known-native-text corpus PDFs (already admitted as DRA-DOC-0024 / DRA-DOC-0025).
const CRS_R48555_PDF_URL = "https://www.congress.gov/crs_external_products/R/PDF/R48555/R48555.4.pdf";
const EIA_STEO_PDF_URL = "https://www.eia.gov/outlooks/steo/pdf/steo_full.pdf";

async function fetchBytes(url: string, cacheName: string, acquisitionId: string): Promise<Uint8Array> {
  const realFetcher = createHttpFetcher({
    timeoutMs: 180_000,
    maxRedirects: 5,
    maxBytes: 60_000_000,
    userAgent: "DRA-ENG-017-representation-regression/1.0",
  });
  const fetcher = createDiskCachedFetcher(realFetcher, cacheName);
  const reqResult = createAcquisitionRequest({
    acquisitionId,
    sourceUrl: url,
    requestedBy: "DRA-ENG-017-representation-regression",
    requestedAt: FIXED_TS,
  });
  if (!reqResult.ok) throw new Error("Failed to build acquisition request");
  const fetchResult = await fetcher(reqResult.request, {});
  if (!fetchResult.ok) throw new Error(`Fetch failed for ${url}: ${fetchResult.code} ${fetchResult.message}`);
  return fetchResult.source.rawBytes;
}

// ---------------------------------------------------------------------------
// Part F — DRA-DOC-0027 regression under the corrected architecture
// ---------------------------------------------------------------------------

describe("DRA-ENG-017 Part F — DRA-DOC-0027 regression", () => {
  let bytes: Uint8Array;

  beforeAll(async () => {
    bytes = await fetchBytes(CHRG_PDF_URL, "dra-acq-023", "DRA-ACQ-000030");
  }, 300_000);

  it("classifies DRA-DOC-0027's real PDF bytes as OCR_TEXT_LAYER via the real pdfinfo/pdffonts probe (no longer indistinguishable from native text)", async () => {
    const normResult = await normaliseContent(
      bytes,
      "application/pdf",
      computeSourceDigest(bytes),
      async (b) => {
        const { execFile } = await import("child_process");
        const { promisify } = await import("util");
        const { writeFile, readFile, unlink } = await import("fs/promises");
        const { tmpdir } = await import("os");
        const { join } = await import("path");
        const execFileAsync = promisify(execFile);
        const id = `dra-eng-017-norm-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const inputPath = join(tmpdir(), `${id}.pdf`);
        const outputPath = join(tmpdir(), `${id}.txt`);
        try {
          await writeFile(inputPath, b);
          await execFileAsync("pdftotext", ["-layout", inputPath, outputPath]);
          return await readFile(outputPath, "utf-8");
        } finally {
          await unlink(inputPath).catch(() => {});
          await unlink(outputPath).catch(() => {});
        }
      },
    );
    expect(normResult.ok).toBe(true);
    if (!normResult.ok) return;

    const assessment = await assessRepresentationProvenance(
      "application/pdf",
      bytes,
      normResult.document.text,
      probePdfRepresentation,
    );

    expect(assessment.provenance).toBe("OCR_TEXT_LAYER");
    expect(assessment.provenanceRationale).toMatch(/OmniPage/i);
    // Fidelity must not be auto-certified VERIFIED merely because extraction
    // succeeded — this is the exact weakness DRA-ENG-017 addresses.
    expect(assessment.fidelity).not.toBe("VERIFIED");
    expect(["UNVERIFIED", "DEGRADED"]).toContain(assessment.fidelity);
  }, 300_000);

  it("does not retroactively alter the original DRA-FRZ-000021 freeze-record digest computation (Part I)", () => {
    // Digest-invariance check: creating a freeze record WITH a
    // representationAssessment must produce the identical
    // freezeRecordDigest as creating it WITHOUT one, for the same material
    // fields. This is the concrete guarantee that historical freeze
    // records (created before DRA-ENG-017 existed, with no such field) are
    // unaffected by this change.
    const normalised = {
      sourceDigest: "test-source-digest",
      normalisationVersion: "DRA-NORM-v1" as const,
      text: "sample normalised text",
      textDigest: "test-text-digest",
      encoding: "utf-8" as const,
      warnings: [],
    };
    const baseInput = {
      freezeRecordId: "DRA-FRZ-TEST-INVARIANCE",
      corpusDocumentId: "DRA-DOC-TEST",
      acquisitionId: "DRA-ACQ-TEST",
      sourceUrl: "https://example.gov/test.pdf",
      finalUrl: "https://example.gov/test.pdf",
      sourceDigest: "test-source-digest",
      normalised,
      metadataDigest: "test-metadata-digest",
      frozenBy: "test-operator",
      benchmarkVersion: "DRA-CORPUS-1.0.0",
      fixedTimestamp: FIXED_TS,
    };

    const withoutAssessment = createAcquisitionFreezeRecord(baseInput);
    const withAssessment = createAcquisitionFreezeRecord({
      ...baseInput,
      representationAssessment: {
        provenance: "OCR_TEXT_LAYER",
        provenanceRationale: "test rationale",
        fidelity: "UNVERIFIED",
        fidelityRationale: "test rationale",
        detectorVersion: "1.0.0",
      },
    });

    expect(withAssessment.freezeRecordDigest).toBe(withoutAssessment.freezeRecordDigest);
    expect(verifyAcquisitionFreezeRecordDigest(withoutAssessment)).toBe(true);
    expect(verifyAcquisitionFreezeRecordDigest(withAssessment)).toBe(true);
    // representationAssessment absent on the historical-style record, present
    // on the corrected-current-version record — both digests still valid.
    expect(withoutAssessment.representationAssessment).toBeUndefined();
    expect(withAssessment.representationAssessment?.provenance).toBe("OCR_TEXT_LAYER");
  });
});

// ---------------------------------------------------------------------------
// Part B — evaluation-input propagation (requesterMetadata survives to the
// evaluator's Stage 1 output / proof receipt)
// ---------------------------------------------------------------------------

describe("DRA-ENG-017 Part B — representation assessment survives into evaluation input", () => {
  it("propagates representationProvenance/representationFidelity through requesterMetadata into Stage1Success.normalisedRequest, without changing decision semantics", () => {
    const text =
      "Ordinary short evaluation text used only to demonstrate that requesterMetadata survives Stage 1, " +
      "not to reproduce DRA-DOC-0027's full 5,323-statement evaluation.";
    const requestWithoutMetadata = {
      id: "eval-dra-eng-017-propagation-control",
      requestedAt: FIXED_TS,
      generatedDocument: {
        id: "gdoc-propagation-control",
        title: "Propagation control",
        content: text,
        sourceDocumentIds: ["sdoc-propagation-control"],
      },
      sourceDocuments: [
        { id: "sdoc-propagation-control", title: "Source", content: text, format: "PLAIN_TEXT" },
      ],
    };
    const requestWithMetadata = {
      ...requestWithoutMetadata,
      id: "eval-dra-eng-017-propagation-test",
      requesterMetadata: {
        representationProvenance: "OCR_TEXT_LAYER",
        representationFidelity: "UNVERIFIED",
        representationDetectorVersion: "1.0.0",
      },
    };

    const controlResult = evaluateDocument(requestWithoutMetadata);
    const testResult = evaluateDocument(requestWithMetadata);

    expect(controlResult.ok).toBe(true);
    expect(testResult.ok).toBe(true);
    if (!controlResult.ok || !testResult.ok) return;

    // The assessment survives, verbatim, into the normalised request Stage 1
    // preserves inside the pipeline.
    const normalisedRequest = testResult.pipeline.stage1.normalisedRequest as {
      requesterMetadata?: Record<string, unknown>;
    };
    expect(normalisedRequest.requesterMetadata).toEqual({
      representationProvenance: "OCR_TEXT_LAYER",
      representationFidelity: "UNVERIFIED",
      representationDetectorVersion: "1.0.0",
    });

    // Decision semantics (Stage 2-7) are unaffected by the metadata's mere
    // presence: same input text produces the same decision either way.
    expect(testResult.proofReceipt.decision).toBe(controlResult.proofReceipt.decision);
  });
});

// ---------------------------------------------------------------------------
// Part D validation — native-text corpus false-positive check
// ---------------------------------------------------------------------------

describe("DRA-ENG-017 Part D — native-text corpus false-positive check", () => {
  it("does not classify the DRA-DOC-0024 CRS report (native LaTeX/typesetting PDF) as OCR-derived", async () => {
    const bytes = await fetchBytes(CRS_R48555_PDF_URL, "dra-acq-020", "DRA-ACQ-900001");
    const signals = await probePdfRepresentation(bytes);
    const { provenance } = (await assessRepresentationProvenance("application/pdf", bytes, "x".repeat(signals.extractedTextLength), probePdfRepresentation));
    expect(provenance).not.toBe("OCR_TEXT_LAYER");
  }, 120_000);

  it("does not classify the DRA-DOC-0025 EIA STEO report (native, table/chart-heavy PDF) as OCR-derived", async () => {
    const bytes = await fetchBytes(EIA_STEO_PDF_URL, "dra-acq-021", "DRA-ACQ-900002");
    const signals = await probePdfRepresentation(bytes);
    const { provenance } = (await assessRepresentationProvenance("application/pdf", bytes, "x".repeat(signals.extractedTextLength), probePdfRepresentation));
    // This document is chart/table-heavy (many figures, logos, numeric
    // tables) — precisely the case the ticket warns must not become a false
    // positive. Confirms the detector's deliberate exclusion of any
    // image-coverage signal holds on a real document, not just synthetic
    // fixtures.
    expect(provenance).not.toBe("OCR_TEXT_LAYER");
  }, 120_000);
});

// ---------------------------------------------------------------------------
// Part E / D generalisation — 1901 alternate as a non-corpus stress fixture
// ---------------------------------------------------------------------------

describe("DRA-ENG-017 — 1901 alternate (DRA-CAND-023-02) stress fixture", () => {
  it("classifies a completely different, non-corpus 1901 OCR-scanned document as OCR_TEXT_LAYER via the same generic detector, and is never admitted to any corpus/registry", async () => {
    const bytes = await fetchBytes(SERIALSET_1901_PDF_URL, "dra-eng-017-1901-stress", "DRA-ACQ-900003");
    const signals = await probePdfRepresentation(bytes);
    const assessment = await assessRepresentationProvenance(
      "application/pdf",
      bytes,
      "x".repeat(Math.max(signals.extractedTextLength, 0)),
      probePdfRepresentation,
    );
    // Cross-engine generalisation: this is a distinct GovInfo Serial Set
    // package from a different OCR pass than DRA-DOC-0027, exercised only
    // to confirm the detector's OCR-signature matching is not overfit to
    // one document's specific Creator/Producer string.
    expect(assessment.provenance).toBe("OCR_TEXT_LAYER");
    // No CorpusRegistry, freeze record, or admission call appears anywhere
    // in this test — by construction, this fixture is never admitted.
  }, 120_000);
});
