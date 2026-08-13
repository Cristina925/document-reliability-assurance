/**
 * DRA-ENG-024 — Production PdfLayoutProber
 * Module: pdf-layout-prober.ts
 *
 * Extracts positioned text blocks per page from PDF bytes using
 * `pdftotext -bbox-layout` (the same Poppler toolchain already used
 * elsewhere in this package for `-layout` extraction and for the
 * DRA-ACQ-030 Phase 2 oracle construction). No new npm dependency is
 * introduced.
 *
 * `-bbox-layout` emits an XHTML-like document with one <block> element per
 * paragraph/line group, each carrying xMin/yMin/xMax/yMax attributes and
 * nested <word> elements. This module parses that output into the
 * `LayoutPage[]` shape consumed by column-layout-reconstruction.ts.
 */

import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import type { LayoutBlock, LayoutPage, PdfLayoutProber } from "./column-layout-reconstruction.js";

const execFileAsync = promisify(execFile);

const PAGE_RE = /<page width="([0-9.]+)" height="([0-9.]+)">([\s\S]*?)<\/page>/g;
const BLOCK_RE =
  /<block xMin="([0-9.]+)" yMin="([0-9.]+)" xMax="([0-9.]+)" yMax="([0-9.]+)">([\s\S]*?)<\/block>/g;
const WORD_RE = /<word[^>]*>([^<]*)<\/word>/g;

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

/** Parses `pdftotext -bbox-layout` XML output into LayoutPage[]. Exported
 * separately so tests can exercise the parser against fixture XML without
 * shelling out to pdftotext. */
export function parseBboxLayoutXml(xml: string): LayoutPage[] {
  const pages: LayoutPage[] = [];
  let pageMatch: RegExpExecArray | null;
  let pageNumber = 0;

  PAGE_RE.lastIndex = 0;
  while ((pageMatch = PAGE_RE.exec(xml)) !== null) {
    pageNumber += 1;
    const [, widthStr, heightStr, pageBody] = pageMatch;
    const blocks: LayoutBlock[] = [];

    BLOCK_RE.lastIndex = 0;
    let blockMatch: RegExpExecArray | null;
    while ((blockMatch = BLOCK_RE.exec(pageBody)) !== null) {
      const [, xMinStr, yMinStr, xMaxStr, yMaxStr, inner] = blockMatch;
      const words: string[] = [];
      WORD_RE.lastIndex = 0;
      let wordMatch: RegExpExecArray | null;
      while ((wordMatch = WORD_RE.exec(inner)) !== null) {
        words.push(decodeXmlEntities(wordMatch[1]));
      }
      const text = words.join(" ").trim();
      if (text.length === 0) continue;
      blocks.push({
        xMin: parseFloat(xMinStr),
        yMin: parseFloat(yMinStr),
        xMax: parseFloat(xMaxStr),
        yMax: parseFloat(yMaxStr),
        text,
      });
    }

    pages.push({
      pageNumber,
      blocks,
      pageWidth: parseFloat(widthStr),
      pageHeight: parseFloat(heightStr),
    });
  }

  return pages;
}

/**
 * Production PdfLayoutProber: shells out to `pdftotext -bbox-layout`.
 * Throws on extraction failure — callers (column-layout-reconstruction
 * integration in normalisation.ts) must treat a thrown error as "no layout
 * evidence available" and fall back to plain-text passthrough, exactly as
 * the existing PdfExtractor contract already requires.
 */
export const createPdfLayoutProber = (): PdfLayoutProber => {
  return async (bytes: Uint8Array): Promise<readonly LayoutPage[]> => {
    const id = `dra-eng024-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const inputPath = join(tmpdir(), `${id}.pdf`);
    const outputPath = join(tmpdir(), `${id}.bbox.xml`);
    try {
      await writeFile(inputPath, bytes);
      await execFileAsync("pdftotext", ["-bbox-layout", inputPath, outputPath]);
      const xml = await readFile(outputPath, "utf-8");
      return parseBboxLayoutXml(xml);
    } finally {
      await unlink(inputPath).catch(() => {});
      await unlink(outputPath).catch(() => {});
    }
  };
};
