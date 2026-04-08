/* ═══════════════════════════════════════════════════════════════
   IntegrationGuide — Main guide panel with step-by-step
   The "coding arms" — helps learners manually add features.
   ═══════════════════════════════════════════════════════════════ */
const IntegrationGuide = {
  _selectedPattern: null,
  _config: { name: '', emoji: '📦', usePython: false },
  _moduleId: null,

  init() {
    this.render();
  },

  async showForModule(moduleId) {
    this._moduleId = moduleId;
    const mod = await ModuleRegistry.get(moduleId);
    if (mod) {
      this._config.name = mod.name;
      this._config.emoji = '📦';
    }
    this.render();
  },

  render() {
    const container = DOM.el('integrationContent');
    if (!container) return;

    container.innerHTML = `
    <!-- Step 1: Configure -->
    <div class="card" style="margin-bottom:var(--sp-4)">
      <div style="padding:14px">
        <h3 style="font-size:var(--font-size-lg);font-weight:800;color:var(--accent-pink);margin-bottom:var(--sp-3)">Step 1: Configure Your Feature</h3>
        <div style="display:grid;grid-template-columns:1fr 80px auto;gap:8px;align-items:end">
          <div>
            <label class="field-label"><span class="dot"></span> Feature Name</label>
            <input class="input" id="igName" value="${DOM.esc(this._config.name)}" placeholder="My Feature"
                   onchange="IntegrationGuide._config.name=this.value;IntegrationGuide._refresh()">
          </div>
          <div>
            <label class="field-label"><span class="dot"></span> Icon</label>
            <input class="input" id="igEmoji" value="${this._config.emoji}" style="text-align:center;font-size:1.2rem"
                   onchange="IntegrationGuide._config.emoji=this.value;IntegrationGuide._refresh()">
          </div>
          <div>
            <label style="font-size:var(--font-size-xs);color:var(--text-muted);display:flex;align-items:center;gap:4px;cursor:pointer">
              <input type="checkbox" id="igPython" ${this._config.usePython ? 'checked' : ''}
                     onchange="IntegrationGuide._config.usePython=this.checked;IntegrationGuide._refresh()">
              🐍 Uses Python
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2: Choose Pattern -->
    <div class="card" style="margin-bottom:var(--sp-4)">
      <div style="padding:14px">
        <h3 style="font-size:var(--font-size-lg);font-weight:800;color:var(--accent-green);margin-bottom:var(--sp-3)">Step 2: Choose UI Pattern</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px">
          ${UIPatterns.getAllPatterns().map(p => this._patternCard(p)).join('')}
        </div>
      </div>
    </div>

    <!-- Step 3: Generated Code -->
    <div id="igGeneratedCode"></div>`;

    this._refresh();
  },

  _patternCard(pattern) {
    const isSelected = this._selectedPattern === pattern.id;
    const name = this._config.name || 'Feature';
    const preview = (pattern.preview || '').split('{{name}}').join(name);

    return `<div class="card" style="cursor:pointer;${isSelected ? 'border-color:var(--accent-pink);box-shadow:var(--shadow-pink)' : ''}"
                onclick="IntegrationGuide.selectPattern('${pattern.id}')">
      <div style="padding:10px">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
          <span style="font-size:1.2rem">${pattern.emoji}</span>
          <span style="font-weight:800;font-size:var(--font-size-sm)">${pattern.name}</span>
          ${isSelected ? '<span class="badge badge-pink" style="margin-left:auto">Selected</span>' : ''}
        </div>
        <div style="font-size:var(--font-size-xs);color:var(--text-muted);margin-bottom:8px">${pattern.description}</div>
        <div style="background:var(--bg-deep);border:1px solid var(--border-soft);border-radius:6px;overflow:hidden;min-height:40px">
          ${preview}
        </div>
        <div style="font-size:var(--font-size-xs);color:var(--accent-green);margin-top:4px;font-style:italic">${pattern.whenToUse}</div>
      </div>
    </div>`;
  },

  selectPattern(id) {
    this._selectedPattern = id;
    this._refresh();
  },

  _refresh() {
    // Refresh pattern cards selection state
    const cards = document.querySelectorAll('#integrationContent .card');

    // Generate code if pattern is selected
    if (this._selectedPattern && this._config.name) {
      const code = CodeGenerator.generate(this._selectedPattern, this._config);
      if (code) this._renderGeneratedCode(code);
    }
  },

  _renderGeneratedCode(code) {
    const container = document.getElementById('igGeneratedCode');
    if (!container) return;

    container.innerHTML = `
    <div class="card" style="margin-bottom:var(--sp-4)">
      <div style="padding:14px">
        <h3 style="font-size:var(--font-size-lg);font-weight:800;color:var(--accent-pink);margin-bottom:var(--sp-3)">Step 3: Copy & Integrate</h3>

        <!-- HTML -->
        <div style="margin-bottom:var(--sp-4)">
          <div class="field-label"><span class="dot"></span> 📄 HTML — Add to index.html</div>
          <div class="code-block">
            <button class="copy-btn" onclick="DOM.copy(document.getElementById('igHTML').textContent)">📋 Copy</button>
            <code id="igHTML">${DOM.esc(code.html)}</code>
          </div>
        </div>

        <!-- JS -->
        <div style="margin-bottom:var(--sp-4)">
          <div class="field-label pink"><span class="dot"></span> 📜 JavaScript — Integration code</div>
          <div class="code-block">
            <button class="copy-btn" onclick="DOM.copy(document.getElementById('igJS').textContent)">📋 Copy</button>
            <code id="igJS">${DOM.esc(code.js)}</code>
          </div>
        </div>

        <!-- CSS -->
        <div style="margin-bottom:var(--sp-4)">
          <div class="field-label" style="color:var(--accent-gold)"><span class="dot" style="background:var(--accent-gold)"></span> 🎨 CSS — Additional styles</div>
          <div class="code-block">
            <button class="copy-btn" onclick="DOM.copy(document.getElementById('igCSS').textContent)">📋 Copy</button>
            <code id="igCSS">${DOM.esc(code.css)}</code>
          </div>
        </div>

        ${code.python ? `
        <!-- Python -->
        <div style="margin-bottom:var(--sp-4)">
          <div class="field-label" style="color:#3b82f6"><span class="dot" style="background:#3b82f6"></span> 🐍 Python Algorithm</div>
          <div class="code-block">
            <button class="copy-btn" onclick="DOM.copy(document.getElementById('igPY').textContent)">📋 Copy</button>
            <code id="igPY">${DOM.esc(code.python)}</code>
          </div>
        </div>` : ''}

        <!-- Checklist -->
        <div style="margin-top:var(--sp-4)">
          <div class="field-label"><span class="dot"></span> 📋 Integration Checklist</div>
          <div id="igChecklist">
            ${code.checklist.map((c, i) => `
              <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border-soft);cursor:pointer"
                   onclick="this.querySelector('span').textContent=this.querySelector('span').textContent==='☐'?'☑️':'☐'">
                <span style="font-size:1rem">${c.done ? '☑️' : '☐'}</span>
                <span style="font-size:var(--font-size-sm)">${DOM.esc(c.text)}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Download All -->
        <div class="btn-row" style="margin-top:var(--sp-4)">
          <button class="btn btn-pink" onclick="IntegrationGuide.downloadAll()">⬇️ Download All Files</button>
          <button class="btn btn-green" onclick="IntegrationGuide.copyAll()">📋 Copy All Code</button>
        </div>
      </div>
    </div>`;
  },

  downloadAll() {
    if (!this._selectedPattern || !this._config.name) return;
    const code = CodeGenerator.generate(this._selectedPattern, this._config);
    if (!code) return;

    const slug = this._config.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const files = [
      { name: slug + '.html', content: '<!-- Integration HTML -->\n' + code.html },
      { name: slug + '.js', content: code.js },
      { name: slug + '.css', content: code.css }
    ];
    if (code.python) files.push({ name: slug + '.py', content: code.python });

    FileIO.downloadBundle(files);
    Toast.show('Files downloaded! ⬇️');
  },

  copyAll() {
    if (!this._selectedPattern || !this._config.name) return;
    const code = CodeGenerator.generate(this._selectedPattern, this._config);
    if (!code) return;

    const all = `=== HTML ===\n${code.html}\n\n=== JS ===\n${code.js}\n\n=== CSS ===\n${code.css}${code.python ? '\n\n=== PYTHON ===\n' + code.python : ''}`;
    DOM.copy(all);
  }
};
