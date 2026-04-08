const MsPlannerTemplateApply = {
  container: null,
  currentStep: 1,
  selectedTemplateId: null,
  templates: [
    { id: 1, name: 'Sprint Planning', icon: '\u{1F3C3}', buckets: [
      { name: 'Backlog', tasks: ['Define user stories', 'Prioritize features', 'Estimate effort'] },
      { name: 'In Progress', tasks: ['Implement auth', 'Build API'] },
      { name: 'Review', tasks: ['Code review checklist'] },
      { name: 'Done', tasks: [] }
    ]},
    { id: 2, name: 'Marketing Campaign', icon: '\u{1F4E3}', buckets: [
      { name: 'Ideation', tasks: ['Brainstorm themes', 'Research audience'] },
      { name: 'Content', tasks: ['Write copy', 'Design assets'] },
      { name: 'Review', tasks: ['Stakeholder approval'] },
      { name: 'Publish', tasks: ['Schedule posts'] },
      { name: 'Analyze', tasks: ['Track metrics'] }
    ]},
    { id: 3, name: 'Product Launch', icon: '\u{1F680}', buckets: [
      { name: 'Planning', tasks: ['Set launch date', 'Define success metrics'] },
      { name: 'Development', tasks: ['Feature freeze', 'QA pass'] },
      { name: 'Marketing', tasks: ['Press release', 'Social campaign'] },
      { name: 'Launch Day', tasks: ['Go live', 'Monitor'] }
    ]}
  ],
  customBuckets: [],
  applied: false,

  _esc(str) {
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
  },

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.currentStep = 1;
    this.selectedTemplateId = null;
    this.customBuckets = [];
    this.applied = false;
    this.render();
  },

  selectTemplate(id) {
    this.selectedTemplateId = id;
    const tmpl = this.templates.find(t => t.id === id);
    if (tmpl) this.customBuckets = JSON.parse(JSON.stringify(tmpl.buckets));
    this.render();
  },

  goToStep(step) {
    if (step === 2 && !this.selectedTemplateId) return;
    this.currentStep = step;
    this.render();
  },

  removeBucket(idx) {
    this.customBuckets.splice(idx, 1);
    this.render();
  },

  addBucket() {
    this.customBuckets.push({ name: '', tasks: [] });
    this.render();
  },

  removeTask(bi, ti) {
    this.customBuckets[bi].tasks.splice(ti, 1);
    this.render();
  },

  addTask(bi) {
    this.customBuckets[bi].tasks.push('');
    this.render();
  },

  applyTemplate() {
    this.applied = true;
    this.render();
  },

  render() {
    if (!this.container) return;
    const totalTasks = this.customBuckets.reduce((s, b) => s + b.tasks.length, 0);

    let html = `<div class="pta-panel">
      <div class="pta-header"><h3>Apply Template</h3></div>
      <div class="pta-progress">
        ${[1, 2, 3].map(s => `<div class="pta-step ${s === this.currentStep ? 'pta-step-active' : ''} ${s < this.currentStep ? 'pta-step-done' : ''}">
          <span class="pta-step-num">${s}</span>
          <span class="pta-step-label">${['Select', 'Customize', 'Review'][s - 1]}</span>
        </div>`).join('<div class="pta-step-line"></div>')}
      </div>`;

    if (this.applied) {
      html += `<div class="pta-success">
        <div class="pta-success-icon">&#10003;</div>
        <div class="pta-success-msg">Template applied successfully!</div>
        <div class="pta-success-detail">Created ${this.customBuckets.length} buckets and ${totalTasks} tasks.</div>
        <button class="pta-reset-btn" data-action="reset">Start Over</button>
      </div>`;
    } else if (this.currentStep === 1) {
      html += `<div class="pta-step-content"><div class="pta-template-list">`;
      this.templates.forEach(t => {
        const checked = t.id === this.selectedTemplateId ? 'checked' : '';
        const taskCount = t.buckets.reduce((s, b) => s + b.tasks.length, 0);
        html += `<label class="pta-template-option ${checked ? 'pta-template-selected' : ''}">
          <input type="radio" name="pta-tmpl" value="${t.id}" ${checked} data-action="select" data-id="${t.id}" />
          <span class="pta-tmpl-icon">${t.icon}</span>
          <span class="pta-tmpl-info">
            <span class="pta-tmpl-name">${this._esc(t.name)}</span>
            <span class="pta-tmpl-meta">${t.buckets.length} buckets, ${taskCount} tasks</span>
          </span>
        </label>`;
      });
      html += `</div>
        <button class="pta-next-btn" data-action="next" ${!this.selectedTemplateId ? 'disabled' : ''}>Next: Customize</button>
      </div>`;
    } else if (this.currentStep === 2) {
      html += `<div class="pta-step-content"><div class="pta-customize">`;
      this.customBuckets.forEach((b, bi) => {
        html += `<div class="pta-cust-bucket">
          <div class="pta-cust-bucket-head">
            <input class="pta-cust-bucket-name" type="text" value="${this._esc(b.name)}" data-ref="bucket-name" data-bi="${bi}" />
            <button class="pta-remove-btn" data-action="remove-bucket" data-bi="${bi}">&times;</button>
          </div>`;
        b.tasks.forEach((t, ti) => {
          html += `<div class="pta-cust-task">
            <input class="pta-cust-task-input" type="text" value="${this._esc(t)}" data-ref="task" data-bi="${bi}" data-ti="${ti}" />
            <button class="pta-remove-btn" data-action="remove-task" data-bi="${bi}" data-ti="${ti}">&times;</button>
          </div>`;
        });
        html += `<button class="pta-add-task-link" data-action="add-task" data-bi="${bi}">+ Add task</button></div>`;
      });
      html += `<button class="pta-add-bucket-link" data-action="add-bucket">+ Add bucket</button></div>
        <div class="pta-nav-btns">
          <button class="pta-back-btn" data-action="back">Back</button>
          <button class="pta-next-btn" data-action="next">Next: Review</button>
        </div></div>`;
    } else if (this.currentStep === 3) {
      const tmpl = this.templates.find(t => t.id === this.selectedTemplateId);
      html += `<div class="pta-step-content"><div class="pta-review">
        <div class="pta-review-header">${tmpl ? tmpl.icon : ''} ${this._esc(tmpl ? tmpl.name : '')}</div>
        <div class="pta-review-summary">${this.customBuckets.length} buckets, ${totalTasks} tasks will be created</div>
        <div class="pta-review-list">`;
      this.customBuckets.forEach(b => {
        html += `<div class="pta-review-bucket"><strong>${this._esc(b.name || 'Untitled')}</strong>
          <ul>${b.tasks.map(t => `<li>${this._esc(t || 'Untitled task')}</li>`).join('')}</ul></div>`;
      });
      html += `</div></div>
        <div class="pta-nav-btns">
          <button class="pta-back-btn" data-action="back">Back</button>
          <button class="pta-apply-btn" data-action="apply">Apply Template</button>
        </div></div>`;
    }

    html += `</div>`;
    this.container.innerHTML = html;

    this.container.onclick = (e) => {
      const el = e.target.closest('[data-action]');
      if (!el) return;
      const action = el.dataset.action;
      if (action === 'select') this.selectTemplate(Number(el.dataset.id));
      else if (action === 'next') this.goToStep(this.currentStep + 1);
      else if (action === 'back') this.goToStep(this.currentStep - 1);
      else if (action === 'remove-bucket') this.removeBucket(Number(el.dataset.bi));
      else if (action === 'add-bucket') this.addBucket();
      else if (action === 'remove-task') this.removeTask(Number(el.dataset.bi), Number(el.dataset.ti));
      else if (action === 'add-task') this.addTask(Number(el.dataset.bi));
      else if (action === 'apply') this.applyTemplate();
      else if (action === 'reset') { this.currentStep = 1; this.selectedTemplateId = null; this.customBuckets = []; this.applied = false; this.render(); }
    };

    this.container.oninput = (e) => {
      if (e.target.dataset.ref === 'bucket-name') {
        this.customBuckets[Number(e.target.dataset.bi)].name = e.target.value;
      } else if (e.target.dataset.ref === 'task') {
        this.customBuckets[Number(e.target.dataset.bi)].tasks[Number(e.target.dataset.ti)] = e.target.value;
      }
    };
  },

  exportState() {
    return { currentStep: this.currentStep, selectedTemplateId: this.selectedTemplateId, customBuckets: JSON.parse(JSON.stringify(this.customBuckets)), applied: this.applied };
  },

  importState(state) {
    if (!state) return;
    this.currentStep = state.currentStep || 1;
    this.selectedTemplateId = state.selectedTemplateId ?? null;
    this.customBuckets = state.customBuckets || [];
    this.applied = state.applied || false;
    this.render();
  }
};
