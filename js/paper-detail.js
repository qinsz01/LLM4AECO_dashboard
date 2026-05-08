(function () {
  'use strict';

  /**
   * Escape HTML special characters to prevent XSS when inserting text into the DOM.
   * @param {string} str - Raw string
   * @returns {string} HTML-safe string
   */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /**
   * Create a tag span element.
   * @param {string} text - Tag label
   * @param {string} [className] - Additional CSS class(es)
   * @returns {HTMLSpanElement}
   */
  function createTag(text, className) {
    const span = document.createElement('span');
    span.className = 'tag' + (className ? ' ' + className : '');
    span.textContent = text;
    return span;
  }

  /**
   * Parse the `id` query parameter from the current URL.
   * @returns {string|null}
   */
  function getPaperId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  }

  /**
   * Show an error message in both the title and content areas.
   * @param {string} message
   */
  function showError(message) {
    document.getElementById('paper-title').textContent = 'Error';
    document.getElementById('paper-meta').innerHTML = '';
    document.getElementById('paper-content').innerHTML =
      '<p style="color:var(--text-muted);text-align:center;padding:48px 0;">' +
      escapeHtml(message) +
      '</p>';
  }

  // ---- Main logic ----

  document.addEventListener('DOMContentLoaded', function () {
    var paperId = getPaperId();

    if (!paperId) {
      showError('Paper not found. No ID specified in the URL.');
      return;
    }

    // Fetch the paper configuration JSON
    fetch('data/papers/' + encodeURIComponent(paperId) + '.json')
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Failed to load paper config (HTTP ' + response.status + ')');
        }
        return response.json();
      })
      .then(function (paper) {
        // 1. Set page title
        document.title = paper.title + ' - LLM4AECO';

        // 2. Set heading
        document.getElementById('paper-title').textContent = paper.title;

        // 3. Render meta tags
        var metaEl = document.getElementById('paper-meta');
        metaEl.innerHTML = '';

        if (paper.phase) {
          metaEl.appendChild(createTag(paper.phase, 'tag-phase'));
        }
        if (paper.category) {
          metaEl.appendChild(createTag(paper.category, 'tag-category'));
        }
        if (paper.llmMethod) {
          metaEl.appendChild(createTag(paper.llmMethod, 'tag-method'));
        }
        if (paper.representation) {
          metaEl.appendChild(createTag(paper.representation, 'tag-repr'));
        }
        if (paper.year) {
          metaEl.appendChild(createTag(String(paper.year)));
        }

        // 4. Load and render markdown content
        var contentEl = document.getElementById('paper-content');

        if (!paper.markdownFile) {
          contentEl.innerHTML =
            '<p style="color:var(--text-muted);text-align:center;padding:48px 0;">' +
            'No full text available.' +
            '</p>';
          return;
        }

        // Show loading state while fetching (potentially large) markdown
        contentEl.innerHTML =
          '<p style="color:var(--text-muted);text-align:center;padding:48px 0;">Loading full text...</p>';

        var markdownUrl = '../paper/ref/paper_markdown/' + encodeURIComponent(paper.markdownFile);

        fetch(markdownUrl)
          .then(function (mdResponse) {
            if (!mdResponse.ok) {
              throw new Error('Failed to load markdown (HTTP ' + mdResponse.status + ')');
            }
            return mdResponse.text();
          })
          .then(function (markdown) {
            contentEl.innerHTML = marked.parse(markdown);
          })
          .catch(function (mdErr) {
            console.error('Error loading markdown:', mdErr);
            contentEl.innerHTML =
              '<p style="color:var(--text-muted);text-align:center;padding:48px 0;">' +
              'Failed to load paper content. ' +
              '</p>';
          });
      })
      .catch(function (err) {
        console.error('Error loading paper:', err);
        showError('Paper not found or failed to load.');
      });
  });
})();
