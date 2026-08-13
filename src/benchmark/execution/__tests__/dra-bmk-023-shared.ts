/**
 * DRA-BMK-023 test support — cross-process handoff constants.
 * Mirrors the DRA-BMK-022 pattern (see dra-bmk-022-shared.ts).
 */

import { join } from "path";

// NOTE: uses a workspace-local scratch directory (not os.tmpdir()) because
// /tmp has been observed to be cleared across sandbox restarts mid-run,
// which silently discarded a prior run's group JSON hand-off files.
export const BMK023_SCRATCH_DIR = join(import.meta.dirname, ".bmk-023-scratch");

export const RUN_A_SUMMARY_PATH = join(BMK023_SCRATCH_DIR, "dra-bmk-023-run-a-summary.json");
export const RUN_B_SUMMARY_PATH = join(BMK023_SCRATCH_DIR, "dra-bmk-023-run-b-summary.json");

/** Full issue+statement detail dumps for DRA-DOC-0023 (spec Parts 5-7 structural analysis). */
export const DOC23_DETAIL_A_PATH = join(BMK023_SCRATCH_DIR, "dra-bmk-023-doc23-detail-a.json");
export const DOC23_DETAIL_B_PATH = join(BMK023_SCRATCH_DIR, "dra-bmk-023-doc23-detail-b.json");
