# Final corpus reconciliation

This file records the final provenance and duplicate audit used to freeze the analytical LLM4AECO dashboard corpus.

## Final analytical count

The dashboard loads the original database-search index (`data/index.json`, 172 records), removes two secondary/non-primary studies through `data/excluded_secondary_studies.json`, and adds 27 eligible reconciliation records through `data/manual_additions.json`.

**Final analytical corpus: 172 - 2 + 27 = 197 studies.**

The original `data/index.json` is intentionally left unchanged so that the database-search corpus remains traceable to the original Scopus/Web of Science screening output.

## Provenance classes

### Original-search reinstatements

The following eight eligible studies were verified against the original Scopus/WoS RIS exports and were present in the database search, but were not retained in the original 172-record corpus. They are therefore reinstatements rather than new external discoveries.

- `chatdesign2024` — ChatDesign: Bootstrapping Generative Floor Plan Design With Pre-trained Large Language Models
- `archiagents2025` — Archi-Agents: Approximating the architectural design process with collaborative specialized multi-agent system LLM and Building Information Modeling
- `leeragft2024` — Performance comparison of retrieval-augmented generation and fine-tuned large language models for construction safety management knowledge retrieval
- `leelongcontext2025` — Long context window-based zero-shot legal interpretation of building codes and regulations
- `iversen2026` — Leveraging large language models for BIM-based automated compliance checking
- `janglee2024` — Interactive Design by Integrating a Large Pre-Trained Language Model and Building Information Modeling
- `wangsafety2025` — An integrated approach for automatic safety inspection in construction: Domain knowledge with multimodal large language model
- `mouseless2026` — Artifact-driven LLM integration for mouseless design workflows

The first five had already been restored in earlier dashboard reconciliation. The final pass adds the last three and records the provenance consistently in `data/manual_additions.json`.

### Existing supplementary reconciliation

The following eleven records were retained from earlier documented supplementary/manual reconciliation and were reclassified with explicit provenance rather than being mixed with database-search reinstatements:

- `ahn2023`
- `prieto2023`
- `uddin2023`
- `you2023`
- `buildingagent2024`
- `chenparametric2025`
- `generalistagent2025`
- `chenyin2025`
- `gaocontract2025`
- `zhangcontractft2026`
- `lifall2026`

### Final targeted supplementary reconciliation

Eight high-quality, building-centered AECO studies were added after full-text/publisher-source verification because they materially fill representation/method/operation coverage gaps not captured by the primary query terminology:

- `wongcontract2024` — knowledge-augmented construction contract risk identification
- `zhengcontract2025` — NCKG/RDF-star + GraphRAG construction contract review
- `xuar2024` — OCR + GPT-4 + Unity/HoloLens maintenance text-to-action
- `chanvlsafety2025` — ontology-enriched, LoRA-tuned construction safety VLM
- `buildinggpt2_2026` — Brick semantic querying with LoRA + VG-RAG + CoT
- `smalllm2026` — construction-specialized LM adaptation/scale/data comparison
- `bmsrag2026` — BMS point tagging with structured sampling, RAG, and Brick alignment
- `actorask2026` — VLM construction robot control with confidence-guided human deferral

These records satisfy the same primary-study criterion used for the analytical corpus: an implemented and meaningfully evaluated LLM-enabled AECO workflow.

## Secondary-study exclusions

The following original-index records remain preserved for provenance but are excluded from all analytical counts and charts:

- `alwashah2025` — secondary systematic/bibliometric review without a paper-specific evaluated LLM workflow
- `liu2025b` — perspective/secondary study without a paper-specific evaluated LLM workflow

## Duplicate audit

Before the final additions were indexed, every new record was checked against the current dashboard by exact title and DOI/article identifier. No exact duplicate of the eleven newly indexed studies was found.

Two close research-line relationships were inspected manually and are **not duplicates**:

1. `buildinggpt2_2026` versus existing `liandwang2026` (BuildingGPT). The existing BuildingGPT paper is a training-free VG-RAG study evaluated on 45 Brick building models. BuildingGPT2 is a distinct peer-reviewed extension that adds LoRA domain fine-tuning and chain-of-thought reasoning, trains on 40 buildings, and evaluates zero-shot generalization on five held-out buildings.
2. `zhengcontract2025` versus `wongcontract2024`. Wong et al. use a vectorized natural-language factual/expert knowledge base for contract risk review; Zheng et al. develop a Nested Contract Knowledge Graph using RDF-star and GraphRAG. They are separate publications with different representations, methods, and experiments.

`xuar2024` is coded from the final peer-reviewed JCEM article (30-participant evaluation), not the earlier smaller preprint version.

## Date/cutoff check

All newly indexed studies fall within the review's 2023–May 2026 eligibility window when assessed by formal bibliographic publication year and/or first online publication availability. Borderline 2026 records were checked against publisher metadata before inclusion. The corpus is frozen after this reconciliation; subsequent papers may be cited narratively but should not be added to corpus statistics without reopening the review protocol.
