/* ═══════════════════════════════════════════════════════════════
   DOM — Utility helpers for DOM manipulation
   ═══════════════════════════════════════════════════════════════ */
const DOM = {
  // Get element by ID (cached)
  _cache: {},
  el(id) {
    if (!this._cache[id] || !document.body.contains(this._cache[id])) {
      this._cache[id] = document.getElementById(id);
    }
    return this._cache[id];
  },

  // Clear cache (call after major DOM changes)
  clearCache() { this._cache = {}; },

  // Escape HTML to prevent XSS
  esc(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  },

  // Create element with attributes and children
  create(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'className') el.className = v;
      else if (k === 'textContent') el.textContent = v;
      else if (k === 'innerHTML') el.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
      else el.setAttribute(k, v);
    }
    children.forEach(c => {
      if (typeof c === 'string') el.appendChild(document.createTextNode(c));
      else if (c) el.appendChild(c);
    });
    return el;
  },

  // Set innerHTML safely (with toast on error)
  setHTML(id, html) {
    const el = typeof id === 'string' ? this.el(id) : id;
    if (el) el.innerHTML = html;
  },

  // Generate unique ID
  uid() {
    return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
  },

  // Copy text to clipboard
  async copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      Toast.show('Copied!');
    } catch (e) {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      Toast.show('Copied!');
    }
  },

  // Download file
  download(filename, content, type = 'text/plain') {
    const isDataUrl = typeof content === 'string' && content.startsWith('data:');
    const url = isDataUrl ? content : URL.createObjectURL(new Blob([content], { type }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (!isDataUrl) URL.revokeObjectURL(url);
  },

  // Simple confirm dialog
  confirm(message) {
    return window.confirm(message);
  },

  // Simple prompt dialog
  prompt(message, defaultVal = '') {
    return window.prompt(message, defaultVal);
  }
};
