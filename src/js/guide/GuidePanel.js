/* ═══════════════════════════════════════════════════════════════
   GuidePanel — Purpose, workflow, and target-app analysis
   Populates the AI Guide tab with concrete usage guidance.
   ═══════════════════════════════════════════════════════════════ */
const GuidePanel = {
  _initialized: false,

  init() {
    this.render();
    if (this._initialized) return;
    EventBus.on('project:switched', () => this.render());
    EventBus.on('module:imported', () => this.render());
    EventBus.on('module:updated', () => this.render());
    EventBus.on('module:removed', () => this.render());
    this._initialized = true;
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
            Best use: treat each imported item as a decision candidate. The default workspace is a reusable <strong>ACE template</strong> you adapt project by project. Company X1 and Marex Dynamic are only example presets, not the purpose of the app.
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <h3 class="section-title" style="color:var(--accent-green);margin-bottom:10px">How To Use It Well</h3>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${this._step('0', 'Load the ACE pack', 'Start from the generic template pack if you want a reusable feature strategy cockpit inside the app itself.')}
            ${this._step('1', 'Import code mockups', 'Drop JS/CSS/HTML bundles or load built-in modules from the shipped catalog.')}
            ${this._step('2', 'Import references', 'Drop mindmaps, markdown notes, JSON, SVG, or screenshots as reviewable work items.')}
            ${this._step('3', 'Use the analysis', 'Each code mockup gets tags, a suggested track, and a generated checklist so you can decide faster.')}
            ${this._step('4', 'Promote deliberately', 'Send the item to Features, Improve, or Implementation based on what decision you made. Mindmaps and other references can stay as references until you are ready.')}
            ${this._step('5', 'Close the loop', 'Mark the work item done, archive it, or remove it after the idea has been absorbed. Done and archive both keep history; remove deletes it outright.')}
          </div>
          <div class="btn-row" style="margin-top:14px">
            <button class="btn btn-pink" onclick="MockupManager.loadAceTemplatePack()">🧠 Load ACE Template Pack</button>
            <button class="btn btn-pink" onclick="MockupManager.loadStarterSet()">🚀 Load 17 Starter Mockups</button>
            <button class="btn btn-pink" onclick="App.go('mockups')">🧪 Open Mockups</button>
            <button class="btn btn-outline" onclick="MockupManager.exportProjectList()">📝 Export Project List</button>
          </div>
        </div>
      </div>
    </div>

    <div class="grid-2" style="margin-top:16px">
      <div class="card">
        <div class="card-body">
          <h3 class="section-title" style="color:var(--accent-pink);margin-bottom:10px">Default Workspace: ACE Template</h3>
          <div style="font-size:var(--font-size-sm);color:var(--text-secondary);line-height:1.7">
            <strong>Purpose:</strong> a generic, reusable workspace for competitor mapping, complaint synthesis, gap analysis, and feature mockup selection.
            <br><strong>Shape:</strong> neutral template first, then adapt it per product.
            <br><strong>Good mockups:</strong> ACE Template Lab, Mindmap, Dependency Graph, User Stories, Workflow Builder, Feedback Board.
          </div>
          <div class="btn-row" style="margin-top:14px">
            <button class="btn btn-green" onclick="MockupManager.loadAceTemplatePack()">📦 Load ACE Template Pack</button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <h3 class="section-title" style="color:var(--accent-green);margin-bottom:10px">Example Preset: Company X1 PM</h3>
          <div style="font-size:var(--font-size-sm);color:var(--text-secondary);line-height:1.7">
            <strong>Purpose:</strong> an enterprise project manager with broad operational coverage, permissions, integrations, reporting, and security-sensitive workflows.
            <br><strong>Shape:</strong> role-heavy, multi-tenant, breadth-first product.
            <br><strong>Good mockups:</strong> Kanban, Risk Matrix, Capacity Planner, Critical Path, Status Reports, Report Wizard, Role System, Time Tracker.
          </div>
          <div class="btn-row" style="margin-top:14px">
            <button class="btn btn-green" onclick="MockupManager.loadBundledSet('company-x1')">📦 Load Example Set</button>
          </div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:16px">
      <div class="card-body">
        <h3 class="section-title" style="color:var(--accent-green);margin-bottom:10px">Example Preset: Marex Dynamic PM</h3>
        <div style="font-size:var(--font-size-sm);color:var(--text-secondary);line-height:1.7">
          <strong>Purpose:</strong> a personal creative PWA and project command center with idea capture, offline-first behavior, and faster solo iteration loops.
          <br><strong>Shape:</strong> deeper idea workflows, lighter governance, and more experimental views.
          <br><strong>Good mockups:</strong> Offline Mode, Custom Dashboard, Time Tracker, Status Reports, AI Copilot, Ideas Board, Recurring Tasks, Custom Backgrounds.
        </div>
        <div class="btn-row" style="margin-top:14px">
          <button class="btn btn-green" onclick="MockupManager.loadBundledSet('marex-dynamic')">📦 Load Example Set</button>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:16px">
      <div class="card-body">
        <h3 class="section-title" style="color:var(--accent-gold);margin-bottom:10px">Similarity And Difference</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px">
          ${this._fact('Shared', 'Both are vanilla JS front-end products with modular views, custom visual language, and feature slices that can be prototyped outside production.')}
          ${this._fact('Company X1', 'Breadth-first product: governance, permissions, reporting, integrations, and operational coordination across many surfaces.')}
          ${this._fact('Marex Dynamic', 'Depth-first personal workspace: idea capture, offline continuity, and fast iteration matter more than enterprise ceremony.')}
          ${this._fact('Implication', 'The analyser has to support both formal enterprise features and creative exploratory features, plus non-code references such as mindmaps and planning notes.')}
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
