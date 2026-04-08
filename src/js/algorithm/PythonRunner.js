/* ═══════════════════════════════════════════════════════════════
   PythonRunner — Pyodide WASM Python loader + execution
   Lazy-loads Pyodide (~11MB) on first use.
   ═══════════════════════════════════════════════════════════════ */
const PythonRunner = {
  _pyodide: null,
  _loading: false,
  _ready: false,

  async init() {
    if (this._ready) return this._pyodide;
    if (this._loading) {
      // Wait for existing load
      return new Promise(resolve => {
        const check = setInterval(() => {
          if (this._ready) { clearInterval(check); resolve(this._pyodide); }
        }, 100);
      });
    }

    this._loading = true;
    Toast.show('Loading Python runtime (~11MB)...', 'info', 5000);

    try {
      // Try CDN first, then local
      if (typeof loadPyodide === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js';
        document.head.appendChild(script);
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      this._pyodide = await loadPyodide();
      this._ready = true;
      this._loading = false;
      Toast.show('Python runtime loaded!', 'success');
      return this._pyodide;
    } catch (e) {
      this._loading = false;
      console.error('[PythonRunner] Failed to load Pyodide:', e);
      throw new Error('Failed to load Python runtime. Check internet connection.');
    }
  },

  async run(code, inputData = {}) {
    const pyodide = await this.init();

    // Set input data as Python variable
    pyodide.globals.set('input_data', pyodide.toPy(inputData));

    // Run the code
    const wrappedCode = `
import json

${code}

# Try to call process() if it exists
_result = None
if 'process' in dir():
    _result = process(input_data.to_py() if hasattr(input_data, 'to_py') else input_data)
elif 'main' in dir():
    _result = main(input_data.to_py() if hasattr(input_data, 'to_py') else input_data)

_result
`;

    try {
      const result = await pyodide.runPythonAsync(wrappedCode);
      // Convert Python result to JS
      if (result && result.toJs) {
        return result.toJs({ dict_converter: Object.fromEntries });
      }
      return result;
    } catch (e) {
      throw new Error('Python error: ' + e.message);
    }
  },

  isReady() { return this._ready; },
  isLoading() { return this._loading; }
};
