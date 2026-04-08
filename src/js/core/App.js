/* ═══════════════════════════════════════════════════════════════
   App — Application shell, tab routing, keyboard shortcuts
   Central controller that initializes all modules.
   ═══════════════════════════════════════════════════════════════ */
const App = {
  currentTab: 'features',
  currentProject: null,

  TAB_MAP: {
    features:       { label: 'Features',      emoji: '💡', count: 'featCount' },
    improvements:   { label: 'Improve',       emoji: '🔧', count: 'impCount' },
    implementation: { label: 'Implement',     emoji: '🎯', count: 'implCount' },
    mockups:        { label: 'Mockups',        emoji: '🧪' },
    integration:    { label: 'Integration',   emoji: '🔧' },
    inspector:      { label: 'Inspector',     emoji: '🔬' },
    guide:          { label: 'Guide',         emoji: '📘' }
  },

  async init() {
    // 1. Init core systems
    await Store.init();
    Toast.init();
    await Theme.init();

    // 2. Check for V3 migration
    await this._checkMigration();

    // 2.5. Ensure preset projects exist (auto-creates on first run)
    if (typeof ProjectConfig !== 'undefined') {
      await ProjectConfig.ensurePresetProjects();
    }

    // 3. Load active project
    await this._loadActiveProject();

    // 4. Render shell
    this._renderTabs();

    // 5. Init feature modules (Sprint 2+)
    await this._initModules();

    // 6. Keyboard shortcuts
    this._shortcuts();

    // 7. Show default tab
    this.go(this.currentTab);

    // 8. Update counters
    await this.updateCounts();
    await this.updateProgress();

    console.log('[App] V4 initialized');
  },

  async _checkMigration() {
    const hasV3 = localStorage.getItem('fb_d');
    const projectCount = await Store.count('projects');
    if (hasV3 && projectCount === 0) {
      const migrated = await Store.migrateFromV3();
      if (migrated) {
        Toast.show('V3 data migrated successfully!', 'success', 4000);
      }
    }
  },

  async _loadActiveProject() {
    const activeId = await Store.getSetting('activeProject');
    const selectionPinned = await Store.getSetting('projectSelectionPinned', false);
    if (activeId) {
      this.currentProject = await Store.get('projects', activeId);
    }

    let projects = await Store.getAll('projects');
    if (typeof ProjectConfig !== 'undefined') {
      projects = await ProjectConfig.ensurePresetProjects();
    }

    if (this.currentProject && !selectionPinned) {
      const shouldReset = await this._shouldResetAutoSeededSelection(projects);
      if (shouldReset) this.currentProject = null;
    }

    if (!this.currentProject && projects.length > 0) {
      this.currentProject = typeof ProjectConfig !== 'undefined'
        ? ProjectConfig.getDefaultPresetProject(projects)
        : projects[0];
      await Store.setSetting('activeProject', this.currentProject.id);
    }

    // Apply project theme if exists
    if (this.currentProject) {
      await Theme.applyProjectTheme(this.currentProject);
      this._updateTitle(this.currentProject.name);
    } else {
      Theme.resetToDefaults();
      this._updateTitle('Feature Brainstorm Hub');
    }
  },

  async _shouldResetAutoSeededSelection(projects) {
    if (!this.currentProject?.presetId || this.currentProject.presetId === 'feature-lab-workspace') return false;
    const workspace = typeof ProjectConfig !== 'undefined'
      ? ProjectConfig.getDefaultPresetProject(projects)
      : null;
    if (!workspace || workspace.id === this.currentProject.id) return false;

    const [features, improvements, implementation, modules] = await Promise.all([
      Store.getAll('features'),
      Store.getAll('improvements'),
      Store.getAll('implementation'),
      Store.getAll('modules')
    ]);

    return (features.length + improvements.length + implementation.length + modules.length) === 0;
  },

  async _initModules() {
    // Modules initialize themselves when their panel becomes active
    // This avoids loading everything upfront
    // Each module checks: if (typeof ModuleName !== 'undefined') ModuleName.init()
    if (typeof ProjectSwitcher !== 'undefined') await ProjectSwitcher.init();
    if (typeof Features !== 'undefined') await Features.init();
    if (typeof Improvements !== 'undefined') await Improvements.init();
    if (typeof Implementation !== 'undefined') await Implementation.init();
    if (typeof MockupManager !== 'undefined') await MockupManager.init();
    if (typeof IntegrationGuide !== 'undefined') IntegrationGuide.init();
    if (typeof GuidePanel !== 'undefined') GuidePanel.init();
  },

  _renderTabs() {
    const container = DOM.el('mainTabs');
    if (!container) return;

    container.innerHTML = Object.entries(this.TAB_MAP).map(([id, cfg]) => {
      const countHtml = cfg.count
        ? `<span class="tab-count" id="${cfg.count}">0</span>`
        : '';
      return `<button class="tab-btn${id === this.currentTab ? ' active' : ''}"
                data-tab="${id}" onclick="App.go('${id}')">
                ${cfg.emoji} ${cfg.label} ${countHtml}
              </button>`;
    }).join('');
  },

  go(tabId) {
    if (!this.TAB_MAP[tabId]) return;
    this.currentTab = tabId;

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    // Update panels
    document.querySelectorAll('.panel').forEach(p => {
      p.classList.toggle('active', p.id === 'panel-' + tabId);
    });

    EventBus.emit('tab:changed', tabId);
  },

  _shortcuts() {
    document.addEventListener('keydown', e => {
      if (e.ctrlKey || e.metaKey) {
        const tabKeys = Object.keys(this.TAB_MAP);
        const idx = parseInt(e.key) - 1;
        if (idx >= 0 && idx < tabKeys.length) {
          e.preventDefault();
          this.go(tabKeys[idx]);
        }
      }
    });
  },

  _updateTitle(text) {
    const el = DOM.el('projTitle');
    if (el) el.textContent = text;
    document.title = '🚀 ' + text;
  },

  async updateCounts() {
    if (!this.currentProject) return;
    const pid = this.currentProject.id;

    const fc = await Store.getAll('features', 'projectId', pid);
    const ic = await Store.getAll('improvements', 'projectId', pid);
    const mc = await Store.getAll('implementation', 'projectId', pid);

    DOM.setHTML('featCount', fc.length);
    DOM.setHTML('impCount', ic.length);
    DOM.setHTML('implCount', mc.length);
    DOM.setHTML('headerFeatCount', fc.length);
    DOM.setHTML('headerImplCount', mc.length);
  },

  async updateProgress() {
    if (!this.currentProject) return;
    const items = await Store.getAll('implementation', 'projectId', this.currentProject.id);
    const pct = items.length
      ? Math.round(items.filter(i => i.done).length / items.length * 100)
      : 0;
    const bar = DOM.el('globalProgress');
    const txt = DOM.el('globalProgressTxt');
    if (bar) bar.style.width = pct + '%';
    if (txt) txt.textContent = pct + '%';
  },

  async switchProject(projectId, options = {}) {
    this.currentProject = await Store.get('projects', projectId);
    await Store.setSetting('activeProject', projectId);
    if (options.explicit) {
      await Store.setSetting('projectSelectionPinned', true);
    }
    if (this.currentProject) {
      await Theme.applyProjectTheme(this.currentProject);
      this._updateTitle(this.currentProject.name);
    }
    await this._initModules();
    await this.updateCounts();
    await this.updateProgress();
    EventBus.emit('project:switched', this.currentProject);
    Toast.show('Project switched!');
  },

  getProjectId() {
    return this.currentProject ? this.currentProject.id : null;
  }
};

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
