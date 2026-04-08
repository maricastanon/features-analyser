/* ═══════════════════════════════════════════════════════════════
   ModuleIntelligence — Static analysis for imported code modules
   Extracts stats, infers category/priority, generates checklists.
   ═══════════════════════════════════════════════════════════════ */
const ModuleIntelligence = {
  analyze({ name, jsSource, cssSource, pythonScripts, project, existingFeatures, existingImprovements }) {
    const js = jsSource || '';
    const css = cssSource || '';
    const slug = this._slug(name);

    // ── Stats ──
    const stats = {
      jsLines: js.split('\n').length,
      cssLines: css.split('\n').length,
      pyLines: (pythonScripts || []).reduce((s, p) => s + (p.source || '').split('\n').length, 0),
      functionCount: (js.match(/\w+\s*\([^)]*\)\s*\{/g) || []).length,
      cssVarCount: (css.match(/--[\w-]+/g) || []).length,
      hasInit: /\.init\s*\(/.test(js),
      hasRender: /\.render\s*\(/.test(js),
      hasExportState: /exportState/.test(js),
      hasImportState: /importState/.test(js),
      objectName: (js.match(/const\s+(\w+)\s*=\s*\{/) || [])[1] || ''
    };

    // ── Category inference ──
    const categories = project?.categories || [];
    const categoryId = this._inferCategory(name, js, css, categories);

    // ── Priority inference ──
    const recommendedPriority = this._inferPriority(name, js, stats);

    // ── Track: feature vs improvement ──
    const featureMatch = (existingFeatures || []).find(f =>
      this._slug(f.name) === slug || f.sourceModuleId === slug
    );
    const improvementMatch = (existingImprovements || []).find(i =>
      this._slug(i.name) === slug || i.sourceModuleId === slug
    );

    let recommendedTrack = 'feature';
    let workflowReason = 'New imports default to feature incubation first.';

    if (improvementMatch) {
      recommendedTrack = 'improvement';
      workflowReason = `Matches existing improvement: "${improvementMatch.name}".`;
    } else if (featureMatch) {
      recommendedTrack = 'feature';
      workflowReason = `Matches existing feature: "${featureMatch.name}".`;
    }

    // ── Summary ──
    const summary = this._generateSummary(name, stats);

    // ── Tags ──
    const tags = this._generateTags(name, stats, js, css);

    // ── Checklist ──
    const checklist = this._generateChecklist(name, stats, recommendedTrack);

    return {
      stats,
      summary,
      categoryId,
      recommendedPriority,
      recommendedTrack,
      workflowReason,
      tags,
      featureMatchId: featureMatch?.id || null,
      improvementMatchId: improvementMatch?.id || null,
      checklist
    };
  },

  _inferCategory(name, js, css, categories) {
    const text = (name + ' ' + js.slice(0, 500)).toLowerCase();
    const patterns = {
      'ai':          /\b(ai|copilot|gpt|llm|prompt|assistant|machine.?learn)\b/,
      'analytics':   /\b(analytic|chart|metric|dashboard|report|graph|statist)\b/,
      'core':        /\b(auth|login|router|store|database|api|core|engine)\b/,
      'ui':          /\b(theme|color|font|layout|style|background|animation|component)\b/,
      'data':        /\b(import|export|csv|json|data|migration|sync|offline)\b/,
      'integration': /\b(integrat|webhook|notification|email|slack|api.?explorer)\b/,
      'collab':      /\b(team|collab|role|permission|share|assign|comment)\b/,
      'security':    /\b(security|encrypt|token|access|audit|compliance)\b/,
      'ideas':       /\b(idea|brainstorm|mindmap|vote|feedback|story)\b/,
      'views':       /\b(kanban|board|timeline|gantt|calendar|list.?view)\b/,
      'productivity':/\b(time|track|recurr|schedule|workflow|automat|flag)\b/
    };

    for (const [catId, regex] of Object.entries(patterns)) {
      if (regex.test(text)) {
        const match = categories.find(c => c.id === catId);
        if (match) return match.id;
      }
    }
    return categories[0]?.id || 'custom';
  },

  _inferPriority(name, js, stats) {
    // More complex = likely higher priority
    if (stats.functionCount >= 15 || stats.jsLines >= 200) return 2;
    if (stats.functionCount >= 8 || stats.jsLines >= 100) return 3;
    return 4;
  },

  _generateSummary(name, stats) {
    const parts = [];
    parts.push(`${name} module`);
    if (stats.objectName) parts.push(`(${stats.objectName})`);
    parts.push(`— ${stats.jsLines} JS lines, ${stats.functionCount} functions`);
    if (stats.cssVarCount > 0) parts.push(`, ${stats.cssVarCount} CSS vars`);
    if (stats.hasInit && stats.hasRender) parts.push('. Self-initializing with render cycle');
    if (stats.hasExportState) parts.push('. Supports state export');
    return parts.join('');
  },

  _generateChecklist(name, stats, track) {
    const items = [
      { text: `Review ${name} mockup in live sandbox`, done: false },
      { text: 'Verify all interactive elements work', done: false },
      { text: 'Customise CSS variables for project theme', done: false },
      { text: 'Write summary describing purpose and value', done: false },
      { text: 'Add improvement notes for future iterations', done: false },
      { text: 'Set correct category and priority', done: false }
    ];

    if (track === 'feature') {
      items.push({ text: 'Promote to Feature when ready', done: false });
    } else {
      items.push({ text: 'Link to existing improvement record', done: false });
    }

    items.push({ text: 'Generate integration guide for target app', done: false });
    items.push({ text: 'Mark done or archive when complete', done: false });

    return items;
  },

  _generateTags(name, stats, js, css) {
    const tags = [];
    const text = `${name} ${js} ${css}`.toLowerCase();

    if (/\b(ai|copilot|prompt|assistant)\b/.test(text)) tags.push('AI');
    if (/\b(board|kanban|timeline|calendar|mindmap|graph)\b/.test(text)) tags.push('Visual');
    if (/\b(role|permission|access|auth)\b/.test(text)) tags.push('Governance');
    if (/\b(sync|offline|import|export)\b/.test(text)) tags.push('Sync');
    if (/\b(report|status|metric|dashboard)\b/.test(text)) tags.push('Reporting');
    if (stats.cssVarCount > 0) tags.push('Theme ready');
    if (stats.hasExportState) tags.push('Stateful');
    if (!tags.length) tags.push('Interactive');

    return tags;
  },

  _slug(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
};
