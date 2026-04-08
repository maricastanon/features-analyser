/* ═══════════════════════════════════════════════════════════════
   BundledModules — First-class mockup catalog shipped with repo
   Lets the app load the functional mockups stored in ../modules.
   ═══════════════════════════════════════════════════════════════ */
const BundledModules = {
  ITEMS: [
    {
      id: 'kanban-board',
      name: 'Kanban Board',
      description: 'Drag-and-drop workflow board with card priority handling.',
      tags: ['workflow', 'tasks', 'universal'],
      appFit: ['pm-toolkit', 'universal'],
      jsPath: '../modules/feature-kanban-board.js',
      cssPath: '../modules/feature-kanban-board.css'
    },
    {
      id: 'ai-copilot',
      name: 'AI Copilot',
      description: 'Embedded assistant panel for planning, coaching, and quick guidance.',
      tags: ['ai', 'assistant', 'universal'],
      appFit: ['pm-toolkit', 'sight-reading-trainer', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-ai-copilot.js',
      cssPath: '../modules/feature-modules-17/css/feature-ai-copilot.css'
    },
    {
      id: 'baselines',
      name: 'Baselines',
      description: 'Reference snapshots for tracking drift against an original plan or score.',
      tags: ['planning', 'progress', 'universal'],
      appFit: ['pm-toolkit', 'sight-reading-trainer', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-baselines.js',
      cssPath: '../modules/feature-modules-17/css/feature-baselines.css'
    },
    {
      id: 'bulk-edit',
      name: 'Bulk Edit',
      description: 'Batch operations for repetitive updates across many records.',
      tags: ['efficiency', 'admin'],
      appFit: ['pm-toolkit', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-bulk-edit.js',
      cssPath: '../modules/feature-modules-17/css/feature-bulk-edit.css'
    },
    {
      id: 'capacity-planner',
      name: 'Capacity Planner',
      description: 'Workload balancing and headroom planning for schedules or practice load.',
      tags: ['capacity', 'planning'],
      appFit: ['pm-toolkit', 'sight-reading-trainer', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-capacity-planner.js',
      cssPath: '../modules/feature-modules-17/css/feature-capacity-planner.css'
    },
    {
      id: 'critical-path',
      name: 'Critical Path',
      description: 'Highlights the path of blocking work and timing risk.',
      tags: ['planning', 'dependencies'],
      appFit: ['pm-toolkit', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-critical-path.js',
      cssPath: '../modules/feature-modules-17/css/feature-critical-path.css'
    },
    {
      id: 'custom-backgrounds',
      name: 'Custom Backgrounds',
      description: 'Theme and atmosphere controls for more expressive UI contexts.',
      tags: ['branding', 'visual'],
      appFit: ['sight-reading-trainer', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-custom-backgrounds.js',
      cssPath: '../modules/feature-modules-17/css/feature-custom-backgrounds.css'
    },
    {
      id: 'custom-dashboard',
      name: 'Custom Dashboard',
      description: 'Composable summary surface for KPIs, progress, and shortcuts.',
      tags: ['dashboard', 'analytics'],
      appFit: ['pm-toolkit', 'sight-reading-trainer', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-custom-dashboard.js',
      cssPath: '../modules/feature-modules-17/css/feature-custom-dashboard.css'
    },
    {
      id: 'global-search',
      name: 'Global Search',
      description: 'Cross-project or cross-practice search with history and suggestions.',
      tags: ['search', 'navigation', 'universal'],
      appFit: ['pm-toolkit', 'sight-reading-trainer', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-global-search.js',
      cssPath: '../modules/feature-modules-17/css/feature-global-search.css'
    },
    {
      id: 'ideas-board',
      name: 'Ideas Board',
      description: 'Capture, vote, and promote ideas before they become backlog items.',
      tags: ['brainstorm', 'voting'],
      appFit: ['pm-toolkit', 'sight-reading-trainer', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-ideas-board.js',
      cssPath: '../modules/feature-modules-17/css/feature-ideas-board.css'
    },
    {
      id: 'offline-mode',
      name: 'Offline Mode',
      description: 'Simulates offline-first flows and local continuity.',
      tags: ['offline', 'resilience'],
      appFit: ['pm-toolkit', 'sight-reading-trainer', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-offline-mode.js',
      cssPath: '../modules/feature-modules-17/css/feature-offline-mode.css'
    },
    {
      id: 'qa-testing',
      name: 'QA Testing',
      description: 'Structured validation surface for scenarios, regressions, and pass/fail state.',
      tags: ['qa', 'testing'],
      appFit: ['pm-toolkit', 'sight-reading-trainer', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-qa-testing.js',
      cssPath: '../modules/feature-modules-17/css/feature-qa-testing.css'
    },
    {
      id: 'recurring-tasks',
      name: 'Recurring Tasks',
      description: 'Repeatable schedules for rituals, drills, or operational chores.',
      tags: ['schedule', 'automation'],
      appFit: ['pm-toolkit', 'sight-reading-trainer', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-recurring-tasks.js',
      cssPath: '../modules/feature-modules-17/css/feature-recurring-tasks.css'
    },
    {
      id: 'report-wizard',
      name: 'Report Wizard',
      description: 'Section-based report assembly for exports and stakeholder updates.',
      tags: ['reports', 'export'],
      appFit: ['pm-toolkit', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-report-wizard.js',
      cssPath: '../modules/feature-modules-17/css/feature-report-wizard.css'
    },
    {
      id: 'risk-matrix',
      name: 'Risk Matrix',
      description: 'Track severity, ownership, and mitigation state.',
      tags: ['risk', 'governance'],
      appFit: ['pm-toolkit', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-risk-matrix.js',
      cssPath: '../modules/feature-modules-17/css/feature-risk-matrix.css'
    },
    {
      id: 'role-system',
      name: 'Role System',
      description: 'Permissions and role-driven access flows.',
      tags: ['roles', 'permissions'],
      appFit: ['pm-toolkit', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-role-system.js',
      cssPath: '../modules/feature-modules-17/css/feature-role-system.css'
    },
    {
      id: 'status-reports',
      name: 'Status Reports',
      description: 'Periodic summaries of progress, issues, and next steps.',
      tags: ['reports', 'progress'],
      appFit: ['pm-toolkit', 'sight-reading-trainer', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-status-reports.js',
      cssPath: '../modules/feature-modules-17/css/feature-status-reports.css'
    },
    {
      id: 'time-tracker',
      name: 'Time Tracker',
      description: 'Time capture and session review for work or practice.',
      tags: ['time', 'analytics'],
      appFit: ['pm-toolkit', 'sight-reading-trainer', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-time-tracker.js',
      cssPath: '../modules/feature-modules-17/css/feature-time-tracker.css'
    },
    {
      id: 'vacation-impact',
      name: 'Vacation Impact',
      description: 'Availability impact modelling against schedules and coverage.',
      tags: ['planning', 'availability'],
      appFit: ['pm-toolkit', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-vacation-impact.js',
      cssPath: '../modules/feature-modules-17/css/feature-vacation-impact.css'
    }
  ],

  getAll() {
    return this.ITEMS.slice();
  },

  getById(id) {
    return this.ITEMS.find(item => item.id === id) || null;
  },

  getRecommended(appType) {
    return this.ITEMS.filter(item => item.appFit.includes(appType) || item.appFit.includes('universal'));
  },

  async load(itemId) {
    const item = this.getById(itemId);
    if (!item) throw new Error('Unknown bundled module: ' + itemId);

    const readText = async (path) => {
      if (!path) return '';
      const url = new URL(path, window.location.href).toString();
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to load ' + path + ' (' + response.status + ')');
      }
      return response.text();
    };

    const [jsSource, cssSource] = await Promise.all([
      readText(item.jsPath),
      readText(item.cssPath)
    ]);

    return { ...item, jsSource, cssSource };
  }
};
