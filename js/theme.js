(function () {
    'use strict';

    var STORAGE_KEY = 'llm4aeco-theme';
    var theme = localStorage.getItem(STORAGE_KEY) || 'dark';

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

    window.Theme = {
        current: function () { return theme; },
        apply: applyTheme,
        toggle: toggleTheme
    };

    applyTheme(theme, false);

    document.addEventListener('DOMContentLoaded', function () {
        var button = document.getElementById('theme-toggle');
        if (button) button.addEventListener('click', toggleTheme);
        applyTheme(theme, false);
    });

    window.addEventListener('langChanged', function () {
        applyTheme(theme, false);
    });
})();
