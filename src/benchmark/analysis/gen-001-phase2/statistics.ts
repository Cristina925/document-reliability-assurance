/**
 * DRA-GEN-001 Phase 2 — statistical uncertainty methods.
 *
 * No Wilson-score/rule-of-three implementation existed anywhere in the repo
 * prior to Phase 2 (confirmed by explorer search of lib/dra-reference/src);
 * the protocol document (dra-gen-001-protocol.ts Section 8) describes the
 * method in prose only. This module implements the two standard formulas
 * referenced there, using the textbook definitions, so Phase 2's primary-
 * endpoint confidence intervals are computed reproducibly rather than by
 * hand for each endpoint.
 */

const Z_95 = 1.959963984540054; // two-sided 95% normal quantile

export interface WilsonInterval {
  readonly x: number;
  readonly n: number;
  readonly pointEstimate: number;
  readonly lowerBound: number;
  readonly upperBound: number;
  readonly method: "WILSON_SCORE_95PCT";
}

/** Wilson score interval for a binomial proportion x/n at 95% confidence. */
export function wilsonInterval(x: number, n: number): WilsonInterval {
  if (n === 0) {
    return { x, n, pointEstimate: NaN, lowerBound: NaN, upperBound: NaN, method: "WILSON_SCORE_95PCT" };
  }
  const p = x / n;
  const z2 = Z_95 * Z_95;
  const denominator = 1 + z2 / n;
  const center = (p + z2 / (2 * n)) / denominator;
  const margin = (Z_95 * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / denominator;
  return {
    x,
    n,
    pointEstimate: p,
    lowerBound: Math.max(0, center - margin),
    upperBound: Math.min(1, center + margin),
    method: "WILSON_SCORE_95PCT",
  };
}

export interface RuleOfThreeBound {
  readonly n: number;
  readonly upperBoundOnTrueRate: number;
  readonly method: "RULE_OF_THREE_95PCT";
}

/**
 * Rule-of-three: when 0 events are observed in n independent trials, the
 * 95%-confidence upper bound on the true event rate is approximately 3/n.
 * Used here for MATERIAL_FAILURE_RATE / PIPELINE_COMPLETION_RATE /
 * PROOF_INTEGRITY_RATE / DETERMINISM_REPEATABILITY_RATE when the observed
 * count is exactly 0 (Wilson's own lower/upper bound already handles the
 * non-zero case; rule-of-three is the specifically-recommended small-sample
 * approximation for the zero-count edge case referenced in the protocol's
 * sample-size justification, Section 8).
 */
export function ruleOfThreeUpperBound(n: number): RuleOfThreeBound {
  return { n, upperBoundOnTrueRate: n === 0 ? NaN : 3 / n, method: "RULE_OF_THREE_95PCT" };
}

export interface RateEndpointResult {
  readonly endpointId: string;
  readonly numerator: number;
  readonly denominator: number;
  readonly pointEstimate: number;
  readonly wilson: WilsonInterval;
  readonly ruleOfThreeUpperBoundIfZero: number | null;
}

export function computeRateEndpoint(endpointId: string, numerator: number, denominator: number): RateEndpointResult {
  const wilson = wilsonInterval(numerator, denominator);
  return {
    endpointId,
    numerator,
    denominator,
    pointEstimate: denominator === 0 ? NaN : numerator / denominator,
    wilson,
    ruleOfThreeUpperBoundIfZero: numerator === 0 && denominator > 0 ? ruleOfThreeUpperBound(denominator).upperBoundOnTrueRate : null,
  };
}
