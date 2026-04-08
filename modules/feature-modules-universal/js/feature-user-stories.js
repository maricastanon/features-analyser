/* ═══════════════════════════════════════════════
   FEATURE: User Story Board — Universal Module
   Write user stories with acceptance criteria,
   story points, and persona mapping.
   ═══════════════════════════════════════════════ */
const FeatUserStories = {
  stories: [],
  personas: [],
  filter: 'all',

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this._seed();
    this.render();
  },

  _seed() {
    this.personas = [
      { id: 'admin', name: 'Admin', emoji: '👑', color: '#e91e90' },
      { id: 'user', name: 'End User', emoji: '👤', color: '#22c55e' },
      { id: 'dev', name: 'Developer', emoji: '💻', color: '#3b82f6' }
    ];
    this.stories = [
      { id: 1, persona: 'user', action: 'filter search results by date', goal: 'find recent content quickly',
        points: 3, priority: 'high', status: 'accepted',
        criteria: ['Date picker appears in search panel','Results update on selection','Default is "all time"'] },
      { id: 2, persona: 'admin', action: 'export user activity logs', goal: 'comply with audit requirements',
        points: 5, priority: 'critical', status: 'in-progress',
        criteria: ['CSV and PDF export options','Date range selector','Includes login/action events'] },
      { id: 3, persona: 'dev', action: 'access API documentation inline', goal: 'reduce context switching',
        points: 2, priority: 'medium', status: 'backlog',
        criteria: ['Hover tooltip shows endpoint details','Link to full docs page','Shows request/response examples'] },
      { id: 4, persona: 'user', action: 'receive push notifications for updates', goal: 'stay informed without checking manually',
        points: 8, priority: 'high', status: 'backlog',
        criteria: ['Browser push notification permission','Configurable notification types','Mute/schedule options'] }
    ];
  },

  render() {
    const filtered = this.filter === 'all' ? this.stories : this.stories.filter(s => s.persona === this.filter);
    const totalPoints = this.stories.reduce((s,st) => s + st.points, 0);
    const priorityColors = { critical:'#ef4444', high:'#f97316', medium:'#eab308', low:'#22c55e' };

    this.container.innerHTML = `
    <div class="feat-us-wrap">
      <div class="us-header">
        <h3 style="color:#e91e90;margin:0;font-size:1rem">📖 User Stories</h3>
        <span class="us-points-total">${totalPoints} SP total</span>
        <button class="us-btn us-btn-pink" onclick="FeatUserStories.addStory()">+ Add Story</button>
      </div>
      <div class="us-filters">
        <button class="us-filter ${this.filter==='all'?'active':''}" onclick="FeatUserStories.setFilter('all')">All</button>
        ${this.personas.map(p => `<button class="us-filter ${this.filter===p.id?'active':''}"
          onclick="FeatUserStories.setFilter('${p.id}')" style="${this.filter===p.id?`border-color:${p.color}`:''}">${p.emoji} ${p.name}</button>`).join('')}
      </div>
      <div class="us-stories">
        ${filtered.map(s => {
          const p = this.personas.find(pp => pp.id === s.persona) || this.personas[0];
          return `
          <div class="us-card" style="border-left:3px solid ${p.color}">
            <div class="us-card-top">
              <span class="us-persona" style="color:${p.color}">${p.emoji} ${p.name}</span>
              <span class="us-sp">${s.points} SP</span>
              <span class="us-priority" style="background:${priorityColors[s.priority]}22;color:${priorityColors[s.priority]}">${s.priority}</span>
              <span class="us-status us-status-${s.status}">${s.status}</span>
            </div>
            <div class="us-story-text">
              As a <b>${p.name}</b>, I want to <b>${this._esc(s.action)}</b>,<br>
              so that I can <b>${this._esc(s.goal)}</b>.
            </div>
            <div class="us-criteria">
              <div class="us-criteria-title">Acceptance Criteria:</div>
              ${s.criteria.map((c,i) => `<div class="us-criterion">
                <input type="checkbox" ${s.status==='accepted'?'checked':''} onchange="FeatUserStories.toggleCriterion(${s.id},${i})">
                <span>${this._esc(c)}</span>
              </div>`).join('')}
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  },

  setFilter(f) { this.filter = f; this.render(); },

  addStory() {
    const action = prompt('As a user, I want to...');
    if (!action?.trim()) return;
    const goal = prompt('So that I can...');
    this.stories.push({
      id: Date.now(), persona: 'user', action: action.trim(), goal: goal?.trim() || 'achieve my goal',
      points: 3, priority: 'medium', status: 'backlog', criteria: ['TBD']
    });
    this.render();
  },

  toggleCriterion(storyId, idx) {
    // Visual toggle only in this mockup
  },

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },
  exportState() { return { stories: this.stories, personas: this.personas }; },
  importState(s) { if (s.stories) this.stories = s.stories; this.render(); }
};
