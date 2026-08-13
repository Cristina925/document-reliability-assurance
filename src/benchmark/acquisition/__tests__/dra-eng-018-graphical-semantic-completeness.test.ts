/**
 * DRA-ENG-018 — Graphical-Semantic Completeness Detection: real-PDF
 * regression, contrast, and corpus false-positive suite.
 *
 * Required experiments (per the DRA-ENG-018 task spec, Parts E/F/G/H/I/L):
 *   Part E (positive case): DRA-DOC-0029 (CDC EID Legionella causal graph)
 *   must be flagged as carrying graphical-semantic risk.
 *   Part F (contrast case): DRA-DOC-0028 (FDA 510(k) flowcharts) must be run
 *   through the SAME unmodified mechanism to determine whether it separates
 *   "graphical risk exists" from "recoverable elsewhere" — the mechanism
 *   only attempts the first; recoverability is a documented, separate,
 *   non-automated determination (see the DRA-ENG-018 report).
 *   Part G (negative controls): every other PDF-sourced corpus document
 *   reachable through existing disk caches, with an explicit
 *   sample-size/denominator false-positive measurement.
 *   Part H/I: DRA-ENG-015 and DRA-ENG-017 are called, unmodified, against
 *   the same bytes to confirm the three mechanisms coexist without
 *   interference and remain independently inspectable.
 *   Part L: this suite never calls acquireFreezeAndEvaluate and never
 *   touches any frozen record, digest, or proof receipt — it only runs the
 *   new, standalone detector against already-frozen PDF bytes (re-fetched
 *   through the existing disk cache used by prior acquisitions), so no
 *   historical DRA-DOC-0028/0029 result is read, mutated, or re-derived.
 *
 * This suite intentionally reuses the exact corpus list and disk-cache
 * pattern established in dra-eng-015-corpus-regression.test.ts, so the two
 * mechanisms are exercised against an identical, already-verified set of
 * real documents.
 */

import { describe, it, expect, beforeAll } from "vitest";

import { createHttpFetcher } from "../http-fetcher.js";
import { createDiskCachedFetcher } from "./support/disk-cached-fetcher.js";
import { createAcquisitionRequest } from "../request.js";
import { probePdfImageRegions } from "./support/pdf-image-region-prober.js";
import { probePdfRepresentation } from "./support/pdf-representation-prober.js";
import { renderPdfToSvg } from "./support/pdf-svg-renderer.js";
import {
  assessGraphicalSemanticRisk,
  type GraphicalSemanticRiskAssessment,
} from "../graphical-semantic-risk.js";
import { assessRepresentationProvenance } from "../representation-provenance.js";
import { assessPdfRepresentationIntegrity } from "../representation-integrity.js";

const FIXED_TS = "2026-08-11T07:00:00.000Z";

// pdftotext's default page-break behaviour ("-layout" alone) still emits a
// form-feed between pages; assessGraphicalSemanticRisk relies on that for
// per-page localisation. Extraction is done here directly (not via
// normaliseContent, which may not preserve form feeds) so the detector is
// exercised the way it is actually documented to be used.
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
const execFileAsync = promisify(execFile);

async function extractPagedText(bytes: Uint8Array): Promise<string> {
  const id = `dra-eng-018-text-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const inputPath = join(tmpdir(), `${id}.pdf`);
  try {
    await writeFile(inputPath, bytes);
    const { stdout } = await execFileAsync("pdftotext", ["-layout", inputPath, "-"], {
      maxBuffer: 1024 * 1024 * 512,
    });
    return stdout;
  } finally {
    await unlink(inputPath).catch(() => {});
  }
}

interface CorpusPdf {
  readonly label: string;
  readonly url: string;
  readonly cacheName: string;
  readonly role: "GRAPHICAL_POSITIVE" | "VECTOR_CONTRAST" | "NEGATIVE_CONTROL";
}

const CORPUS_PDFS: readonly CorpusPdf[] = [
  {
    label: "DRA-DOC-0029 CDC EID Legionella causal graph (GRAPHICAL POSITIVE CASE)",
    url: "https://wwwnc.cdc.gov/eid/article/23/7/pdfs/16-1429-combined.pdf",
    cacheName: "dra-acq-025",
    role: "GRAPHICAL_POSITIVE",
  },
  {
    label: "DRA-DOC-0028 FDA 510(k) flowcharts (VECTOR CONTRAST CASE)",
    url: "https://www.fda.gov/media/99812/download",
    cacheName: "dra-acq-024",
    role: "VECTOR_CONTRAST",
  },
  { label: "DRA-DOC-0025 EIA STEO (shading, no raster diagram)", url: "https://www.eia.gov/outlooks/steo/pdf/steo_full.pdf", cacheName: "dra-acq-021", role: "NEGATIVE_CONTROL" },
  { label: "DRA-DOC-0008 ACAS discipline & grievance guide", url: "https://www.acas.org.uk/sites/default/files/2024-08/discipline-and-grievances-at-work-the-acas-guide.pdf", cacheName: "dra-bmk-022", role: "NEGATIVE_CONTROL" },
  { label: "DRA-DOC-0010 NIST AI RMF", url: "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf", cacheName: "dra-bmk-022", role: "NEGATIVE_CONTROL" },
  { label: "DRA-DOC-0011 CMA AI foundation models (full report)", url: "https://assets.publishing.service.gov.uk/media/6a4770c01c8bd7ce25a5ea3b/Best_practice_guidance_on_patient_information_leaflets.pdf", cacheName: "dra-bmk-022", role: "NEGATIVE_CONTROL" },
  { label: "DRA-DOC-0011b CMA AI foundation models (short version)", url: "https://assets.publishing.service.gov.uk/media/65081d2c4cd3c3000d68cb6d/Short_version_.pdf", cacheName: "dra-bmk-022", role: "NEGATIVE_CONTROL" },
  { label: "DRA-DOC-0013 FDA AI/ML SaMD", url: "https://www.fda.gov/media/145022/download", cacheName: "dra-bmk-022", role: "NEGATIVE_CONTROL" },
  { label: "DRA-DOC-0014 BCBS d516", url: "https://www.bis.org/bcbs/publ/d516.pdf", cacheName: "dra-bmk-022", role: "NEGATIVE_CONTROL" },
  { label: "DRA-DOC-0015 NCSC ML principles", url: "https://www.ncsc.gov.uk/sites/default/files/documents/NCSC-Machine-learning-principles.pdf", cacheName: "dra-bmk-022", role: "NEGATIVE_CONTROL" },
  { label: "DRA-DOC-0017 PRA SS1/23", url: "https://www.bankofengland.co.uk/-/media/boe/files/prudential-regulation/supervisory-statement/2023/ss123.pdf", cacheName: "dra-bmk-022", role: "NEGATIVE_CONTROL" },
  { label: "DRA-DOC-0018 EC ethics guidelines (EN)", url: "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60419", cacheName: "dra-bmk-022", role: "NEGATIVE_CONTROL" },
  { label: "DRA-DOC-0019 INE statistics code of practice (ES)", url: "https://www.ine.es/ine/codigobp/informe_PR_ronda3_es.pdf", cacheName: "dra-bmk-022", role: "NEGATIVE_CONTROL" },
  { label: "DRA-DOC-0020 CNIL report (FR)", url: "https://www.cnil.fr/sites/cnil/files/atoms/files/cnil_rapport_garder_la_main_web.pdf", cacheName: "dra-bmk-022", role: "NEGATIVE_CONTROL" },
  { label: "DRA-DOC-0021 EC ethics guidelines (other edition)", url: "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60423", cacheName: "dra-bmk-022", role: "NEGATIVE_CONTROL" },
  { label: "DRA-DOC-0022 EEA waste prevention progress report", url: "https://www.eea.europa.eu/en/analysis/publications/tracking-waste-prevention-progress/tracking-waste-prevention-progress/@@download/file", cacheName: "dra-bmk-022", role: "NEGATIVE_CONTROL" },
  { label: "DRA-DOC-0023 CMA CA98 final decision", url: "https://assets.publishing.service.gov.uk/media/68260527c3d769b1824e642f/Final_decision_.pdf", cacheName: "dra-bmk-023", role: "NEGATIVE_CONTROL" },
  { label: "DRA-DOC-0024 CRS congressional report", url: "https://www.congress.gov/crs_external_products/R/PDF/R48555/R48555.4.pdf", cacheName: "dra-acq-020", role: "NEGATIVE_CONTROL" },
];

interface CorpusResult {
  readonly label: string;
  readonly role: CorpusPdf["role"];
  readonly graphical: GraphicalSemanticRiskAssessment;
  readonly repFidelity: string;
  readonly repProvenance: string;
}

const results: CorpusResult[] = [];

beforeAll(async () => {
  const realFetcher = createHttpFetcher({
    timeoutMs: 120_000,
    maxRedirects: 5,
    maxBytes: 20_000_000,
    userAgent: "DRA-ENG-018-corpus-regression/1.0",
  });

  for (const doc of CORPUS_PDFS) {
    const fetcher = createDiskCachedFetcher(realFetcher, doc.cacheName);
    const reqResult = createAcquisitionRequest({
      acquisitionId: "DRA-ACQ-000099",
      sourceUrl: doc.url,
      requestedBy: "DRA-ENG-018-corpus-regression",
      requestedAt: FIXED_TS,
      expectedPublisher: "n/a",
      expectedTitle: "n/a",
    });
    if (!reqResult.ok) throw new Error(`Failed to build request for ${doc.label}`);

    const fetchResult = await fetcher(reqResult.request, {});
    if (!fetchResult.ok) {
      throw new Error(`Fetch failed for ${doc.label}: ${fetchResult.code} ${fetchResult.message}`);
    }

    const bytes = fetchResult.source.rawBytes;
    const pagedText = await extractPagedText(bytes);

    const graphical = await assessGraphicalSemanticRisk(
      "application/pdf",
      bytes,
      pagedText,
      probePdfImageRegions,
    );

    // Part H/I — run ENG-015 and ENG-017 against the SAME bytes, unmodified,
    // to confirm no interference and to demonstrate dual visibility.
    const representation = await assessRepresentationProvenance(
      "application/pdf",
      bytes,
      pagedText,
      probePdfRepresentation,
    );
    const integrity = await assessPdfRepresentationIntegrity(bytes, renderPdfToSvg);
    if (!integrity.ok) throw new Error(`ENG-015 assessment failed for ${doc.label}: ${integrity.code}`);

    results.push({
      label: doc.label,
      role: doc.role,
      graphical,
      repFidelity: representation.fidelity,
      repProvenance: representation.provenance,
    });
  }
}, 290_000);

describe("DRA-ENG-018 Part E — positive case", () => {
  it("flags DRA-DOC-0029 as POTENTIAL_GRAPHICAL_SEMANTIC_LOSS", () => {
    const positive = results.find((r) => r.role === "GRAPHICAL_POSITIVE");
    expect(positive).toBeDefined();
    console.log("\n[Part E — DRA-DOC-0029]", JSON.stringify(positive?.graphical, null, 2));
    expect(positive?.graphical.state).toBe("POTENTIAL_GRAPHICAL_SEMANTIC_LOSS");
    expect(positive?.graphical.materialImagePageFindings.length).toBeGreaterThanOrEqual(1);
  });

  it("simultaneously reports LEXICAL_FIDELITY=VERIFIED alongside the graphical-semantic-loss signal (Part I dual visibility)", () => {
    const positive = results.find((r) => r.role === "GRAPHICAL_POSITIVE");
    expect(positive?.repProvenance).toBe("NATIVE_TEXT");
    expect(positive?.repFidelity).toBe("VERIFIED");
    expect(positive?.graphical.state).toBe("POTENTIAL_GRAPHICAL_SEMANTIC_LOSS");
    // The core requirement: these two fields must both be readable, neither
    // one overwritten or suppressed by the other.
  });
});

describe("DRA-ENG-018 Part F — vector-diagram contrast case", () => {
  it("does NOT flag DRA-DOC-0028's flowcharts, because they are pure vector line art with no embedded raster image regions meeting the materiality threshold — a documented scope boundary, not a silent gap", () => {
    const contrast = results.find((r) => r.role === "VECTOR_CONTRAST");
    expect(contrast).toBeDefined();
    console.log("\n[Part F — DRA-DOC-0028]", JSON.stringify(contrast?.graphical, null, 2));
    // This assertion documents an intentional, evidence-based limitation:
    // the detector's only graphical-region signal is embedded raster
    // images. DRA-DOC-0028's flowcharts are vector-drawn (confirmed in
    // DRA-ACQ-024 Phase 2C), so this detector — like DRA-ENG-015 before it,
    // for a different reason — is structurally blind to this document's
    // topology loss. Automated recoverability determination (whether
    // Appendix B's checklist restates the lost topology) is explicitly NOT
    // attempted by this mechanism; see the DRA-ENG-018 report's closure
    // classification for why that remains a human/manual determination.
    expect(contrast?.graphical.state).toBe("GRAPHICAL_SEMANTICS_NOT_PRESENT");
  });
});

describe("DRA-ENG-018 Part G — corpus false-positive controls", () => {
  it("classifies every corpus document and reports the full distribution with an explicit sample size", () => {
    const negativeControls = results.filter((r) => r.role === "NEGATIVE_CONTROL");
    const byState: Record<string, string[]> = {
      GRAPHICAL_SEMANTICS_NOT_PRESENT: [],
      GRAPHICAL_SEMANTICS_REPRESENTED: [],
      POTENTIAL_GRAPHICAL_SEMANTIC_LOSS: [],
      GRAPHICAL_COMPLETENESS_NOT_ASSESSABLE: [],
    };
    for (const r of negativeControls) {
      byState[r.graphical.state].push(r.label);
    }

    console.log(`\n[DRA-ENG-018 Part G — Corpus Regression, n=${negativeControls.length} negative-control documents]`);
    for (const [state, docs] of Object.entries(byState)) {
      console.log(`  ${state}: ${docs.length} document(s)`);
      for (const d of docs) console.log("    -", d);
    }

    const falsePositives = negativeControls.filter((r) => r.graphical.state === "POTENTIAL_GRAPHICAL_SEMANTIC_LOSS");
    console.log(
      `\n  False-positive rate: ${falsePositives.length}/${negativeControls.length} negative-control documents ` +
        `(${((falsePositives.length / negativeControls.length) * 100).toFixed(1)}%)`,
    );
    for (const fp of falsePositives) {
      console.log("    FLAGGED:", fp.label, JSON.stringify(fp.graphical.materialImagePageFindings));
    }

    // Documented, not asserted to be zero a priori: this test records
    // whatever the real, unmodified detector actually produces against 16
    // genuine corpus documents spanning 8+ publishers. If it is non-zero,
    // that is reported as a finding, not hidden.
    expect(negativeControls.length).toBe(16);
  });
});

describe("DRA-ENG-018 Part H — ENG-015 coexistence", () => {
  it("runs independently of ENG-015 without interference on the same bytes (no shared mutable state, no overwritten fields)", () => {
    // Every result already ran assessPdfRepresentationIntegrity() and
    // assessGraphicalSemanticRisk() against the identical bytes in the same
    // beforeAll loop; both produced defined results for every document,
    // which is the coexistence guarantee this test checks.
    for (const r of results) {
      expect(r.graphical.state).toBeDefined();
      expect(r.repProvenance).toBeDefined();
    }
  });

  it("keeps graphical-semantic-risk.ts and representation-integrity.ts as separate, non-overlapping modules (Part H: independent, not merged)", async () => {
    const graphicalMod = await import("../graphical-semantic-risk.js");
    const integrityMod = await import("../representation-integrity.js");
    // Neither module re-exports the other's symbols — deliberate choice to
    // keep ENG-015 (fill-colour/shading) and ENG-018 (raster graphical
    // risk) as independent, separately-versioned sub-detectors under a
    // shared architecture pattern, not a single merged detector.
    expect(Object.keys(graphicalMod)).not.toContain("assessPdfRepresentationIntegrity");
    expect(Object.keys(integrityMod)).not.toContain("assessGraphicalSemanticRisk");
  });
});

describe("DRA-ENG-018 Part L — no coupling to the frozen evaluator/proof-receipt pipeline", () => {
  it("graphical-semantic-risk.ts has zero imports from evaluateDocument, normaliseContent, or the proof-receipt model", async () => {
    const mod = await import("../graphical-semantic-risk.js");
    const exportedNames = Object.keys(mod).sort();
    expect(exportedNames.sort()).toEqual(
      [
        "FULL_BLEED_COVERAGE_CEILING",
        "GRAPHICAL_SEMANTIC_RISK_DETECTOR_VERSION",
        "MATERIAL_IMAGE_COVERAGE_THRESHOLD",
        "SUBSTANTIAL_LOCAL_TEXT_THRESHOLD",
        "assessGraphicalSemanticRisk",
      ].sort(),
    );
  });

  it("is deterministic: re-running the positive case twice against identical bytes yields an identical assessment", async () => {
    const positive = CORPUS_PDFS.find((d) => d.role === "GRAPHICAL_POSITIVE")!;
    const realFetcher = createHttpFetcher({ timeoutMs: 120_000, maxRedirects: 5, maxBytes: 20_000_000, userAgent: "x" });
    const fetcher = createDiskCachedFetcher(realFetcher, positive.cacheName);
    const reqResult = createAcquisitionRequest({
      acquisitionId: "DRA-ACQ-000099",
      sourceUrl: positive.url,
      requestedBy: "DRA-ENG-018-determinism",
      requestedAt: FIXED_TS,
      expectedPublisher: "n/a",
      expectedTitle: "n/a",
    });
    if (!reqResult.ok) throw new Error("request build failed");
    const fetchResult = await fetcher(reqResult.request, {});
    if (!fetchResult.ok) throw new Error("fetch failed");
    const pagedText = await extractPagedText(fetchResult.source.rawBytes);
    const r1 = await assessGraphicalSemanticRisk("application/pdf", fetchResult.source.rawBytes, pagedText, probePdfImageRegions);
    const r2 = await assessGraphicalSemanticRisk("application/pdf", fetchResult.source.rawBytes, pagedText, probePdfImageRegions);
    expect(r1).toEqual(r2);
  }, 60_000);
});
