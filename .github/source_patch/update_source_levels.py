from pathlib import Path


def replace_once(path, old, new):
    p = Path(path)
    text = p.read_text(encoding='utf-8')
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{path}: expected one match, found {count}: {old}')
    p.write_text(text.replace(old, new, 1), encoding='utf-8')


coding = 'data/operation_coding.json'
replace_once(
    coding,
    '"verificationLevelCounts":{"publisher_full_or_detailed_page":9,"full_text":21,"detailed_corpus_record_only":74,"primary_or_indexed_abstract":68}',
    '"verificationLevelCounts":{"publisher_full_or_detailed_page":9,"full_text":22,"detailed_corpus_record_only":71,"primary_or_indexed_abstract":70}'
)
replace_once(
    coding,
    '"citationAuditStatusCounts":{"consistent_with_primary_source":30,"consistent_with_detailed_corpus_record_primary_check_pending":73,"consistent_with_primary_abstract":66,"not_cited_in_review":3}',
    '"citationAuditStatusCounts":{"consistent_with_primary_source":31,"consistent_with_detailed_corpus_record_primary_check_pending":70,"consistent_with_primary_abstract":68,"not_cited_in_review":3}'
)
replace_once(coding, '"papersRequiringPrimaryTextReview":74', '"papersRequiringPrimaryTextReview":71')
replace_once(coding, '"zhang2024":{"o":"RGE","v":"D","c":"D","n":1}', '"zhang2024":{"o":"RGE","v":"F","c":"S","n":1}')
replace_once(coding, '"zhangandchen2024":{"o":"GA","v":"D","c":"D","n":1}', '"zhangandchen2024":{"o":"GA","v":"A","c":"A","n":1}')
replace_once(coding, '"zheng2026":{"o":"RG","v":"D","c":"D","n":2}', '"zheng2026":{"o":"RG","v":"A","c":"A","n":2}')

readme = 'data/OPERATION_CODING_AUDIT.md'
replace_once(readme, '- Accessible full text reviewed: **21**', '- Accessible full text reviewed: **22**')
replace_once(readme, '- Primary or indexed abstract reviewed: **68**', '- Primary or indexed abstract reviewed: **70**')
replace_once(readme, '- Detailed corpus record reviewed; independent primary text still pending: **74**', '- Detailed corpus record reviewed; independent primary text still pending: **71**')
replace_once(readme, 'The 74 records without independently accessible primary text remain explicitly marked for further review.', 'The 71 records without independently accessible primary text remain explicitly marked for further review.')
