/* ═══════════════════════════════════════════════════════════════
   MockupManager — Work item lab for code mockups and references
   Handles imports, bundled modules, previews, promotion, and export.
   ═══════════════════════════════════════════════════════════════ */
const MockupManager = {
  _activeModuleId: null,
  _initialized: false,

  STATUS_META: {
    draft:         { label: 'Draft',          className: 'badge-p3' },
    review:        { label: 'Review',         className: 'badge-pink' },
    feature:       { label: 'Feature',        className: 'badge-green' },
    improvement:   { label: 'Improvement',    className: 'badge-gold' },
    implementation:{ label: 'Implementation', className: 'badge-p2' },
    done:          { label: 'Done',           className: 'badge-green' },
    archived:      { label: 'Archived',       className: 'badge-p5' }
  },

  async init() {
    this._renderImportZone();
    await this._renderBundledLibrary();
    await this._renderModuleTabs();
    if (this._initialized) return;
    this._setupMessageListener();
    EventBus.on('project:switched', async () => {
      await this._renderBundledLibrary();
      await this._renderModuleTabs();
      DOM.setHTML('mockupContent', '');
      this._activeModuleId = null;
    });
    EventBus.on('module:imported', async () => {
      await this._renderBundledLibrary();
      await this._renderModuleTabs();
    });
    EventBus.on('module:removed', async () => {
      await this._renderBundledLibrary();
      await this._renderModuleTabs();
    });
    EventBus.on('module:updated', async () => {
      await this._renderBundledLibrary();
      await this._renderModuleTabs();
      if (this._activeModuleId) {
        await this.showModule(this._activeModuleId);
      }
    });
    this._initialized = true;
  },

  _renderImportZone() {
    const container = DOM.el('importZone');
    if (!container) return;

    container.innerHTML = `
    <div class="import-zone" id="dropZone" onclick="document.getElementById('importFileInput').click()">
      <div style="font-size:2.5rem;margin-bottom:8px">📦</div>
      <div style="font-size:1rem;font-weight:800;color:var(--accent-green)">Import Work Item</div>
      <div style="font-size:var(--font-size-sm);color:var(--text-muted);margin-top:4px">
        Drop JS, CSS, HTML, Python, markdown, JSON, SVG, or images
      </div>
      <div style="font-size:var(--font-size-xs);color:var(--accent-pink);margin-top:6px;font-weight:700">
        Code bundles become live mockups. Mindmaps and notes become reviewable references.
      </div>
      <input type="file" id="importFileInput" multiple accept=".js,.css,.html,.htm,.py,.md,.markdown,.mmd,.txt,.csv,.json,.svg,.png,.jpg,.jpeg,.webp,.gif" style="display:none" onchange="MockupManager.handleFileInput(this.files)">
    </div>
    <div class="btn-row" style="margin-bottom:var(--sp-4)">
      <button class="btn btn-pink" onclick="MockupManager.loadStarterSet()">🚀 Load 17 Universal Mockups</button>
      <button class="btn btn-outline" onclick="MockupManager.loadBundledSet('company-x1')">🏢 Company X1 Set</button>
      <button class="btn btn-outline" onclick="MockupManager.loadBundledSet('marex-dynamic')">🌱 Marex Dynamic Set</button>
      <button class="btn btn-outline" onclick="MockupManager.loadAllBundled()">📚 Load Full Catalog</button>
      <button class="btn btn-outline" onclick="MockupManager.exportProjectList()">📝 Export Project List</button>
    </div>
    <div id="bundledLibrary"></div>`;

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

  _bundledTagFilter: 'all',
  _bundledSearch: '',

  async _renderBundledLibrary() {
    const container = DOM.el('bundledLibrary');
    if (!container) return;
    const existing = await ModuleRegistry.getAll();
    const loadedIds = new Set(existing.map(item => item.bundleId).filter(Boolean));
    const allItems = BundledModules.getAll();
    const allTags = BundledModules.getAllTags();
    let items = this._bundledTagFilter === 'all' ? allItems : allItems.filter(item => (item.tags || []).includes(this._bundledTagFilter));
    if (this._bundledSearch) { const q = this._bundledSearch.toLowerCase(); items = items.filter(item => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || (item.tags || []).some(t => t.includes(q))); }
    const tagCounts = {}; allItems.forEach(item => (item.tags || []).forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
    const primaryTags = ['project-manager', 'team-project-manager', 'universal'];
    const topicTags = allTags.filter(t => !primaryTags.includes(t));
    const remaining = items.filter(i => !loadedIds.has(i.id)).length;
    container.innerHTML = `
    <div class="card" style="margin-bottom:var(--sp-4)">
      <div class="card-body">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:var(--sp-3);flex-wrap:wrap">
          <div>
            <div class="field-label pink"><span class="dot"></span> Built-In Functional Mockups</div>
            <div style="font-size:var(--font-size-sm);color:var(--text-muted)">${allItems.length} modules across ${allTags.length} tags. Filter, search, or load all.</div>
          </div>
          <div style="display:flex;gap:6px;align-items:center">
            <span class="badge badge-green">${loadedIds.size}/${allItems.length} loaded</span>
            <span class="badge badge-p5">${items.length} shown</span>
          </div>
        </div>
        <div style="margin-bottom:10px"><input class="input" type="text" placeholder="Search modules..." value="${DOM.esc(this._bundledSearch)}" oninput="MockupManager._bundledSearch=this.value;MockupManager._renderBundledLibrary()" style="width:100%;padding:8px 12px"></div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">
          <button class="tag-filter-btn ${this._bundledTagFilter==='all'?'active':''}" onclick="MockupManager.filterByTag('all')">All (${allItems.length})</button>
          ${primaryTags.map(tag=>'<button class="tag-filter-btn tag-filter-primary '+(this._bundledTagFilter===tag?'active':'')+'" onclick="MockupManager.filterByTag(\''+tag+'\')">'+tag+' ('+(tagCounts[tag]||0)+')</button>').join('')}
        </div>
        <div style="display:flex;gap:3px;flex-wrap:wrap;margin-bottom:12px">
          ${topicTags.map(tag=>'<button class="tag-filter-chip '+(this._bundledTagFilter===tag?'active':'')+'" onclick="MockupManager.filterByTag(\''+tag+'\')">'+tag+' <span style="opacity:0.5">'+(tagCounts[tag]||0)+'</span></button>').join('')}
        </div>
        <div class="bundled-grid">
          ${items.length?items.map(item=>`
            <div class="bundled-card ${loadedIds.has(item.id)?'bundled-loaded':''}">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:6px">
                <div style="font-weight:800;color:var(--text-primary)">${DOM.esc(item.name)}</div>
                ${loadedIds.has(item.id)?'<span class="badge badge-green">Loaded</span>':''}
              </div>
              <div style="font-size:var(--font-size-sm);color:var(--text-muted);line-height:1.5">${DOM.esc(item.description)}</div>
              <div class="bundled-tags">
                ${(item.tags||[]).map(tag=>'<span class="bundled-tag '+(this._bundledTagFilter===tag?'bundled-tag-active':'')+'" onclick="event.stopPropagation();MockupManager.filterByTag(\''+tag+'\')" style="cursor:pointer">'+DOM.esc(tag)+'</span>').join('')}
              </div>
              <div class="btn-row" style="margin-top:10px">
                <button class="btn btn-sm ${loadedIds.has(item.id)?'btn-outline':'btn-green'}" onclick="MockupManager.importBundled('${item.id}')" ${loadedIds.has(item.id)?'disabled':''}>${loadedIds.has(item.id)?'Loaded':'Load'}</button>
              </div>
            </div>`).join(''):'<div style="grid-column:1/-1;text-align:center;padding:20px;color:var(--text-muted)">No modules match filter</div>'}
        </div>
        <div class="btn-row" style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border-soft)">
          <button class="btn btn-sm btn-pink" onclick="MockupManager.loadFilteredBundled()">Load ${this._bundledTagFilter==='all'?'All':'"'+this._bundledTagFilter+'"'} (${remaining} remaining)</button>
          <button class="btn btn-sm btn-outline" onclick="MockupManager.loadAllBundled()">Load Full Catalog</button>
        </div>
      </div>
    </div>`;
  },

  filterByTag(tag) { this._bundledTagFilter = tag; this._renderBundledLibrary(); },

  async loadFilteredBundled() {
    let items = this._bundledTagFilter === 'all' ? BundledModules.getAll() : BundledModules.getByTag(this._bundledTagFilter);
    if (this._bundledSearch) { const q = this._bundledSearch.toLowerCase(); items = items.filter(i => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)); }
    for (const item of items) { await this.importBundled(item.id, { silent: true }); }
    await this._renderBundledLibrary(); await this._renderModuleTabs();
    Toast.show('Loaded ' + items.length + ' modules.');
  },


  async handleFileInput(fileList) {
    await this.importFiles(fileList);
    document.getElementById('importFileInput').value = '';
  },

  async importFiles(fileList) {
    const files = await FileIO.readFiles(fileList);
    const created = [];

    const hasCodeBundle = files.js.length || files.css.length || files.html.length;
    const artifactFiles = [...files.md, ...files.text, ...files.json, ...files.svg, ...files.images];

    if (hasCodeBundle) {
      const name = this._deriveWorkItemName(files);
      const mod = await ModuleRegistry.registerModule({
        name,
        origin: 'imported',
        status: 'review',
        summary: this._buildImportSummary(files),
        jsSource: this._mergeTextFiles(files.js, 'js'),
        cssSource: this._mergeTextFiles(files.css, 'css'),
        htmlSource: this._mergeHTMLFiles(files.html),
        jsFileNames: files.js.map(file => file.name),
        cssFileNames: files.css.map(file => file.name),
        htmlFileName: files.html.map(file => file.name).join(', '),
        sourceFiles: [
          ...files.js.map(file => file.name),
          ...files.css.map(file => file.name),
          ...files.html.map(file => file.name)
        ],
        pythonScripts: files.py.map(file => ({ name: file.name, source: file.content }))
      });
      created.push(await this._analyseAndLinkModule(mod));
    }

    for (const file of artifactFiles) {
      const item = await ModuleRegistry.registerArtifact({
        name: this._stripExtension(file.name),
        origin: 'imported',
        artifactType: this._artifactType(file),
        artifactSource: file.content,
        artifactFileName: file.name,
        sourceFiles: [file.name],
        summary: 'Imported reference: ' + file.name
      });
      created.push(item);
    }

    if (!created.length) {
      Toast.show('Drop supported files such as JS/CSS/HTML or reference files.', 'warning');
      return;
    }

    await this._renderBundledLibrary();
    await this._renderModuleTabs();
    await this.showModule(created[0].id);

    const ignoredCount = files.other.length;
    Toast.show(
      ignoredCount
        ? `${created.length} item(s) imported. ${ignoredCount} unsupported file(s) skipped.`
        : `${created.length} item(s) imported!`
    );
  },

  async importBundled(itemId, options = {}) {
    if (!App.currentProject) {
      Toast.show('Create or choose a project first.', 'warning');
      return null;
    }
    const existing = await ModuleRegistry.getAll();
    const already = existing.find(item => item.bundleId === itemId);

    const bundle = await BundledModules.load(itemId);
    const mod = await ModuleRegistry.registerModule({
      name: bundle.name,
      origin: 'bundled',
      projectId: App.currentProject?.id,
      bundleId: bundle.id,
      status: 'review',
      summary: bundle.description,
      jsSource: bundle.jsSource,
      cssSource: bundle.cssSource,
      jsFileNames: [bundle.jsPath.split('/').pop()],
      cssFileNames: [bundle.cssPath.split('/').pop()],
      sourceFiles: [bundle.jsPath.split('/').pop(), bundle.cssPath.split('/').pop()]
    });
    const analyzed = await this._analyseAndLinkModule(mod);

    await this._renderBundledLibrary();
    await this._renderModuleTabs();
    if (!options.silent) {
      await this.showModule(analyzed.id);
      Toast.show(`${already ? 'Refreshed' : 'Loaded'} "${bundle.name}"`);
    }
    return analyzed;
  },

  async loadBundledSet(appType) {
    if (!App.currentProject) {
      Toast.show('Create or choose a project first.', 'warning');
      return;
    }
    const items = BundledModules.getRecommended(appType);
    const loaded = [];
    for (const item of items) {
      const result = await this.importBundled(item.id, { silent: true });
      if (result?.bundleId === item.id) loaded.push(result);
    }
    await this._renderBundledLibrary();
    await this._renderModuleTabs();
    if (loaded[0]) {
      await this.showModule(loaded[0].id);
      App.go('mockups');
    }
    Toast.show(`Recommended set processed for ${appType}.`);
  },

  async loadStarterSet() {
    if (!App.currentProject) {
      Toast.show('Create or choose a project first.', 'warning');
      return;
    }
    const items = BundledModules.getStarterSet();
    const loaded = [];
    for (const item of items) {
      const result = await this.importBundled(item.id, { silent: true });
      if (result?.bundleId === item.id) loaded.push(result);
    }
    await this._renderBundledLibrary();
    await this._renderModuleTabs();
    if (loaded[0]) {
      await this.showModule(loaded[0].id);
      App.go('mockups');
    }
    Toast.show('17 starter mockups loaded.');
  },

  async loadAllBundled() {
    if (!App.currentProject) {
      Toast.show('Create or choose a project first.', 'warning');
      return;
    }
    let first = null;
    for (const item of BundledModules.getAll()) {
      const result = await this.importBundled(item.id, { silent: true });
      if (!first && result) first = result;
    }
    await this._renderBundledLibrary();
    await this._renderModuleTabs();
    if (first) {
      await this.showModule(first.id);
      App.go('mockups');
    }
    Toast.show('Bundled catalog loaded.');
  },

  async _renderModuleTabs() {
    const container = DOM.el('mockupTabs');
    if (!container) return;

    const modules = await ModuleRegistry.getAll();
    container.innerHTML = modules.map(item => `
      <button class="sub-tab ${item.id === this._activeModuleId ? 'active' : ''}"
              onclick="MockupManager.showModule('${item.id}')">
        ${this._itemIcon(item)} ${DOM.esc(item.name)}${item.status === 'done' ? ' ✅' : item.status === 'archived' ? ' 🗂️' : item.status === 'implementation' ? ' 🎯' : item.status === 'improvement' ? ' 🔧' : ''}
      </button>
    `).join('') || '<span style="font-size:var(--font-size-sm);color:var(--text-muted)">No work items imported yet</span>';
  },

  async showModule(moduleId) {
    this._activeModuleId = moduleId;
    await this._renderModuleTabs();

    const content = DOM.el('mockupContent');
    if (!content) return;

    const mod = await ModuleRegistry.get(moduleId);
    if (!mod) {
      content.innerHTML = '';
      return;
    }

    const status = this.STATUS_META[mod.status] || this.STATUS_META.review;
    const categories = Categories.getAll();
    const categoryOptions = categories.map(cat => `
      <option value="${cat.id}" ${cat.id === mod.category ? 'selected' : ''}>${cat.emoji} ${DOM.esc(cat.name)}</option>
    `).join('');

    content.innerHTML = `
    <div style="margin-top:14px">
      <div class="card" style="margin-bottom:var(--sp-4)">
        <div class="card-body">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:10px">
            <div>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                <h3 style="font-size:1rem;font-weight:800;color:var(--accent-pink)">${this._itemIcon(mod)} ${DOM.esc(mod.name)}</h3>
                <span class="badge ${status.className}">${status.label}</span>
                <span class="badge badge-p5">${mod.kind === 'artifact' ? 'Reference' : 'Mockup'}</span>
                ${mod.origin === 'bundled' ? '<span class="badge badge-gold">Bundled</span>' : ''}
              </div>
              <div style="font-size:var(--font-size-xs);color:var(--text-muted);margin-top:6px">${this._fileSummary(mod)}</div>
            </div>
            <div class="btn-row">
              ${mod.kind === 'code' ? `<button class="btn btn-sm btn-green" onclick="MockupManager.openAlgorithmEditor('${moduleId}')">⚡ Code</button>` : ''}
              ${mod.kind === 'code' ? `<button class="btn btn-sm btn-pink" onclick="MockupManager.openCSSEditor('${moduleId}')">🎨 CSS</button>` : ''}
              ${mod.kind === 'code' ? `<button class="btn btn-sm btn-outline" onclick="MockupManager.openIntegration('${moduleId}')">🔧 Integrate</button>` : ''}
              <button class="btn btn-sm btn-outline" onclick="MockupManager.downloadModule('${moduleId}')">⬇️ Export</button>
              <button class="btn btn-sm btn-outline btn-danger" onclick="MockupManager.removeModule('${moduleId}')">🗑️</button>
            </div>
          </div>

          <div class="grid-2" style="margin-bottom:12px">
            <div>
              <div class="field-label"><span class="dot"></span> Summary</div>
              <textarea class="textarea" rows="3" placeholder="What is this item and why does it matter?"
                        onchange="MockupManager.updateMeta('${moduleId}','summary',this.value)">${DOM.esc(mod.summary || '')}</textarea>
            </div>
            <div>
              <div class="field-label pink"><span class="dot"></span> Improvement Notes</div>
              <textarea class="textarea" rows="3" placeholder="How should this evolve or integrate?"
                        onchange="MockupManager.updateMeta('${moduleId}','notes',this.value)">${DOM.esc(mod.notes || '')}</textarea>
            </div>
          </div>

          <div class="work-item-meta">
            <div>
              <div class="field-label"><span class="dot"></span> Category</div>
              <select class="select" style="width:100%" onchange="MockupManager.updateMeta('${moduleId}','category',this.value)">
                ${categoryOptions}
              </select>
            </div>
            <div>
              <div class="field-label pink"><span class="dot"></span> Priority</div>
              <div class="priority-balls" style="padding-top:6px">
                ${[1, 2, 3, 4, 5].map(level => `
                  <div class="p-ball ${level <= (mod.priority || 3) ? 'active' : ''}" data-level="${level}"
                       onclick="MockupManager.setPriority('${moduleId}', ${level})"></div>
                `).join('')}
              </div>
            </div>
            <div>
              <div class="field-label"><span class="dot"></span> Status</div>
              <select class="select" style="width:100%" onchange="MockupManager.setStatus('${moduleId}', this.value)">
                ${Object.entries(this.STATUS_META).map(([key, meta]) => `
                  <option value="${key}" ${key === mod.status ? 'selected' : ''}>${meta.label}</option>
                `).join('')}
              </select>
            </div>
          </div>

          ${this._renderModuleIntelligence(mod)}

          <div class="btn-row" style="margin-top:12px">
            <button class="btn btn-green" onclick="MockupManager.promote('${moduleId}','feature')">💡 Promote To Feature</button>
            <button class="btn btn-outline" onclick="MockupManager.promote('${moduleId}','improvement')">🔧 Promote To Improve</button>
            <button class="btn btn-outline" onclick="MockupManager.promote('${moduleId}','implementation')">🎯 Send To Implementation</button>
            ${mod.kind === 'code' ? `<button class="btn btn-outline" onclick="MockupManager.copyChecklist('${moduleId}')">📋 Copy List</button>` : ''}
            <button class="btn btn-outline" onclick="MockupManager.setStatus('${moduleId}','done')">✅ Mark Done</button>
            <button class="btn btn-outline" onclick="MockupManager.setStatus('${moduleId}','archived')">🗄️ Archive</button>
          </div>
        </div>
      </div>

      <div id="mockupPreviewShell"></div>
    </div>`;

    const shell = document.getElementById('mockupPreviewShell');
    if (!shell) return;

    if (mod.kind === 'artifact') {
      shell.innerHTML = this._renderArtifactPreview(mod);
      return;
    }

    shell.innerHTML = `
    <div style="position:relative">
      <span style="position:absolute;top:-10px;left:14px;background:var(--bg-deep);padding:2px 10px;font-size:var(--font-size-xs);font-weight:800;color:var(--accent-green);text-transform:uppercase;letter-spacing:1px;border:1px solid var(--border-soft);border-radius:5px;z-index:1">
        Live Mockup
      </span>
      <div id="sandboxContainer-${moduleId}" style="position:relative"></div>
    </div>`;

    const sandboxContainer = document.getElementById('sandboxContainer-' + moduleId);
    if (sandboxContainer) {
      Sandbox.destroy(moduleId);
      Sandbox.create(moduleId, sandboxContainer, mod.jsSource, mod.cssSource, mod.htmlSource || '');
    }
  },

  async updateMeta(moduleId, field, value) {
    await ModuleRegistry.updateMeta(moduleId, { [field]: value });
  },

  async setPriority(moduleId, level) {
    await ModuleRegistry.updateMeta(moduleId, { priority: level });
    if (this._activeModuleId === moduleId) await this.showModule(moduleId);
  },

  async setStatus(moduleId, status) {
    const mod = await ModuleRegistry.get(moduleId);
    if (!mod) return;
    await ModuleRegistry.updateMeta(moduleId, { status });
    await this._syncLinkedRecords({ ...mod, status });
    if (this._activeModuleId === moduleId) await this.showModule(moduleId);
    Toast.show(`Status set to ${this.STATUS_META[status]?.label || status}`);
  },

  async promote(moduleId, target) {
    const mod = await ModuleRegistry.get(moduleId);
    if (!mod || !App.currentProject) return;

    if (target === 'feature') {
      const feature = await this._ensureFeatureLink(mod, mod.analysis || null);
      await ModuleRegistry.updateMeta(moduleId, { status: 'feature', linkedFeatureId: feature.id });
      await this._syncLinkedRecords({ ...mod, status: 'feature', linkedFeatureId: feature.id });
      if (typeof Features !== 'undefined') await Features.render();
    } else if (target === 'improvement') {
      const improvement = await this._ensureImprovementLink(mod, mod.analysis || null);
      await ModuleRegistry.updateMeta(moduleId, { status: 'improvement', linkedImprovementId: improvement.id });
      await this._syncLinkedRecords({ ...mod, status: 'improvement', linkedImprovementId: improvement.id });
      if (typeof Improvements !== 'undefined') await Improvements.render();
    } else if (target === 'implementation') {
      const feature = await this._ensureFeatureLink(mod, mod.analysis || null);
      await Implementation.addFromFeature({
        id: feature.id,
        sourceModuleId: mod.id,
        name: mod.name,
        priority: mod.priority || 3,
        checklist: mod.checklist || [],
        sourceType: 'feature'
      });
      const items = await Store.getAll('implementation', 'projectId', App.currentProject.id);
      const linked = items.find(item => item.sourceModuleId === mod.id || item.featureId === feature.id);
      await ModuleRegistry.updateMeta(moduleId, {
        status: 'implementation',
        linkedFeatureId: feature.id,
        linkedImplementationId: linked?.id || ''
      });
      await this._syncLinkedRecords({ ...mod, status: 'implementation', linkedFeatureId: feature.id, linkedImplementationId: linked?.id || '' });
      if (typeof Implementation !== 'undefined') await Implementation.render();
    }

    await App.updateCounts();
    await App.updateProgress();
    await this.showModule(moduleId);
    Toast.show(`Promoted "${mod.name}" to ${target}.`);
  },

  async downloadModule(moduleId) {
    const mod = await ModuleRegistry.get(moduleId);
    if (!mod) return;

    const files = [];
    if (mod.kind === 'artifact') {
      files.push({
        name: mod.artifactFileName || (mod.name + '.txt'),
        content: mod.artifactSource
      });
    } else {
      if (mod.jsSource) {
        files.push({
          name: mod.jsFileNames?.length > 1 ? `${this._slug(mod.name)}.bundle.js` : (mod.jsFileNames?.[0] || `${this._slug(mod.name)}.js`),
          content: mod.jsSource
        });
      }
      if (mod.cssSource) {
        files.push({
          name: mod.cssFileNames?.length > 1 ? `${this._slug(mod.name)}.bundle.css` : (mod.cssFileNames?.[0] || `${this._slug(mod.name)}.css`),
          content: mod.cssSource
        });
      }
      if (mod.htmlSource) {
        files.push({
          name: mod.htmlFileName || `${this._slug(mod.name)}.html`,
          content: mod.htmlSource
        });
      }
      mod.pythonScripts?.forEach(py => files.push({ name: py.name, content: py.source }));
    }

    files.push({
      name: `${this._slug(mod.name)}-summary.md`,
      content: this._buildItemMarkdown(mod)
    });

    FileIO.downloadBundle(files);
    Toast.show('Work item exported.');
  },

  openCSSEditor(moduleId) {
    if (typeof CSSEditor !== 'undefined') {
      CSSEditor.open(moduleId);
    } else {
      Toast.show('CSS Editor not loaded yet', 'warning');
    }
  },

  openAlgorithmEditor(moduleId) {
    if (typeof AlgorithmPanel !== 'undefined') {
      AlgorithmPanel.open(moduleId);
    } else {
      Toast.show('Code editor not loaded yet', 'warning');
    }
  },

  openIntegration(moduleId) {
    if (typeof IntegrationGuide !== 'undefined') {
      App.go('integration');
      IntegrationGuide.showForModule(moduleId);
    }
  },

  async removeModule(moduleId) {
    if (!DOM.confirm('Remove this work item?')) return;
    Sandbox.destroy(moduleId);
    await ModuleRegistry.remove(moduleId);
    this._activeModuleId = null;
    DOM.setHTML('mockupContent', '');
    await this._renderBundledLibrary();
    await this._renderModuleTabs();
    Toast.show('Work item removed');
  },

  async exportProjectList() {
    if (!App.currentProject) return;

    const [features, improvements, implementation, modules] = await Promise.all([
      Store.getAll('features', 'projectId', App.currentProject.id),
      Store.getAll('improvements', 'projectId', App.currentProject.id),
      Store.getAll('implementation', 'projectId', App.currentProject.id),
      ModuleRegistry.getAll()
    ]);

    const md = [
      `# ${App.currentProject.name} — Feature Lab Export`,
      '',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      '## Work Items',
      ...modules.map(item => `- ${item.name} [${this.STATUS_META[item.status]?.label || item.status}] — ${item.summary || 'No summary'}`),
      '',
      '## Features',
      ...features.map(item => `- ${item.name} (P${item.priority || 3}) — ${item.description || 'No description'}`),
      '',
      '## Improvements',
      ...improvements.map(item => `- ${item.name} (P${item.priority || 3}) — Why: ${item.why || 'n/a'}${item.how ? ' | How: ' + item.how : ''}`),
      '',
      '## Implementation',
      ...implementation.map(item => `- ${item.name} (P${item.priority || 3}) — ${item.done ? 'Done' : 'Open'} — ${item.progress || 0}%`)
    ].join('\n');

    DOM.download(`${this._slug(App.currentProject.name)}-feature-lab.md`, md, 'text/markdown');
    Toast.show('Project list exported.');
  },

  _renderArtifactPreview(mod) {
    const label = mod.artifactType === 'image' ? 'Reference Image' : 'Reference Preview';
    return `
    <div class="card">
      <div class="card-body">
        <div class="field-label"><span class="dot"></span> ${label}</div>
        <div class="artifact-preview">
          ${this._artifactMarkup(mod)}
        </div>
      </div>
    </div>`;
  },

  _artifactMarkup(mod) {
    if (mod.artifactType === 'image') {
      return `<img src="${mod.artifactSource}" alt="${DOM.esc(mod.name)}" style="max-width:100%;border-radius:10px;border:1px solid var(--border-soft)">`;
    }
    if (mod.artifactType === 'svg') {
      return `<div class="artifact-svg">${mod.artifactSource}</div>`;
    }
    if (mod.artifactType === 'json') {
      return `<pre class="artifact-code">${DOM.esc(this._prettyJson(mod.artifactSource))}</pre>`;
    }
    return `<pre class="artifact-code">${DOM.esc(mod.artifactSource || '')}</pre>`;
  },

  _artifactType(file) {
    if (file.ext === 'json') return 'json';
    if (file.ext === 'svg') return 'svg';
    if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(file.ext)) return 'image';
    if (file.ext === 'md' || file.ext === 'markdown' || file.ext === 'mmd') return 'markdown';
    return 'text';
  },

  _itemIcon(item) {
    if (item.kind === 'artifact') {
      if (item.artifactType === 'image') return '🖼️';
      if (item.artifactType === 'svg') return '🗺️';
      if (item.artifactType === 'json') return '🧾';
      if (item.artifactType === 'markdown') return '📝';
      return '📎';
    }
    return '📦';
  },

  _fileSummary(mod) {
    if (mod.kind === 'artifact') {
      return [mod.artifactFileName, mod.artifactType].filter(Boolean).join(' • ');
    }

    const parts = [];
    if (mod.jsFileNames?.length) parts.push('JS: ' + mod.jsFileNames.join(', '));
    if (mod.cssFileNames?.length) parts.push('CSS: ' + mod.cssFileNames.join(', '));
    if (mod.htmlFileName) parts.push('HTML: ' + mod.htmlFileName);
    if (mod.pythonScripts?.length) parts.push('Python: ' + mod.pythonScripts.map(py => py.name).join(', '));
    return parts.join(' • ');
  },

  _buildImportSummary(files) {
    const parts = [];
    if (files.js.length) parts.push(`${files.js.length} JS`);
    if (files.css.length) parts.push(`${files.css.length} CSS`);
    if (files.html.length) parts.push(`${files.html.length} HTML`);
    if (files.py.length) parts.push(`${files.py.length} Python`);
    return parts.length ? `Imported bundle: ${parts.join(' + ')}` : 'Imported bundle';
  },

  _mergeTextFiles(files, type) {
    const header = type === 'css' ? '/* File: ' : '// File: ';
    const footer = type === 'css' ? ' */' : '';
    return files.map(file => `${header}${file.name}${footer}\n${file.content}`).join('\n\n');
  },

  _mergeHTMLFiles(files) {
    return files.map(file => `<!-- File: ${file.name} -->\n${file.content}`).join('\n\n');
  },

  _deriveWorkItemName(files) {
    const source = files.js[0] || files.html[0] || files.css[0] || files.py[0];
    return this._stripExtension(source?.name || 'work-item');
  },

  _stripExtension(fileName) {
    return String(fileName || '').replace(/\.[^.]+$/, '');
  },

  _slug(value) {
    return String(value || 'item').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item';
  },

  _fallbackDescription(mod) {
    return mod.kind === 'artifact'
      ? `Imported reference from ${mod.artifactFileName || mod.name}`
      : `Imported mockup from ${(mod.sourceFiles || []).join(', ') || mod.name}`;
  },

  _prettyJson(source) {
    try {
      return JSON.stringify(JSON.parse(source), null, 2);
    } catch (e) {
      return source;
    }
  },

  _buildItemMarkdown(mod) {
    const status = this.STATUS_META[mod.status]?.label || mod.status;
    return [
      `# ${mod.name}`,
      '',
      `- Status: ${status}`,
      `- Kind: ${mod.kind}`,
      `- Category: ${mod.category || 'custom'}`,
      `- Priority: ${mod.priority || 3}`,
      mod.sourceFiles?.length ? `- Source files: ${mod.sourceFiles.join(', ')}` : '',
      '',
      '## Summary',
      mod.summary || 'No summary yet.',
      '',
      '## Notes',
      mod.notes || 'No notes yet.'
    ].filter(Boolean).join('\n');
  },

  _renderModuleIntelligence(mod) {
    if (mod.kind !== 'code') return '';

    const analysis = mod.analysis;
    const checklist = (mod.checklist || []).map((item, index) => `
      <div class="module-check-item" onclick="MockupManager.toggleChecklist('${mod.id}', ${index})">
        <span>${item.done ? '☑️' : '☐'}</span>
        <span style="${item.done ? 'text-decoration:line-through;opacity:.6' : ''}">${DOM.esc(item.text)}</span>
      </div>
    `).join('');

    return `
      <div class="module-intelligence-card">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">
          <div class="field-label pink" style="margin-bottom:0"><span class="dot"></span> Module Intelligence</div>
          <button class="btn btn-sm btn-outline" onclick="MockupManager.refreshAnalysis('${mod.id}')">🧠 Refresh Analysis</button>
        </div>
        <div style="font-size:var(--font-size-sm);color:var(--text-secondary);margin-top:8px">
          ${DOM.esc(analysis?.summary || mod.summary || 'Imported mockup ready for classification.')}
        </div>
        <div class="module-tag-row">
          ${(analysis?.tags || []).map(tag => `<span class="bundled-tag">${DOM.esc(tag)}</span>`).join('')}
        </div>
        <div class="module-analysis-grid">
          <div><strong>Track:</strong> ${DOM.esc(analysis?.recommendedTrack || 'feature')}</div>
          <div><strong>Reason:</strong> ${DOM.esc(analysis?.workflowReason || 'New imports default to feature incubation first.')}</div>
          <div><strong>Stats:</strong> ${analysis ? `${analysis.stats.jsLines} JS • ${analysis.stats.cssLines} CSS • ${analysis.stats.functionCount} blocks` : 'Awaiting analysis'}</div>
          <div><strong>Linked:</strong> ${mod.linkedFeatureId ? 'Feature' : ''}${mod.linkedFeatureId && mod.linkedImprovementId ? ' + ' : ''}${mod.linkedImprovementId ? 'Improve' : ''}${!mod.linkedFeatureId && !mod.linkedImprovementId ? 'Not linked yet' : ''}</div>
        </div>
        ${checklist ? `<div class="module-checklist">${checklist}</div>` : ''}
      </div>`;
  },

  async refreshAnalysis(moduleId) {
    const mod = await ModuleRegistry.get(moduleId);
    if (!mod || mod.kind !== 'code') return;
    await this._analyseAndLinkModule(mod);
    Toast.show('Module analysis refreshed.');
  },

  async toggleChecklist(moduleId, index) {
    const mod = await ModuleRegistry.get(moduleId);
    if (!mod?.checklist?.[index]) return;
    mod.checklist[index].done = !mod.checklist[index].done;
    await ModuleRegistry.updateMeta(moduleId, { checklist: mod.checklist });
    await this._syncLinkedRecords({ ...mod, checklist: mod.checklist });
  },

  async copyChecklist(moduleId) {
    const mod = await ModuleRegistry.get(moduleId);
    if (!mod) return;
    const lines = (mod.checklist || []).map(item => `- [${item.done ? 'x' : ' '}] ${item.text}`);
    if (!lines.length) {
      Toast.show('No checklist yet for this module.', 'info');
      return;
    }
    DOM.copy(lines.join('\n'));
  },

  async _analyseAndLinkModule(mod) {
    if (!mod || mod.kind !== 'code') return mod;

    const project = await Store.get('projects', mod.projectId);
    const features = await Store.getAll('features', 'projectId', mod.projectId);
    const improvements = await Store.getAll('improvements', 'projectId', mod.projectId);
    const analysis = ModuleIntelligence.analyze({
      name: mod.name,
      jsSource: mod.jsSource,
      cssSource: mod.cssSource,
      pythonScripts: mod.pythonScripts || [],
      project,
      existingFeatures: features,
      existingImprovements: improvements
    });

    let updated = await ModuleRegistry.updateMeta(mod.id, {
      analysis,
      summary: mod.summary || analysis.summary,
      priority: mod.priority && mod.priority !== 3 ? mod.priority : analysis.recommendedPriority,
      category: !mod.category || mod.category === 'custom' ? analysis.categoryId : mod.category,
      checklist: analysis.checklist
    });

    if (analysis.recommendedTrack === 'improvement') {
      const improvement = await this._ensureImprovementLink(updated, analysis);
      const linkedFeatureId = updated.linkedFeatureId || analysis.featureMatchId || '';
      updated = await ModuleRegistry.updateMeta(updated.id, {
        status: 'improvement',
        linkedImprovementId: improvement.id,
        linkedFeatureId
      });
    } else {
      const feature = await this._ensureFeatureLink(updated, analysis);
      updated = await ModuleRegistry.updateMeta(updated.id, {
        status: updated.status === 'done' ? 'done' : 'feature',
        linkedFeatureId: feature.id
      });
    }

    await this._syncLinkedRecords(updated);
    return updated;
  },

  async _ensureFeatureLink(mod, analysis) {
    let feature = mod.linkedFeatureId ? await Store.get('features', mod.linkedFeatureId) : null;
    if (!feature && analysis?.featureMatchId) feature = await Store.get('features', analysis.featureMatchId);
    if (!feature) {
      const features = await Store.getAll('features', 'projectId', mod.projectId);
      feature = features.find(item => item.sourceModuleId === mod.id || item.name.toLowerCase() === mod.name.toLowerCase()) || null;
    }

    const now = new Date().toISOString();
    const payload = feature || {
      id: Store.generateId(),
      projectId: mod.projectId,
      created: now,
      collapsed: true,
      aiPrompt: '',
      uiPattern: ''
    };

    payload.sourceModuleId = mod.id;
    payload.name = mod.name;
    payload.description = payload.description || mod.summary || analysis?.summary || this._fallbackDescription(mod);
    payload.category = !payload.category || payload.category === 'custom'
      ? (mod.category || analysis?.categoryId || Categories.getAll()[0]?.id || 'custom')
      : payload.category;
    payload.priority = payload.priority && payload.priority !== 3
      ? payload.priority
      : (mod.priority || analysis?.recommendedPriority || 3);
    payload.status = payload.status === 'done' ? 'done' : 'imported';
    payload.updated = now;

    await Store.put('features', payload);
    return payload;
  },

  async _ensureImprovementLink(mod, analysis) {
    let improvement = mod.linkedImprovementId ? await Store.get('improvements', mod.linkedImprovementId) : null;
    if (!improvement && analysis?.improvementMatchId) improvement = await Store.get('improvements', analysis.improvementMatchId);
    if (!improvement) {
      const items = await Store.getAll('improvements', 'projectId', mod.projectId);
      improvement = items.find(item => item.sourceModuleId === mod.id || item.name.toLowerCase() === mod.name.toLowerCase()) || null;
    }

    const payload = improvement || {
      id: Store.generateId(),
      projectId: mod.projectId,
      created: new Date().toISOString()
    };

    payload.sourceModuleId = mod.id;
    payload.sourceFeatureId = payload.sourceFeatureId || mod.linkedFeatureId || analysis?.featureMatchId || '';
    payload.name = mod.name;
    payload.why = payload.why || mod.summary || analysis?.summary || this._fallbackDescription(mod);
    payload.how = payload.how || mod.notes || '';
    payload.priority = payload.priority && payload.priority !== 3
      ? payload.priority
      : (mod.priority || analysis?.recommendedPriority || 3);
    payload.status = payload.status || 'open';
    payload.checklist = mod.checklist || payload.checklist || [];

    await Store.put('improvements', payload);
    return payload;
  },

  async _syncLinkedRecords(mod) {
    if (mod.linkedFeatureId) {
      const feature = await Store.get('features', mod.linkedFeatureId);
      if (feature) {
        feature.status = mod.status === 'feature'
          ? 'imported'
          : mod.status === 'implementation'
            ? 'implementing'
            : mod.status === 'improvement'
              ? 'improving'
              : mod.status;
        feature.updated = new Date().toISOString();
        await Store.put('features', feature);
      }
    }

    if (mod.linkedImprovementId) {
      const improvement = await Store.get('improvements', mod.linkedImprovementId);
      if (improvement) {
        improvement.status = mod.status === 'done' ? 'resolved' : mod.status === 'archived' ? 'archived' : 'open';
        improvement.checklist = mod.checklist || improvement.checklist || [];
        await Store.put('improvements', improvement);
      }
    }

    const items = await Store.getAll('implementation', 'projectId', mod.projectId);
    const implementation = items.find(item => item.sourceModuleId === mod.id || item.id === mod.linkedImplementationId);
    if (implementation) {
      implementation.checklist = mod.checklist || implementation.checklist || [];
      implementation.progress = this._calcImplementationProgress(implementation);
      if (mod.status === 'done') {
        implementation.done = true;
        implementation.progress = 100;
      } else if (mod.status === 'archived') {
        implementation.done = false;
      } else if (implementation.progress < 100) {
        implementation.done = false;
      } else {
        implementation.done = true;
      }
      await Store.put('implementation', implementation);
    }

    await App.updateCounts();
    await App.updateProgress();
  },

  _calcImplementationProgress(item) {
    if (!item.checklist?.length) return item.done ? 100 : 0;
    const done = item.checklist.filter(entry => entry.done).length;
    return Math.round(done / item.checklist.length * 100);
  },

  _setupMessageListener() {
    window.addEventListener('message', (e) => {
      const msg = e.data;
      if (!msg || !msg.type) return;

      if (msg.type === 'computed-vars') {
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
