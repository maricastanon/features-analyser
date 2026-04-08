/* ═══════════════════════════════════════════════
   FEATURE: Kanban Board — JS Module
   Ready to integrate into Company X1 PM
   Matches: js/projects.js + js/projects/*.js pattern
   Dependencies: Data.js, Storage.js, App.js
   ═══════════════════════════════════════════════ */

const FeatKanbanBoard = {
  // ── State ──
  columns: [],
  cards: [],
  dragState: null,

  // ── Column Definitions (customizable) ──
  DEFAULT_COLUMNS: [
    { id: 'backlog',  title: '📋 Backlog',     color: '#94a3b8' },
    { id: 'todo',     title: '📝 To Do',       color: '#3b82f6' },
    { id: 'progress', title: '🔥 In Progress', color: '#f97316' },
    { id: 'review',   title: '👁️ Review',      color: '#a855f7' },
    { id: 'done',     title: '✅ Done',        color: '#22c55e' }
  ],

  // ── Priority Levels (5 colored balls) ──
  PRIORITIES: {
    1: { label: 'Critical',  color: '#ef4444', emoji: '🔴' },
    2: { label: 'High',      color: '#f97316', emoji: '🟠' },
    3: { label: 'Medium',    color: '#eab308', emoji: '🟡' },
    4: { label: 'Low',       color: '#22c55e', emoji: '🟢' },
    5: { label: 'Someday',   color: '#3b82f6', emoji: '🔵' }
  },

  // ── Initialize ──
  init(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.columns = options.columns || [...this.DEFAULT_COLUMNS];
    this.cards = options.cards || [];
    this.onCardMove = options.onCardMove || null;
    this.onCardClick = options.onCardClick || null;
    this.render();
    this._bindDragEvents();
  },

  // ── Render Board ──
  render() {
    if (!this.container) return;
    const html = `<div class="feat-kanban">${
      this.columns.map(col => this._renderColumn(col)).join('')
    }</div>`;
    this.container.innerHTML = html;
    this._bindDragEvents();
  },

  _renderColumn(col) {
    const colCards = this.cards.filter(c => c.column === col.id);
    return `
      <div class="feat-kanban-col" data-col="${col.id}">
        <div class="feat-kanban-col-header" style="border-bottom-color: ${col.color}">
          <span>${col.title}</span>
          <span class="col-count">${colCards.length}</span>
        </div>
        <div class="feat-kanban-col-body" data-col="${col.id}">
          ${colCards.map(card => this._renderCard(card)).join('')}
          <div class="feat-kanban-add" onclick="FeatKanbanBoard.addCard('${col.id}')">+ Add Task</div>
        </div>
      </div>`;
  },

  _renderCard(card) {
    const priorityBalls = [1,2,3,4,5].map(p =>
      `<div class="ball ${p <= card.priority ? 'p' + p : ''}" 
            title="${this.PRIORITIES[p]?.label || ''}"
            onclick="event.stopPropagation(); FeatKanbanBoard.setPriority('${card.id}', ${p})"></div>`
    ).join('');

    const labels = (card.labels || []).map(l =>
      `<span class="feat-kanban-card-label ${l}">${l}</span>`
    ).join('');

    return `
      <div class="feat-kanban-card" draggable="true" data-id="${card.id}"
           onclick="FeatKanbanBoard.clickCard('${card.id}')">
        <div class="feat-kanban-card-title">${this._esc(card.title)}</div>
        ${card.description ? `<div class="feat-kanban-card-desc">${this._esc(card.description)}</div>` : ''}
        <div class="feat-kanban-card-meta">
          ${labels}
          <div class="feat-kanban-card-priority">${priorityBalls}</div>
        </div>
      </div>`;
  },

  // ── Card Actions ──
  addCard(columnId) {
    const title = prompt('Task name:');
    if (!title?.trim()) return;
    const card = {
      id: 'card_' + Date.now(),
      title: title.trim(),
      description: '',
      column: columnId,
      priority: 3,
      labels: [],
      checklist: [],
      created: new Date().toISOString()
    };
    this.cards.push(card);
    this.render();
  },

  setPriority(cardId, priority) {
    const card = this.cards.find(c => c.id === cardId);
    if (card) {
      card.priority = priority;
      this.render();
    }
  },

  clickCard(cardId) {
    if (this.onCardClick) {
      this.onCardClick(this.cards.find(c => c.id === cardId));
    }
  },

  moveCard(cardId, targetColumn) {
    const card = this.cards.find(c => c.id === cardId);
    if (!card) return;
    const oldCol = card.column;
    card.column = targetColumn;
    this.render();
    if (this.onCardMove) this.onCardMove(card, oldCol, targetColumn);
  },

  removeCard(cardId) {
    this.cards = this.cards.filter(c => c.id !== cardId);
    this.render();
  },

  // ── Drag & Drop ──
  _bindDragEvents() {
    if (!this.container) return;
    const cards = this.container.querySelectorAll('.feat-kanban-card');
    const bodies = this.container.querySelectorAll('.feat-kanban-col-body');

    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        this.dragState = card.dataset.id;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        this.dragState = null;
        bodies.forEach(b => b.classList.remove('drag-over'));
      });
    });

    bodies.forEach(body => {
      body.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        body.classList.add('drag-over');
      });
      body.addEventListener('dragleave', () => {
        body.classList.remove('drag-over');
      });
      body.addEventListener('drop', (e) => {
        e.preventDefault();
        body.classList.remove('drag-over');
        if (this.dragState) {
          this.moveCard(this.dragState, body.dataset.col);
        }
      });
    });
  },

  // ── Helpers ──
  _esc(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  },

  // ── Data Export (for integration with Data.js) ──
  exportState() {
    return { columns: this.columns, cards: this.cards };
  },

  importState(state) {
    if (state.columns) this.columns = state.columns;
    if (state.cards) this.cards = state.cards;
    this.render();
  }
};
