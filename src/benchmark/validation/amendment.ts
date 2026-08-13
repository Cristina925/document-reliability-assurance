/**
 * DRA-VAL-001A — Scientific Validation Protocol — Protocol Amendments
 *
 * Defines the schema for protocol amendments.
 *
 * Rules:
 *   - Every amendment must be filed with a rationale and a list of affected sections.
 *   - Retrospective amendments — those filed after results were inspected — are
 *     categorically prohibited. A ProtocolAmendment may not carry
 *     isProhibitedRetrospective: true; such records are rejected at parse time.
 *   - Amendments must carry a UTC ISO-8601 timestamp.
 *   - Amendment IDs follow the format AMD-NNN.
 *
 * Authorised amendment reasons (any amendment must cite one):
 *   - PROCEDURAL_CORRECTION: correcting a procedural error with no effect on analysis
 *   - SCOPE_CLARIFICATION: clarifying scope without changing analytical intent
 *   - REVIEWER_REPLACEMENT: replacing a withdrawn reviewer per the replacement protocol
 *   - DOCUMENT_WITHDRAWAL: recording the withdrawal of a corpus document
 *   - PROTOCOL_DEVIATION: recording a deviation from the protocol
 *
 * Prohibited retrospective amendment reasons (these cannot be filed):
 *   - Any change to matching criteria after results are inspected
 *   - Any change to metric definitions after results are inspected
 *   - Any change to corpus composition after results are inspected
 */

import { z } from "zod";
import { AmendmentIdSchema } from "./identifiers.js";

// ---------------------------------------------------------------------------
// Authorised amendment reasons
// ---------------------------------------------------------------------------

export const AUTHORISED_AMENDMENT_REASONS = [
  "PROCEDURAL_CORRECTION",
  "SCOPE_CLARIFICATION",
  "REVIEWER_REPLACEMENT",
  "DOCUMENT_WITHDRAWAL",
  "PROTOCOL_DEVIATION",
] as const;

export type AuthorisedAmendmentReason =
  (typeof AUTHORISED_AMENDMENT_REASONS)[number];

export const AuthorisedAmendmentReasonSchema = z.enum(
  AUTHORISED_AMENDMENT_REASONS as unknown as [string, ...string[]],
  {
    errorMap: () => ({
      message: `Amendment reason must be one of: ${AUTHORISED_AMENDMENT_REASONS.join(", ")}`,
    }),
  },
);

// ---------------------------------------------------------------------------
// Protocol amendment
// ---------------------------------------------------------------------------

/**
 * A single filed protocol amendment.
 *
 * Invariants:
 *   - isProhibitedRetrospective must be false (retrospective amendments cannot be filed)
 *   - affectedSections must name at least one section
 *   - rationale must be non-empty
 *   - reason must be an authorised reason
 */
export const ProtocolAmendmentSchema = z
  .object({
    /** Unique identifier. Format: AMD-NNN. */
    id: AmendmentIdSchema,

    /** Short description of the amendment. Must not be empty. */
    description: z
      .string()
      .min(10, "Amendment description must be at least 10 characters"),

    /**
     * Rationale for the amendment.
     * Must explain why the amendment is necessary and what it changes.
     */
    rationale: z
      .string()
      .min(20, "Amendment rationale must be at least 20 characters"),

    /**
     * UTC ISO-8601 timestamp of when this amendment was filed.
     * Must carry the Z suffix (UTC).
     */
    timestamp: z.string().datetime({ offset: true }),

    /**
     * Name or identifier of the person or authority filing this amendment.
     */
    amendedBy: z.string().min(1, "amendedBy must not be empty"),

    /**
     * The protocol sections affected by this amendment.
     * At least one section must be named.
     */
    affectedSections: z
      .array(z.string().min(1))
      .min(1, "At least one affected section must be named"),

    /**
     * Authorised reason category for this amendment.
     */
    reason: AuthorisedAmendmentReasonSchema,

    /**
     * Whether this is a prohibited retrospective amendment.
     * Must be false — retrospective amendments are categorically prohibited.
     * A record with isProhibitedRetrospective: true cannot be stored.
     */
    isProhibitedRetrospective: z.literal(false, {
      errorMap: () => ({
        message:
          "isProhibitedRetrospective must be false; retrospective amendments (filed after result inspection) are categorically prohibited",
      }),
    }),
  });

export type ProtocolAmendment = z.infer<typeof ProtocolAmendmentSchema>;

// ---------------------------------------------------------------------------
// Amendment log
// ---------------------------------------------------------------------------

/**
 * An ordered log of amendments filed against a protocol.
 * Amendment IDs must be unique. An empty log is valid (no amendments filed).
 */
export const AmendmentLogSchema = z
  .object({
    amendments: z.array(ProtocolAmendmentSchema),
  })
  .refine(
    (log) => {
      const ids = log.amendments.map((a) => a.id);
      return ids.length === new Set(ids).size;
    },
    {
      message: "Amendment IDs must be unique within the amendment log",
      path: ["amendments"],
    },
  );

export type AmendmentLog = z.infer<typeof AmendmentLogSchema>;
