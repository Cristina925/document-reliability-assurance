/**
 * DRA-ENG-017 test support — real `pdfinfo`/`pdffonts` wrapper.
 *
 * Mirrors the `renderPdfToSvg` (DRA-ENG-015) and `extractPdfText` injection
 * patterns already used throughout the acquisition test suite: writes bytes
 * to a temp file, shells out to the Poppler CLI (pdfinfo/pdffonts ship
 * alongside pdftotext/pdftoppm/pdftocairo, all already used elsewhere in
 * this test suite), parses the plain-text output, cleans up in `finally`.
 *
 * No new system dependency is introduced.
 */

import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import type { PdfRepresentationProber, PdfRepresentationProbeSignals } from "../../representation-provenance.js";

const execFileAsync = promisify(execFile);

function parsePdfInfoField(pdfinfoOutput: string, field: string): string | undefined {
  const re = new RegExp(`^${field}:\\s*(.+)$`, "m");
  const match = pdfinfoOutput.match(re);
  return match ? match[1].trim() : undefined;
}

function parsePageCount(pdfinfoOutput: string): number | undefined {
  const raw = parsePdfInfoField(pdfinfoOutput, "Pages");
  if (raw === undefined) return undefined;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : undefined;
}

function parseFontRows(pdffontsOutput: string): { name: string; embedded: boolean }[] {
  // pdffonts output format: a header line, a "---" separator line, then one
  // row per font: "<name> <type> <encoding> <emb> <sub> <uni> <object ID>".
  // Columns are whitespace-separated; "emb" is "yes"/"no".
  const lines = pdffontsOutput.split("\n").filter((l) => l.trim().length > 0);
  const dataLines = lines.slice(2); // skip header + separator
  return dataLines
    .map((l) => {
      const cols = l.trim().split(/\s+/);
      const name = cols[0];
      // "emb" is the 4th column (name, type, encoding, emb, sub, uni, id).
      const emb = cols[3];
      return name ? { name, embedded: emb === "yes" } : null;
    })
    .filter((row): row is { name: string; embedded: boolean } => row !== null);
}

export const probePdfRepresentation: PdfRepresentationProber = async (
  bytes: Uint8Array,
): Promise<PdfRepresentationProbeSignals> => {
  const id = `dra-eng-017-probe-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const inputPath = join(tmpdir(), `${id}.pdf`);
  try {
    await writeFile(inputPath, bytes);

    const [infoResult, fontsResult, textResult] = await Promise.all([
      execFileAsync("pdfinfo", [inputPath], { maxBuffer: 1024 * 1024 * 64 }).catch((err) => {
        throw new Error(`pdfinfo failed: ${err instanceof Error ? err.message : String(err)}`);
      }),
      execFileAsync("pdffonts", [inputPath], { maxBuffer: 1024 * 1024 * 64 }).catch(() => ({
        stdout: "",
        stderr: "",
      })),
      execFileAsync("pdftotext", ["-layout", inputPath, "-"], { maxBuffer: 1024 * 1024 * 512 }).catch(() => ({
        stdout: "",
        stderr: "",
      })),
    ]);

    const creator = parsePdfInfoField(infoResult.stdout, "Creator");
    const producer = parsePdfInfoField(infoResult.stdout, "Producer");
    const pageCount = parsePageCount(infoResult.stdout);
    const fontRows = parseFontRows(fontsResult.stdout);

    return {
      creator,
      producer,
      pageCount,
      embeddedFontCount: fontRows.length,
      trueEmbeddedFontCount: fontRows.filter((f) => f.embedded).length,
      fontNames: fontRows.map((f) => f.name),
      extractedTextLength: textResult.stdout.length,
    };
  } finally {
    await unlink(inputPath).catch(() => {});
  }
};
