/* ═══════════════════════════════════════════════════════════════
   Store — IndexedDB wrapper for persistent data
   Usage: await Store.init()
          await Store.put('features', feature)
          const f = await Store.get('features', id)
          const all = await Store.getAll('features')
          await Store.delete('features', id)
   ═══════════════════════════════════════════════════════════════ */
const Store = {
  DB_NAME: 'fbhub_v4',
  DB_VERSION: 1,
  _db: null,

  STORES: {
    projects:       { keyPath: 'id', indexes: ['name'] },
    features:       { keyPath: 'id', indexes: ['projectId', 'category', 'priority'] },
    improvements:   { keyPath: 'id', indexes: ['projectId', 'priority'] },
    implementation: { keyPath: 'id', indexes: ['projectId', 'priority', 'done'] },
    modules:        { keyPath: 'id', indexes: ['projectId'] },
    settings:       { keyPath: 'key' }
  },

  async init() {
    if (this._db) return this._db;
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        for (const [name, config] of Object.entries(this.STORES)) {
          if (!db.objectStoreNames.contains(name)) {
            const store = db.createObjectStore(name, { keyPath: config.keyPath });
            (config.indexes || []).forEach(idx => {
              store.createIndex(idx, idx, { unique: false });
            });
          }
        }
      };

      req.onsuccess = (e) => {
        this._db = e.target.result;
        resolve(this._db);
      };

      req.onerror = (e) => {
        console.error('[Store] Failed to open DB:', e.target.error);
        reject(e.target.error);
      };
    });
  },

  _tx(storeName, mode = 'readonly') {
    const tx = this._db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  },

  async get(storeName, key) {
    await this.init();
    return new Promise((resolve, reject) => {
      const req = this._tx(storeName).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  },

  async getAll(storeName, indexName, indexValue) {
    await this.init();
    return new Promise((resolve, reject) => {
      const store = this._tx(storeName);
      let req;
      if (indexName && indexValue !== undefined) {
        const idx = store.index(indexName);
        req = idx.getAll(indexValue);
      } else {
        req = store.getAll();
      }
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  async put(storeName, data) {
    await this.init();
    return new Promise((resolve, reject) => {
      const req = this._tx(storeName, 'readwrite').put(data);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async delete(storeName, key) {
    await this.init();
    return new Promise((resolve, reject) => {
      const req = this._tx(storeName, 'readwrite').delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async clear(storeName) {
    await this.init();
    return new Promise((resolve, reject) => {
      const req = this._tx(storeName, 'readwrite').clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async count(storeName) {
    await this.init();
    return new Promise((resolve, reject) => {
      const req = this._tx(storeName).count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  // Settings helpers
  async getSetting(key, defaultVal = null) {
    const row = await this.get('settings', key);
    return row ? row.value : defaultVal;
  },

  async setSetting(key, value) {
    return this.put('settings', { key, value });
  },

  // Export entire DB as JSON (for backup/download)
  async exportAll() {
    const data = {};
    for (const name of Object.keys(this.STORES)) {
      data[name] = await this.getAll(name);
    }
    return data;
  },

  // Import from JSON backup
  async importAll(data) {
    for (const [storeName, items] of Object.entries(data)) {
      if (!this.STORES[storeName]) continue;
      for (const item of items) {
        await this.put(storeName, item);
      }
    }
  },

  // V3 migration
  async migrateFromV3() {
    const raw = localStorage.getItem('fb_d');
    const title = localStorage.getItem('fb_t');
    if (!raw) return false;

    try {
      const v3 = JSON.parse(raw);
      const projectId = this.generateId();

      // Extract unique categories from features
      const catSet = new Set();
      (v3.features || []).forEach(f => catSet.add(f.category));
      const EMOJI_MAP = {
        'task-mgmt': '📋', 'views': '👁️', 'collab': '🤝',
        'analytics': '📊', 'integration': '🔗', 'ai': '🤖', 'custom': '✨'
      };
      const categories = [...catSet].map(c => ({
        id: c, name: c.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        emoji: EMOJI_MAP[c] || '📦', color: '#4caf50'
      }));

      // Create project
      await this.put('projects', {
        id: projectId,
        name: title || 'Migrated Project',
        description: 'Migrated from Feature Brainstorm V3',
        stack: ['vanilla-js'],
        theme: {
          primary: '#e91e90', secondary: '#4caf50',
          bgDeep: '#0a1a10', bgCard: '#122b1e', bgSurface: '#163224',
          borderSoft: '#1a3d28', textPrimary: '#e8f5e9', textMuted: '#5a8a60',
          fontFamily: 'Calibri, system-ui', mode: 'dark'
        },
        fileStructure: '', modulePattern: '', aiPromptTemplate: '',
        pythonDir: 'python/', categories,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      });

      // Migrate features
      for (const f of (v3.features || [])) {
        await this.put('features', { ...f, projectId });
      }
      // Migrate improvements
      for (const i of (v3.improvements || [])) {
        await this.put('improvements', { ...i, projectId });
      }
      // Migrate implementation
      for (const m of (v3.implementation || [])) {
        await this.put('implementation', { ...m, projectId });
      }
      // Migrate modules (metadata only — source not stored in V3)
      for (const mod of (v3.importedModules || [])) {
        await this.put('modules', {
          ...mod, projectId,
          jsSource: '', cssSource: '',
          state: {}, cssOverrides: {},
          pythonScripts: []
        });
      }

      await this.setSetting('activeProject', projectId);
      return true;
    } catch (e) {
      console.error('[Store] V3 migration failed:', e);
      return false;
    }
  },

  generateId() {
    return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
  }
};
