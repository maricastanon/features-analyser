/* ═══════════════════════════════════════════════
   FEATURE: Settings Panel — Universal Module
   App settings with sections, toggles, dropdowns.
   Works for ANY app's configuration page.
   ═══════════════════════════════════════════════ */
const FeatSettingsPanel = {
  settings: {},
  activeSection: 'general',

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this._seed();
    this.render();
  },

  _seed() {
    this.settings = {
      general: {
        label: '⚙️ General', items: [
          { key: 'appName', label: 'App Name', type: 'text', value: 'My App' },
          { key: 'language', label: 'Language', type: 'select', value: 'en', options: ['en','es','fr','de','pt','ja'] },
          { key: 'timezone', label: 'Timezone', type: 'select', value: 'UTC', options: ['UTC','EST','PST','CET','JST'] },
          { key: 'autoSave', label: 'Auto-save', type: 'toggle', value: true }
        ]},
      appearance: {
        label: '🎨 Appearance', items: [
          { key: 'theme', label: 'Theme', type: 'select', value: 'dark', options: ['dark','light','auto'] },
          { key: 'accentColor', label: 'Accent Color', type: 'color', value: '#e91e90' },
          { key: 'fontSize', label: 'Font Size', type: 'select', value: 'medium', options: ['small','medium','large'] },
          { key: 'animations', label: 'Animations', type: 'toggle', value: true },
          { key: 'compactMode', label: 'Compact Mode', type: 'toggle', value: false }
        ]},
      notifications: {
        label: '🔔 Notifications', items: [
          { key: 'pushNotif', label: 'Push Notifications', type: 'toggle', value: true },
          { key: 'emailDigest', label: 'Email Digest', type: 'toggle', value: false },
          { key: 'digestFreq', label: 'Digest Frequency', type: 'select', value: 'weekly', options: ['daily','weekly','monthly'] },
          { key: 'soundAlerts', label: 'Sound Alerts', type: 'toggle', value: true }
        ]},
      privacy: {
        label: '🔒 Privacy', items: [
          { key: 'analytics', label: 'Usage Analytics', type: 'toggle', value: true },
          { key: 'crashReports', label: 'Crash Reports', type: 'toggle', value: true },
          { key: 'publicProfile', label: 'Public Profile', type: 'toggle', value: false },
          { key: 'dataRetention', label: 'Data Retention', type: 'select', value: '1year', options: ['30days','90days','1year','forever'] }
        ]}
    };
  },

  render() {
    const sections = Object.entries(this.settings);
    const activeItems = this.settings[this.activeSection]?.items || [];

    this.container.innerHTML = `
    <div class="feat-settings-wrap">
      <div class="set-header">
        <h3 style="color:#e91e90;margin:0;font-size:1rem">⚙️ Settings</h3>
        <button class="set-btn set-btn-green" onclick="FeatSettingsPanel.save()">💾 Save Changes</button>
        <button class="set-btn set-btn-outline" onclick="FeatSettingsPanel.exportJSON()">📋 Export</button>
      </div>
      <div class="set-layout">
        <div class="set-sidebar">
          ${sections.map(([key, sec]) => `
            <button class="set-nav ${key===this.activeSection?'active':''}"
              onclick="FeatSettingsPanel.goSection('${key}')">${sec.label}</button>
          `).join('')}
        </div>
        <div class="set-content">
          <h4 style="color:#22c55e;margin:0 0 12px;font-size:0.9rem">${this.settings[this.activeSection]?.label || ''}</h4>
          ${activeItems.map(item => this._renderItem(item)).join('')}
        </div>
      </div>
    </div>`;
  },

  _renderItem(item) {
    let control = '';
    switch (item.type) {
      case 'toggle':
        control = `<label class="set-toggle">
          <input type="checkbox" ${item.value?'checked':''} onchange="FeatSettingsPanel.update('${item.key}', this.checked)">
          <span class="set-toggle-slider"></span>
        </label>`;
        break;
      case 'select':
        control = `<select class="set-select" onchange="FeatSettingsPanel.update('${item.key}', this.value)">
          ${item.options.map(o => `<option value="${o}" ${o===item.value?'selected':''}>${o}</option>`).join('')}
        </select>`;
        break;
      case 'text':
        control = `<input class="set-input" type="text" value="${this._esc(item.value)}" onchange="FeatSettingsPanel.update('${item.key}', this.value)">`;
        break;
      case 'color':
        control = `<div class="set-color-wrap">
          <input type="color" value="${item.value}" class="set-color" onchange="FeatSettingsPanel.update('${item.key}', this.value)">
          <span class="set-color-hex">${item.value}</span>
        </div>`;
        break;
    }
    return `<div class="set-item">
      <div class="set-item-label">${item.label}</div>
      <div class="set-item-control">${control}</div>
    </div>`;
  },

  goSection(key) { this.activeSection = key; this.render(); },

  update(key, value) {
    for (const sec of Object.values(this.settings)) {
      const item = sec.items.find(i => i.key === key);
      if (item) { item.value = value; break; }
    }
  },

  save() { alert('Settings saved! (mockup)'); },

  exportJSON() {
    const data = {};
    Object.values(this.settings).forEach(sec => sec.items.forEach(i => data[i.key] = i.value));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'settings.json'; a.click();
  },

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },
  exportState() { return { settings: this.settings }; },
  importState(s) { if (s.settings) this.settings = s.settings; this.render(); }
};
