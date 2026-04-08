/* ═══════════════════════════════════════════════════════════════
   Sandbox — iframe isolation for each imported module
   Each mockup runs in its own sandboxed iframe with postMessage
   communication to the parent for CSS editing, data flow, etc.
   ═══════════════════════════════════════════════════════════════ */
const Sandbox = {
  _instances: {}, // moduleId -> { iframe, container, state }

  create(moduleId, containerEl, jsSource, cssSource) {
    // Build iframe srcdoc with the module's CSS and JS
    const theme = App.currentProject?.theme || {};
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
<style id="moduleCSS">${cssSource || ''}</style>
<style id="overrideCSS"></style>
</head>
<body>
<div id="moduleRoot"></div>
<script>
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
    // Try to find the module object and serialize its state
    try {
      const keys = Object.keys(window).filter(k => typeof window[k] === 'object' && window[k] !== null && window[k].init);
      const state = {};
      keys.forEach(k => { try { state[k] = JSON.parse(JSON.stringify(window[k])); } catch(e) {} });
      parent.postMessage({ type: 'module-state', moduleId: '${moduleId}', state }, '*');
    } catch(e) {}
  }
  else if (msg.type === 'hot-reload') {
    try {
      const script = document.createElement('script');
      script.textContent = msg.source;
      document.body.appendChild(script);
      // Try to re-init
      const keys = Object.keys(window).filter(k => typeof window[k] === 'object' && window[k] !== null && window[k].init);
      keys.forEach(k => { try { window[k].render ? window[k].render() : window[k].init('moduleRoot'); } catch(e) {} });
      parent.postMessage({ type: 'hot-reload-done', moduleId: '${moduleId}' }, '*');
    } catch(e) {
      parent.postMessage({ type: 'hot-reload-error', moduleId: '${moduleId}', error: e.message }, '*');
    }
  }
});

// Notify parent when ready
parent.postMessage({ type: 'sandbox-ready', moduleId: '${moduleId}' }, '*');
<\/script>
<script id="moduleJS">${jsSource || ''}</script>
<script>
// Auto-init: find module objects and call init
try {
  const keys = Object.keys(window).filter(k =>
    typeof window[k] === 'object' && window[k] !== null &&
    typeof window[k].init === 'function' && k !== 'window'
  );
  keys.forEach(k => {
    try { window[k].init('moduleRoot'); } catch(e) {
      try { window[k].init(); } catch(e2) {}
    }
  });
} catch(e) {}
<\/script>
</body>
</html>`;

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'width:100%;min-height:300px;border:2px solid var(--border-soft);border-radius:var(--radius-lg);background:var(--bg-deep)';
    iframe.sandbox = 'allow-scripts allow-same-origin';
    iframe.srcdoc = srcdoc;
    containerEl.appendChild(iframe);

    // Auto-resize iframe to content height
    iframe.onload = () => {
      try {
        const resizeObserver = new ResizeObserver(() => {
          const h = iframe.contentDocument?.body?.scrollHeight;
          if (h) iframe.style.height = Math.max(300, h + 30) + 'px';
        });
        if (iframe.contentDocument?.body) {
          resizeObserver.observe(iframe.contentDocument.body);
        }
      } catch (e) {}
    };

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
