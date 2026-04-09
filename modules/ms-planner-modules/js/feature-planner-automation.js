/* ═══════════════════════════════════════════════
   FEATURE: Planner Automation — Rule builder
   IF trigger THEN action, visual rule cards,
   enable/disable toggle per rule.
   ═══════════════════════════════════════════════ */
const FeatPlannerAutomation = {
  rules: [],

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this._seed();
    this.render();
  },

  _seed() {
    this.rules = [
      { id:1, name:'Auto-assign new design tasks', enabled:true, trigger:'task-created', triggerFilter:'Bucket = Design', action:'assign-to', actionTarget:'Alex M.', runs:24 },
      { id:2, name:'Move completed to Done bucket', enabled:true, trigger:'task-completed', triggerFilter:'Any task', action:'move-to-bucket', actionTarget:'Done', runs:87 },
      { id:3, name:'Notify on overdue tasks', enabled:true, trigger:'task-overdue', triggerFilter:'Priority = Urgent', action:'notify', actionTarget:'#team-alerts channel', runs:12 },
      { id:4, name:'Escalate priority when overdue', enabled:false, trigger:'task-overdue', triggerFilter:'Priority != Urgent', action:'set-priority', actionTarget:'Urgent', runs:5 },
      { id:5, name:'Auto-assign QA on review', enabled:true, trigger:'task-moved', triggerFilter:'Moved to Review bucket', action:'assign-to', actionTarget:'Kim P.', runs:31 },
      { id:6, name:'Welcome message on new task', enabled:false, trigger:'task-created', triggerFilter:'Any task', action:'add-comment', actionTarget:'Welcome! Please add a description and due date.', runs:0 }
    ];
  },

  render() {
    const triggerIcons = { 'task-created':'&#10010;', 'task-moved':'&#8644;', 'task-completed':'&#10003;', 'task-overdue':'&#9888;' };
    const triggerLabels = { 'task-created':'Task Created', 'task-moved':'Task Moved', 'task-completed':'Task Completed', 'task-overdue':'Task Overdue' };
    const actionLabels = { 'assign-to':'Assign to', 'move-to-bucket':'Move to bucket', 'notify':'Send notification', 'set-priority':'Set priority', 'add-comment':'Add comment' };
    const triggerColors = { 'task-created':'#22c55e', 'task-moved':'#3b82f6', 'task-completed':'#a855f7', 'task-overdue':'#ef4444' };

    const activeCount = this.rules.filter(r => r.enabled).length;
    const totalRuns = this.rules.reduce((s,r) => s + r.runs, 0);

    this.container.innerHTML = `
    <div class="pa-wrap">
      <div class="pa-header">
        <h3 class="pa-title">Automation Rules</h3>
        <span class="pa-missing-badge">MISSING FROM PLANNER</span>
        <span class="pa-subtitle">${activeCount} active &middot; ${totalRuns} total runs</span>
        <button class="pa-btn pa-btn-pink" onclick="FeatPlannerAutomation.addRule()">+ New Rule</button>
      </div>
      <div class="pa-rules">
        ${this.rules.map(r => {
          const tColor = triggerColors[r.trigger];
          return `
          <div class="pa-rule ${r.enabled?'':'pa-rule-disabled'}">
            <div class="pa-rule-toggle">
              <button class="pa-toggle ${r.enabled?'pa-toggle-on':''}" onclick="FeatPlannerAutomation.toggleRule(${r.id})">
                <span class="pa-toggle-knob"></span>
              </button>
            </div>
            <div class="pa-rule-body">
              <div class="pa-rule-name">${this._esc(r.name)}</div>
              <div class="pa-rule-flow">
                <div class="pa-trigger" style="border-color:${tColor}">
                  <span class="pa-trigger-icon" style="color:${tColor}">${triggerIcons[r.trigger]}</span>
                  <div>
                    <span class="pa-flow-label">IF</span>
                    <span class="pa-flow-val">${triggerLabels[r.trigger]}</span>
                    <span class="pa-flow-filter">${this._esc(r.triggerFilter)}</span>
                  </div>
                </div>
                <span class="pa-arrow">&#8594;</span>
                <div class="pa-action">
                  <div>
                    <span class="pa-flow-label">THEN</span>
                    <span class="pa-flow-val">${actionLabels[r.action]}</span>
                    <span class="pa-flow-target">${this._esc(r.actionTarget)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="pa-rule-stats">
              <span class="pa-runs">${r.runs} runs</span>
              <button class="pa-delete" onclick="FeatPlannerAutomation.deleteRule(${r.id})">&#128465;</button>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  },

  toggleRule(id) {
    const r = this.rules.find(x => x.id === id);
    if (r) r.enabled = !r.enabled;
    this.render();
  },

  deleteRule(id) {
    this.rules = this.rules.filter(r => r.id !== id);
    this.render();
  },

  addRule() {
    const name = prompt('Rule name:');
    if (!name?.trim()) return;
    const trigger = prompt('Trigger (task-created/task-moved/task-completed/task-overdue):', 'task-created');
    const action = prompt('Action (assign-to/move-to-bucket/notify/set-priority):', 'notify');
    const target = prompt('Action target (person, bucket, or channel):');
    this.rules.push({
      id: Date.now(), name: name.trim(), enabled: true, trigger: trigger || 'task-created',
      triggerFilter: 'Any task', action: action || 'notify', actionTarget: target || 'Team', runs: 0
    });
    this.render();
  },

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },
  exportState() { return { rules: this.rules }; },
  importState(s) { if (s.rules) this.rules = s.rules; this.render(); }
};
