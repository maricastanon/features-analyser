/* Theme - Dark/light toggle + project theme application */
const Theme = {
  _mode: 'dark',
  _activeProject: null,

  async init() {
    const saved = await Store.getSetting('themeMode', 'dark');
    this._mode = saved;
    this.apply();
    this._renderToggle();
  },

  toggle() {
    this._mode = this._mode === 'dark' ? 'light' : 'dark';
    this.apply();
    Store.setSetting('themeMode', this._mode);
    EventBus.emit('theme:changed', this._mode);
  },

  apply() {
    document.documentElement.classList.toggle('light', this._mode === 'light');

    if (this._activeProject) {
      this.applyProjectTheme(this._activeProject);
    } else {
      this.resetToDefaults();
      this._syncMetaThemeColor();
    }

    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = this._mode === 'dark' ? '??' : '??';
  },

  _renderToggle() {
    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.textContent = this._mode === 'dark' ? '??' : '??';
      btn.onclick = () => this.toggle();
    }
  },

  async applyProjectTheme(project) {
    this._activeProject = project || null;
    this.resetToDefaults();

    if (!project || !project.theme) {
      this._syncMetaThemeColor();
      return;
    }

    const t = project.theme;
    const root = document.documentElement.style;
    const isLight = this._mode === 'light';

    if (t.primary) root.setProperty('--accent-pink', t.primary);
    if (t.secondary) root.setProperty('--accent-green', t.secondary);
    if (t.fontFamily) root.setProperty('--font-main', t.fontFamily);
    if (t.fontSize) root.setProperty('--font-size-md', t.fontSize);

    if (!isLight) {
      if (t.bgDeep) root.setProperty('--bg-deep', t.bgDeep);
      if (t.bgMain) root.setProperty('--bg-main', t.bgMain);
      if (t.bgCard) root.setProperty('--bg-card', t.bgCard);
      if (t.bgSurface) root.setProperty('--bg-surface', t.bgSurface);
      if (t.borderSoft) root.setProperty('--border-soft', t.borderSoft);
      if (t.textPrimary) root.setProperty('--text-primary', t.textPrimary);
      if (t.textMuted) root.setProperty('--text-muted', t.textMuted);
    }

    this._syncMetaThemeColor(project);
  },

  resetToDefaults() {
    const root = document.documentElement.style;
    const props = [
      '--accent-pink',
      '--accent-green',
      '--bg-deep',
      '--bg-main',
      '--bg-card',
      '--bg-surface',
      '--border-soft',
      '--text-primary',
      '--text-muted',
      '--font-main',
      '--font-size-md'
    ];
    props.forEach(prop => root.removeProperty(prop));
  },

  _syncMetaThemeColor(project = this._activeProject) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;

    const color = this._mode === 'light'
      ? '#eef5ef'
      : project?.theme?.bgDeep || '#0d1f17';

    meta.setAttribute('content', color);
  },

  getMode() { return this._mode; }
};
