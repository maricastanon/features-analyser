/* ═══════════════════════════════════════════════
   FEATURE: Feedback Board — Universal Module
   Collect, categorize, and prioritize user feedback.
   Works for ANY app's user feedback pipeline.
   ═══════════════════════════════════════════════ */
const FeatFeedbackBoard = {
  items: [],
  filter: 'all',
  sort: 'votes',

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this._seed();
    this.render();
  },

  _seed() {
    this.items = [
      { id: 1, title: 'Add keyboard shortcuts', body: 'Power users need keyboard navigation for speed.', author: 'Mari T.', category: 'feature', votes: 42, status: 'planned', comments: 8 },
      { id: 2, title: 'Dark mode flickers on load', body: 'Brief white flash before dark theme applies.', author: 'Alex R.', category: 'bug', votes: 31, status: 'in-progress', comments: 12 },
      { id: 3, title: 'Export to Notion', body: 'Integration with Notion for seamless workflow.', author: 'Chen W.', category: 'integration', votes: 28, status: 'considering', comments: 5 },
      { id: 4, title: 'Mobile app crashes on Android 14', body: 'App force closes when opening settings.', author: 'Sam K.', category: 'bug', votes: 19, status: 'in-progress', comments: 15 },
      { id: 5, title: 'Weekly summary email', body: 'Opt-in email digest of project activity.', author: 'Eva J.', category: 'feature', votes: 15, status: 'considering', comments: 3 },
      { id: 6, title: 'Improve onboarding flow', body: 'First-time users are confused by the wizard steps.', author: 'Bob L.', category: 'ux', votes: 23, status: 'planned', comments: 7 }
    ];
  },

  render() {
    const catConfig = { feature:'#22c55e', bug:'#ef4444', integration:'#3b82f6', ux:'#a855f7' };
    const statusConfig = { considering:'#5a8a60', planned:'#3b82f6', 'in-progress':'#f97316', done:'#22c55e' };
    let items = this.filter === 'all' ? [...this.items] : this.items.filter(i => i.category === this.filter);
    items.sort((a,b) => this.sort === 'votes' ? b.votes - a.votes : b.comments - a.comments);

    this.container.innerHTML = `
    <div class="feat-fb-wrap">
      <div class="fb-header">
        <h3 style="color:#e91e90;margin:0;font-size:1rem">💬 Feedback Board</h3>
        <span style="font-size:0.72rem;color:#5a8a60">${this.items.length} items • ${this.items.reduce((s,i)=>s+i.votes,0)} total votes</span>
        <button class="fb-btn fb-btn-pink" onclick="FeatFeedbackBoard.addItem()">+ Submit Feedback</button>
      </div>
      <div class="fb-controls">
        <div class="fb-filters">
          <button class="fb-filter ${this.filter==='all'?'active':''}" onclick="FeatFeedbackBoard.setFilter('all')">All</button>
          ${Object.entries(catConfig).map(([k,c]) => `<button class="fb-filter ${this.filter===k?'active':''}"
            onclick="FeatFeedbackBoard.setFilter('${k}')" style="${this.filter===k?`color:${c}`:''}">${k}</button>`).join('')}
        </div>
        <div class="fb-sort">
          Sort: <button class="fb-sort-btn ${this.sort==='votes'?'active':''}" onclick="FeatFeedbackBoard.setSort('votes')">🔥 Votes</button>
          <button class="fb-sort-btn ${this.sort==='comments'?'active':''}" onclick="FeatFeedbackBoard.setSort('comments')">💬 Comments</button>
        </div>
      </div>
      <div class="fb-list">
        ${items.map(item => `
          <div class="fb-item">
            <div class="fb-vote-col">
              <button class="fb-upvote" onclick="FeatFeedbackBoard.upvote(${item.id})">▲</button>
              <span class="fb-vote-count">${item.votes}</span>
            </div>
            <div class="fb-item-body">
              <div class="fb-item-top">
                <span class="fb-cat" style="background:${catConfig[item.category]}22;color:${catConfig[item.category]}">${item.category}</span>
                <span class="fb-status" style="color:${statusConfig[item.status]}">${item.status}</span>
              </div>
              <div class="fb-item-title">${this._esc(item.title)}</div>
              <div class="fb-item-desc">${this._esc(item.body)}</div>
              <div class="fb-item-meta">
                <span>👤 ${this._esc(item.author)}</span>
                <span>💬 ${item.comments} comments</span>
              </div>
            </div>
          </div>`).join('')}
      </div>
    </div>`;
  },

  setFilter(f) { this.filter = f; this.render(); },
  setSort(s) { this.sort = s; this.render(); },
  upvote(id) { const item = this.items.find(i => i.id === id); if (item) { item.votes++; this.render(); } },

  addItem() {
    const title = prompt('Feedback title:');
    if (!title?.trim()) return;
    const body = prompt('Description:');
    const category = prompt('Category (feature/bug/integration/ux):', 'feature');
    this.items.push({
      id: Date.now(), title: title.trim(), body: body?.trim() || '', author: 'You',
      category: category || 'feature', votes: 1, status: 'considering', comments: 0
    });
    this.render();
  },

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },
  exportState() { return { items: this.items }; },
  importState(s) { if (s.items) this.items = s.items; this.render(); }
};
