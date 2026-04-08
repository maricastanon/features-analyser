/* ═══════════════════════════════════════════════
   FEATURE: Component Library — Universal Module
   Browse, preview, and copy reusable UI components.
   ═══════════════════════════════════════════════ */
const FeatComponentLibrary = {
  components: [],
  filter: 'all',

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this._seed();
    this.render();
  },

  _seed() {
    this.components = [
      { id: 1, name: 'Primary Button', category: 'buttons', preview: 'button',
        html: '<button class="btn-primary">Click Me</button>',
        css: '.btn-primary{background:#22c55e;color:#000;padding:8px 20px;border:none;border-radius:6px;font-weight:700;cursor:pointer;transition:all .2s}.btn-primary:hover{filter:brightness(1.2);transform:scale(1.05)}',
        usage: 12, status: 'stable' },
      { id: 2, name: 'Alert Card', category: 'cards', preview: 'card',
        html: '<div class="alert-card"><span class="alert-icon">⚠️</span><div class="alert-body"><strong>Warning</strong><p>Something needs attention</p></div></div>',
        css: '.alert-card{display:flex;gap:10px;padding:12px;background:#f9731622;border:1px solid #f97316;border-radius:8px;color:#e8f5e9}.alert-icon{font-size:1.5rem}.alert-body p{margin:4px 0 0;font-size:.8rem;color:#5a8a60}',
        usage: 8, status: 'stable' },
      { id: 3, name: 'Avatar Group', category: 'avatars', preview: 'avatars',
        html: '<div class="avatar-group"><div class="avatar" style="background:#e91e90">AB</div><div class="avatar" style="background:#3b82f6">CD</div><div class="avatar" style="background:#22c55e">EF</div><div class="avatar avatar-more">+3</div></div>',
        css: '.avatar-group{display:flex}.avatar{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:800;color:#fff;border:2px solid #0d1f17;margin-left:-8px}.avatar:first-child{margin-left:0}.avatar-more{background:#1a3d28;color:#5a8a60}',
        usage: 15, status: 'stable' },
      { id: 4, name: 'Progress Ring', category: 'indicators', preview: 'ring',
        html: '<div class="prog-ring"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.9" class="ring-bg"/><circle cx="18" cy="18" r="15.9" class="ring-fill" stroke-dasharray="75, 100"/></svg><span class="ring-text">75%</span></div>',
        css: '.prog-ring{position:relative;width:60px;height:60px}.prog-ring svg{width:100%;height:100%;transform:rotate(-90deg)}.ring-bg{fill:none;stroke:#1a3d28;stroke-width:3}.ring-fill{fill:none;stroke:#22c55e;stroke-width:3;stroke-linecap:round;transition:stroke-dasharray .5s}.ring-text{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:.75rem;font-weight:800;color:#22c55e}',
        usage: 6, status: 'stable' },
      { id: 5, name: 'Stat Card', category: 'cards', preview: 'stat',
        html: '<div class="stat-card"><div class="stat-val">2,847</div><div class="stat-label">Active Users</div><div class="stat-trend stat-up">↑ 12%</div></div>',
        css: '.stat-card{background:#163224;border:1px solid #1a3d28;border-radius:8px;padding:14px;text-align:center}.stat-val{font-size:1.8rem;font-weight:900;color:#22c55e}.stat-label{font-size:.7rem;color:#5a8a60;margin:4px 0}.stat-trend{font-size:.75rem;font-weight:700}.stat-up{color:#22c55e}.stat-down{color:#ef4444}',
        usage: 20, status: 'stable' },
      { id: 6, name: 'Tag Input', category: 'inputs', preview: 'tags',
        html: '<div class="tag-input-wrap"><span class="tag">React<button class="tag-x">×</button></span><span class="tag">TypeScript<button class="tag-x">×</button></span><input class="tag-input" placeholder="Add tag..."></div>',
        css: '.tag-input-wrap{display:flex;flex-wrap:wrap;gap:4px;padding:6px;background:#0d1f17;border:1px solid #1a3d28;border-radius:6px}.tag{display:flex;align-items:center;gap:2px;padding:2px 8px;background:#e91e9022;border:1px solid #e91e9044;border-radius:4px;font-size:.72rem;font-weight:700;color:#e91e90}.tag-x{background:none;border:none;color:#e91e90;cursor:pointer;font-size:.8rem;padding:0 2px}.tag-input{background:none;border:none;color:#e8f5e9;font-size:.78rem;flex:1;min-width:60px;outline:none}',
        usage: 9, status: 'beta' }
    ];
  },

  render() {
    const categories = [...new Set(this.components.map(c => c.category))];
    const filtered = this.filter === 'all' ? this.components : this.components.filter(c => c.category === this.filter);

    this.container.innerHTML = `
    <div class="feat-cl-wrap">
      <div class="cl-header">
        <h3 style="color:#e91e90;margin:0;font-size:1rem">🧩 Component Library</h3>
        <span style="font-size:0.72rem;color:#5a8a60">${this.components.length} components</span>
      </div>
      <div class="cl-filters">
        <button class="cl-filter ${this.filter==='all'?'active':''}" onclick="FeatComponentLibrary.setFilter('all')">All</button>
        ${categories.map(c => `<button class="cl-filter ${this.filter===c?'active':''}"
          onclick="FeatComponentLibrary.setFilter('${c}')">${c}</button>`).join('')}
      </div>
      <div class="cl-grid">
        ${filtered.map(comp => `
          <div class="cl-comp-card">
            <div class="cl-comp-preview" id="preview-${comp.id}"></div>
            <div class="cl-comp-info">
              <div class="cl-comp-name">${this._esc(comp.name)}</div>
              <div class="cl-comp-meta">
                <span class="cl-comp-cat">${comp.category}</span>
                <span class="cl-comp-usage">${comp.usage} uses</span>
              </div>
            </div>
            <div class="cl-comp-actions">
              <button class="cl-copy" onclick="FeatComponentLibrary.copyHTML(${comp.id})" title="Copy HTML">📋 HTML</button>
              <button class="cl-copy" onclick="FeatComponentLibrary.copyCSS(${comp.id})" title="Copy CSS">🎨 CSS</button>
            </div>
          </div>`).join('')}
      </div>
    </div>`;

    // Render previews in shadow DOM for isolation
    filtered.forEach(comp => {
      const el = document.getElementById('preview-' + comp.id);
      if (el) {
        const shadow = el.attachShadow({ mode: 'open' });
        shadow.innerHTML = `<style>${comp.css}</style><div style="padding:10px;display:flex;align-items:center;justify-content:center">${comp.html}</div>`;
      }
    });
  },

  setFilter(f) { this.filter = f; this.render(); },

  copyHTML(id) {
    const comp = this.components.find(c => c.id === id);
    if (comp) { navigator.clipboard?.writeText(comp.html); alert('HTML copied!'); }
  },

  copyCSS(id) {
    const comp = this.components.find(c => c.id === id);
    if (comp) { navigator.clipboard?.writeText(comp.css); alert('CSS copied!'); }
  },

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },
  exportState() { return { components: this.components }; },
  importState(s) { if (s.components) this.components = s.components; this.render(); }
};
