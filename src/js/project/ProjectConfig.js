/* ═══════════════════════════════════════════════════════════════
   ProjectConfig — Project profile CRUD + setup wizard
   Defines: name, stack, theme, file structure, categories, etc.
   ═══════════════════════════════════════════════════════════════ */
const ProjectConfig = {
  _editing: null,

  DEFAULT_PROJECT: {
    name: 'My App',
    description: '',
    stack: ['vanilla-js', 'css'],
    theme: {
      primary: '#e91e90',
      secondary: '#4caf50',
      bgDeep: '#0a1a10',
      bgCard: '#122b1e',
      bgSurface: '#163224',
      borderSoft: '#1a3d28',
      textPrimary: '#e8f5e9',
      textMuted: '#5a8a60',
      fontFamily: "'Nunito', 'Calibri', system-ui, sans-serif",
      fontSize: '0.88rem',
      mode: 'dark'
    },
    fileStructure: `project/
├── index.html
├── css/
│   ├── vars.css
│   └── [feature].css
├── js/
│   ├── app.js
│   └── [feature].js
└── python/
    └── [algorithm].py`,
    modulePattern: `const FeatureName = {
  _state: null,
  init() { this._load(); this.render(); },
  render() {
    const el = document.getElementById('featureContainer');
    if (!el) return;
    el.innerHTML = '...';
  },
  _save() { localStorage.setItem('feature_data', JSON.stringify(this._data)); },
  _load() { this._data = JSON.parse(localStorage.getItem('feature_data') || '{}'); }
};`,
    aiPromptTemplate: `## Feature Implementation Request

**Feature:** {{name}}
**Category:** {{categoryEmoji}} {{categoryName}}
**Priority:** {{priorityLabel}}
**Description:** {{description}}

### Architecture
Create TWO files:
1. \`js/{{slug}}.js\` — Module following project pattern
2. \`css/{{slug}}.css\` — Styles using CSS variables

### Theme
{{themeVars}}

### Integration
{{integrationSteps}}`,
    pythonDir: 'python/',
    categories: [
      { id: 'core',        name: 'Core',        emoji: '⚡', color: '#ef4444' },
      { id: 'ui',          name: 'UI/UX',       emoji: '🎨', color: '#f97316' },
      { id: 'data',        name: 'Data',        emoji: '📊', color: '#eab308' },
      { id: 'integration', name: 'Integration', emoji: '🔗', color: '#22c55e' },
      { id: 'ai',          name: 'AI',          emoji: '🤖', color: '#3b82f6' },
      { id: 'custom',      name: 'Custom',      emoji: '✨', color: '#a855f7' }
    ]
  },

  async showWizard(existingProject = null) {
    this._editing = existingProject
      ? JSON.parse(JSON.stringify(existingProject))
      : { ...JSON.parse(JSON.stringify(this.DEFAULT_PROJECT)), id: Store.generateId(), created: new Date().toISOString() };
    const isNew = !existingProject;
    const p = this._editing;

    const html = `
    <div class="modal-header">
      <h3 class="modal-title">${isNew ? '🌟 New Project' : '⚙️ Edit Project'}</h3>
      <button class="modal-close" onclick="ProjectConfig.closeModal()">✕</button>
    </div>
    <div class="modal-body" style="max-height:65vh;overflow-y:auto">
      <div style="margin-bottom:var(--sp-4)">
        <label class="field-label"><span class="dot"></span> Project Name</label>
        <input class="input" id="pcName" value="${DOM.esc(p.name)}" placeholder="My Amazing App">
      </div>
      <div style="margin-bottom:var(--sp-4)">
        <label class="field-label"><span class="dot"></span> Description</label>
        <textarea class="textarea" id="pcDesc" rows="2" placeholder="What is this app?">${DOM.esc(p.description)}</textarea>
      </div>
      <div style="margin-bottom:var(--sp-4)">
        <label class="field-label"><span class="dot"></span> Tech Stack (comma-separated)</label>
        <input class="input" id="pcStack" value="${p.stack.join(', ')}" placeholder="vanilla-js, css, python, aws">
      </div>

      <!-- Theme Colors -->
      <div style="margin-bottom:var(--sp-4)">
        <label class="field-label pink"><span class="dot"></span> Theme Colors</label>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px">
          ${this._colorInput('Primary Accent', 'pcPrimary', p.theme.primary)}
          ${this._colorInput('Secondary', 'pcSecondary', p.theme.secondary)}
          ${this._colorInput('Background Deep', 'pcBgDeep', p.theme.bgDeep)}
          ${this._colorInput('Card Background', 'pcBgCard', p.theme.bgCard)}
          ${this._colorInput('Surface', 'pcBgSurface', p.theme.bgSurface)}
          ${this._colorInput('Border', 'pcBorder', p.theme.borderSoft)}
          ${this._colorInput('Text Primary', 'pcTextPri', p.theme.textPrimary)}
          ${this._colorInput('Text Muted', 'pcTextMuted', p.theme.textMuted)}
        </div>
      </div>

      <!-- Font Family -->
      <div style="margin-bottom:var(--sp-4)">
        <label class="field-label"><span class="dot"></span> Font Family</label>
        <select class="select" id="pcFont" style="width:100%">
          ${this._fontOptions(p.theme.fontFamily)}
        </select>
      </div>

      <!-- Base Font Size -->
      <div style="margin-bottom:var(--sp-4)">
        <label class="field-label"><span class="dot"></span> Base Font Size</label>
        <div style="display:flex;align-items:center;gap:8px">
          <input type="range" id="pcFontSize" min="0.7" max="1.2" step="0.02" value="${parseFloat(p.theme.fontSize) || 0.88}"
                 style="flex:1;accent-color:var(--accent-pink)"
                 oninput="document.getElementById('pcFontSizeVal').textContent=this.value+'rem'">
          <span id="pcFontSizeVal" style="font-size:var(--font-size-sm);min-width:55px;font-family:var(--font-mono)">${p.theme.fontSize || '0.88rem'}</span>
        </div>
      </div>

      <!-- Categories -->
      <div style="margin-bottom:var(--sp-4)">
        <label class="field-label"><span class="dot"></span> Feature Categories</label>
        <div id="pcCategories">${this._renderCategories(p.categories)}</div>
        <button class="btn btn-sm btn-outline" style="margin-top:6px" onclick="ProjectConfig.addCategory()">+ Add Category</button>
      </div>

      <!-- File Structure -->
      <div style="margin-bottom:var(--sp-4)">
        <label class="field-label"><span class="dot"></span> File Structure Template</label>
        <textarea class="textarea" id="pcFileStruct" rows="6" style="font-family:var(--font-mono);font-size:var(--font-size-sm)">${DOM.esc(p.fileStructure)}</textarea>
      </div>

      <!-- Module Pattern -->
      <div style="margin-bottom:var(--sp-4)">
        <label class="field-label"><span class="dot"></span> Module Code Pattern</label>
        <textarea class="textarea" id="pcModPattern" rows="8" style="font-family:var(--font-mono);font-size:var(--font-size-sm)">${DOM.esc(p.modulePattern)}</textarea>
      </div>

      <!-- AI Prompt Template -->
      <div style="margin-bottom:var(--sp-4)">
        <label class="field-label pink"><span class="dot"></span> AI Prompt Template</label>
        <div style="font-size:var(--font-size-xs);color:var(--text-muted);margin-bottom:4px">
          Placeholders: {{name}}, {{slug}}, {{description}}, {{categoryEmoji}}, {{categoryName}}, {{priorityLabel}}, {{themeVars}}, {{integrationSteps}}
        </div>
        <textarea class="textarea" id="pcPromptTpl" rows="8" style="font-family:var(--font-mono);font-size:var(--font-size-sm)">${DOM.esc(p.aiPromptTemplate)}</textarea>
      </div>

      <!-- Python Dir -->
      <div style="margin-bottom:var(--sp-4)">
        <label class="field-label"><span class="dot"></span> Python Scripts Directory</label>
        <input class="input" id="pcPyDir" value="${DOM.esc(p.pythonDir)}" placeholder="python/">
      </div>

      ${existingProject ? `<div style="margin-top:var(--sp-6);padding-top:var(--sp-4);border-top:1px solid var(--border-soft)">
        <button class="btn btn-sm btn-outline btn-danger" onclick="ProjectConfig.deleteProject('${existingProject.id}')">🗑️ Delete Project</button>
      </div>` : ''}
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="ProjectConfig.closeModal()">Cancel</button>
      <button class="btn btn-pink" onclick="ProjectConfig.save()">💾 ${isNew ? 'Create Project' : 'Save Changes'}</button>
    </div>`;

    DOM.setHTML('modalContent', html);
    document.getElementById('modalOverlay').classList.add('active');
  },

  _colorInput(label, id, value) {
    return `<div style="display:flex;flex-direction:column;gap:3px">
      <label style="font-size:var(--font-size-xs);color:var(--text-muted)">${label}</label>
      <div style="display:flex;align-items:center;gap:4px">
        <input type="color" id="${id}" value="${value}"
               style="width:32px;height:26px;border:2px solid var(--border-soft);border-radius:6px;cursor:pointer;background:none;padding:1px">
        <input class="input" value="${value}" style="width:80px;padding:4px 6px;font-size:var(--font-size-xs);font-family:var(--font-mono)"
               oninput="document.getElementById('${id}').value=this.value">
      </div>
    </div>`;
  },

  _fontOptions(current) {
    const fonts = [
      { label: 'Nunito',          val: "'Nunito', 'Calibri', system-ui, sans-serif" },
      { label: 'Calibri',         val: "'Calibri', 'Segoe UI', system-ui, sans-serif" },
      { label: 'Inter',           val: "'Inter', system-ui, sans-serif" },
      { label: 'Roboto',          val: "'Roboto', system-ui, sans-serif" },
      { label: 'Poppins',         val: "'Poppins', system-ui, sans-serif" },
      { label: 'Open Sans',       val: "'Open Sans', system-ui, sans-serif" },
      { label: 'Lato',            val: "'Lato', system-ui, sans-serif" },
      { label: 'Source Sans Pro', val: "'Source Sans Pro', system-ui, sans-serif" },
      { label: 'JetBrains Mono',  val: "'JetBrains Mono', monospace" },
      { label: 'System Default',  val: "system-ui, sans-serif" },
      { label: 'Georgia (serif)', val: "'Georgia', serif" },
      { label: 'Courier New',     val: "'Courier New', monospace" }
    ];
    return fonts.map(f =>
      `<option value="${f.val}" ${f.val === current ? 'selected' : ''}>${f.label}</option>`
    ).join('');
  },

  _renderCategories(cats) {
    return cats.map((c, i) => `
      <div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid var(--border-soft)">
        <input style="width:28px;font-size:1rem;text-align:center;background:none;border:none;color:var(--text-primary)" value="${c.emoji}"
               onchange="ProjectConfig._updCat(${i},'emoji',this.value)">
        <input class="input" style="flex:1;padding:4px 8px" value="${DOM.esc(c.name)}"
               onchange="ProjectConfig._updCat(${i},'name',this.value)">
        <input type="color" value="${c.color}" style="width:28px;height:22px;border:1px solid var(--border-soft);border-radius:4px;cursor:pointer;background:none"
               onchange="ProjectConfig._updCat(${i},'color',this.value)">
        <button class="btn btn-sm btn-danger" onclick="ProjectConfig.rmCategory(${i})" style="padding:2px 6px">✕</button>
      </div>
    `).join('');
  },

  _updCat(idx, field, value) {
    if (this._editing && this._editing.categories[idx]) {
      this._editing.categories[idx][field] = value;
    }
  },

  addCategory() {
    if (!this._editing) return;
    const name = DOM.prompt('Category name:', 'New Category');
    if (!name) return;
    this._editing.categories.push({
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name, emoji: '📦', color: '#6366f1'
    });
    DOM.setHTML('pcCategories', this._renderCategories(this._editing.categories));
  },

  rmCategory(idx) {
    if (!this._editing) return;
    this._editing.categories.splice(idx, 1);
    DOM.setHTML('pcCategories', this._renderCategories(this._editing.categories));
  },

  async save() {
    const p = this._editing;
    if (!p) return;

    p.name = document.getElementById('pcName').value.trim() || 'Untitled';
    p.description = document.getElementById('pcDesc').value.trim();
    p.stack = document.getElementById('pcStack').value.split(',').map(s => s.trim()).filter(Boolean);
    p.theme = {
      primary:     document.getElementById('pcPrimary').value,
      secondary:   document.getElementById('pcSecondary').value,
      bgDeep:      document.getElementById('pcBgDeep').value,
      bgCard:      document.getElementById('pcBgCard').value,
      bgSurface:   document.getElementById('pcBgSurface').value,
      borderSoft:  document.getElementById('pcBorder').value,
      textPrimary: document.getElementById('pcTextPri').value,
      textMuted:   document.getElementById('pcTextMuted').value,
      fontFamily:  document.getElementById('pcFont').value,
      fontSize:    document.getElementById('pcFontSize').value + 'rem',
      mode: Theme.getMode()
    };
    p.fileStructure = document.getElementById('pcFileStruct').value;
    p.modulePattern = document.getElementById('pcModPattern').value;
    p.aiPromptTemplate = document.getElementById('pcPromptTpl').value;
    p.pythonDir = document.getElementById('pcPyDir').value.trim() || 'python/';
    p.updated = new Date().toISOString();

    await Store.put('projects', p);
    this.closeModal();

    if (App.currentProject && App.currentProject.id === p.id) {
      App.currentProject = p;
      await Theme.applyProjectTheme(p);
    }

    EventBus.emit('project:updated', p);
    Toast.show('Project saved! 💾');

    if (!App.currentProject) {
      await App.switchProject(p.id);
    }

    if (typeof ProjectSwitcher !== 'undefined') ProjectSwitcher.render();
  },

  closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    this._editing = null;
  },

  async deleteProject(id) {
    if (!DOM.confirm('Delete this project and ALL its data?')) return;
    const stores = ['features', 'improvements', 'implementation', 'modules'];
    for (const storeName of stores) {
      const items = await Store.getAll(storeName, 'projectId', id);
      for (const item of items) await Store.delete(storeName, item.id);
    }
    await Store.delete('projects', id);
    this.closeModal();

    if (App.currentProject && App.currentProject.id === id) {
      const remaining = await Store.getAll('projects');
      if (remaining.length > 0) await App.switchProject(remaining[0].id);
      else {
        App.currentProject = null;
        await Store.setSetting('activeProject', null);
        if (typeof ProjectSwitcher !== 'undefined') ProjectSwitcher.render();
      }
    }
    Toast.show('Project deleted');
  }
};
