# Multi-label data-processing operation coding (draft)

This dataset adds a multi-label operation layer to the 172-paper LLM4AECO corpus and links the representation families in the review to the data-processing operations and AECO task categories.

## Coding protocol

Each paper may receive several labels:

1. **Generation and parameterization**
2. **Editing and execution**
3. **Analysis, compliance, and diagnosis**
4. **Retrieval and alignment**

Only operations implemented and meaningfully evaluated in the reported workflow are coded. Background discussion, future work, incidental pipeline steps, and researcher-side evaluation alone are not treated as system operations.

## Current audit status

- Papers: **172**
- Multi-label assignments: **362**
- Generation and parameterization: **102**
- Editing and execution: **68**
- Analysis, compliance, and diagnosis: **112**
- Retrieval and alignment: **80**

Source level used for the present draft:

- Accessible full text reviewed: **22**
- Publisher full text or detailed article page reviewed: **9**
- Primary or indexed abstract reviewed: **70**
- Detailed corpus record reviewed; independent primary text still pending: **71**

The dashboard records the source-verification level, coding confidence, operation evidence, and review-citation audit status for every paper. The 71 records without independently accessible primary text remain explicitly marked for further review. This is therefore a reviewable draft, not a claim that all 172 full texts have been independently re-read.

## Citation-context audit

The current review text cites 169 of the 172 records. Three records are not cited in the manuscript text. Citation-context status is recorded separately from source-verification level. A “consistent” status means that the manuscript use matches the source material available at the stated verification level; it does not imply independent replication of the study.

## Association analysis

The two association files report:

- representation × operation associations;
- operation × task-category associations;
- raw multi-label counts;
- conditional prevalence and lift;
- odds ratios and Fisher exact-test p-values;
- Benjamini–Hochberg false-discovery-rate adjusted q-values;
- fractional paper-equivalent flows for the three-layer diagram.

Each paper contributes total flow weight 1, divided equally among all of its operation labels. This preserves one paper-equivalent per coded paper despite multi-label assignments.

The results describe corpus-level alignment and over-representation. They do not establish causal superiority or universal task suitability. The learned/engineered-code family contains only four papers and is exploratory.
