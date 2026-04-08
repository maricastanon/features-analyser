const CommentMentions = {
  container: null,
  comments: [],
  members: [
    { id: 1, name: 'Alice Johnson' },
    { id: 2, name: 'Bob Smith' },
    { id: 3, name: 'Carol Davis' },
    { id: 4, name: 'Dan Wilson' },
    { id: 5, name: 'Eva Martinez' }
  ],
  currentUser: 'Alice Johnson',
  nextId: 1,
  showMentionDropdown: false,
  mentionFilter: '',
  cursorPos: 0,
  filterMine: false,

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

  _renderMentions(text) {
    return this._esc(text).replace(/@(\w+\s?\w*)/g, (match) => {
      const name = match.slice(1);
      const member = this.members.find(m => m.name.toLowerCase() === name.toLowerCase());
      if (member) return `<span class="cm-mention-pill">@${this._esc(member.name)}</span>`;
      return match;
    });
  },

  _extractMentions(text) {
    const mentions = [];
    const regex = /@(\w+\s?\w*)/g;
    let m;
    while ((m = regex.exec(text)) !== null) {
      const member = this.members.find(mb => mb.name.toLowerCase() === m[1].toLowerCase());
      if (member) mentions.push(member.id);
    }
    return mentions;
  },

  _filtered() {
    let list = [...this.comments];
    if (this.filterMine) {
      const me = this.members.find(m => m.name === this.currentUser);
      if (me) list = list.filter(c => c.mentions.includes(me.id));
    }
    return list.sort((a, b) => b.date - a.date);
  },

  render() {
    const filtered = this._filtered();
    this.container.innerHTML = `
      <div class="cm-panel">
        <div class="cm-layout">
          <div class="cm-main">
            <div class="cm-header">
              <h3 class="cm-title">Comments</h3>
              <button class="cm-btn ${this.filterMine ? 'cm-btn-active' : ''}" data-action="toggle-filter">
                ${this.filterMine ? 'Show All' : 'Mentions for me'}
              </button>
            </div>
            <div class="cm-compose">
              <div class="cm-compose-wrap">
                <textarea class="cm-textarea" id="cm-input" placeholder="Write a comment... Use @ to mention" rows="3"></textarea>
                <div class="cm-dropdown ${this.showMentionDropdown ? 'cm-dropdown-show' : ''}" id="cm-dropdown">
                  ${this._renderDropdown()}
                </div>
              </div>
              <button class="cm-btn cm-btn-primary" data-action="post">Send</button>
            </div>
            <div class="cm-list">
              ${filtered.length === 0 ? '<p class="cm-empty">No comments found.</p>' : filtered.map(c => this._renderComment(c)).join('')}
            </div>
          </div>
          <div class="cm-sidebar">
            <h4 class="cm-sidebar-title">Members</h4>
            ${this.members.map(m => `
              <div class="cm-member-item ${m.name === this.currentUser ? 'cm-member-me' : ''}" data-action="insert-mention" data-name="${this._esc(m.name)}">
                <div class="cm-avatar-sm">${this._initials(m.name)}</div>
                <span class="cm-member-name">${this._esc(m.name)}${m.name === this.currentUser ? ' (you)' : ''}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>`;
    this._bind();
  },

  _renderDropdown() {
    const q = this.mentionFilter.toLowerCase();
    const matches = this.members.filter(m => m.name.toLowerCase().includes(q));
    if (matches.length === 0) return '<div class="cm-dropdown-empty">No matches</div>';
    return matches.map(m => `
      <div class="cm-dropdown-item" data-action="select-mention" data-name="${this._esc(m.name)}">
        <div class="cm-avatar-sm">${this._initials(m.name)}</div>
        <span>${this._esc(m.name)}</span>
      </div>`).join('');
  },

  _renderComment(c) {
    return `<div class="cm-comment" data-id="${c.id}">
      <div class="cm-avatar">${this._initials(c.author)}</div>
      <div class="cm-comment-body">
        <div class="cm-comment-meta">
          <span class="cm-author">${this._esc(c.author)}</span>
          <span class="cm-time">${new Date(c.date).toLocaleString()}</span>
        </div>
        <div class="cm-comment-text">${this._renderMentions(c.text)}</div>
        ${c.author === this.currentUser ? `<div class="cm-comment-actions">
          <button class="cm-btn cm-btn-sm cm-btn-ghost cm-btn-del" data-action="delete" data-id="${c.id}">Delete</button>
        </div>` : ''}
      </div>
    </div>`;
  },

  _bind() {
    this.container.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'post') this._post();
      else if (action === 'delete') { this.comments = this.comments.filter(c => c.id !== Number(btn.dataset.id)); this.render(); }
      else if (action === 'toggle-filter') { this.filterMine = !this.filterMine; this.render(); }
      else if (action === 'select-mention') this._insertMention(btn.dataset.name);
      else if (action === 'insert-mention') this._insertMentionFromSidebar(btn.dataset.name);
    });
    const input = this.container.querySelector('#cm-input');
    if (input) {
      input.addEventListener('input', (e) => this._onInput(e));
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); this._post(); }
        if (e.key === 'Escape') { this.showMentionDropdown = false; this._updateDropdown(); }
      });
    }
  },

  _onInput(e) {
    const val = e.target.value;
    const pos = e.target.selectionStart;
    const before = val.slice(0, pos);
    const atMatch = before.match(/@(\w*)$/);
    if (atMatch) {
      this.showMentionDropdown = true;
      this.mentionFilter = atMatch[1];
    } else {
      this.showMentionDropdown = false;
      this.mentionFilter = '';
    }
    this._updateDropdown();
  },

  _updateDropdown() {
    const dd = this.container.querySelector('#cm-dropdown');
    if (dd) {
      dd.innerHTML = this._renderDropdown();
      dd.classList.toggle('cm-dropdown-show', this.showMentionDropdown);
    }
  },

  _insertMention(name) {
    const input = this.container.querySelector('#cm-input');
    if (!input) return;
    const pos = input.selectionStart;
    const val = input.value;
    const before = val.slice(0, pos);
    const after = val.slice(pos);
    const newBefore = before.replace(/@\w*$/, '@' + name + ' ');
    input.value = newBefore + after;
    input.focus();
    input.selectionStart = input.selectionEnd = newBefore.length;
    this.showMentionDropdown = false;
    this._updateDropdown();
  },

  _insertMentionFromSidebar(name) {
    const input = this.container.querySelector('#cm-input');
    if (!input) return;
    const pos = input.selectionStart;
    const insert = '@' + name + ' ';
    input.value = input.value.slice(0, pos) + insert + input.value.slice(pos);
    input.focus();
    input.selectionStart = input.selectionEnd = pos + insert.length;
  },

  _post() {
    const el = this.container.querySelector('#cm-input');
    const text = el ? el.value.trim() : '';
    if (!text) return;
    this.comments.push({
      id: this.nextId++,
      author: this.currentUser,
      text,
      mentions: this._extractMentions(text),
      date: Date.now()
    });
    this.showMentionDropdown = false;
    this.render();
  },

  exportState() {
    return { comments: this.comments, nextId: this.nextId, members: this.members, currentUser: this.currentUser };
  },

  importState(state) {
    if (!state) return;
    this.comments = state.comments || [];
    this.nextId = state.nextId || 1;
    this.members = state.members || this.members;
    this.currentUser = state.currentUser || this.currentUser;
    this.filterMine = false;
    this.showMentionDropdown = false;
    this.render();
  }
};
