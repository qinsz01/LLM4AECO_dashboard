(function () {
    'use strict';

    var currentPaper = null;
    var OP_COLORS = {
        generation_parameterization: '#6e9cff',
        editing_execution: '#f4b860',
        analysis_compliance_diagnosis: '#42c59a',
        retrieval_alignment: '#a58bfa'
    };

    function escapeHtml(value) {
        if (value === undefined || value === null) return '';
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(String(value)));
        return div.innerHTML;
    }

    function safeUrl(value) {
        try {
            var url = new URL(value, window.location.href);
            return ['http:', 'https:'].indexOf(url.protocol) !== -1 ? url.href : '';
        } catch (error) {
            return '';
        }
    }

    function task(paper) {
        return I18n.isEn() && paper.taskEn ? paper.taskEn : (paper.task || '');
    }

    function inputData(paper) {
        return I18n.isEn() && paper.inputDataEn ? paper.inputDataEn : (paper.inputData || '');
    }

    function fact(label, value) {
        if (!value) return '';
        return '<div class="detail-fact"><span>' + escapeHtml(label) + '</span><strong>' + escapeHtml(value) + '</strong></div>';
    }

    function section(title, value) {
        if (!value) return '';
        return '<section class="detail-section"><h2>' + escapeHtml(title) + '</h2><p>' + escapeHtml(value) + '</p></section>';
    }

    function operationCard(code) {
        return '<div class="detail-operation" style="--op-color:' + (OP_COLORS[code] || '#8795a9') + '">' +
            '<strong>' + escapeHtml(I18n.field('operation', code)) + '</strong>' +
            '<span>' + escapeHtml(I18n.operationDefinition(code)) + '</span>' +
        '</div>';
    }

    function render() {
        var root = document.getElementById('paper-detail');
        if (!currentPaper) {
            root.className = 'paper-detail-loading';
            root.textContent = I18n.ui('paperNotFound');
            return;
        }
        var paper = currentPaper;
        var operations = Array.isArray(paper.operations) ? paper.operations : [];
        var url = safeUrl(paper.url || paper.sourceUrl || '');
        var models = Array.isArray(paper.llmModels) ? paper.llmModels.join(', ') : '';
        var keywords = Array.isArray(paper.keywords) ? paper.keywords : [];
        var basis = paper.operationCodingBasis || paper.codingBasis || 'abstract';
        var contribution = I18n.isZh() ? (paper.contribution || paper.abstract) : (paper.abstract || paper.contribution);

        document.title = (paper.title || 'Paper') + ' | LLM4AECO';
        root.className = '';
        root.innerHTML =
            '<section class="detail-hero">' +
                '<p class="eyebrow">' + escapeHtml(I18n.ui('modalPaperRecord')) + '</p>' +
                '<h1>' + escapeHtml(paper.title) + '</h1>' +
                '<p class="detail-citation">' + escapeHtml(paper.citation || paper.journal || '') + '</p>' +
                '<div class="modal-actions">' +
                    (url ? '<a class="button button-primary" href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(I18n.ui('openDOI')) + '</a>' : '') +
                    '<a class="button button-secondary" href="index.html">' + escapeHtml(I18n.ui('backToDashboard')) + '</a>' +
                '</div>' +
            '</section>' +
            '<div class="detail-layout">' +
                '<aside class="detail-sidebar">' +
                    '<h2>' + escapeHtml(I18n.ui('bibliographicInfo')) + '</h2>' +
                    fact(I18n.ui('modalYear'), paper.year) +
                    fact(I18n.ui('modalJournal'), paper.journal) +
                    fact(I18n.ui('modalCategory'), I18n.field('category', paper.category)) +
                    fact(I18n.ui('modalTask'), task(paper)) +
                    fact(I18n.ui('modalPhase'), I18n.field('phase', paper.phase)) +
                    fact(I18n.ui('modalInputData'), inputData(paper)) +
                    fact(I18n.ui('modalRepresentation'), I18n.field('representation', paper.representation)) +
                    fact(I18n.ui('modalMethod'), I18n.field('llmMethod', paper.llmMethod)) +
                    fact(I18n.ui('modalModels'), models) +
                    fact(I18n.ui('modalCodingBasis'), I18n.field('codingBasis', basis)) +
                '</aside>' +
                '<article class="detail-main">' +
                    '<section class="detail-section">' +
                        '<h2>' + escapeHtml(I18n.ui('evidenceAndOperations')) + '</h2>' +
                        '<div class="detail-operation-grid">' + operations.map(operationCard).join('') + '</div>' +
                        (paper.operationEvidence ? '<div class="evidence-box"><h3>' + escapeHtml(I18n.ui('modalOperationEvidence')) + '</h3><p>' + escapeHtml(paper.operationEvidence) + '</p></div>' : '') +
                    '</section>' +
                    section(I18n.ui('modalContribution'), contribution) +
                    section(I18n.ui('modalAbstract'), paper.abstract) +
                    section(I18n.ui('modalMethodology'), paper.methodology) +
                    section(I18n.ui('modalResults'), paper.results) +
                    (keywords.length ? '<section class="detail-section"><h2>' + escapeHtml(I18n.ui('keywords')) + '</h2><div class="keyword-list">' + keywords.map(function (keyword) { return '<span class="keyword">' + escapeHtml(keyword) + '</span>'; }).join('') + '</div></section>' : '') +
                '</article>' +
            '</div>';
    }

    function load() {
        var id = new URLSearchParams(window.location.search).get('id');
        if (!id) {
            render();
            return;
        }
        fetch('data/index.json')
            .then(function (response) {
                if (!response.ok) throw new Error('index');
                return response.json();
            })
            .then(function (index) {
                var entry = index.find(function (item) { return item.id === id; });
                if (!entry) throw new Error('not found');
                return fetch('data/' + entry.file);
            })
            .then(function (response) {
                if (!response.ok) throw new Error('paper');
                return response.json();
            })
            .then(function (paper) {
                currentPaper = paper;
                render();
            })
            .catch(function () {
                currentPaper = null;
                render();
            });
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.getElementById('lang-toggle').addEventListener('click', function () { I18n.toggle(); });
        load();
    });
    window.addEventListener('langChanged', render);
})();
