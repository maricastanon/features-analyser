/* ═══════════════════════════════════════════════
   FEATURE: Dependency Graph — Universal Module
   Visualize feature/component dependencies.
   Detect circular deps, orphans, bottlenecks.
   ═══════════════════════════════════════════════ */
const FeatDependencyGraph = {
  nodes: [],
  edges: [],
  selectedNode: null,

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this._seed();
    this.render();
  },

  _seed() {
    this.nodes = [
      { id: 'auth',       label: 'Auth System',      type: 'core',    x: 300, y: 60,  status: 'done' },
      { id: 'api',        label: 'REST API',          type: 'core',    x: 150, y: 150, status: 'done' },
      { id: 'db',         label: 'Database Layer',    type: 'core',    x: 450, y: 150, status: 'done' },
      { id: 'dashboard',  label: 'Dashboard UI',      type: 'feature', x: 80,  y: 260, status: 'progress' },
      { id: 'reports',    label: 'Reports Engine',    type: 'feature', x: 250, y: 260, status: 'progress' },
      { id: 'notif',      label: 'Notifications',     type: 'feature', x: 420, y: 260, status: 'todo' },
      { id: 'export',     label: 'PDF Export',         type: 'util',   x: 160, y: 360, status: 'todo' },
      { id: 'search',     label: 'Global Search',     type: 'feature', x: 350, y: 360, status: 'todo' },
      { id: 'mobile',     label: 'Mobile App',         type: 'feature', x: 520, y: 360, status: 'blocked' }
    ];
    this.edges = [
      { from: 'api', to: 'auth' }, { from: 'db', to: 'auth' },
      { from: 'dashboard', to: 'api' }, { from: 'reports', to: 'api' },
      { from: 'reports', to: 'db' }, { from: 'notif', to: 'api' },
      { from: 'export', to: 'reports' }, { from: 'search', to: 'db' },
      { from: 'mobile', to: 'api' }, { from: 'mobile', to: 'notif' }
    ];
  },

  render() {
    const typeColors = { core: '#e91e90', feature: '#22c55e', util: '#3b82f6' };
    const statusIcons = { done: '✅', progress: '🔥', todo: '⬜', blocked: '🚫' };
    const blockers = this._findBottlenecks();
    const orphans = this._findOrphans();

    this.container.innerHTML = `
    <div class="feat-depgraph-wrap">
      <div class="dg-toolbar">
        <span style="font-weight:800;color:#e91e90">🔗 Dependency Graph</span>
        <div class="dg-legend">
          ${Object.entries(typeColors).map(([t,c]) => `<span class="dg-leg"><span class="dg-dot" style="background:${c}"></span>${t}</span>`).join('')}
        </div>
      </div>
      <div class="dg-alerts">
        ${blockers.length ? `<div class="dg-alert dg-alert-warn">⚠️ Bottleneck: <b>${blockers.map(b=>b.label).join(', ')}</b> — ${blockers[0]?.depCount || 0} features depend on it</div>` : ''}
        ${orphans.length ? `<div class="dg-alert dg-alert-info">💡 Orphans: <b>${orphans.map(o=>o.label).join(', ')}</b> — no dependencies</div>` : ''}
      </div>
      <div class="dg-canvas" id="dgCanvas">
        <svg class="dg-svg" id="dgSvg"></svg>
        <div class="dg-nodes" id="dgNodes"></div>
      </div>
      <div class="dg-detail" id="dgDetail">
        <span style="color:#5a8a60;font-size:0.8rem">Click a node to see details</span>
      </div>
    </div>`;

    this._drawEdges();
    this._drawNodes(typeColors, statusIcons);
  },

  _drawEdges() {
    const svg = document.getElementById('dgSvg');
    if (!svg) return;
    svg.innerHTML = this.edges.map(e => {
      const from = this.nodes.find(n => n.id === e.from);
      const to = this.nodes.find(n => n.id === e.to);
      if (!from || !to) return '';
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2 - 20;
      return `<path d="M${from.x},${from.y} Q${midX},${midY} ${to.x},${to.y}"
              fill="none" stroke="#1a3d2855" stroke-width="2" marker-end="url(#arrow)"/>`;
    }).join('') + `<defs><marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <path d="M0,0 L8,3 L0,6" fill="#1a3d28"/></marker></defs>`;
  },

  _drawNodes(typeColors, statusIcons) {
    const container = document.getElementById('dgNodes');
    if (!container) return;
    container.innerHTML = this.nodes.map(n => `
      <div class="dg-node" style="left:${n.x-45}px;top:${n.y-20}px;border-color:${typeColors[n.type]}"
           onclick="FeatDependencyGraph.selectNode('${n.id}')">
        <span class="dg-node-status">${statusIcons[n.status]}</span>
        <span class="dg-node-label">${n.label}</span>
      </div>`).join('');
  },

  selectNode(id) {
    const node = this.nodes.find(n => n.id === id);
    if (!node) return;
    this.selectedNode = id;
    const deps = this.edges.filter(e => e.from === id).map(e => this.nodes.find(n => n.id === e.to)?.label).filter(Boolean);
    const dependents = this.edges.filter(e => e.to === id).map(e => this.nodes.find(n => n.id === e.from)?.label).filter(Boolean);
    const detail = document.getElementById('dgDetail');
    if (detail) {
      detail.innerHTML = `
        <div style="font-weight:800;color:#e91e90;margin-bottom:6px">${node.label}</div>
        <div style="font-size:0.78rem;color:#e8f5e9">
          <div>Type: <b>${node.type}</b> • Status: <b>${node.status}</b></div>
          <div style="margin-top:4px">Depends on: ${deps.length ? deps.join(', ') : '<em>none</em>'}</div>
          <div>Used by: ${dependents.length ? dependents.join(', ') : '<em>none</em>'}</div>
        </div>`;
    }
  },

  _findBottlenecks() {
    const counts = {};
    this.edges.forEach(e => { counts[e.to] = (counts[e.to] || 0) + 1; });
    return Object.entries(counts)
      .filter(([,c]) => c >= 2)
      .map(([id, c]) => ({ ...this.nodes.find(n => n.id === id), depCount: c }))
      .sort((a,b) => b.depCount - a.depCount);
  },

  _findOrphans() {
    const hasEdge = new Set([...this.edges.map(e=>e.from), ...this.edges.map(e=>e.to)]);
    return this.nodes.filter(n => !hasEdge.has(n.id));
  },

  exportState() { return { nodes: this.nodes, edges: this.edges }; },
  importState(s) { if (s.nodes) this.nodes = s.nodes; if (s.edges) this.edges = s.edges; this.render(); }
};
