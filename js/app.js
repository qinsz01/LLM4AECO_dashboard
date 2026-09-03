(function () {
    'use strict';

    var OPERATION_COLORS = {
        generation_parameterization: '#6e9cff',
        editing_execution: '#f4b860',
        analysis_compliance_diagnosis: '#42c59a',
        retrieval_alignment: '#a58bfa'
    };

    var OPERATION_ICONS = {
        generation_parameterization: 'G',
        editing_execution: 'E',
        analysis_compliance_diagnosis: 'A',
        retrieval_alignment: 'R'
    };

    var state = {
        allPapers: [],
        filteredPapers: [],
        filters: {
            category: null,
            phase: null,
            llmMethod: null,
            representation: null,
            operation: null,
            year: null,
            codingBasis: null,
            search: ''
        },
        currentPage: 1,
        pageSize: 18,
        sort: 'year_desc',
        view: 'grid',
        chartsReady: false
    };

    window.appState = state;

    function escapeHtml(value) {
        if (value === undefined || value === null) return '';
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(String(value)));
        return div.innerHTML;
    }

    function safeUrl(value) {
        if (!value) return '';
        try {
            var url = new URL(value, window.location.href);
            return ['http:', 'https:'].indexOf(url.protocol) !== -1 ? url.href : '';
        } catch (error) {
            return '';
        }
    }

    function truncate(value, length) {
        var text = String(value || '').trim();
        if (text.length <= length) return text;
        return text.slice(0, length - 1).trimEnd() + '…';
    }

    function localizedTask(paper) {
        return I18n.isEn() && paper.taskEn ? paper.taskEn : (paper.task || '');
    }

    function localizedInput(paper) {
        return I18n.isEn() && paper.inputDataEn ? paper.inputDataEn : (paper.inputData || '');
    }

    function operationsOf(paper) {
        return Array.isArray(paper.operations) ? paper.operations : [];
    }

    function basisOf(paper) {
        return paper.operationCodingBasis || paper.codingBasis || 'abstract';
    }

    function searchableText(paper) {
        return [
            paper.title, paper.citation, paper.abstract, paper.contribution,
            paper.methodology, paper.results, paper.task, paper.taskEn,
            paper.inputData, paper.inputDataEn, paper.category, paper.phase,
            paper.representation, paper.llmMethod, paper.operationEvidence,
            paper.journal, paper.url, basisOf(paper)
        ].concat(paper.llmModels || [], paper.keywords || [], operationsOf(paper)).filter(Boolean).join(' ').toLowerCase();
    }

    function matchesFilters(paper, ignoreKey) {
        var f = state.filters;
        if (ignoreKey !== 'category' && f.category && paper.category !== f.category) return false;
        if (ignoreKey !== 'phase' && f.phase && paper.phase !== f.phase) return false;
        if (ignoreKey !== 'llmMethod' && f.llmMethod && paper.llmMethod !== f.llmMethod) return false;
        if (ignoreKey !== 'representation' && f.representation && paper.representation !== f.representation) return false;
        if (ignoreKey !== 'operation' && f.operation && operationsOf(paper).indexOf(f.operation) === -1) return false;
        if (ignoreKey !== 'year' && f.year !== null && Number(paper.year) !== Number(f.year)) return false;
        if (ignoreKey !== 'codingBasis' && f.codingBasis && basisOf(paper) !== f.codingBasis) return false;
        if (ignoreKey !== 'search' && f.search && searchableText(paper).indexOf(f.search.toLowerCase()) === -1) return false;
        return true;
    }

    function sortPapers(papers) {
        return papers.slice().sort(function (a, b) {
            if (state.sort === 'year_asc') return Number(a.year || 0) - Number(b.year || 0) || String(a.title).localeCompare(String(b.title));
            if (state.sort === 'title_asc') return String(a.title || '').localeCompare(String(b.title || ''));
            if (state.sort === 'operations_desc') return operationsOf(b).length - operationsOf(a).length || Number(b.year || 0) - Number(a.year || 0);
            return Number(b.year || 0) - Number(a.year || 0) || String(a.title).localeCompare(String(b.title));
        });
    }

    function applyFilters(options) {
        options = options || {};
        state.filteredPapers = sortPapers(state.allPapers.filter(function (paper) {
            return matchesFilters(paper);
        }));
        if (!options.keepPage) state.currentPage = 1;
        render();
        if (state.chartsReady) {
            window.dispatchEvent(new CustomEvent('filtersChanged', { detail: state.filteredPapers }));
        }
    }

    function setFilter(key, value) {
        state.filters[key] = state.filters[key] === value ? null : value;
        applyFilters();
    }

    function clearFilters() {
        Object.keys(state.filters).forEach(function (key) {
            state.filters[key] = key === 'search' ? '' : null;
        });
        var input = document.getElementById('search-input');
        if (input) input.value = '';
        applyFilters();
    }

    state.applyFilters = applyFilters;
    state.setFilter = setFilter;
    state.clearFilters = clearFilters;

    window.Dashboard = {
        setFilter: setFilter,
        clearFilters: clearFilters,
        operationColor: function (code) { return OPERATION_COLORS[code] || '#8795a9'; },
        showPaper: showModal
    };

    function render() {
        renderStats();
        renderFilterBar();
        renderOperationCards();
        renderPapers();
        renderPagination();
        syncControls();
        I18n.applyToDOM();
    }

    function renderStats() {
        var assignments = state.allPapers.reduce(function (sum, paper) { return sum + operationsOf(paper).length; }, 0);
        var reviewed = state.allPapers.filter(function (paper) { return basisOf(paper) === 'full_text'; }).length;
        var representations = new Set(state.allPapers.map(function (paper) { return paper.representation; }).filter(Boolean)).size;
        var categories = new Set(state.allPapers.map(function (paper) { return paper.category; }).filter(Boolean)).size;
        document.getElementById('stat-total').textContent = state.allPapers.length;
        document.getElementById('stat-operations').textContent = assignments;
        document.getElementById('stat-reviewed').textContent = reviewed;
        document.getElementById('stat-representations').textContent = representations;
        document.getElementById('stat-categories').textContent = categories;
        document.getElementById('stat-filtered').textContent = state.filteredPapers.length;
        document.getElementById('papers-count').textContent = state.filteredPapers.length;
    }

    function filterDisplayName(key, value) {
        if (key === 'category') return I18n.field('category', value);
        if (key === 'phase') return I18n.field('phase', value);
        if (key === 'llmMethod') return I18n.field('llmMethod', value);
        if (key === 'representation') return I18n.field('representation', value);
        if (key === 'operation') return I18n.field('operation', value);
        if (key === 'codingBasis') return I18n.field('codingBasis', value);
        return String(value);
    }

    function filterLabel(key) {
        var map = {
            category: 'filterCategory', phase: 'filterPhase', llmMethod: 'filterMethod',
            representation: 'filterRepresentation', operation: 'filterOperation',
            year: 'filterYear', codingBasis: 'filterBasis', search: 'filterSearch'
        };
        return I18n.ui(map[key] || key);
    }

    function renderFilterBar() {
        var bar = document.getElementById('filter-bar');
        bar.innerHTML = '';
        Object.keys(state.filters).forEach(function (key) {
            var value = state.filters[key];
            if (value === null || value === '') return;
            var chip = document.createElement('span');
            chip.className = 'filter-chip';
            chip.innerHTML = '<span>' + escapeHtml(filterLabel(key)) + ': ' + escapeHtml(filterDisplayName(key, value)) + '</span>' +
                '<button type="button" aria-label="Remove filter">×</button>';
            chip.querySelector('button').addEventListener('click', function () {
                state.filters[key] = key === 'search' ? '' : null;
                if (key === 'search') document.getElementById('search-input').value = '';
                applyFilters();
            });
            bar.appendChild(chip);
        });
    }

    function renderOperationCards() {
        var container = document.getElementById('operation-cards');
        var base = state.allPapers.filter(function (paper) { return matchesFilters(paper, 'operation'); });
        container.innerHTML = '';
        I18n.operationOrder.forEach(function (code) {
            var count = base.filter(function (paper) { return operationsOf(paper).indexOf(code) !== -1; }).length;
            var share = base.length ? Math.round(count / base.length * 100) : 0;
            var card = document.createElement('button');
            card.type = 'button';
            card.className = 'operation-card' + (state.filters.operation === code ? ' active' : '');
            card.style.setProperty('--op-color', OPERATION_COLORS[code]);
            card.innerHTML =
                '<div class="operation-card-header">' +
                    '<span class="operation-card-icon">' + OPERATION_ICONS[code] + '</span>' +
                    '<span class="operation-card-count"><strong>' + count + '</strong><span>' + share + '% ' + escapeHtml(I18n.ui('operationShare')) + '</span></span>' +
                '</div>' +
                '<h3>' + escapeHtml(I18n.field('operation', code)) + '</h3>' +
                '<p>' + escapeHtml(I18n.operationDefinition(code)) + '</p>';
            card.addEventListener('click', function () { setFilter('operation', code); });
            container.appendChild(card);
        });
    }

    function operationTag(code, clickable) {
        var style = '--op-color:' + OPERATION_COLORS[code];
        var attrs = clickable ? ' data-filter="operation" data-value="' + escapeHtml(code) + '"' : '';
        return '<span class="tag tag-operation" style="' + style + '"' + attrs + '>' + escapeHtml(I18n.field('operation', code)) + '</span>';
    }

    function renderPapers() {
        var grid = document.getElementById('papers-grid');
        grid.classList.toggle('list-view', state.view === 'list');
        grid.innerHTML = '';
        var start = (state.currentPage - 1) * state.pageSize;
        var pageItems = state.filteredPapers.slice(start, start + state.pageSize);
        if (!pageItems.length) {
            grid.innerHTML = '<div class="empty-state">' + escapeHtml(I18n.ui('noResults')) + '</div>';
            return;
        }

        pageItems.forEach(function (paper) {
            var card = document.createElement('article');
            card.className = 'paper-card';
            card.tabIndex = 0;
            card.setAttribute('data-id', paper.id);
            var ops = operationsOf(paper);
            var tags = ops.map(function (code) { return operationTag(code, true); }).join('');
            var evidence = paper.operationEvidence || '';
            card.innerHTML =
                '<div class="card-topline"><span class="card-year">' + escapeHtml(paper.year || '') + '</span>' +
                    '<span class="basis-badge">' + escapeHtml(I18n.field('codingBasis', basisOf(paper))) + '</span></div>' +
                '<div><h3 class="card-title">' + escapeHtml(paper.title) + '</h3><div class="card-citation">' + escapeHtml(paper.citation || paper.journal || '') + '</div></div>' +
                '<div class="card-tags">' +
                    '<span class="tag tag-category" data-filter="category" data-value="' + escapeHtml(paper.category) + '">' + escapeHtml(I18n.field('category', paper.category)) + '</span>' +
                    '<span class="tag tag-representation" data-filter="representation" data-value="' + escapeHtml(paper.representation) + '">' + escapeHtml(I18n.field('representation', paper.representation)) + '</span>' +
                    '<span class="tag tag-method" data-filter="llmMethod" data-value="' + escapeHtml(paper.llmMethod) + '">' + escapeHtml(I18n.field('llmMethod', paper.llmMethod)) + '</span>' +
                '</div>' +
                '<div class="operation-tags">' + (tags || '<span class="tag">' + escapeHtml(I18n.ui('combinationNone')) + '</span>') + '</div>' +
                '<div class="card-task"><span>' + escapeHtml(I18n.ui('taskLabel')) + '</span><strong>' + escapeHtml(localizedTask(paper)) + '</strong></div>' +
                (evidence ? '<div class="evidence-preview"><strong>' + escapeHtml(I18n.ui('evidenceLabel')) + ':</strong> ' + escapeHtml(truncate(evidence, state.view === 'list' ? 220 : 165)) + '</div>' : '') +
                '<div class="card-footer"><span>' + escapeHtml(paper.journal || localizedInput(paper) || '') + '</span><span class="card-link">' + escapeHtml(I18n.ui('viewDetails')) + ' →</span></div>';

            card.addEventListener('click', function () { showModal(paper.id); });
            card.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    showModal(paper.id);
                }
            });
            card.querySelectorAll('[data-filter]').forEach(function (tag) {
                tag.addEventListener('click', function (event) {
                    event.stopPropagation();
                    setFilter(tag.getAttribute('data-filter'), tag.getAttribute('data-value'));
                });
            });
            grid.appendChild(card);
        });
    }

    function buildPageNumbers(current, total) {
        if (total <= 7) return Array.from({ length: total }, function (_, index) { return index + 1; });
        var pages = [1];
        if (current > 3) pages.push('…');
        for (var page = Math.max(2, current - 1); page <= Math.min(total - 1, current + 1); page += 1) pages.push(page);
        if (current < total - 2) pages.push('…');
        pages.push(total);
        return pages;
    }

    function renderPagination() {
        var container = document.getElementById('pagination');
        container.innerHTML = '';
        var totalPages = Math.ceil(state.filteredPapers.length / state.pageSize);
        if (totalPages <= 1) return;

        function addButton(label, page, disabled, active) {
            var button = document.createElement('button');
            button.type = 'button';
            button.textContent = label;
            button.disabled = disabled;
            if (active) button.className = 'active';
            button.addEventListener('click', function () {
                state.currentPage = page;
                renderPapers();
                renderPagination();
                document.querySelector('.papers-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
            container.appendChild(button);
        }

        addButton(I18n.ui('prev'), Math.max(1, state.currentPage - 1), state.currentPage === 1, false);
        buildPageNumbers(state.currentPage, totalPages).forEach(function (item) {
            if (item === '…') {
                var span = document.createElement('span');
                span.className = 'ellipsis'; span.textContent = item; container.appendChild(span);
            } else {
                addButton(String(item), item, false, item === state.currentPage);
            }
        });
        addButton(I18n.ui('next'), Math.min(totalPages, state.currentPage + 1), state.currentPage === totalPages, false);
    }

    function modalMeta(label, value) {
        if (!value) return '';
        return '<div class="meta-item"><span>' + escapeHtml(label) + '</span><strong>' + escapeHtml(value) + '</strong></div>';
    }

    function modalSection(title, value) {
        if (!value) return '';
        return '<section class="modal-section"><h3>' + escapeHtml(title) + '</h3><p>' + escapeHtml(value) + '</p></section>';
    }

    function showModal(paperId) {
        var paper = state.allPapers.find(function (item) { return item.id === paperId; });
        if (!paper) return;
        var content = document.getElementById('modal-content');
        var url = safeUrl(paper.url || paper.sourceUrl);
        var ops = operationsOf(paper);
        content.innerHTML =
            '<div class="modal-eyebrow">' + escapeHtml(I18n.ui('modalPaperRecord')) + '</div>' +
            '<h2 id="modal-title">' + escapeHtml(paper.title) + '</h2>' +
            '<p class="modal-citation">' + escapeHtml(paper.citation || paper.journal || '') + '</p>' +
            '<div class="modal-operations">' + ops.map(function (code) { return operationTag(code, false); }).join('') + '</div>' +
            '<div class="modal-meta-grid">' +
                modalMeta(I18n.ui('modalYear'), paper.year) +
                modalMeta(I18n.ui('modalCategory'), I18n.field('category', paper.category)) +
                modalMeta(I18n.ui('modalTask'), localizedTask(paper)) +
                modalMeta(I18n.ui('modalPhase'), I18n.field('phase', paper.phase)) +
                modalMeta(I18n.ui('modalRepresentation'), I18n.field('representation', paper.representation)) +
                modalMeta(I18n.ui('modalMethod'), I18n.field('llmMethod', paper.llmMethod)) +
                modalMeta(I18n.ui('modalInputData'), localizedInput(paper)) +
                modalMeta(I18n.ui('modalCodingBasis'), I18n.field('codingBasis', basisOf(paper))) +
            '</div>' +
            (paper.operationEvidence ? '<div class="evidence-box"><h3>' + escapeHtml(I18n.ui('modalOperationEvidence')) + '</h3><p>' + escapeHtml(paper.operationEvidence) + '</p></div>' : '') +
            '<div class="modal-actions">' +
                (url ? '<a class="button button-primary" href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(I18n.ui('openDOI')) + '</a>' : '') +
                '<a class="button button-secondary" href="paper.html?id=' + encodeURIComponent(paper.id) + '">' + escapeHtml(I18n.ui('openDetail')) + '</a>' +
            '</div>' +
            modalSection(I18n.ui('modalContribution'), I18n.isZh() ? (paper.contribution || paper.abstract) : (paper.abstract || paper.contribution)) +
            modalSection(I18n.ui('modalAbstract'), paper.abstract) +
            modalSection(I18n.ui('modalMethodology'), paper.methodology) +
            modalSection(I18n.ui('modalResults'), paper.results);

        var overlay = document.getElementById('modal-overlay');
        overlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
        document.getElementById('modal-close').focus();
    }

    function hideModal() {
        document.getElementById('modal-overlay').classList.remove('visible');
        document.body.style.overflow = '';
    }

    function syncControls() {
        var sort = document.getElementById('sort-select');
        if (sort) sort.value = state.sort;
        var gridButton = document.getElementById('view-grid');
        var listButton = document.getElementById('view-list');
        if (gridButton && listButton) {
            gridButton.classList.toggle('active', state.view === 'grid');
            listButton.classList.toggle('active', state.view === 'list');
            gridButton.setAttribute('aria-pressed', state.view === 'grid');
            listButton.setAttribute('aria-pressed', state.view === 'list');
        }
    }

    function bindEvents() {
        var searchInput = document.getElementById('search-input');
        var timer = null;
        searchInput.addEventListener('input', function () {
            clearTimeout(timer);
            timer = setTimeout(function () {
                state.filters.search = searchInput.value.trim();
                applyFilters();
            }, 220);
        });
        document.getElementById('clear-filters').addEventListener('click', clearFilters);
        document.getElementById('lang-toggle').addEventListener('click', function () { I18n.toggle(); });
        document.getElementById('sort-select').addEventListener('change', function (event) {
            state.sort = event.target.value;
            applyFilters();
        });
        document.getElementById('view-grid').addEventListener('click', function () { state.view = 'grid'; renderPapers(); syncControls(); });
        document.getElementById('view-list').addEventListener('click', function () { state.view = 'list'; renderPapers(); syncControls(); });
        document.getElementById('modal-close').addEventListener('click', hideModal);
        document.getElementById('modal-overlay').addEventListener('click', function (event) {
            if (event.target === event.currentTarget) hideModal();
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') hideModal();
        });
        document.querySelectorAll('.tab-button').forEach(function (button) {
            button.addEventListener('click', function () {
                var tab = button.getAttribute('data-tab');
                document.querySelectorAll('.tab-button').forEach(function (item) {
                    var active = item === button;
                    item.classList.toggle('active', active);
                    item.setAttribute('aria-selected', active);
                });
                document.querySelectorAll('.tab-panel').forEach(function (panel) {
                    var active = panel.getAttribute('data-panel') === tab;
                    panel.classList.toggle('active', active);
                    panel.hidden = !active;
                });
                window.dispatchEvent(new Event('resize'));
            });
        });
        window.addEventListener('langChanged', function () { applyFilters({ keepPage: true }); });
    }

    function loadPapers() {
        return fetch('data/index.json')
            .then(function (response) {
                if (!response.ok) throw new Error('Failed to load data/index.json');
                return response.json();
            })
            .then(function (index) {
                return Promise.all(index.map(function (entry) {
                    return fetch('data/' + entry.file)
                        .then(function (response) {
                            if (!response.ok) throw new Error('Failed to load ' + entry.file);
                            return response.json();
                        })
                        .catch(function () {
                            return Object.assign({ operations: [], operationEvidence: '' }, entry);
                        });
                }));
            });
    }

    function init() {
        bindEvents();
        loadPapers().then(function (papers) {
            state.allPapers = papers;
            state.filteredPapers = sortPapers(papers);
            render();
            window.dispatchEvent(new CustomEvent('papersLoaded', { detail: papers }));
        }).catch(function (error) {
            console.error(error);
            document.getElementById('papers-grid').innerHTML = '<div class="empty-state">' + escapeHtml(error.message) + '</div>';
        });
    }

    document.addEventListener('DOMContentLoaded', init);
})();
