/**
 * DRA-001-07 — BenchmarkCorpusLoader tests
 */

import { describe, it, expect } from "vitest";
import {
  loadBenchmarkCorpus,
  type BenchmarkCorpusLoadSuccess,
} from "../corpus-loader.js";
import { BENCHMARK_CORPUS } from "../corpus-data.js";
import type { BenchmarkDocumentEntry } from "../corpus-data.js";

// ---------------------------------------------------------------------------
// Successful load — full corpus
// ---------------------------------------------------------------------------

describe("loadBenchmarkCorpus — full corpus", () => {
  it("returns ok:true", () => {
    const result = loadBenchmarkCorpus();
    expect(result.ok).toBe(true);
  });

  it("returns 6 documents", () => {
    const result = loadBenchmarkCorpus() as BenchmarkCorpusLoadSuccess;
    expect(result.documentCount).toBe(6);
    expect(result.documents).toHaveLength(6);
  });

  it("preserves canonical corpus ID order", () => {
    const result = loadBenchmarkCorpus() as BenchmarkCorpusLoadSuccess;
    const ids = result.documents.map((d) => d.corpusDocument.corpusId);
    expect(ids).toEqual([
      "DRA-DOC-0001",
      "DRA-DOC-0002",
      "DRA-DOC-0003",
      "DRA-DOC-0004",
      "DRA-DOC-0005",
      "DRA-DOC-0006",
    ]);
  });

  it("result is frozen", () => {
    const result = loadBenchmarkCorpus() as BenchmarkCorpusLoadSuccess;
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.documents)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// BenchmarkExecutionDocument structure
// ---------------------------------------------------------------------------

describe("loadBenchmarkCorpus — BenchmarkExecutionDocument structure", () => {
  it("each document has a CorpusDocument with integrityDigest", () => {
    const result = loadBenchmarkCorpus() as BenchmarkCorpusLoadSuccess;
    for (const doc of result.documents) {
      expect(doc.corpusDocument).toBeDefined();
      expect(doc.corpusDocument.integrityDigest).toHaveLength(64);
    }
  });

  it("each document has non-empty generatedText", () => {
    const result = loadBenchmarkCorpus() as BenchmarkCorpusLoadSuccess;
    for (const doc of result.documents) {
      expect(doc.generatedText.trim().length).toBeGreaterThan(0);
    }
  });

  it("each document has non-empty sourceText", () => {
    const result = loadBenchmarkCorpus() as BenchmarkCorpusLoadSuccess;
    for (const doc of result.documents) {
      expect(doc.sourceText.trim().length).toBeGreaterThan(0);
    }
  });

  it("generatedText matches the corpus-data entry", () => {
    const result = loadBenchmarkCorpus() as BenchmarkCorpusLoadSuccess;
    for (const doc of result.documents) {
      const entry = BENCHMARK_CORPUS.find(
        (e) => e.input.corpusId === doc.corpusDocument.corpusId,
      );
      expect(entry).toBeDefined();
      expect(doc.generatedText).toBe(entry!.generatedText);
    }
  });

  it("sourceText matches the corpus-data entry", () => {
    const result = loadBenchmarkCorpus() as BenchmarkCorpusLoadSuccess;
    for (const doc of result.documents) {
      const entry = BENCHMARK_CORPUS.find(
        (e) => e.input.corpusId === doc.corpusDocument.corpusId,
      );
      expect(entry).toBeDefined();
      expect(doc.sourceText).toBe(entry!.sourceText);
    }
  });

  it("CorpusDocument title matches the input", () => {
    const result = loadBenchmarkCorpus() as BenchmarkCorpusLoadSuccess;
    for (const doc of result.documents) {
      const entry = BENCHMARK_CORPUS.find(
        (e) => e.input.corpusId === doc.corpusDocument.corpusId,
      );
      expect(doc.corpusDocument.title).toBe(entry!.input.title);
    }
  });

  it("CorpusDocument domain matches the input", () => {
    const result = loadBenchmarkCorpus() as BenchmarkCorpusLoadSuccess;
    for (const doc of result.documents) {
      const entry = BENCHMARK_CORPUS.find(
        (e) => e.input.corpusId === doc.corpusDocument.corpusId,
      );
      expect(doc.corpusDocument.domain).toBe(entry!.input.domain);
    }
  });
});

// ---------------------------------------------------------------------------
// Corpus integrity digests are stable across loads
// ---------------------------------------------------------------------------

describe("loadBenchmarkCorpus — determinism", () => {
  it("two loads return the same integrityDigest for each document", () => {
    const load1 = loadBenchmarkCorpus() as BenchmarkCorpusLoadSuccess;
    const load2 = loadBenchmarkCorpus() as BenchmarkCorpusLoadSuccess;
    for (let i = 0; i < load1.documents.length; i++) {
      expect(load1.documents[i]!.corpusDocument.integrityDigest).toBe(
        load2.documents[i]!.corpusDocument.integrityDigest,
      );
    }
  });

  it("two loads return the same documentCount", () => {
    const load1 = loadBenchmarkCorpus() as BenchmarkCorpusLoadSuccess;
    const load2 = loadBenchmarkCorpus() as BenchmarkCorpusLoadSuccess;
    expect(load1.documentCount).toBe(load2.documentCount);
  });
});

// ---------------------------------------------------------------------------
// Subset loading
// ---------------------------------------------------------------------------

describe("loadBenchmarkCorpus — subset loading", () => {
  it("loads a single entry successfully", () => {
    const result = loadBenchmarkCorpus([BENCHMARK_CORPUS[0]!]);
    expect(result.ok).toBe(true);
    const success = result as BenchmarkCorpusLoadSuccess;
    expect(success.documentCount).toBe(1);
    expect(success.documents[0]!.corpusDocument.corpusId).toBe("DRA-DOC-0001");
  });

  it("loads three entries in non-default order", () => {
    const subset: BenchmarkDocumentEntry[] = [
      BENCHMARK_CORPUS[4]!, // DRA-DOC-0005
      BENCHMARK_CORPUS[2]!, // DRA-DOC-0003
      BENCHMARK_CORPUS[0]!, // DRA-DOC-0001
    ];
    const result = loadBenchmarkCorpus(subset);
    expect(result.ok).toBe(true);
    const success = result as BenchmarkCorpusLoadSuccess;
    expect(success.documentCount).toBe(3);
    // Order follows input order (then sorted by registry)
    const ids = success.documents.map((d) => d.corpusDocument.corpusId);
    // Registry sorts by insertion order then list() returns in ID order
    expect(ids).toContain("DRA-DOC-0001");
    expect(ids).toContain("DRA-DOC-0003");
    expect(ids).toContain("DRA-DOC-0005");
  });

  it("fails with DUPLICATE_CORPUS_ID when same entry is supplied twice", () => {
    const duplicate = [BENCHMARK_CORPUS[0]!, BENCHMARK_CORPUS[0]!];
    const result = loadBenchmarkCorpus(duplicate);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("DUPLICATE_CORPUS_ID");
    }
  });
});

// ---------------------------------------------------------------------------
// Corpus framework validation
// ---------------------------------------------------------------------------

describe("loadBenchmarkCorpus — corpus framework validation", () => {
  it("each loaded CorpusDocument has benchmarkStatus FROZEN", () => {
    const result = loadBenchmarkCorpus() as BenchmarkCorpusLoadSuccess;
    for (const doc of result.documents) {
      expect(doc.corpusDocument.benchmarkStatus).toBe("FROZEN");
    }
  });

  it("each loaded CorpusDocument has a valid corpus ID matching DRA-DOC-NNNN", () => {
    const result = loadBenchmarkCorpus() as BenchmarkCorpusLoadSuccess;
    for (const doc of result.documents) {
      expect(doc.corpusDocument.corpusId).toMatch(/^DRA-DOC-\d{4}$/);
    }
  });
});
