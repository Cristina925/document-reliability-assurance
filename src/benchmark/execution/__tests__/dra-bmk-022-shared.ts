/**
 * DRA-BMK-022 test support — cross-process handoff constant.
 *
 * Run A (dra-bmk-022-evaluator-run.test.ts) writes its summary JSON to this
 * path; Run B (dra-bmk-022-evaluator-run-b.test.ts) reads it back to perform
 * cross-run reproducibility assertions. This mirrors the DRA-BMK-020/021
 * shared module — a separate, non-test module so importing it in either test
 * file never causes vitest to re-register the other file's describe/it
 * blocks.
 */

import { tmpdir } from "os";
import { join } from "path";

export const RUN_A_SUMMARY_PATH = join(tmpdir(), "dra-bmk-022-run-a-summary.json");
