/**
 * DRA-001 — Stage 3: Authority Resolution — Public Surface
 *
 * Milestone: DRA-ENG-005 — Authority Resolution
 *
 * @module dra-reference/authority-resolution
 */

// Entry point
export { resolveAuthority, RESOLUTION_RULE_VERSION } from "./resolve-authority.js";

// Result types
export { STAGE_3_ID, STAGE_3_VERSION } from "./resolution-result.js";
export type {
  Stage3Result,
  Stage3Success,
  Stage3Failure,
  Stage3Id,
} from "./resolution-result.js";

// Authority classification
export {
  AUTHORITY_CLASSIFICATIONS,
  AUTHORITY_TYPES,
  isAuthorityClassification,
  isAuthorityType,
} from "./authority-classification.js";
export type {
  AuthorityClassification,
  AuthorityType,
} from "./authority-classification.js";

// Record types
export type {
  AuthorityRecord,
  AuthoritySpan,
  StatementSpan,
  Stage3ResolutionRecord,
} from "./authority-record.js";

// Attribution patterns
export { detectAttribution, detectAuthorityType } from "./attribution-patterns.js";

// Span validation
export { validateAuthoritySpan } from "./authority-span-validation.js";

// Record identifiers
export {
  makeAuthorityRecordId,
  parseAuthorityRecordId,
  STAGE_3_RECORD_ID_PREFIX,
} from "./record-identifiers.js";
