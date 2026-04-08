/* ═══════════════════════════════════════════════════════════════
   AIPrompt — Template-based AI prompt generator
   Uses project config (theme, file structure, module pattern)
   to generate contextual prompts for feature implementation.
   ═══════════════════════════════════════════════════════════════ */
const AIPrompt = {
  PRIORITY_LABELS: { 1: 'CRITICAL', 2: 'HIGH', 3: 'MEDIUM', 4: 'LOW', 5: 'SOMEDAY' },

  generate(feature) {
    const project = App.currentProject;
    if (!project) return 'No project configured. Create a project first.';

    const cat = Categories.getById(feature.category) || { emoji: '📦', name: 'Custom' };
    const slug = feature.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
    const t = project.theme;

    // Build theme vars string
    const themeVars = `/* Project Theme */
--bg-deep: ${t.bgDeep};
--bg-card: ${t.bgCard};
--bg-surface: ${t.bgSurface};
--border-soft: ${t.borderSoft};
--accent-primary: ${t.primary};
--accent-secondary: ${t.secondary};
--text-primary: ${t.textPrimary};
--text-muted: ${t.textMuted};
Font: ${t.fontFamily}
Mode: ${t.mode}`;

    // Build integration steps
    const integrationSteps = `1. Add <link rel="stylesheet" href="css/${slug}.css"> in index.html <head>
2. Add <script src="js/${slug}.js"></script> before </body>
3. Add container div: <div id="${slug}Container" class="tab-body"></div>
4. Register in app routing/tab system
5. Call ${feature.name.replace(/[^a-zA-Z0-9]/g, '')}.init() on tab switch
${project.pythonDir ? `6. Python algorithms go in: ${project.pythonDir}${slug}.py` : ''}`;

    // Use project's template or fallback
    let template = project.aiPromptTemplate || this._defaultTemplate();

    // Replace placeholders
    const replacements = {
      '{{name}}':             feature.name,
      '{{slug}}':             slug,
      '{{description}}':      feature.description || '[Add description]',
      '{{categoryEmoji}}':    cat.emoji,
      '{{categoryName}}':     cat.name,
      '{{priorityLabel}}':    this.PRIORITY_LABELS[feature.priority] || 'MEDIUM',
      '{{themeVars}}':         themeVars,
      '{{integrationSteps}}': integrationSteps,
      '{{fileStructure}}':    project.fileStructure || '',
      '{{modulePattern}}':    project.modulePattern || ''
    };

    for (const [placeholder, value] of Object.entries(replacements)) {
      template = template.split(placeholder).join(value);
    }

    return template;
  },

  _defaultTemplate() {
    return `## Feature Implementation Request

**Feature:** {{name}}
**Category:** {{categoryEmoji}} {{categoryName}}
**Priority:** {{priorityLabel}}
**Description:** {{description}}

### Architecture
Create TWO files:
1. \`js/{{slug}}.js\` — Module following project pattern
2. \`css/{{slug}}.css\` — Styles using CSS variables

### Theme Variables
\`\`\`css
{{themeVars}}
\`\`\`

### Module Pattern
\`\`\`js
{{modulePattern}}
\`\`\`

### File Structure
\`\`\`
{{fileStructure}}
\`\`\`

### Integration Steps
{{integrationSteps}}

### Requirements
- Dark + light mode support
- Mobile responsive
- Keyboard shortcuts where applicable
- Visual feedback on all actions
- Collapsible sections for complex UIs`;
  }
};
