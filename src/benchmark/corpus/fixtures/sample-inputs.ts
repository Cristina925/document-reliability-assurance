/**
 * DRA-001 — Benchmark Corpus — Sample Fixture Inputs
 *
 * Milestone: DRA-001-04A — Benchmark Corpus Schema and Registry
 *
 * Minimal, realistic CorpusDocumentInput fixtures for use in tests.
 * These are INPUTS (no integrityDigest); tests that need registered
 * documents should add them through a CorpusRegistry instance.
 *
 * Not part of the actual benchmark corpus — do not add real
 * benchmark documents here.
 */

import type { CorpusDocumentInput } from "../schema.js";

export const SAMPLE_CORPUS_INPUT_A: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0001",
  title: "Sample General Summary",
  sourceType: "AI_GENERATED",
  documentType: "SUMMARY",
  domain: "GENERAL",
  language: "en",
  generator: "TestGenerator",
  generatorVersion: "1.0",
  creationMethod: "Prompted single-pass generation",
  difficulty: "LOW",
  sourceReference: "internal:fixture-A",
  benchmarkStatus: "DRAFT",
  notes: "Fixture for unit testing.",
};

export const SAMPLE_CORPUS_INPUT_B: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0002",
  title: "Sample Legal Policy Document",
  sourceType: "HUMAN_AUTHORED",
  documentType: "POLICY",
  domain: "LEGAL",
  language: "en-GB",
  generator: "HumanAuthor",
  creationMethod: "Manual authorship",
  difficulty: "HIGH",
  sourceReference: "internal:fixture-B",
  benchmarkStatus: "READY",
};

export const SAMPLE_CORPUS_INPUT_C: CorpusDocumentInput = {
  corpusId: "DRA-DOC-0003",
  title: "Sample Finance Report",
  sourceType: "HYBRID",
  documentType: "REPORT",
  domain: "FINANCE",
  language: "en",
  generator: "HybridSystem",
  generatorVersion: "2.1",
  creationMethod: "AI draft reviewed and edited by human",
  difficulty: "MEDIUM",
  sourceReference: "internal:fixture-C",
  benchmarkStatus: "FROZEN",
};
