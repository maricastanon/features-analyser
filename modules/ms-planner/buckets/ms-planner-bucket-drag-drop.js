const MsPlannerBucketDragDrop = (() => {
  const _esc = s => { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; };
  let _root = null;
  let _buckets = [];
  let _nextCardId = 1;
  let _nextBucketId = 1;
  let _dragCard = null;
  let _dragSourceBucket = null;

  const _priorities = { high: 3, medium: 2, low: 1 };
  const _priorityDots = p => '<span class="dd-dots">' + '&#9679;'.repeat(_priorities[p] || 1) + '</span>';
  const _avatarInitials = name => (name || '??').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  function _defaultBuckets() {
    _nextBucketId = 1; _nextCardId = 1;
    return [
      { id: _nextBucketId++, name: 'To Do', cards: [
        { id: _nextCardId++, title: 'Research competitors', assignee: 'Alice Martin', priority: 'high' },
        { id: _nextCardId++, title: 'Draft requirements doc', assignee: 'Bob Chen', priority: 'medium' }
      ]},
      { id: _nextBucketId++, name: 'In Progress', cards: [
        { id: _nextCardId++, title: 'Build prototype UI', assignee: 'Carol Davis', priority: 'high' }
      ]},
      { id: _nextBucketId++, name: 'Review', cards: [
        { id: _nextCardId++, title: 'Code review: auth module', assignee: 'Dan Lee', priority: 'medium' }
      ]},
      { id: _nextBucketId++, name: 'Done', cards: [
        { id: _nextCardId++, title: 'Set up CI pipeline', assignee: 'Eve Park', priority: 'low' }
      ]}
    ];
  }

  function _render() {
    if (!_root) return;
    _root.innerHTML = `<div class="dd-board">${_buckets.map(b => `
      <div class="dd-bucket" data-bucket="${b.id}">
        <div class="dd-bucket-header">
          <span class="dd-bucket-name">${_esc(b.name)}</span>
          <span class="dd-bucket-count">${b.cards.length}</span>
        </div>
        <div class="dd-card-list" data-bucket="${b.id}">
          ${b.cards.map(c => `
            <div class="dd-card dd-priority-${_esc(c.priority)}" draggable="true" data-card="${c.id}" data-bucket="${b.id}">
              <div class="dd-card-title">${_esc(c.title)}</div>
              <div class="dd-card-meta">
                <span class="dd-avatar" title="${_esc(c.assignee)}">${_esc(_avatarInitials(c.assignee))}</span>
                ${_priorityDots(c.priority)}
              </div>
              <button class="dd-card-remove" data-action="remove-card" data-card="${c.id}" data-bucket="${b.id}" title="Remove">&#10005;</button>
            </div>`).join('')}
        </div>
        <div class="dd-add-zone">
          <button class="dd-btn-add-card" data-action="show-add" data-bucket="${b.id}">+ Add Card</button>
          <div class="dd-add-form dd-hidden" id="dd-form-${b.id}">
            <input class="dd-input" placeholder="Card title" data-field="title" maxlength="100" />
            <input class="dd-input" placeholder="Assignee name" data-field="assignee" maxlength="50" />
            <select class="dd-select" data-field="priority">
              <option value="low">Low</option>
              <option value="medium" selected>Medium</option>
              <option value="high">High</option>
            </select>
            <div class="dd-form-actions">
              <button class="dd-btn dd-btn-confirm" data-action="confirm-add" data-bucket="${b.id}">Add</button>
              <button class="dd-btn dd-btn-cancel" data-action="cancel-add" data-bucket="${b.id}">Cancel</button>
            </div>
          </div>
        </div>
      </div>`).join('')}</div>`;
  }

  function _findBucket(id) { return _buckets.find(b => b.id === id); }

  function _removeCardFromBucket(bucketId, cardId) {
    const b = _findBucket(bucketId);
    if (!b) return null;
    const idx = b.cards.findIndex(c => c.id === cardId);
    if (idx === -1) return null;
    return b.cards.splice(idx, 1)[0];
  }

  function _handleClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const bucketId = parseInt(btn.dataset.bucket, 10);

    if (action === 'show-add') {
      const form = _root.querySelector(`#dd-form-${bucketId}`);
      if (form) { form.classList.remove('dd-hidden'); form.querySelector('[data-field="title"]').focus(); }
    } else if (action === 'cancel-add') {
      const form = _root.querySelector(`#dd-form-${bucketId}`);
      if (form) form.classList.add('dd-hidden');
    } else if (action === 'confirm-add') {
      const form = _root.querySelector(`#dd-form-${bucketId}`);
      const title = form.querySelector('[data-field="title"]').value.trim();
      const assignee = form.querySelector('[data-field="assignee"]').value.trim() || 'Unassigned';
      const priority = form.querySelector('[data-field="priority"]').value;
      if (!title) return;
      const b = _findBucket(bucketId);
      if (b) { b.cards.push({ id: _nextCardId++, title, assignee, priority }); _render(); }
    } else if (action === 'remove-card') {
      const cardId = parseInt(btn.dataset.card, 10);
      _removeCardFromBucket(bucketId, cardId);
      _render();
    }
  }

  function _handleDragStart(e) {
    const card = e.target.closest('.dd-card');
    if (!card) return;
    _dragCard = parseInt(card.dataset.card, 10);
    _dragSourceBucket = parseInt(card.dataset.bucket, 10);
    card.classList.add('dd-dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(_dragCard));
  }

  function _handleDragOver(e) {
    const list = e.target.closest('.dd-card-list');
    if (!list) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    list.classList.add('dd-drop-active');
  }

  function _handleDragLeave(e) {
    const list = e.target.closest('.dd-card-list');
    if (list) list.classList.remove('dd-drop-active');
  }

  function _handleDrop(e) {
    e.preventDefault();
    const list = e.target.closest('.dd-card-list');
    if (!list || _dragCard === null) return;
    list.classList.remove('dd-drop-active');
    const targetBucketId = parseInt(list.dataset.bucket, 10);
    const card = _removeCardFromBucket(_dragSourceBucket, _dragCard);
    if (card) {
      const b = _findBucket(targetBucketId);
      if (b) b.cards.push(card);
    }
    _dragCard = null;
    _dragSourceBucket = null;
    _render();
  }

  function _handleDragEnd(e) {
    _root.querySelectorAll('.dd-dragging').forEach(el => el.classList.remove('dd-dragging'));
    _root.querySelectorAll('.dd-drop-active').forEach(el => el.classList.remove('dd-drop-active'));
    _dragCard = null;
    _dragSourceBucket = null;
  }

  return {
    init(containerId) {
      _root = document.getElementById(containerId);
      if (!_root) return;
      _root.classList.add('dd-root');
      _buckets = _defaultBuckets();
      _root.addEventListener('click', _handleClick);
      _root.addEventListener('dragstart', _handleDragStart);
      _root.addEventListener('dragover', _handleDragOver);
      _root.addEventListener('dragleave', _handleDragLeave);
      _root.addEventListener('drop', _handleDrop);
      _root.addEventListener('dragend', _handleDragEnd);
      _render();
    },
    render() { _render(); },
    exportState() { return JSON.parse(JSON.stringify({ buckets: _buckets, nextCardId: _nextCardId, nextBucketId: _nextBucketId })); },
    importState(state) {
      if (!state) return;
      _buckets = state.buckets || [];
      _nextCardId = state.nextCardId || 100;
      _nextBucketId = state.nextBucketId || 10;
      _render();
    }
  };
})();
