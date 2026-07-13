(function () {
    'use strict';

    var lang = 'zh';

    var UI = {
        zh: {
            htmlLang: 'zh-CN',
            subtitle: '系统性文献综述 \u00B7 135篇论文 \u00B7 2023\u20132026',
            searchPlaceholder: '搜索论文...',
            resetBtn: '\u2715 重置',
            langToggle: 'EN',
            statPapers: '论文',
            statCategories: '分类',
            statPhases: '阶段',
            statTimeSpan: '时间跨度',
            statShowing: '显示中',
            vizDashboard: '可视化仪表板',
            papersSection: '论文',
            chartPhase: '阶段分布',
            chartMethod: 'LLM方法分布',
            chartTrend: '发表趋势',
            chartHeatmap: '表示形式 \u00D7 分类',
            chartStacked: '阶段 \u00D7 任务分类',
            chartSunburst: 'LLM方法旭日图',
            modalCitation: '引用',
            modalYear: '年份',
            modalCategory: '分类',
            modalTask: '任务',
            modalPhase: '阶段',
            modalInputData: '输入数据',
            modalRepr: '表示形式',
            modalMethod: 'LLM方法',
            modalContribution: '贡献',
            modalAbstract: '摘要',
            modalDOI: 'DOI',
            modalModels: 'LLM模型',
            modalKeywords: '关键词',
            modalPDF: 'PDF',
            modalMarkdown: 'Markdown',
            noResults: '没有匹配当前筛选条件的论文。',
            filterCategory: '分类',
            filterPhase: '阶段',
            filterMethod: '方法',
            filterRepr: '表示',
            filterYear: '年份',
            filterSearch: '搜索',
            prev: '上一页',
            next: '下一页'
        },
        en: {
            htmlLang: 'en',
            subtitle: 'Systematic Literature Review \u00B7 135 Papers \u00B7 2023\u20132026',
            searchPlaceholder: 'Search papers...',
            resetBtn: '\u2715 Reset',
            langToggle: '\u4E2D\u6587',
            statPapers: 'Papers',
            statCategories: 'Categories',
            statPhases: 'Phases',
            statTimeSpan: 'Time Span',
            statShowing: 'Showing',
            vizDashboard: 'Visualization Dashboard',
            papersSection: 'Papers',
            chartPhase: 'Phase Distribution',
            chartMethod: 'LLM Method Distribution',
            chartTrend: 'Publication Trend',
            chartHeatmap: 'Representation \u00D7 Category',
            chartStacked: 'Phase \u00D7 Task Category',
            chartSunburst: 'LLM Method Sunburst',
            modalCitation: 'Citation',
            modalYear: 'Year',
            modalCategory: 'Category',
            modalTask: 'Task',
            modalPhase: 'Phase',
            modalInputData: 'Input Data',
            modalRepr: 'Representation',
            modalMethod: 'LLM Method',
            modalContribution: 'Contribution',
            modalAbstract: 'Abstract',
            modalDOI: 'DOI',
            modalModels: 'LLM Models',
            modalKeywords: 'Keywords',
            modalPDF: 'PDF',
            modalMarkdown: 'Markdown',
            noResults: 'No papers match the current filters.',
            filterCategory: 'Category',
            filterPhase: 'Phase',
            filterMethod: 'Method',
            filterRepr: 'Repr',
            filterYear: 'Year',
            filterSearch: 'Search',
            prev: 'Prev',
            next: 'Next'
        }
    };

    var FIELDS = {
        category: {
            'BIM\u68C0\u7D22\u4E0E\u7BA1\u7406': { zh: 'BIM\u68C0\u7D22\u4E0E\u7BA1\u7406', en: 'BIM Retrieval & Mgmt' },
            '\u5176\u4ED6': { zh: '\u5176\u4ED6', en: 'Others' },
            '\u65BD\u5DE5\u7BA1\u7406\u4E0E\u5B89\u5168': { zh: '\u65BD\u5DE5\u7BA1\u7406\u4E0E\u5B89\u5168', en: 'Construction & Safety' },
            '\u73AF\u5883\u4E0E\u78B3\u8BC4\u4F30': { zh: '\u73AF\u5883\u4E0E\u78B3\u8BC4\u4F30', en: 'Environment & Carbon' },
            '\u7ED3\u6784\u8BBE\u8BA1\u4E0E\u5206\u6790': { zh: '\u7ED3\u6784\u8BBE\u8BA1\u4E0E\u5206\u6790', en: 'Structural Design' },
            '\u5EFA\u7B51\u80FD\u8017\u5EFA\u6A21': { zh: '\u5EFA\u7B51\u80FD\u8017\u5EFA\u6A21', en: 'Building Energy Modelling' },
            '\u89C4\u8303\u4E0E\u5408\u89C4\u68C0\u67E5': { zh: '\u89C4\u8303\u4E0E\u5408\u89C4\u68C0\u67E5', en: 'Code Compliance' },
            '\u8BBE\u8BA1\u4F18\u5316\u4E0E\u751F\u6210': { zh: '\u8BBE\u8BA1\u4F18\u5316\u4E0E\u751F\u6210', en: 'Design Optimization' },
            '\u7BA1\u7406': { zh: '\u7BA1\u7406', en: 'Management' }
        },
        phase: {
            '\u5168\u751F\u547D\u5468\u671F': { zh: '\u5168\u751F\u547D\u5468\u671F', en: 'Full Lifecycle' },
            '\u65BD\u5DE5': { zh: '\u65BD\u5DE5', en: 'Construction' },
            '\u7FFB\u65B0\u4E0E\u62C6\u9664': { zh: '\u7FFB\u65B0\u4E0E\u62C6\u9664', en: 'Renovation & Demolition' },
            '\u89C4\u5212\u4E0E\u8BBE\u8BA1': { zh: '\u89C4\u5212\u4E0E\u8BBE\u8BA1', en: 'Planning & Design' },
            '\u8FD0\u7EF4': { zh: '\u8FD0\u7EF4', en: 'O&M' }
        },
        llmMethod: {
            'Agent': { zh: 'Agent', en: 'Agent' },
            'Prompt': { zh: 'Prompt', en: 'Prompt Eng.' },
            'RAG': { zh: 'RAG', en: 'RAG' },
            '\u5176\u4ED6': { zh: '\u5176\u4ED6', en: 'Others' },
            '\u5FAE\u8C03': { zh: '\u5FAE\u8C03', en: 'Fine-tuning' }
        },
        representation: {
            '\u5176\u4ED6': { zh: '\u5176\u4ED6', en: 'Others' },
            '\u56FE\u7ED3\u6784': { zh: '\u56FE\u7ED3\u6784', en: 'Graph' },
            '\u591A\u6A21\u6001': { zh: '\u591A\u6A21\u6001', en: 'Multimodal' },
            '\u6587\u672C': { zh: '\u6587\u672C', en: 'Text' },
            '\u7ED3\u6784\u5316': { zh: '\u7ED3\u6784\u5316', en: 'Structured' }
        }
    };

    window.I18n = {
        lang: function () { return lang; },
        isZh: function () { return lang === 'zh'; },
        isEn: function () { return lang === 'en'; },
        toggle: function () {
            lang = lang === 'zh' ? 'en' : 'zh';
            this.applyToDOM();
            window.dispatchEvent(new CustomEvent('langChanged'));
        },
        ui: function (key) {
            return (UI[lang] && UI[lang][key]) || key;
        },
        field: function (fieldKey, value) {
            if (!value) return value || '';
            var map = FIELDS[fieldKey];
            if (map && map[value]) return map[value][lang];
            return value;
        },
        applyToDOM: function () {
            document.documentElement.lang = UI[lang].htmlLang;
            document.querySelectorAll('[data-i18n]').forEach(function (el) {
                el.textContent = I18n.ui(el.getAttribute('data-i18n'));
            });
            document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
                el.placeholder = I18n.ui(el.getAttribute('data-i18n-placeholder'));
            });
            var toggleBtn = document.getElementById('lang-toggle');
            if (toggleBtn) toggleBtn.textContent = I18n.ui('langToggle');
        }
    };
})();
