/**
 * Lightweight bilingual switcher for static Chirpy pages.
 * Page bodies use paired elements with data-i18n-lang="zh" and "en".
 */

(() => {
  const storageKey = 'site-language';
  const validLanguages = new Set(['zh', 'en']);

  const staticPairs = [
    ['首页', 'Home'],
    ['关于', 'About'],
    ['归档', 'Archives'],
    ['分类', 'Categories'],
    ['标签', 'Tags'],
    ['摄影', 'Photograph'],
    ['搜索', 'Search'],
    ['文章', 'Posts'],
    ['目录', 'Contents'],
    ['最近更新', 'Recently Updated'],
    ['阅读全文', 'Read More'],
    ['上一篇', 'Previous'],
    ['下一篇', 'Next'],
    ['嵌入式系统与机器人开发者', 'Embedded Systems & Robotics Developer']
  ];

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

    if (stored) return stored;
    return normalizeLanguage(navigator.language) || 'zh';
  }

  function readI18nData() {
    const node = document.getElementById('site-i18n-data');
    if (!node) return { paths: {}, posts: {} };

    try {
      return JSON.parse(node.textContent);
    } catch (error) {
      console.warn('Failed to parse i18n data.', error);
      return { paths: {}, posts: {} };
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

  function collectPairs() {
    const data = readI18nData();
    const pairs = [...staticPairs];
    const pathLabels = { ...(data.paths || {}), ...(data.posts || {}) };

    Object.values(pathLabels).forEach((label) => {
      if (label && label.zh && label.en) {
        pairs.push([label.zh, label.en]);
      }
    });

    return { pairs, pathLabels };
  }

  function buildTextMap(lang, pairs) {
    const map = new Map();
    pairs.forEach(([zh, en]) => {
      if (lang === 'zh') {
        map.set(en, zh);
      } else {
        map.set(zh, en);
      }
    });
    return map;
  }

  function shouldSkipTextNode(node) {
    const parent = node.parentElement;
    if (!parent) return true;
    return Boolean(parent.closest('script, style, code, pre, kbd, samp, mjx-container, .i18n-block, .i18n-inline, [data-no-i18n]'));
  }

  function replaceKeepingSpace(value, replacement) {
    const leading = value.match(/^\s*/)[0];
    const trailing = value.match(/\s*$/)[0];
    return `${leading}${replacement}${trailing}`;
  }

  function translateExactText(lang, pairs) {
    const textMap = buildTextMap(lang, pairs);
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];

    while (walker.nextNode()) {
      nodes.push(walker.currentNode);
    }

    nodes.forEach((node) => {
      if (shouldSkipTextNode(node)) return;

      const key = node.nodeValue.trim();
      if (textMap.has(key)) {
        node.nodeValue = replaceKeepingSpace(node.nodeValue, textMap.get(key));
      }
    });

    textMap.forEach((to, from) => {
      if (document.title.includes(from)) {
        document.title = document.title.replace(from, to);
      }
    });
  }

  function translatePathLabels(lang, pathLabels) {
    document.querySelectorAll('a[href]').forEach((link) => {
      const label = pathLabels[normalizePath(link.getAttribute('href'))];
      if (!label || !label[lang]) return;

      const target = link.querySelector('h1, h2, h3, h4, span') || (link.children.length === 0 ? link : null);
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
      '<button type="button" data-lang-option="zh" aria-pressed="false">中</button>',
      '<button type="button" data-lang-option="en" aria-pressed="false">EN</button>'
    ].join('');

    document.body.appendChild(switcher);
  }

  function applyLanguage(lang = preferredLanguage()) {
    if (!validLanguages.has(lang)) return;

    const { pairs, pathLabels } = collectPairs();
    document.documentElement.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');
    document.documentElement.setAttribute('data-site-lang', lang);

    toggleContentBlocks(lang);
    translatePathLabels(lang, pathLabels);
    translateExactText(lang, pairs);
    updateSwitcher(lang);
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
