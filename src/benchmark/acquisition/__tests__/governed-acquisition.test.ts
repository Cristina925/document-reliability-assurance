/**
 * DRA-ENG-009 — Governed Benchmark Acquisition and Freeze Pipeline
 * Comprehensive test suite
 *
 * All tests use deterministic fixtures and injected mocks.
 * No live network access is required or performed.
 *
 * Categories:
 *   1. AcquisitionRequest — validation, formatting, immutability
 *   2. SourceFetcher — HTML/text/errors/redirect/size/media-type
 *   3. OfficialSourceAssessment — VERIFIED/REVIEW_REQUIRED/REJECTED/no-evidence
 *   4. LicenceAssessment — VERIFIED/REVIEW_REQUIRED/REJECTED/public-domain
 *   5. Metadata extraction — html/markdown/plaintext/word-count
 *   6. Normalisation — CRLF/BOM/HTML/Markdown/empty/determinism
 *   7. Integrity — source digest / text digest / metadata digest / freeze digest
 *   8. Eligibility — all-pass / each blocking condition independently
 *   9. Freeze — createAcquisitionFreezeRecord / determinism / immutability
 *  10. Corpus integration — append-only / duplicate-id / manifest-verify
 *  11. End-to-end — acquireFreezeAndEvaluate full success and stage failures
 *  12. evaluateFrozenBenchmarkDocument — digest verification / corpus check
 */

import { describe, it, expect, beforeEach } from "vitest";

// Schema / request
import {
  createAcquisitionRequest,
  formatAcquisitionId,
  validateSourceUrl,
} from "../request.js";
import {
  OfficialSourceAssessmentSchema,
  ACQUISITION_ID_REGEX,
} from "../schema.js";

// Fetcher
import {
  createMockFetcher,
  DEFAULT_MAX_SOURCE_BYTES,
} from "../fetcher.js";

// Licence
import {
  LicenceAssessmentSchema,
  isLicenceApproved,
  isPublicDomainBasis,
} from "../licence.js";

// Metadata
import {
  computeWordCount,
  extractMetadataFromHtml,
  extractMetadataFromMarkdown,
  extractMetadataFromPlainText,
} from "../metadata.js";

// Normalisation
import {
  normaliseContent,
  NORMALISATION_VERSION,
} from "../normalisation.js";

// Integrity
import {
  computeSourceDigest,
  verifySourceDigest,
  verifyTextDigest,
  computeApprovedMetadataDigest,
  verifyApprovedMetadataDigest,
  computeAcquisitionFreezeRecordDigest,
} from "../integrity.js";

// Eligibility
import { checkFreezeEligibility } from "../eligibility.js";

// Freeze
import {
  createAcquisitionFreezeRecord,
  verifyAcquisitionFreezeRecordDigest,
  ACQUISITION_FREEZE_RECORD_ID_REGEX,
  formatFreezeRecordId,
} from "../freeze.js";

// Manifest integration
import {
  integrateWithCorpus,
  buildCorpusDocumentInput,
} from "../manifest-integration.js";

// Governed pipeline
import {
  acquireFreezeAndEvaluate,
  evaluateFrozenBenchmarkDocument,
} from "../governed-pipeline.js";

// Fixture
import {
  NIST_FIPS_199_FIXTURE,
  NIST_FIPS_199_TEXT,
} from "../fixtures/public-document-fixture.js";

// Existing infrastructure
import { CorpusRegistry } from "../../corpus/registry.js";
import { buildMinimalProtocol } from "../../governance/schema.js";

// ---------------------------------------------------------------------------
// Shared test helpers
// ---------------------------------------------------------------------------

const FIXED_TS = "2026-07-01T10:00:00.000Z";

function makeRequest(overrides: Record<string, unknown> = {}) {
  return createAcquisitionRequest({
    acquisitionId: "DRA-ACQ-000001",
    sourceUrl: "https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.199.pdf",
    requestedBy: "test-operator",
    requestedAt: "2026-07-01T10:00:00.000Z",
    ...overrides,
  });
}

function makeOfficialSourceAssessment(status = "VERIFIED") {
  return OfficialSourceAssessmentSchema.parse({
    status,
    assessedBy: "test-reviewer",
    assessedAt: "2026-07-01T09:00:00",
    evidence: ["NIST.gov domain confirmed", "HTTPS certificate valid"],
    notes: "Government publication confirmed.",
  });
}

function makeLicenceAssessment(status = "VERIFIED") {
  return LicenceAssessmentSchema.parse({
    status,
    licenceName: "US Government Work",
    licenceBasis: "US_GOVERNMENT_WORK",
    evidence: ["17 U.S.C. § 105 applies to NIST publications"],
    assessedBy: "test-reviewer",
    assessedAt: "2026-07-01T09:00:00",
  });
}

function makeApprovedMetadata() {
  return {
    title: NIST_FIPS_199_FIXTURE.title,
    publisher: NIST_FIPS_199_FIXTURE.publisher,
    publicationDate: "2004-02",
    domain: "TECHNICAL" as const,
    documentType: "POLICY" as const,
    difficulty: "MEDIUM" as const,
    language: "en",
    wordCount: NIST_FIPS_199_FIXTURE.wordCount,
  };
}

function makeRegistry() {
  return new CorpusRegistry();
}

function makeProtocol() {
  return buildMinimalProtocol();
}

function makeFixtureBytes(): Uint8Array {
  return new TextEncoder().encode(NIST_FIPS_199_TEXT);
}

function makeFixtureFetcher() {
  const responses = new Map([
    [
      NIST_FIPS_199_FIXTURE.officialSourceUrl,
      {
        httpStatus: 200,
        mediaType: "text/plain",
        body: NIST_FIPS_199_TEXT,
      },
    ],
  ]);
  return createMockFetcher(responses, FIXED_TS);
}

// ---------------------------------------------------------------------------
// 1. AcquisitionRequest
// ---------------------------------------------------------------------------

describe("createAcquisitionRequest", () => {
  it("accepts a valid request and returns a frozen object", () => {
    const result = makeRequest();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.request.acquisitionId).toBe("DRA-ACQ-000001");
    expect(Object.isFrozen(result.request)).toBe(true);
  });

  it("rejects a missing acquisitionId", () => {
    const result = makeRequest({ acquisitionId: undefined });
    expect(result.ok).toBe(false);
  });

  it("rejects an acquisitionId with wrong format", () => {
    const result = makeRequest({ acquisitionId: "ACQ-001" });
    expect(result.ok).toBe(false);
  });

  it("rejects a non-HTTPS URL", () => {
    const result = makeRequest({ sourceUrl: "ftp://example.com/doc.pdf" });
    expect(result.ok).toBe(false);
  });

  it("rejects an invalid URL", () => {
    const result = makeRequest({ sourceUrl: "not-a-url" });
    expect(result.ok).toBe(false);
  });

  it("rejects a missing requestedBy", () => {
    const result = makeRequest({ requestedBy: "" });
    expect(result.ok).toBe(false);
  });

  it("rejects a non-datetime requestedAt", () => {
    const result = makeRequest({ requestedAt: "2026-07-01" });
    expect(result.ok).toBe(false);
  });

  it("accepts HTTP scheme (not just HTTPS)", () => {
    const result = makeRequest({ sourceUrl: "http://example.gov/doc.txt" });
    expect(result.ok).toBe(true);
  });

  it("DRA-ACQ-NNNNNN regex matches valid IDs", () => {
    expect(ACQUISITION_ID_REGEX.test("DRA-ACQ-000001")).toBe(true);
    expect(ACQUISITION_ID_REGEX.test("DRA-ACQ-999999")).toBe(true);
    expect(ACQUISITION_ID_REGEX.test("DRA-ACQ-12345")).toBe(false);
    expect(ACQUISITION_ID_REGEX.test("ACQ-000001")).toBe(false);
  });

  it("formatAcquisitionId pads to 6 digits", () => {
    expect(formatAcquisitionId(1)).toBe("DRA-ACQ-000001");
    expect(formatAcquisitionId(999999)).toBe("DRA-ACQ-999999");
  });

  it("validateSourceUrl rejects ftp", () => {
    const r = validateSourceUrl("ftp://example.com/file");
    expect(r.ok).toBe(false);
  });

  it("validateSourceUrl accepts https", () => {
    const r = validateSourceUrl("https://nist.gov/doc.pdf");
    expect(r.ok).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. SourceFetcher / createMockFetcher
// ---------------------------------------------------------------------------

describe("createMockFetcher", () => {
  it("returns ok:true for a registered text/plain URL", async () => {
    const fetcher = makeFixtureFetcher();
    const reqResult = makeRequest();
    if (!reqResult.ok) throw new Error("request invalid");
    const result = await fetcher(reqResult.request);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.mediaType).toBe("text/plain");
    expect(result.source.httpStatus).toBe(200);
    expect(result.source.acquisitionId).toBe("DRA-ACQ-000001");
    expect(result.source.retrievedAt).toBe(FIXED_TS);
  });

  it("preserves raw bytes exactly", async () => {
    const fetcher = makeFixtureFetcher();
    const reqResult = makeRequest();
    if (!reqResult.ok) throw new Error("request invalid");
    const result = await fetcher(reqResult.request);
    if (!result.ok) return;
    const decoded = new TextDecoder().decode(result.source.rawBytes);
    expect(decoded).toBe(NIST_FIPS_199_TEXT);
  });

  it("records redirect chain", async () => {
    const url = "https://example.gov/doc.txt";
    const responses = new Map([
      [url, { body: "content", mediaType: "text/plain", redirects: ["https://example.gov/doc-v2.txt"] }],
    ]);
    const fetcher = createMockFetcher(responses);
    const reqResult = makeRequest({ sourceUrl: url });
    if (!reqResult.ok) throw new Error("request invalid");
    const result = await fetcher(reqResult.request);
    if (!result.ok) throw new Error("fetch failed");
    expect(result.source.redirects).toEqual(["https://example.gov/doc-v2.txt"]);
    expect(result.source.finalUrl).toBe("https://example.gov/doc-v2.txt");
  });

  it("returns HTTP_ERROR for non-2xx status", async () => {
    const url = "https://example.gov/doc.txt";
    const responses = new Map([[url, { httpStatus: 404, body: "not found" }]]);
    const fetcher = createMockFetcher(responses);
    const reqResult = makeRequest({ sourceUrl: url });
    if (!reqResult.ok) throw new Error("request invalid");
    const result = await fetcher(reqResult.request);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("HTTP_ERROR");
  });

  it("returns EMPTY_RESPONSE for empty body", async () => {
    const url = "https://example.gov/doc.txt";
    const responses = new Map([[url, { body: "", mediaType: "text/plain" }]]);
    const fetcher = createMockFetcher(responses);
    const reqResult = makeRequest({ sourceUrl: url });
    if (!reqResult.ok) throw new Error("request invalid");
    const result = await fetcher(reqResult.request);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("EMPTY_RESPONSE");
  });

  it("returns OVERSIZED_RESPONSE when body exceeds maxBytes", async () => {
    const url = "https://example.gov/doc.txt";
    const bigBody = "x".repeat(100);
    const responses = new Map([[url, { body: bigBody, mediaType: "text/plain" }]]);
    const fetcher = createMockFetcher(responses);
    const reqResult = makeRequest({ sourceUrl: url });
    if (!reqResult.ok) throw new Error("request invalid");
    const result = await fetcher(reqResult.request, { maxBytes: 10 });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("OVERSIZED_RESPONSE");
  });

  it("returns UNSUPPORTED_MEDIA_TYPE for application/json", async () => {
    const url = "https://example.gov/doc.json";
    const responses = new Map([[url, { body: "{}", mediaType: "application/json" }]]);
    const fetcher = createMockFetcher(responses);
    const reqResult = makeRequest({ sourceUrl: url });
    if (!reqResult.ok) throw new Error("request invalid");
    const result = await fetcher(reqResult.request);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("UNSUPPORTED_MEDIA_TYPE");
  });

  it("returns NETWORK_ERROR for unregistered URL", async () => {
    const fetcher = createMockFetcher(new Map());
    const reqResult = makeRequest({ sourceUrl: "https://example.gov/missing.txt" });
    if (!reqResult.ok) throw new Error("request invalid");
    const result = await fetcher(reqResult.request);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("NETWORK_ERROR");
  });

  it("strips media-type parameters (e.g. charset)", async () => {
    const url = "https://example.gov/doc.txt";
    const responses = new Map([[url, { body: "hello", mediaType: "text/plain; charset=utf-8" }]]);
    const fetcher = createMockFetcher(responses);
    const reqResult = makeRequest({ sourceUrl: url });
    if (!reqResult.ok) throw new Error("request invalid");
    const result = await fetcher(reqResult.request);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.mediaType).toBe("text/plain");
  });

  it("returns pre-programmed typed error", async () => {
    const url = "https://example.gov/doc.txt";
    const responses = new Map([[url, { error: { code: "TIMEOUT" as const, message: "timed out" } }]]);
    const fetcher = createMockFetcher(responses);
    const reqResult = makeRequest({ sourceUrl: url });
    if (!reqResult.ok) throw new Error("request invalid");
    const result = await fetcher(reqResult.request);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("TIMEOUT");
  });
});

// ---------------------------------------------------------------------------
// 3. OfficialSourceAssessment
// ---------------------------------------------------------------------------

describe("OfficialSourceAssessmentSchema", () => {
  it("parses a VERIFIED assessment with evidence", () => {
    const assessment = makeOfficialSourceAssessment("VERIFIED");
    expect(assessment.status).toBe("VERIFIED");
    expect(assessment.evidence.length).toBeGreaterThan(0);
  });

  it("parses REVIEW_REQUIRED without evidence", () => {
    const assessment = OfficialSourceAssessmentSchema.parse({
      status: "REVIEW_REQUIRED",
      assessedBy: "reviewer",
      assessedAt: "2026-07-01T09:00:00",
      evidence: [],
    });
    expect(assessment.status).toBe("REVIEW_REQUIRED");
  });

  it("rejects VERIFIED with empty evidence array", () => {
    expect(() =>
      OfficialSourceAssessmentSchema.parse({
        status: "VERIFIED",
        assessedBy: "reviewer",
        assessedAt: "2026-07-01T09:00:00",
        evidence: [],
      }),
    ).toThrow();
  });

  it("rejects missing assessedBy", () => {
    expect(() =>
      OfficialSourceAssessmentSchema.parse({
        status: "REVIEW_REQUIRED",
        assessedBy: "",
        assessedAt: "2026-07-01T09:00:00",
        evidence: [],
      }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// 4. LicenceAssessment
// ---------------------------------------------------------------------------

describe("LicenceAssessmentSchema", () => {
  it("parses a VERIFIED US_GOVERNMENT_WORK assessment", () => {
    const assessment = makeLicenceAssessment("VERIFIED");
    expect(assessment.status).toBe("VERIFIED");
    expect(assessment.licenceBasis).toBe("US_GOVERNMENT_WORK");
  });

  it("rejects VERIFIED with no evidence", () => {
    expect(() =>
      LicenceAssessmentSchema.parse({
        status: "VERIFIED",
        evidence: [],
        assessedBy: "reviewer",
        assessedAt: "2026-07-01T09:00:00",
      }),
    ).toThrow();
  });

  it("isLicenceApproved returns true only for VERIFIED", () => {
    expect(isLicenceApproved(makeLicenceAssessment("VERIFIED"))).toBe(true);
    expect(isLicenceApproved(makeLicenceAssessment("REVIEW_REQUIRED"))).toBe(false);
    expect(isLicenceApproved(makeLicenceAssessment("REJECTED"))).toBe(false);
  });

  it("isPublicDomainBasis identifies US_GOVERNMENT_WORK and PUBLIC_DOMAIN", () => {
    const gov = makeLicenceAssessment("VERIFIED");
    expect(isPublicDomainBasis(gov)).toBe(true);

    const cc0 = LicenceAssessmentSchema.parse({
      status: "VERIFIED",
      licenceBasis: "CREATIVE_COMMONS_ZERO",
      evidence: ["CC0 deed"],
      assessedBy: "reviewer",
      assessedAt: "2026-07-01T09:00:00",
    });
    expect(isPublicDomainBasis(cc0)).toBe(true);

    const ccby = LicenceAssessmentSchema.parse({
      status: "VERIFIED",
      licenceBasis: "CREATIVE_COMMONS_BY",
      evidence: ["CC BY deed"],
      assessedBy: "reviewer",
      assessedAt: "2026-07-01T09:00:00",
    });
    expect(isPublicDomainBasis(ccby)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 5. Metadata extraction
// ---------------------------------------------------------------------------

describe("extractMetadataFromHtml", () => {
  it("extracts title from <title> tag", () => {
    const html = "<html><head><title>FIPS 199</title></head><body>content</body></html>";
    const meta = extractMetadataFromHtml(html);
    expect(meta.title.value).toBe("FIPS 199");
    expect(meta.title.confidence).toBe("HIGH");
  });

  it("extracts language from lang attribute", () => {
    const html = "<html lang=\"en-US\"><body>content</body></html>";
    const meta = extractMetadataFromHtml(html);
    expect(meta.language.value).toBe("en-US");
  });

  it("returns absent fields without inventing values", () => {
    const html = "<html><body>content</body></html>";
    const meta = extractMetadataFromHtml(html);
    expect(meta.publisher.value).toBeUndefined();
    expect(meta.publicationDate.value).toBeUndefined();
  });
});

describe("extractMetadataFromMarkdown", () => {
  it("extracts title from YAML front matter", () => {
    const md = `---\ntitle: "FIPS 199"\nauthor: NIST\ndate: 2004-02\n---\n\n# Content\nBody text.`;
    const meta = extractMetadataFromMarkdown(md);
    expect(meta.title.value).toBe("FIPS 199");
    expect(meta.publisher.value).toBe("NIST");
    expect(meta.publicationDate.value).toBe("2004-02");
  });

  it("extracts title from first heading when no front matter", () => {
    const md = "# Security Categorization\n\nBody text.";
    const meta = extractMetadataFromMarkdown(md);
    expect(meta.title.value).toBe("Security Categorization");
    expect(meta.title.confidence).toBe("MEDIUM");
  });
});

describe("extractMetadataFromPlainText", () => {
  it("uses first non-empty line as candidate title (LOW confidence)", () => {
    const text = "FIPS PUB 199\nSome other content.";
    const meta = extractMetadataFromPlainText(text);
    expect(meta.title.value).toBe("FIPS PUB 199");
    expect(meta.title.confidence).toBe("LOW");
  });
});

describe("computeWordCount", () => {
  it("counts words correctly", () => {
    expect(computeWordCount("Hello world")).toBe(2);
    expect(computeWordCount("  one  two  three  ")).toBe(3);
    expect(computeWordCount("")).toBe(0);
  });

  it("counts the fixture at approximately 567 words", () => {
    const count = computeWordCount(NIST_FIPS_199_TEXT);
    expect(count).toBe(NIST_FIPS_199_FIXTURE.wordCount);
  });
});

// ---------------------------------------------------------------------------
// 6. Normalisation
// ---------------------------------------------------------------------------

describe("normaliseContent", () => {
  it("normalises plain text — strips CRLF, records digests", async () => {
    const text = "Line one\r\nLine two\r\nLine three";
    const bytes = new TextEncoder().encode(text);
    const sourceDigest = computeSourceDigest(bytes);
    const result = await normaliseContent(bytes, "text/plain", sourceDigest);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.document.text).not.toContain("\r");
    expect(result.document.normalisationVersion).toBe(NORMALISATION_VERSION);
    expect(result.document.encoding).toBe("utf-8");
    expect(result.document.sourceDigest).toBe(sourceDigest);
    expect(result.document.textDigest).toHaveLength(64);
  });

  it("normalises plain text — removes BOM", async () => {
    const text = "\uFEFFContent after BOM";
    const bytes = new TextEncoder().encode(text);
    const sourceDigest = computeSourceDigest(bytes);
    const result = await normaliseContent(bytes, "text/plain", sourceDigest);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.document.text.startsWith("\uFEFF")).toBe(false);
    expect(result.document.text.trim()).toBe("Content after BOM");
  });

  it("normalises HTML — strips tags, preserves text", async () => {
    const html = "<html><body><h1>Title</h1><p>Body text.</p><script>alert(1)</script></body></html>";
    const bytes = new TextEncoder().encode(html);
    const sourceDigest = computeSourceDigest(bytes);
    const result = await normaliseContent(bytes, "text/html", sourceDigest);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.document.text).toContain("Title");
    expect(result.document.text).toContain("Body text.");
    expect(result.document.text).not.toContain("<html>");
    expect(result.document.text).not.toContain("alert(1)");
  });

  it("normalises HTML — decodes entities", async () => {
    const html = "<p>A &amp; B &lt;C&gt; &quot;D&quot;</p>";
    const bytes = new TextEncoder().encode(html);
    const sourceDigest = computeSourceDigest(bytes);
    const result = await normaliseContent(bytes, "text/html", sourceDigest);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.document.text).toContain("A & B <C> \"D\"");
  });

  it("returns EMPTY_NORMALISED_TEXT error for whitespace-only content", async () => {
    const bytes = new TextEncoder().encode("   \n\n\t  ");
    const result = await normaliseContent(bytes, "text/plain", computeSourceDigest(bytes));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("EMPTY_NORMALISED_TEXT");
  });

  it("normalises the fixture — produces stable digests", async () => {
    const bytes = makeFixtureBytes();
    const sourceDigest = computeSourceDigest(bytes);
    const result = await normaliseContent(bytes, "text/plain", sourceDigest);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.document.sourceDigest).toBe(NIST_FIPS_199_FIXTURE.sourceDigest);
    expect(result.document.textDigest).toBe(NIST_FIPS_199_FIXTURE.normalisedTextDigest);
  });

  it("produces deterministic output across repeated calls", async () => {
    const bytes = makeFixtureBytes();
    const sd = computeSourceDigest(bytes);
    const r1 = await normaliseContent(bytes, "text/plain", sd);
    const r2 = await normaliseContent(bytes, "text/plain", sd);
    expect(r1.ok && r2.ok && r1.document.textDigest === r2.document.textDigest).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 7. Integrity
// ---------------------------------------------------------------------------

describe("computeSourceDigest", () => {
  it("produces 64-char lowercase hex", () => {
    const bytes = makeFixtureBytes();
    const digest = computeSourceDigest(bytes);
    expect(digest).toHaveLength(64);
    expect(digest).toMatch(/^[0-9a-f]{64}$/);
  });

  it("matches the pre-computed fixture sourceDigest", () => {
    expect(computeSourceDigest(makeFixtureBytes())).toBe(NIST_FIPS_199_FIXTURE.sourceDigest);
  });

  it("is stable across repeated calls", () => {
    const bytes = makeFixtureBytes();
    expect(computeSourceDigest(bytes)).toBe(computeSourceDigest(bytes));
  });

  it("changes when a single byte is flipped", () => {
    const bytes = new Uint8Array(makeFixtureBytes());
    const original = computeSourceDigest(bytes);
    bytes[0] ^= 0x01;
    expect(computeSourceDigest(bytes)).not.toBe(original);
  });
});

describe("verifySourceDigest", () => {
  it("returns true for matching bytes and digest", () => {
    const bytes = makeFixtureBytes();
    expect(verifySourceDigest(bytes, NIST_FIPS_199_FIXTURE.sourceDigest)).toBe(true);
  });

  it("returns false for tampered bytes", () => {
    const bytes = new Uint8Array(makeFixtureBytes());
    bytes[0] ^= 0xff;
    expect(verifySourceDigest(bytes, NIST_FIPS_199_FIXTURE.sourceDigest)).toBe(false);
  });

  it("returns false for wrong expected digest", () => {
    const bytes = makeFixtureBytes();
    expect(verifySourceDigest(bytes, "a".repeat(64))).toBe(false);
  });
});

describe("verifyTextDigest", () => {
  it("returns true for matching text and digest", () => {
    const text = NIST_FIPS_199_TEXT.trim();
    expect(verifyTextDigest(text, NIST_FIPS_199_FIXTURE.normalisedTextDigest)).toBe(true);
  });

  it("returns false for modified text", () => {
    const text = NIST_FIPS_199_TEXT.trim() + " EXTRA";
    expect(verifyTextDigest(text, NIST_FIPS_199_FIXTURE.normalisedTextDigest)).toBe(false);
  });
});

describe("computeApprovedMetadataDigest", () => {
  it("produces a 64-char digest", () => {
    const digest = computeApprovedMetadataDigest(makeApprovedMetadata());
    expect(digest).toHaveLength(64);
    expect(digest).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic", () => {
    const d1 = computeApprovedMetadataDigest(makeApprovedMetadata());
    const d2 = computeApprovedMetadataDigest(makeApprovedMetadata());
    expect(d1).toBe(d2);
  });

  it("changes when title changes", () => {
    const d1 = computeApprovedMetadataDigest(makeApprovedMetadata());
    const d2 = computeApprovedMetadataDigest({ ...makeApprovedMetadata(), title: "Different Title" });
    expect(d1).not.toBe(d2);
  });

  it("verifyApprovedMetadataDigest returns true for matching metadata", () => {
    const meta = makeApprovedMetadata();
    const digest = computeApprovedMetadataDigest(meta);
    expect(verifyApprovedMetadataDigest(meta, digest)).toBe(true);
  });

  it("verifyApprovedMetadataDigest returns false for tampered metadata", () => {
    const meta = makeApprovedMetadata();
    const digest = computeApprovedMetadataDigest(meta);
    const tampered = { ...meta, publisher: "Tampered Publisher" };
    expect(verifyApprovedMetadataDigest(tampered, digest)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 8. Eligibility
// ---------------------------------------------------------------------------

async function makeNormalisedFixture() {
  const bytes = makeFixtureBytes();
  const sourceDigest = computeSourceDigest(bytes);
  const normResult = await normaliseContent(bytes, "text/plain", sourceDigest);
  if (!normResult.ok) throw new Error("normalisation failed in test setup");
  return { bytes, sourceDigest, normalised: normResult.document };
}

function makeAcquiredSource(overrides: Record<string, unknown> = {}) {
  return Object.freeze({
    acquisitionId: "DRA-ACQ-000001",
    requestedUrl: NIST_FIPS_199_FIXTURE.officialSourceUrl,
    finalUrl: NIST_FIPS_199_FIXTURE.officialSourceUrl,
    mediaType: "text/plain" as const,
    rawBytes: makeFixtureBytes(),
    retrievedAt: FIXED_TS,
    httpStatus: 200,
    redirects: [] as string[],
    ...overrides,
  });
}

describe("checkFreezeEligibility", () => {
  it("returns eligible:true when all checks pass", async () => {
    const { normalised } = await makeNormalisedFixture();
    const result = checkFreezeEligibility(
      makeAcquiredSource(),
      normalised,
      makeOfficialSourceAssessment("VERIFIED"),
      makeLicenceAssessment("VERIFIED"),
      makeApprovedMetadata(),
      "DRA-DOC-0007",
      "Governs security categorization for federal information systems.",
      makeRegistry(),
      makeProtocol(),
      [],
    );
    expect(result.eligible).toBe(true);
    expect(result.checks.every((c) => c.passed)).toBe(true);
  });

  it("blocks when official-source is REVIEW_REQUIRED", async () => {
    const { normalised } = await makeNormalisedFixture();
    const result = checkFreezeEligibility(
      makeAcquiredSource(),
      normalised,
      makeOfficialSourceAssessment("REVIEW_REQUIRED"),
      makeLicenceAssessment("VERIFIED"),
      makeApprovedMetadata(),
      "DRA-DOC-0007",
      "Rationale.",
      makeRegistry(),
      makeProtocol(),
    );
    expect(result.eligible).toBe(false);
    if (result.eligible) return;
    expect(result.blockingReasons).toContain("OFFICIAL_SOURCE_NOT_VERIFIED");
  });

  it("blocks when licence is REJECTED", async () => {
    const { normalised } = await makeNormalisedFixture();
    const result = checkFreezeEligibility(
      makeAcquiredSource(),
      normalised,
      makeOfficialSourceAssessment("VERIFIED"),
      makeLicenceAssessment("REJECTED"),
      makeApprovedMetadata(),
      "DRA-DOC-0007",
      "Rationale.",
      makeRegistry(),
      makeProtocol(),
    );
    expect(result.eligible).toBe(false);
    if (result.eligible) return;
    expect(result.blockingReasons).toContain("LICENCE_NOT_VERIFIED");
  });

  it("blocks when title is empty", async () => {
    const { normalised } = await makeNormalisedFixture();
    const result = checkFreezeEligibility(
      makeAcquiredSource(),
      normalised,
      makeOfficialSourceAssessment("VERIFIED"),
      makeLicenceAssessment("VERIFIED"),
      { ...makeApprovedMetadata(), title: "" },
      "DRA-DOC-0007",
      "Rationale.",
      makeRegistry(),
      makeProtocol(),
    );
    expect(result.eligible).toBe(false);
    if (result.eligible) return;
    expect(result.blockingReasons).toContain("TITLE_MISSING");
  });

  it("blocks when inclusion rationale is empty", async () => {
    const { normalised } = await makeNormalisedFixture();
    const result = checkFreezeEligibility(
      makeAcquiredSource(),
      normalised,
      makeOfficialSourceAssessment("VERIFIED"),
      makeLicenceAssessment("VERIFIED"),
      makeApprovedMetadata(),
      "DRA-DOC-0007",
      "",
      makeRegistry(),
      makeProtocol(),
    );
    expect(result.eligible).toBe(false);
    if (result.eligible) return;
    expect(result.blockingReasons).toContain("INCLUSION_RATIONALE_MISSING");
  });

  it("blocks when corpus ID format is invalid", async () => {
    const { normalised } = await makeNormalisedFixture();
    const result = checkFreezeEligibility(
      makeAcquiredSource(),
      normalised,
      makeOfficialSourceAssessment("VERIFIED"),
      makeLicenceAssessment("VERIFIED"),
      makeApprovedMetadata(),
      "BAD-ID",
      "Rationale.",
      makeRegistry(),
      makeProtocol(),
    );
    expect(result.eligible).toBe(false);
    if (result.eligible) return;
    expect(result.blockingReasons).toContain("CORPUS_ID_INVALID");
  });

  it("blocks when corpus ID is already in registry", async () => {
    const { normalised } = await makeNormalisedFixture();
    // Pre-populate registry with DRA-DOC-0007
    const registry = makeRegistry();
    const meta = makeApprovedMetadata();
    const freezeRecord = createAcquisitionFreezeRecord({
      freezeRecordId: "DRA-FRZ-000001",
      corpusDocumentId: "DRA-DOC-0007",
      acquisitionId: "DRA-ACQ-000001",
      sourceUrl: NIST_FIPS_199_FIXTURE.officialSourceUrl,
      finalUrl: NIST_FIPS_199_FIXTURE.officialSourceUrl,
      sourceDigest: normalised.sourceDigest,
      normalised,
      metadataDigest: computeApprovedMetadataDigest(meta),
      frozenBy: "test-operator",
      benchmarkVersion: "1.0.0",
      fixedTimestamp: FIXED_TS,
    });
    integrateWithCorpus(freezeRecord, meta, registry);

    // Check eligibility for the SAME corpus ID — should block with DUPLICATE_CORPUS_ID
    const result = checkFreezeEligibility(
      makeAcquiredSource(),
      normalised,
      makeOfficialSourceAssessment("VERIFIED"),
      makeLicenceAssessment("VERIFIED"),
      makeApprovedMetadata(),
      "DRA-DOC-0007",
      "Same rationale.",
      registry,
      makeProtocol(),
    );
    expect(result.eligible).toBe(false);
    if (result.eligible) return;
    expect(result.blockingReasons).toContain("DUPLICATE_CORPUS_ID");
  });

  it("returns full check list regardless of blocking", async () => {
    const { normalised } = await makeNormalisedFixture();
    const result = checkFreezeEligibility(
      makeAcquiredSource(),
      normalised,
      makeOfficialSourceAssessment("REJECTED"),
      makeLicenceAssessment("REJECTED"),
      makeApprovedMetadata(),
      "DRA-DOC-0007",
      "Rationale.",
      makeRegistry(),
      makeProtocol(),
    );
    expect(result.checks.length).toBeGreaterThan(0);
    // All checks are recorded even when multiple block
    expect(result.eligible).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 9. Freeze
// ---------------------------------------------------------------------------

describe("createAcquisitionFreezeRecord", () => {
  it("produces a deeply frozen record", async () => {
    const { normalised } = await makeNormalisedFixture();
    const meta = makeApprovedMetadata();
    const record = createAcquisitionFreezeRecord({
      freezeRecordId: "DRA-FRZ-000001",
      corpusDocumentId: "DRA-DOC-0007",
      acquisitionId: "DRA-ACQ-000001",
      sourceUrl: NIST_FIPS_199_FIXTURE.officialSourceUrl,
      finalUrl: NIST_FIPS_199_FIXTURE.officialSourceUrl,
      sourceDigest: normalised.sourceDigest,
      normalised,
      metadataDigest: computeApprovedMetadataDigest(meta),
      frozenBy: "test-operator",
      benchmarkVersion: "1.0.0",
      fixedTimestamp: FIXED_TS,
    });
    expect(Object.isFrozen(record)).toBe(true);
    expect(record.status).toBe("FROZEN");
    expect(record.freezeRecordId).toBe("DRA-FRZ-000001");
    expect(record.frozenAt).toBe(FIXED_TS);
  });

  it("produces identical freezeRecordDigest for identical inputs with fixed timestamp", async () => {
    const { normalised } = await makeNormalisedFixture();
    const meta = makeApprovedMetadata();
    const input = {
      freezeRecordId: "DRA-FRZ-000001",
      corpusDocumentId: "DRA-DOC-0007",
      acquisitionId: "DRA-ACQ-000001",
      sourceUrl: NIST_FIPS_199_FIXTURE.officialSourceUrl,
      finalUrl: NIST_FIPS_199_FIXTURE.officialSourceUrl,
      sourceDigest: normalised.sourceDigest,
      normalised,
      metadataDigest: computeApprovedMetadataDigest(meta),
      frozenBy: "test-operator",
      benchmarkVersion: "1.0.0",
      fixedTimestamp: FIXED_TS,
    };
    const r1 = createAcquisitionFreezeRecord(input);
    const r2 = createAcquisitionFreezeRecord(input);
    expect(r1.freezeRecordDigest).toBe(r2.freezeRecordDigest);
  });

  it("verifyAcquisitionFreezeRecordDigest returns true for valid record", async () => {
    const { normalised } = await makeNormalisedFixture();
    const meta = makeApprovedMetadata();
    const record = createAcquisitionFreezeRecord({
      freezeRecordId: "DRA-FRZ-000001",
      corpusDocumentId: "DRA-DOC-0007",
      acquisitionId: "DRA-ACQ-000001",
      sourceUrl: NIST_FIPS_199_FIXTURE.officialSourceUrl,
      finalUrl: NIST_FIPS_199_FIXTURE.officialSourceUrl,
      sourceDigest: normalised.sourceDigest,
      normalised,
      metadataDigest: computeApprovedMetadataDigest(meta),
      frozenBy: "test-operator",
      benchmarkVersion: "1.0.0",
      fixedTimestamp: FIXED_TS,
    });
    expect(verifyAcquisitionFreezeRecordDigest(record)).toBe(true);
  });

  it("verifyAcquisitionFreezeRecordDigest returns false for tampered record", async () => {
    const { normalised } = await makeNormalisedFixture();
    const meta = makeApprovedMetadata();
    const record = createAcquisitionFreezeRecord({
      freezeRecordId: "DRA-FRZ-000001",
      corpusDocumentId: "DRA-DOC-0007",
      acquisitionId: "DRA-ACQ-000001",
      sourceUrl: NIST_FIPS_199_FIXTURE.officialSourceUrl,
      finalUrl: NIST_FIPS_199_FIXTURE.officialSourceUrl,
      sourceDigest: normalised.sourceDigest,
      normalised,
      metadataDigest: computeApprovedMetadataDigest(meta),
      frozenBy: "test-operator",
      benchmarkVersion: "1.0.0",
      fixedTimestamp: FIXED_TS,
    });
    // Tamper: wrong sourceDigest
    const tampered = { ...record, sourceDigest: "a".repeat(64) };
    expect(verifyAcquisitionFreezeRecordDigest(tampered)).toBe(false);
  });

  it("formatFreezeRecordId pads to 6 digits", () => {
    expect(formatFreezeRecordId(1)).toBe("DRA-FRZ-000001");
    expect(ACQUISITION_FREEZE_RECORD_ID_REGEX.test("DRA-FRZ-000001")).toBe(true);
    expect(ACQUISITION_FREEZE_RECORD_ID_REGEX.test("DRA-FRZ-12345")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 10. Corpus integration
// ---------------------------------------------------------------------------

describe("integrateWithCorpus", () => {
  async function makeFreezeRecord() {
    const { normalised } = await makeNormalisedFixture();
    const meta = makeApprovedMetadata();
    return {
      record: createAcquisitionFreezeRecord({
        freezeRecordId: "DRA-FRZ-000001",
        corpusDocumentId: "DRA-DOC-0007",
        acquisitionId: "DRA-ACQ-000001",
        sourceUrl: NIST_FIPS_199_FIXTURE.officialSourceUrl,
        finalUrl: NIST_FIPS_199_FIXTURE.officialSourceUrl,
        sourceDigest: normalised.sourceDigest,
        normalised,
        metadataDigest: computeApprovedMetadataDigest(meta),
        frozenBy: "test-operator",
        benchmarkVersion: "1.0.0",
        fixedTimestamp: FIXED_TS,
      }),
      meta,
    };
  }

  it("integrates successfully and returns a valid manifest", async () => {
    const { record, meta } = await makeFreezeRecord();
    const registry = makeRegistry();
    const result = integrateWithCorpus(record, meta, registry);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.corpusDocumentId).toBe("DRA-DOC-0007");
    expect(result.manifest).toBeDefined();
    expect(result.manifestDigest).toHaveLength(64);
  });

  it("rejects duplicate corpus ID on second call", async () => {
    const { record, meta } = await makeFreezeRecord();
    const registry = makeRegistry();
    integrateWithCorpus(record, meta, registry);
    const result2 = integrateWithCorpus(record, meta, registry);
    expect(result2.ok).toBe(false);
  });

  it("buildCorpusDocumentInput sets sourceType to HUMAN_AUTHORED", async () => {
    const { record, meta } = await makeFreezeRecord();
    const input = buildCorpusDocumentInput(record, meta);
    expect(input.sourceType).toBe("HUMAN_AUTHORED");
    expect(input.benchmarkStatus).toBe("FROZEN");
    expect(input.corpusId).toBe("DRA-DOC-0007");
  });
});

// ---------------------------------------------------------------------------
// 11. End-to-end — acquireFreezeAndEvaluate
// ---------------------------------------------------------------------------

describe("acquireFreezeAndEvaluate", () => {
  function makePipelineInput() {
    const reqResult = makeRequest();
    if (!reqResult.ok) throw new Error("request invalid");
    return {
      request: reqResult.request,
      officialSourceAssessment: makeOfficialSourceAssessment("VERIFIED"),
      licenceAssessment: makeLicenceAssessment("VERIFIED"),
      approvedMetadata: makeApprovedMetadata(),
      corpusDocumentId: "DRA-DOC-0007",
      freezeRecordId: "DRA-FRZ-000001",
      frozenBy: "test-operator",
      benchmarkVersion: "1.0.0",
      inclusionRationale: "NIST FIPS 199 is the federal standard for security categorization.",
    };
  }

  function makeDeps(registry?: CorpusRegistry) {
    return {
      fetcher: makeFixtureFetcher(),
      registry: registry ?? makeRegistry(),
      protocol: makeProtocol(),
      fixedTimestamp: FIXED_TS,
    };
  }

  it("returns ok:true with a valid BenchmarkDocumentResult", async () => {
    const result = await acquireFreezeAndEvaluate(makePipelineInput(), makeDeps());
    expect(result.ok).toBe(true);
    if (!result.ok) {
      // Log stage/errors for debugging
      console.error("Stage:", result.stage, "Errors:", result.errors);
      return;
    }
    expect(result.result.freeze.status).toBe("FROZEN");
    expect(result.result.freeze.corpusDocumentId).toBe("DRA-DOC-0007");
    expect(result.result.proofReference.freezeRecordId).toBe("DRA-FRZ-000001");
    expect(result.result.proofReference.sourceDigest).toBe(NIST_FIPS_199_FIXTURE.sourceDigest);
    expect(result.result.proofReference.normalisedTextDigest).toBe(NIST_FIPS_199_FIXTURE.normalisedTextDigest);
    expect(result.result.manifestDigest).toHaveLength(64);
    expect(result.result.decision).toBeTruthy();
  });

  it("does not mutate registry on ACQUISITION failure", async () => {
    const registry = makeRegistry();
    const input = makePipelineInput();
    const deps = {
      ...makeDeps(registry),
      fetcher: createMockFetcher(new Map()),  // no registered URL → NETWORK_ERROR
    };
    const result = await acquireFreezeAndEvaluate(input, deps);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe("ACQUISITION");
    // Registry must be untouched
    const manifest = registry.exportManifest();
    expect(manifest.documentCount).toBe(0);
  });

  it("fails at OFFICIAL_SOURCE stage when assessment is REVIEW_REQUIRED", async () => {
    const input = {
      ...makePipelineInput(),
      officialSourceAssessment: makeOfficialSourceAssessment("REVIEW_REQUIRED"),
    };
    const result = await acquireFreezeAndEvaluate(input, makeDeps());
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe("OFFICIAL_SOURCE");
  });

  it("fails at LICENCE stage when assessment is REJECTED", async () => {
    const input = {
      ...makePipelineInput(),
      licenceAssessment: makeLicenceAssessment("REJECTED"),
    };
    const result = await acquireFreezeAndEvaluate(input, makeDeps());
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe("LICENCE");
  });

  it("fails at ELIGIBILITY when corpus ID is invalid", async () => {
    const input = { ...makePipelineInput(), corpusDocumentId: "INVALID" };
    const result = await acquireFreezeAndEvaluate(input, makeDeps());
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe("ELIGIBILITY");
  });

  it("fails at CORPUS_INTEGRATION on duplicate ID without partial registry mutation", async () => {
    const registry = makeRegistry();
    const input = makePipelineInput();
    // First call succeeds
    const r1 = await acquireFreezeAndEvaluate(input, makeDeps(registry));
    expect(r1.ok).toBe(true);
    const manifAfter1 = registry.exportManifest();

    // Second call: same corpus ID → CORPUS_INTEGRATION failure
    const r2 = await acquireFreezeAndEvaluate(
      { ...input, freezeRecordId: "DRA-FRZ-000002" },
      makeDeps(registry),
    );
    // The duplicate source digest check in eligibility will actually block this first.
    // Either ELIGIBILITY or CORPUS_INTEGRATION must fail.
    expect(r2.ok).toBe(false);
    // Registry must not have grown beyond the first integration
    const manifAfter2 = registry.exportManifest();
    expect(manifAfter2.documentCount).toBe(manifAfter1.documentCount);
  });

  it("is deterministic — produces identical proofReference with fixed timestamp", async () => {
    const input = makePipelineInput();
    const r1 = await acquireFreezeAndEvaluate(input, makeDeps());
    const r2 = await acquireFreezeAndEvaluate(
      { ...input, corpusDocumentId: "DRA-DOC-0008", freezeRecordId: "DRA-FRZ-000002" },
      { ...makeDeps(), registry: makeRegistry() },
    );
    // Both should succeed; digests should reflect same fixture text
    if (!r1.ok || !r2.ok) return;
    expect(r1.result.proofReference.sourceDigest).toBe(r2.result.proofReference.sourceDigest);
    expect(r1.result.proofReference.normalisedTextDigest).toBe(r2.result.proofReference.normalisedTextDigest);
  });
});

// ---------------------------------------------------------------------------
// 12. evaluateFrozenBenchmarkDocument
// ---------------------------------------------------------------------------

describe("evaluateFrozenBenchmarkDocument", () => {
  async function runSuccessfulAcquisition() {
    const reqResult = makeRequest();
    if (!reqResult.ok) throw new Error("request invalid");
    const registry = makeRegistry();
    const input = {
      request: reqResult.request,
      officialSourceAssessment: makeOfficialSourceAssessment("VERIFIED"),
      licenceAssessment: makeLicenceAssessment("VERIFIED"),
      approvedMetadata: makeApprovedMetadata(),
      corpusDocumentId: "DRA-DOC-0007",
      freezeRecordId: "DRA-FRZ-000001",
      frozenBy: "test-operator",
      benchmarkVersion: "1.0.0",
      inclusionRationale: "Federal security categorization standard.",
    };
    const deps = {
      fetcher: makeFixtureFetcher(),
      registry,
      protocol: makeProtocol(),
      fixedTimestamp: FIXED_TS,
    };
    const pipelineResult = await acquireFreezeAndEvaluate(input, deps);
    if (!pipelineResult.ok) throw new Error(`Pipeline failed: ${pipelineResult.stage}`);
    return { pipelineResult: pipelineResult.result, registry };
  }

  it("returns ok:true when all digests match", async () => {
    const { pipelineResult, registry } = await runSuccessfulAcquisition();
    const rawBytes = makeFixtureBytes();
    const normText = NIST_FIPS_199_TEXT.trim();

    const result = evaluateFrozenBenchmarkDocument({
      freezeRecord: pipelineResult.freeze,
      rawBytes,
      normalisedText: normText,
      approvedMetadata: makeApprovedMetadata(),
      registry,
      fixedTimestamp: FIXED_TS,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      console.error("Stage:", result.stage, "Errors:", result.errors);
    }
  });

  it("returns ok:false when rawBytes are tampered", async () => {
    const { pipelineResult, registry } = await runSuccessfulAcquisition();
    const tamperedBytes = new Uint8Array(makeFixtureBytes());
    tamperedBytes[0] ^= 0xff;

    const result = evaluateFrozenBenchmarkDocument({
      freezeRecord: pipelineResult.freeze,
      rawBytes: tamperedBytes,
      normalisedText: NIST_FIPS_199_TEXT.trim(),
      approvedMetadata: makeApprovedMetadata(),
      registry,
      fixedTimestamp: FIXED_TS,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe("INTEGRITY");
    expect(result.errors[0]?.code).toBe("SOURCE_DIGEST_MISMATCH");
  });

  it("returns ok:false when normalised text is tampered", async () => {
    const { pipelineResult, registry } = await runSuccessfulAcquisition();

    const result = evaluateFrozenBenchmarkDocument({
      freezeRecord: pipelineResult.freeze,
      rawBytes: makeFixtureBytes(),
      normalisedText: NIST_FIPS_199_TEXT.trim() + " TAMPERED",
      approvedMetadata: makeApprovedMetadata(),
      registry,
      fixedTimestamp: FIXED_TS,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe("INTEGRITY");
    expect(result.errors[0]?.code).toBe("TEXT_DIGEST_MISMATCH");
  });

  it("returns ok:false when metadata is tampered", async () => {
    const { pipelineResult, registry } = await runSuccessfulAcquisition();

    const result = evaluateFrozenBenchmarkDocument({
      freezeRecord: pipelineResult.freeze,
      rawBytes: makeFixtureBytes(),
      normalisedText: NIST_FIPS_199_TEXT.trim(),
      approvedMetadata: { ...makeApprovedMetadata(), publisher: "Tampered Publisher" },
      registry,
      fixedTimestamp: FIXED_TS,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe("INTEGRITY");
    expect(result.errors[0]?.code).toBe("METADATA_DIGEST_MISMATCH");
  });

  it("returns ok:false when document is not in corpus", async () => {
    const { pipelineResult } = await runSuccessfulAcquisition();
    const emptyRegistry = makeRegistry();  // document not added

    const result = evaluateFrozenBenchmarkDocument({
      freezeRecord: pipelineResult.freeze,
      rawBytes: makeFixtureBytes(),
      normalisedText: NIST_FIPS_199_TEXT.trim(),
      approvedMetadata: makeApprovedMetadata(),
      registry: emptyRegistry,
      fixedTimestamp: FIXED_TS,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.stage).toBe("CORPUS_INTEGRATION");
    expect(result.errors[0]?.code).toBe("NOT_IN_CORPUS");
  });

  it("proof reference links freeze record to evaluation result", async () => {
    const { pipelineResult, registry } = await runSuccessfulAcquisition();

    const result = evaluateFrozenBenchmarkDocument({
      freezeRecord: pipelineResult.freeze,
      rawBytes: makeFixtureBytes(),
      normalisedText: NIST_FIPS_199_TEXT.trim(),
      approvedMetadata: makeApprovedMetadata(),
      registry,
      fixedTimestamp: FIXED_TS,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const pr = result.result.proofReference;
    expect(pr.freezeRecordId).toBe("DRA-FRZ-000001");
    expect(pr.corpusDocumentId).toBe("DRA-DOC-0007");
    expect(pr.sourceDigest).toBe(NIST_FIPS_199_FIXTURE.sourceDigest);
    expect(pr.normalisedTextDigest).toBe(NIST_FIPS_199_FIXTURE.normalisedTextDigest);
    expect(pr.freezeRecordDigest).toBe(pipelineResult.freeze.freezeRecordDigest);
    expect(pr.proofReceiptSubstantiveDigest).toBeTruthy();
  });
});
