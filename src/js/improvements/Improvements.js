/* ═══════════════════════════════════════════════════════════════
   Improvements — Track existing features that need improvement
   ═══════════════════════════════════════════════════════════════ */
const Improvements = {
  STATUS_LABELS: {
    open: 'Open',
    resolved: 'Resolved',
    archived: 'Archived'
  },

  async init() {
    await this.render();
    document.getElementById('addImprovementBtn')?.addEventListener('click', () => this.add());
    EventBus.on('project:switched', () => this.render());
  },

  async render() {
    const container = DOM.el('improvementGrid');
    if (!container || !App.currentProject) return;

    const items = await Store.getAll('improvements', 'projectId', App.currentProject.id);
    items.sort((a, b) => a.priority - b.priority);

    if (!items.length) {
      container.innerHTML = `<div class="empty-state">
        <div class="empty-state-icon">🌟</div>
        <div class="empty-state-text">All features are perfect! (or add improvements)</div>
      </div>`;
      return;
    }

    container.innerHTML = items.map(i => {
      const balls = [1, 2, 3, 4, 5].map(l =>
        `<div class="p-ball ${l <= i.priority ? 'active' : ''}" data-level="${l}"
              onclick="Improvements.setPriority('${i.id}',${l})"></div>`
      ).join('');

      return `<div class="card" style="border-left:4px solid var(--accent-gold);margin-bottom:10px">
        <div style="padding:14px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <span>🔧</span>
            <span style="font-weight:800;font-size:.92rem;flex:1">${DOM.esc(i.name)}</span>
            ${i.status ? `<span class="badge ${i.status === 'resolved' ? 'badge-green' : i.status === 'archived' ? 'badge-p5' : 'badge-gold'}">${this.STATUS_LABELS[i.status] || i.status}</span>` : ''}
            <div class="priority-balls">${balls}</div>
          </div>
          ${i.why ? `<div style="font-size:var(--font-size-sm);color:var(--text-secondary);padding:7px;background:var(--accent-gold-bg);border-radius:7px;margin-bottom:6px;border-left:3px solid var(--accent-gold)"><strong>Why:</strong> ${DOM.esc(i.why)}</div>` : ''}
          ${i.how ? `<div style="font-size:var(--font-size-sm);color:var(--accent-green);padding:7px;background:var(--accent-green-bg);border-radius:7px;border-left:3px solid var(--accent-green)"><strong>How:</strong> ${DOM.esc(i.how)}</div>` : ''}
          <div class="btn-row" style="margin-top:8px">
            <button class="btn btn-sm btn-green" onclick="Improvements.toImpl('${i.id}')">🎯 Implement</button>
            <button class="btn btn-sm btn-outline" onclick="Improvements.setStatus('${i.id}','resolved')">✅ Resolve</button>
            <button class="btn btn-sm btn-outline btn-danger" style="margin-left:auto" onclick="Improvements.remove('${i.id}')">🗑️</button>
          </div>
        </div>
      </div>`;
    }).join('');
  },

  async add() {
    const name = DOM.prompt('Feature to improve:');
    if (!name?.trim()) return;
    const why = DOM.prompt('Why?') || '';
    const how = DOM.prompt('How?') || '';

    await Store.put('improvements', {
      id: Store.generateId(),
      projectId: App.currentProject.id,
      name: name.trim(), why, how,
      priority: 3,
      status: 'open',
      created: new Date().toISOString()
    });

    this.render();
    App.updateCounts();
    Toast.show('Improvement added! 🔧');
  },

  async setPriority(id, level) {
    const i = await Store.get('improvements', id);
    if (i) { i.priority = level; await Store.put('improvements', i); this.render(); }
  },

  async toImpl(id) {
    const i = await Store.get('improvements', id);
    if (!i) return;
    if (typeof Implementation !== 'undefined') {
      await Implementation.addFromFeature({
        id: i.id,
        improvementId: i.id,
        sourceModuleId: i.sourceModuleId || '',
        sourceType: 'improvement',
        name: '🔧 ' + i.name,
        priority: i.priority,
        checklist: i.checklist || [],
        description: (i.why ? 'Why: ' + i.why + '\n' : '') + (i.how ? 'How: ' + i.how : ''),
        category: 'improvement'
      });
      i.status = 'open';
      await Store.put('improvements', i);
      if (i.sourceModuleId) {
        await ModuleRegistry.updateMeta(i.sourceModuleId, {
          status: 'implementation',
          linkedImprovementId: i.id
        });
      }
      Toast.show('→ Implementation! 🎯');
    }
  },

  async setStatus(id, status) {
    const item = await Store.get('improvements', id);
    if (!item) return;
    item.status = status;
    await Store.put('improvements', item);
    if (item.sourceFeatureId) {
      const feature = await Store.get('features', item.sourceFeatureId);
      if (feature) {
        feature.status = status === 'resolved' ? 'done' : status === 'archived' ? 'archived' : 'improving';
        feature.updated = new Date().toISOString();
        await Store.put('features', feature);
      }
    }
    if (item.sourceModuleId) {
      const moduleStatus = status === 'resolved' ? 'done' : status === 'archived' ? 'archived' : 'improvement';
      await ModuleRegistry.updateMeta(item.sourceModuleId, {
        status: moduleStatus,
        linkedImprovementId: item.id
      });
    }
    this.render();
  },

  async remove(id) {
    await Store.delete('improvements', id);
    this.render();
    App.updateCounts();
  }
};
