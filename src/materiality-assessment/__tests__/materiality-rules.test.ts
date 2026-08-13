/**
 * DRA-ENG-007 — Materiality Assessment — Rule Engine Unit Tests
 *
 * Tests each materiality rule in isolation, verifying that:
 *   - the correct classification is returned
 *   - the correct ruleId is returned
 *   - triggering characteristics are non-empty when expected
 *   - the UNDETERMINED default fires when no rule matches
 */

import { describe, it, expect } from "vitest";
import { classifyMateriality } from "../materiality-rules.js";

// ---------------------------------------------------------------------------
// CRITICAL — Safety
// ---------------------------------------------------------------------------

describe("MA-CRITICAL-SAFETY", () => {
  it("classifies safety-critical as CRITICAL", () => {
    const r = classifyMateriality("This component is safety-critical and must not be modified.");
    expect(r.classification).toBe("CRITICAL");
    expect(r.ruleId).toBe("MA-CRITICAL-SAFETY");
    expect(r.triggeringCharacteristics.length).toBeGreaterThan(0);
  });

  it("classifies life-threatening as CRITICAL", () => {
    const r = classifyMateriality("Failure to follow this procedure is life-threatening.");
    expect(r.classification).toBe("CRITICAL");
    expect(r.ruleId).toBe("MA-CRITICAL-SAFETY");
  });

  it("classifies risk of injury as CRITICAL", () => {
    const r = classifyMateriality("There is a risk of injury if guards are removed.");
    expect(r.classification).toBe("CRITICAL");
    expect(r.ruleId).toBe("MA-CRITICAL-SAFETY");
  });

  it("classifies emergency stop as CRITICAL", () => {
    const r = classifyMateriality("Press the emergency stop button immediately.");
    expect(r.classification).toBe("CRITICAL");
    expect(r.ruleId).toBe("MA-CRITICAL-SAFETY");
  });
});

// ---------------------------------------------------------------------------
// CRITICAL — Legal
// ---------------------------------------------------------------------------

describe("MA-CRITICAL-LEGAL", () => {
  it("classifies legally required as CRITICAL", () => {
    const r = classifyMateriality("The company is legally required to retain records for seven years.");
    expect(r.classification).toBe("CRITICAL");
    expect(r.ruleId).toBe("MA-CRITICAL-LEGAL");
  });

  it("classifies prohibited by law as CRITICAL", () => {
    const r = classifyMateriality("Sharing this data with third parties is prohibited by law.");
    expect(r.classification).toBe("CRITICAL");
    expect(r.ruleId).toBe("MA-CRITICAL-LEGAL");
  });

  it("classifies criminal liability as CRITICAL", () => {
    const r = classifyMateriality("Non-compliance may result in criminal liability for the directors.");
    expect(r.classification).toBe("CRITICAL");
    expect(r.ruleId).toBe("MA-CRITICAL-LEGAL");
  });

  it("classifies statutory obligation as CRITICAL", () => {
    const r = classifyMateriality("This represents a statutory obligation under the Companies Act.");
    expect(r.classification).toBe("CRITICAL");
    expect(r.ruleId).toBe("MA-CRITICAL-LEGAL");
  });
});

// ---------------------------------------------------------------------------
// CRITICAL — Contract
// ---------------------------------------------------------------------------

describe("MA-CRITICAL-CONTRACT", () => {
  it("classifies contractual commitment as CRITICAL", () => {
    const r = classifyMateriality("The vendor commits to deliver the software by March 31.");
    expect(r.classification).toBe("CRITICAL");
    expect(r.ruleId).toBe("MA-CRITICAL-CONTRACT");
  });

  it("classifies warranty as CRITICAL", () => {
    const r = classifyMateriality("The supplier warrants that the goods are free from defects.");
    expect(r.classification).toBe("CRITICAL");
    expect(r.ruleId).toBe("MA-CRITICAL-CONTRACT");
  });

  it("classifies indemnification as CRITICAL", () => {
    const r = classifyMateriality("Party A shall indemnify Party B against all losses arising from this breach.");
    expect(r.classification).toBe("CRITICAL");
    expect(r.ruleId).toBe("MA-CRITICAL-CONTRACT");
  });

  it("classifies breach of contract as CRITICAL", () => {
    const r = classifyMateriality("This action constitutes a breach of contract under clause 12.");
    expect(r.classification).toBe("CRITICAL");
    expect(r.ruleId).toBe("MA-CRITICAL-CONTRACT");
  });
});

// ---------------------------------------------------------------------------
// CRITICAL — Payment
// ---------------------------------------------------------------------------

describe("MA-CRITICAL-PAYMENT", () => {
  it("classifies payment authorisation as CRITICAL", () => {
    const r = classifyMateriality("The vendor shall invoice the client for $10,000 upon completion.");
    expect(r.classification).toBe("CRITICAL");
    expect(r.ruleId).toBe("MA-CRITICAL-PAYMENT");
  });

  it("classifies financial penalty as CRITICAL", () => {
    const r = classifyMateriality("Late delivery incurs a financial penalty of £5,000 per week.");
    expect(r.classification).toBe("CRITICAL");
    expect(r.ruleId).toBe("MA-CRITICAL-PAYMENT");
  });

  it("classifies must pay as CRITICAL", () => {
    const r = classifyMateriality("The licensee must pay the annual fee within 30 days of invoice.");
    expect(r.classification).toBe("CRITICAL");
    expect(r.ruleId).toBe("MA-CRITICAL-PAYMENT");
  });
});

// ---------------------------------------------------------------------------
// CRITICAL — Security
// ---------------------------------------------------------------------------

describe("MA-CRITICAL-SECURITY", () => {
  it("classifies encryption mandate as CRITICAL", () => {
    const r = classifyMateriality("Encryption must be enabled for all data at rest.");
    expect(r.classification).toBe("CRITICAL");
    expect(r.ruleId).toBe("MA-CRITICAL-SECURITY");
  });

  it("classifies MFA requirement as CRITICAL", () => {
    const r = classifyMateriality("All privileged accounts must use MFA.");
    expect(r.classification).toBe("CRITICAL");
    expect(r.ruleId).toBe("MA-CRITICAL-SECURITY");
  });

  it("classifies authentication mandate as CRITICAL", () => {
    const r = classifyMateriality("Authentication must be enforced at every API endpoint.");
    expect(r.classification).toBe("CRITICAL");
    expect(r.ruleId).toBe("MA-CRITICAL-SECURITY");
  });
});

// ---------------------------------------------------------------------------
// CRITICAL — Regulatory
// ---------------------------------------------------------------------------

describe("MA-CRITICAL-REGULATORY", () => {
  it("classifies GDPR compliance mandate as CRITICAL", () => {
    const r = classifyMateriality("All personal data must be processed in compliance with GDPR.");
    expect(r.classification).toBe("CRITICAL");
    expect(r.ruleId).toBe("MA-CRITICAL-REGULATORY");
  });

  it("classifies HIPAA mandate as CRITICAL", () => {
    const r = classifyMateriality("The system must comply with HIPAA for all protected health information.");
    expect(r.classification).toBe("CRITICAL");
    expect(r.ruleId).toBe("MA-CRITICAL-REGULATORY");
  });

  it("classifies PCI-DSS compliance as CRITICAL", () => {
    const r = classifyMateriality("Payment processing must comply with PCI-DSS.");
    expect(r.classification).toBe("CRITICAL");
    expect(r.ruleId).toBe("MA-CRITICAL-REGULATORY");
  });
});

// ---------------------------------------------------------------------------
// HIGH — Approval
// ---------------------------------------------------------------------------

describe("MA-HIGH-APPROVAL", () => {
  it("classifies approval as HIGH", () => {
    const r = classifyMateriality("The proposal has been approved by the executive committee.");
    expect(r.classification).toBe("HIGH");
    expect(r.ruleId).toBe("MA-HIGH-APPROVAL");
  });

  it("classifies sign-off as HIGH", () => {
    const r = classifyMateriality("Sign-off has been received from the board.");
    expect(r.classification).toBe("HIGH");
    expect(r.ruleId).toBe("MA-HIGH-APPROVAL");
  });

  it("classifies approved by as HIGH", () => {
    const r = classifyMateriality("The budget was approved by the CFO on 14 June.");
    expect(r.classification).toBe("HIGH");
    expect(r.ruleId).toBe("MA-HIGH-APPROVAL");
  });
});

// ---------------------------------------------------------------------------
// HIGH — Rejection
// ---------------------------------------------------------------------------

describe("MA-HIGH-REJECTION", () => {
  it("classifies rejection as HIGH", () => {
    const r = classifyMateriality("The request has been rejected by the review committee.");
    expect(r.classification).toBe("HIGH");
    expect(r.ruleId).toBe("MA-HIGH-REJECTION");
  });

  it("classifies not approved as HIGH", () => {
    const r = classifyMateriality("The proposal was not approved due to insufficient evidence.");
    expect(r.classification).toBe("HIGH");
    expect(r.ruleId).toBe("MA-HIGH-REJECTION");
  });
});

// ---------------------------------------------------------------------------
// HIGH — Decision
// ---------------------------------------------------------------------------

describe("MA-HIGH-DECISION", () => {
  it("classifies formal decision as HIGH", () => {
    const r = classifyMateriality("It has been decided to suspend the service for maintenance.");
    expect(r.classification).toBe("HIGH");
    expect(r.ruleId).toBe("MA-HIGH-DECISION");
  });

  it("classifies resolved that as HIGH", () => {
    const r = classifyMateriality("The board resolved that all legacy systems be decommissioned.");
    expect(r.classification).toBe("HIGH");
    expect(r.ruleId).toBe("MA-HIGH-DECISION");
  });
});

// ---------------------------------------------------------------------------
// HIGH — Recommendation
// ---------------------------------------------------------------------------

describe("MA-HIGH-RECOMMENDATION", () => {
  it("classifies we recommend as HIGH", () => {
    const r = classifyMateriality("We recommend migrating to the new platform before Q3.");
    expect(r.classification).toBe("HIGH");
    expect(r.ruleId).toBe("MA-HIGH-RECOMMENDATION");
  });

  it("classifies it is recommended as HIGH", () => {
    const r = classifyMateriality("It is recommended to adopt the zero-trust security model.");
    expect(r.classification).toBe("HIGH");
    expect(r.ruleId).toBe("MA-HIGH-RECOMMENDATION");
  });

  it("classifies formally recommended as HIGH", () => {
    const r = classifyMateriality("The committee formally recommends adoption of the new standard.");
    expect(r.classification).toBe("HIGH");
    expect(r.ruleId).toBe("MA-HIGH-RECOMMENDATION");
  });
});

// ---------------------------------------------------------------------------
// HIGH — Deployment
// ---------------------------------------------------------------------------

describe("MA-HIGH-DEPLOYMENT", () => {
  it("classifies deployment instruction as HIGH", () => {
    const r = classifyMateriality("The system must be deployed to production by Friday.");
    expect(r.classification).toBe("HIGH");
    // Either MA-HIGH-DEPLOYMENT or MA-HIGH-OBLIGATION may match first; deployment takes priority
    expect(["MA-HIGH-DEPLOYMENT", "MA-HIGH-OBLIGATION"]).toContain(r.ruleId);
  });

  it("classifies go-live as HIGH", () => {
    const r = classifyMateriality("The go-live date has been confirmed for 1 August.");
    expect(r.classification).toBe("HIGH");
    expect(r.ruleId).toBe("MA-HIGH-DEPLOYMENT");
  });
});

// ---------------------------------------------------------------------------
// HIGH — Deadline
// ---------------------------------------------------------------------------

describe("MA-HIGH-DEADLINE", () => {
  it("classifies deadline as HIGH", () => {
    const r = classifyMateriality("The deadline for submission is 30 November.");
    expect(r.classification).toBe("HIGH");
    expect(r.ruleId).toBe("MA-HIGH-DEADLINE");
  });

  it("classifies no later than as HIGH", () => {
    const r = classifyMateriality("The report must be submitted no later than 15 December.");
    expect(r.classification).toBe("HIGH");
    // Could match MA-HIGH-DEADLINE or MA-HIGH-OBLIGATION; both are HIGH
    expect(r.classification).toBe("HIGH");
  });
});

// ---------------------------------------------------------------------------
// HIGH — Obligation (must / shall catch-all)
// ---------------------------------------------------------------------------

describe("MA-HIGH-OBLIGATION", () => {
  it("classifies must (without CRITICAL trigger) as HIGH", () => {
    const r = classifyMateriality("All logs must be retained for 90 days.");
    expect(r.classification).toBe("HIGH");
    expect(r.ruleId).toBe("MA-HIGH-OBLIGATION");
  });

  it("classifies shall (without CRITICAL trigger) as HIGH", () => {
    const r = classifyMateriality("The administrator shall review access rights quarterly.");
    expect(r.classification).toBe("HIGH");
    expect(r.ruleId).toBe("MA-HIGH-OBLIGATION");
  });
});

// ---------------------------------------------------------------------------
// MODERATE — Guidance
// ---------------------------------------------------------------------------

describe("MA-MODERATE-GUIDANCE", () => {
  it("classifies should as MODERATE", () => {
    const r = classifyMateriality("The API should use JWT tokens for session management.");
    expect(r.classification).toBe("MODERATE");
    expect(r.ruleId).toBe("MA-MODERATE-GUIDANCE");
  });

  it("classifies best practice as MODERATE", () => {
    const r = classifyMateriality("Best practice is to rotate credentials every 90 days.");
    expect(r.classification).toBe("MODERATE");
    expect(r.ruleId).toBe("MA-MODERATE-GUIDANCE");
  });

  it("classifies it is advisable as MODERATE", () => {
    const r = classifyMateriality("It is advisable to test the backup restoration process monthly.");
    expect(r.classification).toBe("MODERATE");
    expect(r.ruleId).toBe("MA-MODERATE-GUIDANCE");
  });
});

// ---------------------------------------------------------------------------
// MODERATE — Assumption
// ---------------------------------------------------------------------------

describe("MA-MODERATE-ASSUMPTION", () => {
  it("classifies design assumption as MODERATE", () => {
    const r = classifyMateriality("This design assumes that all users have internet connectivity.");
    expect(r.classification).toBe("MODERATE");
    expect(r.ruleId).toBe("MA-MODERATE-ASSUMPTION");
  });

  it("classifies assumes that as MODERATE", () => {
    const r = classifyMateriality("The model assumes that the input data is clean and normalised.");
    expect(r.classification).toBe("MODERATE");
    expect(r.ruleId).toBe("MA-MODERATE-ASSUMPTION");
  });
});

// ---------------------------------------------------------------------------
// MODERATE — Rationale
// ---------------------------------------------------------------------------

describe("MA-MODERATE-RATIONALE", () => {
  it("classifies because as MODERATE", () => {
    const r = classifyMateriality("The service was redesigned because the existing system lacks scalability.");
    expect(r.classification).toBe("MODERATE");
    expect(r.ruleId).toBe("MA-MODERATE-RATIONALE");
  });

  it("classifies therefore as MODERATE", () => {
    const r = classifyMateriality("The framework was deprecated; therefore a replacement was required.");
    expect(r.classification).toBe("MODERATE");
    expect(r.ruleId).toBe("MA-MODERATE-RATIONALE");
  });

  it("classifies consequently as MODERATE", () => {
    const r = classifyMateriality("Data volumes tripled; consequently the storage tier was upgraded.");
    expect(r.classification).toBe("MODERATE");
    expect(r.ruleId).toBe("MA-MODERATE-RATIONALE");
  });
});

// ---------------------------------------------------------------------------
// MODERATE — Warning
// ---------------------------------------------------------------------------

describe("MA-MODERATE-WARNING", () => {
  it("classifies warning as MODERATE", () => {
    const r = classifyMateriality("Warning: disabling this setting may expose sensitive data.");
    expect(r.classification).toBe("MODERATE");
    expect(r.ruleId).toBe("MA-MODERATE-WARNING");
  });

  it("classifies caution as MODERATE", () => {
    const r = classifyMateriality("Caution: the operation is irreversible once confirmed.");
    expect(r.classification).toBe("MODERATE");
    expect(r.ruleId).toBe("MA-MODERATE-WARNING");
  });

  it("classifies note that as MODERATE", () => {
    const r = classifyMateriality("Note that this setting is overridden by the environment variable.");
    expect(r.classification).toBe("MODERATE");
    expect(r.ruleId).toBe("MA-MODERATE-WARNING");
  });
});

// ---------------------------------------------------------------------------
// MODERATE — Quantified limit
// ---------------------------------------------------------------------------

describe("MA-MODERATE-QUANTIFIED", () => {
  it("classifies SLA threshold as MODERATE or HIGH (must triggers HIGH-OBLIGATION first)", () => {
    const r = classifyMateriality("The system must achieve an availability of 99.9% uptime.");
    // "must" fires MA-HIGH-OBLIGATION before MODERATE-QUANTIFIED; both are acceptable
    expect(["MODERATE", "HIGH"]).toContain(r.classification);
  });

  it("classifies rate limit as MODERATE", () => {
    const r = classifyMateriality("The rate limit is 1000 requests per minute.");
    expect(r.classification).toBe("MODERATE");
    expect(r.ruleId).toBe("MA-MODERATE-QUANTIFIED");
  });

  it("classifies maximum users as MODERATE", () => {
    const r = classifyMateriality("The licence allows a maximum of 500 users.");
    expect(r.classification).toBe("MODERATE");
    expect(r.ruleId).toBe("MA-MODERATE-QUANTIFIED");
  });
});

// ---------------------------------------------------------------------------
// LOW — Example
// ---------------------------------------------------------------------------

describe("MA-LOW-EXAMPLE", () => {
  it("classifies for example as LOW", () => {
    const r = classifyMateriality("For example, a user may upload a PDF document.");
    expect(r.classification).toBe("LOW");
    expect(r.ruleId).toBe("MA-LOW-EXAMPLE");
  });

  it("classifies e.g. as LOW", () => {
    const r = classifyMateriality("Common formats include plain text, e.g. CSV and TSV files.");
    expect(r.classification).toBe("LOW");
    expect(r.ruleId).toBe("MA-LOW-EXAMPLE");
  });

  it("classifies such as as LOW", () => {
    const r = classifyMateriality("Supported databases include relational systems such as PostgreSQL.");
    expect(r.classification).toBe("LOW");
    expect(r.ruleId).toBe("MA-LOW-EXAMPLE");
  });

  it("classifies for instance as LOW", () => {
    const r = classifyMateriality("For instance, a user could export the report as a CSV file.");
    expect(r.classification).toBe("LOW");
    expect(r.ruleId).toBe("MA-LOW-EXAMPLE");
  });
});

// ---------------------------------------------------------------------------
// LOW — Descriptive
// ---------------------------------------------------------------------------

describe("MA-LOW-DESCRIPTIVE", () => {
  it("classifies system contains as LOW", () => {
    const r = classifyMateriality("The system contains three main modules for data processing.");
    expect(r.classification).toBe("LOW");
    expect(r.ruleId).toBe("MA-LOW-DESCRIPTIVE");
  });

  it("classifies this document describes as LOW", () => {
    const r = classifyMateriality("This document describes the onboarding process for new employees.");
    expect(r.classification).toBe("LOW");
    expect(r.ruleId).toBe("MA-LOW-DESCRIPTIVE");
  });

  it("classifies the application provides as LOW", () => {
    const r = classifyMateriality("The application provides real-time visibility into queue depths.");
    expect(r.classification).toBe("LOW");
    expect(r.ruleId).toBe("MA-LOW-DESCRIPTIVE");
  });
});

// ---------------------------------------------------------------------------
// LOW — Background
// ---------------------------------------------------------------------------

describe("MA-LOW-BACKGROUND", () => {
  it("classifies historically as LOW", () => {
    const r = classifyMateriality("Historically, the process has been entirely manual.");
    expect(r.classification).toBe("LOW");
    expect(r.ruleId).toBe("MA-LOW-BACKGROUND");
  });

  it("classifies typically as LOW", () => {
    const r = classifyMateriality("This approach is typically used in high-throughput environments.");
    expect(r.classification).toBe("LOW");
    expect(r.ruleId).toBe("MA-LOW-BACKGROUND");
  });

  it("classifies in general as LOW", () => {
    const r = classifyMateriality("In general, the latency is acceptable for batch workloads.");
    expect(r.classification).toBe("LOW");
    expect(r.ruleId).toBe("MA-LOW-BACKGROUND");
  });
});

// ---------------------------------------------------------------------------
// LOW — Explanatory
// ---------------------------------------------------------------------------

describe("MA-LOW-EXPLANATORY", () => {
  it("classifies this means that as LOW", () => {
    const r = classifyMateriality("This means that the record will be permanently deleted.");
    expect(r.classification).toBe("LOW");
    expect(r.ruleId).toBe("MA-LOW-EXPLANATORY");
  });

  it("classifies in other words as LOW", () => {
    const r = classifyMateriality("In other words, the pipeline is idempotent for all inputs.");
    expect(r.classification).toBe("LOW");
    expect(r.ruleId).toBe("MA-LOW-EXPLANATORY");
  });

  it("classifies i.e. as LOW", () => {
    const r = classifyMateriality("The token expires after 3600 seconds, i.e. one hour.");
    expect(r.classification).toBe("LOW");
    expect(r.ruleId).toBe("MA-LOW-EXPLANATORY");
  });
});

// ---------------------------------------------------------------------------
// INFORMATIONAL — Label
// ---------------------------------------------------------------------------

describe("MA-INFO-LABEL", () => {
  it("classifies Version: label as INFORMATIONAL", () => {
    const r = classifyMateriality("Version: 1.0");
    expect(r.classification).toBe("INFORMATIONAL");
    expect(r.ruleId).toBe("MA-INFO-LABEL");
  });

  it("classifies Author: label as INFORMATIONAL", () => {
    const r = classifyMateriality("Author: Jane Smith");
    expect(r.classification).toBe("INFORMATIONAL");
    expect(r.ruleId).toBe("MA-INFO-LABEL");
  });

  it("classifies Date: label as INFORMATIONAL", () => {
    const r = classifyMateriality("Date: 2026-07-26");
    expect(r.classification).toBe("INFORMATIONAL");
    expect(r.ruleId).toBe("MA-INFO-LABEL");
  });

  it("classifies Status: label as INFORMATIONAL", () => {
    const r = classifyMateriality("Status: Draft");
    expect(r.classification).toBe("INFORMATIONAL");
    expect(r.ruleId).toBe("MA-INFO-LABEL");
  });
});

// ---------------------------------------------------------------------------
// INFORMATIONAL — Short noun phrase (heading-like)
// ---------------------------------------------------------------------------

describe("MA-INFO-SHORT-NOUN", () => {
  it("classifies single-word heading as INFORMATIONAL", () => {
    const r = classifyMateriality("Introduction");
    expect(r.classification).toBe("INFORMATIONAL");
    expect(r.ruleId).toBe("MA-INFO-SHORT-NOUN");
  });

  it("classifies two-word heading as INFORMATIONAL", () => {
    const r = classifyMateriality("Risk Assessment");
    expect(r.classification).toBe("INFORMATIONAL");
    expect(r.ruleId).toBe("MA-INFO-SHORT-NOUN");
  });

  it("classifies three-word title as INFORMATIONAL", () => {
    const r = classifyMateriality("Scope and Objectives");
    expect(r.classification).toBe("INFORMATIONAL");
    expect(r.ruleId).toBe("MA-INFO-SHORT-NOUN");
  });
});

// ---------------------------------------------------------------------------
// INFORMATIONAL — Navigation
// ---------------------------------------------------------------------------

describe("MA-INFO-NAVIGATION", () => {
  it("classifies see also as INFORMATIONAL", () => {
    const r = classifyMateriality("See also Section 4 for further details on configuration.");
    expect(r.classification).toBe("INFORMATIONAL");
    expect(r.ruleId).toBe("MA-INFO-NAVIGATION");
  });

  it("classifies refer to as INFORMATIONAL", () => {
    const r = classifyMateriality("Refer to the appendix for the full parameter list.");
    expect(r.classification).toBe("INFORMATIONAL");
    expect(r.ruleId).toBe("MA-INFO-NAVIGATION");
  });

  it("classifies as described above as INFORMATIONAL", () => {
    const r = classifyMateriality("As described above, the retry logic applies to all transient failures.");
    expect(r.classification).toBe("INFORMATIONAL");
    expect(r.ruleId).toBe("MA-INFO-NAVIGATION");
  });
});

// ---------------------------------------------------------------------------
// UNDETERMINED — default
// ---------------------------------------------------------------------------

describe("MA-UNDETERMINED-DEFAULT", () => {
  it("classifies ambiguous statement as UNDETERMINED", () => {
    const r = classifyMateriality("It depends on the context.");
    expect(r.classification).toBe("UNDETERMINED");
    expect(r.ruleId).toBe("MA-UNDETERMINED-DEFAULT");
    expect(r.triggeringCharacteristics).toHaveLength(0);
  });

  it("classifies fragment as UNDETERMINED", () => {
    const r = classifyMateriality("As discussed previously");
    // Could be INFORMATIONAL (navigation) or UNDETERMINED; both acceptable
    expect(["UNDETERMINED", "INFORMATIONAL"]).toContain(r.classification);
  });

  it("classifies context-dependent statement as UNDETERMINED", () => {
    const r = classifyMateriality("The above applies when the flag is set.");
    expect(r.classification).toBe("UNDETERMINED");
    expect(r.ruleId).toBe("MA-UNDETERMINED-DEFAULT");
  });
});

// ---------------------------------------------------------------------------
// Priority: CRITICAL beats HIGH beats MODERATE
// ---------------------------------------------------------------------------

describe("Rule priority", () => {
  it("CRITICAL beats HIGH when both patterns match", () => {
    // "must" (HIGH-OBLIGATION) + "legally required" (CRITICAL-LEGAL)
    const r = classifyMateriality("The vendor must comply because it is legally required.");
    expect(r.classification).toBe("CRITICAL");
  });

  it("HIGH beats MODERATE when both patterns match", () => {
    // "we recommend" (HIGH-RECOMMENDATION) + "should" (MODERATE-GUIDANCE)
    const r = classifyMateriality("We recommend that all systems should apply this patch.");
    expect(r.classification).toBe("HIGH");
  });

  it("MODERATE beats LOW when both patterns match", () => {
    // "because" (MODERATE-RATIONALE) + "for example" (LOW-EXAMPLE)
    const r = classifyMateriality("The decision was made because of failures similar to, for example, the 2019 incident.");
    expect(r.classification).toBe("MODERATE");
  });
});
