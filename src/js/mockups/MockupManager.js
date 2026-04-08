/* ═══════════════════════════════════════════════════════════════
   MockupManager — Import zone, tab registry, lifecycle
   Manages the mockup panel: import, display, switch between modules.
   ═══════════════════════════════════════════════════════════════ */
const MockupManager = {
  _activeModuleId: null,

  async init() {
    this._renderImportZone();
    await this._renderModuleTabs();
    this._setupMessageListener();
    EventBus.on('project:switched', () => this._renderModuleTabs());
    EventBus.on('module:imported', () => this._renderModuleTabs());
    EventBus.on('module:removed', () => this._renderModuleTabs());
  },

  _renderImportZone() {
    const container = DOM.el('importZone');
    if (!container) return;

    container.innerHTML = `
    <div class="import-zone" id="dropZone" onclick="document.getElementById('importFileInput').click()">
      <div style="font-size:2.5rem;margin-bottom:8px">📦</div>
      <div style="font-size:1rem;font-weight:800;color:var(--accent-green)">Import Feature Module</div>
      <div style="font-size:var(--font-size-sm);color:var(--text-muted);margin-top:4px">Drop JS + CSS + Python files here, or click to browse</div>
      <div style="font-size:var(--font-size-xs);color:var(--accent-pink);margin-top:6px;font-weight:700">Modules load in sandboxed iframes — fully isolated</div>
      <input type="file" id="importFileInput" multiple accept=".js,.css,.py" style="display:none" onchange="MockupManager.handleFileInput(this.files)">
    </div>`;

    // Setup drag-drop
    const zone = document.getElementById('dropZone');
    if (zone) {
      zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
      zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
      zone.addEventListener('drop', async e => {
        e.preventDefault();
        zone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
          await this.importFiles(e.dataTransfer.files);
        }
      });
    }
  },

  async handleFileInput(fileList) {
    await this.importFiles(fileList);
    document.getElementById('importFileInput').value = '';
  },

  async importFiles(fileList) {
    const files = await FileIO.readFiles(fileList);

    if (!files.js.length && !files.css.length) {
      Toast.show('Drop JS and/or CSS files!', 'warning');
      return;
    }

    const jsFile = files.js[0];
    const cssFile = files.css[0];
    const pyFiles = files.py;

    const modName = (jsFile?.name || cssFile?.name || 'module')
      .replace(/\.(js|css)$/, '')
      .replace(/^feature-/, '');

    // Register module
    const mod = await ModuleRegistry.register(
      modName,
      jsFile?.content || '',
      cssFile?.content || '',
      jsFile?.name || '',
      cssFile?.name || ''
    );

    // Store Python files if any
    if (pyFiles.length) {
      mod.pythonScripts = pyFiles.map(f => ({ name: f.name, source: f.content }));
      await Store.put('modules', mod);
    }

    // Auto-add to features
    const addToFeatures = DOM.confirm('Add "' + modName + '" to Features list?');
    if (addToFeatures) {
      await Store.put('features', {
        id: Store.generateId(),
        projectId: App.currentProject.id,
        name: modName,
        description: 'Imported from ' + [jsFile?.name, cssFile?.name].filter(Boolean).join(' + '),
        category: Categories.getAll()[0]?.id || 'custom',
        priority: 3,
        aiPrompt: '',
        status: 'imported',
        uiPattern: '',
        collapsed: true,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      });
      if (typeof Features !== 'undefined') Features.render();
      App.updateCounts();
    }

    await this._renderModuleTabs();
    this.showModule(mod.id);
    Toast.show('Module "' + modName + '" imported! 📦');
  },

  async _renderModuleTabs() {
    const container = DOM.el('mockupTabs');
    if (!container) return;

    const modules = await ModuleRegistry.getAll();
    container.innerHTML = modules.map(m =>
      `<button class="sub-tab ${m.id === this._activeModuleId ? 'active' : ''}"
              onclick="MockupManager.showModule('${m.id}')">
        📦 ${DOM.esc(m.name)}
      </button>`
    ).join('') || '<span style="font-size:var(--font-size-sm);color:var(--text-muted)">No modules imported yet</span>';
  },

  async showModule(moduleId) {
    this._activeModuleId = moduleId;
    this._renderModuleTabs();

    const content = DOM.el('mockupContent');
    if (!content) return;

    const mod = await ModuleRegistry.get(moduleId);
    if (!mod) { content.innerHTML = ''; return; }

    content.innerHTML = `
    <div style="margin-top:14px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <h3 style="font-size:1rem;font-weight:800;color:var(--accent-pink)">📦 ${DOM.esc(mod.name)}</h3>
        <div class="btn-row">
          <button class="btn btn-sm btn-green" onclick="MockupManager.downloadModule('${moduleId}')">⬇️ Download</button>
          <button class="btn btn-sm btn-pink" onclick="MockupManager.openCSSEditor('${moduleId}')">🎨 CSS Editor</button>
          <button class="btn btn-sm btn-outline" onclick="MockupManager.openIntegration('${moduleId}')">🔧 Integration Guide</button>
          <button class="btn btn-sm btn-outline btn-danger" onclick="MockupManager.removeModule('${moduleId}')">🗑️</button>
        </div>
      </div>
      <div style="font-size:var(--font-size-xs);color:var(--text-muted);margin-bottom:10px">
        ${mod.jsFileName ? 'JS: ' + mod.jsFileName : ''} ${mod.cssFileName ? '• CSS: ' + mod.cssFileName : ''}
        ${mod.pythonScripts?.length ? '• Python: ' + mod.pythonScripts.map(p => p.name).join(', ') : ''}
      </div>
      <div id="sandboxContainer-${moduleId}" style="position:relative">
        <span style="position:absolute;top:-10px;left:14px;background:var(--bg-deep);padding:2px 10px;font-size:var(--font-size-xs);font-weight:800;color:var(--accent-green);text-transform:uppercase;letter-spacing:1px;border:1px solid var(--border-soft);border-radius:5px;z-index:1">LIVE MOCKUP — SANDBOXED</span>
      </div>
    </div>`;

    // Create sandbox iframe
    const sandboxContainer = document.getElementById('sandboxContainer-' + moduleId);
    if (sandboxContainer) {
      Sandbox.destroy(moduleId); // destroy old if exists
      Sandbox.create(moduleId, sandboxContainer, mod.jsSource, mod.cssSource);
    }
  },

  async downloadModule(moduleId) {
    const mod = await ModuleRegistry.get(moduleId);
    if (!mod) return;
    const files = [];
    if (mod.jsSource) files.push({ name: mod.jsFileName || mod.name + '.js', content: mod.jsSource });
    if (mod.cssSource) files.push({ name: mod.cssFileName || mod.name + '.css', content: mod.cssSource });
    mod.pythonScripts?.forEach(py => files.push({ name: py.name, content: py.source }));
    FileIO.downloadBundle(files);
    Toast.show('Downloading module files! ⬇️');
  },

  openCSSEditor(moduleId) {
    if (typeof CSSEditor !== 'undefined') {
      CSSEditor.open(moduleId);
    } else {
      Toast.show('CSS Editor not loaded yet', 'warning');
    }
  },

  openIntegration(moduleId) {
    if (typeof IntegrationGuide !== 'undefined') {
      App.go('integration');
      IntegrationGuide.showForModule(moduleId);
    }
  },

  async removeModule(moduleId) {
    if (!DOM.confirm('Remove this module?')) return;
    Sandbox.destroy(moduleId);
    await ModuleRegistry.remove(moduleId);
    this._activeModuleId = null;
    DOM.setHTML('mockupContent', '');
    await this._renderModuleTabs();
    Toast.show('Module removed');
  },

  _setupMessageListener() {
    window.addEventListener('message', (e) => {
      const msg = e.data;
      if (!msg || !msg.type) return;

      if (msg.type === 'sandbox-ready') {
        // Module is loaded and ready
      }
      else if (msg.type === 'computed-vars') {
        EventBus.emit('sandbox:computed-vars', msg);
      }
      else if (msg.type === 'module-state') {
        EventBus.emit('sandbox:state', msg);
      }
      else if (msg.type === 'data-flow') {
        EventBus.emit('sandbox:data-flow', msg);
      }
      else if (msg.type === 'hot-reload-done') {
        Toast.show('Hot reload complete!');
      }
      else if (msg.type === 'hot-reload-error') {
        Toast.show('Hot reload error: ' + msg.error, 'error');
      }
    });
  }
};
