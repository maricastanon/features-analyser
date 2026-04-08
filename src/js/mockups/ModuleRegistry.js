/* ═══════════════════════════════════════════════════════════════
   ModuleRegistry — Persist imported modules + source in IndexedDB
   Unlike V3, stores full source text so modules survive refresh.
   ═══════════════════════════════════════════════════════════════ */
const ModuleRegistry = {
  async getAll(projectId = null) {
    const pid = projectId || App.currentProject?.id;
    if (!pid) return [];
    const items = await Store.getAll('modules', 'projectId', pid);
    return items.sort((a, b) => {
      const archivedDelta = Number(Boolean(a.status === 'archived')) - Number(Boolean(b.status === 'archived'));
      if (archivedDelta !== 0) return archivedDelta;
      const ta = new Date(a.updated || a.imported || 0).getTime();
      const tb = new Date(b.updated || b.imported || 0).getTime();
      return tb - ta;
    });
  },

  async get(id) {
    return Store.get('modules', id);
  },

  async findByName(name, projectId = null) {
    const items = await this.getAll(projectId);
    const slug = this._slug(name);
    return items.find(item => this._slug(item.name) === slug) || null;
  },

  async findByBundleId(bundleId, projectId = null) {
    const items = await this.getAll(projectId);
    return items.find(item => item.bundleId === bundleId) || null;
  },

  async registerModule(payload) {
    const projectId = payload.projectId || App.currentProject?.id;
    if (!projectId) return null;

    const now = new Date().toISOString();
    const existing = payload.bundleId
      ? await this.findByBundleId(payload.bundleId, projectId)
      : await this.findByName(payload.name, projectId);

    const mod = {
      id: existing?.id || Store.generateId(),
      projectId,
      kind: 'code',
      origin: payload.origin || existing?.origin || 'imported',
      bundleId: payload.bundleId || existing?.bundleId || '',
      name: payload.name,
      summary: payload.summary || existing?.summary || '',
      notes: payload.notes || existing?.notes || '',
      status: payload.status || existing?.status || 'review',
      priority: payload.priority || existing?.priority || 3,
      category: payload.category || existing?.category || Categories.getAll()[0]?.id || 'custom',
      jsSource: payload.jsSource || '',
      cssSource: payload.cssSource || '',
      htmlSource: payload.htmlSource || '',
      jsFileNames: payload.jsFileNames || [],
      cssFileNames: payload.cssFileNames || [],
      htmlFileName: payload.htmlFileName || '',
      sourceFiles: payload.sourceFiles || [],
      state: existing?.state || {},
      cssOverrides: existing?.cssOverrides || {},
      uiPattern: existing?.uiPattern || '',
      pythonScripts: payload.pythonScripts || existing?.pythonScripts || [],
      analysis: payload.analysis || existing?.analysis || null,
      checklist: this._mergeChecklist(existing?.checklist, payload.checklist || payload.analysis?.checklist || []),
      linkedFeatureId: payload.linkedFeatureId || existing?.linkedFeatureId || '',
      linkedImprovementId: payload.linkedImprovementId || existing?.linkedImprovementId || '',
      linkedImplementationId: payload.linkedImplementationId || existing?.linkedImplementationId || '',
      version: existing ? (existing.version || 1) + 1 : 1,
      imported: existing?.imported || now,
      updated: now
    };
    mod.history = [
      ...(existing?.history || []),
      {
        type: existing ? 'reimport' : 'import',
        at: now,
        origin: mod.origin,
        version: mod.version
      }
    ];
    await Store.put('modules', mod);
    EventBus.emit(existing ? 'module:updated' : 'module:imported', mod);
    return mod;
  },

  async registerArtifact(payload) {
    const projectId = payload.projectId || App.currentProject?.id;
    if (!projectId) return null;
    const now = new Date().toISOString();
    const mod = {
      id: Store.generateId(),
      projectId,
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
    if (patch?.checklist) {
      mod.checklist = this._mergeChecklist(mod.checklist, patch.checklist);
    }
    mod.updated = new Date().toISOString();
    await Store.put('modules', mod);
    EventBus.emit('module:updated', mod);
    return mod;
  },

  async remove(id) {
    await Store.delete('modules', id);
    EventBus.emit('module:removed', id);
  },

  _mergeChecklist(existing, suggestions) {
    const normalize = (item) => {
      if (typeof item === 'string') return { text: item, done: false };
      if (!item || !item.text) return null;
      return { text: item.text, done: Boolean(item.done) };
    };

    const current = (existing || []).map(normalize).filter(Boolean);
    const next = [];
    (suggestions || []).map(normalize).filter(Boolean).forEach(item => {
      if (!next.find(entry => entry.text.toLowerCase() === item.text.toLowerCase())) {
        next.push(item);
      }
    });
    if (!next.length) return current;

    const currentMap = new Map(current.map(item => [item.text.toLowerCase(), item]));
    const merged = next.map(item => currentMap.get(item.text.toLowerCase()) || item);

    current.forEach(item => {
      if (!merged.find(entry => entry.text.toLowerCase() === item.text.toLowerCase())) {
        merged.push(item);
      }
    });

    return merged;
  },

  _slug(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
};
