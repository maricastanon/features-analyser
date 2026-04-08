const CommentReactions = {
  container: null,
  comments: [],
  nextId: 1,
  currentUser: 'You',
  emojis: ['\u{1F44D}', '\u2764\uFE0F', '\u{1F602}', '\u{1F389}', '\u{1F914}', '\u{1F440}'],
  openPickerId: null,
  hoverReaction: null,

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.render();
  },

  _esc(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  },

  _initials(name) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  },

  _mostReactedId() {
    let maxCount = 0;
    let maxId = null;
    for (const c of this.comments) {
      let total = 0;
      for (const emoji of this.emojis) {
        total += (c.reactions[emoji] || []).length;
      }
      if (total > maxCount) { maxCount = total; maxId = c.id; }
    }
    return maxCount > 0 ? maxId : null;
  },

  render() {
    const mostReacted = this._mostReactedId();
    this.container.innerHTML = `
      <div class="cr-panel">
        <div class="cr-header">
          <h3 class="cr-title">Comments &amp; Reactions</h3>
        </div>
        <div class="cr-compose">
          <textarea class="cr-textarea" id="cr-input" placeholder="Write a comment..." rows="2"></textarea>
          <button class="cr-btn cr-btn-primary" data-action="post">Post</button>
        </div>
        <div class="cr-list">
          ${this.comments.length === 0 ? '<p class="cr-empty">No comments yet.</p>' :
            [...this.comments].sort((a, b) => b.date - a.date).map(c =>
              this._renderComment(c, c.id === mostReacted)
            ).join('')}
        </div>
      </div>`;
    this._bind();
  },

  _renderComment(c, isTop) {
    const reactionHtml = this.emojis.map(emoji => {
      const users = c.reactions[emoji] || [];
      if (users.length === 0) return '';
      const active = users.includes(this.currentUser);
      const tooltip = users.join(', ');
      return `<button class="cr-reaction-btn ${active ? 'cr-reaction-active' : ''}"
        data-action="toggle-reaction" data-id="${c.id}" data-emoji="${emoji}"
        title="${this._esc(tooltip)}">
        ${emoji} <span class="cr-reaction-count">${users.length}</span>
      </button>`;
    }).join('');

    return `<div class="cr-comment ${isTop ? 'cr-most-reacted' : ''}" data-id="${c.id}">
      ${isTop ? '<div class="cr-top-badge">Most Reacted</div>' : ''}
      <div class="cr-comment-row">
        <div class="cr-avatar">${this._initials(c.author)}</div>
        <div class="cr-comment-body">
          <div class="cr-comment-meta">
            <span class="cr-author">${this._esc(c.author)}</span>
            <span class="cr-time">${new Date(c.date).toLocaleString()}</span>
          </div>
          <div class="cr-comment-text">${this._esc(c.text)}</div>
        </div>
        ${c.author === this.currentUser ? `<button class="cr-btn cr-btn-sm cr-btn-ghost cr-btn-del" data-action="delete" data-id="${c.id}">\u2715</button>` : ''}
      </div>
      <div class="cr-reactions-bar">
        ${reactionHtml}
        <div class="cr-add-reaction-wrap">
          <button class="cr-btn cr-btn-sm cr-btn-ghost" data-action="open-picker" data-id="${c.id}">+ React</button>
          ${this.openPickerId === c.id ? this._renderPicker(c.id) : ''}
        </div>
      </div>
    </div>`;
  },

  _renderPicker(commentId) {
    return `<div class="cr-picker">
      ${this.emojis.map(emoji => `
        <button class="cr-picker-emoji" data-action="pick-emoji" data-id="${commentId}" data-emoji="${emoji}">
          ${emoji}
        </button>`).join('')}
    </div>`;
  },

  _bind() {
    this.container.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) { this.openPickerId = null; this._closePickers(); return; }
      const action = btn.dataset.action;
      const id = Number(btn.dataset.id);
      const emoji = btn.dataset.emoji;

      if (action === 'post') this._post();
      else if (action === 'delete') { this.comments = this.comments.filter(c => c.id !== id); this.render(); }
      else if (action === 'open-picker') {
        e.stopPropagation();
        this.openPickerId = this.openPickerId === id ? null : id;
        this.render();
      }
      else if (action === 'pick-emoji' || action === 'toggle-reaction') {
        e.stopPropagation();
        this._toggleReaction(id, emoji);
      }
    });

    const input = this.container.querySelector('#cr-input');
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); this._post(); }
      });
    }
  },

  _closePickers() {
    const pickers = this.container.querySelectorAll('.cr-picker');
    pickers.forEach(p => p.remove());
  },

  _post() {
    const el = this.container.querySelector('#cr-input');
    const text = el ? el.value.trim() : '';
    if (!text) return;
    const reactions = {};
    this.emojis.forEach(e => reactions[e] = []);
    this.comments.push({
      id: this.nextId++,
      author: this.currentUser,
      text,
      date: Date.now(),
      reactions
    });
    this.render();
  },

  _toggleReaction(commentId, emoji) {
    const c = this.comments.find(x => x.id === commentId);
    if (!c) return;
    if (!c.reactions[emoji]) c.reactions[emoji] = [];
    const idx = c.reactions[emoji].indexOf(this.currentUser);
    if (idx >= 0) c.reactions[emoji].splice(idx, 1);
    else c.reactions[emoji].push(this.currentUser);
    this.openPickerId = null;
    this.render();
  },

  exportState() {
    return { comments: this.comments, nextId: this.nextId, currentUser: this.currentUser };
  },

  importState(state) {
    if (!state) return;
    this.comments = state.comments || [];
    this.nextId = state.nextId || 1;
    this.currentUser = state.currentUser || 'You';
    this.openPickerId = null;
    this.render();
  }
};
