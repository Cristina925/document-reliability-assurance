/**
 * DRA-001 — Corpus Acquisition Pipeline
 *
 * Milestone: DRA-001-04C — Benchmark Document Acquisition and Initial Corpus Population
 *
 * The pipeline accepts raw document inputs, validates them, assigns immutable
 * corpus identifiers, builds content payloads with SHA-256 integrity, and
 * attaches provenance records.  The output is an `AcquiredDocument`, which
 * satisfies the `CorpusCandidate` interface required by the governance layer
 * and carries the additional `provenance` field.
 *
 * Pipeline does NOT:
 *   - invoke the evaluator;
 *   - admit or reject documents (that is the governance layer's job);
 *   - modify document content in any way.
 */

import { buildContentPayload, type CorpusCandidate } from "../governance/eligibility.js";
import {
  buildProvenance,
  type ProvenanceRecord,
  type AcquisitionSource,
  type LicenceStatus,
} from "./provenance.js";
import type {
  Domain,
  DocumentType,
  Difficulty,
  SourceType,
  BenchmarkStatus,
  CorpusId,
} from "../corpus/schema.js";

// ---------------------------------------------------------------------------
// AcquisitionInput — raw input to the pipeline
// ---------------------------------------------------------------------------

export interface AcquisitionInput {
  // Provenance metadata
  readonly originalFilename: string;
  readonly acquisitionSource: AcquisitionSource;
  readonly documentOrigin: string;
  readonly licenceStatus: LicenceStatus;
  readonly licenceDetails?: string;
  /** ISO 8601 datetime when the document was acquired. */
  readonly acquisitionDate: string;

  // Corpus classification metadata
  readonly title: string;
  readonly domain: Domain;
  readonly documentType: DocumentType;
  readonly difficulty: Difficulty;
  readonly sourceType: SourceType;
  readonly language: string;
  readonly generator: string;
  readonly creationMethod: string;
  readonly sourceReference: string;
  readonly benchmarkStatus: BenchmarkStatus;

  // Document content
  /** The original source material that was provided to the generator. */
  readonly sourceText: string;
  /** The generated document output — the primary content to be benchmarked. */
  readonly generatedText: string;

  // Governance flags
  readonly evaluatorInfluenced: boolean;
  readonly hasPreannotatedOutcome: boolean;
  readonly sourceVerifiable: boolean;
}

// ---------------------------------------------------------------------------
// AcquiredDocument — pipeline output
// ---------------------------------------------------------------------------

/**
 * A document that has passed through the acquisition pipeline.
 * Satisfies `CorpusCandidate` so it can be passed directly to the
 * governance admission workflow without conversion.
 */
export interface AcquiredDocument extends CorpusCandidate {
  /** Immutable provenance record for this document. */
  readonly provenance: ProvenanceRecord;
}

// ---------------------------------------------------------------------------
// AcquisitionError
// ---------------------------------------------------------------------------

export type AcquisitionErrorCode =
  | "INVALID_UTF8"
  | "EMPTY_SOURCE_CONTENT"
  | "EMPTY_GENERATED_CONTENT"
  | "EMPTY_FILENAME"
  | "EMPTY_ORIGIN"
  | "INVALID_ACQUISITION_DATE";

export class AcquisitionError extends Error {
  public readonly code: AcquisitionErrorCode;
  constructor(message: string, code: AcquisitionErrorCode) {
    super(message);
    this.name = "AcquisitionError";
    this.code = code;
    Object.setPrototypeOf(this, AcquisitionError.prototype);
  }
}

// ---------------------------------------------------------------------------
// UTF-8 validation
// ---------------------------------------------------------------------------

/**
 * Validates that the string contains no lone surrogates and can be faithfully
 * round-tripped through UTF-8 encoding.  JavaScript strings are UTF-16; a
 * lone surrogate (U+D800–U+DFFF without a pair partner) is not valid Unicode
 * and would produce a malformed UTF-8 byte sequence.
 */
function validateUtf8(text: string): boolean {
  try {
    const buf = Buffer.from(text, "utf8");
    return buf.toString("utf8") === text;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// AcquisitionPipeline
// ---------------------------------------------------------------------------

/**
 * Stateful pipeline that processes raw document inputs and returns `AcquiredDocument`
 * objects with auto-assigned sequential corpus IDs.
 *
 * Each pipeline instance maintains its own ID counter, starting from `startingId`.
 * IDs are assigned in the order `acquire()` is called.
 */
export class AcquisitionPipeline {
  private _counter: number;

  /**
   * @param startingId The first numeric sequence value to use (default 1).
   *                   Set to a higher value to continue an existing sequence.
   */
  constructor(startingId = 1) {
    this._counter = startingId;
  }

  private _nextId(): CorpusId {
    const id = `DRA-DOC-${String(this._counter).padStart(4, "0")}` as CorpusId;
    this._counter++;
    return id;
  }

  /**
   * Processes a single `AcquisitionInput` through the pipeline.
   *
   * Steps:
   *   1. Validate non-empty required string fields.
   *   2. Validate UTF-8 encoding of both content fields.
   *   3. Assign the next sequential corpus ID.
   *   4. Build `ContentPayload` objects (source and generated), computing SHA-256.
   *   5. Build `ProvenanceRecord` using the generated content digest.
   *   6. Return a frozen `AcquiredDocument`.
   *
   * @throws AcquisitionError on any validation failure.
   */
  acquire(input: AcquisitionInput): AcquiredDocument {
    // Field presence validation
    if (!input.originalFilename.trim()) {
      throw new AcquisitionError(
        "originalFilename must not be empty",
        "EMPTY_FILENAME",
      );
    }
    if (!input.documentOrigin.trim()) {
      throw new AcquisitionError(
        "documentOrigin must not be empty",
        "EMPTY_ORIGIN",
      );
    }
    if (!input.sourceText.trim()) {
      throw new AcquisitionError(
        "sourceText must not be empty",
        "EMPTY_SOURCE_CONTENT",
      );
    }
    if (!input.generatedText.trim()) {
      throw new AcquisitionError(
        "generatedText must not be empty",
        "EMPTY_GENERATED_CONTENT",
      );
    }

    // Acquisition date presence (value validation is left to the governance layer)
    if (!input.acquisitionDate.trim()) {
      throw new AcquisitionError(
        "acquisitionDate must not be empty",
        "INVALID_ACQUISITION_DATE",
      );
    }

    // UTF-8 validation
    if (!validateUtf8(input.sourceText)) {
      throw new AcquisitionError(
        "sourceText contains invalid UTF-8 sequences (lone surrogates detected)",
        "INVALID_UTF8",
      );
    }
    if (!validateUtf8(input.generatedText)) {
      throw new AcquisitionError(
        "generatedText contains invalid UTF-8 sequences (lone surrogates detected)",
        "INVALID_UTF8",
      );
    }

    // Assign ID and build content
    const corpusId = this._nextId();
    const sourceContent = buildContentPayload(input.sourceText, "SOURCE");
    const generatedContent = buildContentPayload(input.generatedText, "GENERATED");

    // Build provenance — content digest ties to the generated document
    const provenance = buildProvenance({
      acquisitionSource: input.acquisitionSource,
      acquisitionDate: input.acquisitionDate,
      documentOrigin: input.documentOrigin,
      originalFilename: input.originalFilename,
      licenceStatus: input.licenceStatus,
      licenceDetails: input.licenceDetails,
      contentDigest: generatedContent.contentDigest,
    });

    const doc: AcquiredDocument = Object.freeze({
      corpusId,
      title: input.title,
      sourceType: input.sourceType,
      documentType: input.documentType,
      domain: input.domain,
      language: input.language,
      generator: input.generator,
      creationMethod: input.creationMethod,
      difficulty: input.difficulty,
      sourceReference: input.sourceReference,
      benchmarkStatus: input.benchmarkStatus,
      sourceContent,
      generatedContent,
      evaluatorInfluenced: input.evaluatorInfluenced,
      hasPreannotatedOutcome: input.hasPreannotatedOutcome,
      sourceVerifiable: input.sourceVerifiable,
      provenance,
    });

    return doc;
  }

  /** Numeric value that will be used for the NEXT document ID. */
  get nextSequenceValue(): number {
    return this._counter;
  }

  /** Number of documents processed so far. */
  get processedCount(): number {
    return this._counter - 1;
  }
}
