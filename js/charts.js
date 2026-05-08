(function () {
    'use strict';

    // =========================================================================
    // Constants
    // =========================================================================
    var PHASE_COLORS = {
        '规划与设计': '#5b8def', '施工': '#f59e0b', '运维': '#10b981',
        '全生命周期': '#8b5cf6', '翻新与拆除': '#ef4444'
    };

    var PALETTE = ['#5b8def', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444',
        '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'];

    var REPR_MAP = {
        '文本': '文本', '结构化': '结构化', '多模态': '多模态',
        '图结构': '图结构', '其他': '其他'
    };

    // Dark theme axis / label colors
    var AXIS_LINE = '#2a3350';
    var AXIS_LABEL = '#9aa0b0';
    var SPLIT_LINE = '#1e2538';

    // =========================================================================
    // Helpers
    // =========================================================================
    function countBy(arr, key) {
        var map = {};
        arr.forEach(function (item) {
            var val = item[key];
            if (val == null) return;
            map[val] = (map[val] || 0) + 1;
        });
        return map;
    }

    function normalizeRepr(val) {
        return REPR_MAP[val] || '其他';
    }

    function sortedKeys(countMap) {
        return Object.keys(countMap).sort(function (a, b) {
            return countMap[b] - countMap[a];
        });
    }

    function setFilter(key, value) {
        var state = window.appState;
        if (state.filters[key] === value) {
            state.filters[key] = null;
        } else {
            state.filters[key] = value;
        }
        state.applyFilters();
    }

    // =========================================================================
    // Chart instances
    // =========================================================================
    var charts = [];

    function createChart(domId) {
        var dom = document.getElementById(domId);
        if (!dom) return null;
        var chart = echarts.init(dom);
        charts.push(chart);
        return chart;
    }

    // =========================================================================
    // Chart 1: Phase Distribution (Donut)
    // =========================================================================
    var phaseChart = null;

    function buildPhaseChart(papers) {
        phaseChart = createChart('chart-phase');
        if (!phaseChart) return;

        var counts = countBy(papers, 'phase');
        var data = Object.keys(PHASE_COLORS).map(function (phase) {
            return {
                name: phase,
                value: counts[phase] || 0,
                itemStyle: { color: PHASE_COLORS[phase] }
            };
        });

        var option = {
            tooltip: {
                trigger: 'item',
                formatter: function (params) {
                    return I18n.field('phase', params.name) + ': ' + params.value + ' (' + params.percent + '%)';
                },
                backgroundColor: 'rgba(15,20,25,0.9)',
                borderColor: SPLIT_LINE,
                textStyle: { color: '#e2e8f0', fontSize: 12 }
            },
            series: [{
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['50%', '50%'],
                avoidLabelOverlap: true,
                itemStyle: {
                    borderRadius: 4,
                    borderColor: '#0f1419',
                    borderWidth: 2
                },
                label: {
                    color: AXIS_LABEL,
                    fontSize: 11,
                    formatter: function (params) {
                        return I18n.field('phase', params.name) + '\n' + params.value;
                    }
                },
                labelLine: { lineStyle: { color: AXIS_LABEL } },
                emphasis: {
                    label: { fontSize: 13, fontWeight: 'bold' },
                    itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' }
                },
                data: data
            }]
        };

        phaseChart.setOption(option);
        phaseChart.on('click', function (params) {
            setFilter('phase', params.name);
        });
    }

    // =========================================================================
    // Chart 2: LLM Method Distribution (Horizontal Bar)
    // =========================================================================
    var methodChart = null;

    function buildMethodChart(papers) {
        methodChart = createChart('chart-method');
        if (!methodChart) return;

        var counts = countBy(papers, 'llmMethod');
        var keys = sortedKeys(counts);

        var option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                backgroundColor: 'rgba(15,20,25,0.9)',
                borderColor: SPLIT_LINE,
                textStyle: { color: '#e2e8f0', fontSize: 12 },
                formatter: function (params) {
                    var p = params[0];
                    return I18n.field('llmMethod', keys[p.dataIndex]) + ': ' + p.value;
                }
            },
            grid: { left: 80, right: 30, top: 10, bottom: 30 },
            xAxis: {
                type: 'value',
                axisLine: { lineStyle: { color: AXIS_LINE } },
                axisLabel: { color: AXIS_LABEL, fontSize: 11 },
                splitLine: { lineStyle: { color: SPLIT_LINE } }
            },
            yAxis: {
                type: 'category',
                data: keys,
                axisLine: { lineStyle: { color: AXIS_LINE } },
                axisLabel: {
                    color: AXIS_LABEL,
                    fontSize: 11,
                    formatter: function (val) {
                        return I18n.field('llmMethod', val);
                    }
                },
                axisTick: { show: false }
            },
            series: [{
                type: 'bar',
                barWidth: 18,
                data: keys.map(function (k, i) {
                    return {
                        value: counts[k],
                        itemStyle: { color: PALETTE[i % PALETTE.length] }
                    };
                }),
                label: {
                    show: true,
                    position: 'right',
                    color: AXIS_LABEL,
                    fontSize: 11
                },
                emphasis: {
                    itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' }
                }
            }]
        };

        methodChart.setOption(option);
        methodChart.on('click', function (params) {
            var name = keys[params.dataIndex];
            setFilter('llmMethod', name);
        });
    }

    // =========================================================================
    // Chart 3: Publication Trend (Line + Bar mixed)
    // =========================================================================
    var trendChart = null;

    function buildTrendChart(papers) {
        trendChart = createChart('chart-trend');
        if (!trendChart) return;

        var counts = countBy(papers, 'year');
        var years = Object.keys(counts).map(Number).sort(function (a, b) { return a - b; });
        var values = years.map(function (y) { return counts[y] || 0; });

        var option = {
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(15,20,25,0.9)',
                borderColor: SPLIT_LINE,
                textStyle: { color: '#e2e8f0', fontSize: 12 }
            },
            grid: { left: 50, right: 20, top: 20, bottom: 30 },
            xAxis: {
                type: 'category',
                data: years.map(String),
                axisLine: { lineStyle: { color: AXIS_LINE } },
                axisLabel: { color: AXIS_LABEL, fontSize: 11 },
                axisTick: { show: false }
            },
            yAxis: {
                type: 'value',
                axisLine: { lineStyle: { color: AXIS_LINE } },
                axisLabel: { color: AXIS_LABEL, fontSize: 11 },
                splitLine: { lineStyle: { color: SPLIT_LINE } }
            },
            series: [
                {
                    name: 'Count',
                    type: 'bar',
                    barWidth: 40,
                    data: values,
                    itemStyle: {
                        color: '#5b8def',
                        borderRadius: [4, 4, 0, 0]
                    },
                    label: {
                        show: true,
                        position: 'top',
                        color: AXIS_LABEL,
                        fontSize: 12,
                        fontWeight: 'bold'
                    },
                    emphasis: {
                        itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' }
                    }
                },
                {
                    name: 'Trend',
                    type: 'line',
                    smooth: true,
                    symbolSize: 8,
                    lineStyle: { color: '#f59e0b', width: 2 },
                    itemStyle: { color: '#f59e0b' },
                    data: values
                }
            ]
        };

        trendChart.setOption(option);
        trendChart.on('click', function (params) {
            var year = parseInt(years[params.dataIndex], 10);
            setFilter('year', year);
        });
    }

    // =========================================================================
    // Chart 4: Representation x Category Heatmap
    // =========================================================================
    var heatmapChart = null;

    function buildHeatmapChart(papers) {
        heatmapChart = createChart('chart-heatmap');
        if (!heatmapChart) return;

        // Build cross-count: normalized repr x category
        var categories = [];
        var reprs = ['文本', '结构化', '多模态', '图结构', '其他'];

        // Collect unique categories in stable order
        var catSet = {};
        papers.forEach(function (p) {
            if (p.category) catSet[p.category] = true;
        });
        categories = Object.keys(catSet).sort();

        // Build matrix
        var matrix = {};
        papers.forEach(function (p) {
            var r = normalizeRepr(p.representation);
            var c = p.category;
            if (!c) return;
            var key = r + '||' + c;
            matrix[key] = (matrix[key] || 0) + 1;
        });

        var heatData = [];
        var maxVal = 0;
        reprs.forEach(function (r, ri) {
            categories.forEach(function (c, ci) {
                var val = matrix[r + '||' + c] || 0;
                heatData.push([ci, ri, val]);
                if (val > maxVal) maxVal = val;
            });
        });

        var option = {
            tooltip: {
                formatter: function (params) {
                    return I18n.field('representation', reprs[params.value[1]]) + ' x ' +
                        I18n.field('category', categories[params.value[0]]) +
                        '<br/>Count: ' + params.value[2];
                },
                backgroundColor: 'rgba(15,20,25,0.9)',
                borderColor: SPLIT_LINE,
                textStyle: { color: '#e2e8f0', fontSize: 12 }
            },
            grid: { left: 70, right: 30, top: 10, bottom: 70 },
            xAxis: {
                type: 'category',
                data: categories,
                axisLine: { lineStyle: { color: AXIS_LINE } },
                axisLabel: {
                    color: AXIS_LABEL,
                    fontSize: 10,
                    rotate: 35,
                    interval: 0,
                    formatter: function (val) {
                        return I18n.field('category', val);
                    }
                },
                axisTick: { show: false },
                splitArea: { show: false }
            },
            yAxis: {
                type: 'category',
                data: reprs,
                axisLine: { lineStyle: { color: AXIS_LINE } },
                axisLabel: {
                    color: AXIS_LABEL,
                    fontSize: 10,
                    formatter: function (val) {
                        return I18n.field('representation', val);
                    }
                },
                axisTick: { show: false },
                splitArea: { show: false }
            },
            visualMap: {
                min: 0,
                max: maxVal || 1,
                calculable: false,
                orient: 'horizontal',
                left: 'center',
                bottom: 0,
                itemWidth: 12,
                itemHeight: 80,
                textStyle: { color: AXIS_LABEL, fontSize: 10 },
                inRange: {
                    color: ['#1e2538', '#3b5998', '#5b8def']
                }
            },
            series: [{
                type: 'heatmap',
                data: heatData,
                label: {
                    show: true,
                    color: '#e2e8f0',
                    fontSize: 10,
                    formatter: function (params) {
                        return params.value[2] || '';
                    }
                },
                itemStyle: {
                    borderColor: '#0f1419',
                    borderWidth: 1
                },
                emphasis: {
                    itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' }
                }
            }]
        };

        heatmapChart.setOption(option);
        heatmapChart.on('click', function (params) {
            var category = categories[params.value[0]];
            var repr = reprs[params.value[1]];
            var state = window.appState;
            // Set both filters (toggle logic)
            if (state.filters.category === category && state.filters.representation === repr) {
                state.filters.category = null;
                state.filters.representation = null;
            } else {
                state.filters.category = category;
                state.filters.representation = repr;
            }
            state.applyFilters();
        });
    }

    // =========================================================================
    // Chart 5: Phase x Category Stacked Bar
    // =========================================================================
    var stackedChart = null;

    function buildStackedChart(papers) {
        stackedChart = createChart('chart-stacked');
        if (!stackedChart) return;

        var categories = [];
        var catSet = {};
        papers.forEach(function (p) {
            if (p.category) catSet[p.category] = true;
        });
        categories = Object.keys(catSet).sort();

        var phaseKeys = Object.keys(PHASE_COLORS);

        // Build counts per category per phase
        var matrix = {};
        papers.forEach(function (p) {
            var c = p.category;
            var ph = p.phase;
            if (!c || !ph) return;
            var key = c + '||' + ph;
            matrix[key] = (matrix[key] || 0) + 1;
        });

        var series = phaseKeys.map(function (phase) {
            return {
                name: phase,
                type: 'bar',
                stack: 'total',
                barWidth: 18,
                emphasis: {
                    focus: 'series'
                },
                itemStyle: {
                    color: PHASE_COLORS[phase],
                    borderRadius: 0
                },
                data: categories.map(function (cat) {
                    return matrix[cat + '||' + phase] || 0;
                })
            };
        });

        // Round corners on top of stack only: first and last series
        if (series.length > 0) {
            series[0].itemStyle.borderRadius = [0, 0, 0, 0];
        }

        var option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                backgroundColor: 'rgba(15,20,25,0.9)',
                borderColor: SPLIT_LINE,
                textStyle: { color: '#e2e8f0', fontSize: 12 },
                formatter: function (params) {
                    var catName = I18n.field('category', categories[params[0].dataIndex]);
                    var lines = [catName];
                    params.forEach(function (p) {
                        if (p.value > 0) {
                            lines.push(I18n.field('phase', p.seriesName) + ': ' + p.value);
                        }
                    });
                    return lines.join('<br/>');
                }
            },
            legend: {
                data: phaseKeys,
                bottom: 0,
                textStyle: { color: AXIS_LABEL, fontSize: 10 },
                itemWidth: 10,
                itemHeight: 10,
                itemGap: 6,
                type: 'scroll',
                formatter: function (name) {
                    return I18n.field('phase', name);
                }
            },
            grid: { left: 90, right: 20, top: 10, bottom: 50 },
            xAxis: {
                type: 'value',
                axisLine: { lineStyle: { color: AXIS_LINE } },
                axisLabel: { color: AXIS_LABEL, fontSize: 11 },
                splitLine: { lineStyle: { color: SPLIT_LINE } }
            },
            yAxis: {
                type: 'category',
                data: categories,
                axisLine: { lineStyle: { color: AXIS_LINE } },
                axisLabel: {
                    color: AXIS_LABEL,
                    fontSize: 10,
                    formatter: function (val) {
                        return I18n.field('category', val);
                    }
                },
                axisTick: { show: false }
            },
            series: series
        };

        stackedChart.setOption(option);
        stackedChart.on('click', function (params) {
            setFilter('category', categories[params.dataIndex]);
        });
    }

    // =========================================================================
    // Chart 6: Sunburst (Category -> LLM Method)
    // =========================================================================
    var sunburstChart = null;

    function buildSunburstChart(papers) {
        sunburstChart = createChart('chart-sunburst');
        if (!sunburstChart) return;

        // Build hierarchy: category -> llmMethod
        var catMap = {};
        papers.forEach(function (p) {
            var cat = p.category;
            var method = p.llmMethod;
            if (!cat || !method) return;
            if (!catMap[cat]) catMap[cat] = {};
            catMap[cat][method] = (catMap[cat][method] || 0) + 1;
        });

        var catKeys = Object.keys(catMap).sort();
        var data = catKeys.map(function (cat, idx) {
            var children = Object.keys(catMap[cat]).map(function (method) {
                return {
                    name: method,
                    value: catMap[cat][method]
                };
            });
            return {
                name: cat,
                value: children.reduce(function (s, c) { return s + c.value; }, 0),
                children: children,
                itemStyle: { color: PALETTE[idx % PALETTE.length] }
            };
        });

        var option = {
            tooltip: {
                formatter: function (params) {
                    var path = params.treePathInfo.map(function (p) { return p.name; }).filter(Boolean);
                    var translatedPath = path.map(function (name, idx) {
                        if (idx === 0) return I18n.field('category', name);
                        return I18n.field('llmMethod', name);
                    });
                    return translatedPath.join(' > ') + '<br/>Count: ' + params.value;
                },
                backgroundColor: 'rgba(15,20,25,0.9)',
                borderColor: SPLIT_LINE,
                textStyle: { color: '#e2e8f0', fontSize: 12 }
            },
            series: [{
                type: 'sunburst',
                radius: ['15%', '90%'],
                data: data,
                nodeClick: false,
                sort: null,
                emphasis: {
                    focus: 'ancestor'
                },
                levels: [
                    {},
                    {
                        // Inner ring: categories
                        r0: '15%',
                        r: '55%',
                        label: {
                            fontSize: 11,
                            color: '#ffffff',
                            rotate: 'tangential',
                            formatter: function (params) {
                                return I18n.field('category', params.name);
                            }
                        },
                        itemStyle: {
                            borderWidth: 2,
                            borderColor: '#0f1419'
                        }
                    },
                    {
                        // Outer ring: llm methods
                        r0: '55%',
                        r: '90%',
                        label: {
                            fontSize: 10,
                            color: AXIS_LABEL,
                            rotate: 'tangential',
                            position: 'inside',
                            formatter: function (params) {
                                return I18n.field('llmMethod', params.name);
                            }
                        },
                        itemStyle: {
                            borderWidth: 1,
                            borderColor: '#0f1419'
                        }
                    }
                ]
            }]
        };

        sunburstChart.setOption(option);
        sunburstChart.on('click', function (params) {
            var treePath = params.treePathInfo;
            // treePathInfo[0] is root, [1] is inner ring (category), [2] is outer ring (method)
            if (treePath.length === 2) {
                // Inner ring click -> toggle category
                setFilter('category', params.name);
            } else if (treePath.length === 3) {
                // Outer ring click -> toggle llmMethod
                setFilter('llmMethod', params.name);
            }
        });
    }

    // =========================================================================
    // Highlight / Update on filtersChanged
    // =========================================================================
    function updateHighlights() {
        var state = window.appState;
        var f = state.filters;

        // --- Phase pie: dim non-selected slices ---
        if (phaseChart) {
            var phaseCounts = countBy(state.filteredPapers, 'phase');
            var phaseData = Object.keys(PHASE_COLORS).map(function (phase) {
                var isSelected = (f.phase === null || f.phase === phase);
                return {
                    name: phase,
                    value: phaseCounts[phase] || 0,
                    itemStyle: {
                        color: PHASE_COLORS[phase],
                        opacity: isSelected ? 1 : 0.3
                    },
                    label: { opacity: isSelected ? 1 : 0.3 }
                };
            });
            phaseChart.setOption({
                series: [{
                    data: phaseData
                }]
            });
        }

        // --- Trend chart: update to filtered counts ---
        if (trendChart) {
            var yearCounts = countBy(state.filteredPapers, 'year');
            var years = [2023, 2024, 2025, 2026];
            var yearValues = years.map(function (y) { return yearCounts[y] || 0; });

            // Highlight selected year
            var barColors = years.map(function (y) {
                if (f.year !== null && f.year !== y) return '#2a3350';
                return '#5b8def';
            });
            var lineColor = (f.year !== null) ? '#2a3350' : '#f59e0b';

            trendChart.setOption({
                series: [
                    {
                        data: yearValues.map(function (v, i) {
                            return {
                                value: v,
                                itemStyle: { color: barColors[i] }
                            };
                        })
                    },
                    {
                        data: yearValues,
                        lineStyle: { color: lineColor },
                        itemStyle: { color: lineColor }
                    }
                ]
            });
        }

        // --- Method chart: update counts from filtered ---
        if (methodChart) {
            var methodCounts = countBy(state.filteredPapers, 'llmMethod');
            var methodKeys = sortedKeys(countBy(state.allPapers, 'llmMethod'));
            methodChart.setOption({
                series: [{
                    data: methodKeys.map(function (k, i) {
                        var isSelected = (f.llmMethod === null || f.llmMethod === k);
                        return {
                            value: methodCounts[k],
                            itemStyle: {
                                color: isSelected ? PALETTE[i % PALETTE.length] : '#2a3350'
                            }
                        };
                    })
                }]
            });
        }

        // --- Heatmap: update counts from filtered ---
        if (heatmapChart) {
            var categories = [];
            var reprs = ['文本', '结构化', '多模态', '图结构', '其他'];
            var catSet = {};
            state.allPapers.forEach(function (p) {
                if (p.category) catSet[p.category] = true;
            });
            categories = Object.keys(catSet).sort();

            var matrix = {};
            state.filteredPapers.forEach(function (p) {
                var r = normalizeRepr(p.representation);
                var c = p.category;
                if (!c) return;
                matrix[r + '||' + c] = (matrix[r + '||' + c] || 0) + 1;
            });

            var heatData = [];
            var maxVal = 0;
            reprs.forEach(function (r, ri) {
                categories.forEach(function (c, ci) {
                    var val = matrix[r + '||' + c] || 0;
                    heatData.push([ci, ri, val]);
                    if (val > maxVal) maxVal = val;
                });
            });

            heatmapChart.setOption({
                visualMap: { max: maxVal || 1 },
                series: [{ data: heatData }]
            });
        }

        // --- Stacked chart: update from filtered ---
        if (stackedChart) {
            var categories = [];
            var catSet = {};
            state.allPapers.forEach(function (p) {
                if (p.category) catSet[p.category] = true;
            });
            categories = Object.keys(catSet).sort();
            var phaseKeys = Object.keys(PHASE_COLORS);

            var matrix = {};
            state.filteredPapers.forEach(function (p) {
                var c = p.category;
                var ph = p.phase;
                if (!c || !ph) return;
                matrix[c + '||' + ph] = (matrix[c + '||' + ph] || 0) + 1;
            });

            stackedChart.setOption({
                series: phaseKeys.map(function (phase) {
                    return {
                        data: categories.map(function (cat) {
                            return matrix[cat + '||' + phase] || 0;
                        })
                    };
                })
            });
        }

        // --- Sunburst: update from filtered ---
        if (sunburstChart) {
            var catMap = {};
            state.filteredPapers.forEach(function (p) {
                var cat = p.category;
                var method = p.llmMethod;
                if (!cat || !method) return;
                if (!catMap[cat]) catMap[cat] = {};
                catMap[cat][method] = (catMap[cat][method] || 0) + 1;
            });
            var catKeys = Object.keys(catMap).sort();
            var sunData = catKeys.map(function (cat, idx) {
                var children = Object.keys(catMap[cat]).map(function (method) {
                    return { name: method, value: catMap[cat][method] };
                });
                return {
                    name: cat,
                    value: children.reduce(function (s, c) { return s + c.value; }, 0),
                    children: children,
                    itemStyle: { color: PALETTE[idx % PALETTE.length] }
                };
            });
            sunburstChart.setOption({
                series: [{ data: sunData }]
            });
        }
    }

    // =========================================================================
    // Init
    // =========================================================================
    function initCharts() {
        var state = window.appState;
        if (!state || !state.allPapers || state.allPapers.length === 0) return;

        buildPhaseChart(state.allPapers);
        buildMethodChart(state.allPapers);
        buildTrendChart(state.allPapers);
        buildHeatmapChart(state.allPapers);
        buildStackedChart(state.allPapers);
        buildSunburstChart(state.allPapers);

        state.chartsReady = true;
    }

    // Listen for papersLoaded event from app.js
    window.addEventListener('papersLoaded', function () {
        initCharts();
    });

    // Listen for filtersChanged event
    window.addEventListener('filtersChanged', function () {
        if (window.appState.chartsReady) {
            updateHighlights();
        }
    });

    // Listen for language change: dispose and rebuild all charts
    window.addEventListener('langChanged', function () {
        charts.forEach(function (chart) {
            if (chart && !chart.isDisposed()) chart.dispose();
        });
        charts = [];
        phaseChart = null;
        methodChart = null;
        trendChart = null;
        heatmapChart = null;
        stackedChart = null;
        sunburstChart = null;

        if (window.appState && window.appState.allPapers.length > 0) {
            initCharts();
        }
    });

    // Handle window resize
    window.addEventListener('resize', function () {
        charts.forEach(function (chart) {
            if (chart && !chart.isDisposed()) {
                chart.resize();
            }
        });
    });
})();
