(function () {
    'use strict';

    var charts = {};
    var TEXT = '#e8edf7';
    var MUTED = '#9aa8bd';
    var GRID = '#2a3550';
    var CARD = '#151d2f';

    function syncThemePalette() {
        var styles = getComputedStyle(document.documentElement);
        TEXT = styles.getPropertyValue('--chart-text').trim() || '#e8edf7';
        MUTED = styles.getPropertyValue('--chart-muted').trim() || '#9aa8bd';
        GRID = styles.getPropertyValue('--chart-grid').trim() || '#2a3550';
        CARD = styles.getPropertyValue('--chart-card').trim() || '#151d2f';
    }
    var REPRESENTATION_ORDER = ['文本', '结构化', '多模态', '图结构', '学习/工程化编码'];
    var REPRESENTATION_COLORS = {
        '文本': '#94a3b8',
        '结构化': '#38bdf8',
        '多模态': '#f472b6',
        '图结构': '#a78bfa',
        '学习/工程化编码': '#a3e635'
    };
    var TASK_COLORS = ['#5b8def', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#64748b'];

    function state() {
        return window.appState;
    }

    function selectedPapers() {
        var app = state();
        return app && app.filteredPapers ? app.filteredPapers : [];
    }

    function countBy(papers, key) {
        var counts = {};
        papers.forEach(function (paper) {
            var value = paper[key];
            if (value === null || value === undefined || value === '') return;
            counts[value] = (counts[value] || 0) + 1;
        });
        return counts;
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

    function percentage(value, total) {
        return total ? (value / total * 100).toFixed(1) + '%' : '0.0%';
    }

    function setFilter(key, value) {
        var app = state();
        if (app && typeof app.setFilter === 'function') app.setFilter(key, value);
    }

    function renderTaskDistribution(papers) {
        var chart = getChart('chart-task');
        if (!chart) return;
        var counts = countBy(papers, 'category');
        var categories = Object.keys(counts).sort(function (a, b) {
            return counts[b] - counts[a] || String(a).localeCompare(String(b));
        });
        var total = papers.length;

        chart.setOption({
            animationDuration: 300,
            tooltip: Object.assign(baseTooltip(), {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: function (params) {
                    var item = params[0];
                    var category = categories[item.dataIndex];
                    return '<strong>' + I18n.field('category', category) + '</strong><br>' +
                        I18n.ui('chartCount') + ': ' + item.value + '<br>' +
                        I18n.ui('chartShare') + ': ' + percentage(item.value, total);
                }
            }),
            grid: { left: 8, right: 48, top: 6, bottom: 8, containLabel: true },
            xAxis: {
                type: 'value',
                minInterval: 1,
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: { color: MUTED, fontSize: 9 },
                splitLine: { lineStyle: { color: GRID } }
            },
            yAxis: {
                type: 'category',
                inverse: true,
                data: categories,
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: {
                    color: MUTED,
                    fontSize: 9,
                    width: I18n.isZh() ? 92 : 130,
                    overflow: 'truncate',
                    formatter: function (value) { return I18n.field('category', value); }
                }
            },
            series: [{
                type: 'bar',
                barMaxWidth: 15,
                data: categories.map(function (category, index) {
                    return {
                        value: counts[category],
                        itemStyle: {
                            color: TASK_COLORS[index % TASK_COLORS.length],
                            borderRadius: [0, 4, 4, 0]
                        }
                    };
                }),
                label: {
                    show: true,
                    position: 'right',
                    color: TEXT,
                    fontSize: 9,
                    formatter: function (params) { return params.value; }
                }
            }]
        }, true);

        chart.off('click');
        chart.on('click', function (params) {
            if (params.componentType === 'series') setFilter('category', categories[params.dataIndex]);
        });
    }

    function renderRepresentationDistribution(papers) {
        var chart = getChart('chart-representation');
        if (!chart) return;
        var counts = countBy(papers, 'representation');
        var total = papers.length;

        chart.setOption({
            animationDuration: 300,
            tooltip: Object.assign(baseTooltip(), {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: function (params) {
                    var item = params[0];
                    var representation = REPRESENTATION_ORDER[item.dataIndex];
                    return '<strong>' + I18n.field('representation', representation) + '</strong><br>' +
                        I18n.ui('chartCount') + ': ' + item.value + '<br>' +
                        I18n.ui('chartShare') + ': ' + percentage(item.value, total);
                }
            }),
            grid: { left: 8, right: 56, top: 8, bottom: 8, containLabel: true },
            xAxis: {
                type: 'value',
                minInterval: 1,
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: { color: MUTED, fontSize: 9 },
                splitLine: { lineStyle: { color: GRID } }
            },
            yAxis: {
                type: 'category',
                inverse: true,
                data: REPRESENTATION_ORDER,
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: {
                    color: MUTED,
                    fontSize: 10,
                    width: I18n.isZh() ? 100 : 145,
                    overflow: 'truncate',
                    formatter: function (value) { return I18n.field('representation', value); }
                }
            },
            series: [{
                type: 'bar',
                barMaxWidth: 22,
                data: REPRESENTATION_ORDER.map(function (representation) {
                    return {
                        value: counts[representation] || 0,
                        itemStyle: {
                            color: REPRESENTATION_COLORS[representation],
                            borderRadius: [0, 5, 5, 0]
                        }
                    };
                }),
                label: {
                    show: true,
                    position: 'right',
                    color: TEXT,
                    fontSize: 10,
                    formatter: function (params) {
                        return params.value + ' · ' + percentage(params.value, total);
                    }
                }
            }]
        }, true);

        chart.off('click');
        chart.on('click', function (params) {
            if (params.componentType === 'series') setFilter('representation', REPRESENTATION_ORDER[params.dataIndex]);
        });
    }

    function patchExistingHeatmap(id, kind) {
        var element = document.getElementById(id);
        if (!element || !window.echarts) return;
        var chart = echarts.getInstanceByDom(element);
        if (!chart) return;

        var isRepresentationOperation = kind === 'representation-operation';
        var colors = isRepresentationOperation
            ? ['#182237', '#304f7d', '#5b8def', '#8eaef5']
            : ['#182237', '#274f4a', '#10b981', '#6ee7b7'];

        chart.setOption({
            visualMap: {
                show: false,
                type: 'continuous',
                min: 0,
                max: 1,
                dimension: 2,
                calculable: false,
                inRange: { color: colors }
            },
            grid: {
                left: 10,
                right: 12,
                top: 8,
                bottom: isRepresentationOperation ? 52 : (I18n.isZh() ? 74 : 92),
                containLabel: true
            }
        });
    }

    function patchMethodChart() {
        var element = document.getElementById('chart-method');
        if (!element || !window.echarts) return;
        var chart = echarts.getInstanceByDom(element);
        if (!chart) return;
        chart.setOption({
            grid: {
                left: I18n.isZh() ? 105 : 142,
                right: 44,
                top: 10,
                bottom: 28
            }
        });
    }

    function renderAll() {
        syncThemePalette();
        var papers = selectedPapers();
        renderTaskDistribution(papers);
        renderRepresentationDistribution(papers);
        window.requestAnimationFrame(function () {
            patchMethodChart();
            patchExistingHeatmap('chart-repr-operation', 'representation-operation');
            patchExistingHeatmap('chart-operation-task', 'operation-task');
        });
    }

    function setupSectionNavigation() {
        var links = Array.prototype.slice.call(document.querySelectorAll('.dashboard-nav a[href^="#"]'));
        if (!links.length) return;
        var sections = links.map(function (link) {
            return document.querySelector(link.getAttribute('href'));
        }).filter(Boolean);

        function activate(id) {
            links.forEach(function (link) {
                var active = link.getAttribute('href') === '#' + id;
                link.classList.toggle('active', active);
                if (active) link.setAttribute('aria-current', 'location');
                else link.removeAttribute('aria-current');
            });
        }

        links.forEach(function (link) {
            link.addEventListener('click', function () {
                activate(link.getAttribute('href').slice(1));
            });
        });

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function (entries) {
                var visible = entries.filter(function (entry) { return entry.isIntersecting; })
                    .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });
                if (visible.length) activate(visible[0].target.id);
            }, { rootMargin: '-90px 0px -62% 0px', threshold: [0.08, 0.25, 0.5] });
            sections.forEach(function (section) { observer.observe(section); });
        }
        activate('overview');
    }

    window.addEventListener('papersLoaded', renderAll);
    window.addEventListener('filtersChanged', renderAll);
    window.addEventListener('langChanged', renderAll);
    window.addEventListener('themeChanged', renderAll);
    window.addEventListener('resize', function () {
        Object.keys(charts).forEach(function (key) {
            if (charts[key] && !charts[key].isDisposed()) charts[key].resize();
        });
        patchMethodChart();
        patchExistingHeatmap('chart-repr-operation', 'representation-operation');
        patchExistingHeatmap('chart-operation-task', 'operation-task');
    });
    document.addEventListener('DOMContentLoaded', setupSectionNavigation);
})();
