from pathlib import Path

def replace_once(path, old, new):
    p = Path(path)
    text = p.read_text(encoding='utf-8')
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{path}: expected exactly one match, found {count} for {old[:100]!r}')
    p.write_text(text.replace(old, new, 1), encoding='utf-8')

# index.html
replace_once(
    'index.html',
    '    <link rel="stylesheet" href="css/style.css">\n',
    '    <link rel="stylesheet" href="css/style.css">\n'
    '    <link rel="stylesheet" href="css/operation-analysis.css">\n'
)
replace_once(
    'index.html',
    '            <div class="chart-card"><h3 class="chart-title" data-i18n="chartHeatmap">表示形式 × 分类</h3><div class="chart-container" id="chart-heatmap"></div></div>\n',
    '            <div class="chart-card"><h3 class="chart-title" data-i18n="chartHeatmap">表示形式 × 分类</h3><div class="chart-container" id="chart-heatmap"></div></div>\n'
    '            <div class="chart-card chart-card-wide">\n'
    '                <h3 class="chart-title" data-i18n="chartAssociation">表征、数据处理操作与任务关联</h3>\n'
    '                <p class="chart-note" id="association-note"></p>\n'
    '                <div class="chart-container chart-container-association" id="chart-association"></div>\n'
    '            </div>\n'
)
replace_once(
    'index.html',
    '    <script src="js/charts.js"></script>\n',
    '    <script src="js/charts.js"></script>\n'
    '    <script src="js/operation-analysis.js"></script>\n'
)

# js/i18n.js
replace_once(
    'js/i18n.js',
    "            chartHeatmap: '表示形式 \\u00D7 分类',\n",
    "            chartHeatmap: '表示形式 \\u00D7 分类',\n"
    "            chartAssociation: '表征、数据处理操作与任务关联',\n"
)
replace_once(
    'js/i18n.js',
    "            modalMethod: 'LLM方法',\n",
    "            modalMethod: 'LLM方法',\n"
    "            modalOperations: '数据处理操作',\n"
    "            modalOperationEvidence: '操作判定依据',\n"
    "            modalVerification: '来源核对',\n"
    "            modalCitationAudit: '综述引用核对',\n"
    "            modalPrimaryReviewPending: '尚待独立全文复核',\n"
    "            modalMethodology: '方法',\n"
    "            modalResults: '结果',\n"
)
replace_once(
    'js/i18n.js',
    "            filterRepr: '表示',\n",
    "            filterRepr: '表示',\n"
    "            filterOperation: '操作',\n"
)
replace_once(
    'js/i18n.js',
    "            chartHeatmap: 'Representation \\u00D7 Category',\n",
    "            chartHeatmap: 'Representation \\u00D7 Category',\n"
    "            chartAssociation: 'Representation, operation, and task associations',\n"
)
replace_once(
    'js/i18n.js',
    "            modalMethod: 'LLM Method',\n",
    "            modalMethod: 'LLM Method',\n"
    "            modalOperations: 'Data-processing operations',\n"
    "            modalOperationEvidence: 'Coding evidence',\n"
    "            modalVerification: 'Source verification',\n"
    "            modalCitationAudit: 'Review citation audit',\n"
    "            modalPrimaryReviewPending: 'Independent full-text review pending',\n"
    "            modalMethodology: 'Methodology',\n"
    "            modalResults: 'Results',\n"
)
replace_once(
    'js/i18n.js',
    "            filterRepr: 'Repr',\n",
    "            filterRepr: 'Repr',\n"
    "            filterOperation: 'Operation',\n"
)
replace_once(
    'js/i18n.js',
    "        representation: {\n",
    "        operation: {\n"
    "            'generation_parameterization': { zh: '生成与参数化', en: 'Generation & parameterization' },\n"
    "            'editing_execution': { zh: '编辑与执行', en: 'Editing & execution' },\n"
    "            'analysis_compliance_diagnosis': { zh: '分析、合规与诊断', en: 'Analysis, compliance & diagnosis' },\n"
    "            'retrieval_alignment': { zh: '检索与对齐', en: 'Retrieval & alignment' }\n"
    "        },\n"
    "        representation: {\n"
)

# js/app.js
replace_once(
    'js/app.js',
    "            representation: null,\n            year: null,\n",
    "            representation: null,\n            operation: null,\n            year: null,\n"
)
replace_once(
    'js/app.js',
    "            if (f.representation !== null && p.representation !== f.representation) return false;\n            if (f.year !== null && p.year !== f.year) return false;\n",
    "            if (f.representation !== null && p.representation !== f.representation) return false;\n"
    "            if (f.operation !== null && (!p.operations || p.operations.indexOf(f.operation) === -1)) return false;\n"
    "            if (f.year !== null && p.year !== f.year) return false;\n"
)
replace_once(
    'js/app.js',
    "                    p.phase, p.llmMethod, p.representation,\n",
    "                    p.phase, p.llmMethod, p.representation, p.operationEvidence,\n"
)
replace_once(
    'js/app.js',
    "                    p.llmModels || [],\n                    p.keywords || []\n",
    "                    p.llmModels || [],\n                    p.keywords || [],\n                    p.operations || []\n"
)
replace_once(
    'js/app.js',
    "        state.filters.representation = null;\n        state.filters.year = null;\n",
    "        state.filters.representation = null;\n        state.filters.operation = null;\n        state.filters.year = null;\n"
)
replace_once(
    'js/app.js',
    "            { key: 'representation', label: I18n.ui('filterRepr'), value: f.representation },\n            { key: 'year', label: I18n.ui('filterYear'), value: f.year }\n",
    "            { key: 'representation', label: I18n.ui('filterRepr'), value: f.representation },\n"
    "            { key: 'operation', label: I18n.ui('filterOperation'), value: f.operation },\n"
    "            { key: 'year', label: I18n.ui('filterYear'), value: f.year }\n"
)
replace_once(
    'js/app.js',
    "            card.innerHTML =\n",
    "            var operationTags = (paper.operations || []).map(function (op) {\n"
    "                return '<span class=\"tag tag-operation\" data-filter=\"operation\" data-value=\"' + escapeHtml(op) + '\">' + escapeHtml(I18n.field('operation', op)) + '</span>';\n"
    "            }).join('');\n\n"
    "            card.innerHTML =\n"
)
replace_once(
    'js/app.js',
    "                    '<span class=\"tag tag-repr\" data-filter=\"representation\" data-value=\"' + escapeHtml(paper.representation) + '\">' + escapeHtml(I18n.field('representation', paper.representation)) + '</span>' +\n                '</div>' +\n",
    "                    '<span class=\"tag tag-repr\" data-filter=\"representation\" data-value=\"' + escapeHtml(paper.representation) + '\">' + escapeHtml(I18n.field('representation', paper.representation)) + '</span>' +\n"
    "                    operationTags +\n"
    "                '</div>' +\n"
)
replace_once(
    'js/app.js',
    "        content.innerHTML =\n",
    "        var operationTags = (paper.operations || []).map(function (op) {\n"
    "            return '<span class=\"tag tag-operation\">' + escapeHtml(I18n.field('operation', op)) + '</span>';\n"
    "        }).join('');\n"
    "        var verificationLabels = {\n"
    "            full_text: { zh: '已核对可获取全文', en: 'Accessible full text reviewed' },\n"
    "            publisher_full_or_detailed_page: { zh: '已核对出版社全文或详细文章页面', en: 'Publisher full text or detailed article page reviewed' },\n"
    "            primary_or_indexed_abstract: { zh: '已核对原始或索引摘要', en: 'Primary or indexed abstract reviewed' },\n"
    "            detailed_corpus_record_only: { zh: '已核对详细语料记录，原始全文待补', en: 'Detailed corpus record reviewed; primary text pending' }\n"
    "        };\n"
    "        var citationLabels = {\n"
    "            consistent_with_primary_source: { zh: '综述引用与可获取原始来源一致', en: 'Review use is consistent with an accessible primary source' },\n"
    "            consistent_with_primary_abstract: { zh: '综述引用与原始摘要一致', en: 'Review use is consistent with the primary abstract' },\n"
    "            consistent_with_detailed_corpus_record_primary_check_pending: { zh: '综述引用与详细语料记录一致，原始全文待核', en: 'Review use is consistent with the detailed corpus record; primary-text check pending' },\n"
    "            not_cited_in_review: { zh: '当前综述正文未引用', en: 'Not cited in the current review text' }\n"
    "        };\n"
    "        function auditText(map, key) {\n"
    "            var item = map[key];\n"
    "            if (!item) return key || '';\n"
    "            return I18n.isZh() ? item.zh : item.en;\n"
    "        }\n"
    "        var auditHtml = paper.operationVerification ?\n"
    "            '<div class=\"audit-box\">' +\n"
    "            '<p><strong>' + escapeHtml(I18n.ui('modalVerification')) + ':</strong> ' + escapeHtml(auditText(verificationLabels, paper.operationVerification)) + '</p>' +\n"
    "            '<p><strong>' + escapeHtml(I18n.ui('modalCitationAudit')) + ':</strong> ' + escapeHtml(auditText(citationLabels, paper.citationAuditStatus)) +\n"
    "            (paper.citationContextCount !== undefined ? ' (n=' + escapeHtml(String(paper.citationContextCount)) + ')' : '') + '</p>' +\n"
    "            (paper.primaryTextReviewRequired ? '<p class=\"audit-warning\">' + escapeHtml(I18n.ui('modalPrimaryReviewPending')) + '</p>' : '') +\n"
    "            '</div>' : '';\n\n"
    "        content.innerHTML =\n"
)
replace_once(
    'js/app.js',
    "            '<p><strong>' + escapeHtml(I18n.ui('modalMethod')) + ':</strong> ' + escapeHtml(I18n.field('llmMethod', paper.llmMethod)) + '</p>' +\n            contributionOrAbstract +\n",
    "            '<p><strong>' + escapeHtml(I18n.ui('modalMethod')) + ':</strong> ' + escapeHtml(I18n.field('llmMethod', paper.llmMethod)) + '</p>' +\n"
    "            (operationTags ? '<p><strong>' + escapeHtml(I18n.ui('modalOperations')) + ':</strong></p><div class=\"modal-operations\">' + operationTags + '</div>' : '') +\n"
    "            (paper.operationEvidence ? '<p><strong>' + escapeHtml(I18n.ui('modalOperationEvidence')) + ':</strong> ' + escapeHtml(paper.operationEvidence) + '</p>' : '') +\n"
    "            contributionOrAbstract +\n"
    "            (paper.methodology ? '<p><strong>' + escapeHtml(I18n.ui('modalMethodology')) + ':</strong> ' + escapeHtml(paper.methodology) + '</p>' : '') +\n"
    "            (paper.results ? '<p><strong>' + escapeHtml(I18n.ui('modalResults')) + ':</strong> ' + escapeHtml(paper.results) + '</p>' : '') +\n"
)
replace_once(
    'js/app.js',
    "            (paper.markdownFile ? '<p><strong>' + escapeHtml(I18n.ui('modalMarkdown')) + ':</strong> ' + escapeHtml(paper.markdownFile) + '</p>' : '');\n",
    "            (paper.markdownFile ? '<p><strong>' + escapeHtml(I18n.ui('modalMarkdown')) + ':</strong> ' + escapeHtml(paper.markdownFile) + '</p>' : '') +\n"
    "            auditHtml;\n"
)
replace_once(
    'js/app.js',
    "                return Promise.all(fetches);\n",
    "                return Promise.all([\n"
    "                    Promise.all(fetches),\n"
    "                    fetch('data/operation_coding.json').then(function (res) {\n"
    "                        if (!res.ok) throw new Error('Failed to load operation_coding.json');\n"
    "                        return res.json();\n"
    "                    }),\n"
    "                    fetch('data/operation_evidence.json').then(function (res) {\n"
    "                        if (!res.ok) throw new Error('Failed to load operation_evidence.json');\n"
    "                        return res.json();\n"
    "                    })\n"
    "                ]);\n"
)
replace_once(
    'js/app.js',
    "            .then(function (papers) {\n                state.allPapers = papers;\n",
    "            .then(function (loaded) {\n"
    "                var papers = loaded[0];\n"
    "                var coding = loaded[1];\n"
    "                var evidence = loaded[2];\n"
    "                var operationLegend = coding.legend.operations;\n"
    "                var verificationLegend = coding.legend.verification;\n"
    "                var citationLegend = coding.legend.citationAudit;\n"
    "                papers.forEach(function (paper) {\n"
    "                    var item = coding.papers[paper.id];\n"
    "                    if (!item) return;\n"
    "                    paper.operations = String(item.o || '').split('').filter(Boolean).map(function (code) {\n"
    "                        return operationLegend[code];\n"
    "                    }).filter(Boolean);\n"
    "                    paper.operationEvidence = evidence[paper.id] || '';\n"
    "                    paper.operationVerification = verificationLegend[item.v] || item.v;\n"
    "                    paper.citationAuditStatus = citationLegend[item.c] || item.c;\n"
    "                    paper.citationContextCount = item.n;\n"
    "                    paper.primaryTextReviewRequired = item.v === 'D';\n"
    "                });\n"
    "                state.operationSummary = coding.summary;\n"
    "                state.allPapers = papers;\n"
)
