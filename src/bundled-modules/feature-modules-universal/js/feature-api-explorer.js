/* ═══════════════════════════════════════════════
   FEATURE: API Endpoint Explorer — Universal Module
   Document, test, and explore API endpoints.
   Works for ANY app with REST/GraphQL APIs.
   ═══════════════════════════════════════════════ */
const FeatAPIExplorer = {
  endpoints: [],
  selected: null,
  filter: 'all',

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this._seed();
    this.render();
  },

  _seed() {
    this.endpoints = [
      { id: 1, method: 'GET', path: '/api/v2/users', desc: 'List all users', auth: true, status: 'stable',
        params: [{ name: 'page', type: 'number', required: false }, { name: 'limit', type: 'number', required: false }],
        response: '{ "users": [...], "total": 42, "page": 1 }' },
      { id: 2, method: 'POST', path: '/api/v2/users', desc: 'Create a new user', auth: true, status: 'stable',
        params: [{ name: 'email', type: 'string', required: true }, { name: 'name', type: 'string', required: true }],
        response: '{ "id": "u_123", "email": "...", "created": "..." }' },
      { id: 3, method: 'GET', path: '/api/v2/projects/:id', desc: 'Get project by ID', auth: true, status: 'stable',
        params: [{ name: 'id', type: 'string', required: true }],
        response: '{ "id": "p_456", "name": "...", "tasks": [...] }' },
      { id: 4, method: 'PUT', path: '/api/v2/projects/:id', desc: 'Update project', auth: true, status: 'beta',
        params: [{ name: 'id', type: 'string', required: true }, { name: 'name', type: 'string', required: false }],
        response: '{ "id": "p_456", "updated": true }' },
      { id: 5, method: 'DELETE', path: '/api/v2/tasks/:id', desc: 'Delete a task', auth: true, status: 'stable',
        params: [{ name: 'id', type: 'string', required: true }],
        response: '{ "deleted": true }' },
      { id: 6, method: 'GET', path: '/api/v2/search', desc: 'Full-text search', auth: false, status: 'beta',
        params: [{ name: 'q', type: 'string', required: true }, { name: 'type', type: 'string', required: false }],
        response: '{ "results": [...], "count": 7 }' }
    ];
  },

  render() {
    const methodColors = { GET:'#22c55e', POST:'#3b82f6', PUT:'#f97316', PATCH:'#eab308', DELETE:'#ef4444' };
    const filtered = this.filter === 'all' ? this.endpoints : this.endpoints.filter(e => e.method === this.filter);

    this.container.innerHTML = `
    <div class="feat-api-wrap">
      <div class="api-header">
        <h3 style="color:#e91e90;margin:0;font-size:1rem">🔌 API Explorer</h3>
        <span style="font-size:0.72rem;color:#5a8a60">${this.endpoints.length} endpoints</span>
        <button class="api-btn api-btn-pink" onclick="FeatAPIExplorer.addEndpoint()">+ Add Endpoint</button>
      </div>
      <div class="api-filters">
        <button class="api-filter ${this.filter==='all'?'active':''}" onclick="FeatAPIExplorer.setFilter('all')">All</button>
        ${['GET','POST','PUT','DELETE'].map(m => `<button class="api-filter ${this.filter===m?'active':''}"
          onclick="FeatAPIExplorer.setFilter('${m}')" style="${this.filter===m?`background:${methodColors[m]}22;border-color:${methodColors[m]}`:''}">${m}</button>`).join('')}
      </div>
      <div class="api-list">
        ${filtered.map(ep => `
          <div class="api-endpoint ${this.selected===ep.id?'api-expanded':''}" onclick="FeatAPIExplorer.toggle(${ep.id})">
            <div class="api-ep-row">
              <span class="api-method" style="background:${methodColors[ep.method]}22;color:${methodColors[ep.method]};border:1px solid ${methodColors[ep.method]}44">${ep.method}</span>
              <span class="api-path">${ep.path}</span>
              ${ep.auth?'<span class="api-auth">🔒</span>':''}
              <span class="api-status-badge api-status-${ep.status}">${ep.status}</span>
            </div>
            <div class="api-desc">${this._esc(ep.desc)}</div>
            ${this.selected===ep.id ? `
            <div class="api-detail">
              <div class="api-params">
                <div class="api-detail-title">Parameters:</div>
                ${ep.params.map(p => `<div class="api-param">
                  <span class="api-param-name">${p.name}</span>
                  <span class="api-param-type">${p.type}</span>
                  ${p.required?'<span class="api-param-req">required</span>':'<span class="api-param-opt">optional</span>'}
                </div>`).join('')}
              </div>
              <div class="api-response">
                <div class="api-detail-title">Response:</div>
                <pre class="api-code">${ep.response}</pre>
              </div>
              <button class="api-btn api-btn-sm api-btn-green" onclick="event.stopPropagation(); FeatAPIExplorer.testEndpoint(${ep.id})">▶ Test</button>
            </div>` : ''}
          </div>`).join('')}
      </div>
    </div>`;
  },

  setFilter(f) { this.filter = f; this.render(); },
  toggle(id) { this.selected = this.selected === id ? null : id; this.render(); },

  addEndpoint() {
    const method = prompt('Method (GET/POST/PUT/DELETE):', 'GET');
    const path = prompt('Path (e.g. /api/v2/items):');
    if (!path?.trim()) return;
    this.endpoints.push({
      id: Date.now(), method: (method || 'GET').toUpperCase(), path: path.trim(),
      desc: 'New endpoint', auth: true, status: 'draft',
      params: [], response: '{ }'
    });
    this.render();
  },

  testEndpoint(id) {
    const ep = this.endpoints.find(e => e.id === id);
    if (ep) alert(`[Mock] ${ep.method} ${ep.path}\nResponse: ${ep.response}`);
  },

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },
  exportState() { return { endpoints: this.endpoints }; },
  importState(s) { if (s.endpoints) this.endpoints = s.endpoints; this.render(); }
};
