/* ============================================================
   PM TOOLKIT — Shared Mock Data
   Comprehensive project data for all Gantt variations & tools
   ============================================================ */
var PMData = window.PMData = {};

// ── Helper ──
PMData.dfn = function(n) {
  var d = new Date(); d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};
var D = PMData.dfn;

// ══════════════════════════════════════
// TEAM MEMBERS
// ══════════════════════════════════════
PMData.members = [
  { id: 'm1', name: 'Dr. Clau',     role: 'Tech Lead',        ini: 'DC', color: '#ff4da6', dept: 'Engineering',  rate: 150, capacity: 40 },
  { id: 'm2', name: 'Mari S.',       role: 'Sr. Developer',    ini: 'MS', color: '#00e676', dept: 'Engineering',  rate: 130, capacity: 40 },
  { id: 'm3', name: 'Alex K.',       role: 'DevOps Engineer',  ini: 'AK', color: '#35b8ff', dept: 'Engineering',  rate: 120, capacity: 40 },
  { id: 'm4', name: 'Luna R.',       role: 'UX Designer',      ini: 'LR', color: '#b46eff', dept: 'Design',       rate: 110, capacity: 40 },
  { id: 'm5', name: 'Kai T.',        role: 'QA Engineer',      ini: 'KT', color: '#ffb935', dept: 'Quality',      rate: 100, capacity: 40 },
  { id: 'm6', name: 'Sofia M.',      role: 'Product Manager',  ini: 'SM', color: '#1de9b6', dept: 'Product',      rate: 140, capacity: 40 },
  { id: 'm7', name: 'Rio J.',        role: 'Backend Dev',      ini: 'RJ', color: '#ff6b35', dept: 'Engineering',  rate: 125, capacity: 40 },
  { id: 'm8', name: 'Nina W.',       role: 'Data Analyst',     ini: 'NW', color: '#e040fb', dept: 'Analytics',    rate: 115, capacity: 32 },
];

// ══════════════════════════════════════
// DEPARTMENTS
// ══════════════════════════════════════
PMData.departments = [
  { id: 'd1', name: 'Engineering', color: '#35b8ff', head: 'm1' },
  { id: 'd2', name: 'Design',      color: '#b46eff', head: 'm4' },
  { id: 'd3', name: 'Product',     color: '#1de9b6', head: 'm6' },
  { id: 'd4', name: 'Quality',     color: '#ffb935', head: 'm5' },
  { id: 'd5', name: 'Analytics',   color: '#e040fb', head: 'm8' },
];

// ══════════════════════════════════════
// PROJECTS (for Portfolio Gantt)
// ══════════════════════════════════════
PMData.projects = [
  { id: 'pj1', name: 'The Beastling v2',    color: '#ff4da6', status: 'active',  budget: 180000, spent: 95000,  pm: 'm6', priority: 'high' },
  { id: 'pj2', name: 'Mobile App Launch',    color: '#00e676', status: 'active',  budget: 120000, spent: 42000,  pm: 'm6', priority: 'urgent' },
  { id: 'pj3', name: 'API Platform v3',      color: '#35b8ff', status: 'active',  budget: 95000,  spent: 31000,  pm: 'm1', priority: 'high' },
  { id: 'pj4', name: 'Analytics Dashboard',  color: '#b46eff', status: 'planned', budget: 60000,  spent: 0,      pm: 'm8', priority: 'medium' },
];

// ══════════════════════════════════════
// SPRINTS (for Sprint Gantt)
// ══════════════════════════════════════
PMData.sprints = [
  { id: 'sp1', name: 'Sprint 1 — Foundation',   start: D(-28), end: D(-15), velocity: 34, planned: 32, status: 'done' },
  { id: 'sp2', name: 'Sprint 2 — Core Features', start: D(-14), end: D(-1),  velocity: 38, planned: 36, status: 'done' },
  { id: 'sp3', name: 'Sprint 3 — Views & UX',    start: D(0),   end: D(13),  velocity: null, planned: 40, status: 'active' },
  { id: 'sp4', name: 'Sprint 4 — Polish & QA',    start: D(14),  end: D(27),  velocity: null, planned: 35, status: 'planned' },
  { id: 'sp5', name: 'Sprint 5 — Launch Prep',    start: D(28),  end: D(41),  velocity: null, planned: 30, status: 'planned' },
];

// ══════════════════════════════════════
// GATES & MILESTONES
// ══════════════════════════════════════
PMData.milestones = [
  { id: 'ms1', name: 'Project Kickoff',           date: D(-30), type: 'milestone', status: 'done',     project: 'pj1', icon: '🚀' },
  { id: 'ms2', name: 'Architecture Approved',      date: D(-20), type: 'gate',      status: 'done',     project: 'pj1', icon: '✅', approver: 'm1', criteria: 'Tech review passed' },
  { id: 'ms3', name: 'Design System Complete',     date: D(-10), type: 'milestone', status: 'done',     project: 'pj1', icon: '🎨' },
  { id: 'ms4', name: 'Alpha Release Gate',         date: D(5),   type: 'gate',      status: 'pending',  project: 'pj1', icon: '🔒', approver: 'm6', criteria: 'All P0 bugs fixed, core features working' },
  { id: 'ms5', name: 'Beta Release',               date: D(15),  type: 'milestone', status: 'upcoming', project: 'pj1', icon: '🎯' },
  { id: 'ms6', name: 'Security Audit Gate',        date: D(22),  type: 'gate',      status: 'upcoming', project: 'pj1', icon: '🔐', approver: 'm3', criteria: 'Pen test passed, OWASP top 10 clear' },
  { id: 'ms7', name: 'Performance Benchmark Gate', date: D(28),  type: 'gate',      status: 'upcoming', project: 'pj1', icon: '⚡', approver: 'm1', criteria: '<2s load, <100ms API response' },
  { id: 'ms8', name: 'Launch Readiness Review',    date: D(35),  type: 'gate',      status: 'upcoming', project: 'pj1', icon: '🏁', approver: 'm6', criteria: 'All gates passed, docs complete, support trained' },
  { id: 'ms9', name: '🦁 PRODUCTION LAUNCH',      date: D(40),  type: 'milestone', status: 'upcoming', project: 'pj1', icon: '🦁' },
  // Mobile project
  { id: 'ms10', name: 'Mobile Wireframes Done',    date: D(-5),  type: 'milestone', status: 'done',     project: 'pj2', icon: '📱' },
  { id: 'ms11', name: 'App Store Submission',      date: D(30),  type: 'gate',      status: 'upcoming', project: 'pj2', icon: '📦', approver: 'm6', criteria: 'All store requirements met' },
  { id: 'ms12', name: 'API v3 Spec Freeze',        date: D(10),  type: 'gate',      status: 'upcoming', project: 'pj3', icon: '❄️', approver: 'm1', criteria: 'OpenAPI spec reviewed and locked' },
];

// ══════════════════════════════════════
// TASKS (with Gantt-specific fields)
// ══════════════════════════════════════
PMData.tasks = [
  // ── Phase 1: Foundation (done) ──
  { id: 't1', name: 'Project scaffolding',        start: D(-28), end: D(-24), planned_start: D(-28), planned_end: D(-24),
    assignees: ['m1'],      status: 'done', progress: 100, priority: 'urgent', dept: 'd1', project: 'pj1', sprint: 'sp1',
    effort: 20, deps: [],   phase: 'Foundation', wbs: '1.1', risk: 'low' },
  { id: 't2', name: 'Design system & tokens',     start: D(-27), end: D(-20), planned_start: D(-26), planned_end: D(-21),
    assignees: ['m4','m2'], status: 'done', progress: 100, priority: 'high', dept: 'd2', project: 'pj1', sprint: 'sp1',
    effort: 35, deps: ['t1'], phase: 'Foundation', wbs: '1.2', risk: 'low' },
  { id: 't3', name: 'Database schema design',     start: D(-26), end: D(-22), planned_start: D(-26), planned_end: D(-22),
    assignees: ['m7'],      status: 'done', progress: 100, priority: 'high', dept: 'd1', project: 'pj1', sprint: 'sp1',
    effort: 24, deps: ['t1'], phase: 'Foundation', wbs: '1.3', risk: 'medium' },
  { id: 't4', name: 'CI/CD pipeline setup',       start: D(-25), end: D(-20), planned_start: D(-25), planned_end: D(-19),
    assignees: ['m3'],      status: 'done', progress: 100, priority: 'high', dept: 'd1', project: 'pj1', sprint: 'sp1',
    effort: 28, deps: ['t1'], phase: 'Foundation', wbs: '1.4', risk: 'low' },
  { id: 't5', name: 'State management layer',     start: D(-22), end: D(-18), planned_start: D(-22), planned_end: D(-17),
    assignees: ['m1','m2'], status: 'done', progress: 100, priority: 'urgent', dept: 'd1', project: 'pj1', sprint: 'sp1',
    effort: 32, deps: ['t3'], phase: 'Foundation', wbs: '1.5', risk: 'low' },

  // ── Phase 2: Core Features (done/in progress) ──
  { id: 't6', name: 'Authentication flow (OAuth2+MFA)', start: D(-17), end: D(-8), planned_start: D(-16), planned_end: D(-9),
    assignees: ['m1','m7'], status: 'done', progress: 100, priority: 'urgent', dept: 'd1', project: 'pj1', sprint: 'sp2',
    effort: 48, deps: ['t5'], phase: 'Core Features', wbs: '2.1', risk: 'high' },
  { id: 't7', name: 'Kanban board view',          start: D(-14), end: D(-5), planned_start: D(-14), planned_end: D(-7),
    assignees: ['m2'],      status: 'done', progress: 100, priority: 'high', dept: 'd1', project: 'pj1', sprint: 'sp2',
    effort: 40, deps: ['t5','t2'], phase: 'Core Features', wbs: '2.2', risk: 'low' },
  { id: 't8', name: 'List view with grouping',    start: D(-10), end: D(-3), planned_start: D(-10), planned_end: D(-4),
    assignees: ['m2'],      status: 'done', progress: 100, priority: 'high', dept: 'd1', project: 'pj1', sprint: 'sp2',
    effort: 30, deps: ['t7'], phase: 'Core Features', wbs: '2.3', risk: 'low' },
  { id: 't9', name: 'Drag & drop engine',         start: D(-12), end: D(-3), planned_start: D(-11), planned_end: D(-4),
    assignees: ['m1'],      status: 'done', progress: 100, priority: 'high', dept: 'd1', project: 'pj1', sprint: 'sp2',
    effort: 36, deps: ['t7'], phase: 'Core Features', wbs: '2.4', risk: 'medium' },
  { id: 't10', name: 'Notification system',       start: D(-8), end: D(0), planned_start: D(-7), planned_end: D(1),
    assignees: ['m7'],      status: 'inprogress', progress: 70, priority: 'medium', dept: 'd1', project: 'pj1', sprint: 'sp2',
    effort: 28, deps: ['t6'], phase: 'Core Features', wbs: '2.5', risk: 'low' },

  // ── Phase 3: Views & UX (current sprint) ──
  { id: 't11', name: 'Timeline/Gantt view',       start: D(-2), end: D(6), planned_start: D(0), planned_end: D(7),
    assignees: ['m1','m2'], status: 'inprogress', progress: 55, priority: 'urgent', dept: 'd1', project: 'pj1', sprint: 'sp3',
    effort: 44, deps: ['t8','t9'], phase: 'Views & UX', wbs: '3.1', risk: 'medium' },
  { id: 't12', name: 'Calendar view',             start: D(0), end: D(5), planned_start: D(1), planned_end: D(6),
    assignees: ['m2'],      status: 'inprogress', progress: 40, priority: 'high', dept: 'd1', project: 'pj1', sprint: 'sp3',
    effort: 24, deps: ['t8'], phase: 'Views & UX', wbs: '3.2', risk: 'low' },
  { id: 't13', name: 'Dashboard analytics',       start: D(-1), end: D(8), planned_start: D(2), planned_end: D(9),
    assignees: ['m2','m8'], status: 'inprogress', progress: 35, priority: 'high', dept: 'd1', project: 'pj1', sprint: 'sp3',
    effort: 40, deps: ['t8'], phase: 'Views & UX', wbs: '3.3', risk: 'low' },
  { id: 't14', name: 'People view',               start: D(3), end: D(8), planned_start: D(4), planned_end: D(8),
    assignees: ['m4','m2'], status: 'todo', progress: 0, priority: 'medium', dept: 'd2', project: 'pj1', sprint: 'sp3',
    effort: 20, deps: ['t11'], phase: 'Views & UX', wbs: '3.4', risk: 'low' },
  { id: 't15', name: 'Command palette (Ctrl+K)',  start: D(2), end: D(6), planned_start: D(3), planned_end: D(6),
    assignees: ['m1'],      status: 'inprogress', progress: 60, priority: 'high', dept: 'd1', project: 'pj1', sprint: 'sp3',
    effort: 18, deps: ['t7'], phase: 'Views & UX', wbs: '3.5', risk: 'low' },
  { id: 't16', name: 'UX audit & accessibility',  start: D(5), end: D(12), planned_start: D(6), planned_end: D(12),
    assignees: ['m4'],      status: 'todo', progress: 0, priority: 'high', dept: 'd2', project: 'pj1', sprint: 'sp3',
    effort: 30, deps: ['t11','t12','t13'], phase: 'Views & UX', wbs: '3.6', risk: 'medium' },

  // ── Phase 4: Polish & QA ──
  { id: 't17', name: 'Integration testing suite',  start: D(14), end: D(21), planned_start: D(14), planned_end: D(20),
    assignees: ['m5','m7'], status: 'todo', progress: 0, priority: 'urgent', dept: 'd4', project: 'pj1', sprint: 'sp4',
    effort: 40, deps: ['t11','t12','t13','t14'], phase: 'Polish & QA', wbs: '4.1', risk: 'medium' },
  { id: 't18', name: 'Performance optimization',  start: D(16), end: D(24), planned_start: D(16), planned_end: D(22),
    assignees: ['m1','m3'], status: 'todo', progress: 0, priority: 'high', dept: 'd1', project: 'pj1', sprint: 'sp4',
    effort: 36, deps: ['t17'], phase: 'Polish & QA', wbs: '4.2', risk: 'high' },
  { id: 't19', name: 'Bug fixing sprint',         start: D(18), end: D(26), planned_start: D(18), planned_end: D(25),
    assignees: ['m2','m7','m5'], status: 'todo', progress: 0, priority: 'urgent', dept: 'd1', project: 'pj1', sprint: 'sp4',
    effort: 50, deps: ['t17'], phase: 'Polish & QA', wbs: '4.3', risk: 'medium' },
  { id: 't20', name: 'Documentation & guides',    start: D(20), end: D(30), planned_start: D(20), planned_end: D(28),
    assignees: ['m6','m4'], status: 'todo', progress: 0, priority: 'medium', dept: 'd3', project: 'pj1', sprint: 'sp4',
    effort: 32, deps: ['t16'], phase: 'Polish & QA', wbs: '4.4', risk: 'low' },

  // ── Phase 5: Launch ──
  { id: 't21', name: 'Staging deployment',        start: D(27), end: D(30), planned_start: D(27), planned_end: D(29),
    assignees: ['m3'],      status: 'todo', progress: 0, priority: 'urgent', dept: 'd1', project: 'pj1', sprint: 'sp5',
    effort: 16, deps: ['t18','t19'], phase: 'Launch', wbs: '5.1', risk: 'medium' },
  { id: 't22', name: 'UAT & stakeholder review',  start: D(30), end: D(35), planned_start: D(30), planned_end: D(34),
    assignees: ['m6','m5'], status: 'todo', progress: 0, priority: 'urgent', dept: 'd3', project: 'pj1', sprint: 'sp5',
    effort: 24, deps: ['t21'], phase: 'Launch', wbs: '5.2', risk: 'high' },
  { id: 't23', name: 'Production deployment',     start: D(36), end: D(38), planned_start: D(35), planned_end: D(37),
    assignees: ['m3','m1'], status: 'todo', progress: 0, priority: 'urgent', dept: 'd1', project: 'pj1', sprint: 'sp5',
    effort: 16, deps: ['t22'], phase: 'Launch', wbs: '5.3', risk: 'high' },
  { id: 't24', name: 'Post-launch monitoring',    start: D(38), end: D(44), planned_start: D(37), planned_end: D(42),
    assignees: ['m3','m7'], status: 'todo', progress: 0, priority: 'high', dept: 'd1', project: 'pj1', sprint: 'sp5',
    effort: 28, deps: ['t23'], phase: 'Launch', wbs: '5.4', risk: 'medium' },

  // ── Mobile App project tasks ──
  { id: 'mt1', name: 'Mobile wireframes',         start: D(-15), end: D(-5), planned_start: D(-14), planned_end: D(-6),
    assignees: ['m4'],      status: 'done', progress: 100, priority: 'high', dept: 'd2', project: 'pj2', sprint: null,
    effort: 30, deps: [], phase: 'Design', wbs: 'M1.1', risk: 'low' },
  { id: 'mt2', name: 'React Native setup',        start: D(-5), end: D(3), planned_start: D(-4), planned_end: D(4),
    assignees: ['m7'],      status: 'inprogress', progress: 65, priority: 'high', dept: 'd1', project: 'pj2', sprint: null,
    effort: 32, deps: ['mt1'], phase: 'Development', wbs: 'M2.1', risk: 'medium' },
  { id: 'mt3', name: 'Core mobile features',      start: D(4), end: D(18), planned_start: D(5), planned_end: D(18),
    assignees: ['m7','m2'], status: 'todo', progress: 0, priority: 'urgent', dept: 'd1', project: 'pj2', sprint: null,
    effort: 56, deps: ['mt2'], phase: 'Development', wbs: 'M2.2', risk: 'high' },
  { id: 'mt4', name: 'Mobile testing & QA',       start: D(19), end: D(28), planned_start: D(19), planned_end: D(27),
    assignees: ['m5'],      status: 'todo', progress: 0, priority: 'high', dept: 'd4', project: 'pj2', sprint: null,
    effort: 36, deps: ['mt3'], phase: 'QA', wbs: 'M3.1', risk: 'medium' },

  // ── API v3 project tasks ──
  { id: 'at1', name: 'API spec & design',         start: D(-10), end: D(2), planned_start: D(-10), planned_end: D(0),
    assignees: ['m1','m7'], status: 'inprogress', progress: 80, priority: 'high', dept: 'd1', project: 'pj3', sprint: null,
    effort: 40, deps: [], phase: 'Design', wbs: 'A1.1', risk: 'low' },
  { id: 'at2', name: 'New endpoints development', start: D(3), end: D(20), planned_start: D(3), planned_end: D(18),
    assignees: ['m7','m3'], status: 'todo', progress: 0, priority: 'urgent', dept: 'd1', project: 'pj3', sprint: null,
    effort: 60, deps: ['at1'], phase: 'Development', wbs: 'A2.1', risk: 'high' },
  { id: 'at3', name: 'API migration tooling',     start: D(15), end: D(25), planned_start: D(14), planned_end: D(24),
    assignees: ['m3'],      status: 'todo', progress: 0, priority: 'high', dept: 'd1', project: 'pj3', sprint: null,
    effort: 36, deps: ['at2'], phase: 'Development', wbs: 'A2.2', risk: 'high' },
];

// ══════════════════════════════════════
// RISKS
// ══════════════════════════════════════
PMData.risks = [
  { id: 'r1', name: 'Auth security vulnerabilities',     likelihood: 4, impact: 5, category: 'Technical',    status: 'mitigated', owner: 'm1', mitigation: 'Pen testing + OWASP audit', tasks: ['t6'], project: 'pj1' },
  { id: 'r2', name: 'Performance bottlenecks at scale',  likelihood: 3, impact: 4, category: 'Technical',    status: 'open',      owner: 'm1', mitigation: 'Load testing + CDN + caching', tasks: ['t18'], project: 'pj1' },
  { id: 'r3', name: 'Scope creep on dashboard features', likelihood: 4, impact: 3, category: 'Scope',        status: 'monitoring', owner: 'm6', mitigation: 'Strict feature freeze after Sprint 3', tasks: ['t13'], project: 'pj1' },
  { id: 'r4', name: 'Key developer burnout',             likelihood: 3, impact: 5, category: 'Resource',     status: 'monitoring', owner: 'm6', mitigation: 'Rotate assignments, enforce PTO', tasks: [], project: 'pj1' },
  { id: 'r5', name: 'Third-party API changes',           likelihood: 2, impact: 4, category: 'External',     status: 'open',      owner: 'm3', mitigation: 'Abstraction layer + fallback providers', tasks: ['at2'], project: 'pj3' },
  { id: 'r6', name: 'App store rejection',               likelihood: 3, impact: 5, category: 'External',     status: 'open',      owner: 'm6', mitigation: 'Pre-submission review, follow guidelines strictly', tasks: ['mt4'], project: 'pj2' },
  { id: 'r7', name: 'Data migration failures',           likelihood: 3, impact: 4, category: 'Technical',    status: 'open',      owner: 'm7', mitigation: 'Dry runs + rollback plan + validation scripts', tasks: ['at3'], project: 'pj3' },
  { id: 'r8', name: 'Launch date slip',                  likelihood: 4, impact: 4, category: 'Schedule',     status: 'monitoring', owner: 'm6', mitigation: 'Weekly scope reviews, MVP definition', tasks: ['t23'], project: 'pj1' },
  { id: 'r9', name: 'Accessibility compliance failure',  likelihood: 2, impact: 3, category: 'Compliance',   status: 'open',      owner: 'm4', mitigation: 'WCAG 2.1 AA audit + automated testing', tasks: ['t16'], project: 'pj1' },
  { id: 'r10',name: 'Budget overrun',                    likelihood: 3, impact: 3, category: 'Financial',    status: 'monitoring', owner: 'm6', mitigation: 'Bi-weekly budget reviews', tasks: [], project: 'pj1' },
];

// ══════════════════════════════════════
// RACI DATA
// ══════════════════════════════════════
PMData.raci = [
  { activity: 'Architecture Decisions',    R: ['m1'],      A: ['m1'], C: ['m2','m3','m7'], I: ['m6'] },
  { activity: 'UI/UX Design',             R: ['m4'],      A: ['m6'], C: ['m2'],           I: ['m1','m5'] },
  { activity: 'Frontend Development',     R: ['m2','m1'], A: ['m1'], C: ['m4'],           I: ['m6','m5'] },
  { activity: 'Backend Development',      R: ['m7','m3'], A: ['m1'], C: ['m2'],           I: ['m6'] },
  { activity: 'DevOps & Infrastructure',  R: ['m3'],      A: ['m1'], C: ['m7'],           I: ['m6'] },
  { activity: 'Quality Assurance',        R: ['m5'],      A: ['m6'], C: ['m1','m2','m7'], I: [] },
  { activity: 'Product Decisions',        R: ['m6'],      A: ['m6'], C: ['m1','m4'],      I: ['m2','m3','m5','m7'] },
  { activity: 'Security Reviews',         R: ['m3','m1'], A: ['m1'], C: ['m7'],           I: ['m6','m5'] },
  { activity: 'Release Management',       R: ['m3'],      A: ['m6'], C: ['m1','m5'],      I: ['m2','m4','m7'] },
  { activity: 'Documentation',            R: ['m6','m4'], A: ['m6'], C: ['m1','m2'],      I: ['m3','m5','m7'] },
  { activity: 'Data Analysis & Reporting', R: ['m8'],     A: ['m6'], C: ['m1'],           I: ['m2','m3'] },
  { activity: 'Client Communication',     R: ['m6'],      A: ['m6'], C: ['m1'],           I: ['m4'] },
];

// ══════════════════════════════════════
// BUDGET DATA
// ══════════════════════════════════════
PMData.budgetItems = [
  { id: 'bg1', category: 'Personnel',       planned: 120000, actual: 68000,  project: 'pj1', month: -1 },
  { id: 'bg2', category: 'Infrastructure',  planned: 18000,  actual: 12000,  project: 'pj1', month: -1 },
  { id: 'bg3', category: 'Tools & Licenses', planned: 8000,  actual: 5500,   project: 'pj1', month: -1 },
  { id: 'bg4', category: 'Testing & QA',    planned: 15000,  actual: 4500,   project: 'pj1', month: -1 },
  { id: 'bg5', category: 'Contingency',     planned: 19000,  actual: 5000,   project: 'pj1', month: -1 },
];

PMData.budgetMonthly = [
  { month: 'Jan', planned: 25000, actual: 22000 },
  { month: 'Feb', planned: 30000, actual: 28000 },
  { month: 'Mar', planned: 35000, actual: 33000 },
  { month: 'Apr', planned: 40000, actual: 12000 },
  { month: 'May', planned: 30000, actual: 0 },
  { month: 'Jun', planned: 20000, actual: 0 },
];

// ══════════════════════════════════════
// DECISIONS / ACTION LOG
// ══════════════════════════════════════
PMData.decisions = [
  { id: 'dec1', date: D(-25), title: 'Use vanilla JS instead of React', type: 'decision', status: 'approved', owner: 'm1',
    description: 'No framework dependency, smaller bundle, full control', participants: ['m1','m2','m6'], impact: 'high' },
  { id: 'dec2', date: D(-20), title: 'Pink/green dark theme as default', type: 'decision', status: 'approved', owner: 'm4',
    description: 'ADHD-friendly, high contrast, distinctive brand identity', participants: ['m4','m2','m6'], impact: 'medium' },
  { id: 'dec3', date: D(-15), title: 'AWS Cognito for auth', type: 'decision', status: 'approved', owner: 'm1',
    description: 'Managed auth service, MFA built-in, scalable', participants: ['m1','m3','m7'], impact: 'high' },
  { id: 'dec4', date: D(-5), title: 'Postpone offline mode to v2.1', type: 'decision', status: 'approved', owner: 'm6',
    description: 'De-scope to meet launch date, PWA service worker later', participants: ['m6','m1','m2'], impact: 'medium' },
  { id: 'dec5', date: D(0), title: 'Add Gantt view to MVP', type: 'decision', status: 'pending', owner: 'm6',
    description: 'High demand from beta testers, competitive advantage', participants: ['m6','m1','m2','m4'], impact: 'high' },
  { id: 'dec6', date: D(-10), title: 'Investigate API rate limiting', type: 'action', status: 'in_progress', owner: 'm3',
    description: 'Research token bucket vs sliding window', participants: ['m3','m7'], impact: 'medium', due: D(5) },
  { id: 'dec7', date: D(-3), title: 'Schedule security pen test', type: 'action', status: 'open', owner: 'm3',
    description: 'Book external security firm for pre-launch audit', participants: ['m3','m1'], impact: 'high', due: D(10) },
  { id: 'dec8', date: D(-1), title: 'Update project status for stakeholders', type: 'action', status: 'open', owner: 'm6',
    description: 'Prepare status report for exec review', participants: ['m6'], impact: 'low', due: D(2) },
];

// ══════════════════════════════════════
// BURNDOWN DATA (Sprint 3 daily)
// ══════════════════════════════════════
PMData.burndown = [
  { day: 0, remaining: 40, ideal: 40 },
  { day: 1, remaining: 38, ideal: 37.1 },
  { day: 2, remaining: 35, ideal: 34.3 },
  { day: 3, remaining: 34, ideal: 31.4 },
  { day: 4, remaining: 30, ideal: 28.6 },
  { day: 5, remaining: 28, ideal: 25.7 },
  { day: 6, remaining: 26, ideal: 22.9 },
  { day: 7, remaining: 25, ideal: 20.0 },
  { day: 8, remaining: null, ideal: 17.1 },
  { day: 9, remaining: null, ideal: 14.3 },
  { day: 10, remaining: null, ideal: 11.4 },
  { day: 11, remaining: null, ideal: 8.6 },
  { day: 12, remaining: null, ideal: 5.7 },
  { day: 13, remaining: null, ideal: 2.9 },
  { day: 14, remaining: null, ideal: 0 },
];

console.log('%c📦 PMData loaded: ' + PMData.tasks.length + ' tasks, ' + PMData.milestones.length + ' milestones, ' + PMData.risks.length + ' risks', 'color:#00e676;font-size:11px');
