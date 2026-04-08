/* ═══════════════════════════════════════════════════════════════
   CSSVarExtractor — Parse CSS to find all custom properties
   Classifies variables by type for auto-control generation.
   ═══════════════════════════════════════════════════════════════ */
const CSSVarExtractor = {
  // Color patterns
  _colorRegex: /^(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|transparent|inherit|currentColor)/,
  _dimRegex:   /^-?\d+(\.\d+)?(px|rem|em|%|vw|vh|vmin|vmax|ch|ex|pt|cm|mm|in)$/,
  _numRegex:   /^-?\d+(\.\d+)?$/,

  parse(cssSource) {
    if (!cssSource) return [];

    const vars = [];
    const seen = new Set();

    // Match CSS custom property declarations
    const regex = /--([\w-]+)\s*:\s*([^;]+)/g;
    let match;

    while ((match = regex.exec(cssSource)) !== null) {
      const name = '--' + match[1];
      const value = match[2].trim();

      if (seen.has(name)) continue;
      seen.add(name);

      vars.push({
        name,
        value,
        type: this._classify(value),
        ...this._getRange(name, value)
      });
    }

    return vars;
  },

  _classify(value) {
    if (this._colorRegex.test(value)) return 'color';
    if (this._dimRegex.test(value)) return 'dimension';
    if (this._numRegex.test(value)) return 'number';
    if (value.includes('linear-gradient') || value.includes('radial-gradient')) return 'gradient';
    if (/^(none|block|flex|grid|inline|inline-block|inline-flex)$/.test(value)) return 'display';
    if (/^(normal|bold|[1-9]00)$/.test(value)) return 'font-weight';
    if (/^[\d.]+(px|rem|em)/.test(value) && /\s/.test(value)) return 'shorthand';
    if (/^['"]?[\w\s,'-]+$/.test(value) && (value.includes(',') || value.includes("'"))) return 'font-family';
    return 'text';
  },

  _getRange(name, value) {
    const info = {};
    const nameLower = name.toLowerCase();

    if (this._dimRegex.test(value)) {
      const num = parseFloat(value);
      const unit = value.replace(/^-?\d+(\.\d+)?/, '');
      info.unit = unit;
      info.numValue = num;

      // Smart defaults based on name
      if (nameLower.includes('radius')) { info.min = 0; info.max = 50; info.step = 1; }
      else if (nameLower.includes('padding') || nameLower.includes('gap') || nameLower.includes('margin')) { info.min = 0; info.max = 60; info.step = 1; }
      else if (nameLower.includes('width')) { info.min = 0; info.max = 800; info.step = 1; }
      else if (nameLower.includes('height')) { info.min = 0; info.max = 600; info.step = 1; }
      else if (nameLower.includes('size') || nameLower.includes('font')) { info.min = 0.4; info.max = 3; info.step = 0.02; }
      else if (nameLower.includes('border')) { info.min = 0; info.max = 10; info.step = 0.5; }
      else if (unit === 'px') { info.min = 0; info.max = 100; info.step = 1; }
      else if (unit === 'rem' || unit === 'em') { info.min = 0; info.max = 5; info.step = 0.05; }
      else { info.min = 0; info.max = 100; info.step = 1; }
    }

    return info;
  },

  // Extract all property-value pairs (not just vars) from CSS rules
  parseProperties(cssSource) {
    const props = [];
    const ruleRegex = /([^{}]+)\{([^}]+)\}/g;
    let match;

    while ((match = ruleRegex.exec(cssSource)) !== null) {
      const selector = match[1].trim();
      const body = match[2];
      const propRegex = /([\w-]+)\s*:\s*([^;]+)/g;
      let pm;

      while ((pm = propRegex.exec(body)) !== null) {
        if (!pm[1].startsWith('--')) {
          props.push({
            selector,
            property: pm[1].trim(),
            value: pm[2].trim(),
            type: this._classifyProperty(pm[1].trim())
          });
        }
      }
    }

    return props;
  },

  _classifyProperty(prop) {
    if (/color|background/.test(prop)) return 'color';
    if (/width|height|padding|margin|gap|top|left|right|bottom/.test(prop)) return 'dimension';
    if (/radius/.test(prop)) return 'radius';
    if (/font-size/.test(prop)) return 'font-size';
    if (/font-family/.test(prop)) return 'font-family';
    if (/font-weight/.test(prop)) return 'font-weight';
    if (/shadow/.test(prop)) return 'shadow';
    if (/opacity/.test(prop)) return 'opacity';
    if (/transform/.test(prop)) return 'transform';
    if (/transition|animation/.test(prop)) return 'animation';
    if (/display|flex|grid/.test(prop)) return 'layout';
    if (/border/.test(prop)) return 'border';
    return 'other';
  }
};
