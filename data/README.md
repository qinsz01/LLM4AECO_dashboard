# Corpus coding notes

The dashboard stores the paper-level coding used for the systematic mapping corpus. Fields such as `category`, `phase`, `representation`, and `llmMethod` are corpus codes and are synchronized between `data/index.json` and the corresponding records under `data/papers/`.

## Section 4 data-processing operations

The four data-processing operations used in Section 4 of the review are **analytical synthesis classes, not an additional corpus-coding field**. They should therefore not be inferred from `category`, `task`, `representation`, or `llmMethod`, and they are not added to the 172 dashboard records.

The paper uses the following boundaries when grouping representative workflows by the operation that dominates their reported evaluation:

- **Generation and parameterisation:** creates a new model, design artefact, schedule, report, structured artefact, or parameter set.
- **Editing and execution:** applies actions that modify existing state or invoke state-changing engineering operations in an external tool.
- **Analysis, compliance, and diagnosis:** derives a finding, judgement, compliance result, diagnosis, or engineering assessment from evidence.
- **Retrieval and alignment:** selects or maps language to existing documents, records, identifiers, schemas, graph entities, formal queries, datasets, or software functions.

A single workflow may contain several of these operations. Section 4 groups representative examples by their dominant evaluated operation while allowing secondary stages to be cited elsewhere when they illustrate a relevant interface or verifier. This analytical regrouping does not require changes to the existing dashboard coding dimensions.
