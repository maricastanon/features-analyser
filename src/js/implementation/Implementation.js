/* ═══════════════════════════════════════════════════════════════
   Implementation — Queue with checklists, progress tracking
   ═══════════════════════════════════════════════════════════════ */
const Implementation = {
  _sortBy: 'priority',

  async init() {
    await this.render();
    document.getElementById('sortPriorityBtn')?.addEventListener('click', () => { this._sortBy = 'priority'; this.render(); });
    document.getElementById('sortNameBtn')?.addEventListener('click', () => { this._sortBy = 'name'; this.render(); });
    EventBus.on('project:switched', () => this.render());
  },

  async addFromFeature(feature) {
    const projectId = App.currentProject ? App.currentProject.id : feature.projectId;
    const existing = await Store.getAll('implementation', 'projectId', projectId);
    const matched = existing.find(item =>
      (feature.improvementId && item.improvementId === feature.improvementId) ||
      (feature.sourceModuleId && item.sourceModuleId === feature.sourceModuleId) ||
      item.featureId === feature.id
    );

    const checklist = (feature.checklist || []).map(item =>
      typeof item === 'string' ? { text: item, done: false } : { text: item.text, done: Boolean(item.done) }
    );

    const record = {
      id: matched?.id || Store.generateId(),
      projectId,
      featureId: feature.sourceType === 'improvement' ? null : feature.id,
      improvementId: feature.improvementId || matched?.improvementId || null,
      sourceModuleId: feature.sourceModuleId || matched?.sourceModuleId || '',
      sourceType: feature.sourceType || matched?.sourceType || 'feature',
      name: feature.name,
      priority: feature.priority || 3,
      done: matched?.done || false,
      progress: 0,
      checklist: checklist.length ? checklist : (matched?.checklist || []),
      integrationSteps: matched?.integrationSteps || [],
      added: matched?.added || new Date().toISOString()
    };
    record.progress = record.done ? 100 : this._calcProgress(record);

    await Store.put('implementation', record);
    this.render();
    App.updateCounts();
    App.updateProgress();
  },

  async render() {
    const container = DOM.el('implementationList');
    if (!container || !App.currentProject) return;

    let items = await Store.getAll('implementation', 'projectId', App.currentProject.id);

    if (this._sortBy === 'priority') items.sort((a, b) => a.priority - b.priority || (a.done ? 1 : -1));
    else if (this._sortBy === 'name') items.sort((a, b) => a.name.localeCompare(b.name));

    if (!items.length) {
      container.innerHTML = `<div class="empty-state">
        <div class="empty-state-icon">🎯</div>
        <div class="empty-state-text">No items yet. Send features here from the Features tab!</div>
      </div>`;
      return;
    }

    // Group by priority
    const pc = { 1: '#ef4444', 2: '#f97316', 3: '#eab308', 4: '#22c55e', 5: '#3b82f6' };
    const pl = { 1: '🔴 CRITICAL', 2: '🟠 HIGH', 3: '🟡 MEDIUM', 4: '🟢 LOW', 5: '🔵 SOMEDAY' };
    const groups = {};
    items.forEach(i => { const p = i.priority || 3; if (!groups[p]) groups[p] = []; groups[p].push(i); });

    let html = '';
    [1, 2, 3, 4, 5].forEach(p => {
      if (!groups[p]?.length) return;
      html += `<div style="margin-bottom:20px">
        <div style="display:flex;align-items:center;gap:9px;padding:8px 0;border-bottom:2px solid var(--border-soft);margin-bottom:10px">
          <div style="width:14px;height:14px;border-radius:50%;background:${pc[p]}"></div>
          <span style="font-weight:800;font-size:.95rem;color:${pc[p]}">${pl[p]}</span>
          <span style="font-size:var(--font-size-xs);color:var(--text-muted);margin-left:auto">${groups[p].length} items</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${groups[p].map(i => this._item(i, pc)).join('')}
        </div>
      </div>`;
    });

    container.innerHTML = html;
  },

  _item(i, pc) {
    const cl = (i.checklist || []).map((c, ci) =>
      `<div style="display:flex;align-items:center;gap:6px;padding:3px 0;font-size:var(--font-size-sm);cursor:pointer"
            onclick="Implementation.toggleChecklist('${i.id}',${ci})">
        <span style="color:${c.done ? 'var(--accent-green)' : 'var(--text-muted)'}">${c.done ? '☑️' : '☐'}</span>
        <span style="${c.done ? 'text-decoration:line-through;opacity:.5' : ''}">${DOM.esc(c.text)}</span>
      </div>`
    ).join('');

    return `<div class="card" style="${i.done ? 'opacity:.55;border-color:var(--accent-green)' : ''};margin-bottom:0">
      <div style="padding:12px 14px;display:flex;align-items:center;gap:10px">
        <div style="width:20px;height:20px;border-radius:6px;border:2.5px solid ${i.done ? 'var(--accent-green)' : 'var(--border-soft)'};
              cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;
              ${i.done ? 'background:var(--accent-green);color:#fff' : ''};font-size:.7rem"
             onclick="Implementation.toggleDone('${i.id}')">${i.done ? '✓' : ''}</div>
        <div style="flex:1">
          <div style="font-weight:700;font-size:var(--font-size-md);${i.done ? 'text-decoration:line-through' : ''}">${DOM.esc(i.name)}</div>
          <div style="font-size:var(--font-size-xs);color:var(--text-muted);margin-top:2px">Added ${new Date(i.added).toLocaleDateString()}</div>
          ${cl ? '<div style="margin-top:4px;padding-left:2px">' + cl + '</div>' : ''}
          <button class="btn btn-sm btn-outline" style="margin-top:5px" onclick="Implementation.addChecklist('${i.id}')">+ Checklist</button>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px">
          <div style="width:70px;height:5px;background:var(--border-soft);border-radius:3px;overflow:hidden">
            <div style="height:100%;width:${i.progress}%;background:${pc[i.priority] || '#eab308'};border-radius:3px;transition:width .5s"></div>
          </div>
          <span style="font-size:var(--font-size-xs);color:var(--text-muted)">${i.progress}%</span>
        </div>
        <button class="btn btn-sm btn-outline btn-danger" style="padding:3px 7px"
                onclick="event.stopPropagation();Implementation.remove('${i.id}')">✕</button>
      </div>
    </div>`;
  },

  async toggleDone(id) {
    const i = await Store.get('implementation', id);
    if (!i) return;
    i.done = !i.done;
    i.progress = i.done ? 100 : this._calcProgress(i);
    await Store.put('implementation', i);
    await this._syncLinkedStatuses(i);
    this.render();
    App.updateProgress();
  },

  async addChecklist(id) {
    const text = DOM.prompt('Checklist item:');
    if (!text?.trim()) return;
    const i = await Store.get('implementation', id);
    if (!i) return;
    if (!i.checklist) i.checklist = [];
    i.checklist.push({ text: text.trim(), done: false });
    i.progress = this._calcProgress(i);
    await Store.put('implementation', i);
    await this._syncLinkedStatuses(i);
    this.render();
  },

  async toggleChecklist(id, idx) {
    const i = await Store.get('implementation', id);
    if (!i || !i.checklist[idx]) return;
    i.checklist[idx].done = !i.checklist[idx].done;
    i.progress = this._calcProgress(i);
    if (i.progress === 100) i.done = true;
    await Store.put('implementation', i);
    await this._syncLinkedStatuses(i);
    this.render();
    App.updateProgress();
  },

  _calcProgress(item) {
    if (!item.checklist?.length) return item.done ? 100 : 0;
    const done = item.checklist.filter(c => c.done).length;
    return Math.round(done / item.checklist.length * 100);
  },

  async remove(id) {
    await Store.delete('implementation', id);
    this.render();
    App.updateCounts();
    App.updateProgress();
  },

  async _syncLinkedStatuses(item) {
    if (item.featureId) {
      const feature = await Store.get('features', item.featureId);
      if (feature) {
        feature.status = item.done ? 'done' : 'implementing';
        feature.updated = new Date().toISOString();
        await Store.put('features', feature);
      }
    }

    if (item.improvementId) {
      const improvement = await Store.get('improvements', item.improvementId);
      if (improvement) {
        improvement.status = item.done ? 'resolved' : 'open';
        improvement.checklist = item.checklist;
        await Store.put('improvements', improvement);
      }
    }

    if (item.sourceModuleId) {
      await ModuleRegistry.updateMeta(item.sourceModuleId, {
        status: item.done ? 'done' : 'implementation',
        checklist: item.checklist
      });
    }
  }
};
