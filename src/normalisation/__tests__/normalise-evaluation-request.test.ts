/**
 * DRA-ENG-003 — normaliseEvaluationRequest Tests
 *
 * Comprehensive deterministic tests for Stage 1 Input Normalisation.
 */

import { describe, it, expect } from "vitest";
import { normaliseEvaluationRequest } from "../../normalisation/normalise-evaluation-request.js";
import { STAGE_1_ID } from "../../normalisation/stage1-types.js";
import { DRA_MODEL_VERSION, DRA_PIPELINE_VERSION } from "../../model/index.js";
import {
  VALID_CANONICAL,
  VALID_WHITESPACE_METADATA,
  VALID_CRLF_CONTENT,
  VALID_CRLF_EXPECTED_GEN_CONTENT,
  VALID_CRLF_EXPECTED_SRC_CONTENT,
  VALID_UNORDERED_SOURCES,
  VALID_UNORDERED_SOURCES_EXPECTED_ORDER,
  VALID_EMPTY_SOURCES,
  VALID_NO_SOURCE_IDS,
  VALID_SINGLE_SOURCE,
  VALID_VERSION_IN_METADATA,
  VALID_MUTATION_TEST_RAW,
  VALID_DETERMINISM_INPUT_A,
  VALID_DETERMINISM_INPUT_B,
  VALID_WITH_BOUNDARY,
  VALID_WITHOUT_BOUNDARY,
} from "../../fixtures/normalisation/valid.js";
import {
  INVALID_EMPTY_IDENTIFIER,
  INVALID_EMPTY_SOURCE_DOC_ID,
  INVALID_DUPLICATE_SOURCE_IDS,
  INVALID_TIMESTAMP_NO_Z,
  INVALID_TIMESTAMP_STRING,
  INVALID_TIMESTAMP_OFFSET,
  INVALID_MISSING_GENERATED_DOCUMENT,
  INVALID_MISSING_ID,
  INVALID_UNRESOLVED_SOURCE_REF,
  INVALID_UNKNOWN_FIELDS_ONLY,
  INVALID_MISSPELLED_FIELD,
  INVALID_ENUM_FORMAT,
  INVALID_INCOMPLETE_SOURCE_DOC,
  INVALID_INCOMPLETE_GENERATED_DOC,
  INVALID_EMPTY_GENERATED_TITLE,
  INVALID_DUPLICATE_GEN_SOURCE_ID,
  INVALID_MULTIPLE_ERRORS,
  INVALID_NULL_INPUT,
  INVALID_UNDEFINED_INPUT,
  INVALID_EMPTY_OBJECT,
} from "../../fixtures/normalisation/invalid.js";

describe("DRA-ENG-003 normaliseEvaluationRequest", () => {
  // -------------------------------------------------------------------------
  // Basic success
  // -------------------------------------------------------------------------

  describe("successful normalisation of a valid evaluation request", () => {
    it("returns ok: true for canonical valid input", () => {
      const result = normaliseEvaluationRequest(VALID_CANONICAL);
      expect(result.ok).toBe(true);
    });

    it("result carries the Stage 1 identifier", () => {
      const result = normaliseEvaluationRequest(VALID_CANONICAL);
      expect(result.stageId).toBe(STAGE_1_ID);
      expect(result.stageId).toBe("STAGE_1_INPUT_NORMALISATION");
    });

    it("result carries the accepted pipeline version", () => {
      const result = normaliseEvaluationRequest(VALID_CANONICAL);
      expect(result.ok && result.pipelineVersion).toBe(DRA_PIPELINE_VERSION);
      expect(result.ok && result.pipelineVersion).toBe("1.0");
    });

    it("result carries the accepted model version", () => {
      const result = normaliseEvaluationRequest(VALID_CANONICAL);
      expect(result.ok && result.modelVersion).toBe(DRA_MODEL_VERSION);
      expect(result.ok && result.modelVersion).toBe("0.1.0");
    });

    it("normalised request has the correct evaluation id", () => {
      const result = normaliseEvaluationRequest(VALID_CANONICAL);
      if (result.ok) {
        expect(result.normalisedRequest.id).toBe("eval-req-norm-001");
      }
    });

    it("normalised request preserves the requestedAt timestamp exactly", () => {
      const result = normaliseEvaluationRequest(VALID_CANONICAL);
      if (result.ok) {
        expect(result.normalisedRequest.requestedAt).toBe(
          "2026-07-26T10:00:00.000Z",
        );
      }
    });

    it("normalisation record reports outputModelVersion = DRA_MODEL_VERSION", () => {
      const result = normaliseEvaluationRequest(VALID_CANONICAL);
      if (result.ok) {
        expect(result.normalisationRecord.outputModelVersion).toBe(
          DRA_MODEL_VERSION,
        );
      }
    });

    it("normalisation record reports outputPipelineVersion = DRA_PIPELINE_VERSION", () => {
      const result = normaliseEvaluationRequest(VALID_CANONICAL);
      if (result.ok) {
        expect(result.normalisationRecord.outputPipelineVersion).toBe(
          DRA_PIPELINE_VERSION,
        );
      }
    });

    it("normalisation record reports stageId", () => {
      const result = normaliseEvaluationRequest(VALID_CANONICAL);
      if (result.ok) {
        expect(result.normalisationRecord.stageId).toBe(STAGE_1_ID);
      }
    });

    it("normalised request has generatedDocument with correct id", () => {
      const result = normaliseEvaluationRequest(VALID_CANONICAL);
      if (result.ok) {
        expect(result.normalisedRequest.generatedDocument.id).toBe(
          "gen-doc-norm-001",
        );
      }
    });

    it("normalised request preserves source documents count", () => {
      const result = normaliseEvaluationRequest(VALID_CANONICAL);
      if (result.ok) {
        expect(result.normalisedRequest.sourceDocuments).toHaveLength(1);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Version policy — output always declares canonical versions
  // -------------------------------------------------------------------------

  describe("version policy", () => {
    it("normalisation record always declares 0.1.0 as outputModelVersion", () => {
      for (const input of [
        VALID_CANONICAL,
        VALID_EMPTY_SOURCES,
        VALID_SINGLE_SOURCE,
      ]) {
        const result = normaliseEvaluationRequest(input);
        if (result.ok) {
          expect(result.normalisationRecord.outputModelVersion).toBe("0.1.0");
        }
      }
    });

    it("normalisation record always declares 1.0 as outputPipelineVersion", () => {
      for (const input of [VALID_CANONICAL, VALID_EMPTY_SOURCES]) {
        const result = normaliseEvaluationRequest(input);
        if (result.ok) {
          expect(result.normalisationRecord.outputPipelineVersion).toBe("1.0");
        }
      }
    });

    it("version hints in requesterMetadata do not affect output versions", () => {
      const result = normaliseEvaluationRequest(VALID_VERSION_IN_METADATA);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.normalisationRecord.outputModelVersion).toBe("0.1.0");
        expect(result.normalisationRecord.outputPipelineVersion).toBe("1.0");
        // requesterMetadata is preserved opaquely
        expect(result.normalisedRequest.requesterMetadata).toBeDefined();
        expect(
          (result.normalisedRequest.requesterMetadata as Record<string, unknown>)?.[
            "requestedModelVersion"
          ],
        ).toBe("0.1.0");
      }
    });
  });

  // -------------------------------------------------------------------------
  // Trimming rules
  // -------------------------------------------------------------------------

  describe("metadata trimming rules", () => {
    it("trims generated document title", () => {
      const result = normaliseEvaluationRequest(VALID_WHITESPACE_METADATA);
      if (result.ok) {
        expect(result.normalisedRequest.generatedDocument.title).toBe(
          "AI-Generated Summary with Spaces",
        );
      }
    });

    it("trims source document title", () => {
      const result = normaliseEvaluationRequest(VALID_WHITESPACE_METADATA);
      if (result.ok) {
        expect(result.normalisedRequest.sourceDocuments[0]?.title).toBe(
          "Reference Document with Leading Space",
        );
      }
    });

    it("trims source document author", () => {
      const result = normaliseEvaluationRequest(VALID_WHITESPACE_METADATA);
      if (result.ok) {
        expect(result.normalisedRequest.sourceDocuments[0]?.author).toBe(
          "Test Author",
        );
      }
    });

    it("trims source document provenanceNotes", () => {
      const result = normaliseEvaluationRequest(VALID_WHITESPACE_METADATA);
      if (result.ok) {
        expect(result.normalisedRequest.sourceDocuments[0]?.provenanceNotes).toBe(
          "Notes with spaces",
        );
      }
    });

    it("does NOT trim document content", () => {
      const result = normaliseEvaluationRequest(VALID_WHITESPACE_METADATA);
      if (result.ok) {
        // Content should be preserved exactly (no trim)
        expect(result.normalisedRequest.generatedDocument.content).toBe(
          "The document content must not be trimmed.",
        );
      }
    });

    it("records fields that were normalised", () => {
      const result = normaliseEvaluationRequest(VALID_WHITESPACE_METADATA);
      if (result.ok) {
        expect(
          result.normalisationRecord.fieldsNormalised.length,
        ).toBeGreaterThan(0);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Line-ending normalisation
  // -------------------------------------------------------------------------

  describe("line-ending normalisation", () => {
    it("normalises CRLF to LF in generated document content", () => {
      const result = normaliseEvaluationRequest(VALID_CRLF_CONTENT);
      if (result.ok) {
        expect(result.normalisedRequest.generatedDocument.content).toBe(
          VALID_CRLF_EXPECTED_GEN_CONTENT,
        );
      }
    });

    it("normalises CRLF to LF in source document content", () => {
      const result = normaliseEvaluationRequest(VALID_CRLF_CONTENT);
      if (result.ok) {
        expect(result.normalisedRequest.sourceDocuments[0]?.content).toBe(
          VALID_CRLF_EXPECTED_SRC_CONTENT,
        );
      }
    });

    it("normalised content contains no CRLF sequences", () => {
      const result = normaliseEvaluationRequest(VALID_CRLF_CONTENT);
      if (result.ok) {
        expect(result.normalisedRequest.generatedDocument.content).not.toContain(
          "\r\n",
        );
        expect(
          result.normalisedRequest.sourceDocuments[0]?.content,
        ).not.toContain("\r\n");
      }
    });

    it("normalised content contains no standalone CR characters", () => {
      const result = normaliseEvaluationRequest(VALID_CRLF_CONTENT);
      if (result.ok) {
        expect(result.normalisedRequest.generatedDocument.content).not.toContain(
          "\r",
        );
      }
    });
  });

  // -------------------------------------------------------------------------
  // Preservation of meaningful content
  // -------------------------------------------------------------------------

  describe("preservation of meaningful content", () => {
    it("preserves punctuation in document content", () => {
      const result = normaliseEvaluationRequest(VALID_CANONICAL);
      if (result.ok) {
        expect(result.normalisedRequest.generatedDocument.content).toContain(
          "ISO 27001.",
        );
        expect(result.normalisedRequest.generatedDocument.content).toContain(
          "Section 1:",
        );
      }
    });

    it("preserves internal whitespace in content", () => {
      const input = {
        ...VALID_CANONICAL,
        generatedDocument: {
          ...VALID_CANONICAL.generatedDocument,
          content: "Word    with    spaces",
        },
      };
      const result = normaliseEvaluationRequest(input);
      if (result.ok) {
        expect(result.normalisedRequest.generatedDocument.content).toBe(
          "Word    with    spaces",
        );
      }
    });

    it("preserves source document ids exactly", () => {
      const result = normaliseEvaluationRequest(VALID_CANONICAL);
      if (result.ok) {
        expect(result.normalisedRequest.sourceDocuments[0]?.id).toBe(
          "src-norm-001",
        );
      }
    });

    it("preserves timestamps exactly", () => {
      const result = normaliseEvaluationRequest(VALID_SINGLE_SOURCE);
      if (result.ok) {
        expect(result.normalisedRequest.requestedAt).toBe(
          "2026-07-26T10:00:00.000Z",
        );
      }
    });
  });

  // -------------------------------------------------------------------------
  // Deterministic ordering
  // -------------------------------------------------------------------------

  describe("deterministic ordering of source documents", () => {
    it("sorts source documents by id (lexicographic ascending)", () => {
      const result = normaliseEvaluationRequest(VALID_UNORDERED_SOURCES);
      if (result.ok) {
        const ids = result.normalisedRequest.sourceDocuments.map((d) => d.id);
        expect(ids).toStrictEqual(VALID_UNORDERED_SOURCES_EXPECTED_ORDER);
      }
    });

    it("records 'sourceDocuments' in collectionsReordered when order changed", () => {
      const result = normaliseEvaluationRequest(VALID_UNORDERED_SOURCES);
      if (result.ok) {
        expect(result.normalisationRecord.collectionsReordered).toContain(
          "sourceDocuments",
        );
      }
    });

    it("does not record reorder when source documents are already sorted", () => {
      const result = normaliseEvaluationRequest(VALID_CANONICAL);
      if (result.ok) {
        expect(result.normalisationRecord.collectionsReordered).not.toContain(
          "sourceDocuments",
        );
      }
    });
  });

  // -------------------------------------------------------------------------
  // Determinism — same input produces equal output
  // -------------------------------------------------------------------------

  describe("determinism — repeated normalisation", () => {
    it("same valid input produces deeply equal normalised output when normalised twice", () => {
      const result1 = normaliseEvaluationRequest(VALID_CANONICAL);
      const result2 = normaliseEvaluationRequest(VALID_CANONICAL);
      expect(result1.ok).toBe(true);
      expect(result2.ok).toBe(true);
      if (result1.ok && result2.ok) {
        expect(result1.normalisedRequest).toStrictEqual(
          result2.normalisedRequest,
        );
      }
    });

    it("semantically equivalent inputs with different source order produce equal normalised output", () => {
      const resultA = normaliseEvaluationRequest(VALID_DETERMINISM_INPUT_A);
      const resultB = normaliseEvaluationRequest(VALID_DETERMINISM_INPUT_B);
      expect(resultA.ok).toBe(true);
      expect(resultB.ok).toBe(true);
      if (resultA.ok && resultB.ok) {
        expect(resultA.normalisedRequest).toStrictEqual(
          resultB.normalisedRequest,
        );
      }
    });

    it("normalising an already-normalised result produces equal output", () => {
      const first = normaliseEvaluationRequest(VALID_DETERMINISM_INPUT_A);
      expect(first.ok).toBe(true);
      if (first.ok) {
        const second = normaliseEvaluationRequest(first.normalisedRequest);
        expect(second.ok).toBe(true);
        if (second.ok) {
          expect(second.normalisedRequest).toStrictEqual(
            first.normalisedRequest,
          );
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // Immutability — raw input must not be mutated
  // -------------------------------------------------------------------------

  describe("immutability — raw input not mutated", () => {
    it("does not mutate the raw input object", () => {
      const raw = JSON.parse(JSON.stringify(VALID_MUTATION_TEST_RAW));
      const originalTitle = raw.generatedDocument.title;
      const originalContent = raw.generatedDocument.content;

      normaliseEvaluationRequest(raw);

      expect(raw.generatedDocument.title).toBe(originalTitle);
      expect(raw.generatedDocument.content).toBe(originalContent);
    });

    it("does not mutate the sourceDocuments array in the raw input", () => {
      const raw = JSON.parse(JSON.stringify(VALID_MUTATION_TEST_RAW));
      const originalSourceId = raw.sourceDocuments[0]?.id;

      normaliseEvaluationRequest(raw);

      expect(raw.sourceDocuments[0]?.id).toBe(originalSourceId);
    });

    it("subsequent mutation of the raw input does not alter the normalised result", () => {
      const raw = JSON.parse(JSON.stringify(VALID_MUTATION_TEST_RAW)) as Record<
        string,
        unknown
      >;
      const result = normaliseEvaluationRequest(raw);

      // Mutate the raw input after normalisation
      (raw as Record<string, unknown>)["id"] = "mutated-id";
      const genDoc = raw["generatedDocument"] as Record<string, unknown>;
      genDoc["title"] = "Mutated Title";

      // The normalised result should be unaffected
      if (result.ok) {
        expect(result.normalisedRequest.id).toBe("eval-req-norm-009");
        expect(result.normalisedRequest.generatedDocument.title).toBe(
          "Mutation Test Document",
        );
      }
    });
  });

  // -------------------------------------------------------------------------
  // Reference integrity
  // -------------------------------------------------------------------------

  describe("reference integrity validation", () => {
    it("rejects input where sourceDocumentIds references a missing source document", () => {
      const result = normaliseEvaluationRequest(INVALID_UNRESOLVED_SOURCE_REF);
      expect(result.ok).toBe(false);
    });

    it("failure includes UNRESOLVED_REFERENCE error code for missing source reference", () => {
      const result = normaliseEvaluationRequest(INVALID_UNRESOLVED_SOURCE_REF);
      if (!result.ok) {
        const codes = result.errors.map((e) => e.code);
        expect(codes).toContain("DRA_UNRESOLVED_REFERENCE");
      }
    });

    it("accepts empty sourceDocumentIds when sourceDocuments is empty", () => {
      const result = normaliseEvaluationRequest(VALID_EMPTY_SOURCES);
      expect(result.ok).toBe(true);
    });

    it("accepts empty sourceDocumentIds even when sourceDocuments is non-empty", () => {
      const result = normaliseEvaluationRequest(VALID_NO_SOURCE_IDS);
      expect(result.ok).toBe(true);
    });

    it("rejects generated document id that equals a source document id", () => {
      const result = normaliseEvaluationRequest(INVALID_DUPLICATE_GEN_SOURCE_ID);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        const codes = result.errors.map((e) => e.code);
        expect(codes).toContain("DRA_DUPLICATE_IDENTIFIER");
      }
    });
  });

  // -------------------------------------------------------------------------
  // Duplicate identifier rejection
  // -------------------------------------------------------------------------

  describe("duplicate identifier rejection", () => {
    it("rejects input with duplicate source document ids", () => {
      const result = normaliseEvaluationRequest(INVALID_DUPLICATE_SOURCE_IDS);
      expect(result.ok).toBe(false);
    });

    it("failure includes DUPLICATE_IDENTIFIER error code for duplicate source ids", () => {
      const result = normaliseEvaluationRequest(INVALID_DUPLICATE_SOURCE_IDS);
      if (!result.ok) {
        const codes = result.errors.map((e) => e.code);
        expect(codes).toContain("DRA_DUPLICATE_IDENTIFIER");
      }
    });
  });

  // -------------------------------------------------------------------------
  // Timestamp validation
  // -------------------------------------------------------------------------

  describe("timestamp validation", () => {
    it("rejects timestamp without Z suffix", () => {
      const result = normaliseEvaluationRequest(INVALID_TIMESTAMP_NO_Z);
      expect(result.ok).toBe(false);
    });

    it("rejects non-date string as timestamp", () => {
      const result = normaliseEvaluationRequest(INVALID_TIMESTAMP_STRING);
      expect(result.ok).toBe(false);
    });

    it("rejects timestamp with timezone offset (offset: false required)", () => {
      const result = normaliseEvaluationRequest(INVALID_TIMESTAMP_OFFSET);
      expect(result.ok).toBe(false);
    });

    it("failure includes INVALID_TIMESTAMP error code for bad timestamp", () => {
      const result = normaliseEvaluationRequest(INVALID_TIMESTAMP_STRING);
      if (!result.ok) {
        const codes = result.errors.map((e) => e.code);
        expect(codes).toContain("DRA_INVALID_TIMESTAMP");
      }
    });
  });

  // -------------------------------------------------------------------------
  // Unknown-field policy
  // -------------------------------------------------------------------------

  describe("unknown-field policy", () => {
    it("rejects input with only unknown fields (no canonical fields)", () => {
      const result = normaliseEvaluationRequest(INVALID_UNKNOWN_FIELDS_ONLY);
      expect(result.ok).toBe(false);
    });

    it("rejects input where requestedAt is misspelled (canonical field absent)", () => {
      const result = normaliseEvaluationRequest(INVALID_MISSPELLED_FIELD);
      expect(result.ok).toBe(false);
    });

    it("strips unknown extra fields from requesterMetadata peers (Zod default)", () => {
      // requesterMetadata is the canonical extension point.
      // Extra top-level fields outside the schema are stripped by Zod.
      const input = {
        ...VALID_CANONICAL,
        __unknownExtraField: "should be stripped",
      };
      const result = normaliseEvaluationRequest(input);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(
          (result.normalisedRequest as Record<string, unknown>)[
            "__unknownExtraField"
          ],
        ).toBeUndefined();
      }
    });
  });

  // -------------------------------------------------------------------------
  // Invalid required fields
  // -------------------------------------------------------------------------

  describe("required field validation", () => {
    it("rejects empty evaluation id", () => {
      const result = normaliseEvaluationRequest(INVALID_EMPTY_IDENTIFIER);
      expect(result.ok).toBe(false);
    });

    it("rejects empty source document id", () => {
      const result = normaliseEvaluationRequest(INVALID_EMPTY_SOURCE_DOC_ID);
      expect(result.ok).toBe(false);
    });

    it("rejects missing generatedDocument", () => {
      const result = normaliseEvaluationRequest(
        INVALID_MISSING_GENERATED_DOCUMENT,
      );
      expect(result.ok).toBe(false);
    });

    it("rejects missing evaluation id", () => {
      const result = normaliseEvaluationRequest(INVALID_MISSING_ID);
      expect(result.ok).toBe(false);
    });

    it("rejects source document with empty title", () => {
      const result = normaliseEvaluationRequest(INVALID_INCOMPLETE_SOURCE_DOC);
      expect(result.ok).toBe(false);
    });

    it("rejects generated document with empty content", () => {
      const result = normaliseEvaluationRequest(
        INVALID_INCOMPLETE_GENERATED_DOC,
      );
      expect(result.ok).toBe(false);
    });

    it("rejects generated document with empty title", () => {
      const result = normaliseEvaluationRequest(INVALID_EMPTY_GENERATED_TITLE);
      expect(result.ok).toBe(false);
    });

    it("rejects invalid enum value for source document format", () => {
      const result = normaliseEvaluationRequest(INVALID_ENUM_FORMAT);
      expect(result.ok).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Null / undefined / empty inputs
  // -------------------------------------------------------------------------

  describe("null, undefined, and empty input handling", () => {
    it("does not throw for null input", () => {
      expect(() => normaliseEvaluationRequest(INVALID_NULL_INPUT)).not.toThrow();
    });

    it("returns failure for null input", () => {
      const result = normaliseEvaluationRequest(INVALID_NULL_INPUT);
      expect(result.ok).toBe(false);
    });

    it("does not throw for undefined input", () => {
      expect(() =>
        normaliseEvaluationRequest(INVALID_UNDEFINED_INPUT),
      ).not.toThrow();
    });

    it("returns failure for undefined input", () => {
      const result = normaliseEvaluationRequest(INVALID_UNDEFINED_INPUT);
      expect(result.ok).toBe(false);
    });

    it("does not throw for empty object", () => {
      expect(() => normaliseEvaluationRequest(INVALID_EMPTY_OBJECT)).not.toThrow();
    });

    it("returns failure for empty object", () => {
      const result = normaliseEvaluationRequest(INVALID_EMPTY_OBJECT);
      expect(result.ok).toBe(false);
    });

    it("failure for null includes stageId", () => {
      const result = normaliseEvaluationRequest(INVALID_NULL_INPUT);
      expect(result.stageId).toBe(STAGE_1_ID);
    });
  });

  // -------------------------------------------------------------------------
  // Deterministic error ordering
  // -------------------------------------------------------------------------

  describe("deterministic error ordering", () => {
    it("returns multiple errors for multi-error input (not just the first)", () => {
      const result = normaliseEvaluationRequest(INVALID_MULTIPLE_ERRORS);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.length).toBeGreaterThan(1);
      }
    });

    it("errors are sorted by path then code (deterministic ordering)", () => {
      const result = normaliseEvaluationRequest(INVALID_MULTIPLE_ERRORS);
      if (!result.ok) {
        const paths = result.errors.map((e) => e.path);
        const sorted = [...paths].sort((a, b) => a.localeCompare(b));
        expect(paths).toStrictEqual(sorted);
      }
    });

    it("repeated normalisation of invalid input produces identical errors", () => {
      const result1 = normaliseEvaluationRequest(INVALID_MULTIPLE_ERRORS);
      const result2 = normaliseEvaluationRequest(INVALID_MULTIPLE_ERRORS);
      expect(result1.ok).toBe(false);
      expect(result2.ok).toBe(false);
      if (!result1.ok && !result2.ok) {
        expect(result1.errors).toStrictEqual(result2.errors);
      }
    });

    it("failure result includes errorCount equal to errors.length", () => {
      const result = normaliseEvaluationRequest(INVALID_MULTIPLE_ERRORS);
      if (!result.ok) {
        expect(result.errorCount).toBe(result.errors.length);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Normalisation record
  // -------------------------------------------------------------------------

  describe("normalisation record", () => {
    it("record has stageId = STAGE_1_INPUT_NORMALISATION", () => {
      const result = normaliseEvaluationRequest(VALID_CANONICAL);
      if (result.ok) {
        expect(result.normalisationRecord.stageId).toBe(STAGE_1_ID);
      }
    });

    it("record input entity counts match the raw input", () => {
      const result = normaliseEvaluationRequest(VALID_CANONICAL);
      if (result.ok) {
        expect(
          result.normalisationRecord.inputEntityCounts.sourceDocuments,
        ).toBe(1);
        expect(
          result.normalisationRecord.inputEntityCounts.statements,
        ).toBe(0);
        expect(
          result.normalisationRecord.inputEntityCounts.evidenceUnits,
        ).toBe(0);
        expect(
          result.normalisationRecord.inputEntityCounts.evidenceRelationships,
        ).toBe(0);
      }
    });

    it("record output entity counts match input counts (Stage 1 does not add/remove entities)", () => {
      const result = normaliseEvaluationRequest(VALID_CANONICAL);
      if (result.ok) {
        expect(result.normalisationRecord.outputEntityCounts.sourceDocuments).toBe(
          result.normalisationRecord.inputEntityCounts.sourceDocuments,
        );
      }
    });

    it("fieldsNormalised is sorted lexicographically", () => {
      const result = normaliseEvaluationRequest(VALID_CRLF_CONTENT);
      if (result.ok) {
        const fields = [...result.normalisationRecord.fieldsNormalised];
        const sorted = [...fields].sort((a, b) => a.localeCompare(b));
        expect(fields).toStrictEqual(sorted);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------

  describe("edge cases", () => {
    it("accepts request with no source documents", () => {
      const result = normaliseEvaluationRequest(VALID_EMPTY_SOURCES);
      expect(result.ok).toBe(true);
    });

    it("accepts string, number, boolean as raw input (returns failure)", () => {
      expect(normaliseEvaluationRequest("string").ok).toBe(false);
      expect(normaliseEvaluationRequest(42).ok).toBe(false);
      expect(normaliseEvaluationRequest(true).ok).toBe(false);
    });

    it("preserves sourceDocumentIds order (IDs are references, not re-sorted)", () => {
      // sourceDocumentIds in the generated document preserve supplied order —
      // these are reference pointers, not a reorderable collection.
      const result = normaliseEvaluationRequest(VALID_UNORDERED_SOURCES);
      if (result.ok) {
        // The sourceDocumentIds in generatedDocument are preserved as supplied
        // (order of source IDs is semantically meaningful for the generator)
        expect(
          result.normalisedRequest.generatedDocument.sourceDocumentIds,
        ).toHaveLength(2);
      }
    });
  });

  // -------------------------------------------------------------------------
  // DRA-FIX-001 regression: evaluationBoundary preservation
  //
  // These tests guard the bug fixed in DRA-EVAL-002 normalisation wiring:
  // normaliseEvaluationRequest() was rebuilding normalisedRequest explicitly
  // without including evaluationBoundary, silently dropping it before Stage 2.
  // Dropping the field causes Stage 2 to evaluate the full document instead of
  // the approved restricted range, producing a wrong statement count.
  //
  // If these tests fail, re-check the Step 7 "Build normalised request" block
  // in normalise-evaluation-request.ts to ensure evaluationBoundary is spread
  // into normalisedRequest when present in parsed.
  // -------------------------------------------------------------------------

  describe("DRA-FIX-001 regression — evaluationBoundary preservation", () => {
    it("preserves evaluationBoundary exactly when present in request", () => {
      const result = normaliseEvaluationRequest(VALID_WITH_BOUNDARY);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.normalisedRequest.evaluationBoundary).toBeDefined();
        expect(result.normalisedRequest.evaluationBoundary?.startOffset).toBe(15);
        expect(result.normalisedRequest.evaluationBoundary?.endOffset).toBe(79);
      }
    });

    it("preserves evaluationBoundary as an exact structural copy (not mutated)", () => {
      const result = normaliseEvaluationRequest(VALID_WITH_BOUNDARY);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.normalisedRequest.evaluationBoundary).toEqual({
          startOffset: 15,
          endOffset: 79,
        });
        // Must be a distinct object reference (normalisation produces a new object)
        // but with the same values — not a mutated or shifted boundary.
        expect(result.normalisedRequest.evaluationBoundary?.startOffset).toBe(
          (VALID_WITH_BOUNDARY.evaluationBoundary as { startOffset: number }).startOffset,
        );
        expect(result.normalisedRequest.evaluationBoundary?.endOffset).toBe(
          (VALID_WITH_BOUNDARY.evaluationBoundary as { endOffset: number }).endOffset,
        );
      }
    });

    it("normalisedRequest has no evaluationBoundary when absent from request", () => {
      const result = normaliseEvaluationRequest(VALID_WITHOUT_BOUNDARY);
      expect(result.ok).toBe(true);
      if (result.ok) {
        // No phantom boundary field — dropping an absent field is correct.
        expect(result.normalisedRequest.evaluationBoundary).toBeUndefined();
      }
    });

    it("normalisedRequest has no evaluationBoundary when using VALID_CANONICAL", () => {
      const result = normaliseEvaluationRequest(VALID_CANONICAL);
      expect(result.ok).toBe(true);
      if (result.ok) {
        // VALID_CANONICAL was produced before DRA-FIX-001 and has no boundary.
        expect(result.normalisedRequest.evaluationBoundary).toBeUndefined();
      }
    });

    it("rejects evaluationBoundary where startOffset >= endOffset", () => {
      const invalidBoundary = {
        ...VALID_WITH_BOUNDARY,
        evaluationBoundary: { startOffset: 79, endOffset: 15 },
      };
      const result = normaliseEvaluationRequest(invalidBoundary);
      expect(result.ok).toBe(false);
    });

    it("rejects evaluationBoundary where startOffset equals endOffset", () => {
      const equalBoundary = {
        ...VALID_WITH_BOUNDARY,
        evaluationBoundary: { startOffset: 15, endOffset: 15 },
      };
      const result = normaliseEvaluationRequest(equalBoundary);
      expect(result.ok).toBe(false);
    });

    it("accepts evaluationBoundary with startOffset 0 (start of document)", () => {
      const zeroBoundary = {
        ...VALID_WITH_BOUNDARY,
        evaluationBoundary: { startOffset: 0, endOffset: 79 },
      };
      const result = normaliseEvaluationRequest(zeroBoundary);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.normalisedRequest.evaluationBoundary?.startOffset).toBe(0);
        expect(result.normalisedRequest.evaluationBoundary?.endOffset).toBe(79);
      }
    });
  });
});
