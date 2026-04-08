/* ═══════════════════════════════════════════════════════════════
   UIPatterns — 8 UI pattern templates with live mini-previews
   Shows HOW to add a feature: as tab, subtab, widget, etc.
   ═══════════════════════════════════════════════════════════════ */
const UIPatterns = {
  patterns: {
    tab: {
      name: 'Full Tab',
      emoji: '📑',
      description: 'Top-level navigation tab — like "Dashboard" or "Projects"',
      whenToUse: 'Major app section that deserves its own navigation entry.',
      preview: `<div style="display:flex;gap:2px;border-bottom:2px solid var(--border-soft);padding:4px">
        <div style="padding:4px 10px;font-size:.65rem;color:var(--text-muted)">Home</div>
        <div style="padding:4px 10px;font-size:.65rem;color:var(--accent-pink);border-bottom:2px solid var(--accent-pink);font-weight:700">{{name}}</div>
        <div style="padding:4px 10px;font-size:.65rem;color:var(--text-muted)">Settings</div>
      </div>
      <div style="padding:8px;font-size:.6rem;color:var(--text-muted);text-align:center">Full panel content here</div>`,
      html: `<!-- Tab button in navigation -->
<button class="tab-btn" onclick="App.go('{{slug}}')">{{emoji}} {{name}}</button>

<!-- Panel container -->
<div id="panel-{{slug}}" class="panel">
  <div class="section-header">
    <h2 class="section-title">{{emoji}} {{name}}</h2>
  </div>
  <div id="{{slug}}Container"></div>
</div>`,
      js: `// Register in App.TAB_MAP:
App.TAB_MAP['{{slug}}'] = {
  label: '{{name}}',
  emoji: '{{emoji}}'
};

// Initialize when tab is shown:
// In App._initModules():
if (typeof {{ModuleName}} !== 'undefined') {{ModuleName}}.init();`,
      css: `#{{slug}}Container {
  padding: var(--sp-5);
}`
    },

    subtab: {
      name: 'Sub Tab',
      emoji: '📂',
      description: 'Nested tab within an existing parent tab',
      whenToUse: 'Related feature grouped under an existing section.',
      preview: `<div style="padding:4px;border-bottom:1px solid var(--border-soft);font-size:.65rem;color:var(--text-muted)">Parent Tab</div>
      <div style="display:flex;gap:4px;padding:4px">
        <div style="padding:3px 8px;font-size:.58rem;background:var(--accent-green);color:#fff;border-radius:10px">Sub 1</div>
        <div style="padding:3px 8px;font-size:.58rem;border:1px solid var(--border-soft);border-radius:10px;color:var(--accent-pink);font-weight:700">{{name}}</div>
      </div>`,
      html: `<!-- Sub-tab button (inside parent panel) -->
<button class="sub-tab" onclick="{{ModuleName}}.show()">{{emoji}} {{name}}</button>

<!-- Sub-tab content container -->
<div id="{{slug}}SubContent"></div>`,
      js: `// In parent module, add sub-tab switching logic:
{{ModuleName}}.show = function() {
  document.getElementById('{{slug}}SubContent').style.display = 'block';
  {{ModuleName}}.init('{{slug}}SubContent');
};`,
      css: `#{{slug}}SubContent {
  padding: var(--sp-3);
  animation: fadeIn .3s ease;
}`
    },

    container: {
      name: 'Container',
      emoji: '📦',
      description: 'Standalone section within an existing page',
      whenToUse: 'Feature that fits inside an existing page without its own navigation.',
      preview: `<div style="border:1.5px solid var(--border-soft);border-radius:8px;padding:8px;margin:4px">
        <div style="font-size:.65rem;font-weight:700;margin-bottom:4px">{{name}}</div>
        <div style="font-size:.55rem;color:var(--text-muted)">Content here</div>
      </div>`,
      html: `<!-- Container div wherever you want it -->
<div id="{{slug}}Container" class="feature-container"></div>`,
      js: `// Initialize when parent page loads:
{{ModuleName}}.init('{{slug}}Container');`,
      css: `.feature-container {
  background: var(--bg-card);
  border: 1.5px solid var(--border-soft);
  border-radius: var(--radius-lg);
  padding: var(--sp-4);
  margin-bottom: var(--sp-4);
}`
    },

    pill: {
      name: 'Pill / Chip Toggle',
      emoji: '💊',
      description: 'Toggle pill-select component for mode switching',
      whenToUse: 'Options or view modes the user toggles between.',
      preview: `<div style="display:flex;gap:3px;padding:4px">
        <div style="padding:3px 8px;font-size:.58rem;background:var(--accent-pink);color:#fff;border-radius:12px">Option A</div>
        <div style="padding:3px 8px;font-size:.58rem;border:1px solid var(--border-soft);border-radius:12px;color:var(--text-muted)">{{name}}</div>
      </div>`,
      html: `<div class="pill-group" id="{{slug}}Pills">
  <button class="pill active" onclick="{{ModuleName}}.switchMode('a')">Mode A</button>
  <button class="pill" onclick="{{ModuleName}}.switchMode('b')">{{name}}</button>
</div>`,
      js: `{{ModuleName}}.switchMode = function(mode) {
  document.querySelectorAll('#{{slug}}Pills .pill').forEach(p => p.classList.remove('active'));
  event.target.classList.add('active');
  // Switch content based on mode
};`,
      css: `.pill-group { display: flex; gap: 4px; }
.pill {
  padding: 6px 14px; border-radius: 20px;
  border: 1.5px solid var(--border-soft);
  background: transparent; color: var(--text-secondary);
  cursor: pointer; font-weight: 700; font-size: .78rem;
}
.pill.active {
  background: var(--accent-pink); color: #fff;
  border-color: var(--accent-pink);
}`
    },

    widget: {
      name: 'Dashboard Widget',
      emoji: '🧩',
      description: 'Draggable card widget for dashboard layouts',
      whenToUse: 'Data display on a configurable dashboard.',
      preview: `<div style="border:1.5px solid var(--border-soft);border-radius:8px;overflow:hidden">
        <div style="padding:4px 6px;border-bottom:1px solid var(--border-soft);font-size:.6rem;font-weight:700;display:flex;justify-content:space-between"><span>{{name}}</span><span style="cursor:grab">⋮⋮</span></div>
        <div style="padding:6px;font-size:1rem;text-align:center;font-weight:800;color:var(--accent-pink)">42</div>
      </div>`,
      html: `<div class="widget" id="{{slug}}Widget" draggable="true">
  <div class="widget-header">
    <span>{{emoji}} {{name}}</span>
    <span class="widget-drag">⋮⋮</span>
  </div>
  <div class="widget-body" id="{{slug}}WidgetBody"></div>
</div>`,
      js: `{{ModuleName}}.initWidget = function(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '...'; // Widget content
};
{{ModuleName}}.initWidget('{{slug}}WidgetBody');`,
      css: `.widget {
  background: var(--bg-card); border: 1.5px solid var(--border-soft);
  border-radius: var(--radius-lg); overflow: hidden;
}
.widget-header {
  padding: 10px 14px; border-bottom: 1px solid var(--border-soft);
  font-weight: 700; font-size: .85rem;
  display: flex; justify-content: space-between; align-items: center;
}
.widget-drag { cursor: grab; color: var(--text-muted); }
.widget-body { padding: 14px; }`
    },

    modal: {
      name: 'Modal / Dialog',
      emoji: '🪟',
      description: 'Popup overlay for focused interaction',
      whenToUse: 'Forms, confirmations, or detail views that need focus.',
      preview: `<div style="background:rgba(0,0,0,.3);padding:8px;border-radius:6px">
        <div style="background:var(--bg-card);border:1px solid var(--border-soft);border-radius:6px;padding:6px;font-size:.6rem">
          <div style="font-weight:700;margin-bottom:4px">{{name}}</div>
          <div style="color:var(--text-muted);font-size:.55rem">Modal content</div>
        </div>
      </div>`,
      html: `<!-- Trigger button -->
<button class="btn btn-pink" onclick="{{ModuleName}}.openModal()">{{emoji}} {{name}}</button>

<!-- Uses the existing modal system -->`,
      js: `{{ModuleName}}.openModal = function() {
  const html = \`
    <div class="modal-header">
      <h3 class="modal-title">{{emoji}} {{name}}</h3>
      <button class="modal-close" onclick="{{ModuleName}}.closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <!-- Your content here -->
    </div>\`;
  document.getElementById('modalContent').innerHTML = html;
  document.getElementById('modalOverlay').classList.add('active');
};
{{ModuleName}}.closeModal = function() {
  document.getElementById('modalOverlay').classList.remove('active');
};`,
      css: `/* Uses existing modal styles from components.css */`
    },

    sidebar: {
      name: 'Sidebar Panel',
      emoji: '📌',
      description: 'Slide-out panel from the right side',
      whenToUse: 'Detail views, settings, or context panels.',
      preview: `<div style="display:flex;height:40px">
        <div style="flex:1;padding:6px;font-size:.55rem;color:var(--text-muted)">Main content</div>
        <div style="width:40%;background:var(--bg-card);border-left:1.5px solid var(--accent-pink);padding:6px;font-size:.6rem;font-weight:700">{{name}}</div>
      </div>`,
      html: `<div class="sidebar-panel" id="{{slug}}Sidebar">
  <div class="sidebar-header">
    <h3>{{emoji}} {{name}}</h3>
    <button onclick="{{ModuleName}}.closeSidebar()">✕</button>
  </div>
  <div class="sidebar-body" id="{{slug}}SidebarBody"></div>
</div>`,
      js: `{{ModuleName}}.openSidebar = function() {
  document.getElementById('{{slug}}Sidebar').classList.add('open');
};
{{ModuleName}}.closeSidebar = function() {
  document.getElementById('{{slug}}Sidebar').classList.remove('open');
};`,
      css: `.sidebar-panel {
  position: fixed; right: 0; top: 0; bottom: 0;
  width: 360px; background: var(--bg-card);
  border-left: 2px solid var(--accent-pink);
  transform: translateX(100%); transition: transform .3s ease;
  z-index: 400; overflow-y: auto;
}
.sidebar-panel.open { transform: translateX(0); }
.sidebar-header {
  padding: 16px; border-bottom: 1px solid var(--border-soft);
  display: flex; justify-content: space-between; align-items: center;
}
.sidebar-body { padding: 16px; }`
    },

    drawer: {
      name: 'Bottom Drawer',
      emoji: '📥',
      description: 'Slide-up drawer from bottom (mobile-friendly)',
      whenToUse: 'Quick actions or secondary content on mobile.',
      preview: `<div style="display:flex;flex-direction:column;height:40px">
        <div style="flex:1;padding:4px;font-size:.55rem;color:var(--text-muted)">Content</div>
        <div style="background:var(--bg-card);border-top:2px solid var(--accent-green);padding:4px 6px;font-size:.6rem;font-weight:700;border-radius:8px 8px 0 0">{{name}}</div>
      </div>`,
      html: `<div class="bottom-drawer" id="{{slug}}Drawer">
  <div class="drawer-handle" onclick="{{ModuleName}}.toggleDrawer()"></div>
  <div class="drawer-body" id="{{slug}}DrawerBody"></div>
</div>`,
      js: `{{ModuleName}}.toggleDrawer = function() {
  document.getElementById('{{slug}}Drawer').classList.toggle('open');
};`,
      css: `.bottom-drawer {
  position: fixed; bottom: 0; left: 0; right: 0;
  background: var(--bg-card); border-top: 2px solid var(--accent-green);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  transform: translateY(calc(100% - 40px)); transition: transform .3s ease;
  z-index: 400; max-height: 60vh;
}
.bottom-drawer.open { transform: translateY(0); }
.drawer-handle {
  width: 40px; height: 4px; background: var(--text-muted);
  border-radius: 2px; margin: 10px auto; cursor: pointer;
}
.drawer-body { padding: 16px; overflow-y: auto; max-height: calc(60vh - 40px); }`
    }
  },

  getPattern(id) {
    return this.patterns[id] || null;
  },

  getAllPatterns() {
    return Object.entries(this.patterns).map(([id, p]) => ({ id, ...p }));
  }
};
