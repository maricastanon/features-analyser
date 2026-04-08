/* ═══════════════════════════════════════════════
   FEATURE: Changelog Generator — Universal Module
   Track versions, changes, and release notes.
   ═══════════════════════════════════════════════ */
const FeatChangelog = {
  releases: [],

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this._seed();
    this.render();
  },

  _seed() {
    this.releases = [
      { id: 1, version: '2.4.0', date: '2026-04-08', status: 'latest',
        changes: [
          { type: 'added', text: 'Dark mode support with custom themes' },
          { type: 'added', text: 'Export to PDF and CSV' },
          { type: 'improved', text: 'Dashboard load time reduced by 40%' },
          { type: 'fixed', text: 'Login redirect loop on Safari' }
        ]},
      { id: 2, version: '2.3.1', date: '2026-03-22', status: 'stable',
        changes: [
          { type: 'fixed', text: 'Critical: data loss on concurrent edits' },
          { type: 'fixed', text: 'Notification badge not clearing' },
          { type: 'security', text: 'Patched XSS in comment renderer' }
        ]},
      { id: 3, version: '2.3.0', date: '2026-03-10', status: 'stable',
        changes: [
          { type: 'added', text: 'Team collaboration with real-time cursors' },
          { type: 'added', text: 'Keyboard shortcuts panel' },
          { type: 'improved', text: 'Search now includes archived items' },
          { type: 'deprecated', text: 'Legacy API v1 endpoints' },
          { type: 'removed', text: 'Flash-based chart renderer' }
        ]}
    ];
  },

  render() {
    const typeConfig = {
      added:      { emoji: '✨', color: '#22c55e', label: 'Added' },
      improved:   { emoji: '⚡', color: '#3b82f6', label: 'Improved' },
      fixed:      { emoji: '🐛', color: '#f97316', label: 'Fixed' },
      security:   { emoji: '🔒', color: '#ef4444', label: 'Security' },
      deprecated: { emoji: '⚠️', color: '#eab308', label: 'Deprecated' },
      removed:    { emoji: '🗑️', color: '#94a3b8', label: 'Removed' }
    };

    this.container.innerHTML = `
    <div class="feat-changelog-wrap">
      <div class="cl-header">
        <h3 style="color:#e91e90;margin:0;font-size:1rem">📜 Changelog</h3>
        <button class="cl-btn cl-btn-pink" onclick="FeatChangelog.addRelease()">+ New Release</button>
        <button class="cl-btn cl-btn-outline" onclick="FeatChangelog.exportMarkdown()">📋 Export MD</button>
      </div>
      <div class="cl-timeline">
        ${this.releases.map(r => `
          <div class="cl-release">
            <div class="cl-release-header">
              <div class="cl-version">${r.version}</div>
              <div class="cl-date">${r.date}</div>
              ${r.status === 'latest' ? '<span class="cl-latest">LATEST</span>' : ''}
            </div>
            <div class="cl-changes">
              ${r.changes.map(c => {
                const cfg = typeConfig[c.type] || typeConfig.added;
                return `<div class="cl-change">
                  <span class="cl-type" style="background:${cfg.color}22;color:${cfg.color};border:1px solid ${cfg.color}44">${cfg.emoji} ${cfg.label}</span>
                  <span class="cl-text">${this._esc(c.text)}</span>
                </div>`;
              }).join('')}
            </div>
            <button class="cl-add-change" onclick="FeatChangelog.addChange(${r.id})">+ Add change</button>
          </div>
        `).join('')}
      </div>
    </div>`;
  },

  addRelease() {
    const version = prompt('Version number (e.g. 2.5.0):');
    if (!version?.trim()) return;
    this.releases.unshift({
      id: Date.now(), version: version.trim(),
      date: new Date().toISOString().split('T')[0],
      status: 'latest', changes: []
    });
    if (this.releases[1]) this.releases[1].status = 'stable';
    this.render();
  },

  addChange(releaseId) {
    const release = this.releases.find(r => r.id === releaseId);
    if (!release) return;
    const text = prompt('Change description:');
    if (!text?.trim()) return;
    const type = prompt('Type (added/improved/fixed/security/deprecated/removed):', 'added');
    release.changes.push({ type: type || 'added', text: text.trim() });
    this.render();
  },

  exportMarkdown() {
    const md = this.releases.map(r =>
      `## [${r.version}] - ${r.date}\n` +
      r.changes.map(c => `- **${c.type}**: ${c.text}`).join('\n')
    ).join('\n\n');
    const blob = new Blob([`# Changelog\n\n${md}`], { type: 'text/markdown' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'CHANGELOG.md'; a.click();
  },

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },
  exportState() { return { releases: this.releases }; },
  importState(s) { if (s.releases) this.releases = s.releases; this.render(); }
};
