/**
 * DRA-GEN-001 Phase 2 — PDF text extractor
 *
 * Shells out to `pdftotext -layout`, exactly the pattern used by every prior
 * DRA-ACQ acquisition and DRA-BMK evaluator run (see e.g.
 * dra-acq-014-phase2-retry-admission.test.ts, dra-bmk-020-evaluator-run-b.test.ts).
 * Reused unchanged here so Phase 2 extraction is not a new, unverified code path.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { PdfExtractor } from "../../acquisition/normalisation";

const execFileAsync = promisify(execFile);

export const pdftotextExtractor: PdfExtractor = async (bytes: Uint8Array): Promise<string> => {
  const dir = await mkdtemp(join(tmpdir(), "dra-gen001-p2-pdf-"));
  const inputPath = join(dir, "input.pdf");
  const outputPath = join(dir, "output.txt");
  try {
    await writeFile(inputPath, bytes);
    await execFileAsync("pdftotext", ["-layout", inputPath, outputPath], {
      maxBuffer: 64 * 1024 * 1024,
      timeout: 60000,
    });
    return await readFile(outputPath, "utf8");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
};
