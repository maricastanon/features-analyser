/* ═══════════════════════════════════════════════
   FEATURE: Data Import/Export — Universal Module
   Import CSV/JSON, preview, transform, export.
   Works for ANY app's data migration needs.
   ═══════════════════════════════════════════════ */
const FeatDataImportExport = {
  data: [],
  columns: [],
  format: 'json',

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this._seed();
    this.render();
  },

  _seed() {
    this.columns = ['id', 'name', 'email', 'role', 'active'];
    this.data = [
      { id: 1, name: 'Alice Chen', email: 'alice@example.com', role: 'admin', active: true },
      { id: 2, name: 'Bob Rivera', email: 'bob@example.com', role: 'editor', active: true },
      { id: 3, name: 'Carol Smith', email: 'carol@example.com', role: 'viewer', active: false },
      { id: 4, name: 'David Kim', email: 'david@example.com', role: 'editor', active: true },
      { id: 5, name: 'Eva Johnson', email: 'eva@example.com', role: 'admin', active: true }
    ];
  },

  render() {
    this.container.innerHTML = `
    <div class="feat-dio-wrap">
      <div class="dio-header">
        <h3 style="color:#e91e90;margin:0;font-size:1rem">📊 Data Import/Export</h3>
      </div>
      <div class="dio-sections">
        <div class="dio-import">
          <div class="dio-drop" onclick="document.getElementById('dioFileInput').click()">
            <div style="font-size:2rem">📁</div>
            <div style="font-weight:700;color:#22c55e">Drop CSV or JSON</div>
            <div style="font-size:0.7rem;color:#5a8a60">Or click to browse</div>
            <input type="file" id="dioFileInput" accept=".csv,.json" style="display:none" onchange="FeatDataImportExport.importFile(this.files[0])">
          </div>
        </div>
        <div class="dio-preview">
          <div class="dio-preview-header">
            <span style="font-weight:700;color:#22c55e;font-size:0.85rem">📋 Data Preview (${this.data.length} rows)</span>
            <div class="dio-export-btns">
              <button class="dio-btn ${this.format==='json'?'dio-btn-active':''}" onclick="FeatDataImportExport.setFormat('json')">JSON</button>
              <button class="dio-btn ${this.format==='csv'?'dio-btn-active':''}" onclick="FeatDataImportExport.setFormat('csv')">CSV</button>
              <button class="dio-btn dio-btn-green" onclick="FeatDataImportExport.exportData()">⬇️ Export</button>
            </div>
          </div>
          <div class="dio-table-wrap">
            <table class="dio-table">
              <thead><tr>${this.columns.map(c => `<th>${c}</th>`).join('')}<th>Actions</th></tr></thead>
              <tbody>
                ${this.data.map((row, i) => `<tr>
                  ${this.columns.map(c => `<td>${this._renderCell(row[c])}</td>`).join('')}
                  <td><button class="dio-row-del" onclick="FeatDataImportExport.removeRow(${i})">✕</button></td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
          <button class="dio-add-row" onclick="FeatDataImportExport.addRow()">+ Add Row</button>
        </div>
      </div>
      <div class="dio-stats">
        <span class="dio-stat">Columns: <b>${this.columns.length}</b></span>
        <span class="dio-stat">Rows: <b>${this.data.length}</b></span>
        <span class="dio-stat">Format: <b>${this.format.toUpperCase()}</b></span>
      </div>
    </div>`;
  },

  _renderCell(val) {
    if (typeof val === 'boolean') return `<span class="dio-bool ${val?'dio-true':'dio-false'}">${val?'✅':'❌'}</span>`;
    return this._esc(String(val));
  },

  setFormat(f) { this.format = f; this.render(); },

  importFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(e.target.result);
          if (Array.isArray(parsed) && parsed.length) {
            this.data = parsed;
            this.columns = Object.keys(parsed[0]);
          }
        } else {
          const lines = e.target.result.trim().split('\n');
          this.columns = lines[0].split(',').map(c => c.trim().replace(/"/g,''));
          this.data = lines.slice(1).map(line => {
            const vals = line.split(',').map(v => v.trim().replace(/"/g,''));
            const row = {};
            this.columns.forEach((c,i) => row[c] = vals[i] || '');
            return row;
          });
        }
        this.render();
      } catch(err) { alert('Parse error: ' + err.message); }
    };
    reader.readAsText(file);
  },

  exportData() {
    let content, type, ext;
    if (this.format === 'json') {
      content = JSON.stringify(this.data, null, 2);
      type = 'application/json'; ext = 'json';
    } else {
      content = this.columns.join(',') + '\n' + this.data.map(r => this.columns.map(c => '"'+String(r[c]||'')+'"').join(',')).join('\n');
      type = 'text/csv'; ext = 'csv';
    }
    const blob = new Blob([content], { type });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'export.' + ext; a.click();
  },

  addRow() {
    const row = {};
    this.columns.forEach(c => row[c] = '');
    row[this.columns[0]] = this.data.length + 1;
    this.data.push(row);
    this.render();
  },

  removeRow(idx) { this.data.splice(idx, 1); this.render(); },

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },
  exportState() { return { data: this.data, columns: this.columns }; },
  importState(s) { if (s.data) this.data = s.data; if (s.columns) this.columns = s.columns; this.render(); }
};
