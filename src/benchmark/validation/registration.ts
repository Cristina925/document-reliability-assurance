/**
 * DRA-VAL-001A — Scientific Validation Protocol — Protocol Registration Record
 *
 * Defines the ProtocolRegistration schema — the machine-readable record
 * confirming that the validation protocol was frozen before any benchmark
 * results were inspected.
 *
 * The registration record is the public, timestamped commitment to the
 * scientific protocol. It must:
 *   - List every protocol document and its SHA-256 integrity digest
 *   - Carry the evaluator freeze identifier (DRA evaluator version used)
 *   - Explicitly state that no results were inspected at freeze time
 *   - Carry a UTC ISO-8601 freeze timestamp
 *   - Be immutable after creation
 *
 * Invariants enforced at parse time:
 *   - noResultsInspected must be literally true
 *   - filesIncluded must be non-empty
 *   - integrityDigests must have the same keys as filesIncluded
 *   - evaluatorFreezeIdentifier must be non-empty
 *   - studyStatus must be a recognised value
 */

import { z } from "zod";
import { RegistrationIdSchema, ValidationProtocolIdSchema } from "./identifiers.js";

// ---------------------------------------------------------------------------
// Study status
// ---------------------------------------------------------------------------

export const STUDY_STATUSES = [
  "PROTOCOL_DEVELOPMENT",
  "CORPUS_ACQUISITION",
  "REVIEWER_RECRUITMENT",
  "PILOT_EXECUTION",
  "MAIN_EXECUTION",
  "ANALYSIS",
  "REPORTING",
  "COMPLETE",
  "SUSPENDED",
] as const;

export type StudyStatus = (typeof STUDY_STATUSES)[number];

export const StudyStatusSchema = z.enum(
  STUDY_STATUSES as unknown as [string, ...string[]],
  {
    errorMap: () => ({
      message: `Study status must be one of: ${STUDY_STATUSES.join(", ")}`,
    }),
  },
);

// ---------------------------------------------------------------------------
// Acquisition / recruitment status
// ---------------------------------------------------------------------------

export const ACQUISITION_STATUSES = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETE",
  "SUSPENDED",
] as const;

export type AcquisitionStatus = (typeof ACQUISITION_STATUSES)[number];

export const AcquisitionStatusSchema = z.enum(
  ACQUISITION_STATUSES as unknown as [string, ...string[]],
);

// ---------------------------------------------------------------------------
// Protocol registration
// ---------------------------------------------------------------------------

/**
 * The protocol registration record.
 *
 * Created once, when the validation protocol is frozen.
 * Never modified after creation.
 */
export const ProtocolRegistrationSchema = z
  .object({
    /** Unique identifier for this registration record. Format: REG-NNN. */
    id: RegistrationIdSchema,

    /** ID of the validation protocol this registration covers. Format: DRA-VAL-NNNA. */
    protocolId: ValidationProtocolIdSchema,

    /** Version of the protocol at the time of registration. */
    protocolVersion: z
      .string()
      .min(1, "protocolVersion must not be empty"),

    /**
     * UTC ISO-8601 timestamp at which this protocol was frozen.
     * Must carry the Z suffix (UTC).
     */
    freezeTimestamp: z.string().datetime({ offset: true }),

    /**
     * Git commit SHA or equivalent repository reference at freeze time.
     * Optional when the repository reference is not available at freeze time.
     */
    repositoryCommit: z.string().optional(),

    /**
     * List of all protocol document filenames included in this registration.
     * Must be non-empty.
     */
    filesIncluded: z
      .array(z.string().min(1))
      .min(1, "filesIncluded must list at least one file"),

    /**
     * SHA-256 integrity digests keyed by filename.
     * Every filename in filesIncluded must have a corresponding entry.
     * Digest values must be 64-character hex strings.
     */
    integrityDigests: z.record(
      z.string().min(1),
      z
        .string()
        .length(64, "Integrity digest must be a 64-character SHA-256 hex string"),
    ),

    /**
     * Current status of the study at the time of registration.
     */
    studyStatus: StudyStatusSchema,

    /**
     * Current status of benchmark corpus acquisition.
     */
    benchmarkAcquisitionStatus: AcquisitionStatusSchema,

    /**
     * Current status of reviewer recruitment.
     */
    reviewerRecruitmentStatus: AcquisitionStatusSchema,

    /**
     * The frozen evaluator version identifier.
     * Records which version of the DRA evaluator will be used.
     * Must not be empty.
     */
    evaluatorFreezeIdentifier: z
      .string()
      .min(1, "evaluatorFreezeIdentifier must not be empty"),

    /**
     * Explicit attestation that no scientific benchmark results were
     * inspected when this protocol version was frozen.
     * Must be literally true — a false value or its absence rejects the record.
     */
    noResultsInspected: z.literal(true, {
      errorMap: () => ({
        message:
          "noResultsInspected must be true; the registration record must explicitly state that no results were inspected at freeze time",
      }),
    }),

    /**
     * Optional notes about the registration context.
     */
    notes: z.string().optional(),
  })
  .refine(
    (reg) => {
      for (const filename of reg.filesIncluded) {
        if (!(filename in reg.integrityDigests)) return false;
      }
      return true;
    },
    {
      message:
        "Every filename in filesIncluded must have a corresponding SHA-256 digest in integrityDigests",
      path: ["integrityDigests"],
    },
  );

export type ProtocolRegistration = z.infer<typeof ProtocolRegistrationSchema>;
