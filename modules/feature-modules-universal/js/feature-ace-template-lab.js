/* ═══════════════════════════════════════════════════════════════
   FEATURE: ACE Template Lab — Universal Module
   Seeded with Microsoft Planner research, but reusable for any app.
   Maps feature families, complaints, gaps, and a build queue in one place.
   ═══════════════════════════════════════════════════════════════ */
const FeatAceTemplateLab = {
  container: null,
  activeTab: 'overview',
  activeFamilyId: 'hub',
  search: '',
  filter: 'all',
  targetApp: 'Your App',
  benchmarkApp: 'Microsoft Planner',
  seedMode: 'planner',
  starred: [],
  queued: [],
  done: [],

  FAMILIES: [
    {
      id: 'hub',
      name: 'Personal Work Hub',
      badge: 'Core',
      hasNow: ['My tasks surfaces', 'Assignment inbox', 'Personal orientation layer'],
      caveats: ['Attention design is usually weak', 'Mixed personal/team context gets noisy'],
      modules: ['energy-my-day', 'focus-bubble-router', 'assignment-pulse-feed']
    },
    {
      id: 'setup',
      name: 'Setup + Templates',
      badge: 'Core',
      hasNow: ['Plan creation', 'Starter templates', 'Kickoff structure'],
      caveats: ['Teams still need guided setup', 'Template quality varies'],
      modules: ['template-composer', 'plan-intake-wizard', 'bucket-starter-pack']
    },
    {
      id: 'task-card',
      name: 'Task Detail Engine',
      badge: 'Core',
      hasNow: ['Rich task records', 'Files and notes', 'Basic checklist structure'],
      caveats: ['Narrative context is often thin', 'Subtask depth is limited'],
      modules: ['task-story-card', 'attachment-signal-rail', 'checklist-splitter-lab']
    },
    {
      id: 'views',
      name: 'Views + Navigation',
      badge: 'Core',
      hasNow: ['Board/list/calendar style views', 'Sorting and grouping', 'Navigation surfaces'],
      caveats: ['Filtering logic is usually weaker than teams want', 'Bulk editing is often clumsy'],
      modules: ['dense-grid-editor', 'swimlane-heat-board', 'calendar-conflict-dock']
    },
    {
      id: 'collab',
      name: 'Collaboration + Assignments',
      badge: 'Core',
      hasNow: ['Assignments', 'Notifications', 'Comments or discussions'],
      caveats: ['Shared ownership gets fuzzy', 'Handoffs are rarely explicit'],
      modules: ['multi-assignee-handoff', 'decision-log-thread', 'stakeholder-ping-matrix']
    },
    {
      id: 'reporting',
      name: 'Reporting + Status',
      badge: 'Growth',
      hasNow: ['Dashboards', 'Exports', 'Progress snapshots'],
      caveats: ['Executive storytelling is often weak', 'Teams still export to finish the job'],
      modules: ['executive-snapshot', 'completion-funnel', 'export-pack-builder']
    },
    {
      id: 'premium-scheduling',
      name: 'Scheduling + Dependencies',
      badge: 'Growth',
      hasNow: ['Timeline thinking', 'Dependencies', 'Milestones'],
      caveats: ['Too much logic is hidden', 'Ripple effects are hard to teach'],
      modules: ['dependency-playground', 'critical-chain-lens', 'milestone-pulse']
    },
    {
      id: 'agile-goals',
      name: 'Goals + Agile',
      badge: 'Growth',
      hasNow: ['Goals', 'Backlog patterns', 'Sprint planning'],
      caveats: ['Line of sight to goals gets lost', 'Readiness gates are weak'],
      modules: ['goal-trace-tree', 'sprint-balance-meter', 'backlog-gatekeeper']
    },
    {
      id: 'integrations',
      name: 'Integrations + AI',
      badge: 'Growth',
      hasNow: ['External syncs', 'AI helpers', 'Workflow automations'],
      caveats: ['Capability boundaries are unclear', 'API fit is often overestimated'],
      modules: ['todo-sync-lens', 'teams-action-ribbon', 'workflow-safety-checker']
    },
    {
      id: 'admin-portfolio',
      name: 'Admin + Portfolio',
      badge: 'Advanced',
      hasNow: ['Permissions', 'Portfolio layers', 'Plan hygiene review'],
      caveats: ['Often expensive or fragmented', 'Leaders need lighter rollups'],
      modules: ['license-clarity-map', 'permission-guardrail-studio', 'plan-health-audit']
    }
  ],

  COMPLAINTS: [
    { id: 'licensing', theme: 'Licensing + tier confusion', signal: 5, note: 'Users think features are missing when they are actually hidden behind package boundaries.' },
    { id: 'complexity', theme: 'Too light for complex projects', signal: 5, note: 'Products that start simple often hit a ceiling on metadata, dependencies, and portfolio work.' },
    { id: 'reporting', theme: 'Reporting depth feels shallow', signal: 4, note: 'Dashboards exist, but leaders still ask for cleaner summary packs.' },
    { id: 'metadata', theme: 'Metadata + custom fields pain', signal: 4, note: 'Teams want their own language, fields, and view structure.' },
    { id: 'time', theme: 'No built-in time tracking', signal: 4, note: 'A classic gap for services, operations, and utilization-heavy teams.' },
    { id: 'filters', theme: 'Filtering / sorting logic gaps', signal: 3, note: 'The app works until teams need precise operational slices.' },
    { id: 'capacity', theme: 'Easy availability planning is weak', signal: 3, note: 'Managers want fast answers, not a heavy planning suite.' },
    { id: 'visual', theme: 'More visual control wanted', signal: 2, note: 'Status taxonomy and color semantics are often too rigid.' }
  ],

  MODULES: [
    { id: 'energy-my-day', familyId: 'hub', type: 'extension', title: 'Energy My Day Strip', short: 'Sort work by energy, not just due date.', value: 'Makes attention management calmer for solo and neurodivergent users.' },
    { id: 'focus-bubble-router', familyId: 'hub', type: 'extension', title: 'Focus Bubble Router', short: 'Routes items into Quick, Deep, and Waiting.', value: 'Reduces context-switching friction.' },
    { id: 'assignment-pulse-feed', familyId: 'hub', type: 'extension', title: 'Assignment Pulse Feed', short: 'Highlights what landed today and what can wait.', value: 'Improves daily orientation without overwhelm.' },

    { id: 'template-composer', familyId: 'setup', type: 'extension', title: 'Template Composer', short: 'Build reusable setups from smaller building blocks.', value: 'Makes repeated project setup much faster.' },
    { id: 'plan-intake-wizard', familyId: 'setup', type: 'extension', title: 'Plan Intake Wizard', short: 'Turns a plain-language request into a recommended setup.', value: 'Cuts setup confusion and wrong-fit plans.' },
    { id: 'bucket-starter-pack', familyId: 'setup', type: 'extension', title: 'Bucket Starter Pack', short: 'Seeds better default structure from day one.', value: 'Improves plan hygiene immediately.' },

    { id: 'task-story-card', familyId: 'task-card', type: 'extension', title: 'Task Story Card', short: 'Adds why, done-state, and stakeholder context.', value: 'Prevents vague tasks with weak narrative.' },
    { id: 'attachment-signal-rail', familyId: 'task-card', type: 'extension', title: 'Attachment Signal Rail', short: 'Shows which work items are weakly evidenced.', value: 'Useful for audit-heavy or proof-heavy workflows.' },
    { id: 'checklist-splitter-lab', familyId: 'task-card', type: 'extension', title: 'Checklist Splitter Lab', short: 'Decides what stays tiny and what becomes a real task.', value: 'Keeps task cards from becoming messy.' },

    { id: 'dense-grid-editor', familyId: 'views', type: 'extension', title: 'Dense Grid Editor', short: 'Adds spreadsheet-style bulk editing.', value: 'Great for PMO and cleanup workflows.' },
    { id: 'swimlane-heat-board', familyId: 'views', type: 'extension', title: 'Swimlane Heat Board', short: 'Adds warm/calm urgency signals to board views.', value: 'Improves scan speed without opening every card.' },
    { id: 'calendar-conflict-dock', familyId: 'views', type: 'extension', title: 'Calendar Conflict Dock', short: 'Shows date collisions and unscheduled work together.', value: 'Reduces hidden scheduling risk.' },

    { id: 'multi-assignee-handoff', familyId: 'collab', type: 'extension', title: 'Multi-Assignee Handoff', short: 'Makes shared ownership explicit.', value: 'Cuts the “I thought you had it” problem.' },
    { id: 'decision-log-thread', familyId: 'collab', type: 'extension', title: 'Decision Log Thread', short: 'Captures small decision breadcrumbs.', value: 'Improves auditability and continuity.' },
    { id: 'stakeholder-ping-matrix', familyId: 'collab', type: 'extension', title: 'Stakeholder Ping Matrix', short: 'Scores who needs an update and how hard.', value: 'Makes communication rhythm more intentional.' },

    { id: 'executive-snapshot', familyId: 'reporting', type: 'extension', title: 'Executive Snapshot', short: 'One-screen status for leaders.', value: 'Builds trust with non-operator stakeholders.' },
    { id: 'completion-funnel', familyId: 'reporting', type: 'extension', title: 'Completion Funnel', short: 'Shows where work stalls before closing.', value: 'Useful for process tuning.' },
    { id: 'export-pack-builder', familyId: 'reporting', type: 'extension', title: 'Export Pack Builder', short: 'Creates the right share-out pack for each audience.', value: 'Bridges the gap between app users and everyone else.' },

    { id: 'dependency-playground', familyId: 'premium-scheduling', type: 'extension', title: 'Dependency Playground', short: 'Visualizes ripple effects of sequence changes.', value: 'Makes dependency logic easier to understand.' },
    { id: 'critical-chain-lens', familyId: 'premium-scheduling', type: 'extension', title: 'Critical Chain Lens', short: 'Highlights only the tasks that decide the finish date.', value: 'Narrows focus and reduces panic.' },
    { id: 'milestone-pulse', familyId: 'premium-scheduling', type: 'extension', title: 'Milestone Pulse', short: 'Turns milestones into a calm comms-ready dashboard.', value: 'Improves milestone visibility.' },

    { id: 'goal-trace-tree', familyId: 'agile-goals', type: 'extension', title: 'Goal Trace Tree', short: 'Shows whether work is actually connected to goals.', value: 'Reduces busywork and goal drift.' },
    { id: 'sprint-balance-meter', familyId: 'agile-goals', type: 'extension', title: 'Sprint Balance Meter', short: 'Checks overload, blockers, and ownership before sprint start.', value: 'Improves sprint quality early.' },
    { id: 'backlog-gatekeeper', familyId: 'agile-goals', type: 'extension', title: 'Backlog Gatekeeper', short: 'Adds ready/not-ready intake gates.', value: 'Prevents messy sprint starts.' },

    { id: 'todo-sync-lens', familyId: 'integrations', type: 'extension', title: 'Sync Lens', short: 'Explains what syncs cleanly and what does not.', value: 'Reduces confusion in mixed workflows.' },
    { id: 'teams-action-ribbon', familyId: 'integrations', type: 'extension', title: 'Action Ribbon', short: 'Turns meeting output into structured actions.', value: 'Helps capture work from collaboration surfaces.' },
    { id: 'workflow-safety-checker', familyId: 'integrations', type: 'extension', title: 'Workflow Safety Checker', short: 'Checks if API, automation, and license expectations are realistic.', value: 'Prevents bad build assumptions early.' },

    { id: 'license-clarity-map', familyId: 'admin-portfolio', type: 'extension', title: 'License Clarity Map', short: 'Shows who can do what across packages.', value: 'One of the highest-leverage admin helpers.' },
    { id: 'permission-guardrail-studio', familyId: 'admin-portfolio', type: 'extension', title: 'Permission Guardrail Studio', short: 'Surfaces who can view, edit, or misread a plan.', value: 'Useful for admins and PMOs.' },
    { id: 'plan-health-audit', familyId: 'admin-portfolio', type: 'extension', title: 'Plan Health Audit', short: 'Scores stale tasks, weak ownership, and overloaded people.', value: 'Good coaching and cleanup layer.' },

    { id: 'time-tracking-ledger', familyId: 'missing', type: 'gap', title: 'Time Tracking Ledger', short: 'Adds native-feeling time logs on top of tasks.', value: 'A strong missing-feature candidate.' },
    { id: 'and-filter-builder', familyId: 'missing', type: 'gap', title: 'AND Filter Builder', short: 'Builds precise slices with AND and OR logic.', value: 'High leverage for busy operational boards.' },
    { id: 'completion-date-sorter', familyId: 'missing', type: 'gap', title: 'Completion Date Sorter', short: 'Adds direct newest-to-oldest completion review.', value: 'Useful for weekly reviews and 1:1s.' },
    { id: 'cross-plan-dependency-mesh', familyId: 'missing', type: 'gap', title: 'Cross-Plan Dependency Mesh', short: 'Links blockers across many plans.', value: 'Useful when organizations outgrow single-plan thinking.' },
    { id: 'portfolio-rollup-wall', familyId: 'missing', type: 'gap', title: 'Portfolio Rollup Wall', short: 'Pulls many plans into one leadership wall.', value: 'Gives lighter portfolio visibility without a heavy suite.' },
    { id: 'custom-metadata-layer', familyId: 'missing', type: 'gap', title: 'Custom Metadata Layer', short: 'Adds project-specific fields and a safer schema layer.', value: 'One of the most requested extensibility patterns.' },
    { id: 'native-pdf-storyboard', familyId: 'missing', type: 'gap', title: 'Native PDF Storyboard', short: 'Builds a polished printable stakeholder pack.', value: 'Useful for execs, clients, and compliance.' },
    { id: 'availability-slot-finder', familyId: 'missing', type: 'gap', title: 'Availability Slot Finder', short: 'Finds open coordination slots across people.', value: 'High practical value for coordination.' },
    { id: 'mixed-license-capability-coach', familyId: 'missing', type: 'gap', title: 'Mixed-License Capability Coach', short: 'Explains exactly what a user can and cannot do.', value: 'Reduces support tickets and wrong assumptions.' },
    { id: 'status-system-designer', familyId: 'missing', type: 'gap', title: 'Status System Designer', short: 'Adds richer workflow states and color semantics.', value: 'Useful for operations, service, and content workflows.' }
  ],

  BUILD_ORDER: [
    'time-tracking-ledger',
    'and-filter-builder',
    'completion-date-sorter',
    'custom-metadata-layer',
    'availability-slot-finder',
    'portfolio-rollup-wall',
    'mixed-license-capability-coach',
    'native-pdf-storyboard',
    'cross-plan-dependency-mesh',
    'status-system-designer'
  ],

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this.render();
  },

  render() {
    const family = this.FAMILIES.find(item => item.id === this.activeFamilyId) || this.FAMILIES[0];
    const modules = this._filteredModules();
    const queuePct = Math.round((this.queued.length / Math.max(1, this.BUILD_ORDER.length)) * 100);

    this.container.innerHTML = `
    <div class="ace-lab">
      <div class="ace-hero">
        <div>
          <div class="ace-overline">ACE TEMPLATE LAB</div>
          <h2>Reusable feature strategy cockpit</h2>
          <p>Seeded with a Microsoft Planner benchmark, but built to be adapted to any product. Use it to map what exists, what users complain about, what is really missing, and which mockups to build first.</p>
        </div>
        <div class="ace-hero-metrics">
          ${this._metric('Families', this.FAMILIES.length, 'Core + growth + admin layers')}
          ${this._metric('Mockups', this.MODULES.length, 'Extensions + gap builds')}
          ${this._metric('Queued', this.queued.length, queuePct + '% of priority lane')}
        </div>
      </div>

      <div class="ace-toolbar">
        <label class="ace-field">
          <span>Target app</span>
          <input type="text" value="${this._esc(this.targetApp)}" oninput="FeatAceTemplateLab.targetApp=this.value">
        </label>
        <label class="ace-field">
          <span>Benchmark / source app</span>
          <input type="text" value="${this._esc(this.benchmarkApp)}" oninput="FeatAceTemplateLab.benchmarkApp=this.value">
        </label>
        <div class="ace-toolbar-actions">
          <button class="ace-btn ace-btn-pink" onclick="FeatAceTemplateLab.applyPlannerSeed()">Planner seed</button>
          <button class="ace-btn ace-btn-green" onclick="FeatAceTemplateLab.applyBlankSeed()">Blank template</button>
          <button class="ace-btn ace-btn-yellow" onclick="FeatAceTemplateLab.exportQueue()">Export queue</button>
          <button class="ace-btn ace-btn-ghost" onclick="FeatAceTemplateLab.render()">Refresh</button>
        </div>
      </div>

      <div class="ace-strip">
        <span class="ace-pill ace-pill-pink">Seed mode: ${this.seedMode === 'planner' ? 'Planner benchmark' : 'Generic template'}</span>
        <span class="ace-pill ace-pill-green">Target: ${this._esc(this.targetApp)}</span>
        <span class="ace-pill ace-pill-yellow">Benchmark: ${this._esc(this.benchmarkApp)}</span>
      </div>

      <div class="ace-tabs">
        ${this._tabBtn('overview', 'Overview')}
        ${this._tabBtn('map', 'Feature Map')}
        ${this._tabBtn('complaints', 'Complaint Radar')}
        ${this._tabBtn('mocks', 'Mockup Queue')}
      </div>

      <div class="ace-panel">
        ${this.activeTab === 'overview' ? this._renderOverview(queuePct) : ''}
        ${this.activeTab === 'map' ? this._renderMap(family) : ''}
        ${this.activeTab === 'complaints' ? this._renderComplaints() : ''}
        ${this.activeTab === 'mocks' ? this._renderMocks(modules) : ''}
      </div>
    </div>`;
  },

  _renderOverview(queuePct) {
    return `
    <div class="ace-grid ace-grid-3">
      <div class="ace-card">
        <h3>What this module is for</h3>
        <div class="ace-list">
          <div class="ace-row">Map what a benchmark app already does.</div>
          <div class="ace-row">Separate true product gaps from tier-gated or weak UX areas.</div>
          <div class="ace-row">Turn findings into a build queue you can adapt project by project.</div>
          <div class="ace-row">Keep all mock concepts inside the app instead of in loose notes.</div>
        </div>
      </div>
      <div class="ace-card">
        <h3>Quick schema</h3>
        <div class="ace-list">
          <div class="ace-schema"><strong>🟩 Has now</strong><span>Existing capability you can extend.</span></div>
          <div class="ace-schema"><strong>🟨 Weak / gated</strong><span>Exists, but not clearly enough or not in the right tier.</span></div>
          <div class="ace-schema"><strong>❌ Missing</strong><span>Good candidate for a new feature or companion module.</span></div>
          <div class="ace-schema"><strong>🩷 Queue</strong><span>What you want to prototype next.</span></div>
        </div>
      </div>
      <div class="ace-card">
        <h3>Queue progress</h3>
        <div class="ace-progress"><span style="width:${queuePct}%"></span></div>
        <div class="ace-mini">${queuePct}% of the priority lane selected</div>
        <div class="ace-stack">
          <div>⭐ Starred: ${this.starred.length}</div>
          <div>✅ Done: ${this.done.length}</div>
          <div>📦 Queue: ${this.queued.length}</div>
        </div>
      </div>
    </div>

    <div class="ace-grid ace-grid-2">
      <div class="ace-card">
        <h3>Priority build lane</h3>
        <div class="ace-order">
          ${this.BUILD_ORDER.map((id, index) => {
            const mod = this._module(id);
            return `
            <label class="ace-order-row">
              <input type="checkbox" ${this._has(this.queued, id) ? 'checked' : ''} onchange="FeatAceTemplateLab.toggleQueue('${id}')">
              <div>
                <strong>${index + 1}. ${this._esc(mod.title)}</strong>
                <div class="ace-mini">${this._esc(mod.value)}</div>
              </div>
            </label>`;
          }).join('')}
        </div>
      </div>
      <div class="ace-card">
        <h3>Adaptation rules</h3>
        <div class="ace-list">
          <div class="ace-row">1. Change <strong>Target app</strong> to the product you are designing.</div>
          <div class="ace-row">2. Keep <strong>Benchmark</strong> as the competitor or reference app.</div>
          <div class="ace-row">3. Star the ideas you want to keep across projects.</div>
          <div class="ace-row">4. Queue the items you want to prototype in this workspace.</div>
          <div class="ace-row">5. Export the queue as a build brief when you are ready.</div>
        </div>
      </div>
    </div>`;
  },

  _renderMap(family) {
    return `
    <div class="ace-map">
      <div class="ace-card ace-side">
        <h3>Feature families</h3>
        <div class="ace-chip-stack">
          ${this.FAMILIES.map(item => `
            <button class="ace-chip ${item.id === family.id ? 'active' : ''}" onclick="FeatAceTemplateLab.setFamily('${item.id}')">
              <strong>${this._esc(item.name)}</strong>
              <span>${this._esc(item.badge)}</span>
            </button>`).join('')}
        </div>
      </div>
      <div class="ace-card">
        <div class="ace-head">
          <div>
            <div class="ace-pill ace-pill-green">${this._esc(family.badge)}</div>
            <h3>${this._esc(family.name)}</h3>
          </div>
          <div class="ace-inline-actions">
            ${family.modules.map(id => {
              const mod = this._module(id);
              return `<button class="ace-mini-btn" onclick="FeatAceTemplateLab.openModuleTab('${id}')">${this._esc(mod.title)}</button>`;
            }).join('')}
          </div>
        </div>

        <div class="ace-grid ace-grid-2">
          <div class="ace-subcard">
            <h4>🟩 Usually exists here</h4>
            <div class="ace-list">${family.hasNow.map(item => `<div class="ace-row">${this._esc(item)}</div>`).join('')}</div>
          </div>
          <div class="ace-subcard">
            <h4>🟨 Typical caveats</h4>
            <div class="ace-list">${family.caveats.map(item => `<div class="ace-row">${this._esc(item)}</div>`).join('')}</div>
          </div>
        </div>

        <div class="ace-grid ace-grid-3">
          ${family.modules.map(id => this._moduleCard(this._module(id))).join('')}
        </div>
      </div>
    </div>`;
  },

  _renderComplaints() {
    const gaps = this.MODULES.filter(item => item.type === 'gap');
    return `
    <div class="ace-grid ace-grid-2">
      <div class="ace-card">
        <h3>Complaint radar</h3>
        <div class="ace-complaints">
          ${this.COMPLAINTS.map(item => `
            <div class="ace-complaint-row">
              <div>
                <strong>${this._esc(item.theme)}</strong>
                <div class="ace-mini">${this._esc(item.note)}</div>
              </div>
              <div class="ace-bar"><span style="width:${item.signal * 20}%"></span></div>
              <div>${item.signal}/5</div>
            </div>`).join('')}
        </div>
      </div>
      <div class="ace-card">
        <h3>Gap-build lane</h3>
        <div class="ace-grid ace-grid-2">
          ${gaps.map(mod => this._moduleCard(mod)).join('')}
        </div>
      </div>
    </div>`;
  },

  _renderMocks(modules) {
    return `
    <div class="ace-card">
      <div class="ace-head">
        <div>
          <h3>All mock concepts inside this pack</h3>
          <div class="ace-mini">This is the reusable library view. Search, star, queue, and mark done.</div>
        </div>
        <div class="ace-inline-actions">
          <button class="ace-mini-btn ${this.filter === 'all' ? 'active' : ''}" onclick="FeatAceTemplateLab.setFilter('all')">All</button>
          <button class="ace-mini-btn ${this.filter === 'extension' ? 'active' : ''}" onclick="FeatAceTemplateLab.setFilter('extension')">Extensions</button>
          <button class="ace-mini-btn ${this.filter === 'gap' ? 'active' : ''}" onclick="FeatAceTemplateLab.setFilter('gap')">Gaps</button>
          <button class="ace-mini-btn ${this.filter === 'queued' ? 'active' : ''}" onclick="FeatAceTemplateLab.setFilter('queued')">Queued</button>
          <button class="ace-mini-btn ${this.filter === 'starred' ? 'active' : ''}" onclick="FeatAceTemplateLab.setFilter('starred')">Starred</button>
          <button class="ace-mini-btn ${this.filter === 'done' ? 'active' : ''}" onclick="FeatAceTemplateLab.setFilter('done')">Done</button>
        </div>
      </div>
      <div class="ace-toolbar ace-toolbar-slim">
        <label class="ace-field ace-field-wide">
          <span>Search mockups</span>
          <input type="text" value="${this._esc(this.search)}" placeholder="Search by title, value, or family" oninput="FeatAceTemplateLab.setSearch(this.value)">
        </label>
      </div>
      <div class="ace-grid ace-grid-3">
        ${modules.map(mod => this._moduleCard(mod)).join('') || '<div class="ace-row">No mockups match this filter.</div>'}
      </div>
    </div>`;
  },

  _moduleCard(mod) {
    const family = this.FAMILIES.find(item => item.id === mod.familyId);
    const queued = this._has(this.queued, mod.id);
    const starred = this._has(this.starred, mod.id);
    const done = this._has(this.done, mod.id);
    return `
    <div class="ace-mock-card ${queued ? 'queued' : ''} ${done ? 'done' : ''}">
      <div class="ace-card-top">
        <span class="ace-pill ${mod.type === 'gap' ? 'ace-pill-yellow' : 'ace-pill-pink'}">${mod.type === 'gap' ? 'Gap build' : 'Extension'}</span>
        ${family ? `<span class="ace-mini">${this._esc(family.name)}</span>` : '<span class="ace-mini">Missing lane</span>'}
      </div>
      <h4>${this._esc(mod.title)}</h4>
      <div class="ace-row">${this._esc(mod.short)}</div>
      <div class="ace-value">${this._esc(mod.value)}</div>
      <div class="ace-actions">
        <button class="ace-action ${starred ? 'active' : ''}" onclick="FeatAceTemplateLab.toggleStar('${mod.id}')">${starred ? '⭐ Starred' : '☆ Star'}</button>
        <button class="ace-action ${queued ? 'active' : ''}" onclick="FeatAceTemplateLab.toggleQueue('${mod.id}')">${queued ? '✅ Queued' : '☐ Queue'}</button>
        <button class="ace-action ${done ? 'active' : ''}" onclick="FeatAceTemplateLab.toggleDone('${mod.id}')">${done ? '✅ Done' : '⬜ Done'}</button>
      </div>
    </div>`;
  },

  _filteredModules() {
    const query = this.search.trim().toLowerCase();
    return this.MODULES.filter(mod => {
      const family = this.FAMILIES.find(item => item.id === mod.familyId);
      const text = [mod.title, mod.short, mod.value, family ? family.name : ''].join(' ').toLowerCase();
      const matchQuery = !query || text.indexOf(query) >= 0;
      if (!matchQuery) return false;

      if (this.filter === 'extension') return mod.type === 'extension';
      if (this.filter === 'gap') return mod.type === 'gap';
      if (this.filter === 'queued') return this._has(this.queued, mod.id);
      if (this.filter === 'starred') return this._has(this.starred, mod.id);
      if (this.filter === 'done') return this._has(this.done, mod.id);
      return true;
    });
  },

  openModuleTab(moduleId) {
    this.activeTab = 'mocks';
    this.search = this._module(moduleId).title;
    this.render();
  },

  setTab(tab) {
    this.activeTab = tab;
    this.render();
  },

  setFamily(familyId) {
    this.activeFamilyId = familyId;
    this.render();
  },

  setFilter(filter) {
    this.filter = filter;
    this.render();
  },

  setSearch(value) {
    this.search = value;
    this.render();
  },

  toggleStar(id) {
    this._toggleIn('starred', id);
  },

  toggleQueue(id) {
    this._toggleIn('queued', id);
  },

  toggleDone(id) {
    this._toggleIn('done', id);
  },

  applyPlannerSeed() {
    this.seedMode = 'planner';
    this.targetApp = 'Your App';
    this.benchmarkApp = 'Microsoft Planner';
    this.activeTab = 'overview';
    this.search = '';
    this.filter = 'all';
    this.render();
  },

  applyBlankSeed() {
    this.seedMode = 'blank';
    this.targetApp = 'Your App';
    this.benchmarkApp = 'Reference App';
    this.activeTab = 'overview';
    this.search = '';
    this.filter = 'all';
    this.render();
  },

  exportQueue() {
    const queue = this.queued.map(id => this._module(id));
    const lines = [
      '# ACE Template Build Queue',
      '',
      'Target App: ' + this.targetApp,
      'Benchmark App: ' + this.benchmarkApp,
      'Seed Mode: ' + this.seedMode,
      ''
    ];

    if (!queue.length) {
      lines.push('No queue items selected yet.');
    } else {
      queue.forEach((item, index) => {
        const family = this.FAMILIES.find(entry => entry.id === item.familyId);
        lines.push((index + 1) + '. ' + item.title);
        lines.push('   Type: ' + (item.type === 'gap' ? 'Gap build' : 'Extension'));
        lines.push('   Family: ' + (family ? family.name : 'Missing lane'));
        lines.push('   Why: ' + item.short);
        lines.push('   Value: ' + item.value);
      });
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ace-template-queue.txt';
    a.click();
  },

  _tabBtn(id, label) {
    return `<button class="ace-tab ${this.activeTab === id ? 'active' : ''}" onclick="FeatAceTemplateLab.setTab('${id}')">${label}</button>`;
  },

  _metric(label, value, note) {
    return `<div class="ace-metric">
      <strong>${this._esc(label)}</strong>
      <div class="ace-metric-value">${value}</div>
      <div class="ace-mini">${this._esc(note)}</div>
    </div>`;
  },

  _toggleIn(key, id) {
    const next = new Set(this[key]);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this[key] = Array.from(next);
    this.render();
  },

  _module(id) {
    return this.MODULES.find(item => item.id === id) || this.MODULES[0];
  },

  _has(list, value) {
    return list.indexOf(value) >= 0;
  },

  _esc(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
};
