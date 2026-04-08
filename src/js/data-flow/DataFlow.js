/* ═══════════════════════════════════════════════════════════════
   DataFlow — Main data flow visualization panel
   Orchestrates FlowGraph, FlowRecorder, and ProxyTracker.
   ═══════════════════════════════════════════════════════════════ */
const DataFlow = {
  init() {
    FlowGraph.init('flowGraphArea');

    // Listen for data flow events from sandboxed modules
    EventBus.on('sandbox:data-flow', (msg) => {
      if (msg.op === 'set') {
        FlowGraph.addNode(msg.target, 'variable');
        FlowGraph.addNode(msg.target + '.' + msg.prop, msg.valueType === 'function' ? 'function' : 'property');
        FlowGraph.highlight(msg.target, msg.target + '.' + msg.prop);
        FlowRecorder.record(msg);
      }
      else if (msg.op === 'call') {
        FlowGraph.addNode(msg.target, 'variable');
        FlowGraph.addNode(msg.target + '.' + msg.prop, 'function');
        FlowGraph.highlight(msg.target, msg.target + '.' + msg.prop);
        FlowRecorder.record(msg);
      }
    });
  },

  renderControls() {
    const container = DOM.el('flowGraphArea');
    if (!container) return;

    const isRecording = FlowRecorder.isRecording();

    const controls = `
    <div style="display:flex;gap:6px;margin-bottom:var(--sp-2)">
      <button class="btn btn-sm ${isRecording ? 'btn-pink' : 'btn-outline'}" onclick="DataFlow.toggleRecording()">
        ${isRecording ? '⏹️ Stop Recording' : '⏺️ Record'}
      </button>
      <button class="btn btn-sm btn-outline" onclick="FlowRecorder.playback(2)">▶️ Playback</button>
      <button class="btn btn-sm btn-outline" onclick="FlowGraph.clear()">🗑️ Clear</button>
      <button class="btn btn-sm btn-outline" onclick="DataFlow.exportAll()">⬇️ Export</button>
    </div>
    <div id="flowGraphSVG"></div>`;

    container.innerHTML = controls;
    FlowGraph.init('flowGraphSVG');
  },

  toggleRecording() {
    if (FlowRecorder.isRecording()) FlowRecorder.stopRecording();
    else FlowRecorder.startRecording();
    this.renderControls();
  },

  exportAll() {
    const data = {
      events: FlowRecorder.getEvents(),
      nodes: FlowGraph._nodes,
      edges: FlowGraph._edges,
      exportedAt: new Date().toISOString()
    };
    DOM.download('data-flow-export.json', JSON.stringify(data, null, 2));
    Toast.show('Data flow exported!');
  }
};
