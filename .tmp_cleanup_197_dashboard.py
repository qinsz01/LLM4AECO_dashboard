import json
from pathlib import Path

paper_path = Path('data/papers/mehrishal2025.json')
paper = json.loads(paper_path.read_text(encoding='utf-8'))
paper['title'] = 'Tunnel Rapid AI Classification (TRaiC): An Open-Source Code for 360° Tunnel Face Mapping, Discontinuity Analysis, and RAG-LLM-Powered Geo-Engineering Reporting'
paper['journal'] = 'Remote Sensing'
paper['doi'] = '10.3390/rs17162891'
paper['url'] = 'https://doi.org/10.3390/rs17162891'
paper['firstOnlineDate'] = '2025-08-20'
paper_path.write_text(json.dumps(paper, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

index_path = Path('data/index.json')
index = json.loads(index_path.read_text(encoding='utf-8'))
hits = 0
for rec in index:
    if rec.get('id') == 'mehrishal2025':
        rec['title'] = paper['title']
        hits += 1
assert hits == 1, hits
index_path.write_text(json.dumps(index, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

op_doc = '''# Data-processing operation coding

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
'''
Path('data/OPERATION_CODING.md').write_text(op_doc, encoding='utf-8')

recon_path = Path('data/CORPUS_RECONCILIATION.md')
recon = recon_path.read_text(encoding='utf-8')
marker = '## Bibliographic metadata corrections'
if marker not in recon:
    recon += '''\n\n## Bibliographic metadata corrections\n\n- `mehrishal2025` was originally stored with its Preprints.org metadata. The\n  record has been updated to the formal peer-reviewed article in *Remote\n  Sensing* 17(16), 2891, DOI `10.3390/rs17162891`, first published online on\n  2025-08-20. This is a bibliographic correction only; the study coding and\n  corpus membership are unchanged.\n'''
recon_path.write_text(recon, encoding='utf-8')
