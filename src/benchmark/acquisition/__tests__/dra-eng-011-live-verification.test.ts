/**
 * DRA-ENG-011 — Robust Media-Type Detection for Controlled Acquisition
 * Tests: dra-eng-011-live-verification.test.ts — LIVE network verification
 *
 * This is a SEPARATE live test (per task spec section 5: "a separate live
 * verification test may be used ... but environmental instability must not
 * make the engineering regression suite unreliable"). The deterministic,
 * network-free regression coverage lives in
 * dra-eng-011-http-fetcher-fallback.test.ts and
 * dra-eng-011-media-type-detection.test.ts; this file only confirms that the
 * fix resolves the exact live DRA-ACQ-014 blocker.
 *
 * This test performs NO acquisition, freeze, corpus, or governance mutation.
 * It only calls createHttpFetcher() directly against the same live URL
 * exercised during DRA-ACQ-014 Phase 2, replacing the earlier diagnostic
 * test (dra-acq-014-phase2-acquisition-blocker.test.ts, removed) which
 * documented the pre-fix rejection. DRA-DOC-0018 / DRA-ACQ-014 Phase 2
 * retry is explicitly NOT performed here per the DRA-ENG-011 scope boundary.
 */

import { describe, it, expect } from "vitest";
import { createHttpFetcher } from "../http-fetcher.js";
import { createAcquisitionRequest } from "../request.js";
import { computeSourceDigest } from "../integrity.js";

const EC_ETHICS_ES_PDF_URL = "https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60423";

// Digest recorded during DRA-ACQ-014 Phase 1 discovery and re-confirmed
// during Phase 2 re-verification (two independent live fetches, 2026-08-07).
const EXPECTED_DIGEST =
  "1a678b59b73bd9f6ef457899cd0319fa7e776545cb51c12c86990c86e35926a2";

describe("DRA-ENG-011 — live verification: EC Ethics Guidelines acquisition blocker resolved", () => {
  it(
    "the malformed Content-Type: application/ response from ec.europa.eu is now classified as " +
      "application/pdf via the narrow fallback, and the fetch succeeds",
    async () => {
      const fetcher = createHttpFetcher({
        timeoutMs: 60_000,
        maxRedirects: 5,
        maxBytes: 15_000_000,
        userAgent: "DRA-ENG-011/1.0",
        allowHttp: false,
      });

      const requestResult = createAcquisitionRequest({
        acquisitionId: "DRA-ACQ-000021",
        sourceUrl: EC_ETHICS_ES_PDF_URL,
        requestedBy: "dra-eng-011-live-verification",
        requestedAt: "2026-08-07T10:00:00.000Z",
        expectedPublisher: "European Commission — High-Level Expert Group on Artificial Intelligence",
        expectedTitle:
          "Directrices éticas para una IA fiable (Ethics Guidelines for Trustworthy AI — Spanish edition)",
      });
      expect(requestResult.ok).toBe(true);
      if (!requestResult.ok) return;

      const result = await fetcher(requestResult.request, {});

      if (!result.ok) {
        console.error("DRA-ENG-011 live verification FAILED:", result.code, result.message);
      }
      expect(result.ok).toBe(true);
      if (!result.ok) return;

      console.log("DRA-ENG-011 live verification: fetch succeeded");
      console.log("  mediaType           :", result.source.mediaType);
      console.log("  raw Content-Type    :", result.source.httpResponseHeaders?.contentType);
      console.log("  Content-Disposition :", result.source.httpResponseHeaders?.contentDisposition);
      console.log("  sourceDigest        :", computeSourceDigest(result.source.rawBytes));

      expect(result.source.mediaType).toBe("application/pdf");
      // The malformed header itself is unchanged — the server still sends it;
      // we now classify around it rather than requiring the server to fix it.
      expect(result.source.httpResponseHeaders?.contentType).toBe("application/");
      expect(computeSourceDigest(result.source.rawBytes)).toBe(EXPECTED_DIGEST);
    },
    120_000,
  );
});
