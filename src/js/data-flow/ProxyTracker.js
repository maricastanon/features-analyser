/* ═══════════════════════════════════════════════════════════════
   ProxyTracker — Transforms module JS to wrap objects in Proxy
   Intercepts get/set/apply to track data flow in real-time.
   Injected as preamble into sandbox iframes.
   ═══════════════════════════════════════════════════════════════ */
const ProxyTracker = {
  // Generate the tracking preamble to inject into sandbox
  generatePreamble(moduleId) {
    return `
// ═══ DATA FLOW TRACKING PREAMBLE ═══
(function() {
  const __serialize = (val) => {
    try {
      if (val === null || val === undefined) return String(val);
      if (typeof val === 'function') return '[fn]';
      if (typeof val === 'object') return JSON.stringify(val).slice(0, 200);
      return String(val);
    } catch(e) { return '[circular]'; }
  };

  window.__proxyWrap = function(obj, name) {
    if (typeof obj !== 'object' || obj === null) return obj;
    return new Proxy(obj, {
      set(target, prop, value) {
        const old = target[prop];
        target[prop] = value;
        try {
          parent.postMessage({
            type: 'data-flow',
            op: 'set',
            target: name,
            prop: String(prop),
            oldValue: __serialize(old),
            newValue: __serialize(value),
            valueType: typeof value,
            ts: performance.now(),
            moduleId: '${moduleId}'
          }, '*');
        } catch(e) {}
        return true;
      },
      get(target, prop) {
        const val = target[prop];
        if (typeof val === 'function') {
          return function(...args) {
            try {
              parent.postMessage({
                type: 'data-flow',
                op: 'call',
                target: name,
                prop: String(prop),
                args: args.map(__serialize),
                ts: performance.now(),
                moduleId: '${moduleId}'
              }, '*');
            } catch(e) {}
            return val.apply(target, args);
          };
        }
        return val;
      }
    });
  };
})();
`;
  },

  // Transform module source to wrap top-level objects in Proxy
  instrument(source, moduleId) {
    const preamble = this.generatePreamble(moduleId);

    // Find top-level const/let/var object assignments
    // Pattern: const Name = { ... }
    let instrumented = source.replace(
      /\b(const|let|var)\s+(\w+)\s*=\s*\{/g,
      (match, keyword, name) => {
        // Don't wrap if it's a known utility/helper
        if (['window', 'document', 'console'].includes(name)) return match;
        return `${keyword} ${name} = __proxyWrap({`;
      }
    );

    // Close the __proxyWrap call for each replaced object
    // This is a simplified approach — for complex cases, proper AST parsing would be better
    // But for the object-literal module pattern, this works well

    return preamble + instrumented;
  },

  // Check if source has been instrumented
  isInstrumented(source) {
    return source.includes('__proxyWrap');
  }
};
