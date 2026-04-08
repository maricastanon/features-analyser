/* ═══════════════════════════════════════════════════════════════
   ProjectSwitcher — Multi-project dropdown in header
   ═══════════════════════════════════════════════════════════════ */
const ProjectSwitcher = {
  async init() {
    await this.render();
  },

  async render() {
    const slot = DOM.el('projectSwitcherSlot');
    if (!slot) return;

    const projects = await Store.getAll('projects');
    const activeId = App.currentProject ? App.currentProject.id : null;

    if (projects.length === 0) {
      slot.innerHTML = `<button class="btn btn-sm btn-pink" onclick="ProjectConfig.showWizard()">🌟 Create First Project</button>`;
      return;
    }

    const options = projects.map(p =>
      `<option value="${p.id}" ${p.id === activeId ? 'selected' : ''}>${DOM.esc(p.name)}</option>`
    ).join('');

    slot.innerHTML = `
      <select class="select" style="padding:3px 8px;font-size:var(--font-size-xs);min-width:120px"
              onchange="ProjectSwitcher.onSwitch(this.value)">
        ${options}
      </select>
      <button class="btn btn-sm btn-outline" onclick="ProjectConfig.showWizard()" title="New Project" style="padding:3px 7px">+</button>
      <button class="btn btn-sm btn-outline" onclick="ProjectSwitcher.editCurrent()" title="Edit Project" style="padding:3px 7px">⚙️</button>
    `;
  },

  async onSwitch(projectId) {
    await App.switchProject(projectId, { explicit: true });
    this.render();
  },

  async editCurrent() {
    if (App.currentProject) {
      const fresh = await Store.get('projects', App.currentProject.id);
      ProjectConfig.showWizard(fresh);
    }
  }
};
