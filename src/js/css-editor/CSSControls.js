/* ═══════════════════════════════════════════════════════════════
   CSSControls — Auto-generate UI controls for CSS variables
   Creates color pickers, sliders, dropdowns based on var type.
   ═══════════════════════════════════════════════════════════════ */
const CSSControls = {
  render(vars, containerId, moduleId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Group by type
    const groups = { color: [], dimension: [], number: [], 'font-family': [], 'font-weight': [], text: [], other: [] };
    vars.forEach(v => {
      const g = groups[v.type] || groups.other;
      g.push(v);
    });

    let html = '';

    // Colors
    if (groups.color.length) {
      html += `<div class="css-group">
        <div class="css-group-title">🎨 Colors</div>
        <div class="css-controls-grid">
          ${groups.color.map(v => this._colorControl(v, moduleId)).join('')}
        </div>
      </div>`;
    }

    // Dimensions
    if (groups.dimension.length) {
      html += `<div class="css-group">
        <div class="css-group-title">📐 Dimensions</div>
        ${groups.dimension.map(v => this._sliderControl(v, moduleId)).join('')}
      </div>`;
    }

    // Numbers
    if (groups.number.length) {
      html += `<div class="css-group">
        <div class="css-group-title">🔢 Numbers</div>
        ${groups.number.map(v => this._sliderControl(v, moduleId)).join('')}
      </div>`;
    }

    // Font Family
    if (groups['font-family'].length) {
      html += `<div class="css-group">
        <div class="css-group-title">🔤 Fonts</div>
        ${groups['font-family'].map(v => this._fontControl(v, moduleId)).join('')}
      </div>`;
    }

    // Font Weight
    if (groups['font-weight'].length) {
      html += `<div class="css-group">
        <div class="css-group-title">💪 Font Weight</div>
        ${groups['font-weight'].map(v => this._weightControl(v, moduleId)).join('')}
      </div>`;
    }

    // Text / Other
    const textVars = [...groups.text, ...groups.other];
    if (textVars.length) {
      html += `<div class="css-group">
        <div class="css-group-title">📝 Other</div>
        ${textVars.map(v => this._textControl(v, moduleId)).join('')}
      </div>`;
    }

    container.innerHTML = html;
  },

  _colorControl(v, moduleId) {
    const cleanName = v.name.replace(/^--/, '').replace(/-/g, ' ');
    return `<div class="css-control-item">
      <label class="css-control-label">${cleanName}</label>
      <div style="display:flex;align-items:center;gap:4px">
        <input type="color" value="${v.value}" class="css-color-picker"
               onchange="CSSControls.onChange('${moduleId}','${v.name}',this.value);this.nextElementSibling.value=this.value">
        <input class="input" value="${v.value}" style="width:85px;padding:3px 6px;font-size:var(--font-size-xs);font-family:var(--font-mono)"
               onchange="CSSControls.onChange('${moduleId}','${v.name}',this.value);this.previousElementSibling.value=this.value">
      </div>
    </div>`;
  },

  _sliderControl(v, moduleId) {
    const cleanName = v.name.replace(/^--/, '').replace(/-/g, ' ');
    const unit = v.unit || '';
    return `<div class="css-control-row">
      <label class="css-control-label" style="min-width:120px">${cleanName}</label>
      <input type="range" min="${v.min || 0}" max="${v.max || 100}" step="${v.step || 1}" value="${v.numValue || parseFloat(v.value) || 0}"
             style="flex:1;accent-color:var(--accent-pink)"
             oninput="CSSControls.onChange('${moduleId}','${v.name}',this.value+'${unit}');this.nextElementSibling.textContent=this.value+'${unit}'">
      <span class="css-value-label">${v.value}</span>
    </div>`;
  },

  _fontControl(v, moduleId) {
    const cleanName = v.name.replace(/^--/, '').replace(/-/g, ' ');
    const fonts = ['Nunito', 'Calibri', 'Inter', 'Roboto', 'Poppins', 'Open Sans', 'Lato', 'Georgia', 'Courier New', 'system-ui'];
    const opts = fonts.map(f => `<option value="'${f}', sans-serif" ${v.value.includes(f) ? 'selected' : ''}>${f}</option>`).join('');
    return `<div class="css-control-row">
      <label class="css-control-label" style="min-width:120px">${cleanName}</label>
      <select class="select" style="flex:1" onchange="CSSControls.onChange('${moduleId}','${v.name}',this.value)">${opts}</select>
    </div>`;
  },

  _weightControl(v, moduleId) {
    const cleanName = v.name.replace(/^--/, '').replace(/-/g, ' ');
    const weights = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];
    const opts = weights.map(w => `<option value="${w}" ${v.value === w ? 'selected' : ''}>${w}</option>`).join('');
    return `<div class="css-control-row">
      <label class="css-control-label" style="min-width:120px">${cleanName}</label>
      <select class="select" style="flex:1" onchange="CSSControls.onChange('${moduleId}','${v.name}',this.value)">${opts}</select>
    </div>`;
  },

  _textControl(v, moduleId) {
    const cleanName = v.name.replace(/^--/, '').replace(/-/g, ' ');
    return `<div class="css-control-row">
      <label class="css-control-label" style="min-width:120px">${cleanName}</label>
      <input class="input" value="${DOM.esc(v.value)}" style="flex:1;padding:4px 8px;font-size:var(--font-size-xs)"
             onchange="CSSControls.onChange('${moduleId}','${v.name}',this.value)">
    </div>`;
  },

  onChange(moduleId, varName, value) {
    // Update sandbox live
    Sandbox.updateCSSVar(moduleId, varName, value);
    // Store override
    ModuleRegistry.updateCSSOverrides(moduleId, { [varName]: value });
  }
};
