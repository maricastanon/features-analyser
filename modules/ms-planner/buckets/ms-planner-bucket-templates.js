const MsPlannerBucketTemplates = (() => {
  const _esc = s => { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; };
  let _root = null;
  let _activeBuckets = [];
  let _customTemplates = [];
  let _previewTemplate = null;

  const _builtIn = [
    { id: 'sprint', name: 'Sprint', desc: 'Agile sprint workflow with backlog through deployment', buckets: [
      { name: 'Backlog', tasks: ['Groom user stories', 'Estimate story points'] },
      { name: 'Sprint To Do', tasks: ['Pick top-priority items', 'Write acceptance criteria'] },
      { name: 'In Development', tasks: ['Implement feature A', 'Write unit tests'] },
      { name: 'Code Review', tasks: ['Review pull requests'] },
      { name: 'Done', tasks: ['Deploy to staging'] }
    ]},
    { id: 'marketing', name: 'Marketing Campaign', desc: 'End-to-end campaign planning and execution', buckets: [
      { name: 'Ideas', tasks: ['Brainstorm campaign themes', 'Audience research'] },
      { name: 'Content Creation', tasks: ['Write blog post draft', 'Design social graphics'] },
      { name: 'Review & Approval', tasks: ['Legal review', 'Stakeholder sign-off'] },
      { name: 'Scheduled', tasks: ['Schedule social posts', 'Set up email blast'] },
      { name: 'Published', tasks: [] }
    ]},
    { id: 'launch', name: 'Product Launch', desc: 'Coordinate a product launch across teams', buckets: [
      { name: 'Pre-Launch', tasks: ['Finalize pricing', 'Prepare press release', 'Beta testing'] },
      { name: 'Launch Day', tasks: ['Deploy to production', 'Announce on social', 'Monitor dashboards'] },
      { name: 'Post-Launch', tasks: ['Collect feedback', 'Hotfix triage', 'Retrospective'] }
    ]},
    { id: 'bugs', name: 'Bug Triage', desc: 'Categorize and resolve bugs efficiently', buckets: [
      { name: 'New / Unscreened', tasks: ['Incoming bug reports'] },
      { name: 'Confirmed', tasks: ['Reproduce and document'] },
      { name: 'In Fix', tasks: ['Apply patch', 'Write regression test'] },
      { name: 'Verified', tasks: ['QA sign-off'] },
      { name: 'Closed', tasks: [] }
    ]},
    { id: 'onboarding', name: 'Onboarding', desc: 'New employee onboarding checklist', buckets: [
      { name: 'Before Day 1', tasks: ['Send welcome email', 'Provision accounts', 'Order equipment'] },
      { name: 'Week 1', tasks: ['Team introductions', 'Setup dev environment', 'Read onboarding docs'] },
      { name: 'Week 2-4', tasks: ['Shadow senior engineer', 'First small PR', 'One-on-one with manager'] },
      { name: 'Completed', tasks: [] }
    ]}
  ];

  function _allTemplates() { return [..._builtIn, ..._customTemplates]; }

  function _render() {
    if (!_root) return;
    const all = _allTemplates();
    _root.innerHTML = `
      <div class="bt-header">
        <h2 class="bt-title">Bucket Templates</h2>
        <button class="bt-btn bt-btn-save" data-action="show-save-custom">Save Current Board as Template</button>
      </div>
      <div class="bt-save-form bt-hidden" id="bt-save-form">
        <input class="bt-input" id="bt-custom-name" placeholder="Template name" maxlength="50" />
        <input class="bt-input" id="bt-custom-desc" placeholder="Description" maxlength="100" />
        <button class="bt-btn bt-btn-confirm" data-action="confirm-save-custom">Save</button>
        <button class="bt-btn bt-btn-cancel" data-action="cancel-save-custom">Cancel</button>
      </div>
      <div class="bt-grid">${all.map(t => `
        <div class="bt-card ${t.isCustom ? 'bt-card-custom' : ''}" data-tid="${_esc(t.id)}">
          <div class="bt-card-header">
            <span class="bt-card-name">${_esc(t.name)}</span>
            ${t.isCustom ? `<button class="bt-btn-icon bt-btn-del" data-action="delete-custom" data-tid="${_esc(t.id)}" title="Delete">&#10005;</button>` : ''}
          </div>
          <p class="bt-card-desc">${_esc(t.desc)}</p>
          <div class="bt-card-stats">${t.buckets.length} bucket${t.buckets.length !== 1 ? 's' : ''} &middot; ${t.buckets.reduce((s, b) => s + b.tasks.length, 0)} tasks</div>
          <div class="bt-card-actions">
            <button class="bt-btn bt-btn-preview" data-action="preview" data-tid="${_esc(t.id)}">Preview</button>
            <button class="bt-btn bt-btn-apply" data-action="apply" data-tid="${_esc(t.id)}">Apply</button>
          </div>
        </div>`).join('')}
      </div>
      ${_previewTemplate ? _renderPreview(_previewTemplate) : ''}
      <div class="bt-active-section">
        <h3 class="bt-subtitle">Active Board (${_activeBuckets.length} bucket${_activeBuckets.length !== 1 ? 's' : ''})</h3>
        ${_activeBuckets.length === 0 ? '<p class="bt-empty">No buckets. Apply a template to get started.</p>' : ''}
        <div class="bt-active-list">${_activeBuckets.map(b => `
          <div class="bt-active-bucket">
            <strong>${_esc(b.name)}</strong>
            <ul class="bt-task-list">${b.tasks.map(t => `<li>${_esc(t)}</li>`).join('')}</ul>
          </div>`).join('')}
        </div>
      </div>`;
  }

  function _renderPreview(t) {
    return `<div class="bt-preview">
      <div class="bt-preview-bar">
        <span class="bt-preview-title">Preview: ${_esc(t.name)}</span>
        <button class="bt-btn bt-btn-cancel" data-action="close-preview">Close</button>
      </div>
      <p class="bt-preview-desc">${_esc(t.desc)}</p>
      <div class="bt-preview-buckets">${t.buckets.map(b => `
        <div class="bt-preview-bucket">
          <div class="bt-preview-bucket-name">${_esc(b.name)}</div>
          <ul class="bt-task-list">${b.tasks.map(tk => `<li>${_esc(tk)}</li>`).join('')}
            ${b.tasks.length === 0 ? '<li class="bt-empty-task">No starter tasks</li>' : ''}
          </ul>
        </div>`).join('')}
      </div>
    </div>`;
  }

  function _findTemplate(tid) { return _allTemplates().find(t => t.id === tid); }

  function _applyTemplate(t) {
    _activeBuckets = t.buckets.map(b => ({ name: b.name, tasks: [...b.tasks] }));
    _previewTemplate = null;
    _render();
  }

  function _handleClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const tid = btn.dataset.tid;

    if (action === 'preview') {
      _previewTemplate = _findTemplate(tid) || null;
      _render();
    } else if (action === 'close-preview') {
      _previewTemplate = null;
      _render();
    } else if (action === 'apply') {
      const t = _findTemplate(tid);
      if (t) _applyTemplate(t);
    } else if (action === 'show-save-custom') {
      const form = _root.querySelector('#bt-save-form');
      if (form) { form.classList.remove('bt-hidden'); form.querySelector('#bt-custom-name').focus(); }
    } else if (action === 'cancel-save-custom') {
      _root.querySelector('#bt-save-form').classList.add('bt-hidden');
    } else if (action === 'confirm-save-custom') {
      const name = _root.querySelector('#bt-custom-name').value.trim();
      const desc = _root.querySelector('#bt-custom-desc').value.trim() || 'Custom template';
      if (!name) return;
      if (_activeBuckets.length === 0) return;
      const id = 'custom_' + Date.now();
      _customTemplates.push({ id, name, desc, isCustom: true, buckets: _activeBuckets.map(b => ({ name: b.name, tasks: [...b.tasks] })) });
      _render();
    } else if (action === 'delete-custom') {
      _customTemplates = _customTemplates.filter(t => t.id !== tid);
      _render();
    }
  }

  return {
    init(containerId) {
      _root = document.getElementById(containerId);
      if (!_root) return;
      _root.classList.add('bt-root');
      _activeBuckets = [];
      _customTemplates = [];
      _previewTemplate = null;
      _root.addEventListener('click', _handleClick);
      _render();
    },
    render() { _render(); },
    exportState() {
      return JSON.parse(JSON.stringify({ activeBuckets: _activeBuckets, customTemplates: _customTemplates }));
    },
    importState(state) {
      if (!state) return;
      _activeBuckets = state.activeBuckets || [];
      _customTemplates = (state.customTemplates || []).map(t => ({ ...t, isCustom: true }));
      _previewTemplate = null;
      _render();
    }
  };
})();
