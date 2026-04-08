/* ═══════════════════════════════════════════════════════════════
   TreeView — Recursive object/array renderer with expand/collapse
   Shows types, values, and highlights changes.
   ═══════════════════════════════════════════════════════════════ */
const TreeView = {
  _expanded: new Set(),

  render(data, containerId, path = '') {
    const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    if (!container) return;

    if (data === null || data === undefined) {
      container.innerHTML = `<span class="tv-null">${data === null ? 'null' : 'undefined'}</span>`;
      return;
    }

    if (typeof data !== 'object') {
      container.innerHTML = this._primitive(data);
      return;
    }

    const entries = Array.isArray(data)
      ? data.map((v, i) => [i, v])
      : Object.entries(data);

    container.innerHTML = entries.map(([key, val]) => {
      const fullPath = path ? path + '.' + key : String(key);
      const isObj = val !== null && typeof val === 'object';
      const isExpanded = this._expanded.has(fullPath);
      const type = this._typeTag(val);

      return `<div class="tv-row" data-path="${fullPath}">
        <div class="tv-key-row" onclick="${isObj ? `TreeView.toggle('${fullPath}')` : ''}">
          ${isObj ? `<span class="tv-arrow ${isExpanded ? 'open' : ''}">▶</span>` : '<span class="tv-dot"></span>'}
          <span class="tv-key">${DOM.esc(String(key))}</span>
          <span class="tv-type">${type}</span>
          ${!isObj ? `<span class="tv-val">${this._primitive(val)}</span>` : `<span class="tv-preview">${this._preview(val)}</span>`}
        </div>
        ${isObj && isExpanded ? `<div class="tv-children" id="tv-${fullPath.replace(/\./g, '-')}"></div>` : ''}
      </div>`;
    }).join('');

    // Recursively render expanded children
    entries.forEach(([key, val]) => {
      const fullPath = path ? path + '.' + key : String(key);
      if (val !== null && typeof val === 'object' && this._expanded.has(fullPath)) {
        const childContainer = document.getElementById('tv-' + fullPath.replace(/\./g, '-'));
        if (childContainer) this.render(val, childContainer, fullPath);
      }
    });
  },

  toggle(path) {
    if (this._expanded.has(path)) this._expanded.delete(path);
    else this._expanded.add(path);
    EventBus.emit('treeview:toggled', path);
  },

  _typeTag(val) {
    if (val === null) return '<span class="tv-tag tv-tag-null">null</span>';
    if (val === undefined) return '<span class="tv-tag tv-tag-null">undef</span>';
    if (Array.isArray(val)) return `<span class="tv-tag tv-tag-arr">arr[${val.length}]</span>`;
    const t = typeof val;
    const cls = { string: 'str', number: 'num', boolean: 'bool', function: 'fn', object: 'obj' }[t] || 'other';
    return `<span class="tv-tag tv-tag-${cls}">${cls}</span>`;
  },

  _primitive(val) {
    if (typeof val === 'string') return `<span class="tv-str">"${DOM.esc(val.length > 60 ? val.slice(0, 60) + '...' : val)}"</span>`;
    if (typeof val === 'number') return `<span class="tv-num">${val}</span>`;
    if (typeof val === 'boolean') return `<span class="tv-bool">${val}</span>`;
    if (typeof val === 'function') return `<span class="tv-fn">fn()</span>`;
    return DOM.esc(String(val));
  },

  _preview(val) {
    if (Array.isArray(val)) return `[${val.length} items]`;
    if (typeof val === 'object') {
      const keys = Object.keys(val);
      return `{${keys.slice(0, 3).join(', ')}${keys.length > 3 ? ', ...' : ''}}`;
    }
    return '';
  }
};
