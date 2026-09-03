(function () {
    'use strict';

    var lang = localStorage.getItem('llm4aeco-lang') || 'zh';

    var UI = {
        zh: {
            htmlLang: 'zh-CN',
            subtitle: '系统性文献综述 · {count} 篇论文',
            searchPlaceholder: '搜索标题、任务、方法或证据…',
            resetBtn: '清除筛选',
            langToggle: 'EN',
            heroEyebrow: '表征、数据处理与工程任务',
            heroTitle: '从论文计数走向可核查的任务证据',
            heroDescription: '浏览 172 篇 AECO × LLM 研究，比较模型侧表征、四类数据处理操作、具体工程任务及其逐篇判定依据。',
            reviewedDataset: '逐篇复核数据集',
            reviewedDatasetNote: '操作标签允许多选，论文卡片保留判定依据',
            statPapers: '论文',
            statAssignments: '操作标签',
            statReviewed: '全文复核',
            statRepresentations: '表征类别',
            statCategories: '任务类别',
            statShowing: '当前显示',
            operationKicker: '第四章分析维度',
            operationOverview: '四类数据处理操作',
            operationOverviewNote: '一篇论文可对应多类操作。点击卡片可筛选，计数会随其他筛选条件更新。',
            multiLabelNote: '多标签计数可能超过论文总数',
            analyticsKicker: '交叉统计',
            analyticsTitle: '表征、操作与任务之间的对应关系',
            tabOperations: '操作分析',
            tabCorpus: '语料概览',
            chartOperationDistribution: '操作分布',
            chartCombinations: '常见操作组合',
            chartRepresentationOperation: '表征 × 数据处理操作',
            chartOperationTask: '数据处理操作 × 工程任务',
            chartPhase: '阶段分布',
            chartMethod: 'LLM 方法分布',
            chartTrend: '发表趋势',
            chartRepresentationTask: '表征 × 工程任务',
            chartClickHint: '点击图形筛选论文',
            chartCombinationHint: '展示多标签工作流结构',
            heatmapHint: '颜色表示论文数量，悬停查看组内占比',
            paperExplorerKicker: '逐篇证据',
            papersSection: '论文浏览',
            sortLabel: '排序',
            sortNewest: '年份：新到旧',
            sortOldest: '年份：旧到新',
            sortTitle: '标题：A–Z',
            sortOperations: '操作标签：多到少',
            taskLabel: '任务',
            evidenceLabel: '操作判定依据',
            viewDetails: '查看完整记录',
            noResults: '没有符合当前筛选条件的论文。',
            prev: '上一页',
            next: '下一页',
            filterSearch: '搜索',
            filterCategory: '任务类别',
            filterPhase: '阶段',
            filterMethod: '方法',
            filterRepresentation: '表征',
            filterOperation: '操作',
            filterYear: '年份',
            filterBasis: '复核依据',
            modalPaperRecord: '论文证据记录',
            modalYear: '年份',
            modalJournal: '期刊或来源',
            modalCategory: '任务类别',
            modalTask: '具体任务',
            modalPhase: '生命周期阶段',
            modalInputData: '输入数据',
            modalRepresentation: '模型侧表征',
            modalMethod: 'LLM 方法',
            modalModels: '模型',
            modalOperations: '数据处理操作',
            modalCodingBasis: '复核依据',
            modalOperationEvidence: '为什么这样分类',
            modalContribution: '主要贡献',
            modalAbstract: '摘要',
            modalMethodology: '方法',
            modalResults: '结果',
            openDOI: '打开原文或 DOI',
            openDetail: '打开独立详情页',
            paperDetailSubtitle: '逐篇证据记录',
            backToDashboard: '返回仪表板',
            loadingPaper: '正在载入论文记录…',
            paperNotFound: '未找到该论文记录。',
            evidenceAndOperations: '数据处理操作与判定依据',
            bibliographicInfo: '论文信息',
            keywords: '关键词',
            operationShare: '占当前论文',
            papersUnit: '篇',
            assignmentsUnit: '个标签',
            countLabel: '论文数',
            withinRepresentation: '该表征内部占比',
            withinOperation: '该操作内部占比',
            combinationNone: '未编码具体操作'
        },
        en: {
            htmlLang: 'en',
            subtitle: 'Systematic literature review · {count} papers',
            searchPlaceholder: 'Search titles, tasks, methods, or evidence…',
            resetBtn: 'Clear filters',
            langToggle: '中文',
            heroEyebrow: 'Representations, data operations, and engineering tasks',
            heroTitle: 'From paper counts to inspectable task evidence',
            heroDescription: 'Explore 172 AECO × LLM studies through model-facing representations, four data-processing operations, engineering tasks, and paper-level coding evidence.',
            reviewedDataset: 'Paper-level reviewed dataset',
            reviewedDatasetNote: 'Operations are multi-label and every record retains its coding rationale',
            statPapers: 'Papers',
            statAssignments: 'Operation labels',
            statReviewed: 'Full-text reviewed',
            statRepresentations: 'Representations',
            statCategories: 'Task categories',
            statShowing: 'Currently shown',
            operationKicker: 'Chapter 4 analytical layer',
            operationOverview: 'Four data-processing operations',
            operationOverviewNote: 'A paper may contain several operations. Click a card to filter; counts respond to the other active filters.',
            multiLabelNote: 'Multi-label counts may exceed the paper total',
            analyticsKicker: 'Cross-tabulation',
            analyticsTitle: 'How representations, operations, and tasks align',
            tabOperations: 'Operation analysis',
            tabCorpus: 'Corpus overview',
            chartOperationDistribution: 'Operation distribution',
            chartCombinations: 'Common operation combinations',
            chartRepresentationOperation: 'Representation × data-processing operation',
            chartOperationTask: 'Data-processing operation × engineering task',
            chartPhase: 'Lifecycle phase',
            chartMethod: 'LLM method',
            chartTrend: 'Publication trend',
            chartRepresentationTask: 'Representation × engineering task',
            chartClickHint: 'Click a mark to filter papers',
            chartCombinationHint: 'Shows multi-label workflow structures',
            heatmapHint: 'Colour shows paper count; hover for within-group prevalence',
            paperExplorerKicker: 'Paper-level evidence',
            papersSection: 'Paper explorer',
            sortLabel: 'Sort',
            sortNewest: 'Year: newest first',
            sortOldest: 'Year: oldest first',
            sortTitle: 'Title: A–Z',
            sortOperations: 'Operation labels: most first',
            taskLabel: 'Task',
            evidenceLabel: 'Operation coding evidence',
            viewDetails: 'View full record',
            noResults: 'No papers match the current filters.',
            prev: 'Previous',
            next: 'Next',
            filterSearch: 'Search',
            filterCategory: 'Task category',
            filterPhase: 'Phase',
            filterMethod: 'Method',
            filterRepresentation: 'Representation',
            filterOperation: 'Operation',
            filterYear: 'Year',
            filterBasis: 'Review basis',
            modalPaperRecord: 'Paper evidence record',
            modalYear: 'Year',
            modalJournal: 'Journal or source',
            modalCategory: 'Task category',
            modalTask: 'Specific task',
            modalPhase: 'Lifecycle phase',
            modalInputData: 'Input data',
            modalRepresentation: 'Model-facing representation',
            modalMethod: 'LLM method',
            modalModels: 'Models',
            modalOperations: 'Data-processing operations',
            modalCodingBasis: 'Review basis',
            modalOperationEvidence: 'Why these labels were assigned',
            modalContribution: 'Main contribution',
            modalAbstract: 'Abstract',
            modalMethodology: 'Methodology',
            modalResults: 'Results',
            openDOI: 'Open source or DOI',
            openDetail: 'Open dedicated detail page',
            paperDetailSubtitle: 'Paper-level evidence record',
            backToDashboard: 'Back to dashboard',
            loadingPaper: 'Loading paper record…',
            paperNotFound: 'The requested paper record could not be found.',
            evidenceAndOperations: 'Data-processing operations and coding evidence',
            bibliographicInfo: 'Paper information',
            keywords: 'Keywords',
            operationShare: 'of current papers',
            papersUnit: 'papers',
            assignmentsUnit: 'labels',
            countLabel: 'Paper count',
            withinRepresentation: 'Within-representation prevalence',
            withinOperation: 'Within-operation prevalence',
            combinationNone: 'No specific operation coded'
        }
    };

    var FIELDS = {
        category: {
            'BIM检索与管理': { zh: 'BIM检索与管理', en: 'BIM retrieval & management' },
            '其他': { zh: '其他', en: 'Other' },
            '施工管理与安全': { zh: '施工管理与安全', en: 'Construction management & safety' },
            '环境与碳评估': { zh: '环境与碳评估', en: 'Environmental & carbon assessment' },
            '结构设计与分析': { zh: '结构设计与分析', en: 'Structural analysis & design' },
            '建筑能耗建模': { zh: '建筑能耗建模', en: 'Building energy modelling' },
            '规范与合规检查': { zh: '规范与合规检查', en: 'Code & compliance checking' },
            '设计优化与生成': { zh: '设计优化与生成', en: 'Design generation & optimization' },
            '管理': { zh: '管理', en: 'Management' }
        },
        phase: {
            '全生命周期': { zh: '全生命周期', en: 'Full lifecycle' },
            '施工': { zh: '施工', en: 'Construction' },
            '翻新与拆除': { zh: '翻新与拆除', en: 'Renovation & demolition' },
            '规划与设计': { zh: '规划与设计', en: 'Planning & design' },
            '运维': { zh: '运维', en: 'Operations & maintenance' }
        },
        llmMethod: {
            'Agent': { zh: 'Agent', en: 'Agent' },
            'Prompt': { zh: 'Prompt', en: 'Prompt engineering' },
            'RAG': { zh: 'RAG', en: 'RAG' },
            '其他': { zh: '其他', en: 'Other' },
            '微调': { zh: '微调', en: 'Fine-tuning' }
        },
        representation: {
            '学习/工程化编码': { zh: '学习/工程化编码', en: 'Learned / engineered codes' },
            '图结构': { zh: '图结构', en: 'Graph / ontology' },
            '多模态': { zh: '多模态', en: 'Multimodal' },
            '文本': { zh: '文本', en: 'Text' },
            '结构化': { zh: '结构化', en: 'Structured' }
        },
        operation: {
            generation_parameterization: { zh: '生成与参数化', en: 'Generation & parameterization' },
            editing_execution: { zh: '编辑与执行', en: 'Editing & execution' },
            analysis_compliance_diagnosis: { zh: '分析、合规与诊断', en: 'Analysis, compliance & diagnosis' },
            retrieval_alignment: { zh: '检索与对齐', en: 'Retrieval & alignment' }
        },
        codingBasis: {
            full_text: { zh: '全文复核', en: 'Full-text reviewed' },
            publisher_page: { zh: '出版社页面复核', en: 'Publisher page reviewed' },
            abstract: { zh: '摘要复核', en: 'Abstract reviewed' },
            primary_abstract: { zh: '原始摘要复核', en: 'Primary abstract reviewed' }
        }
    };

    var OPERATION_DEFINITIONS = {
        generation_parameterization: {
            zh: '生成模型、设计成果、代码、报告、建议或参数集。',
            en: 'Creates models, design artefacts, code, reports, recommendations, or parameter sets.'
        },
        editing_execution: {
            zh: '修改已有状态，或调用数据库、API、建模软件、仿真器等可执行接口。',
            en: 'Changes existing state or invokes databases, APIs, authoring tools, simulators, or other executable interfaces.'
        },
        analysis_compliance_diagnosis: {
            zh: '基于数据、规则、模型或观测进行分析、校核、分类、诊断或工程解释。',
            en: 'Analyses, checks, classifies, diagnoses, or interprets engineering evidence from data, rules, models, or observations.'
        },
        retrieval_alignment: {
            zh: '将语言或观测映射到文档、记录、标识符、模式、图实体或软件函数。',
            en: 'Maps language or observations to documents, records, identifiers, schemas, graph entities, or software functions.'
        }
    };

    function text(key) {
        return (UI[lang] && UI[lang][key]) || key;
    }

    function field(fieldKey, value) {
        if (value === undefined || value === null || value === '') return value || '';
        var map = FIELDS[fieldKey];
        return map && map[value] ? map[value][lang] : String(value);
    }

    function applyToDOM() {
        document.documentElement.lang = UI[lang].htmlLang;
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            var value = text(key);
            if (key === 'subtitle') {
                var count = window.appState && window.appState.allPapers ? window.appState.allPapers.length : '–';
                value = value.replace('{count}', count);
            }
            el.textContent = value;
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
            el.placeholder = text(el.getAttribute('data-i18n-placeholder'));
        });
        var toggle = document.getElementById('lang-toggle');
        if (toggle) toggle.textContent = text('langToggle');
        document.title = document.body.classList.contains('paper-page') ? 'Paper | LLM4AECO' : 'LLM4AECO Evidence Dashboard';
    }

    window.I18n = {
        lang: function () { return lang; },
        isZh: function () { return lang === 'zh'; },
        isEn: function () { return lang === 'en'; },
        ui: text,
        field: field,
        operationDefinition: function (code) {
            var item = OPERATION_DEFINITIONS[code];
            return item ? item[lang] : code;
        },
        toggle: function () {
            lang = lang === 'zh' ? 'en' : 'zh';
            localStorage.setItem('llm4aeco-lang', lang);
            applyToDOM();
            window.dispatchEvent(new CustomEvent('langChanged'));
        },
        applyToDOM: applyToDOM,
        operationOrder: [
            'generation_parameterization',
            'editing_execution',
            'analysis_compliance_diagnosis',
            'retrieval_alignment'
        ]
    };

    document.addEventListener('DOMContentLoaded', applyToDOM);
})();
