const esc = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const safeId = (value) => String(value).replace(/[^a-z0-9_-]/gi, "-");

export const cloneRuntime = (module) => JSON.parse(JSON.stringify(module.sample || {}));

const checklistMarkup = (module, runtime) => {
  const items = (runtime.items || []).map((item, index) => {
    const done = Boolean(item.done);
    const label = typeof item === "string" ? item : item.label || item.text || `Item ${index + 1}`;
    return `
      <label class="checkbox-row">
        <input type="checkbox" data-action="toggle-check" data-index="${index}" ${done ? "checked" : ""}>
        <span>${esc(label)}</span>
      </label>
    `;
  }).join("");

  const total = (runtime.items || []).length || 1;
  const done = (runtime.items || []).filter(item => item.done).length;
  const pct = Math.round((done / total) * 100);

  return `
    <div class="play-grid">
      <div class="play-card">
        <h4>${esc(runtime.title || module.title)}</h4>
        <div class="inline-bar"><span style="width:${pct}%"></span></div>
        <p class="mini-note">${done}/${total} checked • progress ${pct}%</p>
        <div>${items}</div>
      </div>
    </div>
  `;
};

const boardMarkup = (runtime) => {
  const lanes = runtime.lanes || [];
  const cards = runtime.cards || [];
  return `
    <div class="lane-stack">
      ${lanes.map((lane, laneIndex) => `
        <div class="lane">
          <h4>${esc(lane)}</h4>
          ${(cards.filter(card => card.lane === laneIndex)).map(card => `
            <button class="mini-task" type="button" data-action="cycle-card" data-card-id="${esc(card.id)}">
              <strong>${esc(card.title)}</strong>
              <span class="mini-note">${esc(card.note)}</span>
              <span class="score-stars">${"★".repeat(card.score || 3)}</span>
            </button>
          `).join("") || `<div class="mini-note">✨ Empty on purpose</div>`}
        </div>
      `).join("")}
    </div>
  `;
};

const tableMarkup = (runtime) => {
  const columns = runtime.columns || [];
  const rows = runtime.rows || [];
  const query = (runtime.query || "").toLowerCase();
  const filtered = rows.filter(row => row.some(cell => String(cell).toLowerCase().includes(query)));

  return `
    <div class="play-grid">
      <div class="table-box">
        <div class="module-toolbar">
          <input class="search-input" data-action="query-table" value="${esc(runtime.query || "")}" placeholder="Filter this tiny table...">
        </div>
        <div class="scroll-box" style="max-height:320px">
          <table class="data-table">
            <thead>
              <tr>${columns.map(column => `<th>${esc(column)}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${filtered.map(row => `<tr>${row.map(cell => `<td>${esc(cell)}</td>`).join("")}</tr>`).join("") || `<tr><td colspan="${columns.length || 1}">No rows match.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
};

const dashboardMarkup = (runtime) => {
  const metrics = runtime.metrics || [];
  const accent = runtime.accentIndex || 0;
  return `
    <div class="play-grid cols-2">
      ${metrics.map((metric, index) => {
        const active = accent === index;
        const value = runtime.values?.[index] ?? (index + 2) * 7;
        return `
          <button class="play-card" type="button" data-action="accent-metric" data-index="${index}">
            <h4>${esc(metric)}</h4>
            <div class="metric">${esc(value)}</div>
            <div class="inline-bar"><span style="width:${Math.min(100, Number(value) * 2)}%; background:${active ? "linear-gradient(90deg, var(--green), var(--yellow))" : "linear-gradient(90deg, var(--pink), var(--green))"}"></span></div>
            <p class="mini-note">${active ? "🌟 Focused metric" : "Tap to spotlight"}</p>
          </button>
        `;
      }).join("")}
    </div>
  `;
};

const formMarkup = (module, runtime) => {
  const fields = runtime.fields || [];
  const filled = fields.map((field, index) => runtime.values?.[index] || "");
  const summary = fields.map((field, index) => `${field}: ${filled[index] || "—"}`).join(" • ");
  return `
    <div class="play-grid cols-2">
      <div class="play-card">
        <h4>${esc(module.title)} Builder</h4>
        ${fields.map((field, index) => `
          <label class="schema-row">
            <div class="schema-key">${esc(field)}</div>
            <input class="search-input" data-action="form-input" data-index="${index}" value="${esc(filled[index])}" placeholder="Type ${esc(field).toLowerCase()}">
          </label>
        `).join("")}
      </div>
      <div class="note-box">
        <h4>🧠 Tiny generated artifact</h4>
        <div class="code-box">${esc(summary)}</div>
        <p class="mini-note">This is a local interactive mock artifact, not a live Microsoft Planner API action.</p>
      </div>
    </div>
  `;
};

const timelineMarkup = (runtime) => {
  const tasks = (runtime.tasks || []).map((task, index) => ({
    title: typeof task === "string" ? task : task.title,
    start: typeof task === "string" ? index + 1 : task.start ?? index + 1,
    span: typeof task === "string" ? 2 : task.span ?? 2
  }));
  const focus = runtime.focus ?? 0;

  return `
    <div class="play-grid">
      <div class="play-card">
        <h4>Timeline lane</h4>
        ${tasks.map((task, index) => {
          const width = task.span * 18;
          const margin = task.start * 18;
          return `
            <button class="mini-entry" type="button" data-action="focus-timeline" data-index="${index}">
              <strong>${esc(task.title)}</strong>
              <div class="inline-bar">
                <span style="margin-left:${margin}px; width:${width}px; background:${focus === index ? "linear-gradient(90deg, var(--yellow), var(--pink))" : "linear-gradient(90deg, var(--green), var(--pink))"}"></span>
              </div>
              <span class="mini-note">${focus === index ? "👀 Focused lane" : "Tap to inspect"}</span>
            </button>
          `;
        }).join("")}
      </div>
    </div>
  `;
};

const calendarMarkup = (runtime) => {
  const days = runtime.days || [];
  const tasks = runtime.tasks || [];
  const showConflicts = Boolean(runtime.showConflicts);
  return `
    <div class="play-grid">
      <button class="tiny-btn" type="button" data-action="toggle-conflicts">${showConflicts ? "Hide conflict glow" : "Show conflict glow"}</button>
      <div class="play-grid cols-3">
        ${days.map((day, index) => `
          <div class="calendar-box" style="${showConflicts && index === 2 ? "box-shadow: inset 0 0 0 2px rgba(255, 125, 85, 0.45);" : ""}">
            <h4>${esc(day)}</h4>
            ${(tasks[index] || []).map(task => `<div class="mini-entry">${esc(task)}</div>`).join("") || `<div class="mini-note">✨ breathing room</div>`}
          </div>
        `).join("")}
      </div>
    </div>
  `;
};

const workloadMarkup = (runtime) => {
  const people = runtime.people || [];
  const load = runtime.load || [];
  return `
    <div class="play-grid">
      ${people.map((person, index) => {
        const pct = load[index] ?? 0;
        return `
          <button class="workload-box" type="button" data-action="boost-load" data-index="${index}">
            <h4>${esc(person)}</h4>
            <div class="inline-bar"><span style="width:${pct}%"></span></div>
            <p class="mini-note">${pct}% load • tap to simulate assigning tiny work</p>
          </button>
        `;
      }).join("")}
    </div>
  `;
};

const matrixMarkup = (runtime) => {
  const axes = runtime.axes || [];
  return `
    <div class="play-grid cols-2">
      ${axes.map((axis, index) => {
        const score = runtime.scores?.[index] ?? 3;
        return `
          <div class="matrix-box">
            <h4>${esc(axis)}</h4>
            <input type="range" min="1" max="5" step="1" value="${score}" data-action="matrix-score" data-index="${index}">
            <p class="mini-note">Score: ${score}/5</p>
          </div>
        `;
      }).join("")}
    </div>
  `;
};

export const renderPreviewMarkup = (module, runtime) => {
  switch (module.type) {
    case "checklist": return checklistMarkup(module, runtime);
    case "board": return boardMarkup(runtime);
    case "table": return tableMarkup(runtime);
    case "dashboard": return dashboardMarkup(runtime);
    case "form": return formMarkup(module, runtime);
    case "timeline": return timelineMarkup(runtime);
    case "calendar": return calendarMarkup(runtime);
    case "workload": return workloadMarkup(runtime);
    case "matrix": return matrixMarkup(runtime);
    default: return `<div class="note-box">No preview renderer for ${esc(module.type)}</div>`;
  }
};

export const applyPreviewAction = (module, runtime, action, payload = {}) => {
  const next = JSON.parse(JSON.stringify(runtime || {}));

  if (action === "toggle-check") {
    const index = Number(payload.index);
    const items = next.items || [];
    const current = items[index];
    if (current && typeof current === "object") current.done = !current.done;
    else if (typeof current === "string") items[index] = { label: current, done: true };
  }

  if (action === "cycle-card") {
    const cards = next.cards || [];
    const card = cards.find(entry => safeId(entry.id) === safeId(payload.cardId));
    const laneCount = (next.lanes || []).length || 1;
    if (card) card.lane = (card.lane + 1) % laneCount;
  }

  if (action === "query-table") next.query = payload.value || "";
  if (action === "accent-metric") next.accentIndex = Number(payload.index);

  if (action === "form-input") {
    const index = Number(payload.index);
    next.values = next.values || [];
    next.values[index] = payload.value || "";
  }

  if (action === "focus-timeline") next.focus = Number(payload.index);
  if (action === "toggle-conflicts") next.showConflicts = !next.showConflicts;

  if (action === "boost-load") {
    const index = Number(payload.index);
    next.load = next.load || [];
    next.load[index] = Math.min(100, (next.load[index] || 0) + 7);
  }

  if (action === "matrix-score") {
    const index = Number(payload.index);
    next.scores = next.scores || [];
    next.scores[index] = Number(payload.value || 1);
  }

  return next;
};
