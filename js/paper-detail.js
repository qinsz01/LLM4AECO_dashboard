(function () {
    'use strict';

    var currentPaper = null;
    var markdownLoaded = false;

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

    function getPaperId() {
        return new URLSearchParams(window.location.search).get('id');
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

    function tagHtml(label, className) {
        return '<span class="tag ' + escapeHtml(className || '') + '">' + escapeHtml(label) + '</span>';
    }

    function operationTagHtml(operation) {
        var meta = I18n.operation(operation);
        return '<span class="tag tag-operation ' + operationClass(operation) + '">' +
            '<span class="operation-tag-code">' + escapeHtml(meta.short) + '</span>' +
            escapeHtml(meta.label) + '</span>';
    }

    function recordCard(title, text) {
        if (!text) return '';
        return '<article class="paper-record-card"><h2>' + escapeHtml(title) + '</h2><p>' + escapeHtml(text) + '</p></article>';
    }

    function renderPaper() {
        if (!currentPaper) return;
        var paper = currentPaper;
        var operations = paper.operations || [];
        var task = I18n.isEn() && paper.taskEn ? paper.taskEn : paper.task;
        var input = I18n.isEn() && paper.inputDataEn ? paper.inputDataEn : paper.inputData;
        var source = safeUrl(paper.url || paper.sourceUrl);

        document.title = paper.title + ' · LLM4AECO';
        document.getElementById('paper-title').textContent = paper.title;
        document.getElementById('paper-citation').textContent = [paper.citation, paper.journal, paper.year].filter(Boolean).join(' · ');

        var meta = [
            tagHtml(I18n.field('phase', paper.phase), 'tag-phase'),
            tagHtml(I18n.field('category', paper.category), 'tag-category'),
            tagHtml(I18n.field('llmMethod', paper.llmMethod), 'tag-method'),
            tagHtml(I18n.field('representation', paper.representation), 'tag-repr')
        ];
        document.getElementById('paper-meta').innerHTML = meta.join('');

        var operationTags = operations.length
            ? operations.map(operationTagHtml).join('')
            : '<span class="tag tag-operation operation-neutral">' + escapeHtml(I18n.ui('chartNoOperation')) + '</span>';
        document.getElementById('paper-operation-card').innerHTML =
            '<div class="paper-operation-heading">' +
                '<h2>' + escapeHtml(I18n.ui('modalOperations')) + '</h2>' +
                '<span class="review-basis review-basis-strong"><span class="review-check" aria-hidden="true">✓</span>' +
                    escapeHtml(I18n.field('operationCodingBasis', paper.operationCodingBasis)) + '</span>' +
            '</div>' +
            '<div class="paper-operation-tags">' + operationTags + '</div>' +
            '<p class="paper-operation-evidence"><strong>' + escapeHtml(I18n.ui('modalOperationEvidence')) + ':</strong> ' +
                escapeHtml(paper.operationEvidence || I18n.ui('modalNoOperations')) + '</p>';

        document.getElementById('paper-actions').innerHTML = source
            ? '<a class="button-link button-primary" href="' + escapeHtml(source) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(I18n.ui('modalOpenSource')) + '</a>'
            : '';

        var taskData = [
            I18n.ui('modalTask') + ': ' + (task || ''),
            I18n.ui('modalInputData') + ': ' + (input || ''),
            I18n.ui('modalRepr') + ': ' + I18n.field('representation', paper.representation),
            I18n.ui('modalMethod') + ': ' + I18n.field('llmMethod', paper.llmMethod)
        ].filter(Boolean).join('\n');

        document.getElementById('paper-record-grid').innerHTML =
            recordCard(I18n.ui('modalStudySummary'), taskData) +
            recordCard(I18n.ui('modalAbstract'), paper.abstract) +
            recordCard(I18n.ui('modalMethodology'), paper.methodology) +
            recordCard(I18n.ui('modalResults'), paper.results) +
            recordCard(I18n.ui('modalContribution'), paper.contribution) +
            recordCard(I18n.ui('modalModels'), (paper.llmModels || []).join(', ')) +
            recordCard(I18n.ui('modalKeywords'), (paper.keywords || []).join(', '));
    }

    function showError() {
        document.getElementById('paper-title').textContent = I18n.ui('errorTitle');
        document.getElementById('paper-citation').textContent = '';
        document.getElementById('paper-meta').innerHTML = '';
        document.getElementById('paper-operation-card').style.display = 'none';
        document.getElementById('paper-record-grid').innerHTML = '';
        document.getElementById('paper-content').innerHTML = '<p>' + escapeHtml(I18n.ui('errorMessage')) + '</p>';
    }

    function loadMarkdown(paper) {
        if (markdownLoaded) return;
        markdownLoaded = true;
        var content = document.getElementById('paper-content');
        if (!paper.markdownFile) {
            content.innerHTML = '<p>' + escapeHtml(I18n.ui('paperNoFullText')) + '</p>';
            return;
        }

        content.innerHTML = '<p>' + escapeHtml(I18n.ui('paperLoading')) + '</p>';
        var markdownUrl = '../paper/ref/paper_markdown/' + encodeURIComponent(paper.markdownFile);
        fetch(markdownUrl)
            .then(function (response) {
                if (!response.ok) throw new Error('HTTP ' + response.status);
                return response.text();
            })
            .then(function (markdown) {
                if (window.marked && typeof window.marked.parse === 'function') {
                    content.innerHTML = window.marked.parse(markdown);
                } else {
                    content.textContent = markdown;
                }
            })
            .catch(function (error) {
                console.warn('Full text unavailable:', error);
                content.innerHTML = '<p>' + escapeHtml(I18n.ui('paperLoadFailed')) + '</p>';
            });
    }

    function init() {
        I18n.applyToDOM();
        document.getElementById('lang-toggle').addEventListener('click', function () { I18n.toggle(); });
        window.addEventListener('langChanged', function () {
            I18n.applyToDOM();
            renderPaper();
        });

        var paperId = getPaperId();
        if (!paperId) {
            showError();
            return;
        }

        fetch('data/papers/' + encodeURIComponent(paperId) + '.json')
            .then(function (response) {
                if (!response.ok) throw new Error('HTTP ' + response.status);
                return response.json();
            })
            .then(function (paper) {
                currentPaper = paper;
                renderPaper();
                loadMarkdown(paper);
            })
            .catch(function (error) {
                console.error('Paper load failed:', error);
                showError();
            });
    }

    document.addEventListener('DOMContentLoaded', init);
})();
