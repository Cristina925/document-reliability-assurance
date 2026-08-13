/**
 * DRA-ENG-004 — extractClaims Tests
 *
 * Main Stage 2 integration tests covering all fixture scenarios.
 */

import { describe, it, expect } from "vitest";
import { extractClaims } from "../../claim-extraction/extract-claims.js";
import { STAGE_2_ID, STAGE_2_VERSION } from "../../claim-extraction/extraction-result.js";
import { EXTRACTION_RULE_VERSION } from "../../claim-extraction/extract-claims.js";
import { DRA_MODEL_VERSION, DRA_PIPELINE_VERSION } from "../../model/index.js";
import {
  FIXTURE_SIMPLE_CLAIM,
  FIXTURE_SIMPLE_CLAIM_EXPECTED_TEXT,
  FIXTURE_MULTI_CLAIM_PARAGRAPH,
  FIXTURE_MULTI_CLAIM_PARAGRAPH_EXPECTED_TEXTS,
  FIXTURE_MULTI_PARAGRAPH,
  FIXTURE_MULTI_PARAGRAPH_EXPECTED_TEXTS,
  FIXTURE_BULLET_LIST,
  FIXTURE_BULLET_LIST_EXPECTED_TEXTS,
  FIXTURE_NUMBERED_LIST,
  FIXTURE_NUMBERED_LIST_EXPECTED_TEXTS,
  FIXTURE_HEADING_THEN_CLAIMS,
  FIXTURE_HEADING_THEN_CLAIMS_EXPECTED_TEXTS,
  FIXTURE_REPEATED_TEXT,
  FIXTURE_REPEATED_TEXT_REPEATED_PHRASE,
  FIXTURE_DECIMAL_NUMBERS,
  FIXTURE_DECIMAL_NUMBERS_EXPECTED_MIN_STATEMENTS,
  FIXTURE_ABBREVIATIONS,
  FIXTURE_ABBREVIATIONS_EXPECTED_STATEMENT_COUNT,
  FIXTURE_DATES,
  FIXTURE_DATES_EXPECTED_STATEMENT_COUNT,
  FIXTURE_QUOTED_CLAIMS,
  FIXTURE_QUOTED_CLAIMS_EXPECTED_MIN_STATEMENTS,
  FIXTURE_QUESTIONS,
  FIXTURE_COMMANDS,
  FIXTURE_COMMANDS_EXPECTED_STATEMENT_COUNT,
  FIXTURE_ALREADY_NORMALISED,
  FIXTURE_MIXED_PUNCTUATION,
  FIXTURE_MIXED_PUNCTUATION_EXPECTED_MIN_STATEMENTS,
  FIXTURE_LONG_DOCUMENT,
  FIXTURE_LONG_DOCUMENT_EXPECTED_MIN_STATEMENTS,
  FIXTURE_ZERO_CLAIMS,
  FIXTURE_ZERO_CLAIMS_EXPECTED_COUNT,
  FIXTURE_UNICODE,
  FIXTURE_NON_ENGLISH,
  FIXTURE_NON_ENGLISH_EXPECTED_MIN_STATEMENTS,
} from "../../fixtures/claim-extraction/valid.js";
import {
  FIXTURE_PUNCTUATION_ONLY,
  FIXTURE_PUNCTUATION_ONLY_EXPECTED_COUNT,
  FIXTURE_WHITESPACE_ONLY,
  FIXTURE_WHITESPACE_ONLY_EXPECTED_COUNT,
  FIXTURE_NO_DUPLICATE_SPANS,
  FIXTURE_NO_DUPLICATE_SPANS_EXPECTED_COUNT,
  FIXTURE_ID_COLLISION_CHECK,
  FIXTURE_ID_COLLISION_SAME_TEXT,
  FIXTURE_INVALID_NULL,
  FIXTURE_INVALID_UNDEFINED,
  FIXTURE_INVALID_STRING,
  FIXTURE_INVALID_NUMBER,
  FIXTURE_EXACT_SPAN,
  FIXTURE_EXACT_SPAN_EXPECTED,
  FIXTURE_EMPTY_CONTENT,
  FIXTURE_SINGLE_WORD,
  FIXTURE_HORIZONTAL_RULE_ONLY,
  FIXTURE_TRAILING_NEWLINE,
  FIXTURE_MIXED_STRUCTURE,
} from "../../fixtures/claim-extraction/edge-cases.js";

describe("DRA-ENG-004 extractClaims", () => {
  // -------------------------------------------------------------------------
  // Basic success
  // -------------------------------------------------------------------------

  describe("successful extraction from valid Stage 1 output", () => {
    it("returns ok: true for simple valid input", () => {
      const result = extractClaims(FIXTURE_SIMPLE_CLAIM);
      expect(result.ok).toBe(true);
    });

    it("result carries exact Stage 2 identifier", () => {
      const result = extractClaims(FIXTURE_SIMPLE_CLAIM);
      expect(result.stageId).toBe(STAGE_2_ID);
      expect(result.stageId).toBe("STAGE_2_CLAIM_EXTRACTION");
    });

    it("result carries exact pipeline version", () => {
      const result = extractClaims(FIXTURE_SIMPLE_CLAIM);
      if (result.ok) {
        expect(result.pipelineVersion).toBe(DRA_PIPELINE_VERSION);
        expect(result.pipelineVersion).toBe("1.0");
      }
    });

    it("result carries exact model version", () => {
      const result = extractClaims(FIXTURE_SIMPLE_CLAIM);
      if (result.ok) {
        expect(result.modelVersion).toBe(DRA_MODEL_VERSION);
        expect(result.modelVersion).toBe("0.1.0");
      }
    });

    it("result carries evaluationId", () => {
      const result = extractClaims(FIXTURE_SIMPLE_CLAIM);
      if (result.ok) {
        expect(result.evaluationId).toBe("eval-001");
      }
    });

    it("result carries generatedDocumentId", () => {
      const result = extractClaims(FIXTURE_SIMPLE_CLAIM);
      if (result.ok) {
        expect(result.generatedDocumentId).toBe("gen-001");
      }
    });
  });

  // -------------------------------------------------------------------------
  // Fixture 1: Simple declarative claim
  // -------------------------------------------------------------------------

  describe("Fixture 1: simple declarative claim", () => {
    it("extracts exactly one statement", () => {
      const result = extractClaims(FIXTURE_SIMPLE_CLAIM);
      if (result.ok) {
        expect(result.statements).toHaveLength(1);
      }
    });

    it("extracted statement text matches expected", () => {
      const result = extractClaims(FIXTURE_SIMPLE_CLAIM);
      if (result.ok) {
        expect(result.statements[0]?.text).toBe(FIXTURE_SIMPLE_CLAIM_EXPECTED_TEXT);
      }
    });

    it("statement has statementIndex 0", () => {
      const result = extractClaims(FIXTURE_SIMPLE_CLAIM);
      if (result.ok) {
        expect(result.statements[0]?.statementIndex).toBe(0);
      }
    });

    it("statement has a spanRef", () => {
      const result = extractClaims(FIXTURE_SIMPLE_CLAIM);
      if (result.ok) {
        expect(result.statements[0]?.spanRef).toBeDefined();
      }
    });

    it("span integrity: content.slice(start, end) === text", () => {
      const result = extractClaims(FIXTURE_SIMPLE_CLAIM);
      if (result.ok) {
        const stmt = result.statements[0]!;
        const content = FIXTURE_SIMPLE_CLAIM.generatedDocument.content;
        const span = stmt.spanRef!;
        expect(content.slice(span.startOffset!, span.endOffset!)).toBe(stmt.text);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Fixture 2: Multiple claims in one paragraph
  // -------------------------------------------------------------------------

  describe("Fixture 2: multiple claims in one paragraph", () => {
    it("extracts the correct number of statements", () => {
      const result = extractClaims(FIXTURE_MULTI_CLAIM_PARAGRAPH);
      if (result.ok) {
        expect(result.statements.length).toBeGreaterThanOrEqual(
          FIXTURE_MULTI_CLAIM_PARAGRAPH_EXPECTED_TEXTS.length,
        );
      }
    });

    it("all expected texts are present in extraction", () => {
      const result = extractClaims(FIXTURE_MULTI_CLAIM_PARAGRAPH);
      if (result.ok) {
        const texts = result.statements.map((s) => s.text);
        for (const expected of FIXTURE_MULTI_CLAIM_PARAGRAPH_EXPECTED_TEXTS) {
          expect(texts).toContain(expected);
        }
      }
    });

    it("statements are ordered by statementIndex ascending", () => {
      const result = extractClaims(FIXTURE_MULTI_CLAIM_PARAGRAPH);
      if (result.ok) {
        const indices = result.statements.map((s) => s.statementIndex);
        for (let i = 1; i < indices.length; i++) {
          expect(indices[i]!).toBeGreaterThan(indices[i - 1]!);
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // Fixture 3: Multiple paragraphs
  // -------------------------------------------------------------------------

  describe("Fixture 3: multiple paragraphs", () => {
    it("extracts claims from all paragraphs", () => {
      const result = extractClaims(FIXTURE_MULTI_PARAGRAPH);
      if (result.ok) {
        const texts = result.statements.map((s) => s.text);
        for (const expected of FIXTURE_MULTI_PARAGRAPH_EXPECTED_TEXTS) {
          expect(texts).toContain(expected);
        }
      }
    });

    it("statement order matches document order", () => {
      const result = extractClaims(FIXTURE_MULTI_PARAGRAPH);
      if (result.ok) {
        const spans = result.statements.map((s) => s.spanRef?.startOffset ?? 0);
        for (let i = 1; i < spans.length; i++) {
          expect(spans[i]!).toBeGreaterThan(spans[i - 1]!);
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // Fixture 4: Bullet-list claims
  // -------------------------------------------------------------------------

  describe("Fixture 4: bullet-list claims", () => {
    it("extracts bullet items as candidate statements", () => {
      const result = extractClaims(FIXTURE_BULLET_LIST);
      if (result.ok) {
        const texts = result.statements.map((s) => s.text);
        for (const expected of FIXTURE_BULLET_LIST_EXPECTED_TEXTS) {
          expect(texts).toContain(expected);
        }
      }
    });

    it("bullet marker (- ) is not included in statement text", () => {
      const result = extractClaims(FIXTURE_BULLET_LIST);
      if (result.ok) {
        for (const stmt of result.statements) {
          expect(stmt.text).not.toMatch(/^[-*•·]\s/);
        }
      }
    });

    it("span integrity holds for bullet items", () => {
      const result = extractClaims(FIXTURE_BULLET_LIST);
      if (result.ok) {
        const content = FIXTURE_BULLET_LIST.generatedDocument.content;
        for (const stmt of result.statements) {
          if (stmt.spanRef?.startOffset !== undefined && stmt.spanRef?.endOffset !== undefined) {
            expect(content.slice(stmt.spanRef.startOffset, stmt.spanRef.endOffset)).toBe(
              stmt.text,
            );
          }
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // Fixture 5: Numbered-list claims
  // -------------------------------------------------------------------------

  describe("Fixture 5: numbered-list claims", () => {
    it("extracts numbered items as candidate statements", () => {
      const result = extractClaims(FIXTURE_NUMBERED_LIST);
      if (result.ok) {
        const texts = result.statements.map((s) => s.text);
        for (const expected of FIXTURE_NUMBERED_LIST_EXPECTED_TEXTS) {
          expect(texts).toContain(expected);
        }
      }
    });

    it("numbered list marker (1. ) is not included in statement text", () => {
      const result = extractClaims(FIXTURE_NUMBERED_LIST);
      if (result.ok) {
        for (const stmt of result.statements) {
          expect(stmt.text).not.toMatch(/^\d+[.)]\s/);
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // Fixture 6: Headings followed by claims
  // -------------------------------------------------------------------------

  describe("Fixture 6: headings followed by claims", () => {
    it("headings are excluded, body claims are extracted", () => {
      const result = extractClaims(FIXTURE_HEADING_THEN_CLAIMS);
      if (result.ok) {
        const texts = result.statements.map((s) => s.text);
        for (const expected of FIXTURE_HEADING_THEN_CLAIMS_EXPECTED_TEXTS) {
          expect(texts).toContain(expected);
        }
      }
    });

    it("heading text (# ...) is not extracted as a candidate", () => {
      const result = extractClaims(FIXTURE_HEADING_THEN_CLAIMS);
      if (result.ok) {
        for (const stmt of result.statements) {
          expect(stmt.text).not.toMatch(/^#/);
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // Fixture 7: Repeated identical text at different positions
  // -------------------------------------------------------------------------

  describe("Fixture 7: repeated identical text at different positions", () => {
    it("extracts both occurrences as separate statements", () => {
      const result = extractClaims(FIXTURE_REPEATED_TEXT);
      if (result.ok) {
        const matchingTexts = result.statements.filter(
          (s) => s.text === FIXTURE_REPEATED_TEXT_REPEATED_PHRASE,
        );
        expect(matchingTexts.length).toBeGreaterThanOrEqual(2);
      }
    });

    it("repeated text at different positions produces distinct statement IDs", () => {
      const result = extractClaims(FIXTURE_REPEATED_TEXT);
      if (result.ok) {
        const matchingStmts = result.statements.filter(
          (s) => s.text === FIXTURE_REPEATED_TEXT_REPEATED_PHRASE,
        );
        if (matchingStmts.length >= 2) {
          expect(matchingStmts[0]!.id).not.toBe(matchingStmts[1]!.id);
        }
      }
    });

    it("distinct statement IDs encode distinct character offsets", () => {
      const result = extractClaims(FIXTURE_REPEATED_TEXT);
      if (result.ok) {
        const matchingStmts = result.statements.filter(
          (s) => s.text === FIXTURE_REPEATED_TEXT_REPEATED_PHRASE,
        );
        if (matchingStmts.length >= 2) {
          expect(matchingStmts[0]!.spanRef?.startOffset).not.toBe(
            matchingStmts[1]!.spanRef?.startOffset,
          );
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // Fixture 8: Decimal numbers
  // -------------------------------------------------------------------------

  describe("Fixture 8: decimal numbers", () => {
    it("does not produce false splits at decimal points", () => {
      const result = extractClaims(FIXTURE_DECIMAL_NUMBERS);
      if (result.ok) {
        expect(result.statements.length).toBeGreaterThanOrEqual(
          FIXTURE_DECIMAL_NUMBERS_EXPECTED_MIN_STATEMENTS,
        );
        // None of the statements should start with a digit (indicating a split mid-decimal)
        for (const stmt of result.statements) {
          expect(stmt.text).not.toMatch(/^\d/); // Should not start with a bare digit
        }
      }
    });

    it("decimal numbers are preserved within statement text", () => {
      const result = extractClaims(FIXTURE_DECIMAL_NUMBERS);
      if (result.ok) {
        const allText = result.statements.map((s) => s.text).join(" ");
        expect(allText).toContain("99.9%");
        expect(allText).toContain("3.14");
      }
    });
  });

  // -------------------------------------------------------------------------
  // Fixture 9: Abbreviations
  // -------------------------------------------------------------------------

  describe("Fixture 9: abbreviations", () => {
    it("does not produce false splits at abbreviation periods", () => {
      const result = extractClaims(FIXTURE_ABBREVIATIONS);
      if (result.ok) {
        expect(result.statements).toHaveLength(
          FIXTURE_ABBREVIATIONS_EXPECTED_STATEMENT_COUNT,
        );
      }
    });
  });

  // -------------------------------------------------------------------------
  // Fixture 10: Dates
  // -------------------------------------------------------------------------

  describe("Fixture 10: dates", () => {
    it("does not produce false splits at date abbreviation periods", () => {
      const result = extractClaims(FIXTURE_DATES);
      if (result.ok) {
        expect(result.statements).toHaveLength(FIXTURE_DATES_EXPECTED_STATEMENT_COUNT);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Fixture 11: Quoted claims
  // -------------------------------------------------------------------------

  describe("Fixture 11: quoted claims", () => {
    it("includes quoted text as part of candidate claims", () => {
      const result = extractClaims(FIXTURE_QUOTED_CLAIMS);
      if (result.ok) {
        expect(result.statements.length).toBeGreaterThanOrEqual(
          FIXTURE_QUOTED_CLAIMS_EXPECTED_MIN_STATEMENTS,
        );
      }
    });
  });

  // -------------------------------------------------------------------------
  // Fixture 12: Questions
  // -------------------------------------------------------------------------

  describe("Fixture 12: questions", () => {
    it("includes questions as candidate claims (conservative implementation choice)", () => {
      const result = extractClaims(FIXTURE_QUESTIONS);
      if (result.ok) {
        const hasQuestion = result.statements.some((s) => s.text.endsWith("?"));
        expect(hasQuestion).toBe(true);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Fixture 13: Commands
  // -------------------------------------------------------------------------

  describe("Fixture 13: commands/imperatives", () => {
    it("includes imperative sentences as candidate claims", () => {
      const result = extractClaims(FIXTURE_COMMANDS);
      if (result.ok) {
        expect(result.statements).toHaveLength(FIXTURE_COMMANDS_EXPECTED_STATEMENT_COUNT);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Fixture 14: Punctuation-only content
  // -------------------------------------------------------------------------

  describe("Fixture 14: punctuation-only content", () => {
    it("returns success with zero candidates for punctuation-only content", () => {
      const result = extractClaims(FIXTURE_PUNCTUATION_ONLY);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.statements).toHaveLength(FIXTURE_PUNCTUATION_ONLY_EXPECTED_COUNT);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Fixture 15: Whitespace-only content
  // -------------------------------------------------------------------------

  describe("Fixture 15: whitespace-only content", () => {
    it("returns success with zero candidates for whitespace-only content", () => {
      const result = extractClaims(FIXTURE_WHITESPACE_ONLY);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.statements).toHaveLength(FIXTURE_WHITESPACE_ONLY_EXPECTED_COUNT);
      }
    });

    it("does not use SUPPORTED, REVIEW, or HOLD for zero-claim result", () => {
      const result = extractClaims(FIXTURE_WHITESPACE_ONLY);
      const json = JSON.stringify(result);
      expect(json).not.toContain('"SUPPORTED"');
      expect(json).not.toContain('"REVIEW"');
      expect(json).not.toContain('"HOLD"');
    });
  });

  // -------------------------------------------------------------------------
  // Fixture 16: Already-normalised (LF only)
  // -------------------------------------------------------------------------

  describe("Fixture 16: already-normalised content", () => {
    it("handles LF-only content without errors", () => {
      const result = extractClaims(FIXTURE_ALREADY_NORMALISED);
      expect(result.ok).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Fixture 17: Mixed punctuation
  // -------------------------------------------------------------------------

  describe("Fixture 17: mixed punctuation", () => {
    it("handles ! and ? as sentence boundaries", () => {
      const result = extractClaims(FIXTURE_MIXED_PUNCTUATION);
      if (result.ok) {
        expect(result.statements.length).toBeGreaterThanOrEqual(
          FIXTURE_MIXED_PUNCTUATION_EXPECTED_MIN_STATEMENTS,
        );
      }
    });
  });

  // -------------------------------------------------------------------------
  // Fixture 18: No duplicate spans
  // -------------------------------------------------------------------------

  describe("Fixture 18: no duplicate spans", () => {
    it("produces distinct statements with no duplicate IDs", () => {
      const result = extractClaims(FIXTURE_NO_DUPLICATE_SPANS);
      if (result.ok) {
        expect(result.statements).toHaveLength(FIXTURE_NO_DUPLICATE_SPANS_EXPECTED_COUNT);
        const ids = result.statements.map((s) => s.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Fixture 19: Long document
  // -------------------------------------------------------------------------

  describe("Fixture 19: long synthetic document", () => {
    it("extracts statements from a long document without errors", () => {
      const result = extractClaims(FIXTURE_LONG_DOCUMENT);
      expect(result.ok).toBe(true);
    });

    it("extracts at least the expected minimum statement count", () => {
      const result = extractClaims(FIXTURE_LONG_DOCUMENT);
      if (result.ok) {
        expect(result.statements.length).toBeGreaterThanOrEqual(
          FIXTURE_LONG_DOCUMENT_EXPECTED_MIN_STATEMENTS,
        );
      }
    });

    it("all statement IDs are unique in a long document", () => {
      const result = extractClaims(FIXTURE_LONG_DOCUMENT);
      if (result.ok) {
        const ids = result.statements.map((s) => String(s.id));
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
      }
    });

    it("span integrity holds for all statements in a long document", () => {
      const result = extractClaims(FIXTURE_LONG_DOCUMENT);
      if (result.ok) {
        const content = FIXTURE_LONG_DOCUMENT.generatedDocument.content;
        for (const stmt of result.statements) {
          if (stmt.spanRef?.startOffset !== undefined && stmt.spanRef?.endOffset !== undefined) {
            expect(content.slice(stmt.spanRef.startOffset, stmt.spanRef.endOffset)).toBe(
              stmt.text,
            );
          }
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // Fixture 20: Zero candidate statements
  // -------------------------------------------------------------------------

  describe("Fixture 20: zero candidate statements", () => {
    it("returns success with empty statements array for heading-only content", () => {
      const result = extractClaims(FIXTURE_ZERO_CLAIMS);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.statements).toHaveLength(FIXTURE_ZERO_CLAIMS_EXPECTED_COUNT);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Fixture 21: Statement ID uniqueness for same text at different positions
  // -------------------------------------------------------------------------

  describe("Fixture 21: distinct IDs for identical text at different spans", () => {
    it("produces distinct IDs for identical text at different character offsets", () => {
      const result = extractClaims(FIXTURE_ID_COLLISION_CHECK);
      if (result.ok) {
        const sameTextStmts = result.statements.filter(
          (s) => s.text === FIXTURE_ID_COLLISION_SAME_TEXT,
        );
        expect(sameTextStmts.length).toBeGreaterThanOrEqual(2);
        if (sameTextStmts.length >= 2) {
          expect(sameTextStmts[0]!.id).not.toBe(sameTextStmts[1]!.id);
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // Fixture 22: Invalid input
  // -------------------------------------------------------------------------

  describe("Fixture 22: invalid input handling", () => {
    it("returns failure for null input", () => {
      const result = extractClaims(FIXTURE_INVALID_NULL as never);
      expect(result.ok).toBe(false);
    });

    it("does not throw for null input", () => {
      expect(() => extractClaims(FIXTURE_INVALID_NULL as never)).not.toThrow();
    });

    it("returns failure for undefined input", () => {
      const result = extractClaims(FIXTURE_INVALID_UNDEFINED as never);
      expect(result.ok).toBe(false);
    });

    it("does not throw for undefined input", () => {
      expect(() => extractClaims(FIXTURE_INVALID_UNDEFINED as never)).not.toThrow();
    });

    it("returns failure for string input", () => {
      const result = extractClaims(FIXTURE_INVALID_STRING as never);
      expect(result.ok).toBe(false);
    });

    it("returns failure for number input", () => {
      const result = extractClaims(FIXTURE_INVALID_NUMBER as never);
      expect(result.ok).toBe(false);
    });

    it("failure result carries Stage 2 stageId", () => {
      const result = extractClaims(FIXTURE_INVALID_NULL as never);
      expect(result.stageId).toBe(STAGE_2_ID);
    });

    it("failure result has errorCount matching errors.length", () => {
      const result = extractClaims(FIXTURE_INVALID_NULL as never);
      if (!result.ok) {
        expect(result.errorCount).toBe(result.errors.length);
      }
    });

    it("errors are sorted deterministically (by path then code)", () => {
      const result = extractClaims(FIXTURE_INVALID_NULL as never);
      if (!result.ok) {
        const paths = result.errors.map((e) => e.path);
        const sorted = [...paths].sort((a, b) => a.localeCompare(b));
        expect(paths).toStrictEqual(sorted);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Fixture 23: Exact span integrity
  // -------------------------------------------------------------------------

  describe("Fixture 23: exact span integrity cases", () => {
    it("ABC. DEF. GHI. — correct spans for each sentence", () => {
      const result = extractClaims(FIXTURE_EXACT_SPAN);
      if (result.ok) {
        const content = FIXTURE_EXACT_SPAN.generatedDocument.content;
        for (const stmt of result.statements) {
          const span = stmt.spanRef!;
          expect(span).toBeDefined();
          expect(content.slice(span.startOffset!, span.endOffset!)).toBe(stmt.text);
        }
        // All expected texts should be present
        const texts = result.statements.map((s) => s.text);
        for (const expected of FIXTURE_EXACT_SPAN_EXPECTED) {
          expect(texts).toContain(expected.text);
        }
        // Check specific offsets for each expected segment
        for (const expected of FIXTURE_EXACT_SPAN_EXPECTED) {
          const stmt = result.statements.find((s) => s.text === expected.text);
          if (stmt) {
            expect(stmt.spanRef?.startOffset).toBe(expected.startOffset);
            expect(stmt.spanRef?.endOffset).toBe(expected.endOffset);
          }
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // Fixture 24: Unicode
  // -------------------------------------------------------------------------

  describe("Fixture 24: Unicode text", () => {
    it("handles Unicode text without errors", () => {
      const result = extractClaims(FIXTURE_UNICODE);
      expect(result.ok).toBe(true);
    });

    it("span integrity holds for Unicode content", () => {
      const result = extractClaims(FIXTURE_UNICODE);
      if (result.ok) {
        const content = FIXTURE_UNICODE.generatedDocument.content;
        for (const stmt of result.statements) {
          if (stmt.spanRef?.startOffset !== undefined && stmt.spanRef?.endOffset !== undefined) {
            expect(content.slice(stmt.spanRef.startOffset, stmt.spanRef.endOffset)).toBe(
              stmt.text,
            );
          }
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // Fixture 25: Non-English text
  // -------------------------------------------------------------------------

  describe("Fixture 25: non-English text", () => {
    it("handles non-English text deterministically without errors", () => {
      const result = extractClaims(FIXTURE_NON_ENGLISH);
      expect(result.ok).toBe(true);
    });

    it("extracts at least the expected minimum statements from non-English text", () => {
      const result = extractClaims(FIXTURE_NON_ENGLISH);
      if (result.ok) {
        expect(result.statements.length).toBeGreaterThanOrEqual(
          FIXTURE_NON_ENGLISH_EXPECTED_MIN_STATEMENTS,
        );
      }
    });
  });

  // -------------------------------------------------------------------------
  // Determinism
  // -------------------------------------------------------------------------

  describe("determinism — repeated extraction", () => {
    it("same input produces deeply equal output when extracted twice", () => {
      const result1 = extractClaims(FIXTURE_MULTI_PARAGRAPH);
      const result2 = extractClaims(FIXTURE_MULTI_PARAGRAPH);
      expect(result1.ok).toBe(true);
      expect(result2.ok).toBe(true);
      if (result1.ok && result2.ok) {
        expect(result1.statements).toStrictEqual(result2.statements);
        expect(result1.extractionRecord).toStrictEqual(result2.extractionRecord);
      }
    });

    it("identical texts produce identical IDs on repeated extraction", () => {
      const r1 = extractClaims(FIXTURE_SIMPLE_CLAIM);
      const r2 = extractClaims(FIXTURE_SIMPLE_CLAIM);
      if (r1.ok && r2.ok) {
        expect(r1.statements[0]?.id).toBe(r2.statements[0]?.id);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Statement ordering
  // -------------------------------------------------------------------------

  describe("deterministic statement ordering", () => {
    it("statements are ordered by statementIndex ascending", () => {
      const result = extractClaims(FIXTURE_LONG_DOCUMENT);
      if (result.ok) {
        const indices = result.statements.map((s) => s.statementIndex);
        for (let i = 1; i < indices.length; i++) {
          expect(indices[i]!).toBeGreaterThan(indices[i - 1]!);
        }
      }
    });

    it("statement startOffsets are strictly increasing (document order)", () => {
      const result = extractClaims(FIXTURE_MULTI_PARAGRAPH);
      if (result.ok) {
        const offsets = result.statements.map((s) => s.spanRef?.startOffset ?? -1);
        for (let i = 1; i < offsets.length; i++) {
          expect(offsets[i]!).toBeGreaterThan(offsets[i - 1]!);
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // Stable identifiers
  // -------------------------------------------------------------------------

  describe("stable identifiers", () => {
    it("statement IDs start with the Stage 2 prefix 's2:'", () => {
      const result = extractClaims(FIXTURE_MULTI_CLAIM_PARAGRAPH);
      if (result.ok) {
        for (const stmt of result.statements) {
          expect(String(stmt.id)).toMatch(/^s2:/);
        }
      }
    });

    it("all statement IDs are unique within one extraction", () => {
      const result = extractClaims(FIXTURE_LONG_DOCUMENT);
      if (result.ok) {
        const ids = result.statements.map((s) => String(s.id));
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
      }
    });

    it("IDs do not contain wall-clock time", () => {
      const result = extractClaims(FIXTURE_SIMPLE_CLAIM);
      if (result.ok) {
        for (const stmt of result.statements) {
          // Verify ID matches the s2:{start}:{end} pattern
          expect(String(stmt.id)).toMatch(/^s2:\d+:\d+$/);
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // Span invariants
  // -------------------------------------------------------------------------

  describe("span invariants — no negative or out-of-range spans", () => {
    it("all spans have non-negative startOffset", () => {
      const result = extractClaims(FIXTURE_LONG_DOCUMENT);
      if (result.ok) {
        for (const stmt of result.statements) {
          expect(stmt.spanRef?.startOffset).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it("all spans have endOffset > startOffset", () => {
      const result = extractClaims(FIXTURE_LONG_DOCUMENT);
      if (result.ok) {
        for (const stmt of result.statements) {
          expect(stmt.spanRef?.endOffset).toBeGreaterThan(
            stmt.spanRef?.startOffset ?? -1,
          );
        }
      }
    });

    it("all spans have endOffset within document bounds", () => {
      const result = extractClaims(FIXTURE_LONG_DOCUMENT);
      if (result.ok) {
        const docLen = FIXTURE_LONG_DOCUMENT.generatedDocument.content.length;
        for (const stmt of result.statements) {
          expect(stmt.spanRef?.endOffset).toBeLessThanOrEqual(docLen);
        }
      }
    });

    it("span text matches document content slice for all statements", () => {
      const result = extractClaims(FIXTURE_MULTI_PARAGRAPH);
      if (result.ok) {
        const content = FIXTURE_MULTI_PARAGRAPH.generatedDocument.content;
        for (const stmt of result.statements) {
          if (stmt.spanRef?.startOffset !== undefined && stmt.spanRef?.endOffset !== undefined) {
            expect(content.slice(stmt.spanRef.startOffset, stmt.spanRef.endOffset)).toBe(
              stmt.text,
            );
          }
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // Output immutability
  // -------------------------------------------------------------------------

  describe("output immutability", () => {
    it("input mutation after extraction does not alter the result", () => {
      const input = JSON.parse(
        JSON.stringify(FIXTURE_MULTI_CLAIM_PARAGRAPH),
      ) as typeof FIXTURE_MULTI_CLAIM_PARAGRAPH;
      const result = extractClaims(input);

      // Mutate the input after extraction
      (input as Record<string, unknown>)["id"] = "mutated-id";
      input.generatedDocument.content = "MUTATED CONTENT";

      // Result should be unchanged
      if (result.ok) {
        expect(result.evaluationId).toBe("eval-002");
        expect(result.statements[0]?.text).toBe(
          FIXTURE_MULTI_CLAIM_PARAGRAPH_EXPECTED_TEXTS[0],
        );
      }
    });
  });

  // -------------------------------------------------------------------------
  // Extraction record
  // -------------------------------------------------------------------------

  describe("extraction record", () => {
    it("extraction record carries Stage 2 stageId", () => {
      const result = extractClaims(FIXTURE_SIMPLE_CLAIM);
      if (result.ok) {
        expect(result.extractionRecord.stageId).toBe(STAGE_2_ID);
      }
    });

    it("extraction record carries stageVersion", () => {
      const result = extractClaims(FIXTURE_SIMPLE_CLAIM);
      if (result.ok) {
        expect(result.extractionRecord.stageVersion).toBe(STAGE_2_VERSION);
      }
    });

    it("extraction record carries extractionRuleVersion", () => {
      const result = extractClaims(FIXTURE_SIMPLE_CLAIM);
      if (result.ok) {
        expect(result.extractionRecord.extractionRuleVersion).toBe(
          EXTRACTION_RULE_VERSION,
        );
      }
    });

    it("extraction record documentLength equals content.length", () => {
      const result = extractClaims(FIXTURE_SIMPLE_CLAIM);
      if (result.ok) {
        expect(result.extractionRecord.documentLength).toBe(
          FIXTURE_SIMPLE_CLAIM.generatedDocument.content.length,
        );
      }
    });

    it("extraction record candidateStatementCount equals statements.length", () => {
      const result = extractClaims(FIXTURE_MULTI_PARAGRAPH);
      if (result.ok) {
        expect(result.extractionRecord.candidateStatementCount).toBe(
          result.statements.length,
        );
      }
    });

    it("extraction record does not contain evidence-support findings", () => {
      const result = extractClaims(FIXTURE_SIMPLE_CLAIM);
      if (result.ok) {
        const record = result.extractionRecord as unknown as Record<string, unknown>;
        expect(record["evidenceSupport"]).toBeUndefined();
        expect(record["contradictions"]).toBeUndefined();
        expect(record["issueRegister"]).toBeUndefined();
      }
    });
  });

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------

  describe("edge cases", () => {
    it("returns success for single-word content", () => {
      const result = extractClaims(FIXTURE_SINGLE_WORD);
      expect(result.ok).toBe(true);
    });

    it("returns success for horizontal-rule-only content", () => {
      const result = extractClaims(FIXTURE_HORIZONTAL_RULE_ONLY);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.statements.length).toBe(0);
      }
    });

    it("returns success for content with trailing newline", () => {
      const result = extractClaims(FIXTURE_TRAILING_NEWLINE);
      expect(result.ok).toBe(true);
    });

    it("span integrity holds for trailing-newline content", () => {
      const result = extractClaims(FIXTURE_TRAILING_NEWLINE);
      if (result.ok) {
        const content = FIXTURE_TRAILING_NEWLINE.generatedDocument.content;
        for (const stmt of result.statements) {
          if (stmt.spanRef?.startOffset !== undefined && stmt.spanRef?.endOffset !== undefined) {
            expect(content.slice(stmt.spanRef.startOffset, stmt.spanRef.endOffset)).toBe(
              stmt.text,
            );
          }
        }
      }
    });

    it("mixed structure (bullets + sentences) is handled correctly", () => {
      const result = extractClaims(FIXTURE_MIXED_STRUCTURE);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.statements.length).toBeGreaterThan(0);
      }
    });

    it("empty-content document (single space) returns zero statements", () => {
      const result = extractClaims(FIXTURE_EMPTY_CONTENT);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.statements).toHaveLength(0);
      }
    });
  });

  // -------------------------------------------------------------------------
  // linkedEvidenceUnitIds is empty at Stage 2
  // -------------------------------------------------------------------------

  describe("no evidence mapping at Stage 2", () => {
    it("all statements have empty linkedEvidenceUnitIds at Stage 2", () => {
      const result = extractClaims(FIXTURE_MULTI_PARAGRAPH);
      if (result.ok) {
        for (const stmt of result.statements) {
          expect(stmt.linkedEvidenceUnitIds).toStrictEqual([]);
        }
      }
    });
  });
});
