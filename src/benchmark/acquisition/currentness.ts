/**
 * DRA-ENG-020 — Version/Supersession Currentness Semantics
 * Module: currentness.ts — Currentness assessment schema and lineage checks
 *
 * Root cause addressed: DRA-ACQ-027 Phase 2 experimentally demonstrated that
 * the DRA evaluator has no mechanism to represent or detect that an
 * authentic, properly-authorised document has been superseded by a newer
 * authoritative version (DRA-DOC-0031 / NIST SP 800-53 Rev. 4 vs.
 * DRA-DOC-0030 / Rev. 5). This module adds the minimum general mechanism
 * required to close that gap.
 *
 * ---------------------------------------------------------------------------
 * Three concepts that must never be conflated
 * ---------------------------------------------------------------------------
 *
 *   AUTHENTICITY — is this genuinely the claimed document? (byte/source
 *     digest verification at freeze time — already handled by
 *     computeSourceDigest/verifySourceDigest; untouched by this module.)
 *
 *   AUTHORITY    — was it issued by an appropriate authority? (Stage 3
 *     Authority Resolution, per-statement; untouched by this module.)
 *
 *   CURRENTNESS  — is this still the operative/current version, according
 *     to authoritative evidence? (NEW — this module.)
 *
 * Currentness is a DOCUMENT-level property, not a per-statement one, so it
 * does not belong in Stage 3's per-statement AuthorityRecord. It is also not
 * a claim about who issued the document, so it must not be represented by
 * reusing an authority-flavoured issue class.
 *
 * ---------------------------------------------------------------------------
 * Design decisions (DRA-ENG-020 capability analysis)
 * ---------------------------------------------------------------------------
 *
 * 1. WHERE DOES CURRENTNESS EVIDENCE ENTER DRA?
 *    At acquisition/freeze time, as a governed, human-reviewed assessment —
 *    structurally identical in rigor to the existing OfficialSourceAssessment
 *    and LicenceAssessment pillars (see schema.ts / licence.ts). A human (or
 *    an equivalently accountable reviewer) supplies the assessment; DRA never
 *    infers currentness on its own.
 *
 * 2. WHERE DOES IT LIVE?
 *    A new, explicit representation: CurrentnessAssessment (this file). Not
 *    folded into source metadata (too implicit, no evidence gate) and not
 *    added to Stage 3's AuthorityRecord (wrong semantic layer — per-statement,
 *    not per-document, and would conflate authority with currentness). It is
 *    also deliberately NOT a full version-lineage graph structure: the
 *    evidence for a supersession claim is always evidence about one specific
 *    related document (e.g. "superseded by SP 800-53 Rev. 5"), so a single
 *    optional directed reference (relatedDocumentIdentifier /
 *    relatedCorpusDocumentId) is the minimum general shape — not a graph
 *    database or transitive-closure engine.
 *
 * 3. WHAT EVIDENCE IS REQUIRED?
 *    Any non-UNKNOWN currentnessStatus requires a non-empty evidenceUrl and
 *    evidenceQuote from an authoritative source EXTERNAL to the document
 *    itself (enforced procedurally, by review discipline — the same
 *    discipline already relied upon for LicenceAssessment/
 *    OfficialSourceAssessment; DRA has no way to auto-verify "external" any
 *    more than it can auto-verify a licence). CONFIRMED_SUPERSEDED
 *    additionally requires relatedDocumentIdentifier (you cannot assert "this
 *    has been superseded" without naming what superseded it).
 *    CONFIRMED_CURRENT does not require relatedDocumentIdentifier, because a
 *    document can be confirmed current with no known prior version at all
 *    (see point 6).
 *
 * 4. UNKNOWN vs. CONFIRMED_CURRENT vs. CONFIRMED_SUPERSEDED.
 *    Three-state enum, CurrentnessStatus. Absence of a CurrentnessAssessment
 *    altogether (the field is optional everywhere it appears) means
 *    "never assessed" — distinct from an explicit UNKNOWN assessment, which
 *    means "a reviewer looked for authoritative currentness evidence and
 *    found none, or found it inconclusive." Both states behave identically
 *    downstream (no currentness claim is asserted), but the audit trail
 *    differs. Neither absence nor UNKNOWN may be silently upgraded to
 *    CONFIRMED_CURRENT — currentness must never be assumed by default.
 *
 * 5. CAN AUTHORITY_EXPIRED (IC-2) REPRESENT SUPERSESSION?
 *    NO — rejected on two independent grounds, not merely because reuse is
 *    inconvenient:
 *      a) Structural: model/issue-classes.ts explicitly freezes the nine
 *         issue classes for Version 1 ("No issue class may be added,
 *         removed, renamed, or redefined during Version 1 engineering").
 *         This forecloses both reusing AND adding any issue class here.
 *      b) Semantic: AUTHORITY_EXPIRED (IC-2, "Consistency Check" advisory
 *         class) is scoped to the AUTHORITY axis — an authority whose
 *         backing has lapsed for a given claim. Currentness is a distinct
 *         axis (whether the document ARTEFACT remains operative). Reusing it
 *         would conflate authority and currentness, which the task
 *         explicitly forbids. Currentness is therefore represented entirely
 *         OUTSIDE the issue taxonomy: as an independent, additive field
 *         (see governed-pipeline.ts), never as an issue, and — by design —
 *         never required to change the SUPPORTED/REVIEW/HOLD decision.
 *
 * 6. SINGLE-DOCUMENT-IN-LINEAGE BEHAVIOUR.
 *    If only one document of a lineage has ever been acquired, its
 *    assessment can still be CONFIRMED_CURRENT (with authoritative evidence
 *    that it remains operative) or CONFIRMED_SUPERSEDED (with authoritative
 *    evidence naming a successor that DRA may or may not have itself
 *    acquired — relatedDocumentIdentifier is a free-text label, independent
 *    of whether relatedCorpusDocumentId can be populated). The mechanism
 *    never requires the related document to be present in the corpus.
 *
 * 7. PROVENANCE / AUDITABILITY.
 *    assessedBy + assessedAt + evidenceUrl + evidenceQuote are always
 *    captured together, mirroring LicenceAssessment. The assessment is
 *    stored on the immutable AcquisitionFreezeRecord (append-only, never
 *    overwritten) and deterministically propagated into the evaluation
 *    result. KNOWN LIMITATION (documented, not silently accepted): unlike
 *    representationAssessment/graphicalSemanticAssessment, the currentness
 *    assessment is — by design, for backward compatibility — EXCLUDED from
 *    both the freeze record digest and the proof receipt's substantive
 *    digest (see freeze.ts, canonical-serialise.ts). This preserves every
 *    historical digest untouched, but means the assessment itself is not yet
 *    hash-bound into the tamper-evident receipt chain. A future programme
 *    could close this by binding it in a new, explicitly versioned digest
 *    field if stronger tamper-evidence is required.
 *
 * ---------------------------------------------------------------------------
 * Critical requirement honoured
 * ---------------------------------------------------------------------------
 * Nothing in this module compares publication dates, inspects `publishedAt`,
 * or infers "newest = current". Every currentnessStatus other than UNKNOWN
 * must be accompanied by human-attested, source-external evidence text. A
 * document's own self-referential version text (e.g. a title containing
 * "Revision 5") is never treated as evidence — no code path in this module
 * reads document body/title text at all; evidence is a distinct, explicitly
 * supplied field.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// CurrentnessStatus
// ---------------------------------------------------------------------------

export const CURRENTNESS_STATUS_VALUES = [
  "UNKNOWN",
  "CONFIRMED_CURRENT",
  "CONFIRMED_SUPERSEDED",
] as const;

export type CurrentnessStatus = (typeof CURRENTNESS_STATUS_VALUES)[number];

// ---------------------------------------------------------------------------
// CurrentnessAssessment
// ---------------------------------------------------------------------------

/**
 * A governed, human-reviewed assessment of whether a document remains the
 * current/operative version of its publication, or has been superseded.
 *
 * This assessment is never fabricated by DRA. Absence of a
 * CurrentnessAssessment (the field is optional wherever it is used) means
 * "never assessed" and must never be treated as CONFIRMED_CURRENT.
 */
export const CurrentnessAssessmentSchema = z
  .object({
    /**
     * UNKNOWN — no authoritative evidence located, or evidence inconclusive.
     * CONFIRMED_CURRENT — authoritative evidence confirms this remains the
     *   operative version.
     * CONFIRMED_SUPERSEDED — authoritative evidence confirms a newer
     *   authoritative version has replaced this one.
     */
    currentnessStatus: z.enum(
      CURRENTNESS_STATUS_VALUES as unknown as [string, ...string[]],
    ),

    /**
     * Human-readable label identifying the related document in the version
     * lineage (e.g. "NIST SP 800-53 Revision 5"). Required for
     * CONFIRMED_SUPERSEDED (you cannot assert supersession without naming
     * the successor). Optional for CONFIRMED_CURRENT (a document may be
     * confirmed current with no known prior version — see design note 6).
     * Must be absent for UNKNOWN.
     */
    relatedDocumentIdentifier: z.string().min(1).optional(),

    /**
     * Optional corpus document ID (format DRA-DOC-NNNN) of the related
     * document, when it has itself been acquired into the DRA corpus. Purely
     * informational cross-reference; the mechanism never requires this to be
     * populated (see design note 6).
     */
    relatedCorpusDocumentId: z
      .string()
      .regex(/^DRA-DOC-\d{4}$/, {
        message: "relatedCorpusDocumentId must match DRA-DOC-NNNN",
      })
      .optional(),

    /**
     * URL of the authoritative source establishing the currentness/
     * supersession relationship (e.g. the publisher's own catalog record).
     * Required for any non-UNKNOWN currentnessStatus.
     */
    evidenceUrl: z.string().url().optional(),

    /**
     * Verbatim quote from the authoritative source. Required for any
     * non-UNKNOWN currentnessStatus. This is evidence ABOUT the document,
     * sourced externally — never text extracted from the document's own
     * body or title (the false-positive mode identified in DRA-ACQ-027,
     * where Rev. 5's own title contains "Revision 5").
     */
    evidenceQuote: z.string().min(1).optional(),

    /** Identity of the person who performed this assessment. */
    assessedBy: z.string().min(1, { message: "assessedBy must not be empty" }),

    /** ISO-8601 timestamp of the assessment. */
    assessedAt: z
      .string()
      .refine((s) => s.includes("T") && !isNaN(Date.parse(s)), {
        message: "assessedAt must be a valid ISO-8601 datetime string",
      }),

    /** Optional assessor notes. */
    notes: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.currentnessStatus === "UNKNOWN") {
      // UNKNOWN must carry no dangling evidence/relation fields — an
      // "unknown" assessment that nonetheless names a related document or
      // cites evidence is itself a contradictory (malformed) record.
      const disallowed: Array<[keyof typeof val, string]> = [
        ["relatedDocumentIdentifier", "relatedDocumentIdentifier"],
        ["relatedCorpusDocumentId", "relatedCorpusDocumentId"],
        ["evidenceUrl", "evidenceUrl"],
        ["evidenceQuote", "evidenceQuote"],
      ];
      for (const [key, path] of disallowed) {
        if (val[key] !== undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [path],
            message: `UNKNOWN currentnessStatus must not carry ${path}`,
          });
        }
      }
      return;
    }

    // Non-UNKNOWN: authoritative evidence is mandatory. This is the
    // structural enforcement of "supersession assertion without
    // authoritative provenance" being rejected, and of never fabricating
    // current/superseded status.
    if (!val.evidenceUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["evidenceUrl"],
        message: `${val.currentnessStatus} requires evidenceUrl`,
      });
    }
    if (!val.evidenceQuote) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["evidenceQuote"],
        message: `${val.currentnessStatus} requires evidenceQuote`,
      });
    }

    if (val.currentnessStatus === "CONFIRMED_SUPERSEDED" && !val.relatedDocumentIdentifier) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["relatedDocumentIdentifier"],
        message: "CONFIRMED_SUPERSEDED requires relatedDocumentIdentifier naming the successor",
      });
    }
  });

export type CurrentnessAssessment = z.infer<typeof CurrentnessAssessmentSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true only when authoritative evidence confirms supersession. */
export function isConfirmedSuperseded(assessment: CurrentnessAssessment | undefined): boolean {
  return assessment?.currentnessStatus === "CONFIRMED_SUPERSEDED";
}

/** Returns true only when authoritative evidence confirms currentness. */
export function isConfirmedCurrent(assessment: CurrentnessAssessment | undefined): boolean {
  return assessment?.currentnessStatus === "CONFIRMED_CURRENT";
}

// ---------------------------------------------------------------------------
// Lineage consistency check (multiple revisions / contradictory evidence)
// ---------------------------------------------------------------------------

export interface CurrentnessLineageEntry {
  readonly corpusDocumentId: string;
  readonly assessment: CurrentnessAssessment;
}

export interface LineageContradiction {
  readonly kind:
    | "SELF_REFERENCE"
    | "MUTUAL_SUPERSESSION_CYCLE"
    | "MUTUAL_CURRENT_CYCLE"
    | "SUPERSEDED_BY_NON_CURRENT_CLAIM";
  readonly documentIds: readonly string[];
  readonly detail: string;
}

/**
 * Pure, read-only pairwise consistency check across an explicit set of
 * CurrentnessAssessments (never an automatic full-corpus graph traversal —
 * callers supply exactly the entries they wish to cross-check, mirroring the
 * existing explicit-input precedent used by near-duplicate detection's
 * existingCorpusTexts).
 *
 * Detects:
 *   - SELF_REFERENCE: a document names itself as its own related document.
 *   - MUTUAL_SUPERSESSION_CYCLE: two documents each claim to have been
 *     superseded BY the other (structurally impossible).
 *   - MUTUAL_CURRENT_CYCLE: two documents each claim to be current AND to
 *     supersede the other (structurally impossible).
 *   - SUPERSEDED_BY_NON_CURRENT_CLAIM: document A claims to have been
 *     superseded by document B, but B also explicitly claims to be current
 *     while B's own assessment additionally asserts A is likewise current
 *     — i.e. A and B disagree about which of them remains operative.
 *
 * This is generic and contains no publisher-, jurisdiction-, or
 * document-specific logic.
 */
export function checkLineageConsistency(
  entries: readonly CurrentnessLineageEntry[],
): { readonly consistent: boolean; readonly contradictions: readonly LineageContradiction[] } {
  const contradictions: LineageContradiction[] = [];
  const byId = new Map(entries.map((e) => [e.corpusDocumentId, e] as const));

  for (const entry of entries) {
    const { corpusDocumentId, assessment } = entry;
    const relatedId = assessment.relatedCorpusDocumentId;

    if (relatedId === corpusDocumentId) {
      contradictions.push({
        kind: "SELF_REFERENCE",
        documentIds: [corpusDocumentId],
        detail: `${corpusDocumentId} names itself as its own related document`,
      });
      continue;
    }

    if (relatedId === undefined) continue;
    const related = byId.get(relatedId);
    if (related === undefined) continue;

    const a = assessment;
    const b = related.assessment;

    if (
      a.currentnessStatus === "CONFIRMED_SUPERSEDED" &&
      b.currentnessStatus === "CONFIRMED_SUPERSEDED" &&
      b.relatedCorpusDocumentId === corpusDocumentId
    ) {
      const pairSorted = [corpusDocumentId, relatedId].sort();
      if (
        !contradictions.some(
          (c) =>
            c.kind === "MUTUAL_SUPERSESSION_CYCLE" &&
            c.documentIds.length === 2 &&
            c.documentIds[0] === pairSorted[0] &&
            c.documentIds[1] === pairSorted[1],
        )
      ) {
        contradictions.push({
          kind: "MUTUAL_SUPERSESSION_CYCLE",
          documentIds: pairSorted,
          detail: `${corpusDocumentId} and ${relatedId} each claim to have been superseded by the other`,
        });
      }
    }

    if (
      a.currentnessStatus === "CONFIRMED_CURRENT" &&
      b.currentnessStatus === "CONFIRMED_CURRENT" &&
      b.relatedCorpusDocumentId === corpusDocumentId
    ) {
      const pairSorted = [corpusDocumentId, relatedId].sort();
      if (
        !contradictions.some(
          (c) =>
            c.kind === "MUTUAL_CURRENT_CYCLE" &&
            c.documentIds.length === 2 &&
            c.documentIds[0] === pairSorted[0] &&
            c.documentIds[1] === pairSorted[1],
        )
      ) {
        contradictions.push({
          kind: "MUTUAL_CURRENT_CYCLE",
          documentIds: pairSorted,
          detail: `${corpusDocumentId} and ${relatedId} each claim to be current and to supersede the other`,
        });
      }
    }

    // A claims B superseded it (B is the successor); but A separately
    // insists it is ALSO current, i.e. a self-contradictory record. This is
    // caught here rather than in the per-record schema because it requires
    // comparing A's own two assertions is impossible (schema already forbids
    // one record from holding two statuses) — instead this detects the
    // cross-record case where B claims to supersede A (CONFIRMED_CURRENT
    // pointing at A) while A separately claims CONFIRMED_CURRENT too.
    if (
      b.currentnessStatus === "CONFIRMED_CURRENT" &&
      b.relatedCorpusDocumentId === corpusDocumentId &&
      a.currentnessStatus === "CONFIRMED_CURRENT"
    ) {
      const pairSorted = [corpusDocumentId, relatedId].sort();
      if (
        !contradictions.some(
          (c) =>
            c.kind === "SUPERSEDED_BY_NON_CURRENT_CLAIM" &&
            c.documentIds.length === 2 &&
            c.documentIds[0] === pairSorted[0] &&
            c.documentIds[1] === pairSorted[1],
        )
      ) {
        contradictions.push({
          kind: "SUPERSEDED_BY_NON_CURRENT_CLAIM",
          documentIds: pairSorted,
          detail: `${relatedId} claims to supersede ${corpusDocumentId}, but ${corpusDocumentId} also claims to be current`,
        });
      }
    }
  }

  return { consistent: contradictions.length === 0, contradictions };
}
