/**
 * DRA-ENG-015 test support — real `pdftocairo -svg` wrapper.
 *
 * Mirrors the `extractPdfText` pattern used throughout the acquisition test
 * suite (e.g. dra-acq-021-tabular-robustness.test.ts): writes bytes to a
 * temp file, shells out to the Poppler CLI, reads the result back, cleans
 * up temp files in a `finally` block. Poppler ships pdftocairo alongside
 * pdftotext/pdftoppm/pdfinfo, all of which are already used elsewhere in
 * this test suite, so no new system dependency is introduced.
 */

import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import type { PdfSvgRenderer } from "../../representation-integrity.js";

const execFileAsync = promisify(execFile);

export const renderPdfToSvg: PdfSvgRenderer = async (bytes: Uint8Array): Promise<string> => {
  const id = `dra-eng-015-svg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const inputPath = join(tmpdir(), `${id}.pdf`);
  const outputPath = join(tmpdir(), `${id}.svg`);
  try {
    await writeFile(inputPath, bytes);
    await execFileAsync("pdftocairo", ["-svg", inputPath, outputPath], {
      maxBuffer: 1024 * 1024 * 256,
    });
    return await readFile(outputPath, "utf-8");
  } finally {
    await unlink(inputPath).catch(() => {});
    await unlink(outputPath).catch(() => {});
  }
};
