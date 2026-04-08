const MsPlannerTemplateCreator = {
  container: null,
  templateName: '',
  templateDesc: '',
  selectedIcon: '\u{1F4CB}',
  icons: ['\u{1F4CB}', '\u{1F680}', '\u{1F41B}', '\u{1F3AF}', '\u{1F4E3}', '\u{1F465}', '\u{1F389}', '\u{2699}', '\u{1F4A1}', '\u{1F4CA}', '\u{1F512}', '\u{2B50}'],
  buckets: [],
  nextBucketId: 1,
  nextTaskId: 1,
  showIconPicker: false,

  _esc(str) {
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
  },

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.templateName = '';
    this.templateDesc = '';
    this.selectedIcon = '\u{1F4CB}';
    this.buckets = [];
    this.nextBucketId = 1;
    this.nextTaskId = 1;
    this.showIconPicker = false;
    this.render();
  },

  addBucket() {
    this.buckets.push({ id: this.nextBucketId++, name: '', tasks: [] });
    this.render();
  },

  removeBucket(bid) {
    this.buckets = this.buckets.filter(b => b.id !== bid);
    this.render();
  },

  addTask(bid) {
    const b = this.buckets.find(b => b.id === bid);
    if (b) b.tasks.push({ id: this.nextTaskId++, title: '', priority: 'Medium', labels: '' });
    this.render();
  },

  removeTask(bid, tid) {
    const b = this.buckets.find(b => b.id === bid);
    if (b) b.tasks = b.tasks.filter(t => t.id !== tid);
    this.render();
  },

  saveTemplate() {
    if (!this.templateName.trim()) return;
    return {
      name: this.templateName, description: this.templateDesc,
      icon: this.selectedIcon, buckets: JSON.parse(JSON.stringify(this.buckets))
    };
  },

  render() {
    if (!this.container) return;
    const totalTasks = this.buckets.reduce((s, b) => s + b.tasks.length, 0);

    let html = `<div class="ptc-panel">
      <div class="ptc-header"><h3>Template Creator</h3></div>
      <div class="ptc-form">
        <div class="ptc-row">
          <div class="ptc-icon-pick">
            <button class="ptc-icon-btn" data-action="toggle-icons">${this.selectedIcon}</button>
            ${this.showIconPicker ? `<div class="ptc-icon-grid">${this.icons.map(ic => `<button class="ptc-icon-opt ${ic === this.selectedIcon ? 'ptc-icon-selected' : ''}" data-action="pick-icon" data-icon="${ic}">${ic}</button>`).join('')}</div>` : ''}
          </div>
          <input class="ptc-name-input" type="text" placeholder="Template name..." value="${this._esc(this.templateName)}" data-ref="name" />
        </div>
        <textarea class="ptc-desc-input" placeholder="Description..." rows="2" data-ref="desc">${this._esc(this.templateDesc)}</textarea>
      </div>
      <div class="ptc-buckets-header">
        <span class="ptc-section-label">Buckets</span>
        <button class="ptc-add-bucket-btn" data-action="add-bucket">+ Add Bucket</button>
      </div>
      <div class="ptc-buckets">`;

    this.buckets.forEach(b => {
      html += `<div class="ptc-bucket">
        <div class="ptc-bucket-head">
          <input class="ptc-bucket-name" type="text" placeholder="Bucket name..." value="${this._esc(b.name)}" data-ref="bucket-name" data-bid="${b.id}" />
          <button class="ptc-remove-btn" data-action="remove-bucket" data-bid="${b.id}">&times;</button>
        </div>
        <div class="ptc-tasks">`;

      b.tasks.forEach(t => {
        html += `<div class="ptc-task-row">
            <input class="ptc-task-title" type="text" placeholder="Task title..." value="${this._esc(t.title)}" data-ref="task-title" data-bid="${b.id}" data-tid="${t.id}" />
            <select class="ptc-task-priority" data-ref="task-priority" data-bid="${b.id}" data-tid="${t.id}">
              ${['Low', 'Medium', 'High', 'Urgent'].map(p => `<option value="${p}" ${p === t.priority ? 'selected' : ''}>${p}</option>`).join('')}
            </select>
            <input class="ptc-task-labels" type="text" placeholder="Labels..." value="${this._esc(t.labels)}" data-ref="task-labels" data-bid="${b.id}" data-tid="${t.id}" />
            <button class="ptc-remove-btn" data-action="remove-task" data-bid="${b.id}" data-tid="${t.id}">&times;</button>
          </div>`;
      });

      html += `</div>
        <button class="ptc-add-task-btn" data-action="add-task" data-bid="${b.id}">+ Task</button>
      </div>`;
    });

    html += `</div>
      <div class="ptc-preview">
        <span class="ptc-section-label">Preview</span>
        <div class="ptc-preview-card">
          <span class="ptc-preview-icon">${this.selectedIcon}</span>
          <strong>${this._esc(this.templateName || 'Untitled')}</strong> &mdash;
          ${this.buckets.length} buckets, ${totalTasks} tasks
        </div>
      </div>
      <button class="ptc-save-btn" data-action="save">Save Template</button>
    </div>`;

    this.container.innerHTML = html;

    this.container.oninput = (e) => {
      const ref = e.target.dataset.ref;
      if (ref === 'name') this.templateName = e.target.value;
      else if (ref === 'desc') this.templateDesc = e.target.value;
      else if (ref === 'bucket-name') {
        const b = this.buckets.find(b => b.id === Number(e.target.dataset.bid));
        if (b) b.name = e.target.value;
      } else if (ref === 'task-title' || ref === 'task-labels' || ref === 'task-priority') {
        const b = this.buckets.find(b => b.id === Number(e.target.dataset.bid));
        const t = b && b.tasks.find(t => t.id === Number(e.target.dataset.tid));
        if (t) {
          if (ref === 'task-title') t.title = e.target.value;
          else if (ref === 'task-labels') t.labels = e.target.value;
          else if (ref === 'task-priority') t.priority = e.target.value;
        }
      }
    };

    this.container.onchange = (e) => {
      if (e.target.dataset.ref === 'task-priority') {
        const b = this.buckets.find(b => b.id === Number(e.target.dataset.bid));
        const t = b && b.tasks.find(t => t.id === Number(e.target.dataset.tid));
        if (t) t.priority = e.target.value;
      }
    };

    this.container.onclick = (e) => {
      const el = e.target.closest('[data-action]');
      if (!el) return;
      const action = el.dataset.action;
      if (action === 'toggle-icons') { this.showIconPicker = !this.showIconPicker; this.render(); }
      else if (action === 'pick-icon') { this.selectedIcon = el.dataset.icon; this.showIconPicker = false; this.render(); }
      else if (action === 'add-bucket') this.addBucket();
      else if (action === 'remove-bucket') this.removeBucket(Number(el.dataset.bid));
      else if (action === 'add-task') this.addTask(Number(el.dataset.bid));
      else if (action === 'remove-task') this.removeTask(Number(el.dataset.bid), Number(el.dataset.tid));
      else if (action === 'save') this.saveTemplate();
    };
  },

  exportState() {
    return {
      templateName: this.templateName, templateDesc: this.templateDesc,
      selectedIcon: this.selectedIcon, buckets: JSON.parse(JSON.stringify(this.buckets)),
      nextBucketId: this.nextBucketId, nextTaskId: this.nextTaskId
    };
  },

  importState(state) {
    if (!state) return;
    this.templateName = state.templateName || '';
    this.templateDesc = state.templateDesc || '';
    this.selectedIcon = state.selectedIcon || '\u{1F4CB}';
    this.buckets = state.buckets || [];
    this.nextBucketId = state.nextBucketId || 1;
    this.nextTaskId = state.nextTaskId || 1;
    this.render();
  }
};
