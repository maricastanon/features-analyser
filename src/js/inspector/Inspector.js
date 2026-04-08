/* ═══════════════════════════════════════════════════════════════
   Inspector — Variable inspector panel (dev-tools-like)
   Shows all tracked variables with live updates.
   ═══════════════════════════════════════════════════════════════ */
const Inspector = {
  _state: {},
  _moduleId: null,

  init() {
    EventBus.on('sandbox:data-flow', (msg) => this._onDataFlow(msg));
    EventBus.on('sandbox:state', (msg) => this._onState(msg));
    EventBus.on('change:recorded', () => this._updateBadges());
  },

  _onDataFlow(msg) {
    if (msg.op === 'set') {
      // Update local state mirror
      if (!this._state[msg.target]) this._state[msg.target] = {};
      this._state[msg.target][msg.prop] = msg.newValue;

      // Record change
      ChangeTracker.record(msg);

      // Re-render if inspector is visible
      if (document.getElementById('panel-inspector')?.classList.contains('active')) {
        this.render();
      }
    }
  },

  _onState(msg) {
    this._state = msg.state || {};
    this._moduleId = msg.moduleId;
    this.render();
  },

  requestState(moduleId) {
    this._moduleId = moduleId;
    Sandbox.postMessage(moduleId, { type: 'get-state' });
  },

  render() {
    const container = DOM.el('variableInspector');
    if (!container) return;

    const paths = ChangeTracker.getAllPaths();

    let html = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-3)">
      <h4 style="font-size:var(--font-size-md);font-weight:800;color:var(--accent-pink)">🔎 Variables</h4>
      <div class="btn-row">
        <button class="btn btn-sm btn-outline" onclick="Inspector.refresh()">🔄</button>
        <button class="btn btn-sm btn-outline" onclick="Inspector.exportState()">⬇️</button>
        <button class="btn btn-sm btn-outline" onclick="ChangeTracker.clear();Inspector.render()">🗑️</button>
      </div>
    </div>`;

    if (Object.keys(this._state).length === 0 && paths.length === 0) {
      html += `<div class="empty-state" style="padding:20px">
        <div class="empty-state-icon">🔬</div>
        <div class="empty-state-text" style="font-size:var(--font-size-sm)">
          Import a module and interact with it to see variables here.
          <br><br>
          <button class="btn btn-sm btn-pink" onclick="Inspector.refresh()">🔄 Fetch State</button>
        </div>
      </div>`;
    } else {
      // Render state tree
      html += '<div id="inspectorTree"></div>';

      // Render change history for watched variables
      const watches = ChangeTracker.getWatches();
      if (watches.length) {
        html += `<div style="margin-top:var(--sp-4)">
          <h4 style="font-size:var(--font-size-sm);font-weight:800;color:var(--accent-gold);margin-bottom:var(--sp-2)">👁️ Watched Variables</h4>
          ${watches.map(w => {
            const history = ChangeTracker.getHistory(w).slice(-5);
            return `<div class="card" style="margin-bottom:6px;padding:8px">
              <div style="font-weight:700;font-size:var(--font-size-sm);color:var(--accent-pink)">${DOM.esc(w)}</div>
              ${history.map(h => `<div style="font-size:var(--font-size-xs);color:var(--text-muted);padding:2px 0;border-bottom:1px solid var(--border-soft)">
                <span style="color:var(--p1);text-decoration:line-through">${DOM.esc(String(h.oldValue))}</span>
                → <span style="color:var(--accent-green)">${DOM.esc(String(h.newValue))}</span>
                <span style="float:right;opacity:.5">${new Date(h.timestamp).toLocaleTimeString()}</span>
              </div>`).join('')}
            </div>`;
          }).join('')}
        </div>`;
      }

      // Render all tracked paths
      if (paths.length) {
        html += `<div style="margin-top:var(--sp-4)">
          <h4 style="font-size:var(--font-size-sm);font-weight:800;color:var(--accent-green);margin-bottom:var(--sp-2)">📊 Change Log (${paths.length} variables)</h4>
          ${paths.map(p => {
            const history = ChangeTracker.getHistory(p);
            const last = history[history.length - 1];
            const watched = ChangeTracker.isWatched(p);
            return `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid var(--border-soft);font-size:var(--font-size-xs)">
              <button class="btn btn-sm" style="padding:1px 4px;font-size:.6rem;${watched ? 'background:var(--accent-gold);color:#fff' : 'background:var(--bg-surface)'}"
                      onclick="Inspector.toggleWatch('${p}')">${watched ? '👁️' : '○'}</button>
              <span style="font-family:var(--font-mono);color:var(--accent-pink)">${DOM.esc(p)}</span>
              <span style="color:var(--text-muted);margin-left:auto">${last ? DOM.esc(String(last.newValue)).slice(0, 30) : '—'}</span>
              <span class="badge badge-p4" style="font-size:.55rem">${history.length}x</span>
            </div>`;
          }).join('')}
        </div>`;
      }
    }

    container.innerHTML = html;

    // Render tree view if state exists
    if (Object.keys(this._state).length > 0) {
      TreeView.render(this._state, 'inspectorTree');
    }
  },

  _updateBadges() {
    // Could update tab badges etc.
  },

  toggleWatch(path) {
    if (ChangeTracker.isWatched(path)) ChangeTracker.removeWatch(path);
    else ChangeTracker.addWatch(path);
    this.render();
  },

  refresh() {
    if (this._moduleId) {
      this.requestState(this._moduleId);
    } else {
      // Try active mockup
      if (typeof MockupManager !== 'undefined' && MockupManager._activeModuleId) {
        this.requestState(MockupManager._activeModuleId);
      }
    }
  },

  exportState() {
    DOM.download('inspector-state.json', JSON.stringify(this._state, null, 2));
    Toast.show('State exported!');
  }
};
