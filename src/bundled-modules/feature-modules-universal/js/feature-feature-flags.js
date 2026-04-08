/* ═══════════════════════════════════════════════
   FEATURE: Feature Flag Manager — Universal Module
   Toggle features on/off, set rollout percentages,
   target user segments. Works for ANY app.
   ═══════════════════════════════════════════════ */
const FeatFeatureFlags = {
  flags: [],

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this._seed();
    this.render();
  },

  _seed() {
    this.flags = [
      { id: 1, key: 'dark_mode_v2', name: 'Dark Mode V2', enabled: true, rollout: 100, env: 'production', segment: 'all', desc: 'New dark theme with custom palettes' },
      { id: 2, key: 'ai_copilot', name: 'AI Copilot', enabled: true, rollout: 25, env: 'production', segment: 'beta', desc: 'AI-powered suggestions engine' },
      { id: 3, key: 'new_dashboard', name: 'Redesigned Dashboard', enabled: true, rollout: 50, env: 'staging', segment: 'internal', desc: 'Widget-based dashboard layout' },
      { id: 4, key: 'export_pdf', name: 'PDF Export', enabled: false, rollout: 0, env: 'development', segment: 'all', desc: 'Export reports as PDF' },
      { id: 5, key: 'realtime_collab', name: 'Real-time Collaboration', enabled: true, rollout: 10, env: 'production', segment: 'enterprise', desc: 'Live cursors and real-time editing' },
      { id: 6, key: 'mobile_push', name: 'Mobile Push Notifications', enabled: false, rollout: 0, env: 'staging', segment: 'all', desc: 'Push notifications for mobile app' }
    ];
  },

  render() {
    const active = this.flags.filter(f => f.enabled).length;
    const envColors = { production: '#22c55e', staging: '#f97316', development: '#3b82f6' };

    this.container.innerHTML = `
    <div class="feat-ff-wrap">
      <div class="ff-header">
        <h3 style="color:#e91e90;margin:0;font-size:1rem">🚩 Feature Flags</h3>
        <span class="ff-count">${active}/${this.flags.length} active</span>
        <button class="ff-btn ff-btn-pink" onclick="FeatFeatureFlags.addFlag()">+ New Flag</button>
      </div>
      <div class="ff-list">
        ${this.flags.map(f => `
          <div class="ff-card ${f.enabled?'':'ff-disabled'}">
            <div class="ff-card-top">
              <label class="ff-toggle">
                <input type="checkbox" ${f.enabled?'checked':''} onchange="FeatFeatureFlags.toggle(${f.id})">
                <span class="ff-toggle-slider"></span>
              </label>
              <div class="ff-info">
                <div class="ff-name">${this._esc(f.name)}</div>
                <div class="ff-key">${f.key}</div>
              </div>
              <span class="ff-env" style="background:${envColors[f.env]}22;color:${envColors[f.env]};border:1px solid ${envColors[f.env]}44">${f.env}</span>
              <span class="ff-segment">${f.segment}</span>
            </div>
            <div class="ff-desc">${this._esc(f.desc)}</div>
            ${f.enabled ? `
            <div class="ff-rollout">
              <span class="ff-rollout-label">Rollout: ${f.rollout}%</span>
              <input type="range" min="0" max="100" value="${f.rollout}" class="ff-slider"
                oninput="FeatFeatureFlags.setRollout(${f.id}, parseInt(this.value))">
              <div class="ff-rollout-bar"><div class="ff-rollout-fill" style="width:${f.rollout}%"></div></div>
            </div>` : ''}
            <button class="ff-remove" onclick="FeatFeatureFlags.removeFlag(${f.id})">🗑️</button>
          </div>`).join('')}
      </div>
    </div>`;
  },

  toggle(id) { const f = this.flags.find(x => x.id === id); if (f) { f.enabled = !f.enabled; if (!f.enabled) f.rollout = 0; this.render(); } },
  setRollout(id, val) { const f = this.flags.find(x => x.id === id); if (f) { f.rollout = val; this.render(); } },

  addFlag() {
    const name = prompt('Flag name:');
    if (!name?.trim()) return;
    const key = name.trim().toLowerCase().replace(/\s+/g, '_');
    this.flags.push({ id: Date.now(), key, name: name.trim(), enabled: false, rollout: 0, env: 'development', segment: 'all', desc: 'New feature flag' });
    this.render();
  },

  removeFlag(id) { this.flags = this.flags.filter(f => f.id !== id); this.render(); },

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },
  exportState() { return { flags: this.flags }; },
  importState(s) { if (s.flags) this.flags = s.flags; this.render(); }
};
