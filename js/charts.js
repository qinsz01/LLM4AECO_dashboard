(function () {
    'use strict';

    var charts = {};
    var PHASE_ORDER = ['规划与设计', '施工', '运维', '全生命周期', '翻新与拆除'];
    var METHOD_ORDER = ['Prompt', 'RAG', 'Agent', '微调', '其他'];
    var REPRESENTATION_ORDER = ['文本', '结构化', '多模态', '图结构', '学习/工程化编码'];

    var PHASE_COLORS = {
        '规划与设计': '#5b8def',
        '施工': '#f59e0b',
        '运维': '#10b981',
        '全生命周期': '#8b5cf6',
        '翻新与拆除': '#ef4444'
    };
    var OPERATION_COLORS = {
        generation_parameterization: '#5b8def',
        editing_execution: '#f59e0b',
        analysis_compliance_diagnosis: '#10b981',
        retrieval_alignment: '#8b5cf6'
    };
    var REPRESENTATION_COLORS = {
        '文本': '#94a3b8',
        '结构化': '#38bdf8',
        '多模态': '#f472b6',
        '图结构': '#a78bfa',
        '学习/工程化编码': '#a3e635'
    };
    var PALETTE = ['#5b8def', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16', '#f97316'];
    var TEXT = '#e8edf7';
    var MUTED = '#9aa8bd';
    var GRID = '#2a3550';
    var CARD = '#151d2f';

    function state() {
        return window.appState;
    }

    function selectedPapers() {
        var app = state();
        return app && app.filteredPapers ? app.filteredPapers : [];
    }

    function allPapers() {
        var app = state();
        return app && app.allPapers ? app.allPapers : [];
    }

    function getChart(id) {
        var element = document.getElementById(id);
        if (!element || !window.echarts) return null;
        if (!charts[id] || charts[id].isDisposed()) {
            charts[id] = echarts.init(element, null, { renderer: 'canvas' });
        }
        return charts[id];
    }

    function baseTooltip() {
        return {
            trigger: 'item',
            confine: true,
            backgroundColor: 'rgba(10, 15, 28, 0.96)',
            borderColor: GRID,
            borderWidth: 1,
            textStyle: { color: TEXT, fontSize: 12 },
            extraCssText: 'box-shadow:0 12px 30px rgba(0,0,0,.35);border-radius:8px;padding:10px 12px;'
        };
    }

    function countBy(items, key) {
        var counts = {};
        items.forEach(function (item) {
            var value = item[key];
            if (value === null || value === undefined || value === '') return;
            counts[value] = (counts[value] || 0) + 1;
        });
        return counts;
    }

    function countOperations(items) {
        var counts = {};
        I18n.operationOrder().forEach(function (operation) { counts[operation] = 0; });
        items.forEach(function (paper) {
            (paper.operations || []).forEach(function (operation) {
                counts[operation] = (counts[operation] || 0) + 1;
            });
        });
        return counts;
    }

    function orderedValues(items, key) {
        var counts = countBy(items, key);
        return Object.keys(counts).sort(function (a, b) {
            return counts[b] - counts[a] || String(a).localeCompare(String(b));
        });
    }

    function percent(value) {
        return (Number(value || 0) * 100).toFixed(1) + '%';
    }

    function translated(kind, value) {
        return I18n.field(kind, value);
    }

    function operationLabel(value) {
        return I18n.operation(value).label;
    }

    function shortOperationLabel(value) {
        var label = operationLabel(value);
        if (I18n.isZh()) return label;
        return label.replace(' & ', '\n& ').replace(', compliance & diagnosis', ', compliance\n& diagnosis');
    }

    function toggleFilter(key, value) {
        var app = state();
        if (app && typeof app.setFilter === 'function') app.setFilter(key, value);
    }

    function togglePair(firstKey, firstValue, secondKey, secondValue) {
        var app = state();
        if (!app || typeof app.setFilters !== 'function') return;
        var same = app.filters[firstKey] === firstValue && app.filters[secondKey] === secondValue;
        var patch = {};
        patch[firstKey] = same ? null : firstValue;
        patch[secondKey] = same ? null : secondValue;
        app.setFilters(patch);
    }

    function setChartOption(id, option, clickHandler) {
        var chart = getChart(id);
        if (!chart) return;
        chart.setOption(option, true);
        chart.off('click');
        if (clickHandler) chart.on('click', clickHandler);
    }

    function renderOperationDistribution(papers) {
        var operations = I18n.operationOrder();
        var counts = countOperations(papers);
        var total = papers.length;
        var selected = state().filters.operation;
        var option = {
            animationDuration: 350,
            tooltip: Object.assign(baseTooltip(), {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: function (params) {
                    var item = params[0];
                    var operation = operations[item.dataIndex];
                    return '<strong>' + operationLabel(operation) + '</strong><br>' +
                        I18n.ui('chartCount') + ': ' + item.value + '<br>' +
                        I18n.ui('chartShare') + ': ' + (total ? percent(item.value / total) : '0.0%');
                }
            }),
            grid: { left: I18n.isZh() ? 125 : 185, right: 58, top: 10, bottom: 30 },
            xAxis: {
                type: 'value',
                minInterval: 1,
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: { color: MUTED },
                splitLine: { lineStyle: { color: GRID } }
            },
            yAxis: {
                type: 'category',
                inverse: true,
                data: operations,
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: {
                    color: MUTED,
                    fontSize: 11,
                    formatter: function (value) { return operationLabel(value); }
                }
            },
            series: [{
                type: 'bar',
                barWidth: 18,
                data: operations.map(function (operation) {
                    return {
                        value: counts[operation] || 0,
                        itemStyle: {
                            color: OPERATION_COLORS[operation],
                            opacity: selected && selected !== operation ? 0.35 : 0.95,
                            borderRadius: [0, 5, 5, 0]
                        }
                    };
                }),
                label: {
                    show: true,
                    position: 'right',
                    color: TEXT,
                    fontSize: 11,
                    formatter: function (params) {
                        return params.value + (total ? ' · ' + percent(params.value / total) : '');
                    }
                }
            }]
        };
        setChartOption('chart-operation', option, function (params) {
            toggleFilter('operation', operations[params.dataIndex]);
        });
    }

    function renderOperationDepth(papers) {
        var counts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
        papers.forEach(function (paper) {
            var depth = Math.min(4, (paper.operations || []).length);
            counts[depth] = (counts[depth] || 0) + 1;
        });
        var colors = ['#475569', '#64748b', '#5b8def', '#8b5cf6', '#10b981'];
        var data = [0, 1, 2, 3, 4].map(function (depth) {
            return {
                name: depth === 0 ? I18n.ui('chartNoOperation') : (depth === 1 ? I18n.ui('operationCountOne') : depth + ' ' + I18n.ui('operationCountUnit')),
                value: counts[depth],
                itemStyle: { color: colors[depth] }
            };
        });
        var option = {
            animationDuration: 350,
            tooltip: Object.assign(baseTooltip(), {
                formatter: function (params) {
                    return '<strong>' + params.name + '</strong><br>' + I18n.ui('chartCount') + ': ' + params.value;
                }
            }),
            legend: {
                type: 'scroll',
                bottom: 0,
                textStyle: { color: MUTED, fontSize: 10 },
                itemWidth: 10,
                itemHeight: 10
            },
            series: [{
                type: 'pie',
                radius: ['42%', '72%'],
                center: ['50%', '43%'],
                avoidLabelOverlap: true,
                itemStyle: { borderColor: CARD, borderWidth: 3, borderRadius: 5 },
                label: {
                    color: TEXT,
                    fontSize: 11,
                    formatter: function (params) { return params.value ? params.value : ''; }
                },
                labelLine: { lineStyle: { color: MUTED } },
                data: data
            }]
        };
        setChartOption('chart-operation-depth', option);
    }

    function renderRepresentationOperation(papers) {
        var operations = I18n.operationOrder();
        var representationTotals = countBy(papers, 'representation');
        var matrix = {};
        papers.forEach(function (paper) {
            (paper.operations || []).forEach(function (operation) {
                var key = paper.representation + '||' + operation;
                matrix[key] = (matrix[key] || 0) + 1;
            });
        });
        var data = [];
        REPRESENTATION_ORDER.forEach(function (representation, yi) {
            operations.forEach(function (operation, xi) {
                var count = matrix[representation + '||' + operation] || 0;
                var total = representationTotals[representation] || 0;
                data.push([xi, yi, total ? count / total : 0, count, total]);
            });
        });
        var option = {
            animationDuration: 350,
            tooltip: Object.assign(baseTooltip(), {
                formatter: function (params) {
                    var value = params.value;
                    return '<strong>' + translated('representation', REPRESENTATION_ORDER[value[1]]) + ' × ' + operationLabel(operations[value[0]]) + '</strong><br>' +
                        I18n.ui('chartCount') + ': ' + value[3] + ' / ' + value[4] + '<br>' +
                        I18n.ui('chartShare') + ': ' + percent(value[2]);
                }
            }),
            grid: { left: I18n.isZh() ? 122 : 172, right: 45, top: 20, bottom: 72 },
            xAxis: {
                type: 'category',
                data: operations,
                axisLine: { lineStyle: { color: GRID } },
                axisTick: { show: false },
                axisLabel: {
                    color: MUTED,
                    fontSize: 10,
                    interval: 0,
                    formatter: function (value) { return shortOperationLabel(value); }
                }
            },
            yAxis: {
                type: 'category',
                data: REPRESENTATION_ORDER,
                axisLine: { lineStyle: { color: GRID } },
                axisTick: { show: false },
                axisLabel: {
                    color: MUTED,
                    fontSize: 10,
                    formatter: function (value) { return translated('representation', value); }
                }
            },
            visualMap: {
                min: 0,
                max: 1,
                calculable: false,
                orient: 'horizontal',
                left: 'center',
                bottom: 8,
                itemWidth: 120,
                itemHeight: 10,
                text: ['100%', '0%'],
                textStyle: { color: MUTED, fontSize: 10 },
                inRange: { color: ['#182237', '#304f7d', '#5b8def', '#8eaef5'] }
            },
            series: [{
                type: 'heatmap',
                data: data,
                label: {
                    show: true,
                    color: '#f8fafc',
                    fontWeight: 600,
                    formatter: function (params) { return params.value[3] || ''; }
                },
                itemStyle: { borderColor: CARD, borderWidth: 2, borderRadius: 4 },
                emphasis: { itemStyle: { borderColor: '#ffffff', borderWidth: 2, shadowBlur: 12, shadowColor: 'rgba(0,0,0,.45)' } }
            }]
        };
        setChartOption('chart-repr-operation', option, function (params) {
            togglePair('representation', REPRESENTATION_ORDER[params.value[1]], 'operation', operations[params.value[0]]);
        });
    }

    function renderOperationTask(papers) {
        var operations = I18n.operationOrder();
        var categories = orderedValues(allPapers(), 'category');
        var categoryTotals = countBy(papers, 'category');
        var matrix = {};
        papers.forEach(function (paper) {
            (paper.operations || []).forEach(function (operation) {
                var key = operation + '||' + paper.category;
                matrix[key] = (matrix[key] || 0) + 1;
            });
        });
        var data = [];
        operations.forEach(function (operation, yi) {
            categories.forEach(function (category, xi) {
                var count = matrix[operation + '||' + category] || 0;
                var total = categoryTotals[category] || 0;
                data.push([xi, yi, total ? count / total : 0, count, total]);
            });
        });
        var option = {
            animationDuration: 350,
            tooltip: Object.assign(baseTooltip(), {
                formatter: function (params) {
                    var value = params.value;
                    return '<strong>' + operationLabel(operations[value[1]]) + ' × ' + translated('category', categories[value[0]]) + '</strong><br>' +
                        I18n.ui('chartCount') + ': ' + value[3] + ' / ' + value[4] + '<br>' +
                        I18n.ui('chartShare') + ': ' + percent(value[2]);
                }
            }),
            grid: { left: I18n.isZh() ? 145 : 205, right: 45, top: 20, bottom: I18n.isZh() ? 92 : 112 },
            xAxis: {
                type: 'category',
                data: categories,
                axisLine: { lineStyle: { color: GRID } },
                axisTick: { show: false },
                axisLabel: {
                    color: MUTED,
                    fontSize: 10,
                    rotate: 28,
                    interval: 0,
                    formatter: function (value) { return translated('category', value); }
                }
            },
            yAxis: {
                type: 'category',
                data: operations,
                axisLine: { lineStyle: { color: GRID } },
                axisTick: { show: false },
                axisLabel: {
                    color: MUTED,
                    fontSize: 10,
                    formatter: function (value) { return operationLabel(value); }
                }
            },
            visualMap: {
                min: 0,
                max: 1,
                calculable: false,
                orient: 'horizontal',
                left: 'center',
                bottom: 8,
                itemWidth: 130,
                itemHeight: 10,
                text: ['100%', '0%'],
                textStyle: { color: MUTED, fontSize: 10 },
                inRange: { color: ['#182237', '#274f4a', '#10b981', '#6ee7b7'] }
            },
            series: [{
                type: 'heatmap',
                data: data,
                label: {
                    show: true,
                    color: '#f8fafc',
                    fontWeight: 600,
                    formatter: function (params) { return params.value[3] || ''; }
                },
                itemStyle: { borderColor: CARD, borderWidth: 2, borderRadius: 4 },
                emphasis: { itemStyle: { borderColor: '#ffffff', borderWidth: 2, shadowBlur: 12, shadowColor: 'rgba(0,0,0,.45)' } }
            }]
        };
        setChartOption('chart-operation-task', option, function (params) {
            togglePair('operation', operations[params.value[1]], 'category', categories[params.value[0]]);
        });
    }

    function renderPhase(papers) {
        var counts = countBy(papers, 'phase');
        var data = PHASE_ORDER.map(function (phase) {
            return { name: phase, value: counts[phase] || 0, itemStyle: { color: PHASE_COLORS[phase] } };
        });
        var option = {
            animationDuration: 350,
            tooltip: Object.assign(baseTooltip(), {
                formatter: function (params) {
                    return '<strong>' + translated('phase', params.name) + '</strong><br>' + I18n.ui('chartCount') + ': ' + params.value;
                }
            }),
            series: [{
                type: 'pie',
                radius: ['43%', '72%'],
                center: ['50%', '48%'],
                itemStyle: { borderColor: CARD, borderWidth: 3, borderRadius: 5 },
                label: {
                    color: MUTED,
                    fontSize: 10,
                    formatter: function (params) { return translated('phase', params.name) + '\n' + params.value; }
                },
                labelLine: { lineStyle: { color: MUTED } },
                data: data
            }]
        };
        setChartOption('chart-phase', option, function (params) { toggleFilter('phase', params.name); });
    }

    function renderMethod(papers) {
        var counts = countBy(papers, 'llmMethod');
        var option = {
            animationDuration: 350,
            tooltip: Object.assign(baseTooltip(), {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: function (params) {
                    var method = METHOD_ORDER[params[0].dataIndex];
                    return '<strong>' + translated('llmMethod', method) + '</strong><br>' + I18n.ui('chartCount') + ': ' + params[0].value;
                }
            }),
            grid: { left: 105, right: 44, top: 10, bottom: 28 },
            xAxis: {
                type: 'value',
                minInterval: 1,
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: { color: MUTED },
                splitLine: { lineStyle: { color: GRID } }
            },
            yAxis: {
                type: 'category',
                inverse: true,
                data: METHOD_ORDER,
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: { color: MUTED, formatter: function (value) { return translated('llmMethod', value); } }
            },
            series: [{
                type: 'bar',
                barWidth: 18,
                data: METHOD_ORDER.map(function (method, index) {
                    return { value: counts[method] || 0, itemStyle: { color: PALETTE[index], borderRadius: [0, 5, 5, 0] } };
                }),
                label: { show: true, position: 'right', color: TEXT }
            }]
        };
        setChartOption('chart-method', option, function (params) { toggleFilter('llmMethod', METHOD_ORDER[params.dataIndex]); });
    }

    function renderTrend(papers) {
        var counts = countBy(papers, 'year');
        var years = orderedValues(allPapers(), 'year').map(Number).sort(function (a, b) { return a - b; });
        var values = years.map(function (year) { return counts[year] || 0; });
        var option = {
            animationDuration: 350,
            tooltip: Object.assign(baseTooltip(), { trigger: 'axis', axisPointer: { type: 'shadow' } }),
            grid: { left: 46, right: 22, top: 20, bottom: 34 },
            xAxis: {
                type: 'category',
                data: years.map(String),
                axisLine: { lineStyle: { color: GRID } },
                axisTick: { show: false },
                axisLabel: { color: MUTED }
            },
            yAxis: {
                type: 'value',
                minInterval: 1,
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: { color: MUTED },
                splitLine: { lineStyle: { color: GRID } }
            },
            series: [
                {
                    type: 'bar',
                    barWidth: '48%',
                    data: values,
                    itemStyle: { color: '#5b8def', borderRadius: [5, 5, 0, 0] },
                    label: { show: true, position: 'top', color: TEXT, fontWeight: 600 }
                },
                {
                    type: 'line',
                    data: values,
                    smooth: true,
                    symbolSize: 7,
                    lineStyle: { color: '#f59e0b', width: 2 },
                    itemStyle: { color: '#f59e0b' }
                }
            ]
        };
        setChartOption('chart-trend', option, function (params) {
            toggleFilter('year', Number(years[params.dataIndex]));
        });
    }

    function renderRepresentationCategory(papers) {
        var categories = orderedValues(allPapers(), 'category');
        var matrix = {};
        var max = 0;
        papers.forEach(function (paper) {
            var key = paper.representation + '||' + paper.category;
            matrix[key] = (matrix[key] || 0) + 1;
            max = Math.max(max, matrix[key]);
        });
        var data = [];
        REPRESENTATION_ORDER.forEach(function (representation, yi) {
            categories.forEach(function (category, xi) {
                data.push([xi, yi, matrix[representation + '||' + category] || 0]);
            });
        });
        var option = {
            animationDuration: 350,
            tooltip: Object.assign(baseTooltip(), {
                formatter: function (params) {
                    return '<strong>' + translated('representation', REPRESENTATION_ORDER[params.value[1]]) + ' × ' + translated('category', categories[params.value[0]]) + '</strong><br>' +
                        I18n.ui('chartCount') + ': ' + params.value[2];
                }
            }),
            grid: { left: I18n.isZh() ? 122 : 172, right: 36, top: 20, bottom: I18n.isZh() ? 90 : 112 },
            xAxis: {
                type: 'category',
                data: categories,
                axisLine: { lineStyle: { color: GRID } },
                axisTick: { show: false },
                axisLabel: {
                    color: MUTED,
                    fontSize: 10,
                    rotate: 28,
                    interval: 0,
                    formatter: function (value) { return translated('category', value); }
                }
            },
            yAxis: {
                type: 'category',
                data: REPRESENTATION_ORDER,
                axisLine: { lineStyle: { color: GRID } },
                axisTick: { show: false },
                axisLabel: { color: MUTED, fontSize: 10, formatter: function (value) { return translated('representation', value); } }
            },
            visualMap: {
                min: 0,
                max: max || 1,
                show: false,
                inRange: { color: ['#182237', '#334f7d', '#5b8def'] }
            },
            series: [{
                type: 'heatmap',
                data: data,
                label: { show: true, color: '#f8fafc', formatter: function (params) { return params.value[2] || ''; } },
                itemStyle: { borderColor: CARD, borderWidth: 2, borderRadius: 4 }
            }]
        };
        setChartOption('chart-heatmap', option, function (params) {
            togglePair('representation', REPRESENTATION_ORDER[params.value[1]], 'category', categories[params.value[0]]);
        });
    }

    function renderPhaseCategory(papers) {
        var categories = orderedValues(allPapers(), 'category');
        var matrix = {};
        papers.forEach(function (paper) {
            var key = paper.category + '||' + paper.phase;
            matrix[key] = (matrix[key] || 0) + 1;
        });
        var series = PHASE_ORDER.map(function (phase) {
            return {
                name: phase,
                type: 'bar',
                stack: 'total',
                barWidth: 16,
                emphasis: { focus: 'series' },
                itemStyle: { color: PHASE_COLORS[phase] },
                data: categories.map(function (category) { return matrix[category + '||' + phase] || 0; })
            };
        });
        var option = {
            animationDuration: 350,
            tooltip: Object.assign(baseTooltip(), {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: function (params) {
                    var lines = ['<strong>' + translated('category', categories[params[0].dataIndex]) + '</strong>'];
                    params.forEach(function (item) {
                        if (item.value) lines.push(translated('phase', item.seriesName) + ': ' + item.value);
                    });
                    return lines.join('<br>');
                }
            }),
            legend: {
                type: 'scroll',
                bottom: 0,
                textStyle: { color: MUTED, fontSize: 9 },
                itemWidth: 10,
                itemHeight: 10,
                formatter: function (name) { return translated('phase', name); }
            },
            grid: { left: I18n.isZh() ? 105 : 142, right: 20, top: 12, bottom: 52 },
            xAxis: {
                type: 'value',
                minInterval: 1,
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: { color: MUTED },
                splitLine: { lineStyle: { color: GRID } }
            },
            yAxis: {
                type: 'category',
                inverse: true,
                data: categories,
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: { color: MUTED, fontSize: 9, formatter: function (value) { return translated('category', value); } }
            },
            series: series
        };
        setChartOption('chart-stacked', option, function (params) {
            togglePair('category', categories[params.dataIndex], 'phase', params.seriesName);
        });
    }

    function renderSunburst(papers) {
        var categories = orderedValues(allPapers(), 'category');
        var matrix = {};
        papers.forEach(function (paper) {
            if (!matrix[paper.category]) matrix[paper.category] = {};
            matrix[paper.category][paper.llmMethod] = (matrix[paper.category][paper.llmMethod] || 0) + 1;
        });
        var data = categories.map(function (category, index) {
            var methods = matrix[category] || {};
            var children = METHOD_ORDER.filter(function (method) { return methods[method]; }).map(function (method) {
                return { name: method, value: methods[method] };
            });
            return {
                name: category,
                value: children.reduce(function (sum, child) { return sum + child.value; }, 0),
                children: children,
                itemStyle: { color: PALETTE[index % PALETTE.length] }
            };
        });
        var option = {
            animationDuration: 350,
            tooltip: Object.assign(baseTooltip(), {
                formatter: function (params) {
                    var path = params.treePathInfo.slice(1).map(function (item, index) {
                        return index === 0 ? translated('category', item.name) : translated('llmMethod', item.name);
                    });
                    return '<strong>' + path.join(' → ') + '</strong><br>' + I18n.ui('chartCount') + ': ' + params.value;
                }
            }),
            series: [{
                type: 'sunburst',
                radius: ['12%', '88%'],
                data: data,
                nodeClick: false,
                sort: null,
                emphasis: { focus: 'ancestor' },
                levels: [
                    {},
                    {
                        r0: '12%', r: '55%',
                        label: { color: '#ffffff', fontSize: 9, rotate: 'tangential', formatter: function (params) { return translated('category', params.name); } },
                        itemStyle: { borderColor: CARD, borderWidth: 2 }
                    },
                    {
                        r0: '55%', r: '88%',
                        label: { color: MUTED, fontSize: 8, rotate: 'tangential', formatter: function (params) { return translated('llmMethod', params.name); } },
                        itemStyle: { borderColor: CARD, borderWidth: 1 }
                    }
                ]
            }]
        };
        setChartOption('chart-sunburst', option, function (params) {
            var path = params.treePathInfo || [];
            if (path.length === 2) toggleFilter('category', params.name);
            if (path.length === 3) togglePair('category', path[1].name, 'llmMethod', params.name);
        });
    }

    function renderAll() {
        var papers = selectedPapers();
        renderOperationDistribution(papers);
        renderOperationDepth(papers);
        renderRepresentationOperation(papers);
        renderOperationTask(papers);
        renderPhase(papers);
        renderMethod(papers);
        renderTrend(papers);
        renderRepresentationCategory(papers);
        renderPhaseCategory(papers);
        renderSunburst(papers);
    }

    window.addEventListener('papersLoaded', function () {
        renderAll();
        if (state()) state().chartsReady = true;
    });
    window.addEventListener('filtersChanged', renderAll);
    window.addEventListener('langChanged', renderAll);
    window.addEventListener('resize', function () {
        Object.keys(charts).forEach(function (key) {
            if (charts[key] && !charts[key].isDisposed()) charts[key].resize();
        });
    });
})();
