(function () {
    'use strict';

    var STORAGE_KEY = 'llm4aeco-theme';
    var theme = localStorage.getItem(STORAGE_KEY) || 'dark';
    var rearrangingModal = false;

    function ensurePolishStyles() {
        if (document.getElementById('theme-polish-styles')) return;
        var link = document.createElement('link');
        link.id = 'theme-polish-styles';
        link.rel = 'stylesheet';
        link.href = 'css/theme-polish.css';
        document.head.appendChild(link);
    }

    function applyTheme(nextTheme, notify) {
        theme = nextTheme === 'light' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.style.colorScheme = theme;
        localStorage.setItem(STORAGE_KEY, theme);

        var button = document.getElementById('theme-toggle');
        if (button) {
            var lightLabel = I18n && I18n.isZh && I18n.isZh() ? '切换到白天模式' : 'Switch to light mode';
            var darkLabel = I18n && I18n.isZh && I18n.isZh() ? '切换到黑夜模式' : 'Switch to dark mode';
            button.setAttribute('aria-label', theme === 'dark' ? lightLabel : darkLabel);
            button.setAttribute('title', theme === 'dark' ? lightLabel : darkLabel);
        }

        if (notify !== false) {
            window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: theme } }));
        }
    }

    function toggleTheme() {
        applyTheme(theme === 'dark' ? 'light' : 'dark', true);
    }

    function removePreviewEvidence(root) {
        (root || document).querySelectorAll('.paper-card .card-evidence').forEach(function (node) {
            node.remove();
        });
    }

    function reorderModal() {
        if (rearrangingModal) return;
        var content = document.getElementById('modal-content');
        if (!content) return;

        var heading = content.querySelector('.modal-heading');
        var info = content.querySelector('.modal-info-grid');
        var operation = content.querySelector('.operation-panel');
        var details = content.querySelector('.modal-details-stack:not(.modal-details-intro)');
        if (!heading || !info || !operation || !details) return;
        if (operation.getAttribute('data-polished-order') === 'true') return;

        rearrangingModal = true;
        info.classList.add('modal-info-grid-first');
        heading.insertAdjacentElement('afterend', info);

        var abstractDetail = Array.prototype.slice.call(details.querySelectorAll('.modal-detail')).find(function (item) {
            var summary = item.querySelector('summary');
            return summary && summary.textContent.trim() === I18n.ui('modalAbstract');
        });

        var anchor = info;
        if (abstractDetail) {
            var intro = document.createElement('div');
            intro.className = 'modal-details-stack modal-details-intro';
            intro.appendChild(abstractDetail);
            anchor.insertAdjacentElement('afterend', intro);
            anchor = intro;
        }

        operation.classList.add('operation-panel-secondary');
        operation.setAttribute('data-polished-order', 'true');
        anchor.insertAdjacentElement('afterend', operation);
        operation.insertAdjacentElement('afterend', details);
        rearrangingModal = false;
    }

    function reorderPaperDetail() {
        var recordGrid = document.getElementById('paper-record-grid');
        var operationCard = document.getElementById('paper-operation-card');
        if (recordGrid && operationCard && recordGrid.nextElementSibling !== operationCard) {
            recordGrid.insertAdjacentElement('afterend', operationCard);
        }
    }

    function installUiPolish() {
        ensurePolishStyles();
        removePreviewEvidence(document);
        reorderPaperDetail();
        reorderModal();

        var papersGrid = document.getElementById('papers-grid');
        if (papersGrid) {
            new MutationObserver(function () {
                removePreviewEvidence(papersGrid);
            }).observe(papersGrid, { childList: true, subtree: true });
        }

        var modalContent = document.getElementById('modal-content');
        if (modalContent) {
            new MutationObserver(function () {
                reorderModal();
            }).observe(modalContent, { childList: true, subtree: false });
        }
    }

    window.Theme = {
        current: function () { return theme; },
        apply: applyTheme,
        toggle: toggleTheme
    };

    ensurePolishStyles();
    applyTheme(theme, false);

    document.addEventListener('DOMContentLoaded', function () {
        var button = document.getElementById('theme-toggle');
        if (button) button.addEventListener('click', toggleTheme);
        applyTheme(theme, false);
        installUiPolish();
    });

    window.addEventListener('langChanged', function () {
        applyTheme(theme, false);
        window.requestAnimationFrame(function () {
            removePreviewEvidence(document);
            reorderModal();
            reorderPaperDetail();
        });
    });
})();
