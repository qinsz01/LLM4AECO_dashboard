(function () {
    'use strict';

    var lang = localStorage.getItem('llm4aeco-lang') || 'zh';
    var OPERATION_ORDER = [
        'generation_parameterization',
        'editing_execution',
        'analysis_compliance_diagnosis',
        'retrieval_alignment'
    ];

    var UI = {
        zh: {
            htmlLang: 'zh-CN',
            subtitle: '系统性文献综述 · {count}篇论文 · {assignments}个操作标签 · 2023–2026',
            searchPlaceholder: '搜索标题、任务、表征、操作或模型…',
            resetBtn: '重置筛选',
            langToggle: 'EN',
            statPapers: '论文',
            statCategories: '任务分类',
            statRepresentations: '表征类型',
            statAssignments: '操作标签',
            statMultiOperation: '多操作论文',
            statShowing: '当前显示',
            operationOverview: '数据处理操作',
            operationOverviewNote: '每篇论文可具有多个操作标签。卡片中的数量表示当前筛选范围内涉及该操作的论文数。',
            fullTextCoverage: '{reviewed}/{total} 篇全文已复核',
            clickToFilter: '点击筛选',
            corpusLandscape: '语料概览',
            corpusLandscapeNote: '查看研究年份、生命周期阶段、LLM方法以及表征与任务分布。图表均可点击筛选。',
            operationAnalysis: '表征、操作与任务',
            operationAnalysisNote: '热力图使用条件占比进行着色，并在单元格中显示论文数，以减少不同类别规模带来的视觉偏差。',
            chartOperation: '操作分布',
            chartOperationDepth: '每篇论文包含的操作数',
            chartReprOperation: '表征 × 数据处理操作',
            chartReprOperationNote: '颜色表示同一表征类型中涉及该操作的论文比例；数字为论文数。',
            chartOperationTask: '数据处理操作 × 任务分类',
            chartOperationTaskNote: '颜色表示同一任务分类中涉及该操作的论文比例；数字为论文数。',
            chartPhase: '阶段分布',
            chartMethod: 'LLM方法分布',
            chartTrend: '发表趋势',
            chartHeatmap: '表征 × 任务分类',
            chartStacked: '阶段 × 任务分类',
            chartSunburst: '任务分类 × LLM方法',
            chartCount: '论文数',
            chartShare: '条件占比',
            chartAssignmentsNote: '多标签统计，合计可超过论文总数。',
            chartNoOperation: '无操作标签',
            operationCountUnit: '类操作',
            operationCountOne: '1 类操作',
            papersSection: '论文',
            papersSectionNote: '点击论文卡片查看摘要、方法、结果和逐篇操作判定依据。',
            sortLabel: '排序',
            sortNewest: '最新优先',
            sortOldest: '最早优先',
            sortTitle: '标题 A–Z',
            modalCitation: '引用',
            modalJournal: '期刊/来源',
            modalYear: '年份',
            modalCategory: '任务分类',
            modalTask: '具体任务',
            modalPhase: '生命周期阶段',
            modalInputData: '输入数据',
            modalRepr: '表征形式',
            modalMethod: 'LLM方法',
            modalOperations: '数据处理操作',
            modalOperationEvidence: '操作判定依据',
            modalCodingBasis: '复核依据',
            modalStudySummary: '研究内容',
            modalContribution: '主要贡献',
            modalAbstract: '摘要',
            modalMethodology: '方法',
            modalResults: '结果',
            modalDOI: '原文链接',
            modalModels: 'LLM模型',
            modalKeywords: '关键词',
            modalOpenRecord: '打开完整记录',
            modalOpenSource: '查看原文',
            modalNoOperations: '该条目未评价可归入四类操作的具体AECO–LLM工作流。',
            evidenceLabel: '判定依据',
            noResults: '没有匹配当前筛选条件的论文。',
            filterCategory: '任务分类',
            filterPhase: '阶段',
            filterMethod: '方法',
            filterRepr: '表征',
            filterOperation: '操作',
            filterYear: '年份',
            filterSearch: '搜索',
            prev: '上一页',
            next: '下一页',
            fullTextReviewed: '全文复核',
            publisherPageReviewed: '出版社页面复核',
            abstractReviewed: '摘要复核',
            paperBack: '返回仪表板',
            paperRecord: '结构化文献记录',
            paperFullText: '论文全文',
            paperLoading: '正在加载论文内容…',
            paperNoFullText: '当前部署未提供可直接显示的全文，但上方结构化记录仍可查看。',
            paperLoadFailed: '论文全文加载失败，上方结构化记录仍可查看。',
            errorTitle: '无法加载论文',
            errorMessage: '未找到论文记录或读取失败。'
        },
        en: {
            htmlLang: 'en',
            subtitle: 'Systematic Literature Review · {count} papers · {assignments} operation labels · 2023–2026',
            searchPlaceholder: 'Search title, task, representation, operation, or model…',
            resetBtn: 'Reset filters',
            langToggle: '中文',
            statPapers: 'Papers',
            statCategories: 'Task categories',
            statRepresentations: 'Representations',
            statAssignments: 'Operation labels',
            statMultiOperation: 'Multi-operation papers',
            statShowing: 'Showing',
            operationOverview: 'Data-processing operations',
            operationOverviewNote: 'Papers may have multiple operation labels. Card counts show papers containing each operation within the current filter context.',
            fullTextCoverage: '{reviewed}/{total} full texts reviewed',
            clickToFilter: 'Click to filter',
            corpusLandscape: 'Corpus landscape',
            corpusLandscapeNote: 'Explore publication year, lifecycle phase, LLM method, and representation–task distributions. Charts are interactive filters.',
            operationAnalysis: 'Representation, operation, and task',
            operationAnalysisNote: 'Heatmaps use conditional prevalence for color and display paper counts in each cell, reducing visual bias from unequal category sizes.',
            chartOperation: 'Operation distribution',
            chartOperationDepth: 'Operations per paper',
            chartReprOperation: 'Representation × data-processing operation',
            chartReprOperationNote: 'Color shows the share of papers within each representation family that contain the operation; labels show paper counts.',
            chartOperationTask: 'Data-processing operation × task category',
            chartOperationTaskNote: 'Color shows the share of papers within each task category that contain the operation; labels show paper counts.',
            chartPhase: 'Lifecycle phase distribution',
            chartMethod: 'LLM method distribution',
            chartTrend: 'Publication trend',
            chartHeatmap: 'Representation × task category',
            chartStacked: 'Lifecycle phase × task category',
            chartSunburst: 'Task category × LLM method',
            chartCount: 'Paper count',
            chartShare: 'Conditional prevalence',
            chartAssignmentsNote: 'Multi-label counts; totals may exceed the number of papers.',
            chartNoOperation: 'No operation label',
            operationCountUnit: 'operations',
            operationCountOne: '1 operation',
            papersSection: 'Papers',
            papersSectionNote: 'Open a paper card to inspect the abstract, methodology, results, and paper-level operation-coding evidence.',
            sortLabel: 'Sort',
            sortNewest: 'Newest first',
            sortOldest: 'Oldest first',
            sortTitle: 'Title A–Z',
            modalCitation: 'Citation',
            modalJournal: 'Journal / source',
            modalYear: 'Year',
            modalCategory: 'Task category',
            modalTask: 'Specific task',
            modalPhase: 'Lifecycle phase',
            modalInputData: 'Input data',
            modalRepr: 'Representation',
            modalMethod: 'LLM method',
            modalOperations: 'Data-processing operations',
            modalOperationEvidence: 'Operation-coding evidence',
            modalCodingBasis: 'Review basis',
            modalStudySummary: 'Study record',
            modalContribution: 'Contribution',
            modalAbstract: 'Abstract',
            modalMethodology: 'Methodology',
            modalResults: 'Results',
            modalDOI: 'Source link',
            modalModels: 'LLM models',
            modalKeywords: 'Keywords',
            modalOpenRecord: 'Open full record',
            modalOpenSource: 'View source',
            modalNoOperations: 'This record does not evaluate a specific AECO–LLM workflow that falls within the four operation classes.',
            evidenceLabel: 'Coding evidence',
            noResults: 'No papers match the current filters.',
            filterCategory: 'Task category',
            filterPhase: 'Phase',
            filterMethod: 'Method',
            filterRepr: 'Representation',
            filterOperation: 'Operation',
            filterYear: 'Year',
            filterSearch: 'Search',
            prev: 'Prev',
            next: 'Next',
            fullTextReviewed: 'Full text reviewed',
            publisherPageReviewed: 'Publisher page reviewed',
            abstractReviewed: 'Abstract reviewed',
            paperBack: 'Back to dashboard',
            paperRecord: 'Structured paper record',
            paperFullText: 'Paper full text',
            paperLoading: 'Loading paper content…',
            paperNoFullText: 'Full text is not available in this deployment, but the structured record above remains available.',
            paperLoadFailed: 'The paper full text could not be loaded; the structured record above remains available.',
            errorTitle: 'Unable to load paper',
            errorMessage: 'The paper record was not found or could not be read.'
        }
    };

    var FIELDS = {
        category: {
            'BIM检索与管理': { zh: 'BIM检索与管理', en: 'BIM Retrieval & Mgmt' },
            '其他': { zh: '其他', en: 'Others' },
            '施工管理与安全': { zh: '施工管理与安全', en: 'Construction & Safety' },
            '环境与碳评估': { zh: '环境与碳评估', en: 'Environment & Carbon' },
            '结构设计与分析': { zh: '结构设计与分析', en: 'Structural Design & Analysis' },
            '建筑能耗建模': { zh: '建筑能耗建模', en: 'Building Energy Modelling' },
            '规范与合规检查': { zh: '规范与合规检查', en: 'Code Compliance' },
            '设计优化与生成': { zh: '设计优化与生成', en: 'Design Generation & Optimization' },
            '管理': { zh: '管理', en: 'Management' }
        },
        phase: {
            '全生命周期': { zh: '全生命周期', en: 'Full Lifecycle' },
            '施工': { zh: '施工', en: 'Construction' },
            '翻新与拆除': { zh: '翻新与拆除', en: 'Renovation & Demolition' },
            '规划与设计': { zh: '规划与设计', en: 'Planning & Design' },
            '运维': { zh: '运维', en: 'O&M' }
        },
        llmMethod: {
            'Agent': { zh: 'Agent', en: 'Agent' },
            'Prompt': { zh: 'Prompt', en: 'Prompt engineering' },
            'RAG': { zh: 'RAG', en: 'RAG' },
            '其他': { zh: '其他', en: 'Others' },
            '微调': { zh: '微调', en: 'Fine-tuning' }
        },
        representation: {
            '学习/工程化编码': { zh: '学习/工程化编码', en: 'Learned/engineered codes' },
            '图结构': { zh: '图结构', en: 'Graph / ontology' },
            '多模态': { zh: '多模态', en: 'Multimodal' },
            '文本': { zh: '文本', en: 'Text' },
            '结构化': { zh: '结构化', en: 'Structured' }
        },
        operationCodingBasis: {
            'full_text': { zh: '全文复核', en: 'Full text reviewed' },
            'publisher_page': { zh: '出版社页面复核', en: 'Publisher page reviewed' },
            'abstract': { zh: '摘要复核', en: 'Abstract reviewed' }
        }
    };

    var OPERATIONS = {
        generation_parameterization: {
            short: 'G',
            zh: '生成与参数化',
            en: 'Generation & parameterization',
            descriptionZh: '生成新的模型、设计成果、进度计划、报告、代码、建议或参数集。',
            descriptionEn: 'Creates a new model, design artifact, schedule, report, code fragment, recommendation, or parameter set.'
        },
        editing_execution: {
            short: 'E',
            zh: '编辑与执行',
            en: 'Editing & execution',
            descriptionZh: '修改已有状态，或调用数据库、API、建模软件、仿真器、控制器等可执行接口。',
            descriptionEn: 'Changes existing state or invokes a database, API, authoring tool, simulator, controller, or other executable interface.'
        },
        analysis_compliance_diagnosis: {
            short: 'A',
            zh: '分析、合规与诊断',
            en: 'Analysis, compliance & diagnosis',
            descriptionZh: '基于数据、规则、模型或观测进行推断、分类、校核、计算、诊断或工程解释。',
            descriptionEn: 'Derives, classifies, checks, calculates, diagnoses, or interprets engineering findings from data, rules, models, or observations.'
        },
        retrieval_alignment: {
            short: 'R',
            zh: '检索与对齐',
            en: 'Retrieval & alignment',
            descriptionZh: '将语言或观测映射到文档、记录、标识符、模式、图实体、软件函数等稳定目标。',
            descriptionEn: 'Maps language or observations to documents, records, identifiers, schemas, graph entities, software functions, or other stable targets.'
        }
    };

    function formatTemplate(text, values) {
        if (!values) return text;
        Object.keys(values).forEach(function (key) {
            text = text.replace(new RegExp('\\{' + key + '\\}', 'g'), String(values[key]));
        });
        return text;
    }

    window.I18n = {
        lang: function () { return lang; },
        isZh: function () { return lang === 'zh'; },
        isEn: function () { return lang === 'en'; },
        toggle: function () {
            lang = lang === 'zh' ? 'en' : 'zh';
            localStorage.setItem('llm4aeco-lang', lang);
            this.applyToDOM();
            window.dispatchEvent(new CustomEvent('langChanged'));
        },
        ui: function (key, values) {
            var text = (UI[lang] && UI[lang][key]) || key;
            return formatTemplate(text, values);
        },
        field: function (fieldKey, value) {
            if (!value) return value || '';
            if (fieldKey === 'operation') return this.operation(value).label;
            var map = FIELDS[fieldKey];
            if (map && map[value]) return map[value][lang];
            return value;
        },
        operation: function (key) {
            var item = OPERATIONS[key] || { short: '?', zh: key, en: key, descriptionZh: '', descriptionEn: '' };
            return {
                key: key,
                short: item.short,
                label: lang === 'zh' ? item.zh : item.en,
                description: lang === 'zh' ? item.descriptionZh : item.descriptionEn
            };
        },
        operationOrder: function () { return OPERATION_ORDER.slice(); },
        applyToDOM: function () {
            document.documentElement.lang = UI[lang].htmlLang;
            document.querySelectorAll('[data-i18n]').forEach(function (el) {
                var key = el.getAttribute('data-i18n');
                el.textContent = I18n.ui(key);
            });
            document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
                el.placeholder = I18n.ui(el.getAttribute('data-i18n-placeholder'));
            });
            var toggleBtn = document.getElementById('lang-toggle');
            if (toggleBtn) toggleBtn.textContent = I18n.ui('langToggle');
        }
    };
})();
