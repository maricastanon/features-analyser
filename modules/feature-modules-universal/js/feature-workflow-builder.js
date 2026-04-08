/* ═══════════════════════════════════════════════
   FEATURE: Workflow Builder — Universal Module
   Visual automation workflow with triggers,
   conditions, and actions. Works for ANY app.
   ═══════════════════════════════════════════════ */
const FeatWorkflowBuilder = {
  workflows: [],
  active: 0,

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this._seed();
    this.render();
  },

  _seed() {
    this.workflows = [
      { id: 1, name: 'New User Welcome', active: true, runs: 847,
        steps: [
          { type: 'trigger', label: 'User signs up', icon: '⚡', color: '#22c55e' },
          { type: 'condition', label: 'Has verified email?', icon: '❓', color: '#eab308', branches: ['Yes','No'] },
          { type: 'action', label: 'Send welcome email', icon: '📧', color: '#3b82f6' },
          { type: 'action', label: 'Create onboarding tasks', icon: '📋', color: '#a855f7' },
          { type: 'action', label: 'Notify admin in Slack', icon: '💬', color: '#f97316' }
        ]},
      { id: 2, name: 'Bug Report Triage', active: true, runs: 234,
        steps: [
          { type: 'trigger', label: 'Bug report created', icon: '🐛', color: '#ef4444' },
          { type: 'condition', label: 'Severity >= High?', icon: '❓', color: '#eab308', branches: ['Yes','No'] },
          { type: 'action', label: 'Assign to on-call', icon: '👤', color: '#e91e90' },
          { type: 'action', label: 'Add to sprint backlog', icon: '📋', color: '#3b82f6' }
        ]},
      { id: 3, name: 'Weekly Digest', active: false, runs: 52,
        steps: [
          { type: 'trigger', label: 'Every Monday 9am', icon: '⏰', color: '#06b6d4' },
          { type: 'action', label: 'Generate report', icon: '📊', color: '#22c55e' },
          { type: 'action', label: 'Email to team', icon: '📧', color: '#3b82f6' }
        ]}
    ];
  },

  render() {
    const wf = this.workflows[this.active];
    this.container.innerHTML = `
    <div class="feat-wf-wrap">
      <div class="wf-header">
        <h3 style="color:#e91e90;margin:0;font-size:1rem">🔄 Workflow Builder</h3>
        <button class="wf-btn wf-btn-pink" onclick="FeatWorkflowBuilder.addWorkflow()">+ New Workflow</button>
      </div>
      <div class="wf-tabs">
        ${this.workflows.map((w,i) => `
          <button class="wf-tab ${i===this.active?'active':''}" onclick="FeatWorkflowBuilder.switchWF(${i})">
            <span class="wf-tab-dot" style="background:${w.active?'#22c55e':'#5a8a60'}"></span>
            ${this._esc(w.name)}
            <span class="wf-tab-runs">${w.runs}</span>
          </button>`).join('')}
      </div>
      ${wf ? `
      <div class="wf-canvas">
        <div class="wf-meta">
          <span style="font-weight:700">${this._esc(wf.name)}</span>
          <label class="wf-active-toggle">
            <input type="checkbox" ${wf.active?'checked':''} onchange="FeatWorkflowBuilder.toggleActive()">
            <span>${wf.active?'Active':'Inactive'}</span>
          </label>
          <span class="wf-runs-badge">${wf.runs} runs</span>
        </div>
        <div class="wf-flow">
          ${wf.steps.map((step, i) => `
            <div class="wf-step" style="border-color:${step.color}">
              <div class="wf-step-icon" style="background:${step.color}22;color:${step.color}">${step.icon}</div>
              <div class="wf-step-info">
                <div class="wf-step-type" style="color:${step.color}">${step.type}</div>
                <div class="wf-step-label">${this._esc(step.label)}</div>
                ${step.branches ? `<div class="wf-branches">${step.branches.map(b =>
                  `<span class="wf-branch">${b}</span>`).join('')}</div>` : ''}
              </div>
            </div>
            ${i < wf.steps.length - 1 ? '<div class="wf-connector">↓</div>' : ''}
          `).join('')}
          <div class="wf-add-step" onclick="FeatWorkflowBuilder.addStep()">+ Add Step</div>
        </div>
      </div>` : '<div style="padding:20px;color:#5a8a60">No workflows yet</div>'}
    </div>`;
  },

  switchWF(i) { this.active = i; this.render(); },
  toggleActive() { const wf = this.workflows[this.active]; if (wf) { wf.active = !wf.active; this.render(); } },

  addStep() {
    const wf = this.workflows[this.active];
    if (!wf) return;
    const type = prompt('Step type (trigger/condition/action):', 'action');
    const label = prompt('Step label:');
    if (!label?.trim()) return;
    const icons = { trigger:'⚡', condition:'❓', action:'🔧' };
    const colors = { trigger:'#22c55e', condition:'#eab308', action:'#3b82f6' };
    wf.steps.push({ type: type||'action', label: label.trim(), icon: icons[type]||'🔧', color: colors[type]||'#3b82f6' });
    this.render();
  },

  addWorkflow() {
    const name = prompt('Workflow name:');
    if (!name?.trim()) return;
    this.workflows.push({ id: Date.now(), name: name.trim(), active: false, runs: 0,
      steps: [{ type:'trigger', label:'New trigger', icon:'⚡', color:'#22c55e' }] });
    this.active = this.workflows.length - 1;
    this.render();
  },

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },
  exportState() { return { workflows: this.workflows }; },
  importState(s) { if (s.workflows) this.workflows = s.workflows; this.render(); }
};
