/* ═══════════════════════════════════════════════════════════════
   Theme — Dark/light toggle + project theme application
   ═══════════════════════════════════════════════════════════════ */
const Theme = {
  _mode: 'dark',

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
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = this._mode === 'dark' ? '🌙' : '☀️';
  },

  _renderToggle() {
    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.textContent = this._mode === 'dark' ? '🌙' : '☀️';
      btn.onclick = () => this.toggle();
    }
  },

  // Apply project-specific theme colors to CSS vars
  async applyProjectTheme(project) {
    if (!project || !project.theme) return;
    const t = project.theme;
    const root = document.documentElement.style;

    if (t.primary)     root.setProperty('--accent-pink', t.primary);
    if (t.secondary)   root.setProperty('--accent-green', t.secondary);
    if (t.bgDeep)      root.setProperty('--bg-deep', t.bgDeep);
    if (t.bgCard)      root.setProperty('--bg-card', t.bgCard);
    if (t.bgSurface)   root.setProperty('--bg-surface', t.bgSurface);
    if (t.borderSoft)  root.setProperty('--border-soft', t.borderSoft);
    if (t.textPrimary) root.setProperty('--text-primary', t.textPrimary);
    if (t.textMuted)   root.setProperty('--text-muted', t.textMuted);
    if (t.fontFamily)  root.setProperty('--font-main', t.fontFamily);
    if (t.fontSize)    root.setProperty('--font-size-md', t.fontSize);
  },

  // Reset to defaults (remove inline overrides)
  resetToDefaults() {
    const root = document.documentElement.style;
    const props = [
      '--accent-pink', '--accent-green', '--bg-deep', '--bg-card',
      '--bg-surface', '--border-soft', '--text-primary', '--text-muted',
      '--font-main', '--font-size-md'
    ];
    props.forEach(p => root.removeProperty(p));
  },

  getMode() { return this._mode; }
};
