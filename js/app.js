(function () {
    'use strict';

    // =========================================================================
    // State
    // =========================================================================
    var state = {
        allPapers: [],
        filteredPapers: [],
        filters: {
            category: null,
            phase: null,
            llmMethod: null,
            representation: null,
            year: null,
            search: ''
        },
        currentPage: 1,
        pageSize: 18,
        chartsReady: false,
        applyFilters: null // assigned below after function declaration
    };

    // Expose for charts.js
    window.appState = state;

    // =========================================================================
    // Utility
    // =========================================================================
    function escapeHtml(str) {
        if (typeof str !== 'string') return '';
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // =========================================================================
    // Filtering
    // =========================================================================
    function applyFilters() {
        var f = state.filters;
        var searchLower = f.search ? f.search.toLowerCase() : '';

        state.filteredPapers = state.allPapers.filter(function (p) {
            if (f.category !== null && p.category !== f.category) return false;
            if (f.phase !== null && p.phase !== f.phase) return false;
            if (f.llmMethod !== null && p.llmMethod !== f.llmMethod) return false;
            if (f.representation !== null && p.representation !== f.representation) return false;
            if (f.year !== null && p.year !== f.year) return false;

            if (searchLower) {
                var haystack = [
                    p.title, p.citation, p.category, p.task,
                    p.phase, p.llmMethod, p.contribution
                ].filter(Boolean).join(' ').toLowerCase();
                if (haystack.indexOf(searchLower) === -1) return false;
            }

            return true;
        });

        state.currentPage = 1;
        render();

        if (state.chartsReady) {
            window.dispatchEvent(new CustomEvent('filtersChanged'));
        }
    }

    // Wire up the state reference
    state.applyFilters = applyFilters;

    function setFilter(key, value) {
        if (state.filters[key] === value) {
            state.filters[key] = null;
        } else {
            state.filters[key] = value;
        }
        applyFilters();
    }

    function clearAllFilters() {
        state.filters.category = null;
        state.filters.phase = null;
        state.filters.llmMethod = null;
        state.filters.representation = null;
        state.filters.year = null;
        state.filters.search = '';
        document.getElementById('search-input').value = '';
        applyFilters();
    }

    // =========================================================================
    // Render helpers
    // =========================================================================
    function render() {
        renderStats();
        renderFilterBar();
        renderPapers();
        renderPagination();
    }

    function renderStats() {
        document.getElementById('stat-total').textContent = state.allPapers.length;
        document.getElementById('stat-filtered').textContent = state.filteredPapers.length;
        document.getElementById('papers-count').textContent = state.filteredPapers.length;
        var el = document.getElementById('subtitle-count');
        if (el) el.textContent = state.allPapers.length;
    }

    function renderFilterBar() {
        var bar = document.getElementById('filter-bar');
        bar.innerHTML = '';

        var f = state.filters;
        var items = [
            { key: 'category', label: I18n.ui('filterCategory'), value: f.category },
            { key: 'phase', label: I18n.ui('filterPhase'), value: f.phase },
            { key: 'llmMethod', label: I18n.ui('filterMethod'), value: f.llmMethod },
            { key: 'representation', label: I18n.ui('filterRepr'), value: f.representation },
            { key: 'year', label: I18n.ui('filterYear'), value: f.year }
        ];

        items.forEach(function (item) {
            if (item.value === null || item.value === '') return;

            var displayValue = I18n.field(item.key, item.value) || String(item.value);

            var tag = document.createElement('span');
            tag.className = 'filter-tag active';
            tag.innerHTML = escapeHtml(item.label) + ': ' + escapeHtml(displayValue) +
                ' <span class="remove">&times;</span>';

            tag.addEventListener('click', function () {
                setFilter(item.key, null);
            });

            bar.appendChild(tag);
        });

        if (f.search) {
            var searchTag = document.createElement('span');
            searchTag.className = 'filter-tag active';
            searchTag.innerHTML = escapeHtml(I18n.ui('filterSearch')) + ': ' + escapeHtml(f.search) +
                ' <span class="remove">&times;</span>';
            searchTag.addEventListener('click', function () {
                state.filters.search = '';
                document.getElementById('search-input').value = '';
                applyFilters();
            });
            bar.appendChild(searchTag);
        }
    }

    function renderPapers() {
        var grid = document.getElementById('papers-grid');
        grid.innerHTML = '';

        var start = (state.currentPage - 1) * state.pageSize;
        var pageItems = state.filteredPapers.slice(start, start + state.pageSize);

        if (pageItems.length === 0) {
            grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;padding:40px 0;">' + escapeHtml(I18n.ui('noResults')) + '</p>';
            return;
        }

        pageItems.forEach(function (paper) {
            var card = document.createElement('div');
            card.className = 'paper-card';
            card.setAttribute('data-id', paper.id);

            var contributionText = I18n.isZh()
                ? escapeHtml(paper.contribution)
                : escapeHtml(paper.abstract ? paper.abstract.substring(0, 200) + (paper.abstract.length > 200 ? '...' : '') : '');

            card.innerHTML =
                '<div class="card-title">' + escapeHtml(paper.title) + '</div>' +
                '<div class="card-citation">' + escapeHtml(paper.citation) + '</div>' +
                '<div class="card-tags">' +
                    '<span class="tag tag-phase" data-filter="phase" data-value="' + escapeHtml(paper.phase) + '">' + escapeHtml(I18n.field('phase', paper.phase)) + '</span>' +
                    '<span class="tag tag-category" data-filter="category" data-value="' + escapeHtml(paper.category) + '">' + escapeHtml(I18n.field('category', paper.category)) + '</span>' +
                    '<span class="tag tag-method" data-filter="llmMethod" data-value="' + escapeHtml(paper.llmMethod) + '">' + escapeHtml(I18n.field('llmMethod', paper.llmMethod)) + '</span>' +
                    '<span class="tag tag-repr" data-filter="representation" data-value="' + escapeHtml(paper.representation) + '">' + escapeHtml(I18n.field('representation', paper.representation)) + '</span>' +
                '</div>' +
                '<div class="card-contribution">' + contributionText + '</div>';

            // Card click -> open modal
            card.addEventListener('click', function () {
                showModal(paper.id);
            });

            // Tag clicks -> set filter (stop propagation)
            card.querySelectorAll('.tag').forEach(function (tagEl) {
                tagEl.addEventListener('click', function (e) {
                    e.stopPropagation();
                    var key = tagEl.getAttribute('data-filter');
                    var val = tagEl.getAttribute('data-value');
                    setFilter(key, val);
                });
            });

            grid.appendChild(card);
        });
    }

    function renderPagination() {
        var container = document.getElementById('pagination');
        container.innerHTML = '';

        var total = state.filteredPapers.length;
        var totalPages = Math.ceil(total / state.pageSize);
        if (totalPages <= 1) return;

        // Previous button
        var prevBtn = document.createElement('button');
        prevBtn.textContent = I18n.ui('prev');
        prevBtn.disabled = state.currentPage === 1;
        prevBtn.addEventListener('click', function () {
            if (state.currentPage > 1) {
                state.currentPage--;
                renderPapers();
                renderPagination();
                scrollToPapers();
            }
        });
        container.appendChild(prevBtn);

        // Page number buttons (show up to 7 with ellipsis)
        var pages = buildPageNumbers(state.currentPage, totalPages);
        pages.forEach(function (p) {
            if (p === '...') {
                var ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.style.cssText = 'color:var(--text-muted);padding:8px 6px;font-size:0.85rem;';
                container.appendChild(ellipsis);
            } else {
                var btn = document.createElement('button');
                btn.textContent = p;
                if (p === state.currentPage) btn.className = 'active';
                btn.addEventListener('click', function () {
                    state.currentPage = p;
                    renderPapers();
                    renderPagination();
                    scrollToPapers();
                });
                container.appendChild(btn);
            }
        });

        // Next button
        var nextBtn = document.createElement('button');
        nextBtn.textContent = I18n.ui('next');
        nextBtn.disabled = state.currentPage === totalPages;
        nextBtn.addEventListener('click', function () {
            if (state.currentPage < totalPages) {
                state.currentPage++;
                renderPapers();
                renderPagination();
                scrollToPapers();
            }
        });
        container.appendChild(nextBtn);
    }

    function buildPageNumbers(current, total) {
        if (total <= 7) {
            var arr = [];
            for (var i = 1; i <= total; i++) arr.push(i);
            return arr;
        }
        var pages = [];
        pages.push(1);
        if (current > 3) pages.push('...');
        var start = Math.max(2, current - 1);
        var end = Math.min(total - 1, current + 1);
        for (var j = start; j <= end; j++) pages.push(j);
        if (current < total - 2) pages.push('...');
        pages.push(total);
        return pages;
    }

    function scrollToPapers() {
        var section = document.querySelector('.papers-section');
        if (section) section.scrollIntoView({ behavior: 'smooth' });
    }

    // =========================================================================
    // Modal
    // =========================================================================
    function showModal(paperId) {
        var paper = null;
        for (var i = 0; i < state.allPapers.length; i++) {
            if (state.allPapers[i].id === paperId) {
                paper = state.allPapers[i];
                break;
            }
        }
        if (!paper) return;

        var content = document.getElementById('modal-content');

        var contributionOrAbstract = I18n.isZh()
            ? '<p><strong>' + escapeHtml(I18n.ui('modalContribution')) + ':</strong> ' + escapeHtml(paper.contribution) + '</p>'
            : '<p><strong>' + escapeHtml(I18n.ui('modalAbstract')) + ':</strong> ' + escapeHtml(paper.abstract || '') + '</p>';

        content.innerHTML =
            '<h2>' + escapeHtml(paper.title) + '</h2>' +
            '<p><strong>' + escapeHtml(I18n.ui('modalCitation')) + ':</strong> ' + escapeHtml(paper.citation) + '</p>' +
            '<p><strong>' + escapeHtml(I18n.ui('modalYear')) + ':</strong> ' + escapeHtml(String(paper.year)) + '</p>' +
            '<p><strong>' + escapeHtml(I18n.ui('modalCategory')) + ':</strong> ' + escapeHtml(I18n.field('category', paper.category)) + '</p>' +
            '<p><strong>' + escapeHtml(I18n.ui('modalTask')) + ':</strong> ' + escapeHtml((I18n.isEn() && paper.taskEn) ? paper.taskEn : (paper.task || '')) + '</p>' +
            '<p><strong>' + escapeHtml(I18n.ui('modalPhase')) + ':</strong> ' + escapeHtml(I18n.field('phase', paper.phase)) + '</p>' +
            '<p><strong>' + escapeHtml(I18n.ui('modalInputData')) + ':</strong> ' + escapeHtml((I18n.isEn() && paper.inputDataEn) ? paper.inputDataEn : (paper.inputData || '')) + '</p>' +
            '<p><strong>' + escapeHtml(I18n.ui('modalRepr')) + ':</strong> ' + escapeHtml(I18n.field('representation', paper.representation)) + '</p>' +
            '<p><strong>' + escapeHtml(I18n.ui('modalMethod')) + ':</strong> ' + escapeHtml(I18n.field('llmMethod', paper.llmMethod)) + '</p>' +
            contributionOrAbstract +
            (paper.url ? '<p><strong>' + escapeHtml(I18n.ui('modalDOI')) + ':</strong> <a href="' + escapeHtml(paper.url) + '" target="_blank" rel="noopener">' + escapeHtml(paper.url) + '</a></p>' : '') +
            (paper.llmModels && paper.llmModels.length ? '<p><strong>' + escapeHtml(I18n.ui('modalModels')) + ':</strong> ' + escapeHtml(paper.llmModels.join(', ')) + '</p>' : '') +
            (paper.keywords && paper.keywords.length ? '<p><strong>' + escapeHtml(I18n.ui('modalKeywords')) + ':</strong> ' + escapeHtml(paper.keywords.join(', ')) + '</p>' : '') +
            (paper.pdfFile ? '<p><strong>' + escapeHtml(I18n.ui('modalPDF')) + ':</strong> ' + escapeHtml(paper.pdfFile) + '</p>' : '') +
            (paper.markdownFile ? '<p><strong>' + escapeHtml(I18n.ui('modalMarkdown')) + ':</strong> ' + escapeHtml(paper.markdownFile) + '</p>' : '');

        document.getElementById('modal-overlay').classList.add('visible');
        document.body.style.overflow = 'hidden';
    }

    function hideModal() {
        document.getElementById('modal-overlay').classList.remove('visible');
        document.body.style.overflow = '';
    }

    // =========================================================================
    // Event Bindings
    // =========================================================================
    function bindEvents() {
        // Search input with 300ms debounce
        var searchInput = document.getElementById('search-input');
        var searchTimer = null;
        searchInput.addEventListener('input', function () {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(function () {
                state.filters.search = searchInput.value.trim();
                applyFilters();
            }, 300);
        });

        // Clear filters button
        document.getElementById('clear-filters').addEventListener('click', function () {
            clearAllFilters();
        });

        // Language toggle button
        document.getElementById('lang-toggle').addEventListener('click', function () {
            I18n.toggle();
            applyFilters(); // re-render everything
        });

        // Re-render when language changes (e.g. from I18n.toggle called elsewhere)
        window.addEventListener('langChanged', function () {
            applyFilters();
        });

        // Modal close button
        document.getElementById('modal-close').addEventListener('click', function () {
            hideModal();
        });

        // Modal overlay click (close when clicking backdrop, not the modal itself)
        document.getElementById('modal-overlay').addEventListener('click', function (e) {
            if (e.target === document.getElementById('modal-overlay')) {
                hideModal();
            }
        });

        // Escape key closes modal
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                hideModal();
            }
        });
    }

    // =========================================================================
    // Init
    // =========================================================================
    function init() {
        fetch('data/index.json')
            .then(function (res) {
                if (!res.ok) throw new Error('Failed to load index.json');
                return res.json();
            })
            .then(function (index) {
                // Fetch all individual paper JSONs in parallel
                var fetches = index.map(function (entry) {
                    return fetch('data/' + entry.file)
                        .then(function (res) {
                            if (!res.ok) throw new Error('Failed to load ' + entry.file);
                            return res.json();
                        })
                        .catch(function () {
                            // Return a minimal object so we don't lose the entry entirely
                            return {
                                id: entry.id,
                                title: entry.title,
                                year: entry.year,
                                category: entry.category,
                                phase: entry.phase,
                                llmMethod: entry.llmMethod,
                                representation: entry.representation,
                                citation: '',
                                task: '',
                                contribution: ''
                            };
                        });
                });

                return Promise.all(fetches);
            })
            .then(function (papers) {
                state.allPapers = papers;
                applyFilters();
                bindEvents();

                // Notify charts.js that data is ready
                window.dispatchEvent(new CustomEvent('papersLoaded'));
            })
            .catch(function (err) {
                console.error('Init failed:', err);
            });
    }

    document.addEventListener('DOMContentLoaded', init);
})();
