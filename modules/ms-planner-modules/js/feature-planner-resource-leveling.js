/* ═══════════════════════════════════════════════
   FEATURE: Planner Resource Leveling — Allocation view
   Team capacity, assigned hours, overallocation
   warnings, underallocation, drag to rebalance.
   ═══════════════════════════════════════════════ */
const FeatPlannerResourceLeveling = {
  members: [],

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this._seed();
    this.render();
  },

  _seed() {
    this.members = [
      { id:1, name:'Alex M.', role:'Lead Designer', capacity:40, assigned:48,
        tasks:[
          { name:'Dashboard wireframes', hours:16 },
          { name:'Icon set redesign', hours:12 },
          { name:'Design review sessions', hours:8 },
          { name:'Onboarding flow mockups', hours:12 }
        ]},
      { id:2, name:'Chen W.', role:'Senior Backend', capacity:40, assigned:42,
        tasks:[
          { name:'REST API endpoints', hours:20 },
          { name:'Database optimization', hours:12 },
          { name:'Code reviews', hours:10 }
        ]},
      { id:3, name:'Sara K.', role:'Frontend Dev', capacity:40, assigned:35,
        tasks:[
          { name:'Login flow implementation', hours:15 },
          { name:'Responsive layout fixes', hours:10 },
          { name:'Component library updates', hours:10 }
        ]},
      { id:4, name:'Bob L.', role:'DevOps Engineer', capacity:40, assigned:22,
        tasks:[
          { name:'CI/CD pipeline setup', hours:12 },
          { name:'Monitoring alerts', hours:10 }
        ]},
      { id:5, name:'Eva J.', role:'QA Engineer', capacity:32, assigned:30,
        tasks:[
          { name:'Integration test suite', hours:14 },
          { name:'Accessibility audit', hours:10 },
          { name:'Bug triage', hours:6 }
        ]},
      { id:6, name:'Kim P.', role:'Junior Dev', capacity:40, assigned:18,
        tasks:[
          { name:'Unit test coverage', hours:10 },
          { name:'Documentation updates', hours:8 }
        ]}
    ];
  },

  render() {
    const totalCap = this.members.reduce((s,m) => s + m.capacity, 0);
    const totalAssigned = this.members.reduce((s,m) => s + m.assigned, 0);
    const overloaded = this.members.filter(m => m.assigned > m.capacity).length;
    const underloaded = this.members.filter(m => m.assigned < m.capacity * 0.6).length;

    this.container.innerHTML = `
    <div class="prl-wrap">
      <div class="prl-header">
        <h3 class="prl-title">Resource Leveling</h3>
        <span class="prl-missing-badge">MISSING FROM PLANNER</span>
        <div class="prl-alerts">
          ${overloaded ? `<span class="prl-alert prl-alert-red">${overloaded} overallocated</span>` : ''}
          ${underloaded ? `<span class="prl-alert prl-alert-blue">${underloaded} underutilized</span>` : ''}
        </div>
      </div>

      <div class="prl-summary">
        <div class="prl-sum-item"><span class="prl-sum-val">${totalCap}h</span><span class="prl-sum-label">Total Capacity</span></div>
        <div class="prl-sum-item"><span class="prl-sum-val">${totalAssigned}h</span><span class="prl-sum-label">Assigned</span></div>
        <div class="prl-sum-item"><span class="prl-sum-val">${totalCap - totalAssigned}h</span><span class="prl-sum-label">Available</span></div>
        <div class="prl-sum-item"><span class="prl-sum-val">${Math.round((totalAssigned/totalCap)*100)}%</span><span class="prl-sum-label">Utilization</span></div>
      </div>

      <div class="prl-members">
        ${this.members.map(m => {
          const pct = Math.round((m.assigned / m.capacity) * 100);
          const isOver = m.assigned > m.capacity;
          const isUnder = m.assigned < m.capacity * 0.6;
          const statusClass = isOver ? 'prl-over' : isUnder ? 'prl-under' : 'prl-ok';
          const statusLabel = isOver ? 'Overallocated' : isUnder ? 'Underutilized' : 'Balanced';
          const statusColor = isOver ? '#ef4444' : isUnder ? '#3b82f6' : '#22c55e';
          return `
          <div class="prl-member ${statusClass}">
            <div class="prl-member-head">
              <div class="prl-avatar">${m.name.charAt(0)}</div>
              <div class="prl-member-info">
                <span class="prl-member-name">${this._esc(m.name)}</span>
                <span class="prl-member-role">${this._esc(m.role)}</span>
              </div>
              <div class="prl-member-nums">
                <span class="prl-hrs" style="color:${statusColor}">${m.assigned}h / ${m.capacity}h</span>
                <span class="prl-status" style="color:${statusColor}">${statusLabel}</span>
              </div>
            </div>
            <div class="prl-cap-bar">
              <div class="prl-cap-fill" style="width:${Math.min(pct,100)}%;background:${statusColor}"></div>
              ${isOver ? `<div class="prl-cap-excess" style="width:${pct-100}%;background:#ef444444"></div>` : ''}
            </div>
            <div class="prl-tasks">
              ${m.tasks.map(t => `
                <div class="prl-task-item">
                  <span class="prl-task-name">${this._esc(t.name)}</span>
                  <span class="prl-task-hrs">${t.hours}h</span>
                  <button class="prl-task-adjust" onclick="FeatPlannerResourceLeveling.adjustHours(${m.id},'${this._esc(t.name)}')">&#9998;</button>
                </div>`).join('')}
              <button class="prl-add-task" onclick="FeatPlannerResourceLeveling.reassign(${m.id})">Reassign task...</button>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  },

  adjustHours(memberId, taskName) {
    const m = this.members.find(x => x.id === memberId);
    const t = m.tasks.find(x => x.name === taskName);
    const val = prompt(`Adjust hours for "${taskName}":`, t.hours);
    if (val !== null && !isNaN(val)) {
      const diff = parseFloat(val) - t.hours;
      t.hours = parseFloat(val);
      m.assigned = m.tasks.reduce((s, t) => s + t.hours, 0);
      this.render();
    }
  },

  reassign(fromId) {
    const from = this.members.find(m => m.id === fromId);
    if (!from.tasks.length) return;
    const taskName = prompt('Task to reassign:\n' + from.tasks.map(t => `- ${t.name}`).join('\n'));
    if (!taskName) return;
    const task = from.tasks.find(t => t.name.toLowerCase().includes(taskName.toLowerCase()));
    if (!task) { alert('Task not found'); return; }
    const toName = prompt('Reassign to (name):', this.members.filter(m=>m.id!==fromId).map(m=>m.name).join(', '));
    const to = this.members.find(m => m.name.toLowerCase().includes((toName||'').toLowerCase()));
    if (!to) { alert('Person not found'); return; }
    from.tasks = from.tasks.filter(t => t !== task);
    from.assigned = from.tasks.reduce((s,t) => s + t.hours, 0);
    to.tasks.push(task);
    to.assigned = to.tasks.reduce((s,t) => s + t.hours, 0);
    this.render();
  },

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },
  exportState() { return { members: this.members }; },
  importState(s) { if (s.members) this.members = s.members; this.render(); }
};
