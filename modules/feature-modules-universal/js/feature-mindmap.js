/* ═══════════════════════════════════════════════
   FEATURE: Interactive Mindmap — Universal Module
   Brainstorm ideas visually, connect concepts,
   export as list. Works for ANY app.
   ═══════════════════════════════════════════════ */
const FeatMindmap = {
  nodes: [],
  connections: [],
  selectedNode: null,
  dragState: null,
  canvas: null,
  ctx: null,
  nextId: 1,

  COLORS: ['#22c55e','#3b82f6','#f97316','#e91e90','#a855f7','#eab308','#06b6d4','#ef4444'],

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this._seed();
    this.render();
  },

  _seed() {
    this.nodes = [
      { id: 1, text: 'Main Idea', x: 300, y: 200, color: '#e91e90', size: 60, parent: null, status: 'active' },
      { id: 2, text: 'Feature A', x: 140, y: 100, color: '#22c55e', size: 45, parent: 1, status: 'active' },
      { id: 3, text: 'Feature B', x: 460, y: 100, color: '#3b82f6', size: 45, parent: 1, status: 'active' },
      { id: 4, text: 'Sub-idea 1', x: 80, y: 300, color: '#f97316', size: 35, parent: 2, status: 'todo' },
      { id: 5, text: 'Sub-idea 2', x: 200, y: 320, color: '#a855f7', size: 35, parent: 2, status: 'done' },
      { id: 6, text: 'Sub-idea 3', x: 400, y: 300, color: '#eab308', size: 35, parent: 3, status: 'todo' },
      { id: 7, text: 'Sub-idea 4', x: 520, y: 320, color: '#06b6d4', size: 35, parent: 3, status: 'active' }
    ];
    this.nextId = 8;
    this.connections = this.nodes.filter(n => n.parent).map(n => ({ from: n.parent, to: n.id }));
  },

  render() {
    const statusCounts = { active: 0, todo: 0, done: 0 };
    this.nodes.forEach(n => statusCounts[n.status]++);

    this.container.innerHTML = `
    <div class="feat-mindmap-wrap">
      <div class="feat-mindmap-toolbar">
        <button class="mm-btn mm-btn-green" onclick="FeatMindmap.addNode()">+ Add Node</button>
        <button class="mm-btn mm-btn-pink" onclick="FeatMindmap.connectMode()">🔗 Connect</button>
        <button class="mm-btn mm-btn-blue" onclick="FeatMindmap.exportList()">📋 Export List</button>
        <button class="mm-btn mm-btn-outline" onclick="FeatMindmap.clearDone()">🧹 Clear Done</button>
        <div class="mm-stats">
          <span class="mm-stat"><span class="mm-dot" style="background:#22c55e"></span>${statusCounts.active} Active</span>
          <span class="mm-stat"><span class="mm-dot" style="background:#3b82f6"></span>${statusCounts.todo} Todo</span>
          <span class="mm-stat"><span class="mm-dot" style="background:#a855f7"></span>${statusCounts.done} Done</span>
        </div>
      </div>
      <div class="feat-mindmap-canvas" id="mmCanvas">
        <svg class="mm-svg" id="mmSvg"></svg>
        <div class="mm-nodes" id="mmNodes"></div>
      </div>
      <div class="feat-mindmap-list" id="mmList"></div>
    </div>`;

    this._renderConnections();
    this._renderNodes();
    this._renderList();
    this._bindDrag();
  },

  _renderConnections() {
    const svg = document.getElementById('mmSvg');
    if (!svg) return;
    svg.innerHTML = this.connections.map(c => {
      const from = this.nodes.find(n => n.id === c.from);
      const to = this.nodes.find(n => n.id === c.to);
      if (!from || !to) return '';
      return `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"
              stroke="${to.color}33" stroke-width="2" stroke-dasharray="6,3"/>`;
    }).join('');
  },

  _renderNodes() {
    const container = document.getElementById('mmNodes');
    if (!container) return;
    container.innerHTML = this.nodes.map(n => {
      const statusIcon = n.status === 'done' ? '✅' : n.status === 'todo' ? '📋' : '🔥';
      const opacity = n.status === 'done' ? '0.5' : '1';
      return `<div class="mm-node ${n.status === 'done' ? 'mm-done' : ''}"
                  data-id="${n.id}"
                  style="left:${n.x - n.size/2}px;top:${n.y - n.size/2}px;width:${n.size}px;height:${n.size}px;
                         background:${n.color}22;border-color:${n.color};opacity:${opacity}"
                  onclick="FeatMindmap.selectNode(${n.id})"
                  ondblclick="FeatMindmap.editNode(${n.id})">
              <span class="mm-node-icon">${statusIcon}</span>
              <span class="mm-node-text">${this._esc(n.text)}</span>
            </div>`;
    }).join('');
  },

  _renderList() {
    const list = document.getElementById('mmList');
    if (!list) return;
    const tree = this._buildTree();
    list.innerHTML = `<h4 style="color:#e91e90;margin:0 0 8px;font-size:0.85rem">📋 Mindmap as List</h4>` +
      this._renderTreeHTML(tree, 0);
  },

  _buildTree() {
    const roots = this.nodes.filter(n => !n.parent);
    const build = (parent) => ({
      ...parent,
      children: this.nodes.filter(n => n.parent === parent.id).map(c => build(c))
    });
    return roots.map(r => build(r));
  },

  _renderTreeHTML(nodes, depth) {
    return nodes.map(n => {
      const indent = depth * 16;
      const statusBtn = `<span class="mm-status-btn" onclick="FeatMindmap.cycleStatus(${n.id})"
                          style="color:${n.status === 'done' ? '#22c55e' : n.status === 'todo' ? '#3b82f6' : '#f97316'}"
                          title="Click to cycle status">
                          ${n.status === 'done' ? '✅' : n.status === 'todo' ? '⬜' : '🔥'}</span>`;
      const removeBtn = `<span class="mm-remove-btn" onclick="FeatMindmap.removeNode(${n.id})" title="Remove">✕</span>`;
      return `<div class="mm-list-item" style="padding-left:${indent}px">
                ${statusBtn}
                <span class="mm-list-text ${n.status === 'done' ? 'mm-struck' : ''}">${this._esc(n.text)}</span>
                ${removeBtn}
              </div>` + (n.children ? this._renderTreeHTML(n.children, depth + 1) : '');
    }).join('');
  },

  addNode() {
    const text = prompt('Node name:');
    if (!text?.trim()) return;
    const parent = this.selectedNode || this.nodes[0]?.id || null;
    const parentNode = this.nodes.find(n => n.id === parent);
    const color = this.COLORS[this.nextId % this.COLORS.length];
    const node = {
      id: this.nextId++,
      text: text.trim(),
      x: (parentNode?.x || 300) + (Math.random() * 120 - 60),
      y: (parentNode?.y || 200) + 80 + Math.random() * 40,
      color, size: 40, parent, status: 'todo'
    };
    this.nodes.push(node);
    if (parent) this.connections.push({ from: parent, to: node.id });
    this.render();
  },

  selectNode(id) {
    this.selectedNode = id;
    document.querySelectorAll('.mm-node').forEach(el => {
      el.classList.toggle('mm-selected', parseInt(el.dataset.id) === id);
    });
  },

  editNode(id) {
    const node = this.nodes.find(n => n.id === id);
    if (!node) return;
    const text = prompt('Edit node:', node.text);
    if (text?.trim()) { node.text = text.trim(); this.render(); }
  },

  cycleStatus(id) {
    const node = this.nodes.find(n => n.id === id);
    if (!node) return;
    const cycle = { active: 'todo', todo: 'done', done: 'active' };
    node.status = cycle[node.status];
    this.render();
  },

  removeNode(id) {
    this.nodes = this.nodes.filter(n => n.id !== id);
    this.connections = this.connections.filter(c => c.from !== id && c.to !== id);
    // Re-parent children
    this.nodes.filter(n => n.parent === id).forEach(n => n.parent = null);
    this.render();
  },

  clearDone() {
    const doneIds = this.nodes.filter(n => n.status === 'done').map(n => n.id);
    this.nodes = this.nodes.filter(n => n.status !== 'done');
    this.connections = this.connections.filter(c => !doneIds.includes(c.from) && !doneIds.includes(c.to));
    this.render();
  },

  connectMode() {
    alert('Select a node first, then add a child — connections are automatic!');
  },

  exportList() {
    const tree = this._buildTree();
    const lines = [];
    const walk = (nodes, depth) => {
      nodes.forEach(n => {
        const prefix = '  '.repeat(depth) + (depth > 0 ? '• ' : '');
        const status = n.status === 'done' ? '[DONE]' : n.status === 'todo' ? '[TODO]' : '[ACTIVE]';
        lines.push(prefix + n.text + ' ' + status);
        if (n.children) walk(n.children, depth + 1);
      });
    };
    walk(tree, 0);
    const text = lines.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mindmap-export.txt';
    a.click();
  },

  _bindDrag() {
    const nodes = document.querySelectorAll('.mm-node');
    nodes.forEach(el => {
      el.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('mm-status-btn') || e.target.classList.contains('mm-remove-btn')) return;
        const id = parseInt(el.dataset.id);
        const node = this.nodes.find(n => n.id === id);
        if (!node) return;
        const canvas = document.getElementById('mmCanvas');
        const rect = canvas.getBoundingClientRect();
        const offX = e.clientX - (node.x + rect.left - canvas.scrollLeft);
        const offY = e.clientY - (node.y + rect.top - canvas.scrollTop);
        const move = (me) => {
          node.x = me.clientX - rect.left + canvas.scrollLeft - offX + node.size/2;
          node.y = me.clientY - rect.top + canvas.scrollTop - offY + node.size/2;
          el.style.left = (node.x - node.size/2) + 'px';
          el.style.top = (node.y - node.size/2) + 'px';
          this._renderConnections();
        };
        const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
      });
    });
  },

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },

  exportState() { return { nodes: this.nodes, connections: this.connections }; },
  importState(s) { if (s.nodes) this.nodes = s.nodes; if (s.connections) this.connections = s.connections; this.render(); }
};
