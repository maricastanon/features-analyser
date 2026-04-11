/* ═══════════════════════════════════════════════════════════════
   Sandbox — iframe isolation for each imported module
   Each mockup runs in its own sandboxed iframe with postMessage
   communication to the parent for CSS editing, data flow, etc.
   ═══════════════════════════════════════════════════════════════ */
const Sandbox = {
  _instances: {}, // moduleId -> { iframe, container, state }

  create(moduleId, containerEl, jsSource, cssSource, htmlSource = '') {
    // Build iframe srcdoc with the module's CSS and JS
    const theme = App.currentProject?.theme || {};
    const appendModuleExports = (source) => {
      const text = String(source || '');
      if (!text.trim()) return text;

      const candidates = new Set();
      const patterns = [
        /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*\{/g,
        /window\.([A-Za-z_$][\w$]*)\s*=\s*\{/g,
        /globalThis\.([A-Za-z_$][\w$]*)\s*=\s*\{/g
      ];

      patterns.forEach(pattern => {
        for (const match of text.matchAll(pattern)) {
          if (match[1]) candidates.add(match[1]);
        }
      });

      if (!candidates.size) return text;

      const bridge = [...candidates].map(name => `
try {
  window.__ACE_MODULE_EXPORTS__ = window.__ACE_MODULE_EXPORTS__ || [];
  if (typeof ${name} !== 'undefined' && ${name} && typeof ${name}.init === 'function' && !window.__ACE_MODULE_EXPORTS__.includes(${name})) {
    window.__ACE_MODULE_EXPORTS__.push(${name});
  }
} catch (e) {}
`).join('\n');

      return `${text}\n${bridge}`;
    };

    const esc = (value, { escapeScriptClose = false } = {}) => {
      let text = String(value || '')
        .replace(/\\/g, '\\\\')
        .replace(/`/g, '\\`')
        .replace(/\$\{/g, '\\${');
      if (escapeScriptClose) {
        text = text.replace(/<\/script>/gi, '<\\/script>');
      }
      return text;
    };
    const safeJS = esc(appendModuleExports(jsSource), { escapeScriptClose: true });
    const safeCSS = esc(cssSource);
    const safeHTML = esc(htmlSource);
    const srcdoc = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
/* Base reset + theme vars */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg-deep: ${theme.bgDeep || '#0a1a10'};
  --bg-main: ${theme.bgMain || '#0d1f17'};
  --bg-card: ${theme.bgCard || '#122b1e'};
  --bg-surface: ${theme.bgSurface || '#163224'};
  --border-soft: ${theme.borderSoft || '#1a3d28'};
  --accent-pink: ${theme.primary || '#e91e90'};
  --accent-green: ${theme.secondary || '#4caf50'};
  --text-primary: ${theme.textPrimary || '#e8f5e9'};
  --text-muted: ${theme.textMuted || '#5a8a60'};
  --font-main: ${theme.fontFamily || "system-ui, sans-serif"};
}
body {
  font-family: var(--font-main);
  background: var(--bg-main);
  color: var(--text-primary);
  padding: 12px;
  min-height: 100%;
}
</style>
<style id="moduleCSS">${safeCSS}</style>
<style id="overrideCSS"></style>
</head>
<body>
<div id="moduleRoot">${safeHTML}</div>
<script>
window.__ACE_MODULE_EXPORTS__ = window.__ACE_MODULE_EXPORTS__ || [];
window.__ACE_getModules = function() {
  const globals = Object.keys(window)
    .map(key => window[key])
    .filter(value => typeof value === 'object' && value !== null && typeof value.init === 'function');
  const unique = [];
  [...window.__ACE_MODULE_EXPORTS__, ...globals].forEach(value => {
    if (value && typeof value.init === 'function' && !unique.includes(value)) {
      unique.push(value);
    }
  });
  return unique;
};
window.__ACE_initModules = function() {
  window.__ACE_getModules().forEach(mod => {
    try {
      mod.render ? mod.render() : mod.init('moduleRoot');
    } catch (e) {
      try { mod.init(); } catch (e2) {}
    }
  });
};

// Message handler for parent communication
window.addEventListener('message', function(e) {
  const msg = e.data;
  if (!msg || !msg.type) return;

  if (msg.type === 'css-update') {
    document.documentElement.style.setProperty(msg.variable, msg.value);
  }
  else if (msg.type === 'css-override') {
    document.getElementById('overrideCSS').textContent = msg.css;
  }
  else if (msg.type === 'css-replace') {
    document.getElementById('moduleCSS').textContent = msg.css;
  }
  else if (msg.type === 'get-computed-vars') {
    const styles = getComputedStyle(document.documentElement);
    const vars = {};
    const cssText = document.getElementById('moduleCSS').textContent;
    const matches = cssText.matchAll(/--([\\w-]+)\\s*:\\s*([^;]+)/g);
    for (const m of matches) vars['--' + m[1]] = styles.getPropertyValue('--' + m[1]).trim() || m[2].trim();
    parent.postMessage({ type: 'computed-vars', moduleId: '${moduleId}', vars }, '*');
  }
  else if (msg.type === 'get-state') {
    try {
      const state = {};
      window.__ACE_getModules().forEach((mod, index) => {
        try {
          state['module_' + (index + 1)] = JSON.parse(JSON.stringify(mod));
        } catch (e) {}
      });
      parent.postMessage({ type: 'module-state', moduleId: '${moduleId}', state }, '*');
    } catch(e) {}
  }
  else if (msg.type === 'hot-reload') {
    try {
      const script = document.createElement('script');
      script.textContent = msg.source;
      document.body.appendChild(script);
      window.__ACE_initModules();
      parent.postMessage({ type: 'hot-reload-done', moduleId: '${moduleId}' }, '*');
    } catch(e) {
      parent.postMessage({ type: 'hot-reload-error', moduleId: '${moduleId}', error: e.message }, '*');
    }
  }
});

// Notify parent when ready
parent.postMessage({ type: 'sandbox-ready', moduleId: '${moduleId}' }, '*');
<\/script>
<script id="moduleJS">${safeJS}</script>
<script>
try {
  window.__ACE_initModules();
} catch(e) {}
<\/script>
</body>
</html>`;

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'width:100%;height:100%;border:none;display:block;background:var(--bg-deep)';
    iframe.sandbox = 'allow-scripts allow-same-origin';
    iframe.srcdoc = srcdoc;
    containerEl.appendChild(iframe);

    this._instances[moduleId] = { iframe, container: containerEl };
    return iframe;
  },

  // Send message to a specific sandbox
  postMessage(moduleId, message) {
    const inst = this._instances[moduleId];
    if (inst?.iframe?.contentWindow) {
      inst.iframe.contentWindow.postMessage(message, '*');
    }
  },

  // Update a CSS variable in the sandbox
  updateCSSVar(moduleId, varName, value) {
    this.postMessage(moduleId, { type: 'css-update', variable: varName, value });
  },

  // Replace entire module CSS
  replaceCSS(moduleId, css) {
    this.postMessage(moduleId, { type: 'css-replace', css });
  },

  // Add override CSS
  addOverrideCSS(moduleId, css) {
    this.postMessage(moduleId, { type: 'css-override', css });
  },

  // Request computed CSS vars from sandbox
  getComputedVars(moduleId) {
    this.postMessage(moduleId, { type: 'get-computed-vars' });
  },

  // Hot reload JS
  hotReload(moduleId, newSource) {
    this.postMessage(moduleId, { type: 'hot-reload', source: newSource });
  },

  // Destroy a sandbox
  destroy(moduleId) {
    const inst = this._instances[moduleId];
    if (inst) {
      inst.iframe.remove();
      delete this._instances[moduleId];
    }
  },

  // Get iframe reference
  getIframe(moduleId) {
    return this._instances[moduleId]?.iframe || null;
  }
};
