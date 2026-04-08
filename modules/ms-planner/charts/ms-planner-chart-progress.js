const MsPlannerChartProgress = {
  _container: null,
  _buckets: [],
  _dailyData: [],

  _sampleData() {
    this._buckets = [
      { name: 'To Do', notStarted: 5, inProgress: 0, completed: 2 },
      { name: 'Development', notStarted: 1, inProgress: 4, completed: 6 },
      { name: 'Testing', notStarted: 2, inProgress: 3, completed: 4 },
      { name: 'Review', notStarted: 0, inProgress: 2, completed: 5 },
    ];
    this._dailyData = [
      { day: 'Mon', completed: 12 },
      { day: 'Tue', completed: 14 },
      { day: 'Wed', completed: 14 },
      { day: 'Thu', completed: 17 },
      { day: 'Fri', completed: 19 },
      { day: 'Sat', completed: 19 },
      { day: 'Sun', completed: 21 },
    ];
  },

  _esc(str) {
    const el = document.createElement('span'); el.textContent = str; return el.innerHTML;
  },

  _totals() {
    let ns = 0, ip = 0, co = 0;
    this._buckets.forEach(b => { ns += b.notStarted; ip += b.inProgress; co += b.completed; });
    return { notStarted: ns, inProgress: ip, completed: co, total: ns + ip + co };
  },

  _renderRing(pct) {
    const r = 54, c = 2 * Math.PI * r;
    const offset = c - (pct / 100) * c;
    return `<svg class="mcp-ring" viewBox="0 0 120 120" width="140" height="140">
      <circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--border-soft)" stroke-width="10"/>
      <circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--accent-green)" stroke-width="10"
        stroke-dasharray="${c}" stroke-dashoffset="${offset}" stroke-linecap="round" transform="rotate(-90 60 60)"/>
      <text x="60" y="58" text-anchor="middle" class="mcp-ring-pct" fill="var(--text-primary)" font-size="22" font-weight="700">${Math.round(pct)}%</text>
      <text x="60" y="74" text-anchor="middle" fill="var(--text-muted)" font-size="10">complete</text>
    </svg>`;
  },

  _renderStackedBar(t) {
    const nsPct = t.total ? (t.notStarted / t.total * 100) : 0;
    const ipPct = t.total ? (t.inProgress / t.total * 100) : 0;
    const coPct = t.total ? (t.completed / t.total * 100) : 0;
    return `<div class="mcp-stacked-wrap">
      <div class="mcp-stacked-bar">
        <div class="mcp-bar-seg mcp-seg-ns" style="width:${nsPct}%"></div>
        <div class="mcp-bar-seg mcp-seg-ip" style="width:${ipPct}%"></div>
        <div class="mcp-bar-seg mcp-seg-co" style="width:${coPct}%"></div>
      </div>
      <div class="mcp-stacked-legend">
        <span class="mcp-legend-item"><span class="mcp-dot mcp-seg-ns"></span>Not Started ${t.notStarted}</span>
        <span class="mcp-legend-item"><span class="mcp-dot mcp-seg-ip"></span>In Progress ${t.inProgress}</span>
        <span class="mcp-legend-item"><span class="mcp-dot mcp-seg-co"></span>Completed ${t.completed}</span>
      </div>
    </div>`;
  },

  _renderTrend() {
    const max = Math.max(...this._dailyData.map(d => d.completed), 1);
    let html = '<div class="mcp-trend"><h3 class="mcp-sub-heading">Completion Trend (7 days)</h3><div class="mcp-trend-chart">';
    this._dailyData.forEach(d => {
      const h = (d.completed / max) * 100;
      html += `<div class="mcp-trend-col">
        <div class="mcp-trend-bar" style="height:${h}%"><span class="mcp-trend-val">${d.completed}</span></div>
        <span class="mcp-trend-label">${this._esc(d.day)}</span>
      </div>`;
    });
    html += '</div></div>';
    return html;
  },

  _renderBuckets() {
    const t = this._totals();
    let html = '<div class="mcp-buckets"><h3 class="mcp-sub-heading">By Bucket</h3>';
    this._buckets.forEach(b => {
      const bTotal = b.notStarted + b.inProgress + b.completed;
      const pct = bTotal ? Math.round(b.completed / bTotal * 100) : 0;
      html += `<div class="mcp-bucket-row">
        <span class="mcp-bucket-name">${this._esc(b.name)}</span>
        <div class="mcp-bucket-bar"><div class="mcp-bucket-fill" style="width:${pct}%"></div></div>
        <span class="mcp-bucket-pct">${pct}%</span>
        <button class="mcp-bucket-del" data-name="${this._esc(b.name)}">&times;</button>
      </div>`;
    });
    html += `<div class="mcp-bucket-add">
      <input type="text" class="mcp-bucket-input" placeholder="Bucket name...">
      <input type="number" class="mcp-bucket-ns" placeholder="NS" min="0" value="0" title="Not Started">
      <input type="number" class="mcp-bucket-ip" placeholder="IP" min="0" value="0" title="In Progress">
      <input type="number" class="mcp-bucket-co" placeholder="Co" min="0" value="0" title="Completed">
      <button class="mcp-bucket-add-btn">Add</button>
    </div></div>`;
    return html;
  },

  render() {
    const t = this._totals();
    const pct = t.total ? (t.completed / t.total * 100) : 0;
    let html = `<div class="mcp-root"><h2 class="mcp-heading">Progress</h2>
      <div class="mcp-top-row">
        <div class="mcp-ring-wrap">${this._renderRing(pct)}</div>
        ${this._renderStackedBar(t)}
      </div>
      ${this._renderTrend()}
      ${this._renderBuckets()}
    </div>`;
    this._container.innerHTML = html;
    this._bind();
  },

  _bind() {
    this._container.querySelectorAll('.mcp-bucket-del').forEach(btn => {
      btn.addEventListener('click', () => {
        this._buckets = this._buckets.filter(b => b.name !== btn.dataset.name);
        this.render();
      });
    });
    const addBtn = this._container.querySelector('.mcp-bucket-add-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const wrap = this._container.querySelector('.mcp-bucket-add');
        const name = wrap.querySelector('.mcp-bucket-input').value.trim();
        if (!name) return;
        const ns = parseInt(wrap.querySelector('.mcp-bucket-ns').value) || 0;
        const ip = parseInt(wrap.querySelector('.mcp-bucket-ip').value) || 0;
        const co = parseInt(wrap.querySelector('.mcp-bucket-co').value) || 0;
        this._buckets.push({ name, notStarted: ns, inProgress: ip, completed: co });
        this.render();
      });
    }
  },

  init(containerId) {
    this._container = document.getElementById(containerId);
    this._sampleData();
    this.render();
  },

  exportState() {
    return { buckets: JSON.parse(JSON.stringify(this._buckets)), dailyData: JSON.parse(JSON.stringify(this._dailyData)) };
  },

  importState(state) {
    this._buckets = state.buckets || [];
    this._dailyData = state.dailyData || [];
    this.render();
  }
};
