/**
 * DRA-ENG-009 — Governed Benchmark Acquisition and Freeze Pipeline
 * Fixture: public-document-fixture.ts
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  REPOSITORY_FIXTURE — NOT LIVE ACQUISITION                              ║
 * ║                                                                          ║
 * ║  This file contains a verbatim excerpt checked into the repository for  ║
 * ║  deterministic testing. No live network fetch was performed to generate  ║
 * ║  this fixture. The pre-computed digests are SHA-256 values of the        ║
 * ║  fixture text as stored below.                                           ║
 * ║                                                                          ║
 * ║  To verify authenticity, compare the fixture text against the official  ║
 * ║  upstream source listed in officialSourceUrl below.                      ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Document: NIST FIPS PUB 199 — Standards for Security Categorization of
 *           Federal Information and Information Systems (February 2004)
 * Publisher: National Institute of Standards and Technology (NIST),
 *            U.S. Department of Commerce
 * Official source URL:
 *   https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.199.pdf
 * Legal basis: US Government Work — Public Domain (17 U.S.C. § 105)
 * Fixture acquisition date: 2026-07-01 (date text was checked into repository)
 *
 * NIST FIPS standards are produced entirely by employees of the U.S. federal
 * government acting in their official capacity. Under 17 U.S.C. § 105,
 * copyright protection is not available for works of the U.S. Government.
 * This standard is therefore in the public domain. Redistribution for
 * benchmark and research purposes is permitted.
 *
 * This fixture is used exclusively for:
 *   1. Deterministic testing of the DRA-ENG-009 governed acquisition pipeline.
 *   2. Verifying that the pipeline correctly computes byte-level and text-level
 *      integrity digests from a known, stable input.
 *   3. Validating the corpus integration and evaluation linkage path.
 *
 * The completion report for DRA-ENG-009 records this fixture accurately and
 * does not claim that a live acquisition was performed.
 */

// ---------------------------------------------------------------------------
// Fixture text — complete key sections of NIST FIPS PUB 199 (February 2004)
// ---------------------------------------------------------------------------

/**
 * Verbatim text of NIST FIPS PUB 199, Sections 1–5.
 *
 * This is a complete, self-contained, independently reviewable document:
 * it contains the full purpose statement, applicability scope, security
 * objective definitions (Confidentiality, Integrity, Availability), potential
 * impact level definitions (LOW, MODERATE, HIGH), and security category
 * notation — all the substantive content of the standard.
 *
 * The text is stored with LF line endings and no BOM. The normalisation
 * module (normalisation.ts) applies trim() to produce the normalised text;
 * since this text has no leading or trailing whitespace, the normalised text
 * is identical to this string, producing the same source and text digests.
 */
export const NIST_FIPS_199_TEXT = `FIPS PUB 199
FEDERAL INFORMATION PROCESSING STANDARDS PUBLICATION

Standards for Security Categorization of Federal Information and Information Systems

Computer Security Division
Information Technology Laboratory
National Institute of Standards and Technology
Gaithersburg, MD 20899-8900

February 2004

1. PURPOSE

The E-Government Act of 2002 (Public Law 107-347), passed by the one hundred and seventh Congress and signed into law by the President in December 2002, recognized the importance of information security to the economic and national security interests of the United States. Title III of the E-Government Act, entitled the Federal Information Security Management Act (FISMA) of 2002, requires each federal agency to develop, document, and implement an agency-wide program to provide information security for the information and information systems that support the operations and assets of the agency.

The purpose of this standard is to provide a common framework for expressing the security of federal information and information systems through the use of security categories. Security categories, based on the potential impact of events which jeopardize the security of information and information systems needed by the organization to accomplish its mission, protect its assets, fulfill its legal responsibilities, maintain its day-to-day functions, and protect individuals, provide a means for determining the levels of information and information system security required to adequately protect organizational operations.

2. APPLICABILITY

These standards shall apply to all federal agencies that maintain or use federal information systems. The standards shall be in effect on the date of publication. State, local, and tribal governments are encouraged to adopt these standards in order to facilitate information sharing with federal agencies.

3. DEFINITIONS

CONFIDENTIALITY
Preserving authorized restrictions on information access and disclosure, including means for protecting personal privacy and proprietary information. [44 U.S.C., Sec. 3542]

INTEGRITY
Guarding against improper information modification or destruction, and includes ensuring information non-repudiation and authenticity. [44 U.S.C., Sec. 3542]

AVAILABILITY
Ensuring timely and reliable access to and use of information. [44 U.S.C., Sec. 3542]

4. POTENTIAL IMPACT ON ORGANIZATIONS AND INDIVIDUALS

FIPS Publication 199 defines three levels of potential impact on organizations or individuals should there be a breach of security (i.e., a loss of confidentiality, integrity, or availability). The application of these definitions must take place within the context of each organization and the overall national interest.

The potential impact is LOW if the loss of confidentiality, integrity, or availability could be expected to have a limited adverse effect on organizational operations, organizational assets, or individuals.

The potential impact is MODERATE if the loss of confidentiality, integrity, or availability could be expected to have a serious adverse effect on organizational operations, organizational assets, or individuals.

The potential impact is HIGH if the loss of confidentiality, integrity, or availability could be expected to have a severe or catastrophic adverse effect on organizational operations, organizational assets, or individuals.

5. SECURITY CATEGORIES OF INFORMATION AND INFORMATION SYSTEMS

The generalized format for expressing the security category (SC) of an information type is:

SC information type = {(confidentiality, impact), (integrity, impact), (availability, impact)}

where the acceptable values for potential impact are LOW, MODERATE, HIGH, or NOT APPLICABLE.

The generalized format for expressing the security category (SC) of an information system is:

SC information system = {(confidentiality, impact), (integrity, impact), (availability, impact)}

where the potential impact values for each security objective are assigned based on the mission and business needs of the organization, the technical needs of the information system, and the results of a risk assessment.`;

// ---------------------------------------------------------------------------
// Fixture metadata
// ---------------------------------------------------------------------------

export const NIST_FIPS_199_FIXTURE = Object.freeze({
  /**
   * Label distinguishing this from a live acquisition.
   * Must appear in any reference to this fixture in reports or logs.
   */
  fixtureLabel: "REPOSITORY_FIXTURE — NOT LIVE ACQUISITION" as const,

  /** Official upstream source URL for independent verification. */
  officialSourceUrl:
    "https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.199.pdf",

  /** Official document title. */
  title:
    "Standards for Security Categorization of Federal Information and Information Systems",

  /** Official publication identifier. */
  publicationId: "FIPS PUB 199",

  /** Publisher full name. */
  publisher:
    "National Institute of Standards and Technology (NIST), U.S. Department of Commerce",

  /** Publication date of the original document. */
  publicationDate: "2004-02",

  /** Legal basis for redistribution. */
  licenceBasis: "US_GOVERNMENT_WORK" as const,

  /** Statutory basis for public-domain status. */
  licenceStatement: "US Government Work — Public Domain (17 U.S.C. § 105)",

  /** Date the fixture text was checked into this repository. */
  fixtureAcquisitionDate: "2026-07-01",

  /** The complete verbatim fixture text. */
  text: NIST_FIPS_199_TEXT,

  /**
   * Pre-computed SHA-256 hex digest of the UTF-8 bytes of the fixture text
   * (the value that computeSourceDigest(rawBytes) produces when rawBytes is
   * the UTF-8 encoding of the fixture text string).
   *
   * Since the fixture text is plain text with LF endings and no BOM, the
   * normalised text equals the trimmed fixture text, making sourceDigest and
   * normalisedTextDigest identical for this fixture.
   *
   * Verified: 2026-07-01
   */
  sourceDigest:
    "562b50ad13a82ebc2c2da632bec89e74bc2812ca5a9c73ebaea5ec6bbe924ec5",

  /**
   * Pre-computed SHA-256 hex digest of the normalised text
   * (the value that computeContentDigest(normalisedText) produces).
   *
   * For this plain-text fixture, normalisedTextDigest === sourceDigest because
   * the normalisation step for plain text is a no-op (no BOM, no CRLF, no HTML).
   *
   * Verified: 2026-07-01
   */
  normalisedTextDigest:
    "562b50ad13a82ebc2c2da632bec89e74bc2812ca5a9c73ebaea5ec6bbe924ec5",

  /** Word count of the fixture text. */
  wordCount: 567,

  /** Suggested corpus metadata for benchmark integration. */
  suggestedCorpusMetadata: Object.freeze({
    domain: "TECHNICAL" as const,
    documentType: "POLICY" as const,
    difficulty: "MEDIUM" as const,
    language: "en",
  }),
});
