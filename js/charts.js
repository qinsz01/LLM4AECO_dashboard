(function () {
    'use strict';

    var charts = {};
    var OP_ORDER = [
        'generation_parameterization',
        'editing_execution',
        'analysis_compliance_diagnosis',
        'retrieval_alignment'
    ];
    var OP_COLORS = {
        generation_parameterization: '#6e9cff',
        editing_execution: '#f4b860',
        analysis_compliance_diagnosis: '#42c59a',
        retrieval_alignment: '#a58bfa'
    };
    var REPR_ORDER = ['文本', '结构化', '多模态', '图结构', '学习/工程化编码'];
    var CATEGORY_ORDER = [
        'BIM检索与管理', '建筑能耗建模', '结构设计与分析', '规范与合规检查',
        '设计优化与生成', '施工管理与安全', '环境与碳评估', '管理', '其他'
    ];
    var PHASE_COLORS = {
        '规划与设计': '#6e9cff',
        '施工': '#f4b860',
        '运维': '#42c59a',
        '全生命周期': '#a58bfa',
        '翻新与拆除': '#f27b91'
    };
    var TEXT = '#c3cedd';
    var MUTED = '#8795a9';
    var GRID = '#26344a';
    var TOOLTIP_BG = 'rgba(11,16,24,.96)';

    function getChart(id) {
        var el = document.getElementById(id);
        if (!el || !window.echarts) return null;
        if (!charts[id]) charts[id] = echarts.init(el);
        return charts[id];
    }

    function countBy(papers, getter) {
        var counts = {};
        papers.forEach(function (paper) {
            var values = getter(paper);
            if (!Array.isArray(values)) values = [values];
            values.filter(Boolean).forEach(function (value) {
                counts[value] = (counts[value] || 0) + 1;
            });
        });
        return counts;
    }

    function tooltipBase() {
        return {
            backgroundColor: TOOLTIP_BG,
            borderColor: GRID,
            borderWidth: 1,
            textStyle: { color: '#f1f5f9', fontSize: 12 },
            extraCssText: 'box-shadow:0 14px 35px rgba(0,0,0,.35);border-radius:10px;padding:10px 12px;'
        };
    }

    function axisCategory(data, rotate) {
        return {
            type: 'category',
            data: data,
            axisLine: { lineStyle: { color: GRID } },
            axisTick: { show: false },
            axisLabel: { color: MUTED, fontSize: 10, interval: 0, rotate: rotate || 0 }
        };
    }

    function axisValue() {
        return {
            type: 'value',
            minInterval: 1,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: MUTED, fontSize: 10 },
            splitLine: { lineStyle: { color: GRID, opacity: .65 } }
        };
    }

    function applyPairFilter(keyA, valueA, keyB, valueB) {
        var state = window.appState;
        state.filters[keyA] = valueA;
        state.filters[keyB] = valueB;
        state.applyFilters();
        document.querySelector('.papers-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function renderOperationDistribution(papers) {
        var chart = getChart('chart-operations');
        if (!chart) return;
        var counts = countBy(papers, function (paper) { return paper.operations || []; });
        var labels = OP_ORDER.map(function (code) { return I18n.field('operation', code); });
        var values = OP_ORDER.map(function (code) { return counts[code] || 0; });
        chart.setOption({
            tooltip: Object.assign(tooltipBase(), {
                trigger: 'axis', axisPointer: { type: 'shadow' },
                formatter: function (params) {
                    var item = params[0];
                    return '<strong>' + labels[item.dataIndex] + '</strong><br>' + I18n.ui('countLabel') + ': ' + item.value;
                }
            }),
            grid: { left: 18, right: 34, top: 18, bottom: 15, containLabel: true },
            xAxis: axisValue(),
            yAxis: axisCategory(labels, 0),
            series: [{
                type: 'bar',
                barWidth: 18,
                data: values.map(function (value, index) {
                    return { value: value, itemStyle: { color: OP_COLORS[OP_ORDER[index]], borderRadius: [0, 5, 5, 0] } };
                }),
                label: { show: true, position: 'right', color: TEXT, fontSize: 11 }
            }]
        }, true);
        chart.off('click');
        chart.on('click', function (params) {
            if (params.componentType === 'series') window.Dashboard.setFilter('operation', OP_ORDER[params.dataIndex]);
        });
    }

    function combinationLabel(key) {
        if (!key) return I18n.ui('combinationNone');
        return key.split('|').map(function (code) { return I18n.field('operation', code); }).join(' + ');
    }

    function renderCombinations(papers) {
        var chart = getChart('chart-combinations');
        if (!chart) return;
        var orderIndex = {};
        OP_ORDER.forEach(function (code, index) { orderIndex[code] = index; });
        var counts = countBy(papers, function (paper) {
            var ops = (paper.operations || []).slice().sort(function (a, b) { return orderIndex[a] - orderIndex[b]; });
            return ops.join('|');
        });
        var rows = Object.keys(counts).map(function (key) { return { key: key, value: counts[key] }; })
            .sort(function (a, b) { return b.value - a.value || a.key.localeCompare(b.key); })
            .slice(0, 9)
            .reverse();
        chart.setOption({
            tooltip: Object.assign(tooltipBase(), {
                trigger: 'item',
                formatter: function (params) {
                    var row = rows[params.dataIndex];
                    return '<strong>' + combinationLabel(row.key) + '</strong><br>' + I18n.ui('countLabel') + ': ' + row.value;
                }
            }),
            grid: { left: 18, right: 34, top: 18, bottom: 15, containLabel: true },
            xAxis: axisValue(),
            yAxis: Object.assign(axisCategory(rows.map(function (row) { return combinationLabel(row.key); }), 0), {
                axisLabel: {
                    color: MUTED, fontSize: 9, width: 230, overflow: 'truncate',
                    formatter: function (value) { return value.length > 44 ? value.slice(0, 43) + '…' : value; }
                }
            }),
            series: [{
                type: 'bar', barWidth: 13,
                data: rows.map(function (row) { return row.value; }),
                itemStyle: { color: '#6e9cff', opacity: .82, borderRadius: [0, 4, 4, 0] },
                label: { show: true, position: 'right', color: TEXT, fontSize: 10 }
            }]
        }, true);
    }

    function renderRepresentationOperation(papers) {
        var chart = getChart('chart-representation-operation');
        if (!chart) return;
        var reprTotals = countBy(papers, function (paper) { return paper.representation; });
        var matrix = {};
        papers.forEach(function (paper) {
            (paper.operations || []).forEach(function (operation) {
                var key = paper.representation + '||' + operation;
                matrix[key] = (matrix[key] || 0) + 1;
            });
        });
        var data = [];
        var max = 1;
        REPR_ORDER.forEach(function (repr, y) {
            OP_ORDER.forEach(function (operation, x) {
                var value = matrix[repr + '||' + operation] || 0;
                max = Math.max(max, value);
                data.push([x, y, value, reprTotals[repr] || 0]);
            });
        });
        chart.setOption({
            tooltip: Object.assign(tooltipBase(), {
                formatter: function (params) {
                    var value = params.value;
                    var prevalence = value[3] ? (value[2] / value[3] * 100).toFixed(1) : '0.0';
                    return '<strong>' + I18n.field('representation', REPR_ORDER[value[1]]) + ' × ' + I18n.field('operation', OP_ORDER[value[0]]) + '</strong><br>' +
                        I18n.ui('countLabel') + ': ' + value[2] + '<br>' + I18n.ui('withinRepresentation') + ': ' + prevalence + '%';
                }
            }),
            grid: { left: 18, right: 42, top: 22, bottom: 60, containLabel: true },
            xAxis: Object.assign(axisCategory(OP_ORDER.map(function (code) { return I18n.field('operation', code); }), 18), {
                position: 'bottom', axisLabel: { color: MUTED, fontSize: 10, interval: 0, rotate: 18 }
            }),
            yAxis: Object.assign(axisCategory(REPR_ORDER.map(function (key) { return I18n.field('representation', key); }), 0), {
                axisLabel: { color: MUTED, fontSize: 10 }
            }),
            visualMap: {
                min: 0, max: max, calculable: false, orient: 'horizontal', right: 0, bottom: 2,
                itemWidth: 90, itemHeight: 8, text: [String(max), '0'], textStyle: { color: MUTED, fontSize: 9 },
                inRange: { color: ['#172235', '#31558a', '#6e9cff'] }
            },
            series: [{
                type: 'heatmap', data: data,
                label: { show: true, color: '#f1f5f9', fontSize: 11, formatter: function (params) { return params.value[2] || ''; } },
                itemStyle: { borderColor: '#0b1018', borderWidth: 2, borderRadius: 3 },
                emphasis: { itemStyle: { borderColor: '#f1f5f9', borderWidth: 1 } }
            }]
        }, true);
        chart.off('click');
        chart.on('click', function (params) {
            if (params.componentType === 'series') applyPairFilter('representation', REPR_ORDER[params.value[1]], 'operation', OP_ORDER[params.value[0]]);
        });
    }

    function renderOperationTask(papers) {
        var chart = getChart('chart-operation-task');
        if (!chart) return;
        var opTotals = countBy(papers, function (paper) { return paper.operations || []; });
        var matrix = {};
        papers.forEach(function (paper) {
            (paper.operations || []).forEach(function (operation) {
                var key = operation + '||' + paper.category;
                matrix[key] = (matrix[key] || 0) + 1;
            });
        });
        var categories = CATEGORY_ORDER.filter(function (category) {
            return papers.some(function (paper) { return paper.category === category; });
        });
        var data = [];
        var max = 1;
        OP_ORDER.forEach(function (operation, y) {
            categories.forEach(function (category, x) {
                var value = matrix[operation + '||' + category] || 0;
                max = Math.max(max, value);
                data.push([x, y, value, opTotals[operation] || 0]);
            });
        });
        chart.setOption({
            tooltip: Object.assign(tooltipBase(), {
                formatter: function (params) {
                    var value = params.value;
                    var prevalence = value[3] ? (value[2] / value[3] * 100).toFixed(1) : '0.0';
                    return '<strong>' + I18n.field('operation', OP_ORDER[value[1]]) + ' × ' + I18n.field('category', categories[value[0]]) + '</strong><br>' +
                        I18n.ui('countLabel') + ': ' + value[2] + '<br>' + I18n.ui('withinOperation') + ': ' + prevalence + '%';
                }
            }),
            grid: { left: 18, right: 42, top: 22, bottom: 92, containLabel: true },
            xAxis: Object.assign(axisCategory(categories.map(function (key) { return I18n.field('category', key); }), 32), {
                axisLabel: { color: MUTED, fontSize: 9, interval: 0, rotate: 32 }
            }),
            yAxis: Object.assign(axisCategory(OP_ORDER.map(function (key) { return I18n.field('operation', key); }), 0), {
                axisLabel: { color: MUTED, fontSize: 10 }
            }),
            visualMap: {
                min: 0, max: max, calculable: false, orient: 'horizontal', right: 0, bottom: 2,
                itemWidth: 90, itemHeight: 8, text: [String(max), '0'], textStyle: { color: MUTED, fontSize: 9 },
                inRange: { color: ['#172235', '#31558a', '#6e9cff'] }
            },
            series: [{
                type: 'heatmap', data: data,
                label: { show: true, color: '#f1f5f9', fontSize: 10, formatter: function (params) { return params.value[2] || ''; } },
                itemStyle: { borderColor: '#0b1018', borderWidth: 2, borderRadius: 3 }
            }]
        }, true);
        chart.off('click');
        chart.on('click', function (params) {
            if (params.componentType === 'series') applyPairFilter('operation', OP_ORDER[params.value[1]], 'category', categories[params.value[0]]);
        });
    }

    function renderPhase(papers) {
        var chart = getChart('chart-phase');
        if (!chart) return;
        var counts = countBy(papers, function (paper) { return paper.phase; });
        var keys = Object.keys(PHASE_COLORS).filter(function (key) { return counts[key]; });
        chart.setOption({
            tooltip: Object.assign(tooltipBase(), { trigger: 'item' }),
            legend: { type: 'scroll', bottom: 0, textStyle: { color: MUTED, fontSize: 9 }, formatter: function (name) { return I18n.field('phase', name); } },
            series: [{
                type: 'pie', radius: ['42%', '68%'], center: ['50%', '45%'],
                itemStyle: { borderColor: '#0b1018', borderWidth: 2, borderRadius: 4 },
                label: { color: TEXT, fontSize: 10, formatter: function (params) { return I18n.field('phase', params.name) + '\n' + params.value; } },
                data: keys.map(function (key) { return { name: key, value: counts[key], itemStyle: { color: PHASE_COLORS[key] } }; })
            }]
        }, true);
        chart.off('click');
        chart.on('click', function (params) { window.Dashboard.setFilter('phase', params.name); });
    }

    function renderMethod(papers) {
        var chart = getChart('chart-method');
        if (!chart) return;
        var counts = countBy(papers, function (paper) { return paper.llmMethod; });
        var keys = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; });
        chart.setOption({
            tooltip: Object.assign(tooltipBase(), { trigger: 'axis', axisPointer: { type: 'shadow' } }),
            grid: { left: 14, right: 35, top: 18, bottom: 15, containLabel: true },
            xAxis: axisValue(),
            yAxis: axisCategory(keys.map(function (key) { return I18n.field('llmMethod', key); }), 0),
            series: [{ type: 'bar', barWidth: 17, data: keys.map(function (key) { return counts[key]; }), itemStyle: { color: '#42c59a', borderRadius: [0,4,4,0] }, label: { show: true, position: 'right', color: TEXT, fontSize: 10 } }]
        }, true);
        chart.off('click');
        chart.on('click', function (params) { window.Dashboard.setFilter('llmMethod', keys[params.dataIndex]); });
    }

    function renderTrend(papers) {
        var chart = getChart('chart-trend');
        if (!chart) return;
        var counts = countBy(papers, function (paper) { return String(paper.year); });
        var years = Object.keys(counts).sort();
        chart.setOption({
            tooltip: Object.assign(tooltipBase(), { trigger: 'axis' }),
            grid: { left: 12, right: 18, top: 25, bottom: 18, containLabel: true },
            xAxis: axisCategory(years, 0), yAxis: axisValue(),
            series: [{
                type: 'line', smooth: .25, symbolSize: 8, data: years.map(function (year) { return counts[year]; }),
                lineStyle: { color: '#6e9cff', width: 3 }, itemStyle: { color: '#6e9cff' },
                areaStyle: { color: 'rgba(110,156,255,.12)' }, label: { show: true, color: TEXT, fontSize: 10 }
            }]
        }, true);
        chart.off('click');
        chart.on('click', function (params) { window.Dashboard.setFilter('year', Number(years[params.dataIndex])); });
    }

    function renderRepresentationTask(papers) {
        var chart = getChart('chart-representation-task');
        if (!chart) return;
        var categories = CATEGORY_ORDER.filter(function (category) { return papers.some(function (paper) { return paper.category === category; }); });
        var matrix = {};
        papers.forEach(function (paper) {
            var key = paper.representation + '||' + paper.category;
            matrix[key] = (matrix[key] || 0) + 1;
        });
        var data = []; var max = 1;
        REPR_ORDER.forEach(function (repr, y) {
            categories.forEach(function (category, x) {
                var value = matrix[repr + '||' + category] || 0;
                max = Math.max(max, value); data.push([x, y, value]);
            });
        });
        chart.setOption({
            tooltip: Object.assign(tooltipBase(), {
                formatter: function (params) {
                    return '<strong>' + I18n.field('representation', REPR_ORDER[params.value[1]]) + ' × ' + I18n.field('category', categories[params.value[0]]) + '</strong><br>' + I18n.ui('countLabel') + ': ' + params.value[2];
                }
            }),
            grid: { left: 18, right: 42, top: 22, bottom: 92, containLabel: true },
            xAxis: Object.assign(axisCategory(categories.map(function (key) { return I18n.field('category', key); }), 32), { axisLabel: { color: MUTED, fontSize: 9, interval: 0, rotate: 32 } }),
            yAxis: Object.assign(axisCategory(REPR_ORDER.map(function (key) { return I18n.field('representation', key); }), 0), { axisLabel: { color: MUTED, fontSize: 10 } }),
            visualMap: { min: 0, max: max, calculable: false, orient: 'horizontal', right: 0, bottom: 2, itemWidth: 90, itemHeight: 8, text: [String(max), '0'], textStyle: { color: MUTED, fontSize: 9 }, inRange: { color: ['#172235', '#31558a', '#6e9cff'] } },
            series: [{ type: 'heatmap', data: data, label: { show: true, color: '#f1f5f9', fontSize: 10, formatter: function (params) { return params.value[2] || ''; } }, itemStyle: { borderColor: '#0b1018', borderWidth: 2, borderRadius: 3 } }]
        }, true);
        chart.off('click');
        chart.on('click', function (params) { applyPairFilter('representation', REPR_ORDER[params.value[1]], 'category', categories[params.value[0]]); });
    }

    function renderAll(papers) {
        renderOperationDistribution(papers);
        renderCombinations(papers);
        renderRepresentationOperation(papers);
        renderOperationTask(papers);
        renderPhase(papers);
        renderMethod(papers);
        renderTrend(papers);
        renderRepresentationTask(papers);
    }

    window.addEventListener('papersLoaded', function () {
        renderAll(window.appState.filteredPapers);
        window.appState.chartsReady = true;
    });
    window.addEventListener('filtersChanged', function () { renderAll(window.appState.filteredPapers); });
    window.addEventListener('langChanged', function () { renderAll(window.appState.filteredPapers); });
    window.addEventListener('resize', function () {
        Object.keys(charts).forEach(function (key) { if (charts[key]) charts[key].resize(); });
    });
})();
