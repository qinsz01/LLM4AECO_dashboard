(function () {
    'use strict';

    var chart = null;
    var representationData = null;
    var taskData = null;

    var OP_COLORS = {
        generation_parameterization: '#5c7cfa',
        editing_execution: '#f59f00',
        analysis_compliance_diagnosis: '#12b886',
        retrieval_alignment: '#845ef7'
    };

    var REPR_COLORS = {
        '文本': '#868e96',
        '结构化': '#339af0',
        '多模态': '#f06595',
        '图结构': '#845ef7',
        '学习/工程化编码': '#82c91e'
    };

    function isZh() {
        return window.I18n && I18n.isZh();
    }

    function labelFor(kind, key) {
        var labels = kind === 'task'
            ? taskData.labels.taskCategories
            : representationData.labels[kind === 'operation' ? 'operations' : 'representations'];
        var item = labels && labels[key];
        if (!item) return key;
        return isZh() ? item.labelZh : item.labelEn;
    }

    function nodeName(kind, key) {
        return kind + '::' + key;
    }

    function parseNodeName(name) {
        var parts = String(name).split('::');
        return { kind: parts.shift(), key: parts.join('::') };
    }

    function formatNumber(value, digits) {
        if (value === 'Infinity') return '\u221e';
        var number = Number(value);
        if (!isFinite(number)) return '\u221e';
        return number.toFixed(digits);
    }

    function percent(value) {
        return (Number(value || 0) * 100).toFixed(1) + '%';
    }

    function chartLabel(kind, key) {
        var label = labelFor(kind, key);
        var wrapped = isZh() ? {
            '学习/工程化编码': '学习/工程化\n编码',
            generation_parameterization: '生成与\n参数化',
            analysis_compliance_diagnosis: '分析、合规\n与诊断',
            retrieval_alignment: '检索与对齐',
            '施工管理与安全': '施工管理\n与安全',
            'BIM检索与管理': 'BIM检索\n与管理',
            '结构设计与分析': '结构设计\n与分析',
            '规范与合规检查': '规范与\n合规检查',
            '设计优化与生成': '设计优化\n与生成',
            '环境与碳评估': '环境与\n碳评估'
        } : {
            '学习/工程化编码': 'Learned/engineered\ncodes',
            generation_parameterization: 'Generation and\nparameterization',
            analysis_compliance_diagnosis: 'Analysis, compliance,\nand diagnosis',
            retrieval_alignment: 'Retrieval and alignment',
            '施工管理与安全': 'Construction management\nand safety',
            'BIM检索与管理': 'BIM retrieval and\nmanagement',
            '结构设计与分析': 'Structural analysis\nand design',
            '规范与合规检查': 'Regulatory compliance\nchecking',
            '设计优化与生成': 'Design generation\nand optimization',
            '环境与碳评估': 'Environmental and\ncarbon assessment'
        };
        return wrapped[key] || label;
    }

    function associationStatus(item) {
        var q = Number(item.fdrQ);
        if (q < 0.05 && Number(item.lift) > 1) {
            return isZh() ? '高于语料基线，FDR校正后显著' : 'Above corpus baseline; significant after FDR correction';
        }
        if (q < 0.05 && Number(item.lift) < 1) {
            return isZh() ? '低于语料基线，FDR校正后显著' : 'Below corpus baseline; significant after FDR correction';
        }
        return isZh() ? '未达到FDR校正后的显著水平' : 'Not significant after FDR correction';
    }

    function makeTooltip(params) {
        if (params.dataType === 'node') {
            var parsed = parseNodeName(params.data.name);
            var total = params.data.paperTotal;
            var layer = parsed.kind === 'repr'
                ? (isZh() ? '数据表征' : 'Representation')
                : parsed.kind === 'op'
                    ? (isZh() ? '数据处理操作' : 'Data-processing operation')
                    : (isZh() ? 'AECO任务类别' : 'AECO task category');
            return '<strong>' + labelFor(
                parsed.kind === 'repr' ? 'representation' : parsed.kind === 'op' ? 'operation' : 'task',
                parsed.key
            ) + '</strong><br>' + layer + (total !== undefined ? '<br>n = ' + total : '');
        }

        var item = params.data.stats || {};
        var source = parseNodeName(params.data.source);
        var target = parseNodeName(params.data.target);
        var sourceLabel = labelFor(
            source.kind === 'repr' ? 'representation' : source.kind === 'op' ? 'operation' : 'task',
            source.key
        );
        var targetLabel = labelFor(
            target.kind === 'repr' ? 'representation' : target.kind === 'op' ? 'operation' : 'task',
            target.key
        );
        var lines = [
            '<strong>' + sourceLabel + ' \u2192 ' + targetLabel + '</strong>',
            (isZh() ? '论文数' : 'Raw paper count') + ': ' + item.rawPaperCount,
            (isZh() ? '条件占比' : 'Conditional prevalence') + ': ' + percent(item.conditionalPrevalence),
            'Lift: ' + formatNumber(item.lift, 2),
            (isZh() ? '优势比' : 'Odds ratio') + ': ' + formatNumber(item.oddsRatio, 2),
            'FDR q: ' + formatNumber(item.fdrQ, 3),
            associationStatus(item)
        ];
        return lines.join('<br>');
    }

    function createNodes() {
        var nodes = [];

        representationData.orders.representations.forEach(function (key) {
            nodes.push({
                name: nodeName('repr', key),
                depth: 0,
                paperTotal: representationData.totals.representations[key],
                itemStyle: { color: REPR_COLORS[key] || '#868e96' }
            });
        });

        representationData.orders.operations.forEach(function (key) {
            nodes.push({
                name: nodeName('op', key),
                depth: 1,
                paperTotal: representationData.totals.operations[key],
                itemStyle: { color: OP_COLORS[key] || '#495057' }
            });
        });

        taskData.orders.taskCategories.forEach(function (key) {
            nodes.push({
                name: nodeName('task', key),
                depth: 2,
                paperTotal: taskData.totals.taskCategories[key],
                itemStyle: { color: '#74c0fc' }
            });
        });

        return nodes;
    }

    function linkStyle(item) {
        var significant = Number(item.fdrQ) < 0.05;
        var enriched = Number(item.lift) > 1;
        return {
            opacity: significant ? 0.74 : 0.16,
            curveness: 0.46,
            color: significant && enriched ? 'source' : '#adb5bd'
        };
    }

    function createLinks() {
        var links = [];

        representationData.representationOperation.forEach(function (item) {
            if (Number(item.fractionalPaperEquivalent) <= 0) return;
            links.push({
                source: nodeName('repr', item.source),
                target: nodeName('op', item.target),
                value: item.fractionalPaperEquivalent,
                rawValue: item.rawPaperCount,
                stats: item,
                lineStyle: linkStyle(item)
            });
        });

        taskData.operationTaskCategory.forEach(function (item) {
            if (Number(item.fractionalPaperEquivalent) <= 0) return;
            links.push({
                source: nodeName('op', item.source),
                target: nodeName('task', item.target),
                value: item.fractionalPaperEquivalent,
                rawValue: item.rawPaperCount,
                stats: item,
                lineStyle: linkStyle(item)
            });
        });

        return links;
    }

    function render() {
        var el = document.getElementById('chart-association');
        if (!el || !representationData || !taskData || !window.echarts) return;

        if (!chart) chart = echarts.init(el);

        var note = document.getElementById('association-note');
        if (note) {
            note.textContent = isZh()
                ? '每篇论文可具有多个操作标签。连线宽度按论文在其操作标签间平均分配的论文当量计算；悬停可查看原始论文数、条件占比、Lift、优势比和FDR校正后的q值。'
                : 'Papers may have multiple operation labels. Link width uses fractional paper-equivalents divided across a paper\u2019s operation labels. Hover for raw counts, prevalence, lift, odds ratios, and FDR-adjusted q-values.';
        }

        chart.setOption({
            animationDuration: 500,
            tooltip: {
                trigger: 'item',
                confine: true,
                formatter: makeTooltip
            },
            graphic: [
                {
                    type: 'text', left: '6%', top: 0,
                    style: {
                        text: isZh() ? '数据表征' : 'REPRESENTATION',
                        font: '600 10px Arial', fill: '#868e96'
                    }
                },
                {
                    type: 'text', left: '43%', top: 0,
                    style: {
                        text: isZh() ? '数据处理操作' : 'DATA-PROCESSING OPERATION',
                        font: '600 10px Arial', fill: '#868e96'
                    }
                },
                {
                    type: 'text', right: '6%', top: 0,
                    style: {
                        text: isZh() ? 'AECO任务类别' : 'AECO TASK CATEGORY',
                        font: '600 10px Arial', fill: '#868e96'
                    }
                }
            ],
            series: [{
                type: 'sankey',
                data: createNodes(),
                links: createLinks(),
                left: '15%',
                right: '21%',
                top: 34,
                bottom: 18,
                nodeWidth: 15,
                nodeGap: 9,
                draggable: false,
                nodeAlign: 'justify',
                layoutIterations: 64,
                emphasis: { focus: 'adjacency' },
                label: {
                    color: '#343a40',
                    fontSize: 11,
                    lineHeight: 14,
                    formatter: function (params) {
                        var parsed = parseNodeName(params.name);
                        var kind = parsed.kind === 'repr'
                            ? 'representation'
                            : parsed.kind === 'op' ? 'operation' : 'task';
                        return chartLabel(kind, parsed.key) + '\n(n=' + params.data.paperTotal + ')';
                    }
                },
                lineStyle: {
                    color: 'source',
                    opacity: 0.25,
                    curveness: 0.46
                },
                levels: [
                    { depth: 0, label: { position: 'left', align: 'right' } },
                    { depth: 1, label: { position: 'right', align: 'left' } },
                    { depth: 2, label: { position: 'right', align: 'left' } }
                ]
            }]
        }, true);

        chart.off('click');
        chart.on('click', function (params) {
            if (!window.appState) return;
            var filters = window.appState.filters;
            if (params.dataType === 'node') {
                var parsed = parseNodeName(params.data.name);
                if (parsed.kind === 'repr') filters.representation = parsed.key;
                if (parsed.kind === 'op') filters.operation = parsed.key;
                if (parsed.kind === 'task') filters.category = parsed.key;
            } else if (params.dataType === 'edge') {
                var source = parseNodeName(params.data.source);
                var target = parseNodeName(params.data.target);
                [source, target].forEach(function (parsed) {
                    if (parsed.kind === 'repr') filters.representation = parsed.key;
                    if (parsed.kind === 'op') filters.operation = parsed.key;
                    if (parsed.kind === 'task') filters.category = parsed.key;
                });
            }
            if (typeof window.appState.applyFilters === 'function') {
                window.appState.applyFilters();
                var section = document.querySelector('.papers-section');
                if (section) section.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    function load() {
        Promise.all([
            fetch('data/association_repr_operation.json').then(function (res) {
                if (!res.ok) throw new Error('Failed to load representation-operation associations');
                return res.json();
            }),
            fetch('data/association_operation_task.json').then(function (res) {
                if (!res.ok) throw new Error('Failed to load operation-task associations');
                return res.json();
            })
        ]).then(function (data) {
            representationData = data[0];
            taskData = data[1];
            render();
        }).catch(function (error) {
            console.error('Operation association chart failed:', error);
        });
    }

    window.addEventListener('langChanged', render);
    window.addEventListener('resize', function () {
        if (chart) chart.resize();
    });
    document.addEventListener('DOMContentLoaded', load);
})();
