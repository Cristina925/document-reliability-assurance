/**
 * DRA-001 — Stage 6: Consistency Check — Issue Detection
 *
 * Milestone: DRA-ENG-008 — Consistency Check
 *
 * Detects assurance issues by cross-referencing the outputs of Stages 2–5.
 * Implements the following issue classes (DRA-001 §6):
 *
 *   IC-1 UNSUPPORTED_CLAIM (BLOCKING)   — CRITICAL or HIGH materiality, no
 *        identifiable authority, and no documentary evidence.
 *
 *   IC-3 AUTHORITY_ABSENT (ADVISORY)    — CRITICAL or HIGH materiality, no
 *        identifiable authority, but documentary evidence present.
 *
 *   IC-4 EVIDENCE_ABSENT (BLOCKING)     — CRITICAL materiality, no documentary
 *        evidence, but an identifiable authority present.
 *
 *   IC-5 EVIDENCE_INADEQUATE (ADVISORY) — HIGH materiality, no evidence or only
 *        ambiguous evidence, and an identifiable authority present.
 *
 *   IC-7 CLAIM_INCONSISTENCY (ADVISORY) — Two CRITICAL or HIGH materiality
 *        statements carry contradictory deontic modals on the same verb.
 *
 * Issue class detection is rule-ordered. IC-1 subsumes IC-3 and IC-4/IC-5 for
 * the same statement: when IC-1 fires, the lower-specificity rules are skipped.
 *
 * No confidence scores, decisions, or proof receipts are produced here.
 */

import type { DraIssue, IssueId, StatementId } from "../model/index.js";
import type { Stage2Success } from "../claim-extraction/index.js";
import type { AuthorityRecord } from "../authority-resolution/index.js";
import type { EvidenceRecord } from "../evidence-linkage/index.js";
import type { MaterialityRecord } from "../materiality-assessment/index.js";
import { buildStatementIdMap } from "../shared/identifier-utils.js";

// ---------------------------------------------------------------------------
// Classification sentinel sets
// ---------------------------------------------------------------------------

/** Authority classifications that indicate no identifiable source. */
const NO_AUTHORITY: ReadonlySet<string> = new Set(["NO_IDENTIFIABLE_SOURCE"]);

/** Evidence classifications that indicate no documentary evidence. */
const NO_EVIDENCE: ReadonlySet<string> = new Set(["NO_DOCUMENT_EVIDENCE"]);

/** Evidence classifications that indicate only ambiguous evidence. */
const AMBIGUOUS_EVIDENCE: ReadonlySet<string> = new Set([
  "AMBIGUOUS_EVIDENCE_LINK",
]);

// ---------------------------------------------------------------------------
// IC-7 contradiction detection
// ---------------------------------------------------------------------------

interface DeonticParse {
  readonly verb: string;
  readonly negated: boolean;
}

/**
 * Extracts the primary deontic verb from a statement.
 * Returns the first word (≥4 chars) following "must [not]", "shall [not]",
 * or "cannot", with a negation flag.
 */
function parseDeonticVerb(text: string): DeonticParse | null {
  // Priority: negated forms first
  const negMatch = /\b(?:must|shall)\s+not\s+(?:be\s+)?([a-z]{4,})/i.exec(text);
  if (negMatch) return { verb: negMatch[1].toLowerCase(), negated: true };

  const cannotMatch = /\bcannot\s+(?:be\s+)?([a-z]{4,})/i.exec(text);
  if (cannotMatch) return { verb: cannotMatch[1].toLowerCase(), negated: true };

  const posMatch = /\b(?:must|shall)\s+(?:be\s+)?([a-z]{4,})/i.exec(text);
  if (posMatch) return { verb: posMatch[1].toLowerCase(), negated: false };

  return null;
}

interface Contradiction {
  readonly sidA: StatementId;
  readonly sidB: StatementId;
  readonly explanation: string;
}

/**
 * Detects IC-7 CLAIM_INCONSISTENCY pairs among a set of statements.
 * Only CRITICAL and HIGH materiality statements are compared.
 */
function detectContradictions(
  statements: ReadonlyArray<{ id: StatementId; text: string }>,
): ReadonlyArray<Contradiction> {
  const parsed = statements.map((s) => ({
    id: s.id,
    text: s.text,
    deontic: parseDeonticVerb(s.text),
  }));

  const contradictions: Contradiction[] = [];

  for (let i = 0; i < parsed.length; i++) {
    for (let j = i + 1; j < parsed.length; j++) {
      const a = parsed[i];
      const b = parsed[j];
      if (!a.deontic || !b.deontic) continue;
      if (a.deontic.verb !== b.deontic.verb) continue;
      if (a.deontic.negated === b.deontic.negated) continue;

      const preview = (t: string) =>
        t.length > 60 ? t.slice(0, 57) + "…" : t;
      contradictions.push({
        sidA: a.id,
        sidB: b.id,
        explanation:
          `Contradictory deontic modals on verb "${a.deontic.verb}": ` +
          `"${preview(a.text)}" (${a.deontic.negated ? "negated" : "affirmative"}) ` +
          `vs "${preview(b.text)}" (${b.deontic.negated ? "negated" : "affirmative"}).`,
      });
    }
  }

  return contradictions;
}

// ---------------------------------------------------------------------------
// Issue ID factory (local per detection run)
// ---------------------------------------------------------------------------

function makeIssueIdFactory(): () => IssueId {
  let n = 0;
  return () =>
    (`issue-${String(++n).padStart(4, "0")}`) as unknown as IssueId;
}

// ---------------------------------------------------------------------------
// detectIssues — main entry
// ---------------------------------------------------------------------------

/**
 * Cross-references Stages 2–5 outputs to produce all applicable DraIssues.
 *
 * Each statement produces at most one per-statement issue (IC-1 subsumes
 * IC-3/IC-4/IC-5). Cross-statement IC-7 issues are detected separately.
 *
 * @param stage2           Stage 2 success result (claim extraction).
 * @param authorityRecords Stage 3 authority records (one per statement).
 * @param evidenceRecords  Stage 4 evidence records (one per statement).
 * @param materialityRecords Stage 5 materiality records (one per statement).
 * @returns Immutable array of DraIssue instances, in detection order.
 */
export function detectIssues(
  stage2: Stage2Success,
  authorityRecords: ReadonlyArray<AuthorityRecord>,
  evidenceRecords: ReadonlyArray<EvidenceRecord>,
  materialityRecords: ReadonlyArray<MaterialityRecord>,
): ReadonlyArray<DraIssue> {
  const makeIssueId = makeIssueIdFactory();

  // Build lookup maps keyed by validated statementId strings.
  // buildStatementIdMap rejects null/undefined/non-string/empty values
  // instead of silently coercing them with String().
  const arByStmt = buildStatementIdMap(authorityRecords);
  const erByStmt = buildStatementIdMap(evidenceRecords);
  const mrByStmt = buildStatementIdMap(materialityRecords);

  const issues: DraIssue[] = [];

  // ── Per-statement issue detection ──────────────────────────────────────────
  for (const statement of stage2.statements) {
    const sid = String(statement.id);
    const ar = arByStmt.get(sid);
    const er = erByStmt.get(sid);
    const mr = mrByStmt.get(sid);
    if (!ar || !er || !mr) continue; // defensive: should not occur in valid pipeline

    const mat = mr.classification;
    const isCritical = mat === "CRITICAL";
    const isHighOrCritical = isCritical || mat === "HIGH";

    const noAuth = NO_AUTHORITY.has(ar.classification);
    const noEvid = NO_EVIDENCE.has(er.classification);
    const ambigEvid = AMBIGUOUS_EVIDENCE.has(er.classification);

    // IC-1: UNSUPPORTED_CLAIM (BLOCKING) — no authority AND no evidence
    if (isHighOrCritical && noAuth && noEvid) {
      const issue: DraIssue = {
        id: makeIssueId(),
        issueClass: "UNSUPPORTED_CLAIM",
        severity: "BLOCKING",
        affectedStatementIds: [statement.id],
        affectedEvidenceUnitIds: [],
        explanation:
          `Statement has ${mat} materiality but provides neither an identifiable ` +
          `authority nor any documentary evidence. Classification: authority=${ar.classification}, ` +
          `evidence=${er.classification}.`,
        stageAssociation: "Consistency Check",
        metadata: {
          materialityClassification: mat,
          authorityClassification: ar.classification,
          evidenceClassification: er.classification,
        },
      };
      issues.push(issue);
      continue; // IC-1 subsumes IC-3 and IC-4/IC-5 for this statement
    }

    // IC-4: EVIDENCE_ABSENT (BLOCKING) — CRITICAL, no evidence, has authority
    if (isCritical && noEvid && !noAuth) {
      const issue: DraIssue = {
        id: makeIssueId(),
        issueClass: "EVIDENCE_ABSENT",
        severity: "BLOCKING",
        affectedStatementIds: [statement.id],
        affectedEvidenceUnitIds: [],
        explanation:
          `Statement has CRITICAL materiality but no documentary evidence ` +
          `(authority: ${ar.classification}, evidence: ${er.classification}).`,
        stageAssociation: "Consistency Check",
        metadata: {
          materialityClassification: mat,
          authorityClassification: ar.classification,
          evidenceClassification: er.classification,
        },
      };
      issues.push(issue);
      // IC-4 does not subsume IC-3 (different condition); continue to IC-3 check
    }

    // IC-3: AUTHORITY_ABSENT (ADVISORY) — CRITICAL/HIGH, no authority, has evidence
    if (isHighOrCritical && noAuth && !noEvid) {
      const issue: DraIssue = {
        id: makeIssueId(),
        issueClass: "AUTHORITY_ABSENT",
        severity: "ADVISORY",
        affectedStatementIds: [statement.id],
        affectedEvidenceUnitIds: [],
        explanation:
          `Statement has ${mat} materiality but no identifiable authority ` +
          `(evidence present: ${er.classification}).`,
        stageAssociation: "Consistency Check",
        metadata: {
          materialityClassification: mat,
          authorityClassification: ar.classification,
          evidenceClassification: er.classification,
        },
      };
      issues.push(issue);
    }

    // IC-5: EVIDENCE_INADEQUATE (ADVISORY) — HIGH, weak/absent evidence, has authority
    if (!isCritical && mat === "HIGH" && (noEvid || ambigEvid) && !noAuth) {
      const issue: DraIssue = {
        id: makeIssueId(),
        issueClass: "EVIDENCE_INADEQUATE",
        severity: "ADVISORY",
        affectedStatementIds: [statement.id],
        affectedEvidenceUnitIds: [],
        explanation:
          `Statement has HIGH materiality but evidence is inadequate ` +
          `(evidence: ${er.classification}; authority: ${ar.classification}).`,
        stageAssociation: "Consistency Check",
        metadata: {
          materialityClassification: mat,
          authorityClassification: ar.classification,
          evidenceClassification: er.classification,
        },
      };
      issues.push(issue);
    }
  }

  // ── Cross-statement IC-7 detection ─────────────────────────────────────────
  const highCriticalStmts = stage2.statements.filter((s) => {
    const mr = mrByStmt.get(String(s.id));
    return mr && (mr.classification === "CRITICAL" || mr.classification === "HIGH");
  });

  for (const c of detectContradictions(highCriticalStmts)) {
    const issue: DraIssue = {
      id: makeIssueId(),
      issueClass: "CLAIM_INCONSISTENCY",
      severity: "ADVISORY",
      affectedStatementIds: [c.sidA, c.sidB],
      affectedEvidenceUnitIds: [],
      explanation: c.explanation,
      stageAssociation: "Consistency Check",
      metadata: {},
    };
    issues.push(issue);
  }

  return Object.freeze(issues);
}
