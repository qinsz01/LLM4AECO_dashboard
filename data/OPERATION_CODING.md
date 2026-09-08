# Data-processing operation coding

Each active study was reviewed individually against the highest available
primary source. Full texts were checked for the final **197-study analytical
corpus**. A locally misfiled PDF encountered during coding was rejected and
replaced with the correct publisher PDF.

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

Boundary rules used in the review:

- ordinary question-answer prose is not generation;
- researcher-computed metrics are not system analysis;
- mentioning software or an API is not execution;
- vector retrieval is retrieval, while executed SQL, Cypher, or SPARQL queries
  are both retrieval and execution;
- a recommendation is generation only when it is an implemented and evaluated
  task output.

All **197 active analytical records** contain `operations`,
`operationEvidence`, and `operationCodingBasis`; all active records have at
least one operation label and the final corpus contains **445 operation
assignments** in total. The two secondary/non-primary records tracked in
`excluded_secondary_studies.json` are not part of the active analytical corpus
and retain empty operation arrays because they do not evaluate a paper-specific
LLM-enabled AECO workflow.
