/**
 * DRA-001-07 — Corpus data validation tests
 *
 * Verifies that all six benchmark document entries are structurally valid,
 * have non-empty text content, carry unique corpus IDs, and can be
 * successfully processed through the corpus framework's CorpusRegistry.
 */

import { describe, it, expect } from "vitest";
import { CorpusRegistry } from "../../corpus/registry.js";
import { CorpusDocumentInputSchema } from "../../corpus/schema.js";
import {
  BENCHMARK_CORPUS,
  BENCHMARK_CORPUS_SIZE,
  getCorpusEntry,
  type BenchmarkDocumentEntry,
} from "../corpus-data.js";

// ---------------------------------------------------------------------------
// Corpus size and ordering
// ---------------------------------------------------------------------------

describe("BENCHMARK_CORPUS — size and ordering", () => {
  it("has exactly 6 entries", () => {
    expect(BENCHMARK_CORPUS).toHaveLength(6);
  });

  it("BENCHMARK_CORPUS_SIZE constant equals 6", () => {
    expect(BENCHMARK_CORPUS_SIZE).toBe(6);
  });

  it("entries are in ascending corpus ID order", () => {
    const ids = BENCHMARK_CORPUS.map((e) => e.input.corpusId);
    expect(ids).toEqual([
      "DRA-DOC-0001",
      "DRA-DOC-0002",
      "DRA-DOC-0003",
      "DRA-DOC-0004",
      "DRA-DOC-0005",
      "DRA-DOC-0006",
    ]);
  });

  it("is frozen", () => {
    expect(Object.isFrozen(BENCHMARK_CORPUS)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// CorpusDocumentInput schema validation
// ---------------------------------------------------------------------------

describe("BENCHMARK_CORPUS — CorpusDocumentInput validity", () => {
  for (const entry of BENCHMARK_CORPUS) {
    it(`${entry.input.corpusId} passes CorpusDocumentInputSchema validation`, () => {
      const result = CorpusDocumentInputSchema.safeParse(entry.input);
      expect(result.success, result.success ? "" : JSON.stringify(result.error)).toBe(true);
    });
  }

  it("all entries have benchmarkStatus FROZEN", () => {
    for (const entry of BENCHMARK_CORPUS) {
      expect(entry.input.benchmarkStatus).toBe("FROZEN");
    }
  });

  it("all entries have non-empty titles", () => {
    for (const entry of BENCHMARK_CORPUS) {
      expect(entry.input.title.length).toBeGreaterThan(0);
    }
  });

  it("all entries have valid language tags", () => {
    for (const entry of BENCHMARK_CORPUS) {
      expect(entry.input.language).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
    }
  });

  it("all entries have non-empty sourceReference", () => {
    for (const entry of BENCHMARK_CORPUS) {
      expect(entry.input.sourceReference.length).toBeGreaterThan(10);
    }
  });
});

// ---------------------------------------------------------------------------
// Corpus IDs are unique
// ---------------------------------------------------------------------------

describe("BENCHMARK_CORPUS — uniqueness", () => {
  it("all corpus IDs are unique", () => {
    const ids = BENCHMARK_CORPUS.map((e) => e.input.corpusId);
    const unique = new Set(ids);
    expect(unique.size).toBe(BENCHMARK_CORPUS.length);
  });

  it("all titles are unique", () => {
    const titles = BENCHMARK_CORPUS.map((e) => e.input.title);
    const unique = new Set(titles);
    expect(unique.size).toBe(BENCHMARK_CORPUS.length);
  });
});

// ---------------------------------------------------------------------------
// Text content
// ---------------------------------------------------------------------------

describe("BENCHMARK_CORPUS — text content", () => {
  for (const entry of BENCHMARK_CORPUS) {
    it(`${entry.input.corpusId} has non-empty generatedText (>= 200 chars)`, () => {
      expect(entry.generatedText.trim().length).toBeGreaterThanOrEqual(200);
    });

    it(`${entry.input.corpusId} has non-empty sourceText (>= 100 chars)`, () => {
      expect(entry.sourceText.trim().length).toBeGreaterThanOrEqual(100);
    });

    it(`${entry.input.corpusId} generatedText is distinct from sourceText`, () => {
      expect(entry.generatedText).not.toBe(entry.sourceText);
    });
  }

  it("all entries have valid UTF-8 text (no lone surrogates)", () => {
    for (const entry of BENCHMARK_CORPUS) {
      const genBuf = Buffer.from(entry.generatedText, "utf8");
      const srcBuf = Buffer.from(entry.sourceText, "utf8");
      expect(genBuf.toString("utf8")).toBe(entry.generatedText);
      expect(srcBuf.toString("utf8")).toBe(entry.sourceText);
    }
  });
});

// ---------------------------------------------------------------------------
// Domain coverage
// ---------------------------------------------------------------------------

describe("BENCHMARK_CORPUS — domain coverage", () => {
  it("covers TECHNICAL domain", () => {
    expect(BENCHMARK_CORPUS.some((e) => e.input.domain === "TECHNICAL")).toBe(true);
  });

  it("covers LEGAL domain", () => {
    expect(BENCHMARK_CORPUS.some((e) => e.input.domain === "LEGAL")).toBe(true);
  });

  it("covers BUSINESS domain", () => {
    expect(BENCHMARK_CORPUS.some((e) => e.input.domain === "BUSINESS")).toBe(true);
  });

  it("covers HEALTHCARE domain", () => {
    expect(BENCHMARK_CORPUS.some((e) => e.input.domain === "HEALTHCARE")).toBe(true);
  });

  it("covers FINANCE domain", () => {
    expect(BENCHMARK_CORPUS.some((e) => e.input.domain === "FINANCE")).toBe(true);
  });

  it("covers GENERAL domain", () => {
    expect(BENCHMARK_CORPUS.some((e) => e.input.domain === "GENERAL")).toBe(true);
  });

  it("has at least one HIGH difficulty document", () => {
    expect(BENCHMARK_CORPUS.some((e) => e.input.difficulty === "HIGH")).toBe(true);
  });

  it("has at least one MEDIUM difficulty document", () => {
    expect(BENCHMARK_CORPUS.some((e) => e.input.difficulty === "MEDIUM")).toBe(true);
  });

  it("has at least one LOW difficulty document", () => {
    expect(BENCHMARK_CORPUS.some((e) => e.input.difficulty === "LOW")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Source type coverage
// ---------------------------------------------------------------------------

describe("BENCHMARK_CORPUS — source type coverage", () => {
  it("includes AI_GENERATED documents", () => {
    expect(BENCHMARK_CORPUS.some((e) => e.input.sourceType === "AI_GENERATED")).toBe(true);
  });

  it("includes HYBRID documents", () => {
    expect(BENCHMARK_CORPUS.some((e) => e.input.sourceType === "HYBRID")).toBe(true);
  });

  it("includes HUMAN_AUTHORED documents", () => {
    expect(BENCHMARK_CORPUS.some((e) => e.input.sourceType === "HUMAN_AUTHORED")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// CorpusRegistry integration
// ---------------------------------------------------------------------------

describe("BENCHMARK_CORPUS — CorpusRegistry integration", () => {
  it("all entries can be added to a CorpusRegistry without error", () => {
    const registry = new CorpusRegistry();
    for (const entry of BENCHMARK_CORPUS) {
      expect(() => registry.add(entry.input)).not.toThrow();
    }
    expect(registry.size).toBe(6);
  });

  it("all added documents have a valid 64-char integrityDigest", () => {
    const registry = new CorpusRegistry();
    for (const entry of BENCHMARK_CORPUS) {
      const doc = registry.add(entry.input);
      expect(doc.integrityDigest).toHaveLength(64);
      expect(doc.integrityDigest).toMatch(/^[0-9a-f]{64}$/);
    }
  });

  it("each document has a unique integrityDigest", () => {
    const registry = new CorpusRegistry();
    const digests: string[] = [];
    for (const entry of BENCHMARK_CORPUS) {
      const doc = registry.add(entry.input);
      digests.push(doc.integrityDigest);
    }
    const unique = new Set(digests);
    expect(unique.size).toBe(6);
  });
});

// ---------------------------------------------------------------------------
// getCorpusEntry helper
// ---------------------------------------------------------------------------

describe("getCorpusEntry", () => {
  it("returns the correct entry for a valid corpus ID", () => {
    const entry = getCorpusEntry("DRA-DOC-0001");
    expect(entry).toBeDefined();
    expect(entry!.input.corpusId).toBe("DRA-DOC-0001");
    expect(entry!.input.domain).toBe("TECHNICAL");
  });

  it("returns undefined for an unknown corpus ID", () => {
    expect(getCorpusEntry("DRA-DOC-9999")).toBeUndefined();
  });

  it("returns entries for all six corpus IDs", () => {
    for (const entry of BENCHMARK_CORPUS) {
      const found = getCorpusEntry(entry.input.corpusId);
      expect(found).toBeDefined();
      expect(found!.input.corpusId).toBe(entry.input.corpusId);
    }
  });
});

// ---------------------------------------------------------------------------
// Specific document spot checks
// ---------------------------------------------------------------------------

describe("BENCHMARK_CORPUS — document spot checks", () => {
  it("DRA-DOC-0001 is TECHNICAL domain, HIGH difficulty, AI_GENERATED", () => {
    const e = BENCHMARK_CORPUS[0]!;
    expect(e.input.domain).toBe("TECHNICAL");
    expect(e.input.difficulty).toBe("HIGH");
    expect(e.input.sourceType).toBe("AI_GENERATED");
  });

  it("DRA-DOC-0002 is LEGAL domain with GDPR source reference", () => {
    const e = BENCHMARK_CORPUS[1]!;
    expect(e.input.domain).toBe("LEGAL");
    expect(e.input.sourceReference).toContain("GDPR");
  });

  it("DRA-DOC-0003 is BUSINESS domain, HYBRID source type", () => {
    const e = BENCHMARK_CORPUS[2]!;
    expect(e.input.domain).toBe("BUSINESS");
    expect(e.input.sourceType).toBe("HYBRID");
  });

  it("DRA-DOC-0004 is HEALTHCARE domain", () => {
    expect(BENCHMARK_CORPUS[3]!.input.domain).toBe("HEALTHCARE");
  });

  it("DRA-DOC-0005 is FINANCE domain", () => {
    expect(BENCHMARK_CORPUS[4]!.input.domain).toBe("FINANCE");
  });

  it("DRA-DOC-0006 is GENERAL domain, HUMAN_AUTHORED, LOW difficulty", () => {
    const e = BENCHMARK_CORPUS[5]!;
    expect(e.input.domain).toBe("GENERAL");
    expect(e.input.sourceType).toBe("HUMAN_AUTHORED");
    expect(e.input.difficulty).toBe("LOW");
  });

  it("DRA-DOC-0001 generatedText mentions ISO 31000", () => {
    expect(BENCHMARK_CORPUS[0]!.generatedText).toContain("ISO 31000");
  });

  it("DRA-DOC-0002 generatedText mentions GDPR Article 35", () => {
    expect(BENCHMARK_CORPUS[1]!.generatedText).toContain("Article 35");
  });

  it("DRA-DOC-0004 generatedText mentions NHS Digital", () => {
    expect(BENCHMARK_CORPUS[3]!.generatedText).toContain("NHS Digital");
  });

  it("DRA-DOC-0006 sourceText mentions ISO 27001", () => {
    expect(BENCHMARK_CORPUS[5]!.sourceText).toContain("ISO 27001");
  });
});
