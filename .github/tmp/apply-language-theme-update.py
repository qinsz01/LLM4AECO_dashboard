from pathlib import Path


def rep(path, old, new):
    p = Path(path)
    text = p.read_text(encoding="utf-8")
    if old not in text:
        raise RuntimeError(f"pattern missing in {path}: {old[:80]}")
    p.write_text(text.replace(old, new, 1), encoding="utf-8")


rep(
    "js/i18n.js",
    "var lang = localStorage.getItem('llm4aeco-lang') || 'zh';",
    "var lang = localStorage.getItem('llm4aeco-lang') || 'en';",
)

for path in ("index.html", "paper.html"):
    rep(path, '<html lang="zh-CN">', '<html lang="en">')
    rep(
        path,
        '<link rel="stylesheet" href="css/style.css">',
        '<link rel="stylesheet" href="css/style.css">\n    <link rel="stylesheet" href="css/theme.css">',
    )
    rep(
        path,
        '<title>',
        '<script>(function(){var t=localStorage.getItem("llm4aeco-theme")||"dark";document.documentElement.setAttribute("data-theme",t);document.documentElement.style.colorScheme=t;})();</script>\n    <title>',
    )
    rep(
        path,
        '<button id="lang-toggle" class="btn btn-primary" type="button">EN</button>',
        '<button id="theme-toggle" class="btn btn-secondary theme-toggle" type="button" aria-label="Switch to light mode" title="Switch to light mode"><span class="theme-icon-light" aria-hidden="true">☀</span><span class="theme-icon-dark" aria-hidden="true">☾</span></button>\n                <button id="lang-toggle" class="btn btn-primary" type="button">中文</button>',
    )
    rep(
        path,
        '<script src="js/i18n.js"></script>',
        '<script src="js/i18n.js"></script>\n    <script src="js/theme.js"></script>',
    )


def patch_chart_file(path):
    p = Path(path)
    text = p.read_text(encoding="utf-8")
    anchor = "    var CARD = '#151d2f';\n"
    if "function syncThemePalette()" not in text:
        sync = """
    function syncThemePalette() {
        var styles = getComputedStyle(document.documentElement);
        TEXT = styles.getPropertyValue('--chart-text').trim() || '#e8edf7';
        MUTED = styles.getPropertyValue('--chart-muted').trim() || '#9aa8bd';
        GRID = styles.getPropertyValue('--chart-grid').trim() || '#2a3550';
        CARD = styles.getPropertyValue('--chart-card').trim() || '#151d2f';
    }
"""
        if anchor not in text:
            raise RuntimeError(f"palette anchor missing in {path}")
        text = text.replace(anchor, anchor + sync, 1)

    render = "    function renderAll() {\n        var papers = selectedPapers();"
    if render in text:
        text = text.replace(
            render,
            "    function renderAll() {\n        syncThemePalette();\n        var papers = selectedPapers();",
            1,
        )

    lang_listener = "    window.addEventListener('langChanged', renderAll);"
    theme_listener = "    window.addEventListener('themeChanged', renderAll);"
    if theme_listener not in text:
        if lang_listener not in text:
            raise RuntimeError(f"listener anchor missing in {path}")
        text = text.replace(lang_listener, lang_listener + "\n" + theme_listener, 1)

    p.write_text(text, encoding="utf-8")


patch_chart_file("js/charts.js")
patch_chart_file("js/dashboard-layout.js")

Path(".github/workflows/apply-language-theme-update.yml").unlink()
Path(".github/tmp/apply-language-theme-update.py").unlink()
try:
    Path(".github/tmp").rmdir()
except OSError:
    pass
