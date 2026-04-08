/* ═══════════════════════════════════════════════
   FEATURE: Color Palette Generator — Universal Module
   Generate, preview, and export color palettes.
   Works for ANY app's design system.
   ═══════════════════════════════════════════════ */
const FeatColorPalette = {
  palettes: [],
  activePalette: 0,

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this._seed();
    this.render();
  },

  _seed() {
    this.palettes = [
      { id: 1, name: 'Forest Dark', colors: [
        { hex: '#0d1f17', name: 'bg-deep', role: 'Background' },
        { hex: '#163224', name: 'bg-card', role: 'Card BG' },
        { hex: '#1a3d28', name: 'border', role: 'Borders' },
        { hex: '#22c55e', name: 'accent-green', role: 'Primary' },
        { hex: '#e91e90', name: 'accent-pink', role: 'Accent' },
        { hex: '#e8f5e9', name: 'text', role: 'Text' }
      ]},
      { id: 2, name: 'Ocean Breeze', colors: [
        { hex: '#0c1929', name: 'bg-deep', role: 'Background' },
        { hex: '#132d46', name: 'bg-card', role: 'Card BG' },
        { hex: '#1a3a5c', name: 'border', role: 'Borders' },
        { hex: '#06b6d4', name: 'accent-cyan', role: 'Primary' },
        { hex: '#f97316', name: 'accent-orange', role: 'Accent' },
        { hex: '#e0f2fe', name: 'text', role: 'Text' }
      ]},
      { id: 3, name: 'Sunset Warm', colors: [
        { hex: '#1f0d0d', name: 'bg-deep', role: 'Background' },
        { hex: '#2d1616', name: 'bg-card', role: 'Card BG' },
        { hex: '#3d1a1a', name: 'border', role: 'Borders' },
        { hex: '#ef4444', name: 'accent-red', role: 'Primary' },
        { hex: '#eab308', name: 'accent-gold', role: 'Accent' },
        { hex: '#fef2f2', name: 'text', role: 'Text' }
      ]}
    ];
  },

  render() {
    const pal = this.palettes[this.activePalette];
    this.container.innerHTML = `
    <div class="feat-cp-wrap">
      <div class="cp-header">
        <h3 style="color:#e91e90;margin:0;font-size:1rem">🎨 Color Palette</h3>
        <button class="cp-btn cp-btn-pink" onclick="FeatColorPalette.addPalette()">+ New Palette</button>
        <button class="cp-btn cp-btn-outline" onclick="FeatColorPalette.exportCSS()">📋 Export CSS Vars</button>
      </div>
      <div class="cp-tabs">
        ${this.palettes.map((p,i) => `<button class="cp-tab ${i===this.activePalette?'active':''}"
          onclick="FeatColorPalette.switchPalette(${i})">${p.name}</button>`).join('')}
      </div>
      ${pal ? `
      <div class="cp-preview" style="background:${pal.colors[0]?.hex || '#000'}">
        <div class="cp-preview-card" style="background:${pal.colors[1]?.hex};border:1px solid ${pal.colors[2]?.hex}">
          <div style="color:${pal.colors[3]?.hex};font-weight:800;font-size:1rem">Preview Title</div>
          <div style="color:${pal.colors[5]?.hex};font-size:0.8rem;margin:6px 0">Body text preview in this palette</div>
          <button style="background:${pal.colors[4]?.hex};color:#fff;border:none;padding:6px 16px;border-radius:6px;font-weight:700;cursor:pointer">Accent Button</button>
        </div>
      </div>
      <div class="cp-swatches">
        ${pal.colors.map((c,i) => `
          <div class="cp-swatch" onclick="FeatColorPalette.editColor(${i})">
            <div class="cp-swatch-color" style="background:${c.hex}"></div>
            <div class="cp-swatch-info">
              <div class="cp-swatch-hex">${c.hex}</div>
              <div class="cp-swatch-name">${c.name}</div>
              <div class="cp-swatch-role">${c.role}</div>
            </div>
          </div>`).join('')}
        <div class="cp-swatch cp-add-swatch" onclick="FeatColorPalette.addColor()">
          <div style="font-size:1.5rem;color:#5a8a60">+</div>
        </div>
      </div>
      <div class="cp-contrast">
        <span class="cp-contrast-title">Contrast Ratios:</span>
        ${this._contrastChecks(pal)}
      </div>` : '<div style="padding:20px;color:#5a8a60">No palettes yet</div>'}
    </div>`;
  },

  _contrastChecks(pal) {
    const checks = [
      { fg: pal.colors[5]?.hex, bg: pal.colors[0]?.hex, label: 'Text on BG' },
      { fg: pal.colors[3]?.hex, bg: pal.colors[1]?.hex, label: 'Primary on Card' },
      { fg: pal.colors[4]?.hex, bg: pal.colors[0]?.hex, label: 'Accent on BG' }
    ];
    return checks.map(c => {
      const ratio = this._getContrast(c.fg || '#fff', c.bg || '#000');
      const pass = ratio >= 4.5;
      return `<span class="cp-cr ${pass?'cp-cr-pass':'cp-cr-fail'}">${c.label}: ${ratio.toFixed(1)}:1 ${pass?'✅':'⚠️'}</span>`;
    }).join('');
  },

  _getContrast(hex1, hex2) {
    const lum = (hex) => {
      const rgb = [1,3,5].map(i => parseInt(hex.slice(i,i+2),16)/255);
      const lin = rgb.map(c => c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4));
      return 0.2126*lin[0] + 0.7152*lin[1] + 0.0722*lin[2];
    };
    const l1 = lum(hex1), l2 = lum(hex2);
    return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);
  },

  switchPalette(i) { this.activePalette = i; this.render(); },

  addPalette() {
    const name = prompt('Palette name:');
    if (!name?.trim()) return;
    this.palettes.push({ id: Date.now(), name: name.trim(), colors: [
      { hex:'#0d0d0d', name:'bg', role:'Background' },
      { hex:'#22c55e', name:'primary', role:'Primary' }
    ]});
    this.activePalette = this.palettes.length - 1;
    this.render();
  },

  addColor() {
    const hex = prompt('Hex color (e.g. #ff6600):');
    if (!hex?.trim()) return;
    const name = prompt('Variable name:', 'color-' + (this.palettes[this.activePalette].colors.length + 1));
    this.palettes[this.activePalette].colors.push({ hex: hex.trim(), name: name || 'unnamed', role: 'Custom' });
    this.render();
  },

  editColor(idx) {
    const pal = this.palettes[this.activePalette];
    const c = pal.colors[idx];
    const hex = prompt('Edit color:', c.hex);
    if (hex?.trim()) { c.hex = hex.trim(); this.render(); }
  },

  exportCSS() {
    const pal = this.palettes[this.activePalette];
    if (!pal) return;
    const css = `:root {\n${pal.colors.map(c => `  --${c.name}: ${c.hex};`).join('\n')}\n}`;
    const blob = new Blob([css], { type: 'text/css' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = pal.name.toLowerCase().replace(/\s+/g,'-') + '.css'; a.click();
  },

  exportState() { return { palettes: this.palettes, activePalette: this.activePalette }; },
  importState(s) { if (s.palettes) this.palettes = s.palettes; if (s.activePalette !== undefined) this.activePalette = s.activePalette; this.render(); }
};
