/**
 * DRA-001 — Stage 2 Valid Claim Extraction Fixtures
 *
 * Milestone: DRA-ENG-004 — Claim Extraction
 *
 * Deterministic synthetic fixtures for valid Stage 2 input.
 * All content is synthetic and non-sensitive.
 *
 * Fixture index:
 *   1.  FIXTURE_SIMPLE_CLAIM          — one simple declarative claim
 *   2.  FIXTURE_MULTI_CLAIM_PARAGRAPH — multiple claims in one paragraph
 *   3.  FIXTURE_MULTI_PARAGRAPH       — multiple paragraphs
 *   4.  FIXTURE_BULLET_LIST           — bullet-list claims
 *   5.  FIXTURE_NUMBERED_LIST         — numbered-list claims
 *   6.  FIXTURE_HEADING_THEN_CLAIMS   — headings followed by claims
 *   7.  FIXTURE_REPEATED_TEXT         — repeated identical text at different positions
 *   8.  FIXTURE_DECIMAL_NUMBERS       — decimal numbers (3.14, version 1.2)
 *   9.  FIXTURE_ABBREVIATIONS         — common English abbreviations
 *  10.  FIXTURE_DATES                 — date references
 *  11.  FIXTURE_QUOTED_CLAIMS         — quoted claims
 *  12.  FIXTURE_QUESTIONS             — questions
 *  13.  FIXTURE_COMMANDS              — commands/imperatives
 *  16.  FIXTURE_ALREADY_NORMALISED    — content already normalised (LF only)
 *  17.  FIXTURE_MIXED_PUNCTUATION     — mixed punctuation
 *  19.  FIXTURE_LONG_DOCUMENT         — long synthetic document for stability
 *  20.  FIXTURE_ZERO_CLAIMS           — content producing zero candidate statements
 *  24.  FIXTURE_UNICODE               — Unicode text
 *  25.  FIXTURE_NON_ENGLISH           — non-English text
 */

import type { NormalisedEvaluationRequest } from "../../normalisation/stage1-types.js";

const T_REQUESTED = "2026-07-26T10:00:00.000Z";
const T_GENERATED = "2026-07-26T09:55:00.000Z";

/** Helper to build a minimal NormalisedEvaluationRequest for Stage 2 testing. */
function makeRequest(
  id: string,
  genDocId: string,
  content: string,
  sourceDocuments: Array<{ id: string; title: string; content: string }> = [],
): NormalisedEvaluationRequest {
  return {
    id: id as NormalisedEvaluationRequest["id"],
    generatedDocument: {
      id: genDocId as NormalisedEvaluationRequest["generatedDocument"]["id"],
      title: "Test Generated Document",
      content,
      sourceDocumentIds: sourceDocuments.map((d) => d.id),
      generatedAt: T_GENERATED,
    },
    sourceDocuments: sourceDocuments.map((d) => ({
      id: d.id as unknown as NormalisedEvaluationRequest["sourceDocuments"][0]["id"],
      title: d.title,
      content: d.content,
    })),
    requestedAt: T_REQUESTED,
  };
}

// ---------------------------------------------------------------------------
// Fixture 1: One simple declarative claim
// ---------------------------------------------------------------------------

export const FIXTURE_SIMPLE_CLAIM = makeRequest(
  "eval-001",
  "gen-001",
  "ISO 27001 compliance is mandatory for all systems.",
);

export const FIXTURE_SIMPLE_CLAIM_EXPECTED_TEXT =
  "ISO 27001 compliance is mandatory for all systems.";

// ---------------------------------------------------------------------------
// Fixture 2: Multiple claims in one paragraph
// ---------------------------------------------------------------------------

export const FIXTURE_MULTI_CLAIM_PARAGRAPH = makeRequest(
  "eval-002",
  "gen-002",
  "All systems must implement access controls. Encryption at rest is required. Audit logs must be retained for 12 months.",
);

export const FIXTURE_MULTI_CLAIM_PARAGRAPH_EXPECTED_TEXTS = [
  "All systems must implement access controls.",
  "Encryption at rest is required.",
  "Audit logs must be retained for 12 months.",
];

// ---------------------------------------------------------------------------
// Fixture 3: Multiple paragraphs
// ---------------------------------------------------------------------------

export const FIXTURE_MULTI_PARAGRAPH = makeRequest(
  "eval-003",
  "gen-003",
  "ISO 27001 compliance is mandatory.\n\nAll systems must implement access controls.\n\nAudit logs must be retained for 12 months.",
);

export const FIXTURE_MULTI_PARAGRAPH_EXPECTED_TEXTS = [
  "ISO 27001 compliance is mandatory.",
  "All systems must implement access controls.",
  "Audit logs must be retained for 12 months.",
];

// ---------------------------------------------------------------------------
// Fixture 4: Bullet-list claims
// ---------------------------------------------------------------------------

export const FIXTURE_BULLET_LIST = makeRequest(
  "eval-004",
  "gen-004",
  "The system must implement the following controls:\n- Access control lists must be maintained.\n- Encryption at rest must be enabled.\n- Audit logging must be active.",
);

export const FIXTURE_BULLET_LIST_EXPECTED_TEXTS = [
  "Access control lists must be maintained.",
  "Encryption at rest must be enabled.",
  "Audit logging must be active.",
];

// ---------------------------------------------------------------------------
// Fixture 5: Numbered-list claims
// ---------------------------------------------------------------------------

export const FIXTURE_NUMBERED_LIST = makeRequest(
  "eval-005",
  "gen-005",
  "Security requirements:\n1. All data must be encrypted at rest.\n2. Access must be logged.\n3. Passwords must meet complexity requirements.",
);

export const FIXTURE_NUMBERED_LIST_EXPECTED_TEXTS = [
  "All data must be encrypted at rest.",
  "Access must be logged.",
  "Passwords must meet complexity requirements.",
];

// ---------------------------------------------------------------------------
// Fixture 6: Headings followed by claims
// ---------------------------------------------------------------------------

export const FIXTURE_HEADING_THEN_CLAIMS = makeRequest(
  "eval-006",
  "gen-006",
  "# Security Requirements\n\nAll systems must comply with ISO 27001.\n\n## Access Control\n\nAccess control lists must be maintained.",
);

// Headings should be excluded; only body claims are candidates
export const FIXTURE_HEADING_THEN_CLAIMS_EXPECTED_TEXTS = [
  "All systems must comply with ISO 27001.",
  "Access control lists must be maintained.",
];

// ---------------------------------------------------------------------------
// Fixture 7: Repeated identical claim text at different positions
// ---------------------------------------------------------------------------

export const FIXTURE_REPEATED_TEXT = makeRequest(
  "eval-007",
  "gen-007",
  "Encryption is required. All data must be encrypted.\n\nEncryption is required. No exceptions apply.",
);

// Both occurrences of "Encryption is required." should be extracted as
// separate statements with distinct IDs (different character offsets)
export const FIXTURE_REPEATED_TEXT_REPEATED_PHRASE = "Encryption is required.";

// ---------------------------------------------------------------------------
// Fixture 8: Decimal numbers
// ---------------------------------------------------------------------------

export const FIXTURE_DECIMAL_NUMBERS = makeRequest(
  "eval-008",
  "gen-008",
  "The system must maintain 99.9% uptime. Version 3.14 of the standard applies. Section 1.2 covers specific requirements. The threshold is 0.5 seconds.",
);

// Decimal numbers should NOT cause false sentence splits
export const FIXTURE_DECIMAL_NUMBERS_EXPECTED_MIN_STATEMENTS = 3;

// ---------------------------------------------------------------------------
// Fixture 9: Abbreviations
// ---------------------------------------------------------------------------

export const FIXTURE_ABBREVIATIONS = makeRequest(
  "eval-009",
  "gen-009",
  "The system is managed by Dr. Smith and Prof. Johnson. All components, e.g. the authentication module, must be audited. Compliance with ISO 27001 is mandatory, i.e. all controls must be implemented.",
);

// Abbreviations should NOT cause false sentence splits
export const FIXTURE_ABBREVIATIONS_EXPECTED_STATEMENT_COUNT = 3;

// ---------------------------------------------------------------------------
// Fixture 10: Dates
// ---------------------------------------------------------------------------

export const FIXTURE_DATES = makeRequest(
  "eval-010",
  "gen-010",
  "The audit was completed on 15 Jan. 2024. The next review is due in Dec. 2025. Compliance was last verified on 3 Mar. 2023.",
);

// Date abbreviations should NOT cause false sentence splits
export const FIXTURE_DATES_EXPECTED_STATEMENT_COUNT = 3;

// ---------------------------------------------------------------------------
// Fixture 11: Quoted claims
// ---------------------------------------------------------------------------

export const FIXTURE_QUOTED_CLAIMS = makeRequest(
  "eval-011",
  "gen-011",
  'The standard states that "all systems must comply." This requirement is binding. The specification notes "encryption is mandatory for all data at rest."',
);

// Quoted text should be included as candidate claims (part of the sentence)
export const FIXTURE_QUOTED_CLAIMS_EXPECTED_MIN_STATEMENTS = 3;

// ---------------------------------------------------------------------------
// Fixture 12: Questions
// ---------------------------------------------------------------------------

export const FIXTURE_QUESTIONS = makeRequest(
  "eval-012",
  "gen-012",
  "Is the system compliant with ISO 27001? All requirements have been reviewed. Has the audit been completed? The answer is yes.",
);

// Questions are included as candidate claims (conservative implementation choice)
export const FIXTURE_QUESTIONS_INCLUDES_QUESTIONS = true;

// ---------------------------------------------------------------------------
// Fixture 13: Commands/imperatives
// ---------------------------------------------------------------------------

export const FIXTURE_COMMANDS = makeRequest(
  "eval-013",
  "gen-013",
  "Implement access controls immediately. Ensure all audit logs are retained. Review the compliance status quarterly.",
);

// Commands are included as candidate claims (requirements often use imperative mood)
export const FIXTURE_COMMANDS_EXPECTED_STATEMENT_COUNT = 3;

// ---------------------------------------------------------------------------
// Fixture 16: Already-normalised content (LF only, no CRLF)
// ---------------------------------------------------------------------------

export const FIXTURE_ALREADY_NORMALISED = makeRequest(
  "eval-016",
  "gen-016",
  "Line one contains a claim.\nLine two contains another claim.\nLine three also has a claim.",
);

// ---------------------------------------------------------------------------
// Fixture 17: Mixed punctuation
// ---------------------------------------------------------------------------

export const FIXTURE_MIXED_PUNCTUATION = makeRequest(
  "eval-017",
  "gen-017",
  "The system passed! All requirements were met. Did you verify this? Yes, the audit confirms compliance.",
);

export const FIXTURE_MIXED_PUNCTUATION_EXPECTED_MIN_STATEMENTS = 4;

// ---------------------------------------------------------------------------
// Fixture 19: Long synthetic document
// ---------------------------------------------------------------------------

function buildLongDocument(sectionCount: number): string {
  const sections: string[] = [];
  for (let i = 1; i <= sectionCount; i++) {
    sections.push(
      `# Section ${i}: Requirement Group ${i}\n\n` +
        `Requirement ${i}.1 states that all systems must meet standard ${i} compliance.\n` +
        `Requirement ${i}.2 mandates that evidence of compliance must be provided within 30 days.\n` +
        `- Control ${i}.A: Access controls must be implemented.\n` +
        `- Control ${i}.B: Audit logs must be retained for 12 months.\n` +
        `- Control ${i}.C: Encryption must be enabled for data at rest.\n`,
    );
  }
  return sections.join("\n");
}

export const FIXTURE_LONG_DOCUMENT = makeRequest(
  "eval-019",
  "gen-019",
  buildLongDocument(10),
);

export const FIXTURE_LONG_DOCUMENT_EXPECTED_MIN_STATEMENTS = 30;

// ---------------------------------------------------------------------------
// Fixture 20: Content producing zero candidate statements
// ---------------------------------------------------------------------------

// All content is headings or non-propositional — no candidate claims
export const FIXTURE_ZERO_CLAIMS = makeRequest(
  "eval-020",
  "gen-020",
  "# Introduction\n\n# Overview\n\n# Conclusion\n\n---\n\n---",
);

export const FIXTURE_ZERO_CLAIMS_EXPECTED_COUNT = 0;

// ---------------------------------------------------------------------------
// Fixture 24: Unicode text
// ---------------------------------------------------------------------------

export const FIXTURE_UNICODE = makeRequest(
  "eval-024",
  "gen-024",
  "The system must comply with the GDPR (Regulation (EU) 2016/679). Data retention is limited to the minimum necessary period. Résumé data must be anonymised after 90 days.",
);

// ---------------------------------------------------------------------------
// Fixture 25: Non-English text
// ---------------------------------------------------------------------------

export const FIXTURE_NON_ENGLISH = makeRequest(
  "eval-025",
  "gen-025",
  "Alle Systeme müssen ISO 27001-konform sein. Die Verschlüsselung ist obligatorisch. Zugriffsprotokolle müssen 12 Monate aufbewahrt werden.",
);

// Non-English text is segmented by the same rules.
// Documented limitation: German sentence-ending abbreviations are not in the
// English abbreviation set. Segmentation may be less accurate but is still
// deterministic.
export const FIXTURE_NON_ENGLISH_EXPECTED_MIN_STATEMENTS = 3;
