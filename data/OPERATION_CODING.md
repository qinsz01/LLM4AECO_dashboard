# Data-processing operation coding

Each paper was reviewed individually at the abstract level. The `methodology` and
`results` summaries in the record were consulted when the abstract alone was
ambiguous.

The `operations` field is multi-label and uses four values:

- `generation_parameterization`: creates a new model, design artifact, schedule,
  report, code fragment, recommendation, or parameter set.
- `editing_execution`: changes an existing state or invokes an external
  database, API, authoring tool, simulator, controller, or executable interface.
- `analysis_compliance_diagnosis`: derives, classifies, checks, calculates,
  diagnoses, or interprets engineering findings.
- `retrieval_alignment`: maps language or observations to documents, records,
  identifiers, schemas, graph entities, software functions, or other stable
  information targets.

Only operations implemented and meaningfully evaluated in the reported workflow
are coded. Background discussion, future work, incidental pipeline steps, and
researcher-side evaluation alone are excluded.

All 172 records contain `operations`, `operationEvidence`, and
`operationCodingBasis`. Two secondary or perspective records do not evaluate a
specific AECO LLM workflow and therefore have an empty `operations` array.
