/* ═══════════════════════════════════════════════════════════════
   AlgorithmPanel — Code editor + live preview + hot reload
   Edit JS or Python alongside the mockup.
   Uses textarea (CodeMirror integration is optional via vendor/).
   ═══════════════════════════════════════════════════════════════ */
const AlgorithmPanel = {
  _moduleId: null,
  _language: 'js', // 'js' or 'python'
  _originalSource: '',

  async open(moduleId) {
    this._moduleId = moduleId;
    const mod = await ModuleRegistry.get(moduleId);
    if (!mod) return;

    this._originalSource = mod.jsSource || '';

    const html = `
    <div class="modal-header">
      <h3 class="modal-title">⚡ Algorithm Editor — ${DOM.esc(mod.name)}</h3>
      <button class="modal-close" onclick="AlgorithmPanel.close()">✕</button>
    </div>
    <div class="modal-body" style="max-height:70vh;overflow-y:auto">
      <!-- Language toggle -->
      <div style="display:flex;gap:6px;margin-bottom:var(--sp-3)">
        <button class="btn btn-sm ${this._language === 'js' ? 'btn-pink' : 'btn-outline'}" onclick="AlgorithmPanel.setLang('js')">📜 JavaScript</button>
        <button class="btn btn-sm ${this._language === 'python' ? 'btn-green' : 'btn-outline'}" onclick="AlgorithmPanel.setLang('python')">🐍 Python</button>
      </div>

      ${this._language === 'js' ? this._jsEditor(mod) : this._pythonEditor(mod)}

      <!-- Diff view placeholder -->
      <div id="algDiffView" style="margin-top:var(--sp-3)"></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="AlgorithmPanel.revert()">↩️ Revert</button>
      <button class="btn btn-green" onclick="AlgorithmPanel.hotReload()">⚡ Hot Reload</button>
      <button class="btn btn-pink" onclick="AlgorithmPanel.saveAndClose()">💾 Save & Close</button>
    </div>`;

    DOM.setHTML('modalContent', html);
    document.getElementById('modalContent').style.maxWidth = '900px';
    document.getElementById('modalOverlay').classList.add('active');
  },

  _jsEditor(mod) {
    return `
    <div>
      <div class="field-label pink"><span class="dot"></span> JavaScript Source</div>
      <textarea class="textarea" id="algJSEditor" rows="20"
                style="font-family:var(--font-mono);font-size:var(--font-size-sm);background:var(--bg-deep);tab-size:2"
                spellcheck="false">${DOM.esc(mod.jsSource)}</textarea>
      <div style="font-size:var(--font-size-xs);color:var(--text-muted);margin-top:4px">
        Edit the code and click "Hot Reload" to apply changes to the live mockup without refreshing.
      </div>
    </div>`;
  },

  _pythonEditor(mod) {
    const pyScripts = mod.pythonScripts || [];
    const currentPy = pyScripts[0] || { name: 'algorithm.py', source: '# Write your Python algorithm here\n\ndef process(data):\n    """Process data and return result"""\n    return data\n' };

    return `
    <div>
      <div class="field-label" style="color:#3b82f6"><span class="dot" style="background:#3b82f6"></span> Python Algorithm</div>
      <div style="font-size:var(--font-size-xs);color:var(--text-muted);margin-bottom:6px">
        File: <code>${DOM.esc(currentPy.name)}</code> •
        Runs via Pyodide (WASM Python in browser) •
        <span style="color:var(--accent-gold)">First run loads ~11MB runtime</span>
      </div>
      <textarea class="textarea" id="algPyEditor" rows="16"
                style="font-family:var(--font-mono);font-size:var(--font-size-sm);background:var(--bg-deep);tab-size:4"
                spellcheck="false">${DOM.esc(currentPy.source)}</textarea>
      <div class="btn-row" style="margin-top:8px">
        <button class="btn btn-sm btn-green" onclick="AlgorithmPanel.runPython()">▶️ Run Python</button>
        <span id="algPyStatus" style="font-size:var(--font-size-xs);color:var(--text-muted)"></span>
      </div>
      <div id="algPyOutput" style="margin-top:8px"></div>
    </div>`;
  },

  setLang(lang) {
    this._language = lang;
    if (this._moduleId) this.open(this._moduleId);
  },

  async hotReload() {
    if (!this._moduleId) return;
    const editor = document.getElementById('algJSEditor');
    if (!editor) return;

    const newSource = editor.value;
    Sandbox.hotReload(this._moduleId, newSource);

    // Save to registry
    await ModuleRegistry.updateSource(this._moduleId, newSource, undefined);

    // Show diff
    DiffView.render('algDiffView', this._originalSource, newSource);
    Toast.show('Hot reload sent!');
  },

  async runPython() {
    const editor = document.getElementById('algPyEditor');
    const status = document.getElementById('algPyStatus');
    const output = document.getElementById('algPyOutput');
    if (!editor) return;

    status.textContent = 'Loading Python runtime...';
    status.style.color = 'var(--accent-gold)';

    try {
      const result = await PythonRunner.run(editor.value, {});
      status.textContent = 'Completed!';
      status.style.color = 'var(--accent-green)';
      output.innerHTML = `<div class="code-block" style="max-height:200px;overflow-y:auto">
        <code>${DOM.esc(typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result))}</code>
      </div>`;
    } catch (e) {
      status.textContent = 'Error!';
      status.style.color = 'var(--p1)';
      output.innerHTML = `<div style="color:var(--p1);font-size:var(--font-size-sm);padding:8px;background:rgba(239,68,68,.1);border-radius:6px">${DOM.esc(e.message || String(e))}</div>`;
    }
  },

  async revert() {
    if (!this._moduleId) return;
    const mod = await ModuleRegistry.get(this._moduleId);
    if (!mod) return;

    const editor = document.getElementById('algJSEditor');
    if (editor) editor.value = this._originalSource;

    Sandbox.hotReload(this._moduleId, this._originalSource);
    Toast.show('Reverted to original');
  },

  async saveAndClose() {
    if (this._language === 'js') {
      const editor = document.getElementById('algJSEditor');
      if (editor && this._moduleId) {
        await ModuleRegistry.updateSource(this._moduleId, editor.value, undefined);
      }
    } else {
      const editor = document.getElementById('algPyEditor');
      if (editor && this._moduleId) {
        const mod = await ModuleRegistry.get(this._moduleId);
        if (mod) {
          mod.pythonScripts = [{ name: 'algorithm.py', source: editor.value }];
          await Store.put('modules', mod);
        }
      }
    }
    this.close();
    Toast.show('Saved!');
  },

  close() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.getElementById('modalContent').style.maxWidth = '';
    this._moduleId = null;
  }
};
