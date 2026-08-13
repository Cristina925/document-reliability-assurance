# DRA Third-Party Attribution

This file documents all third-party material referenced or persisted by the DRA research programme, and the licence or public-domain basis under which it is used. It is derived from the DRA-PUB-002 Phase 2 licence audit (`docs/dra/DRA-PUB-002-PHASE2-REPORT.md`, §2) and the release manifest (`docs/dra/DRA-PUBLIC-RELEASE-MANIFEST.md`).

## Scope

Two categories of third-party material appear in this repository:

1. **Persisted raw bytes** — full third-party document content stored on disk. This exists in exactly one location: `lib/dra-reference/src/benchmark/analysis/val-002-phase1/data/raw/*.bin` (25 files, part of the DRA-VAL-002 study).
2. **Referenced-only material** — the 33-document development corpus and DRA-GEN-001's 100-document locked sample, for which the repository stores only metadata (publisher, source URL, licence basis, SHA-256 digest, word/statement counts) and evaluation output, never the underlying document bytes.

No other full third-party document text is persisted anywhere in this repository.

## Category 1: DRA-VAL-002 persisted raw source material (25 files)

All 25 files were individually audited in DRA-PUB-002 Phase 2 and cleared `REDISTRIBUTION_VERIFIED`. They fall into exactly two licence bases:

### UK Open Government Licence v3.0 (17 documents)

Published under the [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/), which permits copying, publishing, distributing, transmitting, and adapting this information, commercially or non-commercially, subject to attribution.

| Publisher | Document |
|---|---|
| Department for Education | Apprenticeship and levy statistics, February 2019 |
| Department for Education | SEND code of practice: 0 to 25 years |
| Department for Education | SEND guide for parents and carers |
| Ministry of Justice | Employment tribunal and Employment Appeal Tribunal statistics, Great Britain |
| HM Revenue & Customs | Government revenues from UK oil and gas production |
| UK Health Security Agency | Chickenpox as a notifiable disease: information for health professionals |
| UK Health Security Agency | Hepatitis B antenatal screening and newborn immunisation programme: best practice guidance |
| UK Health Security Agency | Seeking consent for immunisations in schools |
| Animal and Plant Health Agency | View APHA surveillance reports, publications and data |
| Office for National Statistics | Annual mid-year population estimates |
| Office for National Statistics | UK balance of payments |
| Office for National Statistics | Consumer price inflation |
| Office for National Statistics | Long-term international migration, provisional |
| Office for National Statistics | Public sector finances |
| Office for National Statistics | Quarterly national accounts |
| Office for National Statistics | Retail sales |
| Office for National Statistics | UK labour market |

**Attribution statement (per OGL v3.0 §4.1):** *Contains public sector information licensed under the Open Government Licence v3.0, from the UK Department for Education, Ministry of Justice, HM Revenue & Customs, UK Health Security Agency, Animal and Plant Health Agency, and Office for National Statistics.*

### US federal public domain, 17 U.S.C. § 105 (8 documents)

Works of the United States federal government are not subject to copyright protection in the United States under 17 U.S.C. § 105. No licence grant is required; this is a categorical statutory exclusion.

| Publisher | Document |
|---|---|
| U.S. Census Bureau | American Community Survey — About |
| U.S. Census Bureau | Population — About |
| U.S. Environmental Protection Agency | Summary of the Comprehensive Environmental Response, Compensation, and Liability Act |
| U.S. Environmental Protection Agency | Summary of the Clean Water Act |
| U.S. Environmental Protection Agency | Summary of the Resource Conservation and Recovery Act |
| U.S. Environmental Protection Agency | Summary of the Toxic Substances Control Act |
| U.S. Federal Trade Commission | Fair Credit Reporting Act |
| U.S. Federal Trade Commission | Fair Debt Collection Practices Act |

No attribution is legally required for material in the U.S. public domain; publishers are credited above for transparency and traceability.

## Category 2: Referenced-only material (metadata only, no persisted text)

The 33-document development corpus (`DRA-DOC-0001`–`DRA-DOC-0032`, `DRA-DOC-0034`) and DRA-GEN-001's 100-document locked sample reference a substantially broader set of third-party publishers, including but not limited to: GOV.UK bodies, the Information Commissioner's Office, the Financial Conduct Authority, the National Audit Office, the Bank of England, NIST, the FDA, the U.S. Energy Information Administration, the CDC, the U.S. Government Publishing Office, the Congressional Research Service, the European Commission, the OECD, PLOS, the Basel Committee on Banking Supervision, CNIL (France), INE and CNMV (Spain), and the Cabinet Office of Japan. For each, the repository stores only: publisher name, canonical source URL, recorded licence basis (as determined at acquisition time — see each `DRA-ACQ-0NN` report for the specific determination), a SHA-256 digest of the acquired content, and derived word/statement counts. The underlying document text itself is never persisted, so redistribution-rights review does not apply to this category — nothing is being redistributed. Anyone wishing to inspect the original content should follow the recorded source URL, understanding that live content may have changed since acquisition (see `docs/dra/DRA-REPRODUCIBILITY.md`, Mode B).

## Licence bases explicitly noted as more restrictive elsewhere in the programme (not persisted as raw bytes)

Several documents referenced only by digest/metadata in the wider corpus carry more restrictive or bespoke licence terms than OGL v3.0 or U.S. public domain — for example, National Audit Office material (Crown copyright, not OGL), a CC BY-ND admission, and at least one bespoke-notice licence. None of these documents' full text is persisted anywhere in this repository; only metadata and digests are stored, so no redistribution decision is required for them. If any future work were to persist raw bytes for such a document, it must be individually re-reviewed before release, following the same audit method used for the VAL-002 set above.

## Software licence

The DRA implementation itself (evaluator, pipeline, tests, acquisition/governance tooling) is original work produced within this research programme and is covered by the repository's own licence (see `package.json`, `"license": "MIT"`).
