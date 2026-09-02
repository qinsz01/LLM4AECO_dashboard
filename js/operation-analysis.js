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
            opacity: significant ? 0.72 : 0.24,
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
            series: [{
                type: 'sankey',
                data: createNodes(),
                links: createLinks(),
                left: 12,
                right: 12,
                top: 18,
                bottom: 20,
                nodeWidth: 15,
                nodeGap: 8,
                draggable: false,
                nodeAlign: 'justify',
                layoutIterations: 64,
                emphasis: { focus: 'adjacency' },
                label: {
                    color: '#343a40',
                    fontSize: 11,
                    formatter: function (params) {
                        var parsed = parseNodeName(params.name);
                        var kind = parsed.kind === 'repr'
                            ? 'representation'
                            : parsed.kind === 'op' ? 'operation' : 'task';
                        return labelFor(kind, parsed.key) + '\n(n=' + params.data.paperTotal + ')';
                    }
                },
                lineStyle: {
                    color: 'source',
                    opacity: 0.25,
                    curveness: 0.46
                },
                levels: [
                    { depth: 0, label: { position: 'right' } },
                    { depth: 1, label: { position: 'right' } },
                    { depth: 2, label: { position: 'left' } }
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
