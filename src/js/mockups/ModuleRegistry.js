/* ═══════════════════════════════════════════════════════════════
   ModuleRegistry — Persist imported modules + source in IndexedDB
   Unlike V3, stores full source text so modules survive refresh.
   ═══════════════════════════════════════════════════════════════ */
const ModuleRegistry = {
  async getAll() {
    if (!App.currentProject) return [];
    const items = await Store.getAll('modules', 'projectId', App.currentProject.id);
    return items.sort((a, b) => {
      const ta = new Date(a.updated || a.imported || 0).getTime();
      const tb = new Date(b.updated || b.imported || 0).getTime();
      return tb - ta;
    });
  },

  async get(id) {
    return Store.get('modules', id);
  },

  async registerModule(payload) {
    const now = new Date().toISOString();
    const mod = {
      id: Store.generateId(),
      projectId: App.currentProject.id,
      kind: 'code',
      origin: payload.origin || 'imported',
      bundleId: payload.bundleId || '',
      name: payload.name,
      summary: payload.summary || '',
      notes: payload.notes || '',
      status: payload.status || 'draft',
      priority: payload.priority || 3,
      category: payload.category || Categories.getAll()[0]?.id || 'custom',
      jsSource: payload.jsSource || '',
      cssSource: payload.cssSource || '',
      htmlSource: payload.htmlSource || '',
      jsFileNames: payload.jsFileNames || [],
      cssFileNames: payload.cssFileNames || [],
      htmlFileName: payload.htmlFileName || '',
      sourceFiles: payload.sourceFiles || [],
      state: {},
      cssOverrides: {},
      uiPattern: '',
      pythonScripts: payload.pythonScripts || [],
      imported: now,
      updated: now
    };
    await Store.put('modules', mod);
    EventBus.emit('module:imported', mod);
    return mod;
  },

  async registerArtifact(payload) {
    const now = new Date().toISOString();
    const mod = {
      id: Store.generateId(),
      projectId: App.currentProject.id,
      kind: 'artifact',
      origin: payload.origin || 'imported',
      name: payload.name,
      summary: payload.summary || '',
      notes: payload.notes || '',
      status: payload.status || 'review',
      priority: payload.priority || 3,
      category: payload.category || Categories.getAll()[0]?.id || 'custom',
      artifactType: payload.artifactType || 'text',
      artifactSource: payload.artifactSource || '',
      artifactFileName: payload.artifactFileName || '',
      sourceFiles: payload.sourceFiles || [],
      imported: now,
      updated: now
    };
    await Store.put('modules', mod);
    EventBus.emit('module:imported', mod);
    return mod;
  },

  async updateSource(id, jsSource, cssSource) {
    const mod = await this.get(id);
    if (!mod) return;
    if (jsSource !== undefined) mod.jsSource = jsSource;
    if (cssSource !== undefined) mod.cssSource = cssSource;
    mod.updated = new Date().toISOString();
    await Store.put('modules', mod);
    return mod;
  },

  async updateCSSOverrides(id, overrides) {
    const mod = await this.get(id);
    if (!mod) return;
    mod.cssOverrides = { ...mod.cssOverrides, ...overrides };
    mod.updated = new Date().toISOString();
    await Store.put('modules', mod);
    return mod;
  },

  async updateMeta(id, patch) {
    const mod = await this.get(id);
    if (!mod) return;
    Object.assign(mod, patch || {});
    mod.updated = new Date().toISOString();
    await Store.put('modules', mod);
    return mod;
  },

  async remove(id) {
    await Store.delete('modules', id);
    EventBus.emit('module:removed', id);
  }
};
