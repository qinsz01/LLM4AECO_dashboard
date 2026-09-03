(function () {
    'use strict';

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
            search: ''
        },
        sort: 'newest',
        currentPage: 1,
        pageSize: 18,
        chartsReady: false,
        openPaperId: null,
        applyFilters: null,
        setFilter: null,
        setFilters: null,
        clearFilters: null,
        scrollToPapers: null
    };

    window.appState = state;

    function escapeHtml(value) {
        if (value === null || value === undefined) return '';
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(String(value)));
        return div.innerHTML;
    }

    function safeUrl(value) {
        if (!value) return '';
        try {
            var url = new URL(value, window.location.href);
            return (url.protocol === 'http:' || url.protocol === 'https:') ? url.href : '';
        } catch (err) {
            return '';
        }
    }

    function uniqueCount(items, key) {
        var seen = {};
        items.forEach(function (item) {
            if (item[key] !== null && item[key] !== undefined && item[key] !== '') {
                seen[item[key]] = true;
            }
        });
        return Object.keys(seen).length;
    }

    function operationClass(operation) {
        var classes = {
            generation_parameterization: 'operation-generation',
            editing_execution: 'operation-editing',
            analysis_compliance_diagnosis: 'operation-analysis',
            retrieval_alignment: 'operation-retrieval'
        };
        return classes[operation] || 'operation-neutral';
    }

    function operationTagHtml(operation, interactive) {
        var meta = I18n.operation(operation);
        var attrs = interactive
            ? ' data-filter="operation" data-value="' + escapeHtml(operation) + '"'
            : '';
        return '<span class="tag tag-operation ' + operationClass(operation) + '"' + attrs + '>' +
            '<span class="operation-tag-code">' + escapeHtml(meta.short) + '</span>' +
            escapeHtml(meta.label) + '</span>';
    }

    function basisLabel(value) {
        return I18n.field('operationCodingBasis', value || 'abstract');
    }

    function matchesFilters(paper, ignoredKey) {
        var f = state.filters;
        if (ignoredKey !== 'category' && f.category !== null && paper.category !== f.category) return false;
        if (ignoredKey !== 'phase' && f.phase !== null && paper.phase !== f.phase) return false;
        if (ignoredKey !== 'llmMethod' && f.llmMethod !== null && paper.llmMethod !== f.llmMethod) return false;
        if (ignoredKey !== 'representation' && f.representation !== null && paper.representation !== f.representation) return false;
        if (ignoredKey !== 'operation' && f.operation !== null && (paper.operations || []).indexOf(f.operation) === -1) return false;
        if (ignoredKey !== 'year' && f.year !== null && Number(paper.year) !== Number(f.year)) return false;

        if (ignoredKey !== 'search' && f.search) {
            var searchLower = f.search.toLowerCase();
            var haystack = [
                paper.title, paper.citation, paper.category, paper.task, paper.taskEn,
                paper.phase, paper.llmMethod, paper.representation,
                paper.contribution, paper.abstract, paper.journal, paper.url, paper.sourceUrl,
                paper.doi, paper.pii, paper.inputData, paper.inputDataEn,
                paper.methodology, paper.results, paper.operationEvidence,
                paper.operationCodingBasis
            ].concat(
                paper.llmModels || [],
                paper.keywords || [],
                paper.operations || []
            ).filter(Boolean).join(' ').toLowerCase();
            if (haystack.indexOf(searchLower) === -1) return false;
        }

        return true;
    }

    function sortPapers(papers) {
        return papers.slice().sort(function (a, b) {
            if (state.sort === 'oldest') {
                return Number(a.year) - Number(b.year) || String(a.title).localeCompare(String(b.title));
            }
            if (state.sort === 'title') {
                return String(a.title).localeCompare(String(b.title));
            }
            return Number(b.year) - Number(a.year) || String(a.title).localeCompare(String(b.title));
        });
    }

    function applyFilters() {
        state.filteredPapers = sortPapers(state.allPapers.filter(function (paper) {
            return matchesFilters(paper, null);
        }));
        state.currentPage = 1;
        render();
        if (state.chartsReady) {
            window.dispatchEvent(new CustomEvent('filtersChanged'));
        }
    }

    function setFilter(key, value) {
        if (!Object.prototype.hasOwnProperty.call(state.filters, key)) return;
        state.filters[key] = state.filters[key] === value ? null : value;
        applyFilters();
    }

    function setFilters(patch) {
        Object.keys(patch || {}).forEach(function (key) {
            if (Object.prototype.hasOwnProperty.call(state.filters, key)) {
                state.filters[key] = patch[key];
            }
        });
        applyFilters();
    }

    function clearAllFilters() {
        Object.keys(state.filters).forEach(function (key) {
            state.filters[key] = key === 'search' ? '' : null;
        });
        var searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';
        applyFilters();
    }

    state.applyFilters = applyFilters;
    state.setFilter = setFilter;
    state.setFilters = setFilters;
    state.clearFilters = clearAllFilters;

    function render() {
        renderStats();
        renderReviewCoverage();
        renderOperationCards();
        renderFilterBar();
        renderPapers();
        renderPagination();
        renderSubtitle();
    }

    function renderSubtitle() {
        var el = document.getElementById('subtitle-text');
        if (!el) return;
        var assignments = state.allPapers.reduce(function (sum, paper) {
            return sum + (paper.operations || []).length;
        }, 0);
        el.textContent = I18n.ui('subtitle', {
            count: state.allPapers.length,
            assignments: assignments
        });
    }

    function renderStats() {
        var selected = state.filteredPapers;
        var assignments = selected.reduce(function (sum, paper) {
            return sum + (paper.operations || []).length;
        }, 0);
        var multiOperation = selected.filter(function (paper) {
            return (paper.operations || []).length > 1;
        }).length;

        document.getElementById('stat-total').textContent = state.allPapers.length;
        document.getElementById('stat-categories').textContent = uniqueCount(state.allPapers, 'category');
        document.getElementById('stat-representations').textContent = uniqueCount(state.allPapers, 'representation');
        document.getElementById('stat-assignments').textContent = assignments;
        document.getElementById('stat-multi').textContent = multiOperation;
        document.getElementById('stat-filtered').textContent = selected.length;
        document.getElementById('papers-count').textContent = selected.length;
    }

    function renderReviewCoverage() {
        var el = document.getElementById('review-coverage');
        if (!el) return;
        var reviewed = state.allPapers.filter(function (paper) {
            return paper.operationCodingBasis === 'full_text';
        }).length;
        el.innerHTML = '<span class="coverage-dot" aria-hidden="true"></span>' +
            escapeHtml(I18n.ui('fullTextCoverage', { reviewed: reviewed, total: state.allPapers.length }));
    }

    function renderOperationCards() {
        var container = document.getElementById('operation-cards');
        if (!container) return;
        container.innerHTML = '';

        var facetPapers = state.allPapers.filter(function (paper) {
            return matchesFilters(paper, 'operation');
        });

        I18n.operationOrder().forEach(function (operation) {
            var meta = I18n.operation(operation);
            var count = facetPapers.filter(function (paper) {
                return (paper.operations || []).indexOf(operation) !== -1;
            }).length;
            var share = facetPapers.length ? (count / facetPapers.length * 100).toFixed(1) : '0.0';
            var active = state.filters.operation === operation;
            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'operation-card ' + operationClass(operation) + (active ? ' active' : '');
            button.setAttribute('aria-pressed', active ? 'true' : 'false');
            button.innerHTML =
                '<div class="operation-card-top">' +
                    '<span class="operation-code">' + escapeHtml(meta.short) + '</span>' +
                    '<span class="operation-count">' + count + '</span>' +
                '</div>' +
                '<h3>' + escapeHtml(meta.label) + '</h3>' +
                '<p>' + escapeHtml(meta.description) + '</p>' +
                '<div class="operation-card-footer">' +
                    '<span>' + share + '%</span>' +
                    '<span>' + escapeHtml(I18n.ui('clickToFilter')) + '</span>' +
                '</div>';
            button.addEventListener('click', function () {
                setFilter('operation', operation);
            });
            container.appendChild(button);
        });
    }

    function renderFilterBar() {
        var bar = document.getElementById('filter-bar');
        bar.innerHTML = '';
        var f = state.filters;
        var items = [
            { key: 'category', label: I18n.ui('filterCategory'), value: f.category, field: 'category' },
            { key: 'phase', label: I18n.ui('filterPhase'), value: f.phase, field: 'phase' },
            { key: 'llmMethod', label: I18n.ui('filterMethod'), value: f.llmMethod, field: 'llmMethod' },
            { key: 'representation', label: I18n.ui('filterRepr'), value: f.representation, field: 'representation' },
            { key: 'operation', label: I18n.ui('filterOperation'), value: f.operation, field: 'operation' },
            { key: 'year', label: I18n.ui('filterYear'), value: f.year, field: null }
        ];

        items.forEach(function (item) {
            if (item.value === null || item.value === '') return;
            var displayValue = item.field ? I18n.field(item.field, item.value) : String(item.value);
            var tag = document.createElement('button');
            tag.type = 'button';
            tag.className = 'filter-tag active';
            tag.innerHTML = '<span>' + escapeHtml(item.label) + ': ' + escapeHtml(displayValue) + '</span>' +
                '<span class="remove" aria-hidden="true">×</span>';
            tag.addEventListener('click', function () {
                setFilter(item.key, null);
            });
            bar.appendChild(tag);
        });

        if (f.search) {
            var searchTag = document.createElement('button');
            searchTag.type = 'button';
            searchTag.className = 'filter-tag active';
            searchTag.innerHTML = '<span>' + escapeHtml(I18n.ui('filterSearch')) + ': ' + escapeHtml(f.search) + '</span>' +
                '<span class="remove" aria-hidden="true">×</span>';
            searchTag.addEventListener('click', function () {
                state.filters.search = '';
                document.getElementById('search-input').value = '';
                applyFilters();
            });
            bar.appendChild(searchTag);
        }
    }

    function paperSummary(paper) {
        if (I18n.isZh() && paper.contribution) return paper.contribution;
        return paper.abstract || paper.contribution || '';
    }

    function renderPapers() {
        var grid = document.getElementById('papers-grid');
        grid.innerHTML = '';
        var start = (state.currentPage - 1) * state.pageSize;
        var pageItems = state.filteredPapers.slice(start, start + state.pageSize);

        if (!pageItems.length) {
            grid.innerHTML = '<div class="empty-state">' + escapeHtml(I18n.ui('noResults')) + '</div>';
            return;
        }

        pageItems.forEach(function (paper) {
            var operations = paper.operations || [];
            var card = document.createElement('article');
            card.className = 'paper-card';
            card.setAttribute('data-id', paper.id);
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');

            var operationTags = operations.length
                ? operations.map(function (operation) { return operationTagHtml(operation, true); }).join('')
                : '<span class="tag tag-operation operation-neutral">' + escapeHtml(I18n.ui('chartNoOperation')) + '</span>';

            card.innerHTML =
                '<div class="card-heading">' +
                    '<h3 class="card-title">' + escapeHtml(paper.title) + '</h3>' +
                    '<span class="card-year">' + escapeHtml(paper.year) + '</span>' +
                '</div>' +
                '<div class="card-citation">' + escapeHtml(paper.citation) +
                    (paper.journal ? ' · ' + escapeHtml(paper.journal) : '') + '</div>' +
                '<div class="card-tags card-context-tags">' +
                    '<span class="tag tag-phase" data-filter="phase" data-value="' + escapeHtml(paper.phase) + '">' + escapeHtml(I18n.field('phase', paper.phase)) + '</span>' +
                    '<span class="tag tag-category" data-filter="category" data-value="' + escapeHtml(paper.category) + '">' + escapeHtml(I18n.field('category', paper.category)) + '</span>' +
                    '<span class="tag tag-method" data-filter="llmMethod" data-value="' + escapeHtml(paper.llmMethod) + '">' + escapeHtml(I18n.field('llmMethod', paper.llmMethod)) + '</span>' +
                    '<span class="tag tag-repr" data-filter="representation" data-value="' + escapeHtml(paper.representation) + '">' + escapeHtml(I18n.field('representation', paper.representation)) + '</span>' +
                '</div>' +
                '<div class="card-operation-tags">' + operationTags + '</div>' +
                '<p class="card-summary">' + escapeHtml(paperSummary(paper)) + '</p>' +
                '<div class="card-evidence">' +
                    '<span class="card-evidence-label">' + escapeHtml(I18n.ui('evidenceLabel')) + '</span>' +
                    '<span>' + escapeHtml(paper.operationEvidence || '') + '</span>' +
                '</div>' +
                '<div class="card-footer">' +
                    '<span class="review-basis"><span class="review-check" aria-hidden="true">✓</span>' + escapeHtml(basisLabel(paper.operationCodingBasis)) + '</span>' +
                    '<span class="card-open" aria-hidden="true">↗</span>' +
                '</div>';

            card.addEventListener('click', function () { showModal(paper.id); });
            card.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    showModal(paper.id);
                }
            });

            card.querySelectorAll('[data-filter]').forEach(function (tagEl) {
                tagEl.addEventListener('click', function (event) {
                    event.stopPropagation();
                    setFilter(tagEl.getAttribute('data-filter'), tagEl.getAttribute('data-value'));
                });
                tagEl.addEventListener('keydown', function (event) {
                    event.stopPropagation();
                });
            });

            grid.appendChild(card);
        });
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
                scrollToPapers();
            });
            container.appendChild(button);
        }

        addButton(I18n.ui('prev'), Math.max(1, state.currentPage - 1), state.currentPage === 1, false);
        buildPageNumbers(state.currentPage, totalPages).forEach(function (page) {
            if (page === '…') {
                var ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = page;
                container.appendChild(ellipsis);
            } else {
                addButton(String(page), page, false, page === state.currentPage);
            }
        });
        addButton(I18n.ui('next'), Math.min(totalPages, state.currentPage + 1), state.currentPage === totalPages, false);
    }

    function buildPageNumbers(current, total) {
        if (total <= 7) {
            var all = [];
            for (var i = 1; i <= total; i++) all.push(i);
            return all;
        }
        var pages = [1];
        if (current > 3) pages.push('…');
        var start = Math.max(2, current - 1);
        var end = Math.min(total - 1, current + 1);
        for (var j = start; j <= end; j++) pages.push(j);
        if (current < total - 2) pages.push('…');
        pages.push(total);
        return pages;
    }

    function scrollToPapers() {
        var section = document.querySelector('.papers-section');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    state.scrollToPapers = scrollToPapers;

    function detailRow(label, value) {
        if (value === null || value === undefined || value === '') return '';
        return '<div class="detail-row"><dt>' + escapeHtml(label) + '</dt><dd>' + escapeHtml(value) + '</dd></div>';
    }

    function detailSection(title, text, open) {
        if (!text) return '';
        return '<details class="modal-detail"' + (open ? ' open' : '') + '>' +
            '<summary>' + escapeHtml(title) + '</summary>' +
            '<p>' + escapeHtml(text) + '</p>' +
        '</details>';
    }

    function showModal(paperId) {
        var paper = state.allPapers.find(function (item) { return item.id === paperId; });
        if (!paper) return;
        state.openPaperId = paperId;

        var content = document.getElementById('modal-content');
        var operations = paper.operations || [];
        var operationTags = operations.length
            ? operations.map(function (operation) { return operationTagHtml(operation, false); }).join('')
            : '<span class="tag tag-operation operation-neutral">' + escapeHtml(I18n.ui('chartNoOperation')) + '</span>';
        var operationDescription = operations.length
            ? ''
            : '<p class="modal-muted">' + escapeHtml(I18n.ui('modalNoOperations')) + '</p>';
        var source = safeUrl(paper.url || paper.sourceUrl);
        var recordUrl = 'paper.html?id=' + encodeURIComponent(paper.id);
        var taskValue = I18n.isEn() && paper.taskEn ? paper.taskEn : paper.task;
        var inputValue = I18n.isEn() && paper.inputDataEn ? paper.inputDataEn : paper.inputData;

        content.innerHTML =
            '<div class="modal-heading">' +
                '<div class="modal-kicker">' + escapeHtml(paper.citation) + (paper.year ? ' · ' + escapeHtml(paper.year) : '') + '</div>' +
                '<h2 id="modal-content-title">' + escapeHtml(paper.title) + '</h2>' +
                '<div class="modal-actions">' +
                    '<a class="button-link button-primary" href="' + recordUrl + '">' + escapeHtml(I18n.ui('modalOpenRecord')) + '</a>' +
                    (source ? '<a class="button-link" href="' + escapeHtml(source) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(I18n.ui('modalOpenSource')) + '</a>' : '') +
                '</div>' +
            '</div>' +
            '<section class="operation-panel">' +
                '<div class="operation-panel-heading">' +
                    '<h3>' + escapeHtml(I18n.ui('modalOperations')) + '</h3>' +
                    '<span class="review-basis review-basis-strong"><span class="review-check" aria-hidden="true">✓</span>' + escapeHtml(basisLabel(paper.operationCodingBasis)) + '</span>' +
                '</div>' +
                '<div class="modal-operation-tags">' + operationTags + '</div>' +
                operationDescription +
                (paper.operationEvidence ? '<div class="operation-evidence"><span>' + escapeHtml(I18n.ui('modalOperationEvidence')) + '</span><p>' + escapeHtml(paper.operationEvidence) + '</p></div>' : '') +
            '</section>' +
            '<div class="modal-info-grid">' +
                '<section class="modal-info-card"><h3>' + escapeHtml(I18n.ui('modalStudySummary')) + '</h3><dl>' +
                    detailRow(I18n.ui('modalJournal'), paper.journal) +
                    detailRow(I18n.ui('modalCategory'), I18n.field('category', paper.category)) +
                    detailRow(I18n.ui('modalTask'), taskValue) +
                    detailRow(I18n.ui('modalPhase'), I18n.field('phase', paper.phase)) +
                '</dl></section>' +
                '<section class="modal-info-card"><h3>' + escapeHtml(I18n.ui('modalInputData')) + '</h3><dl>' +
                    detailRow(I18n.ui('modalInputData'), inputValue) +
                    detailRow(I18n.ui('modalRepr'), I18n.field('representation', paper.representation)) +
                    detailRow(I18n.ui('modalMethod'), I18n.field('llmMethod', paper.llmMethod)) +
                    detailRow(I18n.ui('modalCodingBasis'), basisLabel(paper.operationCodingBasis)) +
                '</dl></section>' +
            '</div>' +
            '<div class="modal-details-stack">' +
                detailSection(I18n.ui('modalAbstract'), paper.abstract, true) +
                detailSection(I18n.ui('modalMethodology'), paper.methodology, false) +
                detailSection(I18n.ui('modalResults'), paper.results, false) +
                detailSection(I18n.ui('modalContribution'), paper.contribution, false) +
            '</div>' +
            (paper.llmModels && paper.llmModels.length ? '<div class="modal-list"><strong>' + escapeHtml(I18n.ui('modalModels')) + '</strong><span>' + escapeHtml(paper.llmModels.join(', ')) + '</span></div>' : '') +
            (paper.keywords && paper.keywords.length ? '<div class="modal-list"><strong>' + escapeHtml(I18n.ui('modalKeywords')) + '</strong><span>' + escapeHtml(paper.keywords.join(', ')) + '</span></div>' : '');

        var overlay = document.getElementById('modal-overlay');
        overlay.classList.add('visible');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        document.getElementById('modal-close').focus();
    }

    function hideModal() {
        state.openPaperId = null;
        var overlay = document.getElementById('modal-overlay');
        overlay.classList.remove('visible');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function bindEvents() {
        var searchInput = document.getElementById('search-input');
        var searchTimer = null;
        searchInput.addEventListener('input', function () {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(function () {
                state.filters.search = searchInput.value.trim();
                applyFilters();
            }, 250);
        });

        document.getElementById('clear-filters').addEventListener('click', clearAllFilters);
        document.getElementById('lang-toggle').addEventListener('click', function () { I18n.toggle(); });
        document.getElementById('sort-select').addEventListener('change', function (event) {
            state.sort = event.target.value;
            applyFilters();
        });
        document.getElementById('modal-close').addEventListener('click', hideModal);
        document.getElementById('modal-overlay').addEventListener('click', function (event) {
            if (event.target === event.currentTarget) hideModal();
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') hideModal();
        });
        window.addEventListener('langChanged', function () {
            I18n.applyToDOM();
            render();
            if (state.openPaperId) showModal(state.openPaperId);
        });
    }

    function init() {
        I18n.applyToDOM();
        fetch('data/index.json')
            .then(function (response) {
                if (!response.ok) throw new Error('Failed to load index.json');
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
                            return {
                                id: entry.id,
                                title: entry.title,
                                year: entry.year,
                                category: entry.category,
                                phase: entry.phase,
                                llmMethod: entry.llmMethod,
                                representation: entry.representation,
                                operations: [],
                                operationEvidence: '',
                                operationCodingBasis: '',
                                citation: '',
                                task: '',
                                contribution: ''
                            };
                        });
                }));
            })
            .then(function (papers) {
                state.allPapers = papers;
                state.filteredPapers = sortPapers(papers);
                bindEvents();
                render();
                window.dispatchEvent(new CustomEvent('papersLoaded'));
            })
            .catch(function (error) {
                console.error('Init failed:', error);
                document.getElementById('papers-grid').innerHTML = '<div class="empty-state">' + escapeHtml(I18n.ui('errorMessage')) + '</div>';
            });
    }

    document.addEventListener('DOMContentLoaded', init);
})();
