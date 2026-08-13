/**
 * DRA-ENG-026 — Cross-Language Stage 5 Materiality Closure
 * Controlled semantic-pair test matrix (pure data, no execution).
 *
 * DIAGNOSTIC DATA ONLY. This module defines a semantically-controlled
 * English/Spanish sentence-pair matrix used to isolate whether Stage 5
 * materiality classification (`classifyMateriality`) exhibits a genuine
 * language-dependent defect once semantic content, structure, obligation
 * strength, negation, and scope are held constant across languages.
 *
 * Design discipline (per the ENG-026 task specification):
 *   - Each pair varies ONLY language; proposition, authority, obligation
 *     strength, evidence, modality, negation, scope, and materiality are
 *     held constant across the EN/ES sides of a pair.
 *   - Two independently-worded variants per semantic class prevent any
 *     single keyword from determining the result.
 *   - Sentences use natural, idiomatic Spanish (not literal word-for-word
 *     translation); no example is engineered around a specific known
 *     implementation token beyond what the semantic class itself requires.
 *   - `expectedClassification`/`expectedRuleFamily` are the SEMANTIC ORACLE:
 *     pre-registered, independent of running Stage 5 on this matrix. They
 *     were derived from Stage 5's own already-frozen, English-validated
 *     rule catalogue and unit-test suite (`materiality-rules.ts`,
 *     `materiality-rules.test.ts`) — i.e. "what would a semantically
 *     equivalent, idiomatic English construction of this type receive",
 *     which is a fact already established and regression-tested
 *     independently of this experiment. This tests DRA's own frozen Stage 5
 *     semantics; it does not invent a new normative theory of obligation.
 *   - `FACTUAL_2` is intentionally marked EXCLUDED_DESIGN_MISMATCH: on
 *     construction its English side did not trigger the rule the semantic
 *     class intended (see notes), so it is excluded from aggregate
 *     statistics rather than forced to a result, per the task's explicit
 *     "exclude or classify explicitly rather than forcing an answer" rule.
 */

export type SemanticClass =
  | "MANDATORY_OBLIGATION"
  | "PROHIBITION"
  | "STRONG_RECOMMENDATION"
  | "WEAK_RECOMMENDATION"
  | "PERMISSION"
  | "FACTUAL_STATEMENT"
  | "DESCRIPTIVE_BACKGROUND"
  | "CONDITIONAL_OBLIGATION"
  | "EXCEPTION"
  | "NEGATED_OBLIGATION"
  | "FUTURE_INTENDED_ACTION"
  | "AUTHORITY_STATEMENT"
  | "SCOPE_LIMITATION";

export type ExpectedMateriality = "CRITICAL" | "HIGH" | "MODERATE" | "LOW" | "INFORMATIONAL" | "UNDETERMINED";

export interface ControlledPair {
  readonly id: string;
  readonly semanticClass: SemanticClass;
  readonly variant: 1 | 2;
  readonly en: string;
  readonly es: string;
  /** Pre-registered oracle: the classification the semantic content is expected to receive if Stage 5 is language-neutral for this construction. */
  readonly expectedClassification: ExpectedMateriality;
  /** Pre-registered oracle: the rule ID expected to fire, when a specific rule is expected. */
  readonly expectedRuleId: string | null;
  /** Translation note documenting any deliberate deviation from literal translation. */
  readonly translationNote: string;
  /** Set only for pairs excluded from aggregate statistics due to a construction defect unrelated to language. */
  readonly excluded?: "EXCLUDED_DESIGN_MISMATCH";
  readonly exclusionReason?: string;
}

export const CONTROLLED_MATRIX: readonly ControlledPair[] = [
  // ---- MANDATORY_OBLIGATION ----
  {
    id: "MANDATORY_OBLIGATION_1", semanticClass: "MANDATORY_OBLIGATION", variant: 1,
    en: "The vendor must submit the report within 30 days.",
    es: "El proveedor debe presentar el informe en un plazo de 30 días.",
    expectedClassification: "HIGH", expectedRuleId: "MA-HIGH-OBLIGATION",
    translationNote: "Idiomatic; 'debe' is the natural Spanish present-tense deontic equivalent of 'must'.",
  },
  {
    id: "MANDATORY_OBLIGATION_2", semanticClass: "MANDATORY_OBLIGATION", variant: 2,
    en: "Employees shall wear protective equipment at all times.",
    es: "Los empleados deberán usar equipo de protección en todo momento.",
    expectedClassification: "HIGH", expectedRuleId: "MA-HIGH-OBLIGATION",
    translationNote: "Idiomatic; 'deberán' (future-tense deontic) is the natural formal-register Spanish equivalent of 'shall', varying morphology from variant 1's 'debe'.",
  },

  // ---- PROHIBITION ----
  {
    id: "PROHIBITION_1", semanticClass: "PROHIBITION", variant: 1,
    en: "Contractors must not access the server room without authorization.",
    es: "Los contratistas no deben acceder a la sala de servidores sin autorización.",
    expectedClassification: "HIGH", expectedRuleId: "MA-HIGH-OBLIGATION",
    translationNote: "Idiomatic negated obligation; tests negation handling within the obligation-lexicon mechanism.",
  },
  {
    id: "PROHIBITION_2", semanticClass: "PROHIBITION", variant: 2,
    en: "Visitors shall not remove any equipment from the premises.",
    es: "Los visitantes no deberán retirar ningún equipo de las instalaciones.",
    expectedClassification: "HIGH", expectedRuleId: "MA-HIGH-OBLIGATION",
    translationNote: "Idiomatic negated obligation, future-tense deontic morphology, double negation ('no...ningún') natural in Spanish.",
  },

  // ---- STRONG_RECOMMENDATION ----
  {
    id: "STRONG_RECOMMENDATION_1", semanticClass: "STRONG_RECOMMENDATION", variant: 1,
    en: "It is recommended that staff complete the training.",
    es: "Se recomienda que el personal complete la formación.",
    expectedClassification: "HIGH", expectedRuleId: "MA-HIGH-RECOMMENDATION",
    translationNote: "Idiomatic impersonal-passive recommendation construction, natural in both languages.",
  },
  {
    id: "STRONG_RECOMMENDATION_2", semanticClass: "STRONG_RECOMMENDATION", variant: 2,
    en: "We recommend migrating to the new platform by next quarter.",
    es: "Recomendamos migrar a la nueva plataforma en el próximo trimestre.",
    expectedClassification: "HIGH", expectedRuleId: "MA-HIGH-RECOMMENDATION",
    translationNote: "Idiomatic first-person-plural recommendation, varying grammatical construction from variant 1's impersonal form.",
  },

  // ---- WEAK_RECOMMENDATION ----
  {
    id: "WEAK_RECOMMENDATION_1", semanticClass: "WEAK_RECOMMENDATION", variant: 1,
    en: "This configuration should be reviewed periodically.",
    es: "Esta configuración debería revisarse periódicamente.",
    expectedClassification: "MODERATE", expectedRuleId: "MA-MODERATE-GUIDANCE",
    translationNote: "Idiomatic conditional-mood deontic 'debería' is the natural Spanish equivalent of weak-obligation 'should'.",
  },
  {
    id: "WEAK_RECOMMENDATION_2", semanticClass: "WEAK_RECOMMENDATION", variant: 2,
    en: "Teams should document their deployment process.",
    es: "Los equipos deberían documentar su proceso de implementación.",
    expectedClassification: "MODERATE", expectedRuleId: "MA-MODERATE-GUIDANCE",
    translationNote: "Idiomatic; same conditional-mood deontic morphology as variant 1.",
  },

  // ---- PERMISSION (expected symmetric non-coverage: no Stage 5 rule targets bare permission) ----
  {
    id: "PERMISSION_1", semanticClass: "PERMISSION", variant: 1,
    en: "Employees may work remotely on Fridays.",
    es: "Los empleados pueden trabajar de forma remota los viernes.",
    expectedClassification: "UNDETERMINED", expectedRuleId: "MA-UNDETERMINED-DEFAULT",
    translationNote: "Idiomatic; 'pueden' is the natural Spanish equivalent of permissive 'may'. Neither language has a Stage 5 rule for bare permission.",
  },
  {
    id: "PERMISSION_2", semanticClass: "PERMISSION", variant: 2,
    en: "Users are permitted to export their data at any time.",
    es: "Los usuarios pueden exportar sus datos en cualquier momento.",
    expectedClassification: "UNDETERMINED", expectedRuleId: "MA-UNDETERMINED-DEFAULT",
    translationNote: "Idiomatic; passive-permission English construction naturally renders as active 'pueden' in Spanish.",
  },

  // ---- FACTUAL_STATEMENT ----
  {
    id: "FACTUAL_1", semanticClass: "FACTUAL_STATEMENT", variant: 1,
    en: "The system processes over one million requests per day.",
    es: "El sistema procesa más de un millón de solicitudes al día.",
    expectedClassification: "LOW", expectedRuleId: "MA-LOW-DESCRIPTIVE",
    translationNote: "Direct, natural translation; both are simple declarative capability statements.",
  },
  {
    id: "FACTUAL_2", semanticClass: "FACTUAL_STATEMENT", variant: 2,
    en: "This service supports multiple authentication providers.",
    es: "Este servicio admite múltiples proveedores de autenticación.",
    expectedClassification: "LOW", expectedRuleId: "MA-LOW-DESCRIPTIVE",
    translationNote: "Direct, natural translation.",
    excluded: "EXCLUDED_DESIGN_MISMATCH",
    exclusionReason:
      "MA-LOW-DESCRIPTIVE's noun-phrase alternation lists 'this component' but not 'this service' " +
      "(only 'the service' is listed) — so the intended EN trigger itself does not fire " +
      "(actual EN result: UNDETERMINED, not the intended LOW). This is a pre-existing English-side " +
      "rule-coverage gap unrelated to cross-language behaviour, so the pair is excluded from " +
      "aggregate divergence statistics rather than forced into either bucket. Retained here as a " +
      "distinct, separately-noteworthy finding (Section 8 of the closure report).",
  },

  // ---- DESCRIPTIVE_BACKGROUND ----
  {
    id: "DESCRIPTIVE_BACKGROUND_1", semanticClass: "DESCRIPTIVE_BACKGROUND", variant: 1,
    en: "Historically, the platform was built on a monolithic architecture.",
    es: "Históricamente, la plataforma se construyó sobre una arquitectura monolítica.",
    expectedClassification: "LOW", expectedRuleId: "MA-LOW-BACKGROUND",
    translationNote: "Direct, natural translation; 'históricamente' is the exact Spanish cognate of 'historically'.",
  },
  {
    id: "DESCRIPTIVE_BACKGROUND_2", semanticClass: "DESCRIPTIVE_BACKGROUND", variant: 2,
    en: "In general, deployments occur on a bi-weekly schedule.",
    es: "En general, los despliegues ocurren en un ciclo quincenal.",
    expectedClassification: "LOW", expectedRuleId: "MA-LOW-BACKGROUND",
    translationNote: "Direct, natural translation; 'en general' is the exact Spanish equivalent of 'in general'.",
  },

  // ---- CONDITIONAL_OBLIGATION ----
  {
    id: "CONDITIONAL_OBLIGATION_1", semanticClass: "CONDITIONAL_OBLIGATION", variant: 1,
    en: "If the incident is classified as critical, the team must notify the customer within one hour.",
    es: "Si el incidente se clasifica como crítico, el equipo debe notificar al cliente en un plazo de una hora.",
    expectedClassification: "HIGH", expectedRuleId: "MA-HIGH-OBLIGATION",
    translationNote: "Direct, natural translation; conditional clause structure preserved on both sides.",
  },
  {
    id: "CONDITIONAL_OBLIGATION_2", semanticClass: "CONDITIONAL_OBLIGATION", variant: 2,
    en: "Where more than 500 users are affected, approval must be obtained from the finance director.",
    es: "Cuando más de 500 usuarios se vean afectados, deberá obtenerse la aprobación del director financiero.",
    expectedClassification: "HIGH", expectedRuleId: "MA-HIGH-OBLIGATION",
    translationNote:
      "Direct, natural translation; deliberately avoids a currency amount (which would trigger " +
      "MA-CRITICAL-PAYMENT's bare-currency alternation and confound the comparison), keeping the " +
      "only condition a plain numeric threshold.",
  },

  // ---- EXCEPTION ----
  {
    id: "EXCEPTION_1", semanticClass: "EXCEPTION", variant: 1,
    en: "Except for emergency maintenance, all changes require advance notice.",
    es: "Salvo en caso de mantenimiento de emergencia, todos los cambios requieren aviso previo.",
    expectedClassification: "UNDETERMINED", expectedRuleId: "MA-UNDETERMINED-DEFAULT",
    translationNote: "Direct, natural translation; bare exception clause with no deontic modal verb on either side.",
  },
  {
    id: "EXCEPTION_2", semanticClass: "EXCEPTION", variant: 2,
    en: "Except as otherwise agreed in writing, the supplier must deliver within 14 days.",
    es: "Salvo que se acuerde lo contrario por escrito, el proveedor debe entregar en un plazo de 14 días.",
    expectedClassification: "HIGH", expectedRuleId: "MA-HIGH-OBLIGATION",
    translationNote: "Direct, natural translation; exception clause wraps an embedded mandatory obligation.",
  },

  // ---- NEGATED_OBLIGATION (expected symmetric non-coverage) ----
  {
    id: "NEGATED_OBLIGATION_1", semanticClass: "NEGATED_OBLIGATION", variant: 1,
    en: "The tenant is not required to renew the lease automatically.",
    es: "El inquilino no está obligado a renovar el contrato automáticamente.",
    expectedClassification: "UNDETERMINED", expectedRuleId: "MA-UNDETERMINED-DEFAULT",
    translationNote: "Idiomatic; 'no está obligado a' is the natural Spanish equivalent of 'is not required to'. Neither language has a rule for negated-obligation absence-of-duty language.",
  },
  {
    id: "NEGATED_OBLIGATION_2", semanticClass: "NEGATED_OBLIGATION", variant: 2,
    en: "Employees need not attend the optional seminar.",
    es: "Los empleados no necesitan asistir al seminario opcional.",
    expectedClassification: "UNDETERMINED", expectedRuleId: "MA-UNDETERMINED-DEFAULT",
    translationNote: "Idiomatic; 'no necesitan' naturally renders archaic-register 'need not'.",
  },

  // ---- FUTURE_INTENDED_ACTION (expected symmetric non-coverage) ----
  {
    id: "FUTURE_INTENDED_ACTION_1", semanticClass: "FUTURE_INTENDED_ACTION", variant: 1,
    en: "The company will migrate all services to the new data center next quarter.",
    es: "La empresa migrará todos los servicios al nuevo centro de datos el próximo trimestre.",
    expectedClassification: "UNDETERMINED", expectedRuleId: "MA-UNDETERMINED-DEFAULT",
    translationNote: "Direct, natural translation; plain future-tense intent, distinct from the deployment-specific 'will be deployed' pattern Stage 5 does recognise.",
  },
  {
    id: "FUTURE_INTENDED_ACTION_2", semanticClass: "FUTURE_INTENDED_ACTION", variant: 2,
    en: "The vendor will provide quarterly performance reports.",
    es: "El proveedor proporcionará informes de rendimiento trimestrales.",
    expectedClassification: "UNDETERMINED", expectedRuleId: "MA-UNDETERMINED-DEFAULT",
    translationNote: "Direct, natural translation; plain future-tense intent.",
  },

  // ---- AUTHORITY_STATEMENT (expected symmetric non-coverage) ----
  {
    id: "AUTHORITY_STATEMENT_1", semanticClass: "AUTHORITY_STATEMENT", variant: 1,
    en: "The compliance officer is authorised to approve exceptions to this policy.",
    es: "El responsable de cumplimiento está autorizado a aprobar excepciones a esta política.",
    expectedClassification: "UNDETERMINED", expectedRuleId: "MA-UNDETERMINED-DEFAULT",
    translationNote: "Direct, natural translation; 'is authorised to' is a distinct grammatical form from the passive 'is approved' that MA-HIGH-APPROVAL requires, so neither language triggers it.",
  },
  {
    id: "AUTHORITY_STATEMENT_2", semanticClass: "AUTHORITY_STATEMENT", variant: 2,
    en: "Only the data protection officer may authorise cross-border transfers.",
    es: "Solo el delegado de protección de datos puede autorizar las transferencias transfronterizas.",
    expectedClassification: "UNDETERMINED", expectedRuleId: "MA-UNDETERMINED-DEFAULT",
    translationNote: "Direct, natural translation; permissive-authority modal 'may'/'puede', uncovered on both sides.",
  },

  // ---- SCOPE_LIMITATION (expected symmetric non-coverage) ----
  {
    id: "SCOPE_LIMITATION_1", semanticClass: "SCOPE_LIMITATION", variant: 1,
    en: "This policy applies only to employees based in the European Union.",
    es: "Esta política se aplica únicamente a los empleados con sede en la Unión Europea.",
    expectedClassification: "UNDETERMINED", expectedRuleId: "MA-UNDETERMINED-DEFAULT",
    translationNote: "Direct, natural translation; 'this policy' is not in MA-LOW-DESCRIPTIVE's noun-phrase alternation, so no rule fires on either side.",
  },
  {
    id: "SCOPE_LIMITATION_2", semanticClass: "SCOPE_LIMITATION", variant: 2,
    en: "These requirements do not extend to contractors engaged before 2020.",
    es: "Estos requisitos no se aplican a los contratistas contratados antes de 2020.",
    expectedClassification: "UNDETERMINED", expectedRuleId: "MA-UNDETERMINED-DEFAULT",
    translationNote: "Direct, natural translation; negated scope-limitation clause, uncovered on both sides.",
  },
];
