/**
 * DRA-001 — Benchmark Corpus Manifest
 *
 * Milestone: DRA-001-04A — Benchmark Corpus Schema and Registry
 *
 * Re-exports manifest types and provides verification utilities.
 * The manifest builder is on CorpusRegistry.exportManifest().
 */

export type { CorpusManifest } from "./schema.js";
export { CorpusManifestSchema, CORPUS_SCHEMA_VERSION } from "./schema.js";
export { verifyManifestIntegrity, computeManifestDigest } from "./integrity.js";
