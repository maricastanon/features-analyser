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
      tags: ['project-manager', 'team-project-manager', 'workflow', 'tasks', 'universal'],
      appFit: ['pm-toolkit', 'universal'],
      jsPath: '../modules/feature-kanban-board.js',
      cssPath: '../modules/feature-kanban-board.css'
    },
    {
      id: 'ai-copilot',
      name: 'AI Copilot',
      description: 'Embedded assistant panel for planning, coaching, and quick guidance.',
      tags: ['project-manager', 'team-project-manager', 'ai', 'assistant', 'universal'],
      appFit: ['pm-toolkit', 'sight-reading-trainer', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-ai-copilot.js',
      cssPath: '../modules/feature-modules-17/css/feature-ai-copilot.css'
    },
    {
      id: 'baselines',
      name: 'Baselines',
      description: 'Reference snapshots for tracking drift against an original plan or score.',
      tags: ['project-manager', 'team-project-manager', 'planning', 'progress', 'universal'],
      appFit: ['pm-toolkit', 'sight-reading-trainer', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-baselines.js',
      cssPath: '../modules/feature-modules-17/css/feature-baselines.css'
    },
    {
      id: 'bulk-edit',
      name: 'Bulk Edit',
      description: 'Batch operations for repetitive updates across many records.',
      tags: ['project-manager', 'team-project-manager', 'efficiency', 'admin', 'universal'],
      appFit: ['pm-toolkit', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-bulk-edit.js',
      cssPath: '../modules/feature-modules-17/css/feature-bulk-edit.css'
    },
    {
      id: 'capacity-planner',
      name: 'Capacity Planner',
      description: 'Workload balancing and headroom planning for schedules or practice load.',
      tags: ['project-manager', 'team-project-manager', 'capacity', 'planning'],
      appFit: ['pm-toolkit', 'sight-reading-trainer', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-capacity-planner.js',
      cssPath: '../modules/feature-modules-17/css/feature-capacity-planner.css'
    },
    {
      id: 'critical-path',
      name: 'Critical Path',
      description: 'Highlights the path of blocking work and timing risk.',
      tags: ['project-manager', 'team-project-manager', 'planning', 'dependencies'],
      appFit: ['pm-toolkit', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-critical-path.js',
      cssPath: '../modules/feature-modules-17/css/feature-critical-path.css'
    },
    {
      id: 'custom-backgrounds',
      name: 'Custom Backgrounds',
      description: 'Theme and atmosphere controls for more expressive UI contexts.',
      tags: ['project-manager', 'branding', 'visual', 'universal'],
      appFit: ['sight-reading-trainer', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-custom-backgrounds.js',
      cssPath: '../modules/feature-modules-17/css/feature-custom-backgrounds.css'
    },
    {
      id: 'custom-dashboard',
      name: 'Custom Dashboard',
      description: 'Composable summary surface for KPIs, progress, and shortcuts.',
      tags: ['project-manager', 'team-project-manager', 'dashboard', 'analytics'],
      appFit: ['pm-toolkit', 'sight-reading-trainer', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-custom-dashboard.js',
      cssPath: '../modules/feature-modules-17/css/feature-custom-dashboard.css'
    },
    {
      id: 'global-search',
      name: 'Global Search',
      description: 'Cross-project or cross-practice search with history and suggestions.',
      tags: ['project-manager', 'team-project-manager', 'search', 'navigation', 'universal'],
      appFit: ['pm-toolkit', 'sight-reading-trainer', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-global-search.js',
      cssPath: '../modules/feature-modules-17/css/feature-global-search.css'
    },
    {
      id: 'ideas-board',
      name: 'Ideas Board',
      description: 'Capture, vote, and promote ideas before they become backlog items.',
      tags: ['project-manager', 'team-project-manager', 'brainstorm', 'voting'],
      appFit: ['pm-toolkit', 'sight-reading-trainer', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-ideas-board.js',
      cssPath: '../modules/feature-modules-17/css/feature-ideas-board.css'
    },
    {
      id: 'offline-mode',
      name: 'Offline Mode',
      description: 'Simulates offline-first flows and local continuity.',
      tags: ['project-manager', 'offline', 'resilience', 'universal'],
      appFit: ['pm-toolkit', 'sight-reading-trainer', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-offline-mode.js',
      cssPath: '../modules/feature-modules-17/css/feature-offline-mode.css'
    },
    {
      id: 'qa-testing',
      name: 'QA Testing',
      description: 'Structured validation surface for scenarios, regressions, and pass/fail state.',
      tags: ['project-manager', 'team-project-manager', 'qa', 'testing'],
      appFit: ['pm-toolkit', 'sight-reading-trainer', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-qa-testing.js',
      cssPath: '../modules/feature-modules-17/css/feature-qa-testing.css'
    },
    {
      id: 'recurring-tasks',
      name: 'Recurring Tasks',
      description: 'Repeatable schedules for rituals, drills, or operational chores.',
      tags: ['project-manager', 'team-project-manager', 'schedule', 'automation'],
      appFit: ['pm-toolkit', 'sight-reading-trainer', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-recurring-tasks.js',
      cssPath: '../modules/feature-modules-17/css/feature-recurring-tasks.css'
    },
    {
      id: 'report-wizard',
      name: 'Report Wizard',
      description: 'Section-based report assembly for exports and stakeholder updates.',
      tags: ['project-manager', 'team-project-manager', 'reports', 'export'],
      appFit: ['pm-toolkit', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-report-wizard.js',
      cssPath: '../modules/feature-modules-17/css/feature-report-wizard.css'
    },
    {
      id: 'risk-matrix',
      name: 'Risk Matrix',
      description: 'Track severity, ownership, and mitigation state.',
      tags: ['project-manager', 'team-project-manager', 'risk', 'governance'],
      appFit: ['pm-toolkit', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-risk-matrix.js',
      cssPath: '../modules/feature-modules-17/css/feature-risk-matrix.css'
    },
    {
      id: 'role-system',
      name: 'Role System',
      description: 'Permissions and role-driven access flows.',
      tags: ['project-manager', 'team-project-manager', 'roles', 'permissions'],
      appFit: ['pm-toolkit', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-role-system.js',
      cssPath: '../modules/feature-modules-17/css/feature-role-system.css'
    },
    {
      id: 'status-reports',
      name: 'Status Reports',
      description: 'Periodic summaries of progress, issues, and next steps.',
      tags: ['project-manager', 'team-project-manager', 'reports', 'progress'],
      appFit: ['pm-toolkit', 'sight-reading-trainer', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-status-reports.js',
      cssPath: '../modules/feature-modules-17/css/feature-status-reports.css'
    },
    {
      id: 'time-tracker',
      name: 'Time Tracker',
      description: 'Time capture and session review for work or practice.',
      tags: ['project-manager', 'team-project-manager', 'time', 'analytics'],
      appFit: ['pm-toolkit', 'sight-reading-trainer', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-time-tracker.js',
      cssPath: '../modules/feature-modules-17/css/feature-time-tracker.css'
    },
    {
      id: 'vacation-impact',
      name: 'Vacation Impact',
      description: 'Availability impact modelling against schedules and coverage.',
      tags: ['project-manager', 'team-project-manager', 'planning', 'availability'],
      appFit: ['pm-toolkit', 'universal'],
      jsPath: '../modules/feature-modules-17/js/feature-vacation-impact.js',
      cssPath: '../modules/feature-modules-17/css/feature-vacation-impact.css'
    },

    // ── Universal Modules ──
    {
      id: 'mindmap',
      name: 'Mindmap',
      description: 'Interactive node map with drag, status cycling, tree list, and text export.',
      tags: ['brainstorm', 'visual', 'universal'],
      appFit: ['universal'],
      jsPath: '../modules/feature-modules-universal/js/feature-mindmap.js',
      cssPath: '../modules/feature-modules-universal/css/feature-mindmap.css'
    },
    {
      id: 'dependency-graph',
      name: 'Dependency Graph',
      description: 'Visualize feature dependencies, detect bottlenecks and orphan nodes.',
      tags: ['architecture', 'dependencies', 'universal'],
      appFit: ['universal'],
      jsPath: '../modules/feature-modules-universal/js/feature-dependency-graph.js',
      cssPath: '../modules/feature-modules-universal/css/feature-dependency-graph.css'
    },
    {
      id: 'ab-testing',
      name: 'A/B Testing',
      description: 'Compare two feature variants side-by-side with conversion and engagement metrics.',
      tags: ['testing', 'analytics', 'universal'],
      appFit: ['universal'],
      jsPath: '../modules/feature-modules-universal/js/feature-ab-testing.js',
      cssPath: '../modules/feature-modules-universal/css/feature-ab-testing.css'
    },
    {
      id: 'changelog',
      name: 'Changelog',
      description: 'Track versions, typed changes, and export as Markdown release notes.',
      tags: ['releases', 'documentation', 'universal'],
      appFit: ['universal'],
      jsPath: '../modules/feature-modules-universal/js/feature-changelog.js',
      cssPath: '../modules/feature-modules-universal/css/feature-changelog.css'
    },
    {
      id: 'user-stories',
      name: 'User Stories',
      description: 'Write user stories with personas, acceptance criteria, and story points.',
      tags: ['agile', 'requirements', 'universal'],
      appFit: ['pm-toolkit', 'universal'],
      jsPath: '../modules/feature-modules-universal/js/feature-user-stories.js',
      cssPath: '../modules/feature-modules-universal/css/feature-user-stories.css'
    },
    {
      id: 'color-palette',
      name: 'Color Palette',
      description: 'Generate palettes, check contrast ratios, and export as CSS variables.',
      tags: ['design', 'theming', 'universal'],
      appFit: ['universal'],
      jsPath: '../modules/feature-modules-universal/js/feature-color-palette.js',
      cssPath: '../modules/feature-modules-universal/css/feature-color-palette.css'
    },
    {
      id: 'api-explorer',
      name: 'API Explorer',
      description: 'Document, browse, and test REST API endpoints with parameters and responses.',
      tags: ['api', 'documentation', 'universal'],
      appFit: ['universal'],
      jsPath: '../modules/feature-modules-universal/js/feature-api-explorer.js',
      cssPath: '../modules/feature-modules-universal/css/feature-api-explorer.css'
    },
    {
      id: 'component-library',
      name: 'Component Library',
      description: 'Browse, preview, and copy reusable UI components with Shadow DOM isolation.',
      tags: ['design-system', 'components', 'universal'],
      appFit: ['universal'],
      jsPath: '../modules/feature-modules-universal/js/feature-component-library.js',
      cssPath: '../modules/feature-modules-universal/css/feature-component-library.css'
    },
    {
      id: 'notifications',
      name: 'Notification Center',
      description: 'Categorized notification feed with read/unread, filters, and actions.',
      tags: ['notifications', 'ux', 'universal'],
      appFit: ['universal'],
      jsPath: '../modules/feature-modules-universal/js/feature-notifications.js',
      cssPath: '../modules/feature-modules-universal/css/feature-notifications.css'
    },
    {
      id: 'settings-panel',
      name: 'Settings Panel',
      description: 'App settings with sections, toggles, selects, color pickers, and JSON export.',
      tags: ['settings', 'configuration', 'universal'],
      appFit: ['universal'],
      jsPath: '../modules/feature-modules-universal/js/feature-settings-panel.js',
      cssPath: '../modules/feature-modules-universal/css/feature-settings-panel.css'
    },
    {
      id: 'data-import-export',
      name: 'Data Import/Export',
      description: 'Import CSV/JSON, preview in table, transform, and export.',
      tags: ['data', 'migration', 'universal'],
      appFit: ['universal'],
      jsPath: '../modules/feature-modules-universal/js/feature-data-import-export.js',
      cssPath: '../modules/feature-modules-universal/css/feature-data-import-export.css'
    },
    {
      id: 'feature-flags',
      name: 'Feature Flags',
      description: 'Toggle features, set rollout percentages, target environments and segments.',
      tags: ['feature-flags', 'devops', 'universal'],
      appFit: ['universal'],
      jsPath: '../modules/feature-modules-universal/js/feature-feature-flags.js',
      cssPath: '../modules/feature-modules-universal/css/feature-feature-flags.css'
    },
    {
      id: 'performance-monitor',
      name: 'Performance Monitor',
      description: 'Track web vitals (LCP, FID, CLS), bundle size, and score history.',
      tags: ['performance', 'monitoring', 'universal'],
      appFit: ['universal'],
      jsPath: '../modules/feature-modules-universal/js/feature-performance-monitor.js',
      cssPath: '../modules/feature-modules-universal/css/feature-performance-monitor.css'
    },
    {
      id: 'feedback-board',
      name: 'Feedback Board',
      description: 'Collect, upvote, and prioritize user feedback with categories and status.',
      tags: ['feedback', 'voting', 'universal'],
      appFit: ['universal'],
      jsPath: '../modules/feature-modules-universal/js/feature-feedback-board.js',
      cssPath: '../modules/feature-modules-universal/css/feature-feedback-board.css'
    },
    {
      id: 'workflow-builder',
      name: 'Workflow Builder',
      description: 'Visual trigger-condition-action automation flow designer.',
      tags: ['automation', 'workflow', 'universal'],
      appFit: ['universal'],
      jsPath: '../modules/feature-modules-universal/js/feature-workflow-builder.js',
      cssPath: '../modules/feature-modules-universal/css/feature-workflow-builder.css'
    },
    {
      id: 'accessibility-checker',
      name: 'Accessibility Checker',
      description: 'WCAG audit with pass/fail/warning per rule, score, and re-run.',
      tags: ['accessibility', 'a11y', 'universal'],
      appFit: ['universal'],
      jsPath: '../modules/feature-modules-universal/js/feature-accessibility-checker.js',
      cssPath: '../modules/feature-modules-universal/css/feature-accessibility-checker.css'
    },
    {
      id: 'typography-system',
      name: 'Typography System',
      description: 'Design type scales, font pairings, and preview text hierarchy live.',
      tags: ['design', 'typography', 'universal'],
      appFit: ['universal'],
      jsPath: '../modules/feature-modules-universal/js/feature-typography-system.js',
      cssPath: '../modules/feature-modules-universal/css/feature-typography-system.css'
    }
  ],

  getAll() {
    return this.ITEMS.slice();
  },

  getById(id) {
    return this.ITEMS.find(item => item.id === id) || null;
  },

  getStarterSet() {
    return this.ITEMS.filter(item => item.jsPath.includes('feature-modules-universal'));
  },

  getRecommended(appType) {
    const aliases = {
      'company-x1': 'pm-toolkit',
      'marex-dynamic': 'sight-reading-trainer'
    };
    const normalized = aliases[appType] || appType;
    return this.ITEMS.filter(item => item.appFit.includes(normalized) || item.appFit.includes('universal'));
  },

  getAllTags() {
    const tagSet = new Set();
    this.ITEMS.forEach(item => (item.tags || []).forEach(t => tagSet.add(t)));
    return [...tagSet].sort();
  },

  getByTag(tag) {
    return this.ITEMS.filter(item => (item.tags || []).includes(tag));
  },

  search(query) {
    const q = (query || '').toLowerCase();
    if (!q) return this.ITEMS.slice();
    return this.ITEMS.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      (item.tags || []).some(t => t.includes(q))
    );
  },

  async load(itemId) {
    const item = this.getById(itemId);
    if (!item) throw new Error('Unknown bundled module: ' + itemId);

    const readText = async (path) => {
      if (!path) return '';
      // Resolve relative to the HTML file location (src/)
      const url = new URL(path, window.location.href).toString();
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(response.status);
        return response.text();
      } catch (e) {
        console.warn('[BundledModules] Could not fetch ' + path + ', trying alternate path');
        // Fallback: try without ../modules/ prefix remapping
        const alt = path.replace('../modules/', 'modules/');
        try {
          const r2 = await fetch(alt);
          if (r2.ok) return r2.text();
        } catch (_) {}
        console.error('[BundledModules] Failed to load ' + path);
        return '';
      }
    };

    const [jsSource, cssSource] = await Promise.all([
      readText(item.jsPath),
      readText(item.cssPath)
    ]);

    return { ...item, jsSource, cssSource };
  }
};
