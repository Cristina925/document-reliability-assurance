/**
 * DRA-001 — Benchmark Corpus Version Contract
 *
 * Milestone: DRA-001-04B — Benchmark Document Selection and Corpus Governance
 *
 * Replaces free-form corpus version strings with a validated, deterministic
 * format:  DRA-CORPUS-X.Y.Z
 *
 * Semantics:
 *   Patch  (Z): metadata-only corrections; no substantive document changes.
 *   Minor  (Y): additions or replacements before benchmark execution.
 *   Major  (X): materially different corpus design or selection protocol.
 *
 * Versions are immutable after corpus freeze.
 * Backward rewrites are rejected at the amendment boundary.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const CORPUS_VERSION_REGEX = /^DRA-CORPUS-(\d+)\.(\d+)\.(\d+)$/;

/** The canonical starting corpus version for a fresh benchmark corpus. */
export const INITIAL_CORPUS_VERSION = "DRA-CORPUS-1.0.0" as const;

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const CorpusVersionSchema = z
  .string()
  .regex(CORPUS_VERSION_REGEX, {
    message:
      "Corpus version must match format DRA-CORPUS-X.Y.Z (e.g. DRA-CORPUS-1.0.0)",
  });

/** A string that matches DRA-CORPUS-X.Y.Z. Use CorpusVersionSchema to validate at runtime. */
export type CorpusVersion = string;

// ---------------------------------------------------------------------------
// ParsedCorpusVersion
// ---------------------------------------------------------------------------

export interface ParsedCorpusVersion {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
  readonly raw: string;
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Parses a corpus version string into its numeric components.
 * Returns null if the string does not match the expected format.
 */
export function parseCorpusVersion(v: string): ParsedCorpusVersion | null {
  const match = CORPUS_VERSION_REGEX.exec(v);
  if (!match) return null;
  return {
    major: parseInt(match[1]!, 10),
    minor: parseInt(match[2]!, 10),
    patch: parseInt(match[3]!, 10),
    raw: v,
  };
}

/** Returns true when `v` is a valid corpus version string. */
export function isValidCorpusVersion(v: unknown): v is CorpusVersion {
  if (typeof v !== "string") return false;
  return CORPUS_VERSION_REGEX.test(v);
}

/**
 * Returns the next major version — resets minor and patch to 0.
 * Use when the corpus design or selection protocol changes materially.
 */
export function incrementMajor(v: CorpusVersion | string): CorpusVersion {
  const parsed = parseCorpusVersion(v);
  if (!parsed) throw new Error(`Invalid corpus version: ${v}`);
  return `DRA-CORPUS-${parsed.major + 1}.0.0` as CorpusVersion;
}

/**
 * Returns the next minor version — resets patch to 0.
 * Use when documents are added or replaced before benchmark execution.
 */
export function incrementMinor(v: CorpusVersion | string): CorpusVersion {
  const parsed = parseCorpusVersion(v);
  if (!parsed) throw new Error(`Invalid corpus version: ${v}`);
  return `DRA-CORPUS-${parsed.major}.${parsed.minor + 1}.0` as CorpusVersion;
}

/**
 * Returns the next patch version.
 * Use for metadata-only corrections that do not alter substantive content.
 */
export function incrementPatch(v: CorpusVersion | string): CorpusVersion {
  const parsed = parseCorpusVersion(v);
  if (!parsed) throw new Error(`Invalid corpus version: ${v}`);
  return `DRA-CORPUS-${parsed.major}.${parsed.minor}.${parsed.patch + 1}` as CorpusVersion;
}

/**
 * Compares two corpus versions.
 * Returns -1 when a < b, 0 when a === b, 1 when a > b.
 * Throws if either argument is not a valid corpus version.
 */
export function compareCorpusVersions(
  a: CorpusVersion | string,
  b: CorpusVersion | string,
): -1 | 0 | 1 {
  const pa = parseCorpusVersion(a);
  const pb = parseCorpusVersion(b);
  if (!pa) throw new Error(`Invalid corpus version: ${a}`);
  if (!pb) throw new Error(`Invalid corpus version: ${b}`);
  if (pa.major !== pb.major) return pa.major < pb.major ? -1 : 1;
  if (pa.minor !== pb.minor) return pa.minor < pb.minor ? -1 : 1;
  if (pa.patch !== pb.patch) return pa.patch < pb.patch ? -1 : 1;
  return 0;
}
