/**
 * DRA-BMK-020 — shared constants for the Run A / Run B split.
 *
 * Kept in a non-test module (not exported from a .test.ts file) so that
 * dra-bmk-020-evaluator-run-b.test.ts can import it without vitest treating
 * dra-bmk-020-evaluator-run.test.ts as also imported (and its describe/it
 * blocks re-registered) as a side effect of the import.
 */

import { tmpdir } from "os";
import { join } from "path";

// Cross-process handoff: dra-bmk-020-evaluator-run.test.ts (Run A) writes its
// summary here; dra-bmk-020-evaluator-run-b.test.ts (Run B) reads it back to
// perform the assertions that need both runs' data.
export const RUN_A_SUMMARY_PATH = join(tmpdir(), "dra-bmk-020-run-a-summary.json");
