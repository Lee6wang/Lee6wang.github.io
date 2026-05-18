/**
 * Same-page bilingual switcher for static Chirpy pages.
 * Content blocks use data-i18n-lang="zh" and data-i18n-lang="en".
 */

(() => {
  const storageKey = 'site-language';
  const validLanguages = new Set(['zh', 'en']);

  function normalizeLanguage(lang) {
    if (!lang) return null;
    const normalized = lang.toLowerCase();
    if (normalized.startsWith('zh')) return 'zh';
    if (normalized.startsWith('en')) return 'en';
    return null;
  }

  function preferredLanguage() {
    let stored = null;
    try {
      stored = normalizeLanguage(localStorage.getItem(storageKey));
    } catch (error) {
      stored = null;
    }

    return stored || normalizeLanguage(navigator.language) || 'zh';
  }

  function readI18nData() {
    const node = document.getElementById('site-i18n-data');
    if (!node) return { site: {}, paths: {}, posts: {}, ui: { pairs: [] } };

    try {
      return JSON.parse(node.textContent);
    } catch (error) {
      console.warn('Failed to parse i18n data.', error);
      return { site: {}, paths: {}, posts: {}, ui: { pairs: [] } };
    }
  }

  function normalizePath(href) {
    try {
      const url = new URL(href, window.location.origin);
      let path = decodeURI(url.pathname);
      if (!path.endsWith('/') && !/\.[^/]+$/.test(path)) {
        path += '/';
      }
      return path;
    } catch (error) {
      return href;
    }
  }

  function allLabels(data) {
    return { ...(data.paths || {}), ...(data.posts || {}) };
  }

  function buildPairs(data) {
    const pairs = [...((data.ui && data.ui.pairs) || [])];
    Object.values(allLabels(data)).forEach((label) => {
      if (label && label.zh && label.en) pairs.push([label.zh, label.en]);
    });
    return pairs;
  }

  function buildTextMap(lang, pairs) {
    const map = new Map();
    pairs.forEach(([zh, en]) => {
      if (!zh || !en || zh === en) return;
      map.set(lang === 'zh' ? en : zh, lang === 'zh' ? zh : en);
    });
    return map;
  }

  function shouldSkipTextNode(node) {
    const parent = node.parentElement;
    if (!parent) return true;
    return Boolean(
      parent.closest(
        'script, style, code, pre, kbd, samp, mjx-container, .i18n-block, .i18n-inline, [data-no-i18n]'
      )
    );
  }

  function replaceKeepingSpace(value, replacement) {
    const leading = value.match(/^\s*/)[0];
    const trailing = value.match(/\s*$/)[0];
    return `${leading}${replacement}${trailing}`;
  }

  function translateExactText(lang, data) {
    const textMap = buildTextMap(lang, buildPairs(data));
    const walker = document.createTreeWalker(document.body, 4);
    const nodes = [];

    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      if (shouldSkipTextNode(node)) return;

      const key = node.nodeValue.trim();
      if (textMap.has(key)) {
        node.nodeValue = replaceKeepingSpace(node.nodeValue, textMap.get(key));
      }
    });

    translateAttributes(textMap);
  }

  function translateAttributes(textMap) {
    const attrs = ['aria-label', 'title', 'data-bs-title', 'data-bs-original-title', 'placeholder'];

    document.querySelectorAll('*').forEach((node) => {
      attrs.forEach((attr) => {
        if (!node.hasAttribute(attr)) return;
        const value = node.getAttribute(attr).trim();
        if (textMap.has(value)) {
          node.setAttribute(attr, textMap.get(value));
        }
      });
    });
  }

  function translatePathLabels(lang, data) {
    const labels = allLabels(data);

    document.querySelectorAll('a[href]').forEach((link) => {
      const label = labels[normalizePath(link.getAttribute('href'))];
      if (!label || !label[lang]) return;

      const candidates = [
        link.querySelector('.card-title'),
        link.querySelector('h1, h2, h3, h4, h5, h6'),
        link.querySelector('p'),
        link.querySelector('span:not(.me-2):not(.me-1)')
      ].filter(Boolean);

      const target = candidates[0] || (link.children.length === 0 ? link : null);
      if (!target) return;

      const text = target.textContent.trim();
      if (text === label.zh || text === label.en) {
        target.textContent = label[lang];
      }
    });
  }

  function toggleContentBlocks(lang) {
    document.querySelectorAll('[data-i18n-lang]').forEach((node) => {
      const isActive = node.getAttribute('data-i18n-lang') === lang;
      node.hidden = !isActive;
      node.setAttribute('aria-hidden', String(!isActive));

      node.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
        if (isActive) {
          heading.removeAttribute('data-toc-skip');
        } else {
          heading.setAttribute('data-toc-skip', '');
        }
      });
    });
  }

  function currentLabel(data) {
    const path = normalizePath(window.location.href);
    const labels = allLabels(data);
    return labels[path] || null;
  }

  function updateDocumentTitle(lang, data) {
    const label = currentLabel(data);
    const siteTitle = data.site && data.site.title ? data.site.title : '';
    if (!label || !label[lang] || !siteTitle) return;

    document.title = `${label[lang]} | ${siteTitle}`;
  }

  function updatePostChrome(lang, data) {
    const label = currentLabel(data);
    if (!label || !label[lang]) return;

    const titleNodes = [
      document.querySelector('article header h1'),
      document.querySelector('#toc-bar .label'),
      document.querySelector('#toc-popup .header .label')
    ].filter(Boolean);

    titleNodes.forEach((node) => {
      const text = node.textContent.trim();
      if (text === label.zh || text === label.en) {
        node.textContent = label[lang];
      }
    });
  }

  function plural(n, one, other) {
    return Number(n) === 1 ? one : other;
  }

  function replaceCategoryText(value, lang, data) {
    const category = data.ui && data.ui.category;
    if (!category) return value;

    const zh = category.zh;
    const en = category.en;
    const trimmed = value.trim();

    let match = trimmed.match(/^(\d+)\s*个分类\s*,\s*(\d+)\s*篇文章$/);
    if (match && lang === 'en') {
      const categories = Number(match[1]);
      const posts = Number(match[2]);
      return `${categories} ${plural(categories, en.category_one, en.category_other)}, ${posts} ${plural(
        posts,
        en.post_one,
        en.post_other
      )}`;
    }

    match = trimmed.match(/^(\d+)\s*篇文章$/);
    if (match && lang === 'en') {
      const posts = Number(match[1]);
      return `${posts} ${plural(posts, en.post_one, en.post_other)}`;
    }

    match = trimmed.match(/^(\d+)\s+categor(?:y|ies)\s*,\s*(\d+)\s+posts?$/i);
    if (match && lang === 'zh') {
      return `${match[1]} ${zh.category_other} , ${match[2]} ${zh.post_other}`;
    }

    match = trimmed.match(/^(\d+)\s+posts?$/i);
    if (match && lang === 'zh') {
      return `${match[1]} ${zh.post_other}`;
    }

    return value;
  }

  function replaceReadTimeText(value, lang) {
    const trimmed = value.trim();
    let match = trimmed.match(/^阅读\s*(\d+)\s*分钟$/);
    if (match && lang === 'en') return `Read ${match[1]} min`;

    match = trimmed.match(/^Read\s*(\d+)\s*min$/i);
    if (match && lang === 'zh') return `阅读 ${match[1]} 分钟`;

    match = trimmed.match(/^(\d+)\s*分钟$/);
    if (match && lang === 'en') return `${match[1]} min`;

    match = trimmed.match(/^(\d+)\s*min$/i);
    if (match && lang === 'zh') return `${match[1]} 分钟`;

    return value;
  }

  function translatePatternText(lang, data) {
    const walker = document.createTreeWalker(document.body, 4);
    const nodes = [];

    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      if (shouldSkipTextNode(node)) return;

      let next = replaceCategoryText(node.nodeValue, lang, data);
      next = replaceReadTimeText(next, lang);
      if (next !== node.nodeValue) {
        node.nodeValue = replaceKeepingSpace(node.nodeValue, next.trim());
      }
    });
  }

  function updateSiteTagline(lang, data) {
    const tagline = data.site && data.site.tagline;
    if (!tagline || !tagline[lang]) return;

    document.querySelectorAll('#sidebar .site-subtitle, #sidebar .site-title + p').forEach((node) => {
      const text = node.textContent.trim();
      if (text === tagline.zh || text === tagline.en) {
        node.textContent = tagline[lang];
      }
    });
  }

  function updateSwitcher(lang) {
    ensureSwitcher();

    document.querySelectorAll('[data-lang-option]').forEach((button) => {
      const isActive = button.getAttribute('data-lang-option') === lang;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }

  function ensureSwitcher() {
    if (document.querySelector('[data-i18n-switcher]') || !document.body) return;

    const switcher = document.createElement('div');
    switcher.className = 'i18n-switcher';
    switcher.setAttribute('data-i18n-switcher', '');
    switcher.setAttribute('aria-label', 'Language switcher');
    switcher.innerHTML = [
      '<button type="button" data-lang-option="zh" aria-pressed="false" title="中文">中</button>',
      '<button type="button" data-lang-option="en" aria-pressed="false" title="English">EN</button>'
    ].join('');

    document.body.appendChild(switcher);
  }

  function refreshToc() {
    window.requestAnimationFrame(() => {
      try {
        if (window.tocbot && typeof window.tocbot.refresh === 'function') {
          window.tocbot.refresh();
        }
      } catch (error) {
        // TOC refresh is best-effort because Chirpy owns the initial tocbot config.
      }
    });
  }

  function applyLanguage(lang = preferredLanguage()) {
    if (!validLanguages.has(lang)) return;

    const data = readI18nData();
    document.documentElement.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');
    document.documentElement.setAttribute('data-site-lang', lang);

    toggleContentBlocks(lang);
    translatePathLabels(lang, data);
    translateExactText(lang, data);
    translatePatternText(lang, data);
    updateSiteTagline(lang, data);
    updatePostChrome(lang, data);
    updateDocumentTitle(lang, data);
    updateSwitcher(lang);
    refreshToc();
  }

  function setLanguage(lang) {
    if (!validLanguages.has(lang)) return;
    try {
      localStorage.setItem(storageKey, lang);
    } catch (error) {
      // The selected language still applies for the current page.
    }
    applyLanguage(lang);
  }

  if (!window.SiteI18n) {
    window.SiteI18n = { apply: applyLanguage, set: setLanguage };

    document.addEventListener('DOMContentLoaded', ensureSwitcher);
    document.addEventListener('click', (event) => {
      const button = event.target.closest('[data-lang-option]');
      if (!button) return;
      setLanguage(button.getAttribute('data-lang-option'));
    });

    document.addEventListener('DOMContentLoaded', () => applyLanguage());
    document.addEventListener('pjax:end', () => window.requestAnimationFrame(() => applyLanguage()));
  }

  applyLanguage();
})();
