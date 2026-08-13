/**
 * DRA-ENG-009 — Governed Benchmark Acquisition and Freeze Pipeline
 * Module: metadata.ts — Document metadata extraction and approval
 *
 * Defines ExtractedMetadataField<T>, DocumentMetadata (all fields as
 * confidence-tagged fields), and ApprovedMetadata (human-reviewed output).
 *
 * Invariants:
 *   - No values are invented; a missing field is represented as absent.
 *   - Manual overrides remain explicit (source = "MANUAL").
 *   - Word count is derived from normalised text only, not raw bytes.
 *   - ApprovedMetadata uses corpus-schema types directly for corpus integration.
 */

import type { Domain, DocumentType, Difficulty } from "../corpus/schema.js";

// ---------------------------------------------------------------------------
// Metadata source and confidence
// ---------------------------------------------------------------------------

export const METADATA_SOURCES = [
  "DOCUMENT",
  "HTTP_HEADER",
  "URL",
  "MANUAL",
] as const;

export type MetadataSource = (typeof METADATA_SOURCES)[number];

export const METADATA_CONFIDENCE_LEVELS = ["HIGH", "MEDIUM", "LOW"] as const;

export type MetadataConfidence = (typeof METADATA_CONFIDENCE_LEVELS)[number];

// ---------------------------------------------------------------------------
// ExtractedMetadataField<T>
// ---------------------------------------------------------------------------

/**
 * A single metadata field extracted from a source document.
 * When the field could not be determined, value is absent.
 */
export interface ExtractedMetadataField<T> {
  readonly value?: T;
  readonly source: MetadataSource;
  readonly confidence: MetadataConfidence;
}

// ---------------------------------------------------------------------------
// DocumentMetadata — raw extracted metadata (pre-human-review)
// ---------------------------------------------------------------------------

/**
 * Extracted metadata for an acquired document.
 * All fields are optional; absence indicates the information was not found.
 */
export interface DocumentMetadata {
  readonly title: ExtractedMetadataField<string>;
  readonly publisher: ExtractedMetadataField<string>;
  readonly publicationDate: ExtractedMetadataField<string>;
  readonly version: ExtractedMetadataField<string>;
  readonly language: ExtractedMetadataField<string>;
  readonly description: ExtractedMetadataField<string>;
  readonly wordCount: ExtractedMetadataField<number>;
}

// ---------------------------------------------------------------------------
// ApprovedMetadata — post-human-review, corpus-ready metadata
// ---------------------------------------------------------------------------

/**
 * Human-approved metadata ready for corpus integration.
 *
 * Domain, documentType, and difficulty use the corpus schema's enum literals
 * so they can be passed directly to CorpusDocumentInput without mapping.
 *
 * These values must be explicitly approved by a human reviewer.
 * The machine may suggest them from extracted metadata, but must not
 * automatically populate them for the freeze record.
 */
export interface ApprovedMetadata {
  readonly title: string;
  readonly publisher: string;
  readonly publicationDate: string;
  readonly version?: string;
  /** Corpus domain — one of GENERAL | BUSINESS | TECHNICAL | LEGAL | HEALTHCARE | FINANCE. */
  readonly domain: Domain;
  /** Corpus document type — one of SUMMARY | REWRITE | REPORT | ... | OTHER. */
  readonly documentType: DocumentType;
  /** Corpus difficulty — one of LOW | MEDIUM | HIGH. */
  readonly difficulty: Difficulty;
  /** BCP-47 language code, e.g. "en". */
  readonly language: string;
  /** Word count of the normalised text. */
  readonly wordCount?: number;
}

// ---------------------------------------------------------------------------
// Word count
// ---------------------------------------------------------------------------

/**
 * Counts words in a normalised text string.
 * A word is a sequence of non-whitespace characters.
 */
export function computeWordCount(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/).length;
}

// ---------------------------------------------------------------------------
// HTML metadata extraction
// ---------------------------------------------------------------------------

/**
 * Extracts metadata fields from a normalised HTML string.
 * Uses simple pattern matching; does not require a full HTML parser.
 */
export function extractMetadataFromHtml(html: string): DocumentMetadata {
  const getMetaContent = (name: string): string | undefined => {
    const patterns = [
      new RegExp(
        `<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`,
        "i",
      ),
      new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`,
        "i",
      ),
    ];
    for (const pattern of patterns) {
      const match = pattern.exec(html);
      if (match?.[1]) return match[1].trim();
    }
    return undefined;
  };

  const getTitleTag = (): string | undefined => {
    const match = /<title[^>]*>([^<]+)<\/title>/i.exec(html);
    return match?.[1]?.trim();
  };

  const rawTitle = getTitleTag() ?? getMetaContent("title") ?? getMetaContent("og:title");
  const rawPublisher =
    getMetaContent("publisher") ??
    getMetaContent("author") ??
    getMetaContent("og:site_name");
  const rawDate =
    getMetaContent("date") ??
    getMetaContent("dcterms.date") ??
    getMetaContent("article:published_time");
  const rawLang =
    /lang=["']([a-z]{2}(?:-[A-Z]{2})?)["']/i.exec(html)?.[1] ??
    getMetaContent("language");
  const rawDescription =
    getMetaContent("description") ?? getMetaContent("og:description");

  return {
    title: rawTitle
      ? { value: rawTitle, source: "DOCUMENT", confidence: "HIGH" }
      : { source: "DOCUMENT", confidence: "LOW" },
    publisher: rawPublisher
      ? { value: rawPublisher, source: "DOCUMENT", confidence: "MEDIUM" }
      : { source: "DOCUMENT", confidence: "LOW" },
    publicationDate: rawDate
      ? { value: rawDate, source: "DOCUMENT", confidence: "MEDIUM" }
      : { source: "DOCUMENT", confidence: "LOW" },
    version: { source: "DOCUMENT", confidence: "LOW" },
    language: rawLang
      ? { value: rawLang, source: "DOCUMENT", confidence: "HIGH" }
      : { source: "DOCUMENT", confidence: "LOW" },
    description: rawDescription
      ? { value: rawDescription, source: "DOCUMENT", confidence: "MEDIUM" }
      : { source: "DOCUMENT", confidence: "LOW" },
    wordCount: { source: "DOCUMENT", confidence: "LOW" },
  };
}

// ---------------------------------------------------------------------------
// Markdown metadata extraction
// ---------------------------------------------------------------------------

/**
 * Extracts metadata from a Markdown document.
 * Supports YAML front matter (--- delimiters) and first-heading title.
 */
export function extractMetadataFromMarkdown(markdown: string): DocumentMetadata {
  let frontMatter: Record<string, string> = {};
  let body = markdown;

  // YAML front matter
  const fmMatch = /^---\r?\n([\s\S]*?)\r?\n---/.exec(markdown);
  if (fmMatch?.[1]) {
    body = markdown.slice(fmMatch[0].length);
    for (const line of fmMatch[1].split("\n")) {
      const kv = /^(\w+):\s*(.+)$/.exec(line.trim());
      if (kv?.[1] && kv?.[2]) {
        frontMatter[kv[1].toLowerCase()] = kv[2].trim().replace(/^["']|["']$/g, "");
      }
    }
  }

  // First H1 or H2 heading as title fallback
  const headingMatch = /^#{1,2}\s+(.+)$/m.exec(body);
  const titleFromHeading = headingMatch?.[1]?.trim();

  const rawTitle = frontMatter["title"] ?? titleFromHeading;
  const rawPublisher = frontMatter["author"] ?? frontMatter["publisher"];
  const rawDate = frontMatter["date"] ?? frontMatter["published"];
  const rawLang = frontMatter["lang"] ?? frontMatter["language"];

  return {
    title: rawTitle
      ? { value: rawTitle, source: "DOCUMENT", confidence: rawTitle === titleFromHeading ? "MEDIUM" : "HIGH" }
      : { source: "DOCUMENT", confidence: "LOW" },
    publisher: rawPublisher
      ? { value: rawPublisher, source: "DOCUMENT", confidence: "MEDIUM" }
      : { source: "DOCUMENT", confidence: "LOW" },
    publicationDate: rawDate
      ? { value: rawDate, source: "DOCUMENT", confidence: "MEDIUM" }
      : { source: "DOCUMENT", confidence: "LOW" },
    version: frontMatter["version"]
      ? { value: frontMatter["version"], source: "DOCUMENT", confidence: "MEDIUM" }
      : { source: "DOCUMENT", confidence: "LOW" },
    language: rawLang
      ? { value: rawLang, source: "DOCUMENT", confidence: "HIGH" }
      : { source: "DOCUMENT", confidence: "LOW" },
    description: frontMatter["description"]
      ? { value: frontMatter["description"], source: "DOCUMENT", confidence: "MEDIUM" }
      : { source: "DOCUMENT", confidence: "LOW" },
    wordCount: { source: "DOCUMENT", confidence: "LOW" },
  };
}

// ---------------------------------------------------------------------------
// Plain text metadata extraction
// ---------------------------------------------------------------------------

/**
 * Extracts metadata from a plain-text document.
 * Uses the first non-empty line as a candidate title.
 */
export function extractMetadataFromPlainText(text: string): DocumentMetadata {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const candidateTitle = lines[0];

  return {
    title: candidateTitle
      ? { value: candidateTitle, source: "DOCUMENT", confidence: "LOW" }
      : { source: "DOCUMENT", confidence: "LOW" },
    publisher: { source: "DOCUMENT", confidence: "LOW" },
    publicationDate: { source: "DOCUMENT", confidence: "LOW" },
    version: { source: "DOCUMENT", confidence: "LOW" },
    language: { value: "en", source: "DOCUMENT", confidence: "LOW" },
    description: { source: "DOCUMENT", confidence: "LOW" },
    wordCount: { source: "DOCUMENT", confidence: "LOW" },
  };
}
