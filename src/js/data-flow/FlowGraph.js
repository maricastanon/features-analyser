/* ═══════════════════════════════════════════════════════════════
   FlowGraph — SVG node-and-edge renderer for data flow
   Visualizes variables as nodes and data flow as animated edges.
   ═══════════════════════════════════════════════════════════════ */
const FlowGraph = {
  _nodes: {},    // name -> {x, y, type, lastActive}
  _edges: [],    // [{from, to, label, active}]
  _svgId: null,
  _width: 800,
  _height: 300,

  init(containerId) {
    this._svgId = containerId;
    this.render();
  },

  addNode(name, type = 'variable') {
    if (this._nodes[name]) return;
    const count = Object.keys(this._nodes).length;
    const col = count % 6;
    const row = Math.floor(count / 6);
    this._nodes[name] = {
      x: 80 + col * 120,
      y: 50 + row * 80,
      type,
      color: type === 'input' ? '#4caf50' : type === 'output' ? '#e91e90' : '#3b82f6',
      lastActive: 0,
      changeCount: 0
    };
    this.render();
  },

  addEdge(from, to, label = '') {
    if (!this._edges.find(e => e.from === from && e.to === to)) {
      this._edges.push({ from, to, label, active: false, lastActive: 0 });
    }
  },

  highlight(from, to) {
    // Add nodes if they don't exist
    this.addNode(from);
    if (to) this.addNode(to);

    // Activate edge
    const edge = this._edges.find(e => e.from === from && e.to === to);
    if (edge) {
      edge.active = true;
      edge.lastActive = Date.now();
    } else if (to) {
      this._edges.push({ from, to, label: '', active: true, lastActive: Date.now() });
    }

    // Update node
    if (this._nodes[from]) {
      this._nodes[from].lastActive = Date.now();
      this._nodes[from].changeCount++;
    }

    this.render();

    // Deactivate after 2s
    setTimeout(() => {
      if (edge) edge.active = false;
      this.render();
    }, 2000);
  },

  render() {
    const container = document.getElementById(this._svgId);
    if (!container) return;

    const nodes = Object.entries(this._nodes);
    const now = Date.now();

    let svg = `<svg viewBox="0 0 ${this._width} ${this._height}" style="width:100%;height:${this._height}px;background:var(--bg-deep);border-radius:var(--radius-md)">
    <defs>
      <marker id="arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="#5a8a60"/>
      </marker>
      <marker id="arrowhead-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="#e91e90"/>
      </marker>
    </defs>`;

    // Edges
    this._edges.forEach(e => {
      const fromNode = this._nodes[e.from];
      const toNode = this._nodes[e.to];
      if (!fromNode || !toNode) return;

      const isActive = e.active || (now - e.lastActive < 2000);
      const color = isActive ? '#e91e90' : '#1a3d28';
      const width = isActive ? 2.5 : 1;
      const marker = isActive ? 'arrowhead-active' : 'arrowhead';

      svg += `<line x1="${fromNode.x}" y1="${fromNode.y}" x2="${toNode.x}" y2="${toNode.y}"
              stroke="${color}" stroke-width="${width}" marker-end="url(#${marker})"
              ${isActive ? 'stroke-dasharray="6,3"' : ''}/>`;
    });

    // Nodes
    nodes.forEach(([name, node]) => {
      const isActive = now - node.lastActive < 2000;
      const glow = isActive ? `filter: drop-shadow(0 0 6px ${node.color})` : '';
      const radius = 22;

      svg += `<g style="${glow};cursor:pointer" onclick="FlowGraph.onNodeClick('${name}')">
        <circle cx="${node.x}" cy="${node.y}" r="${radius}" fill="${node.color}20" stroke="${node.color}" stroke-width="${isActive ? 2.5 : 1.5}"/>
        <text x="${node.x}" y="${node.y + 4}" fill="${isActive ? '#fff' : node.color}" font-size="9" text-anchor="middle" font-weight="700">
          ${name.length > 8 ? name.slice(0, 8) + '..' : name}
        </text>
        ${node.changeCount > 0 ? `<text x="${node.x + radius - 2}" y="${node.y - radius + 8}" fill="#e91e90" font-size="8" font-weight="800">${node.changeCount}</text>` : ''}
      </g>`;
    });

    // Empty state
    if (nodes.length === 0) {
      svg += `<text x="${this._width / 2}" y="${this._height / 2}" fill="#5a8a60" font-size="12" text-anchor="middle">
        Interact with a mockup to see data flow here
      </text>`;
    }

    svg += '</svg>';
    container.innerHTML = svg;
  },

  onNodeClick(name) {
    EventBus.emit('flowgraph:node-click', name);
    Toast.show(`Variable: ${name} (${this._nodes[name]?.changeCount || 0} changes)`);
  },

  clear() {
    this._nodes = {};
    this._edges = [];
    this.render();
  }
};
