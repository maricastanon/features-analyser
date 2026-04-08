/* ═══════════════════════════════════════════════
   FEATURE: Typography System — Universal Module
   Design and preview type scales, font pairings,
   and text hierarchy. Works for ANY app.
   ═══════════════════════════════════════════════ */
const FeatTypographySystem = {
  scale: [],
  fontPair: 0,
  baseSize: 16,

  FONT_PAIRS: [
    { heading: "'Segoe UI', sans-serif", body: "'Segoe UI', sans-serif", name: 'System Default' },
    { heading: "'Georgia', serif", body: "'Segoe UI', sans-serif", name: 'Classic Serif + Sans' },
    { heading: "'Courier New', monospace", body: "'Segoe UI', sans-serif", name: 'Mono + Sans' },
    { heading: "'Impact', sans-serif", body: "'Georgia', serif", name: 'Bold Impact + Serif' }
  ],

  SCALE_RATIOS: {
    'Minor Third': 1.2, 'Major Third': 1.25, 'Perfect Fourth': 1.333,
    'Augmented Fourth': 1.414, 'Perfect Fifth': 1.5, 'Golden Ratio': 1.618
  },

  activeRatio: 'Major Third',

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this._buildScale();
    this.render();
  },

  _buildScale() {
    const ratio = this.SCALE_RATIOS[this.activeRatio];
    const levels = ['xs','sm','base','lg','xl','2xl','3xl','4xl'];
    this.scale = levels.map((name, i) => {
      const exp = i - 2; // base is index 2
      const size = +(this.baseSize * Math.pow(ratio, exp)).toFixed(1);
      return { name, size, lineHeight: +(size * 1.5).toFixed(1), weight: i >= 5 ? 900 : i >= 3 ? 700 : 400 };
    });
  },

  render() {
    const pair = this.FONT_PAIRS[this.fontPair];
    this.container.innerHTML = `
    <div class="feat-type-wrap">
      <div class="type-header">
        <h3 style="color:#e91e90;margin:0;font-size:1rem">🔤 Typography System</h3>
        <button class="type-btn" onclick="FeatTypographySystem.exportCSS()">📋 Export CSS</button>
      </div>
      <div class="type-controls">
        <div class="type-control">
          <label class="type-label">Font Pairing</label>
          <select class="type-select" onchange="FeatTypographySystem.setFontPair(this.selectedIndex)">
            ${this.FONT_PAIRS.map((p,i) => `<option ${i===this.fontPair?'selected':''}>${p.name}</option>`).join('')}
          </select>
        </div>
        <div class="type-control">
          <label class="type-label">Scale Ratio</label>
          <select class="type-select" onchange="FeatTypographySystem.setRatio(this.value)">
            ${Object.entries(this.SCALE_RATIOS).map(([k,v]) => `<option value="${k}" ${k===this.activeRatio?'selected':''}>${k} (${v})</option>`).join('')}
          </select>
        </div>
        <div class="type-control">
          <label class="type-label">Base Size: ${this.baseSize}px</label>
          <input type="range" min="12" max="24" value="${this.baseSize}" class="type-range"
            oninput="FeatTypographySystem.setBase(parseInt(this.value))">
        </div>
      </div>
      <div class="type-preview" style="font-family:${pair.body}">
        <div class="type-preview-title">Preview</div>
        ${this.scale.slice().reverse().map(s => `
          <div class="type-sample" style="font-size:${s.size}px;line-height:${s.lineHeight}px;font-weight:${s.weight};
            font-family:${s.weight >= 700 ? pair.heading : pair.body}">
            <span class="type-meta">${s.name} — ${s.size}px / ${s.lineHeight}px / ${s.weight}</span>
            The quick brown fox jumps
          </div>`).join('')}
      </div>
      <div class="type-scale-table">
        <div class="type-table-header">
          <span>Name</span><span>Size</span><span>Line Height</span><span>Weight</span>
        </div>
        ${this.scale.map(s => `
          <div class="type-table-row">
            <span class="type-table-name">${s.name}</span>
            <span>${s.size}px</span>
            <span>${s.lineHeight}px</span>
            <span>${s.weight}</span>
          </div>`).join('')}
      </div>
    </div>`;
  },

  setFontPair(i) { this.fontPair = i; this.render(); },
  setRatio(r) { this.activeRatio = r; this._buildScale(); this.render(); },
  setBase(px) { this.baseSize = px; this._buildScale(); this.render(); },

  exportCSS() {
    const pair = this.FONT_PAIRS[this.fontPair];
    const css = `:root {\n  --font-heading: ${pair.heading};\n  --font-body: ${pair.body};\n` +
      this.scale.map(s => `  --text-${s.name}: ${s.size}px;\n  --lh-${s.name}: ${s.lineHeight}px;`).join('\n') + '\n}';
    const blob = new Blob([css], { type:'text/css' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'typography.css'; a.click();
  },

  exportState() { return { scale: this.scale, fontPair: this.fontPair, baseSize: this.baseSize, activeRatio: this.activeRatio }; },
  importState(s) { if (s.fontPair !== undefined) this.fontPair = s.fontPair; if (s.baseSize) this.baseSize = s.baseSize; if (s.activeRatio) this.activeRatio = s.activeRatio; this._buildScale(); this.render(); }
};
