/* ═══════════════════════════════════════════════════════════════
   GuidePanel — Purpose, workflow, and target-app analysis
   Populates the AI Guide tab with concrete usage guidance.
   ═══════════════════════════════════════════════════════════════ */
const GuidePanel = {
  init() {
    this.render();
    EventBus.on('project:switched', () => this.render());
  },

  render() {
    const container = DOM.el('guideContent');
    if (!container) return;

    container.innerHTML = `
    <div class="grid-2">
      <div class="card">
        <div class="card-body">
          <h3 class="section-title" style="color:var(--accent-pink);margin-bottom:10px">Purpose Of This App</h3>
          <div style="font-size:var(--font-size-md);color:var(--text-secondary);line-height:1.7">
            This is a <strong>feature lab</strong>, not just a backlog tracker.
            It exists to let you import or load a feature idea as a live mockup or reference, evaluate it in isolation, turn it into a feature or improvement, and only then move it into implementation.
          </div>
          <div style="margin-top:12px;font-size:var(--font-size-sm);color:var(--text-muted);line-height:1.7">
            Best use: treat each imported item as a decision candidate. Add context, choose whether it belongs in <strong>Features</strong>, <strong>Improve</strong>, or <strong>Implementation</strong>, and archive or delete it once the decision is made.
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <h3 class="section-title" style="color:var(--accent-green);margin-bottom:10px">How To Use It Well</h3>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${this._step('1', 'Import code mockups', 'Drop JS/CSS/HTML bundles or load built-in modules from the shipped catalog.')}
            ${this._step('2', 'Import references', 'Drop mindmaps, markdown notes, JSON, SVG, or screenshots as reviewable work items.')}
            ${this._step('3', 'Add context', 'Write a short summary, implementation notes, category, and priority before promoting the item.')}
            ${this._step('4', 'Promote deliberately', 'Send the item to Features, Improve, or Implementation based on what decision you made.')}
            ${this._step('5', 'Close the loop', 'Mark the work item done, archive it, or remove it after the idea has been absorbed.')}
          </div>
          <div class="btn-row" style="margin-top:14px">
            <button class="btn btn-pink" onclick="App.go('mockups')">🧪 Open Mockups</button>
            <button class="btn btn-outline" onclick="MockupManager.exportProjectList()">📝 Export Project List</button>
          </div>
        </div>
      </div>
    </div>

    <div class="grid-2" style="margin-top:16px">
      <div class="card">
        <div class="card-body">
          <h3 class="section-title" style="color:var(--accent-pink);margin-bottom:10px">Target App: PM Toolkit</h3>
          <div style="font-size:var(--font-size-sm);color:var(--text-secondary);line-height:1.7">
            <strong>Purpose:</strong> a broad project-management suite with Gantt variants, risk, budget, RACI, resources, burndown, and decision logging.
            <br><strong>Shape:</strong> dashboard-heavy, multi-tool, shared-data product.
            <br><strong>Good mockups:</strong> Kanban, Risk Matrix, Capacity Planner, Critical Path, Status Reports, Report Wizard, Role System, Time Tracker.
          </div>
          <div class="btn-row" style="margin-top:14px">
            <button class="btn btn-green" onclick="MockupManager.loadBundledSet('pm-toolkit')">📦 Load Recommended Set</button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <h3 class="section-title" style="color:var(--accent-green);margin-bottom:10px">Target App: Sight Reading Trainer</h3>
          <div style="font-size:var(--font-size-sm);color:var(--text-secondary);line-height:1.7">
            <strong>Purpose:</strong> a focused training app for piano sight-reading with progression, accuracy, score, streaks, keyboard input, and notation rendering.
            <br><strong>Shape:</strong> one primary loop, performance-sensitive, game-like feedback.
            <br><strong>Good mockups:</strong> Offline Mode, Custom Dashboard, Time Tracker, Status Reports, AI Copilot, Global Search, Recurring Tasks, Custom Backgrounds.
          </div>
          <div class="btn-row" style="margin-top:14px">
            <button class="btn btn-green" onclick="MockupManager.loadBundledSet('sight-reading-trainer')">📦 Load Recommended Set</button>
          </div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:16px">
      <div class="card-body">
        <h3 class="section-title" style="color:var(--accent-gold);margin-bottom:10px">Similarity And Difference</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px">
          ${this._fact('Shared', 'Both are static front-end apps with strong interaction surfaces, custom visual language, and modular UI slices that can be prototyped outside the main app.')}
          ${this._fact('PM Toolkit', 'Breadth-first product: many related tools, shared context, cross-tool navigation, and admin-style decision support.')}
          ${this._fact('Sight Trainer', 'Depth-first product: one repeated learning loop where latency, clarity, flow, and progression matter more than breadth.')}
          ${this._fact('Implication', 'The analyser must accept both dashboard-like modules and focused interaction loops, plus non-code references such as mindmaps and planning notes.')}
        </div>
      </div>
    </div>`;
  },

  _step(label, title, body) {
    return `<div style="display:flex;gap:10px;align-items:flex-start;padding:10px;background:var(--bg-surface);border:1px solid var(--border-soft);border-radius:10px">
      <div style="width:24px;height:24px;border-radius:50%;background:var(--accent-pink-bg);color:var(--accent-pink);font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0">${label}</div>
      <div>
        <div style="font-weight:800;color:var(--text-primary);font-size:var(--font-size-sm)">${title}</div>
        <div style="font-size:var(--font-size-sm);color:var(--text-muted);line-height:1.6">${body}</div>
      </div>
    </div>`;
  },

  _fact(title, body) {
    return `<div style="padding:12px;background:var(--bg-surface);border:1px solid var(--border-soft);border-radius:10px">
      <div style="font-weight:800;color:var(--accent-pink);margin-bottom:4px">${title}</div>
      <div style="font-size:var(--font-size-sm);color:var(--text-muted);line-height:1.6">${body}</div>
    </div>`;
  }
};
