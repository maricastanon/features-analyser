/* ═══════════════════════════════════════════════
   FEATURE: Planner Forms — Intake form builder
   Drag fields, preview mode, submission creates
   task, response list view.
   ═══════════════════════════════════════════════ */
const FeatPlannerForms = {
  fields: [],
  responses: [],
  mode: 'builder', // builder | preview | responses
  nextFieldId: 100,

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this._seed();
    this.render();
  },

  _seed() {
    this.fields = [
      { id:1, type:'text', label:'Task Title', required:true, placeholder:'Enter task title...' },
      { id:2, type:'textarea', label:'Description', required:false, placeholder:'Describe the task...' },
      { id:3, type:'dropdown', label:'Priority', required:true, options:['Low','Medium','Important','Urgent'] },
      { id:4, type:'dropdown', label:'Category', required:true, options:['Bug','Feature','Improvement','Documentation'] },
      { id:5, type:'date', label:'Due Date', required:true, placeholder:'' },
      { id:6, type:'dropdown', label:'Assign To', required:false, options:['Alex M.','Chen W.','Sara K.','Bob L.','Eva J.','Kim P.'] },
      { id:7, type:'text', label:'Attachments URL', required:false, placeholder:'Paste link to attachments...' }
    ];
    this.responses = [
      { id:1, date:'2026-04-08', submitter:'Sara K.', values:{ 'Task Title':'Fix checkout page crash', Description:'Page crashes when applying discount code on mobile', Priority:'Urgent', Category:'Bug', 'Due Date':'2026-04-10', 'Assign To':'Chen W.', 'Attachments URL':'' }},
      { id:2, date:'2026-04-07', submitter:'Bob L.', values:{ 'Task Title':'Add dark mode support', Description:'Users have requested dark mode', Priority:'Medium', Category:'Feature', 'Due Date':'2026-04-20', 'Assign To':'Alex M.', 'Attachments URL':'https://figma.com/...' }},
      { id:3, date:'2026-04-06', submitter:'Eva J.', values:{ 'Task Title':'Update API rate limit docs', Description:'Rate limit headers changed in v3', Priority:'Low', Category:'Documentation', 'Due Date':'2026-04-15', 'Assign To':'Eva J.', 'Attachments URL':'' }}
    ];
  },

  render() {
    const fieldTypes = [
      { type:'text', icon:'Aa', label:'Text' },
      { type:'textarea', icon:'&#9776;', label:'Long Text' },
      { type:'dropdown', icon:'&#9660;', label:'Dropdown' },
      { type:'date', icon:'&#128197;', label:'Date' }
    ];

    this.container.innerHTML = `
    <div class="pf-wrap">
      <div class="pf-header">
        <h3 class="pf-title">Intake Forms</h3>
        <span class="pf-missing-badge">MISSING FROM PLANNER</span>
        <div class="pf-mode-toggle">
          <button class="pf-mode ${this.mode==='builder'?'active':''}" onclick="FeatPlannerForms.setMode('builder')">Builder</button>
          <button class="pf-mode ${this.mode==='preview'?'active':''}" onclick="FeatPlannerForms.setMode('preview')">Preview</button>
          <button class="pf-mode ${this.mode==='responses'?'active':''}" onclick="FeatPlannerForms.setMode('responses')">Responses (${this.responses.length})</button>
        </div>
      </div>

      ${this.mode === 'builder' ? this._renderBuilder(fieldTypes) : ''}
      ${this.mode === 'preview' ? this._renderPreview() : ''}
      ${this.mode === 'responses' ? this._renderResponses() : ''}
    </div>`;
  },

  _renderBuilder(fieldTypes) {
    return `
      <div class="pf-builder">
        <div class="pf-palette">
          <div class="pf-palette-title">Field Types</div>
          ${fieldTypes.map(ft => `
            <button class="pf-field-type" onclick="FeatPlannerForms.addField('${ft.type}')">
              <span class="pf-ft-icon">${ft.icon}</span>
              <span>${ft.label}</span>
            </button>`).join('')}
        </div>
        <div class="pf-canvas">
          <div class="pf-form-title-edit">
            <span class="pf-form-label">Task Intake Form</span>
            <span class="pf-form-desc">${this.fields.length} fields configured</span>
          </div>
          <div class="pf-field-list">
            ${this.fields.map((f, i) => `
              <div class="pf-field-card" draggable="true"
                ondragstart="FeatPlannerForms._dragFieldStart(event,${f.id})"
                ondragover="event.preventDefault()"
                ondrop="FeatPlannerForms._dropField(event,${f.id})">
                <div class="pf-field-drag">&#9776;</div>
                <div class="pf-field-info">
                  <span class="pf-field-label">${this._esc(f.label)} ${f.required?'<span class="pf-req">*</span>':''}</span>
                  <span class="pf-field-type-tag">${f.type}</span>
                  ${f.type==='dropdown'?`<span class="pf-field-opts">${f.options.join(', ')}</span>`:''}
                </div>
                <div class="pf-field-actions">
                  <button class="pf-field-edit" onclick="FeatPlannerForms.editField(${f.id})">&#9998;</button>
                  <button class="pf-field-del" onclick="FeatPlannerForms.removeField(${f.id})">&#10005;</button>
                </div>
              </div>`).join('')}
          </div>
        </div>
      </div>`;
  },

  _renderPreview() {
    return `
      <div class="pf-preview">
        <div class="pf-preview-card">
          <div class="pf-preview-title">Task Intake Form</div>
          <div class="pf-preview-desc">Submit a new task request</div>
          ${this.fields.map(f => `
            <div class="pf-preview-field">
              <label class="pf-preview-label">${this._esc(f.label)} ${f.required?'<span class="pf-req">*</span>':''}</label>
              ${f.type === 'text' ? `<input class="pf-input" type="text" placeholder="${this._esc(f.placeholder||'')}" id="pf_${f.id}">` : ''}
              ${f.type === 'textarea' ? `<textarea class="pf-textarea" placeholder="${this._esc(f.placeholder||'')}" id="pf_${f.id}"></textarea>` : ''}
              ${f.type === 'dropdown' ? `<select class="pf-select" id="pf_${f.id}"><option value="">Select...</option>${f.options.map(o=>`<option value="${this._esc(o)}">${this._esc(o)}</option>`).join('')}</select>` : ''}
              ${f.type === 'date' ? `<input class="pf-input" type="date" id="pf_${f.id}">` : ''}
            </div>`).join('')}
          <button class="pf-submit-btn" onclick="FeatPlannerForms.submitForm()">Submit Task</button>
        </div>
      </div>`;
  },

  _renderResponses() {
    return `
      <div class="pf-responses">
        ${this.responses.length === 0 ? '<div class="pf-empty">No responses yet</div>' : ''}
        ${this.responses.map(r => `
          <div class="pf-resp-card">
            <div class="pf-resp-head">
              <span class="pf-resp-submitter">${this._esc(r.submitter)}</span>
              <span class="pf-resp-date">${r.date}</span>
            </div>
            <div class="pf-resp-values">
              ${Object.entries(r.values).filter(([k,v])=>v).map(([k,v]) => `
                <div class="pf-resp-row">
                  <span class="pf-resp-key">${this._esc(k)}</span>
                  <span class="pf-resp-val">${this._esc(v)}</span>
                </div>`).join('')}
            </div>
          </div>`).join('')}
      </div>`;
  },

  setMode(m) { this.mode = m; this.render(); },

  addField(type) {
    const label = prompt('Field label:');
    if (!label?.trim()) return;
    const field = { id: this.nextFieldId++, type, label: label.trim(), required: false, placeholder: '' };
    if (type === 'dropdown') {
      const opts = prompt('Options (comma-separated):');
      field.options = opts ? opts.split(',').map(o => o.trim()).filter(Boolean) : ['Option 1','Option 2'];
    }
    this.fields.push(field);
    this.render();
  },

  editField(id) {
    const f = this.fields.find(x => x.id === id);
    const label = prompt('Edit label:', f.label);
    if (label !== null && label.trim()) f.label = label.trim();
    f.required = confirm('Is this field required?');
    if (f.type === 'dropdown') {
      const opts = prompt('Options (comma-separated):', f.options.join(', '));
      if (opts) f.options = opts.split(',').map(o => o.trim()).filter(Boolean);
    }
    this.render();
  },

  removeField(id) {
    this.fields = this.fields.filter(f => f.id !== id);
    this.render();
  },

  _dragFieldStart(e, id) {
    this._dragFieldId = id;
    e.dataTransfer.effectAllowed = 'move';
  },

  _dropField(e, targetId) {
    e.preventDefault();
    if (!this._dragFieldId || this._dragFieldId === targetId) return;
    const fromIdx = this.fields.findIndex(f => f.id === this._dragFieldId);
    const toIdx = this.fields.findIndex(f => f.id === targetId);
    const [field] = this.fields.splice(fromIdx, 1);
    this.fields.splice(toIdx, 0, field);
    this._dragFieldId = null;
    this.render();
  },

  submitForm() {
    const values = {};
    let valid = true;
    this.fields.forEach(f => {
      const el = document.getElementById('pf_' + f.id);
      const val = el ? el.value : '';
      values[f.label] = val;
      if (f.required && !val) { valid = false; el && (el.style.borderColor = '#ef4444'); }
    });
    if (!valid) { alert('Please fill in all required fields.'); return; }
    this.responses.unshift({ id: Date.now(), date: '2026-04-09', submitter: 'You', values });
    alert('Task submitted successfully!');
    this.mode = 'responses';
    this.render();
  },

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },
  exportState() { return { fields: this.fields, responses: this.responses, mode: this.mode }; },
  importState(s) { if (s.fields) this.fields = s.fields; if (s.responses) this.responses = s.responses; if (s.mode) this.mode = s.mode; this.render(); }
};
