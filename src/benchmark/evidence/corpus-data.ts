/**
 * DRA-001-07 — Initial Benchmark Evidence Generation
 *
 * Corpus data: six benchmark documents covering six domains.
 * Each entry pairs a CorpusDocumentInput (corpus registry metadata) with
 * the document text content (generatedText, sourceText) needed by the runner.
 *
 * Corpus version: DRA-001-07-INITIAL (6 documents, all FROZEN)
 *
 * Design:
 *   - Text content is co-located with metadata for a self-contained module.
 *   - All documents are FROZEN status — suitable for production evaluation.
 *   - Corpus IDs are permanent: DRA-DOC-0001 through DRA-DOC-0006.
 *   - The module is pure data; no imports from evaluation or governance layers.
 */

import type { CorpusDocumentInput } from "../corpus/schema.js";

// ---------------------------------------------------------------------------
// BenchmarkDocumentEntry — corpus data format
// ---------------------------------------------------------------------------

/**
 * A corpus document entry: corpus registry metadata plus the text content
 * required by BenchmarkRunner.
 */
export interface BenchmarkDocumentEntry {
  /** Corpus document metadata — passed to the CorpusRegistry on load. */
  readonly input: CorpusDocumentInput;
  /** Generated document text — the primary content evaluated. */
  readonly generatedText: string;
  /** Source reference text — the evidence base for the generated document. */
  readonly sourceText: string;
}

// ---------------------------------------------------------------------------
// DRA-DOC-0001 — Safety Management System Compliance Audit (TECHNICAL, HIGH)
// ---------------------------------------------------------------------------

const ENTRY_0001: BenchmarkDocumentEntry = {
  input: {
    corpusId: "DRA-DOC-0001",
    title: "Safety Management System Compliance Audit Report — Q2 2026",
    sourceType: "AI_GENERATED",
    documentType: "REPORT",
    domain: "TECHNICAL",
    language: "en",
    generator: "TechAssuranceWriter",
    generatorVersion: "2.1",
    creationMethod: "Single-pass generation from structured audit template",
    difficulty: "HIGH",
    sourceReference: "ISO 31000:2018; ISO 45001:2018",
    benchmarkStatus: "FROZEN",
    notes: "Representative technical compliance audit with good source traceability.",
  },
  generatedText: `Safety Management System Compliance Audit Report — Q2 2026

This audit confirms that the organisation's Safety Management System has been implemented and maintained in accordance with ISO 31000:2018 and ISO 45001:2018 requirements. The audit covered three operational sites over fourteen working days.

Risk Assessment Compliance

All risk assessments were conducted using the systematic methodology defined in ISO 31000:2018 Clause 6.4.2. The organisation maintains a documented risk register covering forty-seven identified hazard categories. Risk identification workshops addressed sources of risk, areas of impact, and potential consequences. Risk treatment plans are documented and assigned to responsible owners with target completion dates.

Control Effectiveness

Control measures were evaluated against the hierarchy of controls established in ISO 45001:2018 Clause 8.1.2. Of the forty-seven hazard categories, thirty-nine have documented and verified control measures. Eight corrective actions remain open from the previous audit cycle: five medium-priority and three high-priority.

Framework Maintenance

Clause 5.2 of ISO 31000:2018 requires continual improvement of the risk management framework. The organisation conducts annual management reviews and maintains documented records of framework updates. The most recent management review was completed on 12 March 2026 and confirmed the framework remains fit for purpose.

Conclusion

The Safety Management System satisfies applicable requirements of ISO 31000:2018 and ISO 45001:2018. Three high-priority corrective actions are scheduled for completion by 15 September 2026. A follow-up audit is recommended within six months.`,

  sourceText: `ISO 31000:2018 — Risk Management Guidelines

Clause 5.2 — Framework design and integration
The organisation shall demonstrate commitment by integrating risk management into all activities and establishing a framework for managing risk. The framework shall be continually reviewed and improved to address changing internal and external contexts.

Clause 6.4.2 — Risk identification
Risk identification shall be systematic, iterative, and collaborative. The process shall identify all sources of risk, areas of impact, events, their causes and potential consequences. Relevant, appropriate, and up-to-date information shall be used.

ISO 45001:2018 — Occupational Health and Safety Management Systems

Clause 8.1.2 — Eliminating hazards and reducing OH&S risks
The organisation shall establish a process for the elimination of hazards and reduction of occupational health and safety risks using the following hierarchy of controls: elimination, substitution, engineering controls, administrative controls, personal protective equipment.`,
};

// ---------------------------------------------------------------------------
// DRA-DOC-0002 — Data Protection Impact Assessment (LEGAL, HIGH)
// ---------------------------------------------------------------------------

const ENTRY_0002: BenchmarkDocumentEntry = {
  input: {
    corpusId: "DRA-DOC-0002",
    title: "Data Protection Impact Assessment — Customer Analytics Platform",
    sourceType: "AI_GENERATED",
    documentType: "REPORT",
    domain: "LEGAL",
    language: "en",
    generator: "LegalAssuranceWriter",
    generatorVersion: "1.4",
    creationMethod: "Template-driven generation with regulatory clause mapping",
    difficulty: "HIGH",
    sourceReference: "GDPR Article 35; GDPR Recital 84",
    benchmarkStatus: "FROZEN",
    notes: "DPIA with some claims extending beyond the scope of the referenced article.",
  },
  generatedText: `Data Protection Impact Assessment — Customer Analytics Platform

This Data Protection Impact Assessment (DPIA) was conducted for the Customer Analytics Platform deployment in accordance with GDPR Article 35. The assessment confirms that all identified high risks have been mitigated to an acceptable residual level prior to processing.

Scope and Necessity Assessment

The platform processes behavioural and transactional data for automated profiling of customer purchasing patterns. This constitutes large-scale systematic monitoring of a public area as defined under Article 35(3)(c) of the GDPR, which mandates a DPIA prior to processing. The Data Protection Officer has confirmed the processing is necessary and proportionate to the stated purpose.

Risk Identification

Three high-residual risks were identified prior to mitigation: unauthorised secondary use of profiling data, re-identification of anonymised data sets, and algorithmic discrimination in recommendation outputs. All three risks have been mitigated through implementation of purpose limitation controls, differential privacy measures, and bias auditing procedures.

Supervisory Authority Consultation

Where residual risk remains high after mitigation, Article 36 of the GDPR requires prior consultation with the supervisory authority before processing commences. This assessment concludes that no prior consultation is required, as all residual risks have been reduced to medium or below. All processing activities were registered in the Record of Processing Activities on 30 April 2026 and approved by the Data Protection Officer on 14 May 2026.

Data Subject Rights Implementation

Data subjects retain full rights to erasure, rectification, and objection under GDPR Articles 17, 18, and 21. Automated decision-making safeguards required under Article 22 have been implemented and tested. The organisation guarantees data portability in machine-readable format within seventy-two hours of request.

Conclusion

This DPIA satisfies the requirements of GDPR Article 35. Processing may commence following sign-off by the Data Protection Officer.`,

  sourceText: `GDPR Article 35 — Data Protection Impact Assessment

1. Where a type of processing using new technologies, and taking into account the nature, scope, context and purposes of the processing, is likely to result in a high risk to the rights and freedoms of natural persons, the controller shall, prior to the processing, carry out an assessment of the impact of the envisaged processing operations.

3. A data protection impact assessment referred to in paragraph 1 shall in particular be required in the case of: (a) a systematic and extensive evaluation of personal aspects relating to natural persons which is based on automated processing, including profiling; (b) processing on a large scale of special categories of data; (c) a systematic monitoring of a publicly accessible area on a large scale.

7. The assessment shall contain at least: (a) a systematic description of the envisaged processing operations and the purposes of the processing; (b) an assessment of the necessity and proportionality; (c) an assessment of the risks to the rights and freedoms of data subjects; (d) the measures envisaged to address the risks.

GDPR Recital 84
Where a data protection impact assessment indicates that processing would result in a high risk if the controller did not take measures to mitigate the risk, the supervisory authority should be consulted prior to the start of the processing.`,
};

// ---------------------------------------------------------------------------
// DRA-DOC-0003 — Third-Party Vendor Risk Assessment (BUSINESS, MEDIUM)
// ---------------------------------------------------------------------------

const ENTRY_0003: BenchmarkDocumentEntry = {
  input: {
    corpusId: "DRA-DOC-0003",
    title: "Third-Party Vendor Risk Assessment — Cloud Infrastructure Providers",
    sourceType: "HYBRID",
    documentType: "REPORT",
    domain: "BUSINESS",
    language: "en",
    generator: "RiskAnalysisSystem",
    generatorVersion: "3.0",
    creationMethod: "AI-generated structure with human-reviewed content",
    difficulty: "MEDIUM",
    sourceReference: "NIST CSF 2.0; ISO 27036-1:2021",
    benchmarkStatus: "FROZEN",
    notes: "Well-supported vendor risk assessment with clear traceability.",
  },
  generatedText: `Third-Party Vendor Risk Assessment — Cloud Infrastructure Providers

Executive Summary

This report presents the results of third-party risk assessments conducted for three cloud infrastructure providers contracted to deliver core business services. All assessments were conducted in accordance with NIST Cybersecurity Framework 2.0 Govern function requirements and ISO 27036-1:2021 guidelines for information security in supplier relationships.

Assessment Methodology

Vendor assessments were structured around the six functions of NIST CSF 2.0: Govern, Identify, Protect, Detect, Respond, and Recover. Each vendor was evaluated through document review, questionnaire response analysis, and technical control verification. Assessment criteria were weighted according to the criticality classification assigned to each vendor under the organisation's Third-Party Risk Policy.

Findings by Vendor

Provider A (Tier 1 — Critical): Achieved satisfactory ratings across all six NIST CSF functions. Penetration testing reports, SOC 2 Type II attestation dated January 2026, and incident response playbooks were verified. No material risks identified.

Provider B (Tier 1 — Critical): Identified a gap in the Recover function: the documented recovery time objective of four hours for core services is not supported by tested backup restoration procedures. A remediation plan has been agreed with completion date of 30 June 2026.

Provider C (Tier 2 — Important): All controls are adequate. Business continuity arrangements comply with the requirements of ISO 27036-1:2021 Clause 9.2, which requires that outsourcing relationships include provisions for service continuity. Annual review is scheduled for November 2026.

Risk Treatment

Provider B's recovery gap has been risk-accepted with compensating controls pending remediation. All other risks have been formally closed. The risk register has been updated accordingly.

Conclusion

The third-party risk assessment programme demonstrates adequate oversight of critical supply chain relationships. Quarterly monitoring is recommended for all Tier 1 providers.`,

  sourceText: `NIST Cybersecurity Framework 2.0 — Govern Function

The Govern function establishes the organisation's approach to managing cybersecurity risk. Governance activities include establishing policies, procedures, and risk tolerance; ensuring accountability for cybersecurity outcomes; and integrating third-party risk management.

Third-party risk management activities within Govern include: identifying and prioritising suppliers based on criticality; establishing expectations for suppliers; and monitoring supplier performance against those expectations. Supplier assessments shall address all relevant CSF functions: Identify, Protect, Detect, Respond, and Recover.

ISO 27036-1:2021 — Information security for supplier relationships

Clause 9.2 — Service continuity
Outsourcing relationships shall include contractual provisions for service continuity. The acquirer shall verify that the supplier maintains documented and tested recovery procedures. Recovery time objectives shall be tested at least annually and validated against operational requirements.

Clause 8.3 — Assessment of supplier information security controls
The acquirer shall establish a process to periodically assess the information security controls implemented by suppliers. Assessment methods may include questionnaires, document review, audits, and technical testing.`,
};

// ---------------------------------------------------------------------------
// DRA-DOC-0004 — Clinical Decision Support Validation (HEALTHCARE, HIGH)
// ---------------------------------------------------------------------------

const ENTRY_0004: BenchmarkDocumentEntry = {
  input: {
    corpusId: "DRA-DOC-0004",
    title: "Clinical Decision Support System Validation Report — Sepsis Alerting Module",
    sourceType: "AI_GENERATED",
    documentType: "REPORT",
    domain: "HEALTHCARE",
    language: "en",
    generator: "MedDocWriter",
    generatorVersion: "1.1",
    creationMethod: "Template generation with clinical terminology expansion",
    difficulty: "HIGH",
    sourceReference: "NHS Digital CDS Standards v2.1; NICE guideline NG51",
    benchmarkStatus: "FROZEN",
    notes:
      "Healthcare validation with authority references that may not all be traceable to source material.",
  },
  generatedText: `Clinical Decision Support System Validation Report — Sepsis Alerting Module

Introduction

This report documents the validation of the Sepsis Alerting Module (SAM) within the organisation's Clinical Decision Support System (CDSS). Validation was conducted in accordance with NHS Digital Clinical Decision Support Standards v2.1 and NICE guideline NG51 (Sepsis: recognition, diagnosis and early management).

Clinical Algorithm Validation

The SAM algorithm uses a modified National Early Warning Score (NEWS2) with additional biomarker thresholds derived from the Sepsis Six care bundle. The algorithm was validated against a retrospective cohort of four hundred and twelve confirmed sepsis cases from the 2023–2025 period. Sensitivity was measured at 87.4% and specificity at 79.1%, which satisfies the minimum performance criteria of 85% sensitivity established by the NHS Digital CDS Standards v2.1 Clause 4.3.

Clinical Workflow Integration

The alert escalation pathway was designed in accordance with NICE NG51 Section 1.5, which specifies that patients meeting high-risk criteria should receive immediate clinical review within one hour of alert generation. Integration testing confirmed that ninety-three percent of high-severity alerts were acknowledged within the mandated timeframe during the test period.

Governance and Safety

A Clinical Safety Case was completed in accordance with DCB0129 (Clinical Risk Management: its Application in the Manufacture of Health IT Systems) prior to deployment. The hazard log identifies six residual risks, all rated as acceptable under the risk matrix approved by the Clinical Safety Officer. All software changes are managed under ISO 62304:2006+AMD1:2015 lifecycle processes.

Ongoing Monitoring

Post-deployment surveillance was established in accordance with the FDA guidance on clinical decision support software, which distinguishes software that meets the definition of a device from non-device CDS. The surveillance plan includes monthly performance metric review and quarterly clinical audit.

Conclusion

The Sepsis Alerting Module satisfies the requirements of NHS Digital CDS Standards v2.1 and NICE guideline NG51. Deployment is approved, subject to completion of outstanding staff training by 31 July 2026.`,

  sourceText: `NHS Digital Clinical Decision Support Standards v2.1

Clause 4.3 — Algorithm performance requirements
Clinical decision support algorithms used in patient-facing alerting systems shall demonstrate minimum sensitivity of 85% on a validated retrospective cohort. Validation cohorts shall contain at least two hundred confirmed cases. Performance shall be measured against independently verified clinical outcomes.

Clause 6.1 — Integration testing
Integration testing shall verify that alert generation, escalation, and acknowledgement pathways function in accordance with the clinical workflow requirements. Testing shall include end-to-end pathway simulation with representative clinical scenarios.

NICE guideline NG51 — Sepsis: recognition, diagnosis and early management

Section 1.5 — Escalation and treatment
For adults meeting high-risk sepsis criteria, immediate clinical review shall be initiated within one hour of recognition. High-risk criteria include suspected infection plus two or more of: altered mentation, systolic blood pressure less than 100 mmHg, heart rate greater than 130, respiratory rate greater than 25, new-onset oxygen requirement, or mottled or ashen appearance.`,
};

// ---------------------------------------------------------------------------
// DRA-DOC-0005 — Internal Financial Controls Adequacy Assessment (FINANCE, MEDIUM)
// ---------------------------------------------------------------------------

const ENTRY_0005: BenchmarkDocumentEntry = {
  input: {
    corpusId: "DRA-DOC-0005",
    title: "Internal Financial Controls Adequacy Assessment — FY2025",
    sourceType: "AI_GENERATED",
    documentType: "REPORT",
    domain: "FINANCE",
    language: "en",
    generator: "FinanceReportWriter",
    generatorVersion: "2.3",
    creationMethod: "AI-generated from structured financial control test data",
    difficulty: "MEDIUM",
    sourceReference: "SOX Section 404; IFRS 9 Financial Instruments",
    benchmarkStatus: "FROZEN",
    notes: "Financial controls report with some claims that extend beyond the source provisions.",
  },
  generatedText: `Internal Financial Controls Adequacy Assessment — FY2025

Purpose

This assessment evaluates the design and operating effectiveness of internal controls over financial reporting for the fiscal year ended 31 December 2025. The assessment was conducted in accordance with the requirements of Sarbanes-Oxley Act Section 404 and applicable International Financial Reporting Standards.

Methodology

Management's assessment was performed using the COSO Internal Control — Integrated Framework (2013) as the recognised control framework. One hundred and seventeen key controls were tested across six process areas: revenue recognition, accounts payable, treasury, fixed assets, payroll, and financial close. Testing included inquiry, observation, inspection of documentary evidence, and re-performance.

Control Effectiveness Results

One hundred and eleven of one hundred and seventeen controls were assessed as operating effectively. Six deficiencies were identified: two significant deficiencies in the revenue recognition process and four control deficiencies in the treasury process. No material weaknesses were identified. The two significant deficiencies relate to manual journal entry review procedures and have been remediated as of 28 February 2026.

IFRS 9 Financial Instruments

Financial instrument classification and measurement were assessed against IFRS 9 requirements. The organisation holds financial assets classified at amortised cost, fair value through other comprehensive income, and fair value through profit or loss. Impairment provisions were calculated using the expected credit loss model as required by IFRS 9 Section 5.5. The twelve-month expected credit loss allowance is £4.2 million, representing 1.8% of the gross carrying amount of the loan portfolio, which management considers appropriate given current market conditions. All hedge accounting relationships were documented and designated in accordance with IFRS 9 Section 6.4 prior to commencement.

External Audit Opinion

The external auditors issued an unmodified opinion on the financial statements and an unmodified opinion on the effectiveness of internal control over financial reporting. No deficiencies were identified by the external audit that were not already identified by management.

Conclusion

Internal controls over financial reporting are adequate. The identified significant deficiencies have been remediated and will be re-tested in the next assessment cycle.`,

  sourceText: `Sarbanes-Oxley Act Section 404 — Management Assessment of Internal Controls

(a) Rules Required — The Commission shall prescribe rules requiring each annual report to contain: (1) a statement of management's responsibility for establishing and maintaining an adequate internal control structure and procedures for financial reporting; and (2) an assessment of the effectiveness of the internal control structure and procedures of the issuer for financial reporting.

Management shall base its assessment on a recognised framework such as the Internal Control — Integrated Framework issued by the Committee of Sponsoring Organisations of the Treadway Commission (COSO). The assessment shall identify any material weaknesses in internal control. A material weakness shall be disclosed; management may not conclude that internal controls are effective if a material weakness exists.

IFRS 9 — Financial Instruments

Section 5.5.1 — Recognition of expected credit losses
An entity shall recognise a loss allowance for expected credit losses on a financial asset. At each reporting date, an entity shall measure the loss allowance for a financial instrument at an amount equal to the lifetime expected credit losses if the credit risk has increased significantly since initial recognition.

Section 5.5.5 — Twelve-month expected credit losses
If the credit risk has not increased significantly since initial recognition, an entity shall measure the loss allowance at an amount equal to twelve-month expected credit losses.`,
};

// ---------------------------------------------------------------------------
// DRA-DOC-0006 — Information Security Policy Framework (GENERAL, LOW)
// ---------------------------------------------------------------------------

const ENTRY_0006: BenchmarkDocumentEntry = {
  input: {
    corpusId: "DRA-DOC-0006",
    title: "Information Security Policy Framework — Annual Review 2026",
    sourceType: "HUMAN_AUTHORED",
    documentType: "POLICY",
    domain: "GENERAL",
    language: "en",
    generator: "PolicyTeam",
    creationMethod: "Human-authored annual review of existing policy framework",
    difficulty: "LOW",
    sourceReference: "ISO 27001:2022 Clauses 5–6",
    benchmarkStatus: "FROZEN",
    notes:
      "General security policy. Lower difficulty; primarily structural compliance claims.",
  },
  generatedText: `Information Security Policy Framework — Annual Review 2026

Policy Statement

This Information Security Policy Framework establishes the organisation's commitment to protecting information assets in accordance with ISO 27001:2022. The policy applies to all employees, contractors, and third parties who access organisational information systems. Compliance is mandatory and forms part of all employment and contractor agreements.

Leadership and Governance

Senior leadership has approved this policy in fulfilment of the requirements of ISO 27001:2022 Clause 5.1, which requires top management to demonstrate leadership and commitment to the information security management system. An Information Security Steering Committee meets quarterly to review security performance, approve risk treatment decisions, and ensure alignment with organisational objectives.

Risk Management Approach

The organisation applies a risk-based approach to information security in accordance with ISO 27001:2022 Clause 6.1. Information security risks are assessed annually and whenever significant changes occur to the information environment. Risk assessments use qualitative likelihood and impact matrices. Risks exceeding the defined risk appetite threshold require formal treatment plans approved by the Chief Information Security Officer.

Objectives and Targets

Information security objectives have been established for the current year in accordance with ISO 27001:2022 Clause 6.2. Objectives include achieving and maintaining ISO 27001 certification, reducing the mean time to detect security incidents to below four hours, and completing annual security awareness training for one hundred percent of staff. Progress against objectives is reported to senior leadership quarterly.

Scope and Exclusions

This policy applies to all information assets classified as CONFIDENTIAL or above under the organisation's information classification scheme. Physical security of facilities is governed by the separate Physical Security Policy. Cloud service provider security obligations are governed by the Third-Party Security Policy.

Policy Review

This policy shall be reviewed annually or following significant changes to the threat landscape, organisational structure, or regulatory requirements. The next scheduled review date is 1 June 2027.`,

  sourceText: `ISO 27001:2022 — Information Security Management Systems

Clause 5.1 — Leadership and commitment
Top management shall demonstrate leadership and commitment with respect to the information security management system by: taking accountability for the effectiveness of the information security management system; ensuring that the information security policy and the information security objectives are established and are compatible with the strategic direction of the organisation; ensuring the integration of information security management system requirements into the organisation's processes; promoting continual improvement.

Clause 6.1 — Actions to address risks and opportunities
When planning for the information security management system, the organisation shall consider the issues referred to in Clause 4.1 and the requirements referred to in Clause 4.2, and determine the risks and opportunities that need to be addressed.

Clause 6.2 — Information security objectives and planning to achieve them
The organisation shall establish information security objectives at relevant functions and levels. The information security objectives shall be consistent with the information security policy; measurable (if practicable); take into account applicable information security requirements; be monitored; be communicated; be updated as appropriate.`,
};

// ---------------------------------------------------------------------------
// BENCHMARK_CORPUS — all six entries in canonical order
// ---------------------------------------------------------------------------

/** All six benchmark document entries in corpus ID order (DRA-DOC-0001 … DRA-DOC-0006). */
export const BENCHMARK_CORPUS: readonly BenchmarkDocumentEntry[] = Object.freeze([
  ENTRY_0001,
  ENTRY_0002,
  ENTRY_0003,
  ENTRY_0004,
  ENTRY_0005,
  ENTRY_0006,
]);

/** Number of documents in the initial benchmark corpus. */
export const BENCHMARK_CORPUS_SIZE = 6 as const;

/**
 * Returns the benchmark corpus entry for the given corpus ID, or undefined.
 */
export function getCorpusEntry(
  corpusId: string,
): BenchmarkDocumentEntry | undefined {
  return BENCHMARK_CORPUS.find((e) => e.input.corpusId === corpusId);
}
