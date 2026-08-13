/**
 * DRA-001 — Pipeline Integration — Public Surface
 *
 * Milestone: DRA-ENG-010 — Evaluator Integration
 */

// Top-level evaluator entry point
export { evaluateDocument } from "./evaluate-document.js";

// Result types
export {
  type DocumentAssuranceEvaluation,
  type DocumentAssuranceSuccess,
  type DocumentAssuranceFailure,
} from "./evaluation-result.js";

// Decision derivation
export { deriveDecision, type DecisionResult } from "./derive-decision.js";

// Proof receipt builder
export {
  buildProofReceipt,
  type BuildReceiptParams,
} from "./build-proof-receipt.js";

// Canonical serialisation and integrity verification (DRA-ENG-008B)
export {
  canonicalJsonStringify,
  computeDigestFromPayload,
  verifyReceiptIntegrity,
  extractDocumentIdentitySubstantive,
  type SubstantivePayloadInput,
} from "./canonical-serialise.js";
