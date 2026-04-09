import { DATA } from "./data.js";
import { applyPreviewAction, cloneRuntime, renderPreviewMarkup } from "./renderers.js";

const STORAGE_KEY = "ms-planner-cute-lab-v1";

const App = {
  state: {
    section: "overview",
    familyId: DATA.featureFamilies[0].id,
    moduleId: DATA.modules[0].id,
    moduleQuery: "",
    moduleFilter: "all",
    starred: [],
    queue: [],
    runtime: {}
  },

  init() {
    this.loadState();
    this.seedRuntime();
    this.renderNav();
    this.renderHero();
    this.renderQuickState();
    this.renderOverview();
    this.renderMap();
    this.renderComplaints();
    this.renderMissing();
    this.renderModules();
    this.renderSources();
    this.bindGlobalEvents();
    this.showSection(this.state.section);
  },

  loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      this.state = { ...this.state, ...parsed, runtime: {} };
    } catch (error) {
      console.warn("State load failed", error);
    }
  },

  seedRuntime() {
    DATA.modules.forEach((module) => {
      this.state.runtime[module.id] = this.state.runtime[module.id] || cloneRuntime(module);

      if (module.type === "board") {
        this.state.runtime[module.id].cards = (module.sample.cards || []).map((title, index) => ({
          id: `${module.id}-${index}`,
          title,
          note: index % 2 === 0 ? "Tap to move between lanes" : "Tiny live mockup card",
          lane: index % (module.sample.lanes?.length || 1),
          score: (index % 3) + 2
        }));
        this.state.runtime[module.id].lanes = module.sample.lanes || [];
      }

      if (module.type === "calendar") {
        this.state.runtime[module.id].days = module.sample.days || [];
        this.state.runtime[module.id].tasks = [
          ["Deep work"],
          ["Standup", "Bug scrub"],
          ["Review", "Risk check"],
          ["Buffer"],
          ["Retro"]
        ];
      }

      if (module.type === "dashboard") {
        this.state.runtime[module.id].metrics = module.sample.metrics || [];
        this.state.runtime[module.id].values = (module.sample.metrics || []).map((_, index) => [63, 28, 14, 7, 4][index % 5]);
      }

      if (module.type === "matrix") {
        this.state.runtime[module.id].axes = module.sample.axes || [];
        this.state.runtime[module.id].scores = (module.sample.axes || []).map((_, index) => (index % 5) + 1);
      }

      if (module.type === "checklist") {
        this.state.runtime[module.id].items = (module.sample.items || []).map((item) => ({ label: item, done: false }));
      }

      if (module.type === "timeline") {
        this.state.runtime[module.id].tasks = (module.sample.tasks || []).map((title, index) => ({
          title,
          start: index + 1,
          span: 2 + (index % 2)
        }));
      }

      if (module.type === "table") {
        this.state.runtime[module.id].columns = module.sample.columns || [];
        this.state.runtime[module.id].rows = module.sample.rows || [];
      }

      if (module.type === "form") {
        this.state.runtime[module.id].fields = module.sample.fields || [];
        this.state.runtime[module.id].values = [];
      }

      if (module.type === "workload") {
        this.state.runtime[module.id].people = module.sample.people || [];
        this.state.runtime[module.id].load = module.sample.load || [];
      }
    });
  },

  persist() {
    const saveable = {
      section: this.state.section,
      familyId: this.state.familyId,
      moduleId: this.state.moduleId,
      moduleQuery: this.state.moduleQuery,
      moduleFilter: this.state.moduleFilter,
      starred: this.state.starred,
      queue: this.state.queue
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveable));
  },

  showSection(sectionId) {
    this.state.section = sectionId;
    document.querySelectorAll(".section-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === `section-${sectionId}`);
    });
    document.querySelectorAll(".nav-btn").forEach((button) => {
      button.classList.toggle("active", button.dataset.section === sectionId);
    });
    this.persist();
  },

  renderNav() {
    const nav = document.getElementById("navStack");
    const sections = [
      ["overview", "🌼 Overview", "What Planner is / what it is not"],
      ["map", "🗺️ Feature Map", "10 feature families + 30 extension modules"],
      ["complaints", "📣 Complaint Radar", "What users complain about most"],
      ["missing", "🧱 Missing Features", "What still needs building"],
      ["modules", "🧪 Module Studio", "40 functional module mockups"],
      ["sources", "🔗 Source Library", "Official + community evidence"]
    ];

    nav.innerHTML = sections.map(([id, label, note]) => `
      <button class="nav-btn ${this.state.section === id ? "active" : ""}" data-section="${id}" type="button">
        <span>${label}</span>
        <small>${note}</small>
      </button>
    `).join("");
  },

  renderHero() {
    const hero = document.getElementById("heroCard");
    hero.innerHTML = `
      <div class="hero-topline">
        <span class="chip pink">🧠 PRODUCT: ${DATA.meta.product}</span>
        <span class="chip green">📅 RESEARCH DATE: ${DATA.meta.researchDate}</span>
        <span class="chip yellow">🧩 MODULES: ${DATA.meta.totalModules}</span>
      </div>
      <div>
        <h2>${DATA.meta.reportName}</h2>
        <p>${DATA.meta.strategyName}. This kit normalizes Planner into clear feature families, separates true gaps from paid-tier differences, and gives you functional mockups to extend Planner safely.</p>
      </div>
      <div class="legend-row">
        <span class="legend-pill"><span>🟩</span><span>Has it now</span></span>
        <span class="legend-pill"><span>🟨</span><span>Partial / premium-only / confusing</span></span>
        <span class="legend-pill"><span>❌</span><span>Still missing</span></span>
        <span class="legend-pill"><span>🩷</span><span>Module we built in this kit</span></span>
      </div>
    `;
  },

  renderQuickState() {
    const slot = document.getElementById("quickState");
    const starred = this.state.starred.length;
    const queued = this.state.queue.length;
    const pct = Math.round((queued / Math.max(1, DATA.buildOrder.length)) * 100);

    slot.innerHTML = `
      <div class="schema-key">🧠 QUICK STATE</div>
      <div class="status-card">
        <strong>⭐ Starred modules</strong>
        <div class="metric">${starred}</div>
      </div>
      <div class="status-card">
        <strong>✅ Build queue</strong>
        <div class="metric">${queued}</div>
      </div>
      <div class="status-card">
        <strong>📈 Queue progress</strong>
        <div class="inline-bar"><span style="width:${pct}%"></span></div>
        <div class="mini-note">${pct}% of the recommended queue selected</div>
      </div>
    `;
  },

  renderOverview() {
    const panel = document.getElementById("section-overview");
    panel.innerHTML = `
      <div class="section-head">
        <div>
          <h3 class="section-title">🌼 Overview: what Planner has, what it does not, what is just tier-gated</h3>
          <p class="section-subtitle">Brain-friendly rule: do not treat every complaint as a true product gap. First ask: is it present now, paid-tier only, partial, or still missing?</p>
        </div>
        <div class="pill-row">
          <span class="status-pill pink">FEATURE FAMILIES: ${DATA.meta.featureFamilyCount}</span>
          <span class="status-pill green">EXTENSION MODULES: ${DATA.meta.existingModules}</span>
          <span class="status-pill yellow">GAP MODULES: ${DATA.meta.missingModules}</span>
        </div>
      </div>

      <div class="stats-grid">
        <div class="section-card"><strong>🟩 Basic reality</strong><div class="metric">4</div><div class="mini-note">Official core views in Basic: Grid, Board, Schedule, Charts</div></div>
        <div class="section-card"><strong>🟨 Premium jump</strong><div class="metric">10+</div><div class="mini-note">Premium adds Timeline, People, goals, sprints, dependencies, custom fields, task history, and more</div></div>
        <div class="section-card"><strong>❌ True gaps</strong><div class="metric">4</div><div class="mini-note">Most evidence-backed missing items: time tracking, AND filters, completion-date sort, Graph custom-field API</div></div>
        <div class="section-card"><strong>🔗 Sources</strong><div class="metric">${DATA.meta.sourceCount}</div><div class="mini-note">Official, review, and community signals packed into this kit</div></div>
      </div>

      <div class="two-col" style="margin-top:16px;">
        <div class="section-card">
          <strong>🧠 Quick take schema</strong>
          <div class="schema-list">${DATA.quickTake.map(item => `<div class="schema-row">${item}</div>`).join("")}</div>
        </div>
        <div class="section-card">
          <strong>⚠️ Important clarifier</strong>
          <div class="schema-list">
            <div class="schema-row"><div class="schema-key">RECURRING TASKS STATUS</div><div>Recurring tasks are present now according to current Microsoft Support. Older complaints about recurrence are at least partly outdated.</div></div>
            <div class="schema-row"><div class="schema-key">GANTT / TIMELINE STATUS</div><div>Timeline (Gantt) is present in premium tiers. So "Planner has no Gantt" is too broad; the sharper statement is "Basic Planner does not include it."</div></div>
            <div class="schema-row"><div class="schema-key">CUSTOM FIELDS STATUS</div><div>Custom fields exist in premium docs, but Graph API support for true custom-field creation/management is still missing as of March 2026.</div></div>
          </div>
        </div>
      </div>

      <div class="section-head" style="margin-top:18px;">
        <div>
          <h3 class="section-title">🎚️ Tier map</h3>
          <p class="section-subtitle">Complete name of product + type + strategy always included below.</p>
        </div>
      </div>
      <div class="card-grid">
        ${DATA.tiers.map(tier => `
          <div class="tier-card">
            <div class="chip ${tier.color}">${tier.badge}</div>
            <h4>${tier.name}</h4>
            <p class="mini-note">${tier.price}</p>
            <ul class="bullet-list" style="margin-top:10px;">${tier.features.map(feature => `<li>${feature}</li>`).join("")}</ul>
            <div class="footer-note" style="margin-top:12px;">${tier.sources.map(sourceId => this.sourceAnchor(sourceId)).join(" • ")}</div>
          </div>
        `).join("")}
      </div>

      <div class="two-col" style="margin-top:18px;">
        <div class="comparison-card"><strong>🟩 What Planner does well now</strong><ul class="bullet-list"><li>Simple task coordination, especially for Microsoft 365-native teams.</li><li>Fast visibility across personal + team tasks.</li><li>Good visual entry point for teams who do not want a heavy PM tool on day one.</li><li>Premium stack is materially stronger than many people realize.</li></ul></div>
        <div class="comparison-card"><strong>❌ What still needs help</strong><ul class="bullet-list"><li>Time recording.</li><li>Richer filtering/sorting logic.</li><li>Cleaner metadata extensibility for builders.</li><li>Lighter-weight portfolio and workload insight without expensive upgrades.</li></ul></div>
      </div>
    `;
  },

  renderMap() {
    const panel = document.getElementById("section-map");
    const activeFamily = DATA.featureFamilies.find(family => family.id === this.state.familyId) || DATA.featureFamilies[0];
    panel.innerHTML = `
      <div class="section-head">
        <div>
          <h3 class="section-title">🗺️ Feature map: Microsoft Planner normalized into 10 families</h3>
          <p class="section-subtitle">For each Planner feature family, this kit creates 3 functional extension modules. That gives you 30 extension modules before the separate gap-build set.</p>
        </div>
      </div>

      <div class="map-layout">
        <div class="family-detail-card scroll-box">
          <div class="schema-key">SELECT FAMILY</div>
          ${DATA.featureFamilies.map(family => `
            <button class="family-chip ${family.id === activeFamily.id ? "active" : ""}" type="button" data-family-id="${family.id}">
              <strong>${family.name}</strong>
              <small>${family.tier}</small>
            </button>
          `).join("")}
        </div>

        <div class="family-detail-card">
          <div class="module-preview-head">
            <div>
              <div class="chip ${activeFamily.tier.includes("🟩") ? "green" : "yellow"}">${activeFamily.tier}</div>
              <h4 class="family-title" style="margin-top:10px;">${activeFamily.name}</h4>
            </div>
            <div class="action-row">
              ${activeFamily.modules.map(moduleId => {
                const module = DATA.moduleIndex[moduleId];
                return `<button class="tiny-btn" type="button" data-open-module="${module.id}">🩷 ${module.title}</button>`;
              }).join("")}
            </div>
          </div>

          <div class="two-col">
            <div class="schema-card">
              <strong>🟩 What Planner has here</strong>
              <div class="schema-list">${activeFamily.hasNow.map(item => `<div class="schema-row">${item}</div>`).join("")}</div>
            </div>
            <div class="schema-card">
              <strong>🟨 Caveats / limits</strong>
              <div class="schema-list">${activeFamily.caveats.map(item => `<div class="schema-row">${item}</div>`).join("")}</div>
            </div>
          </div>

          <div class="section-head" style="margin-top:16px;">
            <div>
              <h4 class="panel-title">🩷 3 modules we built for this family</h4>
              <p class="section-subtitle">Tap a pink module button to inspect it in Module Studio.</p>
            </div>
          </div>
          <div class="card-grid">
            ${activeFamily.modules.map(moduleId => {
              const module = DATA.moduleIndex[moduleId];
              return `
                <div class="module-card">
                  <strong>${module.title}</strong>
                  <div class="mini-note">${module.short}</div>
                  <div class="schema-row" style="margin-top:10px;"><div class="schema-key">Planner tie</div><div>${module.plannerTie}</div></div>
                  <div class="schema-row" style="margin-top:10px;"><div class="schema-key">Why it matters</div><div>${module.buildValue}</div></div>
                  <div class="action-row" style="margin-top:10px;">
                    <button class="tiny-btn" type="button" data-open-module="${module.id}">🧪 Open module</button>
                    <button class="tiny-btn" type="button" data-toggle-star="${module.id}">${this.isStarred(module.id) ? "⭐ Starred" : "☆ Star"}</button>
                  </div>
                </div>
              `;
            }).join("")}
          </div>

          <div class="footer-note" style="margin-top:14px;">
            Evidence: ${activeFamily.sourceIds.map(sourceId => this.sourceAnchor(sourceId)).join(" • ")}
          </div>
        </div>
      </div>
    `;
  },

  renderComplaints() {
    const panel = document.getElementById("section-complaints");
    panel.innerHTML = `
      <div class="section-head">
        <div>
          <h3 class="section-title">📣 Complaint radar: what users actually complain about</h3>
          <p class="section-subtitle">These are qualitative signal-strength bars, not a formal survey. I combined official support, current Microsoft Q&A threads, recent reviews, and a recent Reddit limitations thread.</p>
        </div>
      </div>

      <div class="section-card" style="margin-bottom:16px;">
        <strong>📊 Complaint signal strength</strong>
        <div class="complaint-meter" style="margin-top:12px;">
          ${DATA.complaintThemes.map(item => `
            <div class="complaint-line">
              <div><strong>${item.theme}</strong></div>
              <div class="inline-bar"><span style="width:${item.signal * 20}%"></span></div>
              <div>${item.signal}/5</div>
            </div>
          `).join("")}
        </div>
      </div>

      <div class="card-grid">
        ${DATA.complaintThemes.map(item => `
          <div class="complaint-card">
            <div class="chip ${item.status.includes("❌") ? "warning" : item.status.includes("🟩") ? "green" : "yellow"}">${item.status}</div>
            <h4>${item.theme}</h4>
            <p>${item.summary}</p>
            <div class="schema-row"><div class="schema-key">Evidence stack</div><div>${item.sourceIds.map(sourceId => this.sourceAnchor(sourceId)).join(" • ")}</div></div>
          </div>
        `).join("")}
      </div>

      <div class="two-col" style="margin-top:16px;">
        <div class="schema-card">
          <strong>🟨 Biggest nuance</strong>
          <div class="schema-list">
            <div class="schema-row">Many older or broad complaints like “Planner has no Gantt” are no longer accurate for premium tiers.</div>
            <div class="schema-row">The sharper complaint is: “The capability is not available in the tier my team can actually use.”</div>
          </div>
        </div>
        <div class="schema-card">
          <strong>🩷 Best design opportunity</strong>
          <div class="schema-list"><div class="schema-row">The biggest product win is not just “more features.” It is clearer guidance, lighter portfolio insight, better metadata, and calmer daily attention design.</div></div>
        </div>
      </div>
    `;
  },

  renderMissing() {
    const panel = document.getElementById("section-missing");
    panel.innerHTML = `
      <div class="section-head">
        <div>
          <h3 class="section-title">🧱 Missing features: true gaps vs partial gaps</h3>
          <p class="section-subtitle">Below is the clean separation between what is truly absent, what is premium-only, and what is present but still ergonomically weak.</p>
        </div>
        <div class="action-row"><button class="tiny-btn" type="button" data-open-queue="recommended">✅ Open recommended build queue</button></div>
      </div>

      <div class="card-grid">
        ${DATA.missingFeatures.map(item => `
          <div class="module-card">
            <div class="chip ${item.status.includes("❌") ? "warning" : "yellow"}">${item.status}</div>
            <h4>${item.name}</h4>
            <div class="schema-row" style="margin-top:10px;"><div class="schema-key">Why</div><div>${item.why}</div></div>
            <div class="schema-row" style="margin-top:10px;"><div class="schema-key">Impact</div><div>${item.impact}</div></div>
            <div class="footer-note" style="margin-top:10px;">${item.sourceIds.map(sourceId => this.sourceAnchor(sourceId)).join(" • ")}</div>
          </div>
        `).join("")}
      </div>

      <div class="queue-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin-top:18px;">
        <div class="queue-card">
          <strong>🚀 Suggested build order</strong>
          <div class="build-list" style="margin-top:12px;">
            ${DATA.buildOrder.map((moduleId, index) => {
              const module = DATA.moduleIndex[moduleId];
              return `
                <label class="build-row">
                  <div class="pill-check">
                    <input type="checkbox" data-toggle-queue="${module.id}" ${this.isQueued(module.id) ? "checked" : ""}>
                    <span>${index + 1}. ${module.title}</span>
                  </div>
                  <div class="mini-note">${module.buildValue}</div>
                </label>
              `;
            }).join("")}
          </div>
        </div>
        <div class="queue-card">
          <strong>🧠 Priority schema</strong>
          <div class="schema-list" style="margin-top:12px;">
            <div class="schema-row"><div class="schema-key">STEP 1</div><div>Build the features that remove daily friction for most users: time tracking, precise filtering, sorting, metadata.</div></div>
            <div class="schema-row"><div class="schema-key">STEP 2</div><div>Build the clarity layer: licensing coach, export quality, calm workload scanning.</div></div>
            <div class="schema-row"><div class="schema-key">STEP 3</div><div>Build strategic layers: portfolio rollups and cross-plan dependency visibility.</div></div>
          </div>
        </div>
      </div>
    `;
  },

  filteredModules() {
    const query = this.state.moduleQuery.trim().toLowerCase();
    return DATA.modules.filter((module) => {
      const queryPass = !query || [module.title, module.short, module.plannerTie, module.painPoint].join(" ").toLowerCase().includes(query);
      const filterPass = this.state.moduleFilter === "all"
        || (this.state.moduleFilter === "existing" && module.status === "extends")
        || (this.state.moduleFilter === "missing" && module.status === "missing")
        || (this.state.moduleFilter === "starred" && this.isStarred(module.id))
        || (this.state.moduleFilter === "queued" && this.isQueued(module.id));
      return queryPass && filterPass;
    });
  },

  renderModules() {
    const panel = document.getElementById("section-modules");
    const modules = this.filteredModules();
    const activeModule = DATA.moduleIndex[this.state.moduleId] || modules[0] || DATA.modules[0];
    if (activeModule) this.state.moduleId = activeModule.id;

    panel.innerHTML = `
      <div class="section-head">
        <div>
          <h3 class="section-title">🧪 Module studio: 40 functional modules</h3>
          <p class="section-subtitle">30 modules extend what Planner already has. 10 modules fill evidence-backed gaps. Everything below is interactive and local.</p>
        </div>
      </div>

      <div class="module-layout">
        <div class="family-detail-card">
          <div class="module-toolbar">
            <input class="search-input" id="moduleSearch" value="${this.escape(this.state.moduleQuery)}" placeholder="Search module titles, pain points, or Planner ties">
            <button class="chip-btn ${this.state.moduleFilter === "all" ? "active" : ""}" type="button" data-module-filter="all">All</button>
            <button class="chip-btn ${this.state.moduleFilter === "existing" ? "active" : ""}" type="button" data-module-filter="existing">Has-now extensions</button>
            <button class="chip-btn ${this.state.moduleFilter === "missing" ? "active" : ""}" type="button" data-module-filter="missing">Missing builds</button>
            <button class="chip-btn ${this.state.moduleFilter === "starred" ? "active" : ""}" type="button" data-module-filter="starred">Starred</button>
            <button class="chip-btn ${this.state.moduleFilter === "queued" ? "active" : ""}" type="button" data-module-filter="queued">Queue</button>
          </div>

          <div class="scroll-box">
            ${modules.map(module => `
              <button class="module-list-item ${module.id === activeModule?.id ? "active" : ""}" type="button" data-module-id="${module.id}">
                <strong>${module.title}</strong>
                <small>${module.status === "missing" ? "❌ Gap build" : "🩷 Extension"} • ${module.short}</small>
              </button>
            `).join("") || `<div class="schema-row">No modules match this filter.</div>`}
          </div>
        </div>

        <div class="module-preview" id="modulePreview">${activeModule ? this.modulePreviewMarkup(activeModule) : "<div class='schema-row'>Pick a module.</div>"}</div>
      </div>
    `;

    this.attachPreviewHandlers();
  },

  modulePreviewMarkup(module) {
    const runtime = this.state.runtime[module.id];
    const statusClass = module.status === "missing" ? "warning" : "pink";
    const family = DATA.featureFamilies.find(entry => entry.id === module.familyId);
    return `
      <div class="module-preview-head">
        <div>
          <div class="chip ${statusClass}">${module.status === "missing" ? "❌ Missing-feature build" : "🩷 Existing-feature extension"}</div>
          <h3 class="module-title" style="margin-top:10px;">${module.title}</h3>
          <p class="mini-note">${module.short}</p>
        </div>
        <div class="action-row">
          <button class="tiny-btn" type="button" data-toggle-star="${module.id}">${this.isStarred(module.id) ? "⭐ Starred" : "☆ Star"}</button>
          <button class="tiny-btn" type="button" data-toggle-queue="${module.id}">${this.isQueued(module.id) ? "✅ In queue" : "☐ Add to queue"}</button>
          <button class="tiny-btn" type="button" data-open-brief="${module.id}">🤖 AI-ready build brief</button>
        </div>
      </div>

      <div class="two-col">
        <div class="schema-card"><strong>Schema: Planner tie</strong><div class="schema-row">${module.plannerTie}</div></div>
        <div class="schema-card"><strong>Schema: pain point</strong><div class="schema-row">${module.painPoint}</div></div>
      </div>

      <div class="preview-footer">
        <div class="schema-card"><strong>Schema: build value</strong><div class="schema-row">${module.buildValue}</div></div>
        <div class="schema-card"><strong>Schema: evidence</strong><div class="schema-row">${module.sources.map(sourceId => this.sourceAnchor(sourceId)).join(" • ")}</div></div>
        ${family ? `<div class="schema-card"><strong>Schema: family</strong><div class="schema-row">${family.name} • ${family.tier}</div></div>` : ""}
      </div>

      <div class="module-playground" id="modulePlayground">${renderPreviewMarkup(module, runtime)}</div>
    `;
  },

  attachPreviewHandlers() {
    const playground = document.getElementById("modulePlayground");
    if (!playground) return;

    playground.querySelectorAll("[data-action]").forEach((element) => {
      const eventName = element.matches("input[type='range'], .search-input, input:not([type='checkbox'])") ? "input" : "click";
      element.addEventListener(eventName, (event) => {
        const target = event.currentTarget;
        const module = DATA.moduleIndex[this.state.moduleId];
        const action = target.dataset.action;
        this.state.runtime[module.id] = applyPreviewAction(module, this.state.runtime[module.id], action, {
          index: target.dataset.index,
          cardId: target.dataset.cardId,
          value: target.value
        });
        this.renderModules();
      });
    });
  },

  renderSources() {
    const panel = document.getElementById("section-sources");
    const grouped = ["Official", "Community", "Review"];
    panel.innerHTML = `
      <div class="section-head">
        <div>
          <h3 class="section-title">🔗 Source library</h3>
          <p class="section-subtitle">Every card includes complete product/type/strategy naming, date notes, and direct links.</p>
        </div>
      </div>

      <div class="sources-grid">
        ${grouped.map(group => `
          <div class="section-card">
            <strong>${group === "Official" ? "🟩 Official Microsoft sources" : group === "Community" ? "🟨 Community / Microsoft Q&A" : "🩷 Reviews / external synthesis"}</strong>
            <div class="source-list" style="margin-top:12px;">
              ${DATA.sources.filter(source => source.group === group).map(source => `
                <div class="source-card">
                  <div class="schema-key">${source.strategy}</div>
                  <strong>${source.title}</strong>
                  <div class="mini-note">${source.dateNote}</div>
                  <p>${source.summary}</p>
                  <a class="source-link" href="${source.url}" target="_blank" rel="noreferrer">🔗 Open source</a>
                </div>
              `).join("")}
            </div>
          </div>
        `).join("")}
      </div>
    `;
  },

  bindGlobalEvents() {
    document.addEventListener("click", (event) => {
      const button = event.target.closest("button, [data-family-id], [data-module-id], [data-toggle-star], [data-toggle-queue], [data-open-module], [data-open-brief], [data-open-queue], [data-source-id]");
      if (!button) return;

      if (button.dataset.section) this.showSection(button.dataset.section);
      if (button.dataset.familyId) { this.state.familyId = button.dataset.familyId; this.renderMap(); this.persist(); }
      if (button.dataset.openModule) { this.state.moduleId = button.dataset.openModule; this.showSection("modules"); this.renderModules(); this.persist(); }
      if (button.dataset.moduleId) { this.state.moduleId = button.dataset.moduleId; this.renderModules(); this.persist(); }
      if (button.dataset.toggleStar) this.toggleCollection("starred", button.dataset.toggleStar);
      if (button.dataset.toggleQueue) this.toggleCollection("queue", button.dataset.toggleQueue);
      if (button.dataset.moduleFilter) { this.state.moduleFilter = button.dataset.moduleFilter; this.renderModules(); this.persist(); }
      if (button.dataset.openBrief) this.openBrief(button.dataset.openBrief);
      if (button.dataset.openQueue === "recommended") this.openQueueModal();
      if (button.dataset.sourceId) this.openSource(button.dataset.sourceId);
    });

    document.addEventListener("input", (event) => {
      if (event.target.id === "moduleSearch") {
        this.state.moduleQuery = event.target.value;
        this.renderModules();
        this.persist();
      }
    });

    document.getElementById("modalCloseBtn").addEventListener("click", () => {
      document.getElementById("modalShell").close();
    });
  },

  toggleCollection(key, value) {
    const set = new Set(this.state[key]);
    if (set.has(value)) set.delete(value);
    else set.add(value);
    this.state[key] = [...set];
    this.renderQuickState();
    this.renderMap();
    this.renderMissing();
    this.renderModules();
    this.persist();
  },

  openBrief(moduleId) {
    const module = DATA.moduleIndex[moduleId];
    const family = DATA.featureFamilies.find(entry => entry.id === module.familyId);
    const text = [
      `# AI-Ready Build Brief`,
      ``,
      `Product: ${DATA.meta.product}`,
      `Strategy: ${DATA.meta.strategyName}`,
      `Module: ${module.title}`,
      `Status: ${module.status === "missing" ? "Missing-feature build" : "Existing-feature extension"}`,
      `Family: ${family ? family.name : module.familyId}`,
      ``,
      `## Planner Tie`,
      module.plannerTie,
      ``,
      `## Pain Point`,
      module.painPoint,
      ``,
      `## Outcome`,
      module.buildValue,
      ``,
      `## UX Rules`,
      `- ADHD-friendly`,
      `- Autism-friendly`,
      `- Pink + green + yellow only`,
      `- Use calm compartments, low-friction labels, and explicit next actions`,
      ``,
      `## Evidence Links`,
      ...module.sources.map(sourceId => `- ${DATA.sources.find(source => source.id === sourceId)?.url || sourceId}`)
    ].join("\n");
    this.openModal(`🤖 ${module.title} — AI-ready build brief`, `<div class="code-box">${this.escape(text)}</div>`);
  },

  openQueueModal() {
    const rows = DATA.buildOrder.map((moduleId, index) => {
      const module = DATA.moduleIndex[moduleId];
      return `<div class="build-row"><strong>${index + 1}. ${module.title}</strong><div class="mini-note">${module.buildValue}</div><div class="footer-note">${module.sources.map(sourceId => this.sourceAnchor(sourceId)).join(" • ")}</div></div>`;
    }).join("");
    this.openModal("✅ Recommended build queue", rows);
  },

  openSource(sourceId) {
    const source = DATA.sources.find(item => item.id === sourceId);
    if (!source) return;
    this.openModal(`🔗 ${source.title}`, `
      <div class="schema-list">
        <div class="schema-row"><div class="schema-key">PRODUCT</div><div>${DATA.meta.product}</div></div>
        <div class="schema-row"><div class="schema-key">TYPE</div><div>${source.group}</div></div>
        <div class="schema-row"><div class="schema-key">STRATEGY</div><div>${source.strategy}</div></div>
        <div class="schema-row"><div class="schema-key">DATE NOTE</div><div>${source.dateNote}</div></div>
        <div class="schema-row"><div class="schema-key">SUMMARY</div><div>${source.summary}</div></div>
        <div class="schema-row"><a class="source-link" href="${source.url}" target="_blank" rel="noreferrer">Open source link</a></div>
      </div>
    `);
  },

  openModal(title, html) {
    const modal = document.getElementById("modalShell");
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalBody").innerHTML = html;
    modal.showModal();
  },

  sourceAnchor(sourceId) {
    const source = DATA.sources.find(item => item.id === sourceId);
    if (!source) return sourceId;
    return `<button class="tiny-btn" type="button" data-source-id="${source.id}">🔗 ${this.escape(source.strategy)}</button>`;
  },

  isStarred(moduleId) { return this.state.starred.includes(moduleId); },
  isQueued(moduleId) { return this.state.queue.includes(moduleId); },

  escape(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
};

App.init();
