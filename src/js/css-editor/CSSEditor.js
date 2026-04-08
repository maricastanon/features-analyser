/* ═══════════════════════════════════════════════════════════════
   CSSEditor — Main editor panel for live CSS customization
   Opens alongside a mockup — all changes apply instantly.
   ═══════════════════════════════════════════════════════════════ */
const CSSEditor = {
  _activeModuleId: null,
  _rawMode: false,

  async open(moduleId) {
    this._activeModuleId = moduleId;
    const mod = await ModuleRegistry.get(moduleId);
    if (!mod) return;

    // Parse CSS variables
    const vars = CSSVarExtractor.parse(mod.cssSource);

    // Apply saved overrides
    if (mod.cssOverrides) {
      vars.forEach(v => {
        if (mod.cssOverrides[v.name]) v.value = mod.cssOverrides[v.name];
      });
    }

    // Build editor panel in a modal
    const html = `
    <div class="modal-header">
      <h3 class="modal-title">🎨 CSS Editor — ${DOM.esc(mod.name)}</h3>
      <button class="modal-close" onclick="CSSEditor.close()">✕</button>
    </div>
    <div class="modal-body" style="max-height:70vh;overflow-y:auto">
      <!-- Mode toggle -->
      <div style="display:flex;gap:6px;margin-bottom:var(--sp-4)">
        <button class="btn btn-sm ${this._rawMode ? 'btn-outline' : 'btn-pink'}" onclick="CSSEditor.setMode(false)">🎛️ Visual</button>
        <button class="btn btn-sm ${this._rawMode ? 'btn-pink' : 'btn-outline'}" onclick="CSSEditor.setMode(true)">📝 Raw CSS</button>
      </div>

      ${this._rawMode ? this._rawEditor(mod) : ''}
      <div id="cssVisualControls" style="${this._rawMode ? 'display:none' : ''}"></div>

      <!-- Manual Property Overrides -->
      <div class="css-group" style="margin-top:var(--sp-4)">
        <div class="css-group-title">✏️ Add Custom Override</div>
        <div style="display:flex;gap:6px;align-items:center">
          <input class="input" id="cssOverrideProp" placeholder="property (e.g., border-radius)" style="flex:1;padding:5px 8px;font-size:var(--font-size-xs)">
          <input class="input" id="cssOverrideVal" placeholder="value (e.g., 12px)" style="flex:1;padding:5px 8px;font-size:var(--font-size-xs)">
          <input class="input" id="cssOverrideSel" placeholder="selector (e.g., .card)" style="flex:1;padding:5px 8px;font-size:var(--font-size-xs)">
          <button class="btn btn-sm btn-green" onclick="CSSEditor.addOverride()">Apply</button>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="CSSEditor.resetAll()">🔄 Reset All</button>
      <button class="btn btn-green" onclick="CSSExporter.exportModule('${moduleId}')">⬇️ Export Production CSS+JS</button>
      <button class="btn btn-pink" onclick="CSSEditor.close()">Done</button>
    </div>`;

    DOM.setHTML('modalContent', html);
    // Make modal wider for CSS editor
    document.getElementById('modalContent').style.maxWidth = '800px';
    document.getElementById('modalOverlay').classList.add('active');

    // Render visual controls
    if (!this._rawMode) {
      CSSControls.render(vars, 'cssVisualControls', moduleId);
    }
  },

  _rawEditor(mod) {
    return `<div style="margin-bottom:var(--sp-4)">
      <textarea class="textarea" id="cssRawEditor" rows="20"
                style="font-family:var(--font-mono);font-size:var(--font-size-sm);background:var(--bg-deep)"
                onchange="CSSEditor.applyRawCSS()">${DOM.esc(mod.cssSource)}</textarea>
    </div>`;
  },

  setMode(raw) {
    this._rawMode = raw;
    if (this._activeModuleId) this.open(this._activeModuleId);
  },

  async applyRawCSS() {
    const textarea = document.getElementById('cssRawEditor');
    if (!textarea || !this._activeModuleId) return;
    const newCSS = textarea.value;
    Sandbox.replaceCSS(this._activeModuleId, newCSS);
    await ModuleRegistry.updateSource(this._activeModuleId, undefined, newCSS);
  },

  addOverride() {
    const prop = document.getElementById('cssOverrideProp')?.value.trim();
    const val = document.getElementById('cssOverrideVal')?.value.trim();
    const sel = document.getElementById('cssOverrideSel')?.value.trim() || '*';
    if (!prop || !val) { Toast.show('Property and value required', 'warning'); return; }

    const css = `${sel} { ${prop}: ${val} !important; }`;
    Sandbox.addOverrideCSS(this._activeModuleId, css);
    Toast.show('Override applied!');
  },

  async resetAll() {
    if (!this._activeModuleId) return;
    const mod = await ModuleRegistry.get(this._activeModuleId);
    if (!mod) return;

    // Clear overrides
    mod.cssOverrides = {};
    await Store.put('modules', mod);

    // Re-inject original CSS
    Sandbox.replaceCSS(this._activeModuleId, mod.cssSource);
    Toast.show('Reset to original CSS');

    // Refresh editor
    this.open(this._activeModuleId);
  },

  close() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.getElementById('modalContent').style.maxWidth = '';
    this._activeModuleId = null;
  }
};
