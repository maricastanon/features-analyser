const source = (id, group, strategy, title, url, dateNote, summary) => ({
  id,
  group,
  strategy,
  title,
  url,
  dateNote,
  summary
});

const makeModule = (
  id,
  familyId,
  title,
  type,
  status,
  short,
  plannerTie,
  painPoint,
  sources,
  buildValue,
  sample
) => ({
  id,
  familyId,
  title,
  type,
  status,
  short,
  plannerTie,
  painPoint,
  sources,
  buildValue,
  sample
});

const SOURCES = [
  source(
    "official-compare",
    "Official",
    "Feature comparison",
    "Compare Microsoft Planner basic vs. premium plans - Microsoft Support",
    "https://support.microsoft.com/en-us/office/compare-microsoft-planner-basic-vs-premium-plans-5e351170-4ed5-43dc-bf30-d6762f5a6968",
    "Checked via web search on April 9, 2026; crawled last month.",
    "Best official basic-vs-premium capability table. It confirms Grid, Board, Charts, Excel export, To Do visibility, Timeline, People, dependencies, milestones, goals, sprints, custom calendars, task history, and more."
  ),
  source(
    "official-create-plan",
    "Official",
    "Plan creation",
    "Create a plan in Planner - Microsoft Support",
    "https://support.microsoft.com/en-us/office/create-a-plan-in-planner-cbbf3772-4fdd-4f49-aa92-dc2203c062d7",
    "Checked on April 9, 2026; crawled 2 weeks ago.",
    "Confirms new plan creation supports Basic or Premium from scratch or from templates, and explicitly mentions goals, agile planning, and dependency tracking."
  ),
  source(
    "official-help",
    "Official",
    "Product overview",
    "Planner help & learning - Microsoft Support",
    "https://support.microsoft.com/en-us/planner",
    "Checked on April 9, 2026; crawled 3 weeks ago.",
    "Official high-level overview of the new Planner: To Do + Planner + Project + Copilot in one app."
  ),
  source(
    "official-premium",
    "Official",
    "Premium capability detail",
    "Advanced capabilities with premium plans in Planner - Microsoft Support",
    "https://support.microsoft.com/en-us/office/advanced-capabilities-with-premium-plans-in-planner-6cdba2aa-da06-4e08-be4c-baaa4fda17ba",
    "Checked on April 9, 2026; crawled 3 weeks ago.",
    "Deep detail on Goals, People view, advanced dependencies, Timeline, Critical Path, Milestones, Custom Calendar, Custom Fields, Conditional Coloring, Summary/Subtasks, Task History, and more."
  ),
  source(
    "official-faq",
    "Official",
    "Licensing FAQ",
    "Frequently asked questions about Microsoft Planner - Microsoft Support",
    "https://support.microsoft.com/en-us/office/frequently-asked-questions-about-microsoft-planner-d1a2d4e6-a4d7-408c-a48a-31caaa267de5",
    "Checked on April 9, 2026; crawled 3 weeks ago.",
    "Important for mixed-license realities: Microsoft 365 users can edit some premium-plan details but advanced premium views need paid licenses."
  ),
  source(
    "official-pricing",
    "Official",
    "Pricing + tier map",
    "Compare work management offerings - Microsoft Planner",
    "https://www.microsoft.com/en-us/microsoft-365/planner/microsoft-planner-plans-and-pricing",
    "Checked on April 9, 2026; crawled 2 days ago.",
    "Key current pricing/tier page. Shows Planner in Microsoft 365, Planner Plan 1, Planner and Project Plan 3, and Plan 5. Also notes Project Online retirement on September 30, 2026."
  ),
  source(
    "official-product",
    "Official",
    "Product page",
    "Task and Project Management Software - Microsoft Planner",
    "https://www.microsoft.com/en-us/microsoft-365/planner/microsoft-planner",
    "Checked on April 9, 2026; crawled 3 weeks ago.",
    "Marketing summary of major feature buckets and pricing. Useful for quick tier communication."
  ),
  source(
    "official-recurring",
    "Official",
    "Task recurrence",
    "Recurring tasks in Planner - Microsoft Support",
    "https://support.microsoft.com/en-us/office/recurring-tasks-in-planner-9f2561ee-45ee-4834-955b-c457f8bb0490",
    "Checked on April 9, 2026; crawled 3 weeks ago.",
    "Important correction source: recurring tasks are available now in Planner, with daily/weekly/monthly/yearly/custom options."
  ),
  source(
    "official-schedule",
    "Official",
    "Calendar details",
    "Use Schedule view in Microsoft Planner - Microsoft Support",
    "https://support.microsoft.com/en-us/office/use-schedule-view-in-microsoft-planner-1b46f8a4-a29a-4d18-8276-4e4d2af5a953",
    "Checked on April 9, 2026; crawled 3 weeks ago.",
    "Confirms unscheduled tasks, recurring-task visibility, and calendar behavior."
  ),
  source(
    "official-todo",
    "Official",
    "Cross-app sync",
    "See Planner tasks in Microsoft To Do - Microsoft Support",
    "https://support.microsoft.com/en-us/office/see-planner-tasks-in-microsoft-to-do-4cac0115-4e4c-44f7-80ae-d1e25ec0527e",
    "Checked on April 9, 2026; crawled last month.",
    "Confirms Assigned to me sync and which task fields can be edited from To Do."
  ),
  source(
    "official-assign",
    "Official",
    "Assignment rules",
    "Assign people to tasks - Microsoft Support",
    "https://support.microsoft.com/en-us/office/assign-people-to-tasks-3a1b23f0-4dce-43a2-ae0f-b4c7bc1164b4",
    "Checked on April 9, 2026; crawled 3 weeks ago.",
    "Confirms multi-assignee behavior and up to 11 assignees per task."
  ),
  source(
    "official-priority",
    "Official",
    "Task priority",
    "Create task priorities using Planner - Microsoft Support",
    "https://support.microsoft.com/en-us/office/create-task-priorities-using-planner-a5f2e3db-8c04-4cfa-b54e-24ae0c4b4f1b",
    "Checked on April 9, 2026; crawled 2 weeks ago.",
    "Confirms Urgent, Important, Medium, and Low priority fields plus group-by-priority."
  ),
  source(
    "official-organize",
    "Official",
    "Core usage",
    "Organize your team's tasks in Microsoft Planner - Microsoft Support",
    "https://support.microsoft.com/en-us/office/organize-your-team-s-tasks-in-microsoft-planner-c931a8a8-0cbb-4410-b66e-ae13233135fb",
    "Checked on April 9, 2026; crawled 3 weeks ago.",
    "Confirms group-backed plan model, progress reports, and basic collaboration patterns."
  ),
  source(
    "review-capterra",
    "Review",
    "User review synthesis",
    "Microsoft Planner Reviews 2026 - Capterra",
    "https://www.capterra.com/p/227201/Microsoft-Planner/reviews/",
    "Last updated January 15, 2026.",
    "Recent verified user reviews. Repeating themes: easy for small teams, limited for larger/complex work, subtask limits, and extra cost for advanced capabilities."
  ),
  source(
    "review-g2-summary",
    "Review",
    "User review synthesis",
    "Microsoft Planner Reviews - G2",
    "https://www.g2.com/products/microsoft-planner/reviews",
    "Published last month; crawled 3 weeks ago.",
    "G2 AI review summary highlights ease of use and integration as strengths, with missing advanced features and reporting depth as common drawbacks."
  ),
  source(
    "review-g2-pros-cons",
    "Review",
    "Pros and cons",
    "Microsoft Planner Pros and Cons - G2",
    "https://www.g2.com/products/microsoft-planner/reviews?qs=pros-and-cons",
    "Checked on April 9, 2026; crawled 3 weeks ago.",
    "Useful for complaint phrasing. Mentions lack of native Gantt for some users, limited advanced reporting, and difficulty with complex projects."
  ),
  source(
    "community-custom-fields",
    "Community",
    "Missing feature request",
    "Custom fields on tasks in Microsoft Planner - Microsoft Q&A",
    "https://learn.microsoft.com/en-us/answers/questions/4407231/custom-fields-on-tasks-in-microsoft-planner",
    "Original question June 19, 2020; crawled 3 weeks ago.",
    "Long-running demand signal for custom fields."
  ),
  source(
    "community-custom-fields-api",
    "Community",
    "Current API gap",
    "Is custom field creation supported in Microsoft Planner via Microsoft Graph API? - Microsoft Q&A",
    "https://learn.microsoft.com/en-us/answers/questions/5818699/is-custom-field-creation-supported-in-microsoft-pl",
    "Question March 12, 2026; Microsoft answer March 13, 2026.",
    "Very current evidence: custom field creation/management is not supported via Microsoft Graph."
  ),
  source(
    "community-label-filter",
    "Community",
    "Current filtering gap",
    "Microsoft Planner - How can I filter by multiple labels at the same time? - Microsoft Q&A",
    "https://learn.microsoft.com/en-us/answers/questions/5455478/microsoft-planner-how-can-i-filter-by-multiple-lab",
    "Question May 20, 2025; crawled 3 weeks ago.",
    "Confirms label filtering currently uses OR logic, not AND logic."
  ),
  source(
    "community-custom-columns",
    "Community",
    "Display customization gap",
    "Customize columns/fields in a Plan in Planner for Teams - Microsoft Q&A",
    "https://learn.microsoft.com/en-us/answers/questions/230bee3d-0092-4a7c-be50-9b258b5968fa/customize-columnsfields-in-a-plan-in-planner-for?forum=msteams-all",
    "Question May 9, 2024; crawled 5 months ago.",
    "Shows continued demand for custom fields and custom grid/board field display."
  ),
  source(
    "community-time-tracking",
    "Community",
    "Current missing feature",
    "Does Microsoft Planner Have Any Time Recording Features? - Microsoft Q&A",
    "https://learn.microsoft.com/en-us/answers/questions/14ac7748-3a50-44a0-a2fb-4ec7e8a35cf4/does-microsoft-planner-have-any-time-recording?forum=msoffice-all",
    "Question February 1, 2024; crawled 5 months ago.",
    "Microsoft moderator answer says Planner has no built-in time recording and no roadmap commitment was announced."
  ),
  source(
    "community-availability",
    "Community",
    "Capacity visibility gap",
    "Microsoft Planner - See Available Time Slot per Team-Member - Microsoft Q&A",
    "https://learn.microsoft.com/en-us/answers/questions/4440475/microsoft-planner-see-available-time-slot-per-team",
    "Question July 15, 2024; crawled 3 weeks ago.",
    "Demand signal for simple schedule-based availability slots per person."
  ),
  source(
    "community-sort-completed",
    "Community",
    "Reporting/sort gap",
    "Planner/Tasks - Sort Task Completion from Newest to Oldest for an Employee - Microsoft Q&A",
    "https://learn.microsoft.com/en-us/answers/questions/5768583/planner-tasks-sort-task-completion-from-newest-to",
    "Question February 9, 2026; crawled 3 weeks ago.",
    "AI-assisted Microsoft Q&A answer says direct sorting by completion date is not available inside the app; export/API is suggested."
  ),
  source(
    "reddit-limits",
    "Community",
    "Limitations list",
    "Microsoft Planner - know your limits and work within them - Reddit thread",
    "https://www.reddit.com/r/MicrosoftPlanner/comments/1m44073",
    "Published July 19, 2025; comment August 13, 2025.",
    "Current user complaint thread noting Outlook/To Do friction, no premium calendar view, no print option, and color customization frustrations."
  ),
  source(
    "review-forbes",
    "Review",
    "External review",
    "Microsoft Planner Review - Forbes Advisor",
    "https://www.forbes.com/advisor/business/software/microsoft-planner-review/",
    "Crawled 3 weeks ago.",
    "External editorial review: good usability but limited compared with stronger PM suites, and advanced features cost extra."
  )
];

const FEATURE_FAMILIES = [
  {
    id: "hub",
    name: "🧠 Personal Work Hub",
    tier: "🟩 Basic + Premium",
    hasNow: [
      "My Day, My Tasks, and Assigned to me are core surfaces in the new Planner.",
      "Assigned Planner tasks can appear inside Microsoft To Do.",
      "Users can edit some task details directly from To Do, but not every premium field."
    ],
    caveats: [
      "Mixed-license behavior is not always intuitive.",
      "Premium-plan editing is partial if a user only has Microsoft 365 Planner access."
    ],
    sourceIds: ["official-help", "official-faq", "official-todo", "official-product"],
    modules: ["energy-my-day", "focus-bubble-router", "assignment-pulse-feed"]
  },
  {
    id: "setup",
    name: "🪄 Plan Setup + Templates",
    tier: "🟩 Basic + 🟨 Premium templates",
    hasNow: [
      "Users can create Basic or Premium plans from scratch or from templates.",
      "Plan copy exists in both Basic and Premium.",
      "Premium tiers add richer templates and broader PM scaffolding."
    ],
    caveats: [
      "Template power rises with paid tiers.",
      "Feature discovery can feel split between support docs and pricing pages."
    ],
    sourceIds: ["official-create-plan", "official-compare", "official-pricing"],
    modules: ["template-composer", "plan-intake-wizard", "bucket-starter-pack"]
  },
  {
    id: "task-card",
    name: "🗂️ Task Detail Engine",
    tier: "🟩 Basic + Premium",
    hasNow: [
      "Content-rich tasks support files, checklists, labels, notes, priority, due dates, and assignments.",
      "Checklist items can be promoted into tasks.",
      "Task priorities now support Urgent, Important, Medium, and Low."
    ],
    caveats: [
      "Subtask depth is still not equivalent to heavyweight PM suites.",
      "Users still complain about subtask limits and richer detail needs."
    ],
    sourceIds: ["official-pricing", "official-priority", "official-compare", "review-capterra"],
    modules: ["task-story-card", "attachment-signal-rail", "checklist-splitter-lab"]
  },
  {
    id: "views",
    name: "🧭 Views + Navigation",
    tier: "🟩 Grid/Board/Schedule/Charts + 🟨 Timeline/People premium",
    hasNow: [
      "Basic plans officially support Grid, Board, Schedule, and Charts.",
      "Premium adds Timeline and People view.",
      "Filter/grouping is supported across major plan views."
    ],
    caveats: [
      "User complaints about missing Gantt often come from Basic users or older experiences.",
      "Filtering logic is still limited for some workflows."
    ],
    sourceIds: ["official-compare", "official-schedule", "community-label-filter", "review-g2-summary"],
    modules: ["dense-grid-editor", "swimlane-heat-board", "calendar-conflict-dock"]
  },
  {
    id: "collab",
    name: "🤝 Collaboration + Assignments",
    tier: "🟩 Basic + Premium",
    hasNow: [
      "Tasks can be assigned to multiple people; current support says up to 11 people.",
      "Planner supports task conversations and team notifications.",
      "Real-time collaboration works through Planner web/Teams surfaces."
    ],
    caveats: [
      "Task conversations in premium plans have Teams-channel requirements.",
      "Multi-person handoffs still feel thin for complex workflows."
    ],
    sourceIds: ["official-assign", "official-compare", "official-pricing", "review-capterra"],
    modules: ["multi-assignee-handoff", "decision-log-thread", "stakeholder-ping-matrix"]
  },
  {
    id: "reporting",
    name: "📊 Reporting + Status",
    tier: "🟩 Basic view access + 🟨 richer build/report tiers",
    hasNow: [
      "Charts/dashboards exist in the product.",
      "Export to Excel is available in both Basic and Premium according to support comparison.",
      "Pricing page distinguishes view-only vs build-capable report experiences across tiers."
    ],
    caveats: [
      "Users repeatedly say advanced reporting still feels shallow or too expensive.",
      "Completion-date sorting/reporting still needs workarounds."
    ],
    sourceIds: ["official-compare", "official-pricing", "community-sort-completed", "review-g2-pros-cons"],
    modules: ["executive-snapshot", "completion-funnel", "export-pack-builder"]
  },
  {
    id: "premium-scheduling",
    name: "⏱️ Premium Scheduling",
    tier: "🟨 Premium / Plan 1 / Plan 3+",
    hasNow: [
      "Premium brings Timeline (Gantt), People view, dependencies, milestones, custom fields, custom calendars, conditional coloring, task history, and critical path.",
      "Plan 3 adds baselines and more advanced project/program capabilities."
    ],
    caveats: [
      "This is where the biggest capability jump happens.",
      "Many complaints are really about Basic vs Premium mismatch rather than absolute absence."
    ],
    sourceIds: ["official-compare", "official-premium", "official-pricing"],
    modules: ["dependency-playground", "critical-chain-lens", "milestone-pulse"]
  },
  {
    id: "agile-goals",
    name: "🎯 Goals + Agile",
    tier: "🟨 Premium / Plan 1+",
    hasNow: [
      "Premium plans support goals, backlogs, and sprints.",
      "Create-plan support article explicitly calls out agile planning and goals."
    ],
    caveats: [
      "These capabilities are not evenly visible to Basic users.",
      "Teams looking for full agile suites may still find the experience light."
    ],
    sourceIds: ["official-create-plan", "official-premium", "official-product"],
    modules: ["goal-trace-tree", "sprint-balance-meter", "backlog-gatekeeper"]
  },
  {
    id: "integrations",
    name: "🔗 Integrations + AI",
    tier: "🟩 Basic integrations + 🟨 premium AI",
    hasNow: [
      "Official pages highlight Teams, Outlook, Loop, To Do, and Copilot touchpoints.",
      "Copilot in Planner is currently called out as preview in premium tiers.",
      "Microsoft 365 plans can collaborate in Planner web and Teams."
    ],
    caveats: [
      "Users still report Outlook/To Do friction and capability confusion.",
      "Graph/API surface remains narrower than some teams expect."
    ],
    sourceIds: ["official-help", "official-product", "official-pricing", "reddit-limits", "community-custom-fields-api"],
    modules: ["todo-sync-lens", "teams-action-ribbon", "workflow-safety-checker"]
  },
  {
    id: "admin-portfolio",
    name: "🏢 Admin + Portfolio Layers",
    tier: "🟨 Plan 3 / 🟨 Plan 5",
    hasNow: [
      "Plan 3 adds baselines, roadmaps, resource requests, budgeting/costing, and program management.",
      "Plan 5 adds advanced portfolio management and enterprise resource allocation."
    ],
    caveats: [
      "This is the most expensive part of the stack.",
      "Users on Basic or Plan 1 often still need some of these outcomes."
    ],
    sourceIds: ["official-pricing", "official-product", "review-forbes"],
    modules: ["license-clarity-map", "permission-guardrail-studio", "plan-health-audit"]
  }
];

const MISSING_FEATURES = [
  {
    id: "time-tracking",
    name: "⏳ Native time tracking",
    status: "❌ Still missing",
    why: "Microsoft Q&A says Planner has no built-in time recording and no announced roadmap commitment in the cited answer.",
    impact: "Teams doing billable work, service operations, or utilization review still need add-ons or external tools.",
    sourceIds: ["community-time-tracking"]
  },
  {
    id: "label-and-filter",
    name: "🧩 AND logic for multi-label filtering",
    status: "❌ Still missing",
    why: "Current Q&A answer says Planner label filtering uses OR logic, not AND logic.",
    impact: "Harder to create precise operational slices without workarounds.",
    sourceIds: ["community-label-filter"]
  },
  {
    id: "completion-date-sort",
    name: "📅 Direct sort by completion date inside the app",
    status: "❌ Still missing",
    why: "Current Q&A answer suggests export/API workarounds for completion-date sorting.",
    impact: "Weekly review and performance check-ins stay clunkier than they should be.",
    sourceIds: ["community-sort-completed"]
  },
  {
    id: "custom-field-api",
    name: "🧱 Graph API support for custom task fields",
    status: "❌ Still missing",
    why: "Microsoft answered in March 2026 that true custom field creation/management is not supported in Graph.",
    impact: "Developers cannot build a clean app-native metadata layer around Planner tasks.",
    sourceIds: ["community-custom-fields-api"]
  },
  {
    id: "availability-slots",
    name: "👥 Easy person-by-person availability slots",
    status: "🟨 Partial",
    why: "People view exists in premium, but users still ask for simpler visible free-slot scheduling in routine team planning.",
    impact: "Managers need faster lightweight capacity answers than the full premium scheduling stack sometimes gives.",
    sourceIds: ["official-premium", "community-availability"]
  },
  {
    id: "complex-project-depth",
    name: "🏗️ Better complex-project depth in lower tiers",
    status: "🟨 Tier-limited",
    why: "Reviews keep describing Planner as great for simpler work but thin for larger/more complex programs.",
    impact: "Users outgrow Basic quickly, especially with dependencies, metadata, and reporting needs.",
    sourceIds: ["review-capterra", "review-g2-summary", "review-forbes"]
  },
  {
    id: "custom-columns",
    name: "🪪 Flexible custom columns / field display",
    status: "🟨 Partial",
    why: "Custom fields exist in premium docs, but users still ask for more display customization and broader access patterns.",
    impact: "Grid/board layouts cannot always match team mental models.",
    sourceIds: ["official-premium", "community-custom-columns", "community-custom-fields"]
  },
  {
    id: "license-clarity",
    name: "💳 Simpler mixed-license understanding",
    status: "🟨 Partial",
    why: "FAQ and pricing pages are informative, but the product still has meaningful capability boundaries that confuse teams.",
    impact: "People think a feature is missing when it is really tier-gated, or think they can edit more than they can.",
    sourceIds: ["official-faq", "official-pricing", "review-forbes", "reddit-limits"]
  },
  {
    id: "native-print-pdf",
    name: "🖨️ Native print / polished PDF export",
    status: "❌ Weak signal but likely missing",
    why: "A current Reddit complaint explicitly calls out no print option; official docs emphasize Excel export, not polished plan printouts.",
    impact: "Harder to share clean snapshots with non-Planner stakeholders.",
    sourceIds: ["official-compare", "reddit-limits"]
  },
  {
    id: "status-taxonomy",
    name: "🌈 Richer task status taxonomy + task color meaning",
    status: "🟨 Partial",
    why: "Users want more visual/status control; premium adds conditional coloring and colored buckets, but not all scenarios are satisfied.",
    impact: "Teams with nuanced workflow states still reach for custom workarounds.",
    sourceIds: ["official-premium", "reddit-limits"]
  }
];

const COMPLAINT_THEMES = [
  {
    id: "complaint-licensing",
    theme: "💳 Licensing + tier confusion",
    signal: 5,
    status: "🟨 Partial / confusing",
    summary: "Many 'missing feature' complaints are really about Basic vs Premium vs Plan 3/5 boundaries.",
    sourceIds: ["official-faq", "official-pricing", "review-forbes", "reddit-limits"]
  },
  {
    id: "complaint-complexity",
    theme: "🏗️ Too light for complex projects",
    signal: 5,
    status: "🟨 Tier-limited",
    summary: "Users like Planner for simple-to-medium work, but say larger or multi-person complex projects hit a ceiling.",
    sourceIds: ["review-capterra", "review-g2-summary", "review-g2-pros-cons"]
  },
  {
    id: "complaint-reporting",
    theme: "📊 Reporting depth feels shallow",
    signal: 4,
    status: "🟨 Partial / cost-gated",
    summary: "Reporting exists, but deeper analytics and polished executive reporting are still a complaint theme.",
    sourceIds: ["official-pricing", "review-g2-pros-cons", "review-g2-summary"]
  },
  {
    id: "complaint-custom",
    theme: "🧱 Metadata + custom fields pain",
    signal: 4,
    status: "🟨 Partial / API gap remains",
    summary: "Premium supports custom fields, but broader custom-field expectations and API control are still frustrated areas.",
    sourceIds: ["official-premium", "community-custom-fields", "community-custom-fields-api", "community-custom-columns"]
  },
  {
    id: "complaint-time",
    theme: "⏳ No built-in time tracking",
    signal: 4,
    status: "❌ Missing",
    summary: "Time recording remains absent according to the cited Microsoft community answer.",
    sourceIds: ["community-time-tracking"]
  },
  {
    id: "complaint-filtering",
    theme: "🧩 Filtering / sorting logic gaps",
    signal: 3,
    status: "❌ Missing",
    summary: "AND label filters and completion-date sorting still require workarounds.",
    sourceIds: ["community-label-filter", "community-sort-completed"]
  },
  {
    id: "complaint-capacity",
    theme: "👥 Easy availability planning is weak",
    signal: 3,
    status: "🟨 Partial",
    summary: "People view exists in premium, but teams still ask for simple per-person free-slot visibility.",
    sourceIds: ["official-premium", "community-availability"]
  },
  {
    id: "complaint-visual-control",
    theme: "🌈 More visual control wanted",
    signal: 2,
    status: "🟨 Partial",
    summary: "Color/status/layout customization is better in premium, but users still ask for more control.",
    sourceIds: ["official-premium", "reddit-limits"]
  }
];

const MODULES = [];

MODULES.push(
  makeModule("energy-my-day","hub","💡 Energy My Day Strip","checklist","extends","Adds an ADHD-friendly energy lane on top of My Day.","Builds on Planner My Day / My Tasks surfaces.","Planner has assignment views, but not a built-in energy-aware triage layer.",["official-help","official-todo"],"High value for solo focus and neurodivergent-friendly task triage.",{ title: "Today Energy Mix", items: ["Tiny win", "Deep focus", "Admin sweep", "Body break"] }),
  makeModule("focus-bubble-router","hub","🫧 Focus Bubble Router","board","extends","Routes tasks into brain-friendly buckets like Quick, Deep, Waiting.","Extends Assigned to me + Board patterns.","Planner groups by plan fields well, but not by moment-to-moment cognitive effort.",["official-compare","official-todo"],"Makes Planner friendlier for context switching.",{ lanes: ["Quick", "Deep", "Waiting"], cards: ["Reply to client", "Write rollout note", "Review blocker"] }),
  makeModule("assignment-pulse-feed","hub","📮 Assignment Pulse Feed","dashboard","extends","Shows what landed today, what changed, and what can wait.","Leans on Assigned to me and task updates.","Planner does not spotlight attention changes in a cute low-stress feed.",["official-faq","official-todo"],"Good for daily orientation without opening many plans.",{ metrics: ["New today", "Due soon", "Waiting", "Safe to ignore"] }),

  makeModule("template-composer","setup","🧰 Template Composer","form","extends","Assembles a starter plan recipe from repeatable building blocks.","Matches Planner plan/template creation.","Planner has templates, but teams often need faster internal template assembly.",["official-create-plan","official-pricing"],"Reduces setup friction for recurring plan types.",{ fields: ["Team goal", "Plan flavor", "Required buckets", "Default labels"] }),
  makeModule("plan-intake-wizard","setup","🪄 Plan Intake Wizard","form","extends","Transforms a plain-language request into a recommended Basic or Premium plan setup.","Sits in front of Planner plan creation.","New users still get lost in Basic vs Premium decisions.",["official-create-plan","official-faq","official-pricing"],"Turns license confusion into a guided decision.",{ fields: ["Project complexity", "Need timeline?", "Need goals?", "Need portfolio?"] }),
  makeModule("bucket-starter-pack","setup","🧺 Bucket Starter Pack","board","extends","Instant bucket and label starter layout for a new team.","Extends board/bucket setup.","Planner lets teams start fast, but sensible bucket architecture still takes thought.",["official-compare","official-organize"],"Helpful for getting better plan hygiene from day one.",{ lanes: ["Intake", "Doing", "Review"], cards: ["Create labels", "Name plan", "Set owners"] }),

  makeModule("task-story-card","task-card","📖 Task Story Card","form","extends","Turns a bare task into a richer story with why, done-state, owner mood, and stakeholder note.","Extends content-rich task cards.","Planner tasks hold lots of fields, but not always the narrative context teams want.",["official-pricing","official-priority"],"Helps teams avoid vague task cards.",{ fields: ["Why it matters", "Definition of done", "Stakeholder", "Risk note"] }),
  makeModule("attachment-signal-rail","task-card","📎 Attachment Signal Rail","table","extends","Summarizes which tasks have files, weak evidence, stale docs, or no proof.","Builds on file-rich task details.","Planner stores attachments but does not foreground attachment quality very well.",["official-pricing","official-todo"],"Good for operations and audit-heavy teams.",{ columns: ["Task", "File state", "Last touch", "Signal"], rows: [["Launch checklist", "2 files", "Today", "Fresh"], ["Vendor review", "No file", "4d ago", "Weak"]] }),
  makeModule("checklist-splitter-lab","task-card","✅ Checklist Splitter Lab","checklist","extends","Lets users decide which checklist items should stay tiny and which should become tasks.","Directly extends checklist-to-task behavior.","Support docs confirm promotion exists, but teams may want a calmer staging UI.",["official-priority","official-compare"],"Useful for preventing giant messy task cards.",{ title: "Promote only what deserves a task", items: ["Draft outline", "Get legal review", "Ping design", "Archive old notes"] }),

  makeModule("dense-grid-editor","views","🧾 Dense Grid Editor","table","extends","Faster multi-row editing surface for bulk plan cleanup.","Builds on Grid view thinking.","Users want a more spreadsheet-like edit flow for routine cleanups.",["official-compare","review-capterra"],"High-value for PMO/admin work.",{ columns: ["Task", "Owner", "Due", "Priority"], rows: [["Rollout doc", "Ana", "Apr 12", "High"], ["QA pass", "Mo", "Apr 14", "Medium"]] }),
  makeModule("swimlane-heat-board","views","🔥 Swimlane Heat Board","board","extends","Adds warm/calm attention signals on a board without opening every task.","Enhances Board view.","Planner board is clear, but not expressive enough for urgency + overload at a glance.",["official-compare","official-priority"],"Useful for teams who love kanban but need more visual signal.",{ lanes: ["Cool", "Warm", "Hot"], cards: ["Safe backlog", "Needs review", "Urgent blocker"] }),
  makeModule("calendar-conflict-dock","views","🗓️ Calendar Conflict Dock","calendar","extends","Shows calendar collisions and unscheduled tasks in one gentle dock.","Builds on Schedule view and unscheduled task handling.","Schedule exists, but many teams still need easier conflict scanning.",["official-schedule","official-compare"],"Helps reduce date surprise and missed unscheduled work.",{ days: ["Mon", "Tue", "Wed", "Thu", "Fri"], tasks: ["Kickoff", "Review", "Buffer"] }),

  makeModule("multi-assignee-handoff","collab","🤲 Multi-Assignee Handoff","workload","extends","Makes shared ownership less fuzzy with explicit baton passes.","Builds on multi-assignee support.","Tasks can have many assignees, but responsibility can still feel blurry.",["official-assign","review-capterra"],"Cuts 'I thought you had it' moments.",{ people: ["Ana", "Bo", "Chen"], load: [65, 48, 88] }),
  makeModule("decision-log-thread","collab","💬 Decision Log Thread","checklist","extends","Stores tiny decision breadcrumbs attached to a task.","Pairs with task conversations.","Planner conversations exist, but decision capture is not very structured.",["official-compare","official-organize"],"Good for audit trails and lower stress collaboration.",{ title: "Decision breadcrumbs", items: ["Approved scope", "Moved due date", "Waiting on legal"] }),
  makeModule("stakeholder-ping-matrix","collab","📣 Stakeholder Ping Matrix","matrix","extends","Scores who needs an update, how soon, and how loud the ping should be.","Wraps around collaboration and notifications.","Teams often over-message or under-message because Planner does not coach comms rhythm.",["official-compare","official-pricing"],"Useful for project leads and coordinators.",{ axes: ["Urgency", "Impact", "Visibility"] }),

  makeModule("executive-snapshot","reporting","📈 Executive Snapshot","dashboard","extends","One-screen status card for leaders who will not open the whole plan.","Extends charts/reports/export.","Planner reports exist, but executives often need simpler narrative snapshots.",["official-compare","official-pricing","review-g2-summary"],"High value for stakeholder trust.",{ metrics: ["On track", "At risk", "Done this week", "Needs decision"] }),
  makeModule("completion-funnel","reporting","🪄 Completion Funnel","dashboard","extends","Shows where tasks stall: intake, active work, review, close.","Builds on existing chart/report signals.","Planner can show progress, but not always where flow friction lives.",["official-pricing","review-g2-pros-cons"],"Great for process tuning.",{ metrics: ["Intake", "In progress", "Review", "Done"] }),
  makeModule("export-pack-builder","reporting","🧾 Export Pack Builder","form","extends","Generates the right export mix: Excel, summary card, meeting note, or PDF brief.","Wraps around Excel export and report sharing.","Users still want easier clean shareable outputs.",["official-compare","reddit-limits"],"Good bridge between Planner users and non-Planner viewers.",{ fields: ["Audience", "Format", "Need metrics?", "Need raw task rows?"] }),

  makeModule("dependency-playground","premium-scheduling","🔗 Dependency Playground","timeline","extends","Friendly dependency lab with visible ripple effects.","Builds on premium dependencies.","Dependencies exist, but many teams need a safer way to understand the consequences.",["official-premium","official-compare"],"Makes sequencing easier to teach.",{ tasks: ["Scope", "Build", "QA", "Launch"] }),
  makeModule("critical-chain-lens","premium-scheduling","🧵 Critical Chain Lens","timeline","extends","Highlights the few tasks that actually decide the finish date.","Extends critical path.","Support docs confirm critical path, but teams often need a cleaner attention lens.",["official-premium"],"Good for reducing panic and narrowing focus.",{ tasks: ["Approve copy", "Build flow", "Security sign-off", "Go live"] }),
  makeModule("milestone-pulse","premium-scheduling","🏁 Milestone Pulse","dashboard","extends","Turns milestones into a calm pulse dashboard.","Builds on milestone support.","Milestones exist, but often need softer comms-ready visibility.",["official-premium","official-compare"],"Great for status meetings.",{ metrics: ["Next milestone", "Slipping", "Locked", "Green"] }),

  makeModule("goal-trace-tree","agile-goals","🌱 Goal Trace Tree","checklist","extends","Shows which tasks truly support which goal.","Builds on premium Goals.","Goals exist, but teams still need a stronger everyday line-of-sight tool.",["official-premium","official-product"],"Helps reduce meaningless task churn.",{ title: "Goal link check", items: ["Clear owner", "Directly tied to goal", "Has measurable outcome"] }),
  makeModule("sprint-balance-meter","agile-goals","🏃 Sprint Balance Meter","dashboard","extends","Checks if a sprint is overloaded, under-defined, or lopsided.","Builds on backlogs and sprints.","Agile support exists, but sprint quality signals can still be lightweight.",["official-premium","official-create-plan"],"Helps teams before the sprint starts.",{ metrics: ["Scope load", "Blockers", "Carryover", "Unowned"] }),
  makeModule("backlog-gatekeeper","agile-goals","🚪 Backlog Gatekeeper","board","extends","Adds a ready/not-ready funnel before work enters a sprint.","Wraps around backlog use.","Planner can hold backlog items, but teams still need a stronger intake gate.",["official-premium"],"Useful for reducing sprint trash fire starts.",{ lanes: ["Idea", "Clarify", "Ready"], cards: ["User import bug", "Metrics request", "Search polish"] }),

  makeModule("todo-sync-lens","integrations","🔁 To Do Sync Lens","table","extends","Explains what will sync cleanly to To Do and what still needs Planner proper.","Builds on official To Do integration.","Current integration is useful but not fully obvious.",["official-todo","reddit-limits"],"Reduces user confusion in mixed personal/team workflows.",{ columns: ["Field", "Editable in To Do?", "Note"], rows: [["Name", "Yes", "Safe"], ["Advanced premium fields", "No", "Open Planner"]] }),
  makeModule("teams-action-ribbon","integrations","🎀 Teams Action Ribbon","dashboard","extends","Turns Planner tasks into meeting-to-action handoff ribbons.","Wraps Teams + Planner collaboration.","Planner works in Teams, but action capture can still feel scattered.",["official-product","official-pricing"],"Great for meeting-heavy teams.",{ metrics: ["Meeting actions", "Unassigned notes", "Tasks captured", "Need follow-up"] }),
  makeModule("workflow-safety-checker","integrations","🛟 Workflow Safety Checker","matrix","extends","Checks whether flows, automations, and API expectations exceed current Planner limits.","Builds on integration expectations.","Developers often assume Planner API depth that is not really there.",["community-custom-fields-api","official-pricing"],"Good pre-build sanity layer.",{ axes: ["API fit", "License fit", "Automation fit"] }),

  makeModule("license-clarity-map","admin-portfolio","🗺️ License Clarity Map","matrix","extends","Explains who can do what across Basic, Plan 1, Plan 3, and Plan 5.","Builds directly on official tier docs.","This is one of Planner's biggest practical pain points.",["official-faq","official-pricing","official-compare"],"High-value admin helper.",{ axes: ["Basic", "Plan 1", "Plan 3", "Plan 5"] }),
  makeModule("permission-guardrail-studio","admin-portfolio","🛡️ Permission Guardrail Studio","table","extends","Shows who can view, edit, or accidentally misread a plan.","Wraps mixed group/license behavior.","Users can collaborate, but role expectations are not always intuitive.",["official-faq","official-organize"],"Useful for admins and PMOs.",{ columns: ["User type", "Can view", "Can edit", "Needs upgrade"], rows: [["M365 user", "Yes", "Some premium plan edits", "Sometimes"], ["Plan 1 user", "Yes", "Yes", "No"]] }),
  makeModule("plan-health-audit","admin-portfolio","🩺 Plan Health Audit","dashboard","extends","Scores plan hygiene: stale tasks, no owners, weak dates, overloaded people.","Sits above any plan.","Planner shows task data but not always plan quality itself.",["official-pricing","official-premium","review-forbes"],"Helpful for admin cleanup and coaching.",{ metrics: ["Stale tasks", "No owner", "No due date", "Overloaded people"] }),

  makeModule("time-tracking-ledger","missing","⏳ Time Tracking Ledger","table","missing","Adds a native-feeling time log layer on top of tasks.","Fills a currently missing capability.","Planner does not have built-in time recording in the cited Microsoft answer.",["community-time-tracking"],"One of the clearest true gaps.",{ columns: ["Task", "Owner", "Logged", "Planned"], rows: [["Weekly review", "Ana", "2h 15m", "2h"], ["Bug triage", "Bo", "1h 40m", "1h"]] }),
  makeModule("and-filter-builder","missing","🧩 AND Filter Builder","form","missing","Builds precise filter logic with AND/OR chips and saved slices.","Fills a current label-filter gap.","Planner currently uses OR logic for multi-label filtering.",["community-label-filter"],"High leverage for busy boards.",{ fields: ["Label A", "Label B", "Owner", "Status"] }),
  makeModule("completion-date-sorter","missing","📅 Completion Date Sorter","table","missing","Adds direct newest-to-oldest completion review.","Fills a current reporting gap.","Current Microsoft Q&A answer suggests export/API rather than direct in-app sorting.",["community-sort-completed"],"Useful for 1:1 reviews and weekly ops.",{ columns: ["Task", "Owner", "Completed"], rows: [["Close incident", "Ana", "Apr 9"], ["Approve budget", "Bo", "Apr 8"]] }),
  makeModule("cross-plan-dependency-mesh","missing","🕸️ Cross-Plan Dependency Mesh","timeline","missing","Links blockers across multiple plans, not just one plan timeline.","Bridges a practical portfolio gap.","Planner premium handles dependencies inside plans, but cross-plan dependency thinking is still a common unmet need in lighter tiers.",["official-premium","official-pricing","review-capterra"],"Big value for organizations not ready for heavier PM suites.",{ tasks: ["Plan A sign-off", "Plan B build", "Plan C rollout"] }),
  makeModule("portfolio-rollup-wall","missing","🧱 Portfolio Rollup Wall","dashboard","missing","Pulls many plans into one simple leadership wall.","Targets a portfolio visibility need.","Advanced portfolio capability is expensive in Plan 5; many teams want a lighter version.",["official-pricing","review-forbes"],"Strong value for PMOs and department leads.",{ metrics: ["Green plans", "Yellow plans", "Red plans", "Blocked plans"] }),
  makeModule("custom-metadata-layer","missing","🧱 Custom Metadata Layer","form","missing","Adds flexible project-specific fields with a safe local schema.","Targets metadata and API pain.","Teams still want broader custom-field power and programmatic support.",["community-custom-fields","community-custom-fields-api","community-custom-columns"],"One of the most requested extension patterns.",{ fields: ["Field name", "Type", "Required?", "Visible in board?"] }),
  makeModule("native-pdf-storyboard","missing","🖨️ Native PDF Storyboard","dashboard","missing","Builds a polished printable stakeholder sheet from a plan.","Targets print/export frustration.","Users still complain about missing print options while official docs focus on Excel export.",["official-compare","reddit-limits"],"Good for execs, clients, and compliance packs.",{ metrics: ["Title page", "Risk page", "Task list", "Milestones"] }),
  makeModule("availability-slot-finder","missing","👥 Availability Slot Finder","workload","missing","Finds the easiest open slot across people without full heavyweight resource planning.","Targets schedule/capacity gap.","Users still ask for simpler free-slot visibility than current schedule views provide.",["community-availability","official-premium"],"High practical value for coordination.",{ people: ["Ana", "Bo", "Chen"], load: [32, 74, 56] }),
  makeModule("mixed-license-capability-coach","missing","💳 Mixed-License Capability Coach","matrix","missing","Explains exactly what a user can do before they hit a wall.","Targets licensing confusion.","The product is powerful, but the capability map is not obvious enough in daily use.",["official-faq","official-pricing","reddit-limits"],"Reduces support tickets and mistaken assumptions.",{ axes: ["View", "Edit", "Premium views", "Reports"] }),
  makeModule("status-system-designer","missing","🌈 Status System Designer","board","missing","Creates richer visual workflow states than the default feel supports.","Targets status/color nuance pain.","Users want more expressive visual language for task state and urgency.",["official-premium","reddit-limits"],"Great for operations, content, and service workflows.",{ lanes: ["Ready", "Doing", "Needs love"], cards: ["Client draft", "QA retry", "Waiting on legal"] })
);

const MODULE_INDEX = Object.fromEntries(MODULES.map(module => [module.id, module]));

const BUILD_ORDER = [
  "time-tracking-ledger",
  "and-filter-builder",
  "completion-date-sorter",
  "custom-metadata-layer",
  "availability-slot-finder",
  "portfolio-rollup-wall",
  "mixed-license-capability-coach",
  "native-pdf-storyboard",
  "cross-plan-dependency-mesh",
  "status-system-designer"
];

export const DATA = {
  meta: {
    product: "Microsoft Planner",
    researchDate: "2026-04-09",
    reportName: "Microsoft Planner Deep Map + Cute Gap Lab",
    strategyName: "Feature Map + Complaint Synthesis + Functional Module Studio",
    featureFamilyCount: FEATURE_FAMILIES.length,
    totalModules: MODULES.length,
    existingModules: MODULES.filter(module => module.status === "extends").length,
    missingModules: MODULES.filter(module => module.status === "missing").length,
    sourceCount: SOURCES.length
  },
  quickTake: [
    "🟩 Planner is now much broader than the old basic board tool. Basic plans officially include Grid, Board, Schedule, Charts, Excel export, My Day/My Tasks, and To Do visibility.",
    "🟨 Premium layers add the biggest jump: Timeline, People, goals, sprints, dependencies, custom fields, critical path, and more.",
    "❌ The clearest true gaps from current evidence are built-in time tracking, AND label filtering, direct completion-date sorting in-app, and Graph API support for custom field creation.",
    "⚠️ A lot of user frustration is really tier confusion: many 'missing' features exist, but only in paid Planner tiers."
  ],
  tiers: [
    { name: "Planner in Microsoft 365", badge: "🟩 Included / Basic", color: "pink", price: "Included with Microsoft 365", features: ["My Day, My Tasks, Assigned to me", "Grid, Board, Schedule, Charts", "Files, checklists, labels", "Basic templates", "Real-time collaboration"], sources: ["official-pricing", "official-product", "official-help"] },
    { name: "Planner Plan 1", badge: "🟨 Premium", color: "green", price: "$10/user/month paid yearly", features: ["Timeline (Gantt)", "Task dependencies", "Goals", "Backlogs and sprints", "People management"], sources: ["official-pricing", "official-product", "official-compare"] },
    { name: "Planner and Project Plan 3", badge: "🟨 Advanced Premium", color: "yellow", price: "$30/user/month paid yearly", features: ["Task history", "Baselines and critical path", "Roadmaps", "Financials / budgeting / costing", "Program management"], sources: ["official-pricing"] },
    { name: "Planner and Project Plan 5", badge: "🟨 Portfolio", color: "yellow", price: "$55/user/month paid yearly", features: ["Advanced portfolio management", "Enterprise resource management", "Enterprise allocation"], sources: ["official-pricing"] }
  ],
  featureFamilies: FEATURE_FAMILIES,
  missingFeatures: MISSING_FEATURES,
  complaintThemes: COMPLAINT_THEMES,
  modules: MODULES,
  moduleIndex: MODULE_INDEX,
  buildOrder: BUILD_ORDER,
  sources: SOURCES
};
