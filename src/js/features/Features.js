/* ═══════════════════════════════════════════════════════════════
   Features — Feature brainstorm cards, filtering, CRUD
   Fully dynamic — categories from project config, no hardcoded data
   ═══════════════════════════════════════════════════════════════ */
const Features = {
  _newPriority: 3,
  STATUS_LABELS: {
    brainstorm: '💡 Brainstorm',
    imported: '📦 Imported',
    improving: '🔧 Improving',
    implementing: '🎯 Implementing',
    done: '✅ Done',
    archived: '🗂️ Archived'
  },

  async init() {
    Categories.renderTabs();
    this.renderAddForm();
    await this.render();
    EventBus.on('category:changed', () => this.render());
    EventBus.on('project:switched', () => { Categories.renderTabs(); this.render(); });
  },

  async render() {
    const grid = DOM.el('featureGrid');
    if (!grid || !App.currentProject) return;

    let features = await Store.getAll('features', 'projectId', App.currentProject.id);
    const catFilter = Categories.getCurrent();
    if (catFilter !== 'all') features = features.filter(f => f.category === catFilter);
    features.sort((a, b) => a.priority - b.priority);

    if (!features.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state-icon">🌱</div>
        <div class="empty-state-text">No features yet! Add one below.</div>
      </div>`;
      return;
    }

    grid.innerHTML = features.map(f => this._card(f)).join('');
    this._updateNav(features);
  },

  _card(f) {
    const cat = Categories.getById(f.category) || { emoji: '📦', name: 'Custom', color: '#666' };
    const pl = { 1: 'CRITICAL', 2: 'HIGH', 3: 'MEDIUM', 4: 'LOW', 5: 'SOMEDAY' };
    const balls = [1, 2, 3, 4, 5].map(l =>
      `<div class="p-ball ${l <= f.priority ? 'active' : ''}" data-level="${l}"
            onclick="event.stopPropagation();Features.setPriority('${f.id}',${l})"></div>`
    ).join('');
    const collapsed = f.collapsed !== false;

    return `<div class="card ${collapsed ? 'collapsed' : ''}" data-fid="${f.id}">
      <div class="status-dot" style="position:absolute;top:10px;right:10px"></div>
      <div class="card-header" onclick="Features.toggle('${f.id}')">
        <span style="font-size:1.4rem">${cat.emoji}</span>
        <div style="flex:1">
          <div style="font-size:.95rem;font-weight:800">${DOM.esc(f.name)}</div>
          <div style="font-size:var(--font-size-xs);color:var(--text-muted)">${pl[f.priority] || 'MEDIUM'}${f.status ? ' • ' + (this.STATUS_LABELS[f.status] || f.status) : ''}</div>
        </div>
        <div class="priority-balls">${balls}</div>
        <span class="card-chevron">▼</span>
      </div>
      <div class="card-body">
        <div style="margin-bottom:12px">
          <div class="field-label"><span class="dot"></span> Description</div>
          <textarea class="textarea" rows="2" placeholder="What does this feature do?"
                    onchange="Features.updateField('${f.id}','description',this.value)">${DOM.esc(f.description)}</textarea>
        </div>
        <div style="margin-bottom:12px">
          <div class="field-label pink"><span class="dot"></span> AI Implementation Prompt</div>
          <div style="background:linear-gradient(135deg,var(--accent-green-bg),var(--accent-pink-bg));border:1.5px solid var(--border-soft);border-radius:var(--radius-md);padding:12px">
            <textarea class="textarea" rows="4" placeholder="Auto-generate or write prompt..."
                      style="background:var(--bg-deep);font-family:var(--font-mono);font-size:var(--font-size-sm)"
                      onchange="Features.updateField('${f.id}','aiPrompt',this.value)">${DOM.esc(f.aiPrompt)}</textarea>
            <div class="btn-row" style="margin-top:8px">
              <button class="btn btn-sm btn-pink" onclick="Features.generatePrompt('${f.id}')">🤖 Generate Smart Prompt</button>
              <button class="btn btn-sm btn-outline" onclick="Features.copyPrompt('${f.id}')">📋 Copy</button>
            </div>
          </div>
        </div>
        <div class="btn-row" style="margin-top:10px">
          <button class="btn btn-sm btn-green" onclick="Features.sendToImpl('${f.id}')">🎯 → Implementation</button>
          <button class="btn btn-sm btn-outline" onclick="Features.toImprovement('${f.id}')">🔧 Needs Improvement</button>
          <button class="btn btn-sm btn-outline btn-danger" style="margin-left:auto" onclick="Features.remove('${f.id}')">🗑️</button>
        </div>
      </div>
    </div>`;
  },

  renderAddForm() {
    const container = DOM.el('featureAddForm');
    if (!container) return;

    const cats = Categories.getAll();
    const catOptions = cats.map(c =>
      `<option value="${c.id}">${c.emoji} ${DOM.esc(c.name)}</option>`
    ).join('');

    const balls = [1, 2, 3, 4, 5].map(l =>
      `<div class="p-ball ${l <= this._newPriority ? 'active' : ''}" data-level="${l}"
            onclick="Features.setNewPriority(${l})"></div>`
    ).join('');

    container.innerHTML = `
    <div class="card" style="border-style:dashed;border-color:var(--accent-pink)">
      <div style="padding:14px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
          <span style="font-size:1.3rem">✨</span>
          <span style="font-size:1rem;font-weight:800;color:var(--accent-pink)">Add New Feature</span>
        </div>
        <input class="input" id="newFeatName" placeholder="Feature name..." style="margin-bottom:8px">
        <textarea class="textarea" id="newFeatDesc" placeholder="Description — what does it do?" rows="2" style="margin-bottom:8px"></textarea>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <select class="select" id="newFeatCat">${catOptions}</select>
          <div class="priority-balls" style="margin-left:6px">
            <span style="font-size:var(--font-size-xs);color:var(--text-muted);margin-right:3px">Priority:</span>
            ${balls}
          </div>
          <button class="btn btn-pink" onclick="Features.add()" style="margin-left:auto">🌸 Add Feature</button>
          <button class="btn btn-green" onclick="Features.addAndImpl()">🎯 Add & Implement</button>
        </div>
      </div>
    </div>`;
  },

  setNewPriority(level) {
    this._newPriority = level;
    this.renderAddForm();
  },

  async add() {
    const name = document.getElementById('newFeatName').value.trim();
    if (!name) { Toast.show('Name needed!', 'warning'); return; }
    const desc = document.getElementById('newFeatDesc').value.trim();
    const cat = document.getElementById('newFeatCat').value;

    const feature = {
      id: Store.generateId(),
      projectId: App.currentProject.id,
      name, description: desc, category: cat,
      priority: this._newPriority,
      aiPrompt: '', status: 'brainstorm', uiPattern: '',
      collapsed: true,
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };

    await Store.put('features', feature);
    document.getElementById('newFeatName').value = '';
    document.getElementById('newFeatDesc').value = '';
    this._newPriority = 3;

    await this.render();
    this.renderAddForm();
    App.updateCounts();
    EventBus.emit('feature:added', feature);
    Toast.show('Feature added! 🌸');
    return feature;
  },

  async addAndImpl() {
    const f = await this.add();
    if (f) this.sendToImpl(f.id);
  },

  async setPriority(id, level) {
    const f = await Store.get('features', id);
    if (f) { f.priority = level; f.updated = new Date().toISOString(); await Store.put('features', f); this.render(); }
  },

  async toggle(id) {
    const f = await Store.get('features', id);
    if (f) { f.collapsed = !f.collapsed; await Store.put('features', f); this.render(); }
  },

  async updateField(id, field, value) {
    const f = await Store.get('features', id);
    if (f) { f[field] = value; f.updated = new Date().toISOString(); await Store.put('features', f); }
  },

  async generatePrompt(id) {
    const f = await Store.get('features', id);
    if (!f) return;
    f.aiPrompt = AIPrompt.generate(f);
    f.updated = new Date().toISOString();
    await Store.put('features', f);
    this.render();
    Toast.show('AI Prompt generated! 🤖');
  },

  async copyPrompt(id) {
    const f = await Store.get('features', id);
    if (f) DOM.copy(f.aiPrompt || '');
  },

  async sendToImpl(id) {
    const f = await Store.get('features', id);
    if (!f) return;
    const existing = await Store.getAll('implementation', 'projectId', f.projectId);
    if (existing.find(i => i.featureId === id)) { Toast.show('Already in implementation', 'info'); return; }

    if (typeof Implementation !== 'undefined') {
      await Implementation.addFromFeature(f);
      f.status = 'implementing';
      f.updated = new Date().toISOString();
      await Store.put('features', f);
      if (f.sourceModuleId) {
        await ModuleRegistry.updateMeta(f.sourceModuleId, {
          status: 'implementation',
          linkedFeatureId: f.id
        });
      }
      this.render();
      Toast.show('→ Implementation! 🎯');
    }
  },

  async toImprovement(id) {
    const f = await Store.get('features', id);
    if (!f) return;

    const existing = await Store.getAll('improvements', 'projectId', f.projectId);
    const matched = existing.find(item =>
      item.sourceModuleId === f.sourceModuleId ||
      item.sourceFeatureId === f.id ||
      item.name.toLowerCase() === f.name.toLowerCase()
    );

    if (!matched) {
      await Store.put('improvements', {
        id: Store.generateId(),
        sourceModuleId: f.sourceModuleId || '',
        sourceFeatureId: f.id,
        projectId: f.projectId,
        name: f.name,
        why: f.description || `Refine ${f.name} before full integration.`,
        how: '',
        priority: f.priority || 3,
        status: 'open',
        created: new Date().toISOString()
      });
    }

    f.status = 'improving';
    f.updated = new Date().toISOString();
    await Store.put('features', f);

    if (f.sourceModuleId) {
      await ModuleRegistry.updateMeta(f.sourceModuleId, {
        status: 'improvement',
        linkedFeatureId: f.id
      });
    }

    if (typeof Improvements !== 'undefined') await Improvements.render();
    await this.render();
    App.updateCounts();
    Toast.show('Moved into improvements workflow.');
  },

  async remove(id) {
    if (!DOM.confirm('Remove this feature?')) return;
    await Store.delete('features', id);
    this.render();
    App.updateCounts();
  },

  _updateNav(features) {
    const nav = DOM.el('sideNav');
    if (!nav) return;
    const pc = { 1: '#ef4444', 2: '#f97316', 3: '#eab308', 4: '#22c55e', 5: '#3b82f6' };
    nav.innerHTML = features.map(f =>
      `<div class="side-nav-item" onclick="App.go('features');document.querySelector('[data-fid=\\'${f.id}\\']')?.scrollIntoView({behavior:'smooth',block:'center'})">
        <div class="side-nav-dot" style="background:${pc[f.priority] || '#999'}"></div>
        <span class="side-nav-label">${DOM.esc(f.name)}</span>
      </div>`
    ).join('');
  }
};
