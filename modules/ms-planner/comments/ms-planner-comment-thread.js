const CommentThread = {
  container: null,
  comments: [],
  nextId: 1,
  currentUser: 'You',
  sortNewest: true,
  editingId: null,

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

  _timeAgo(ts) {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return mins + 'm ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    const days = Math.floor(hrs / 24);
    return days + 'd ago';
  },

  _sorted() {
    const list = [...this.comments];
    return this.sortNewest ? list.sort((a, b) => b.date - a.date) : list.sort((a, b) => a.date - b.date);
  },

  render() {
    const sorted = this._sorted();
    this.container.innerHTML = `
      <div class="ct-panel">
        <div class="ct-header">
          <h3 class="ct-title">Comments (${this.comments.length})</h3>
          <button class="ct-btn ct-sort-btn" data-action="toggle-sort">
            ${this.sortNewest ? 'Newest first \u2193' : 'Oldest first \u2191'}
          </button>
        </div>
        <div class="ct-compose">
          <div class="ct-avatar ct-avatar-compose">${this._initials(this.currentUser)}</div>
          <textarea class="ct-textarea" id="ct-new-comment" placeholder="Write a comment..." rows="3"></textarea>
          <button class="ct-btn ct-btn-primary ct-send-btn" data-action="post">Send</button>
        </div>
        <div class="ct-list">
          ${sorted.length === 0 ? '<p class="ct-empty">No comments yet. Start the conversation!</p>' : sorted.map(c => this._renderComment(c)).join('')}
        </div>
      </div>`;
    this._bind();
  },

  _renderComment(c) {
    const isOwn = c.author === this.currentUser;
    if (this.editingId === c.id) {
      return `<div class="ct-comment ct-editing" data-id="${c.id}">
        <div class="ct-avatar">${this._initials(c.author)}</div>
        <div class="ct-comment-body">
          <div class="ct-comment-meta">
            <span class="ct-author">${this._esc(c.author)}</span>
            <span class="ct-time">${this._timeAgo(c.date)}</span>
          </div>
          <textarea class="ct-textarea ct-edit-textarea" id="ct-edit-text">${this._esc(c.text)}</textarea>
          <div class="ct-edit-actions">
            <button class="ct-btn ct-btn-primary ct-btn-sm" data-action="save-edit" data-id="${c.id}">Save</button>
            <button class="ct-btn ct-btn-sm" data-action="cancel-edit">Cancel</button>
          </div>
        </div>
      </div>`;
    }
    return `<div class="ct-comment" data-id="${c.id}">
      <div class="ct-avatar">${this._initials(c.author)}</div>
      <div class="ct-comment-body">
        <div class="ct-comment-meta">
          <span class="ct-author">${this._esc(c.author)}</span>
          <span class="ct-time">${this._timeAgo(c.date)}</span>
          ${c.edited ? '<span class="ct-edited">(edited)</span>' : ''}
        </div>
        <div class="ct-comment-text">${this._esc(c.text)}</div>
        ${isOwn ? `<div class="ct-comment-actions">
          <button class="ct-btn ct-btn-sm ct-btn-ghost" data-action="edit" data-id="${c.id}">Edit</button>
          <button class="ct-btn ct-btn-sm ct-btn-ghost ct-btn-del" data-action="delete" data-id="${c.id}">Delete</button>
        </div>` : ''}
      </div>
    </div>`;
  },

  _bind() {
    this.container.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      const id = Number(btn.dataset.id);
      if (action === 'post') this._post();
      else if (action === 'toggle-sort') { this.sortNewest = !this.sortNewest; this.render(); }
      else if (action === 'edit') { this.editingId = id; this.render(); }
      else if (action === 'cancel-edit') { this.editingId = null; this.render(); }
      else if (action === 'save-edit') this._saveEdit(id);
      else if (action === 'delete') { this.comments = this.comments.filter(c => c.id !== id); this.render(); }
    });
    const textarea = this.container.querySelector('#ct-new-comment');
    if (textarea) {
      textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); this._post(); }
      });
    }
  },

  _post() {
    const el = this.container.querySelector('#ct-new-comment');
    const text = el ? el.value.trim() : '';
    if (!text) return;
    this.comments.push({
      id: this.nextId++,
      author: this.currentUser,
      text,
      date: Date.now(),
      edited: false
    });
    this.render();
  },

  _saveEdit(id) {
    const c = this.comments.find(x => x.id === id);
    if (!c) return;
    const text = this.container.querySelector('#ct-edit-text').value.trim();
    if (!text) return;
    c.text = text;
    c.edited = true;
    this.editingId = null;
    this.render();
  },

  exportState() {
    return { comments: this.comments, nextId: this.nextId, currentUser: this.currentUser, sortNewest: this.sortNewest };
  },

  importState(state) {
    if (!state) return;
    this.comments = state.comments || [];
    this.nextId = state.nextId || 1;
    this.currentUser = state.currentUser || 'You';
    this.sortNewest = state.sortNewest !== false;
    this.editingId = null;
    this.render();
  }
};
