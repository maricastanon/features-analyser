/* ═══════════════════════════════════════════════════════════════
   ModuleRegistry — Persist imported modules + source in IndexedDB
   Unlike V3, stores full source text so modules survive refresh.
   ═══════════════════════════════════════════════════════════════ */
const ModuleRegistry = {
  async getAll() {
    if (!App.currentProject) return [];
    return Store.getAll('modules', 'projectId', App.currentProject.id);
  },

  async get(id) {
    return Store.get('modules', id);
  },

  async register(name, jsSource, cssSource, jsFileName, cssFileName) {
    const mod = {
      id: Store.generateId(),
      projectId: App.currentProject.id,
      name,
      jsSource: jsSource || '',
      cssSource: cssSource || '',
      jsFileName: jsFileName || '',
      cssFileName: cssFileName || '',
      state: {},
      cssOverrides: {},
      uiPattern: '',
      pythonScripts: [],
      imported: new Date().toISOString()
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
    await Store.put('modules', mod);
    return mod;
  },

  async updateCSSOverrides(id, overrides) {
    const mod = await this.get(id);
    if (!mod) return;
    mod.cssOverrides = { ...mod.cssOverrides, ...overrides };
    await Store.put('modules', mod);
    return mod;
  },

  async remove(id) {
    await Store.delete('modules', id);
    EventBus.emit('module:removed', id);
  }
};
