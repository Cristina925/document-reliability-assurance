/**
 * DRA-ENG-018 test support — real `pdfimages -list` / `pdfinfo` wrapper.
 *
 * Mirrors the `probePdfRepresentation` (DRA-ENG-017) injection pattern:
 * writes bytes to a temp file, shells out to Poppler CLI tools already used
 * throughout this test suite (pdfimages, pdfinfo), parses plain-text
 * output, cleans up in `finally`. No new system dependency is introduced.
 */

import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import type {
  PdfImageRegionProbe,
  PdfImageRegionSignal,
  PdfImageRegionSignals,
  PdfPageDimensionSignal,
} from "../../graphical-semantic-risk.js";

const execFileAsync = promisify(execFile);

function parsePageCount(pdfinfoOutput: string): number {
  const match = pdfinfoOutput.match(/^Pages:\s*(\d+)$/m);
  return match ? Number.parseInt(match[1], 10) : 0;
}

function parsePageSize(pdfinfoOutput: string): { widthPt: number; heightPt: number } | undefined {
  // Example: "Page size:      612 x 792 pts (letter)"
  const match = pdfinfoOutput.match(/^Page size:\s*([\d.]+)\s*x\s*([\d.]+)\s*pts/m);
  if (!match) return undefined;
  return { widthPt: Number.parseFloat(match[1]), heightPt: Number.parseFloat(match[2]) };
}

function parseImageRows(pdfimagesOutput: string): PdfImageRegionSignal[] {
  // Header: "page   num  type   width height color comp bpc  enc interp  object ID x-ppi y-ppi size ratio"
  // Data rows are whitespace-separated with a fixed column order.
  const lines = pdfimagesOutput.split("\n").filter((l) => /^\s*\d+\s+\d+\s+\S+/.test(l));
  const rows: PdfImageRegionSignal[] = [];
  for (const line of lines) {
    const cols = line.trim().split(/\s+/);
    // Header: page num type width height color comp bpc enc interp object ID x-ppi y-ppi size ratio
    // "object" and "ID" are two SEPARATE data columns (e.g. "69  0"), so
    // x-ppi/y-ppi sit at indices 12/13, not 11/12.
    const page = Number.parseInt(cols[0], 10);
    const type = cols[2];
    const widthPx = Number.parseInt(cols[3], 10);
    const heightPx = Number.parseInt(cols[4], 10);
    const xPpi = Number.parseFloat(cols[12]);
    const yPpi = Number.parseFloat(cols[13]);
    if (
      type === "smask" || // soft-mask companion of a preceding "image" row; skip to avoid double-counting
      !Number.isFinite(page) ||
      !Number.isFinite(widthPx) ||
      !Number.isFinite(heightPx) ||
      !Number.isFinite(xPpi) ||
      !Number.isFinite(yPpi)
    ) {
      continue;
    }
    rows.push({ page, widthPx, heightPx, xPpi, yPpi });
  }
  return rows;
}

export const probePdfImageRegions: PdfImageRegionProbe = async (
  bytes: Uint8Array,
): Promise<PdfImageRegionSignals> => {
  const id = `dra-eng-018-probe-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const inputPath = join(tmpdir(), `${id}.pdf`);
  try {
    await writeFile(inputPath, bytes);

    const [infoResult, imagesResult] = await Promise.all([
      execFileAsync("pdfinfo", [inputPath], { maxBuffer: 1024 * 1024 * 64 }).catch((err) => {
        throw new Error(`pdfinfo failed: ${err instanceof Error ? err.message : String(err)}`);
      }),
      execFileAsync("pdfimages", ["-list", inputPath], { maxBuffer: 1024 * 1024 * 64 }).catch(() => ({
        stdout: "",
        stderr: "",
      })),
    ]);

    const pageCount = parsePageCount(infoResult.stdout);
    const uniformSize = parsePageSize(infoResult.stdout);
    const pageDimensions: PdfPageDimensionSignal[] = uniformSize
      ? [{ page: 1, widthPt: uniformSize.widthPt, heightPt: uniformSize.heightPt }]
      : [];
    const images = parseImageRows(imagesResult.stdout);

    return { images, pageDimensions, pageCount };
  } finally {
    await unlink(inputPath).catch(() => {});
  }
};
