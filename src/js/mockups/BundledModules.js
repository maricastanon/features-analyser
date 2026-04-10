/* ═══════════════════════════════════════════════════════════════
   BundledModules — First-class mockup catalog shipped with repo
   Lets the app load the functional mockups stored in ../modules.
   ═══════════════════════════════════════════════════════════════ */
const ACE_SHARED_JS_PATH = '../modules/feature-modules-universal/js/feature-ace-mock.js';
const ACE_SHARED_CSS_PATH = '../modules/feature-modules-universal/css/feature-ace-mock.css';

const makeAceMockItem = (config) => ({
  id: 'ace-' + config.id,
  name: 'ACE • ' + config.title,
  description: config.short,
  tags: ['ace-template', 'universal', config.familyId, config.preview, ...(config.tags || [])],
  appFit: ['feature-lab-workspace', 'universal'],
  starter: false,
  packId: 'ace-template',
  jsPath: ACE_SHARED_JS_PATH,
  cssPath: ACE_SHARED_CSS_PATH,
  moduleConfig: config
});

const ACE_MOCK_BLUEPRINTS = [
  { id: 'energy-my-day', title: 'Energy My Day Strip', familyId: 'hub', familyLabel: 'Personal Work Hub', kind: 'Extension', preview: 'checklist', short: 'Sort work by energy, not just due date.', benchmarkTie: 'Builds on personal task surfaces and assignment inboxes.', painPoint: 'Daily work lists rarely account for cognitive effort.', value: 'Calmer prioritization for solo and neurodivergent users.', sample: { items: ['Tiny win', 'Deep focus', 'Admin sweep', 'Body break'] } },
  { id: 'focus-bubble-router', title: 'Focus Bubble Router', familyId: 'hub', familyLabel: 'Personal Work Hub', kind: 'Extension', preview: 'board', short: 'Routes items into Quick, Deep, and Waiting.', benchmarkTie: 'Extends assignment views and board-like task grouping.', painPoint: 'People lose time when every task looks equally urgent.', value: 'Reduces context switching and decision friction.', sample: { lanes: ['Quick', 'Deep', 'Waiting'], cards: ['Reply to client', 'Write rollout note', 'Review blocker'] } },
  { id: 'assignment-pulse-feed', title: 'Assignment Pulse Feed', familyId: 'hub', familyLabel: 'Personal Work Hub', kind: 'Extension', preview: 'dashboard', short: 'Highlights what landed today and what can wait.', benchmarkTie: 'Wraps the assigned-to-me and recent-change surfaces.', painPoint: 'Users open too many places to understand what changed.', value: 'Better daily orientation without overwhelm.', sample: { metrics: ['New today', 'Due soon', 'Waiting', 'Safe to ignore'], values: [6, 8, 3, 14] } },

  { id: 'template-composer', title: 'Template Composer', familyId: 'setup', familyLabel: 'Setup + Templates', kind: 'Extension', preview: 'form', short: 'Build reusable setups from smaller building blocks.', benchmarkTie: 'Builds on plan creation and starter templates.', painPoint: 'Teams recreate the same setup choices by hand.', value: 'Makes repeated project setup much faster.', sample: { fields: ['Team goal', 'Plan flavor', 'Required buckets', 'Default labels'] } },
  { id: 'plan-intake-wizard', title: 'Plan Intake Wizard', familyId: 'setup', familyLabel: 'Setup + Templates', kind: 'Extension', preview: 'form', short: 'Turns a plain-language request into a recommended setup.', benchmarkTie: 'Sits before plan creation to guide the initial decision.', painPoint: 'Users choose the wrong plan shape because setup is vague.', value: 'Cuts setup confusion and bad first-fit choices.', sample: { fields: ['Complexity', 'Need timeline?', 'Need goals?', 'Need portfolio?'] } },
  { id: 'bucket-starter-pack', title: 'Bucket Starter Pack', familyId: 'setup', familyLabel: 'Setup + Templates', kind: 'Extension', preview: 'board', short: 'Seeds better default structure from day one.', benchmarkTie: 'Builds on common bucket or section setup patterns.', painPoint: 'Empty boards still require architecture decisions.', value: 'Improves hygiene immediately after project creation.', sample: { lanes: ['Intake', 'Doing', 'Review'], cards: ['Create labels', 'Name plan', 'Set owners'] } },

  { id: 'task-story-card', title: 'Task Story Card', familyId: 'task-card', familyLabel: 'Task Detail Engine', kind: 'Extension', preview: 'form', short: 'Adds why, done-state, and stakeholder context.', benchmarkTie: 'Extends the task detail model with richer narrative prompts.', painPoint: 'Many tasks have fields, but still feel context-free.', value: 'Prevents vague work items with weak narrative.', sample: { fields: ['Why it matters', 'Definition of done', 'Stakeholder', 'Risk note'] } },
  { id: 'attachment-signal-rail', title: 'Attachment Signal Rail', familyId: 'task-card', familyLabel: 'Task Detail Engine', kind: 'Extension', preview: 'table', short: 'Shows which work items are weakly evidenced.', benchmarkTie: 'Builds on file attachments and notes.', painPoint: 'Evidence quality is hidden inside the task instead of surfaced.', value: 'Helpful for audit-heavy or proof-heavy workflows.', sample: { columns: ['Task', 'File state', 'Last touch', 'Signal'], rows: [['Launch checklist', '2 files', 'Today', 'Fresh'], ['Vendor review', 'No file', '4d ago', 'Weak']] } },
  { id: 'checklist-splitter-lab', title: 'Checklist Splitter Lab', familyId: 'task-card', familyLabel: 'Task Detail Engine', kind: 'Extension', preview: 'checklist', short: 'Decides what stays tiny and what becomes a real task.', benchmarkTie: 'Extends checklist handling and promotion logic.', painPoint: 'Checklists become bloated when everything lives at the same level.', value: 'Keeps task cards from becoming messy.', sample: { items: ['Draft outline', 'Get legal review', 'Ping design', 'Archive old notes'] } },

  { id: 'dense-grid-editor', title: 'Dense Grid Editor', familyId: 'views', familyLabel: 'Views + Navigation', kind: 'Extension', preview: 'table', short: 'Adds spreadsheet-style bulk editing.', benchmarkTie: 'Extends grid/list views for high-density maintenance work.', painPoint: 'Bulk cleanups are slow when every row needs separate clicks.', value: 'Great for PMO and cleanup workflows.', sample: { columns: ['Task', 'Owner', 'Due', 'Priority'], rows: [['Rollout doc', 'Ana', 'Apr 12', 'High'], ['QA pass', 'Mo', 'Apr 14', 'Medium']] } },
  { id: 'swimlane-heat-board', title: 'Swimlane Heat Board', familyId: 'views', familyLabel: 'Views + Navigation', kind: 'Extension', preview: 'board', short: 'Adds warm/calm urgency signals to board views.', benchmarkTie: 'Wraps kanban or board views with better scan signals.', painPoint: 'Teams cannot feel urgency and overload at a glance.', value: 'Improves scan speed without opening every card.', sample: { lanes: ['Cool', 'Warm', 'Hot'], cards: ['Safe backlog', 'Needs review', 'Urgent blocker'] } },
  { id: 'calendar-conflict-dock', title: 'Calendar Conflict Dock', familyId: 'views', familyLabel: 'Views + Navigation', kind: 'Extension', preview: 'table', short: 'Shows date collisions and unscheduled work together.', benchmarkTie: 'Extends schedule and calendar-oriented views.', painPoint: 'Unscheduled work and collisions are usually split apart.', value: 'Reduces hidden scheduling risk.', sample: { columns: ['Day', 'Task', 'Conflict'], rows: [['Mon', 'Kickoff', 'None'], ['Tue', 'Review + Demo', 'Double-booked'], ['Wed', 'Unscheduled', 'Needs date']] } },

  { id: 'multi-assignee-handoff', title: 'Multi-Assignee Handoff', familyId: 'collab', familyLabel: 'Collaboration + Assignments', kind: 'Extension', preview: 'workload', short: 'Makes shared ownership explicit.', benchmarkTie: 'Builds on multi-assignee task support.', painPoint: 'Shared responsibility becomes blurry when no baton exists.', value: 'Cuts the “I thought you had it” problem.', sample: { people: ['Ana', 'Bo', 'Chen'], load: [65, 48, 88] } },
  { id: 'decision-log-thread', title: 'Decision Log Thread', familyId: 'collab', familyLabel: 'Collaboration + Assignments', kind: 'Extension', preview: 'checklist', short: 'Captures small decision breadcrumbs.', benchmarkTie: 'Extends comments or task conversations with more structure.', painPoint: 'Important decisions vanish inside loose discussion.', value: 'Improves auditability and continuity.', sample: { items: ['Approved scope', 'Moved due date', 'Waiting on legal'] } },
  { id: 'stakeholder-ping-matrix', title: 'Stakeholder Ping Matrix', familyId: 'collab', familyLabel: 'Collaboration + Assignments', kind: 'Extension', preview: 'matrix', short: 'Scores who needs an update and how hard.', benchmarkTie: 'Extends notifications and stakeholder communication.', painPoint: 'Teams over-message or under-message because cadence is invisible.', value: 'Makes communication rhythm more intentional.', sample: { axes: ['Urgency', 'Impact', 'Visibility'] } },

  { id: 'executive-snapshot', title: 'Executive Snapshot', familyId: 'reporting', familyLabel: 'Reporting + Status', kind: 'Extension', preview: 'dashboard', short: 'One-screen status for leaders.', benchmarkTie: 'Builds on dashboards and exported reports.', painPoint: 'Executives need less detail and more signal.', value: 'Builds trust with non-operator stakeholders.', sample: { metrics: ['On track', 'At risk', 'Done this week', 'Needs decision'], values: [12, 3, 19, 2] } },
  { id: 'completion-funnel', title: 'Completion Funnel', familyId: 'reporting', familyLabel: 'Reporting + Status', kind: 'Extension', preview: 'dashboard', short: 'Shows where work stalls before closing.', benchmarkTie: 'Builds on status and progress reporting.', painPoint: 'Dashboards show progress, but not where flow is getting stuck.', value: 'Useful for process tuning.', sample: { metrics: ['Intake', 'In progress', 'Review', 'Done'], values: [24, 17, 9, 38] } },
  { id: 'export-pack-builder', title: 'Export Pack Builder', familyId: 'reporting', familyLabel: 'Reporting + Status', kind: 'Extension', preview: 'form', short: 'Creates the right share-out pack for each audience.', benchmarkTie: 'Sits on top of export and reporting capabilities.', painPoint: 'Teams still need to package the story outside the app.', value: 'Bridges the gap between app users and everyone else.', sample: { fields: ['Audience', 'Format', 'Need metrics?', 'Need raw rows?'] } },

  { id: 'dependency-playground', title: 'Dependency Playground', familyId: 'premium-scheduling', familyLabel: 'Scheduling + Dependencies', kind: 'Extension', preview: 'timeline', short: 'Visualizes ripple effects of sequence changes.', benchmarkTie: 'Builds on dependency and scheduling layers.', painPoint: 'People cannot see how a change propagates through the plan.', value: 'Makes dependency logic easier to understand.', sample: { tasks: ['Scope', 'Build', 'QA', 'Launch'] } },
  { id: 'critical-chain-lens', title: 'Critical Chain Lens', familyId: 'premium-scheduling', familyLabel: 'Scheduling + Dependencies', kind: 'Extension', preview: 'timeline', short: 'Highlights only the tasks that decide the finish date.', benchmarkTie: 'Extends critical path style views.', painPoint: 'Users see too much schedule information at once.', value: 'Narrows focus and reduces panic.', sample: { tasks: ['Approve copy', 'Build flow', 'Security sign-off', 'Go live'] } },
  { id: 'milestone-pulse', title: 'Milestone Pulse', familyId: 'premium-scheduling', familyLabel: 'Scheduling + Dependencies', kind: 'Extension', preview: 'dashboard', short: 'Turns milestones into a calm comms-ready dashboard.', benchmarkTie: 'Builds on milestone and checkpoint support.', painPoint: 'Milestones are present but not always easy to communicate.', value: 'Improves milestone visibility.', sample: { metrics: ['Next milestone', 'Slipping', 'Locked', 'Green'], values: [4, 1, 3, 9] } },

  { id: 'goal-trace-tree', title: 'Goal Trace Tree', familyId: 'agile-goals', familyLabel: 'Goals + Agile', kind: 'Extension', preview: 'checklist', short: 'Shows whether work is actually connected to goals.', benchmarkTie: 'Extends goals and strategy alignment views.', painPoint: 'Teams lose line-of-sight between tasks and goals.', value: 'Reduces busywork and goal drift.', sample: { items: ['Clear owner', 'Directly tied to goal', 'Has measurable outcome'] } },
  { id: 'sprint-balance-meter', title: 'Sprint Balance Meter', familyId: 'agile-goals', familyLabel: 'Goals + Agile', kind: 'Extension', preview: 'dashboard', short: 'Checks overload, blockers, and ownership before sprint start.', benchmarkTie: 'Builds on sprint and backlog planning.', painPoint: 'Sprint risk is often visible too late.', value: 'Improves sprint quality early.', sample: { metrics: ['Scope load', 'Blockers', 'Carryover', 'Unowned'], values: [82, 4, 3, 1] } },
  { id: 'backlog-gatekeeper', title: 'Backlog Gatekeeper', familyId: 'agile-goals', familyLabel: 'Goals + Agile', kind: 'Extension', preview: 'board', short: 'Adds ready/not-ready intake gates.', benchmarkTie: 'Wraps backlog management with a stronger readiness check.', painPoint: 'Work enters execution before it is really ready.', value: 'Prevents messy sprint starts.', sample: { lanes: ['Idea', 'Clarify', 'Ready'], cards: ['User import bug', 'Metrics request', 'Search polish'] } },

  { id: 'todo-sync-lens', title: 'Sync Lens', familyId: 'integrations', familyLabel: 'Integrations + AI', kind: 'Extension', preview: 'table', short: 'Explains what syncs cleanly and what does not.', benchmarkTie: 'Builds on cross-app sync and assignment visibility.', painPoint: 'People assume all fields behave the same across connected apps.', value: 'Reduces confusion in mixed workflows.', sample: { columns: ['Field', 'Synced cleanly?', 'Note'], rows: [['Name', 'Yes', 'Safe'], ['Advanced fields', 'No', 'Open source app'], ['Checklist', 'Partial', 'Depends on layer']] } },
  { id: 'teams-action-ribbon', title: 'Action Ribbon', familyId: 'integrations', familyLabel: 'Integrations + AI', kind: 'Extension', preview: 'dashboard', short: 'Turns meeting output into structured actions.', benchmarkTie: 'Wraps collaboration surfaces and meeting-derived work.', painPoint: 'Action items are lost between chat and planning.', value: 'Helps capture work from collaboration surfaces.', sample: { metrics: ['Meeting actions', 'Unassigned notes', 'Tasks captured', 'Need follow-up'], values: [9, 4, 13, 2] } },
  { id: 'workflow-safety-checker', title: 'Workflow Safety Checker', familyId: 'integrations', familyLabel: 'Integrations + AI', kind: 'Extension', preview: 'matrix', short: 'Checks if API, automation, and license expectations are realistic.', benchmarkTie: 'Sits ahead of integration and automation build work.', painPoint: 'Teams overestimate what the app can automate or expose.', value: 'Prevents bad build assumptions early.', sample: { axes: ['API fit', 'License fit', 'Automation fit'] } },

  { id: 'license-clarity-map', title: 'License Clarity Map', familyId: 'admin-portfolio', familyLabel: 'Admin + Portfolio', kind: 'Extension', preview: 'matrix', short: 'Shows who can do what across packages.', benchmarkTie: 'Builds directly on tiered capability models.', painPoint: 'Capability boundaries are one of the biggest confusion drivers.', value: 'One of the highest-leverage admin helpers.', sample: { axes: ['Basic', 'Plan 1', 'Plan 3', 'Plan 5'] } },
  { id: 'permission-guardrail-studio', title: 'Permission Guardrail Studio', familyId: 'admin-portfolio', familyLabel: 'Admin + Portfolio', kind: 'Extension', preview: 'table', short: 'Surfaces who can view, edit, or misread a plan.', benchmarkTie: 'Extends role and permission understanding.', painPoint: 'Teams assume access rules they do not actually have.', value: 'Useful for admins and PMOs.', sample: { columns: ['User type', 'Can view', 'Can edit', 'Needs upgrade'], rows: [['M365 user', 'Yes', 'Some', 'Sometimes'], ['Plan 1 user', 'Yes', 'Yes', 'No']] } },
  { id: 'plan-health-audit', title: 'Plan Health Audit', familyId: 'admin-portfolio', familyLabel: 'Admin + Portfolio', kind: 'Extension', preview: 'dashboard', short: 'Scores stale tasks, weak ownership, and overloaded people.', benchmarkTie: 'Builds on the core data already present in the workspace.', painPoint: 'The app shows raw records, but not overall quality.', value: 'Good coaching and cleanup layer.', sample: { metrics: ['Stale tasks', 'No owner', 'No due date', 'Overloaded people'], values: [7, 3, 5, 2] } },

  { id: 'time-tracking-ledger', title: 'Time Tracking Ledger', familyId: 'missing', familyLabel: 'Missing Feature Lane', kind: 'Gap Build', preview: 'table', short: 'Adds native-feeling time logs on top of tasks.', benchmarkTie: 'Targets the common time-tracking gap in planning apps.', painPoint: 'Teams doing services or utilization work need hours, not just tasks.', value: 'A strong missing-feature candidate.', sample: { columns: ['Task', 'Owner', 'Logged', 'Planned'], rows: [['Weekly review', 'Ana', '2h 15m', '2h'], ['Bug triage', 'Bo', '1h 40m', '1h']] } },
  { id: 'and-filter-builder', title: 'AND Filter Builder', familyId: 'missing', familyLabel: 'Missing Feature Lane', kind: 'Gap Build', preview: 'form', short: 'Builds precise slices with AND and OR logic.', benchmarkTie: 'Targets weak filtering logic in many planning tools.', painPoint: 'Operational teams need precise task slices, not fuzzy search.', value: 'High leverage for busy boards.', sample: { fields: ['Label A', 'Label B', 'Owner', 'Status'] } },
  { id: 'completion-date-sorter', title: 'Completion Date Sorter', familyId: 'missing', familyLabel: 'Missing Feature Lane', kind: 'Gap Build', preview: 'table', short: 'Adds direct newest-to-oldest completion review.', benchmarkTie: 'Targets weak completion review and reporting patterns.', painPoint: 'Managers still export just to see recent completions in order.', value: 'Useful for weekly reviews and 1:1s.', sample: { columns: ['Task', 'Owner', 'Completed'], rows: [['Close incident', 'Ana', 'Apr 9'], ['Approve budget', 'Bo', 'Apr 8']] } },
  { id: 'cross-plan-dependency-mesh', title: 'Cross-Plan Dependency Mesh', familyId: 'missing', familyLabel: 'Missing Feature Lane', kind: 'Gap Build', preview: 'timeline', short: 'Links blockers across many plans.', benchmarkTie: 'Extends dependency thinking beyond a single plan.', painPoint: 'Organizations outgrow single-plan dependency views quickly.', value: 'Useful when teams are not ready for a heavier PM suite.', sample: { tasks: ['Plan A sign-off', 'Plan B build', 'Plan C rollout'] } },
  { id: 'portfolio-rollup-wall', title: 'Portfolio Rollup Wall', familyId: 'missing', familyLabel: 'Missing Feature Lane', kind: 'Gap Build', preview: 'dashboard', short: 'Pulls many plans into one leadership wall.', benchmarkTie: 'Targets light portfolio visibility without enterprise overhead.', painPoint: 'Leaders need a simple wall, not a heavyweight portfolio suite.', value: 'Gives lighter portfolio visibility without extra platform sprawl.', sample: { metrics: ['Green plans', 'Yellow plans', 'Red plans', 'Blocked plans'], values: [11, 4, 1, 2] } },
  { id: 'custom-metadata-layer', title: 'Custom Metadata Layer', familyId: 'missing', familyLabel: 'Missing Feature Lane', kind: 'Gap Build', preview: 'form', short: 'Adds project-specific fields and a safer schema layer.', benchmarkTie: 'Targets missing or weak custom-field systems.', painPoint: 'Teams want their own language and metadata model.', value: 'One of the most requested extensibility patterns.', sample: { fields: ['Field name', 'Type', 'Required?', 'Visible in board?'] } },
  { id: 'native-pdf-storyboard', title: 'Native PDF Storyboard', familyId: 'missing', familyLabel: 'Missing Feature Lane', kind: 'Gap Build', preview: 'dashboard', short: 'Builds a polished printable stakeholder pack.', benchmarkTie: 'Targets weak print and executive-share outputs.', painPoint: 'Export exists, but the storytelling layer is missing.', value: 'Useful for execs, clients, and compliance.', sample: { metrics: ['Title page', 'Risk page', 'Task list', 'Milestones'], values: [1, 1, 4, 3] } },
  { id: 'availability-slot-finder', title: 'Availability Slot Finder', familyId: 'missing', familyLabel: 'Missing Feature Lane', kind: 'Gap Build', preview: 'workload', short: 'Finds open coordination slots across people.', benchmarkTie: 'Targets the gap between scheduling and easy staffing visibility.', painPoint: 'Managers need quick answers about who has room, right now.', value: 'High practical value for coordination.', sample: { people: ['Ana', 'Bo', 'Chen'], load: [32, 74, 56] } },
  { id: 'mixed-license-capability-coach', title: 'Mixed-License Capability Coach', familyId: 'missing', familyLabel: 'Missing Feature Lane', kind: 'Gap Build', preview: 'matrix', short: 'Explains exactly what a user can and cannot do.', benchmarkTie: 'Targets confusion between packaged capability layers.', painPoint: 'Capability mismatch generates support tickets and false assumptions.', value: 'Reduces support tickets and wrong expectations.', sample: { axes: ['View', 'Edit', 'Premium views', 'Reports'] } },
  { id: 'status-system-designer', title: 'Status System Designer', familyId: 'missing', familyLabel: 'Missing Feature Lane', kind: 'Gap Build', preview: 'board', short: 'Adds richer workflow states and color semantics.', benchmarkTie: 'Targets rigid default status systems.', painPoint: 'Operations and service teams need more expressive workflow language.', value: 'Useful for operations, service, and content workflows.', sample: { lanes: ['Ready', 'Doing', 'Needs love'], cards: ['Client draft', 'QA retry', 'Waiting on legal'] } }
];

const ACE_INDIVIDUAL_ITEMS = ACE_MOCK_BLUEPRINTS.map(makeAceMockItem);

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
      id: 'ace-template-lab',
      name: 'ACE Template Lab',
      description: 'Reusable feature mapping, complaints, gaps, and mockup queue cockpit. Seeded with Microsoft Planner, adaptable to any app.',
      tags: ['ace', 'template', 'research', 'planning', 'universal'],
      appFit: ['universal', 'pm-toolkit', 'sight-reading-trainer', 'feature-lab-workspace'],
      starter: false,
      packId: 'ace-template',
      jsPath: '../modules/feature-modules-universal/js/feature-ace-template-lab.js',
      cssPath: '../modules/feature-modules-universal/css/feature-ace-template-lab.css'
    },
    ...ACE_INDIVIDUAL_ITEMS,
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
    return this.ITEMS.filter(item => item.jsPath.includes('feature-modules-universal') && item.starter !== false);
  },

  getRecommended(appType) {
    const aliases = {
      'company-x1': 'pm-toolkit',
      'marex-dynamic': 'sight-reading-trainer'
    };
    const normalized = aliases[appType] || appType;

    const curated = {
      'feature-lab-workspace': [
        'ace-template-lab',
        ...ACE_INDIVIDUAL_ITEMS.map(item => item.id),
        'mindmap',
        'dependency-graph',
        'user-stories',
        'workflow-builder',
        'feedback-board'
      ],
      'pm-toolkit': [
        'kanban-board',
        'risk-matrix',
        'role-system',
        'capacity-planner',
        'critical-path',
        'status-reports',
        'report-wizard',
        'time-tracker',
        'vacation-impact',
        'global-search',
        'baselines',
        'qa-testing',
        'dependency-graph',
        'user-stories',
        'api-explorer',
        'data-import-export',
        'feature-flags',
        'accessibility-checker'
      ],
      'sight-reading-trainer': [
        'ai-copilot',
        'ideas-board',
        'offline-mode',
        'custom-dashboard',
        'time-tracker',
        'status-reports',
        'recurring-tasks',
        'custom-backgrounds',
        'mindmap',
        'feedback-board',
        'workflow-builder',
        'notifications',
        'settings-panel',
        'changelog',
        'color-palette',
        'performance-monitor'
      ]
    };

    if (curated[normalized]) {
      return curated[normalized]
        .map(id => this.getById(id))
        .filter(Boolean);
    }

    return this.ITEMS.filter(item => item.appFit.includes(normalized));
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

    const bootSource = item.moduleConfig
      ? `window.__ACE_MOCK_CONFIG__ = ${JSON.stringify(item.moduleConfig)};\n`
      : '';

    return {
      ...item,
      jsSource: bootSource + jsSource,
      cssSource,
      htmlSource: item.htmlSource || ''
    };
  }
};
