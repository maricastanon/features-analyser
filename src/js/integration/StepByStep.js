/* ═══════════════════════════════════════════════════════════════
   StepByStep — Interactive walkthrough with visual progress
   Guides users through integration one step at a time.
   ═══════════════════════════════════════════════════════════════ */
const StepByStep = {
  _steps: [],
  _currentStep: 0,

  create(steps) {
    this._steps = steps.map((s, i) => ({ ...s, index: i, completed: false }));
    this._currentStep = 0;
    return this;
  },

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const progress = this._steps.filter(s => s.completed).length;
    const pct = this._steps.length ? Math.round(progress / this._steps.length * 100) : 0;

    container.innerHTML = `
    <div style="margin-bottom:var(--sp-4)">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="font-size:var(--font-size-sm);font-weight:700">Progress: ${progress}/${this._steps.length}</span>
        <div style="flex:1;height:6px;background:var(--border-soft);border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--accent-green),var(--accent-pink));border-radius:3px;transition:width .5s"></div>
        </div>
        <span style="font-size:var(--font-size-sm);font-weight:800;color:var(--accent-green)">${pct}%</span>
      </div>
    </div>

    ${this._steps.map((step, i) => `
      <div class="card" style="margin-bottom:8px;${step.completed ? 'opacity:.6;border-color:var(--accent-green)' : ''};${i === this._currentStep ? 'border-color:var(--accent-pink);box-shadow:var(--shadow-pink)' : ''}">
        <div style="padding:12px;display:flex;align-items:flex-start;gap:10px">
          <div style="width:24px;height:24px;border-radius:50%;border:2px solid ${step.completed ? 'var(--accent-green)' : 'var(--border-soft)'};
                display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;
                ${step.completed ? 'background:var(--accent-green);color:#fff' : ''};font-size:.7rem"
               onclick="StepByStep.toggle(${i})">
            ${step.completed ? '✓' : i + 1}
          </div>
          <div style="flex:1">
            <div style="font-weight:700;font-size:var(--font-size-md);${step.completed ? 'text-decoration:line-through' : ''}">${DOM.esc(step.title)}</div>
            ${step.description ? `<div style="font-size:var(--font-size-sm);color:var(--text-muted);margin-top:3px">${step.description}</div>` : ''}
            ${step.code ? `<div class="code-block" style="margin-top:6px;font-size:var(--font-size-xs)">
              <button class="copy-btn" onclick="DOM.copy(this.parentElement.querySelector('code').textContent)">📋</button>
              <code>${DOM.esc(step.code)}</code>
            </div>` : ''}
          </div>
        </div>
      </div>
    `).join('')}`;
  },

  toggle(index) {
    if (this._steps[index]) {
      this._steps[index].completed = !this._steps[index].completed;
      if (!this._steps[index].completed) this._currentStep = index;
      else this._currentStep = this._steps.findIndex(s => !s.completed);
      if (this._currentStep === -1) this._currentStep = this._steps.length - 1;
    }
  }
};
