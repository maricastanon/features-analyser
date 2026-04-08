/* ═══════════════════════════════════════════════════════════════
   CodeGenerator — Generate HTML/JS/CSS/Python snippets
   Fills in UIPattern templates with actual module data.
   ═══════════════════════════════════════════════════════════════ */
const CodeGenerator = {
  generate(patternId, config) {
    const pattern = UIPatterns.getPattern(patternId);
    if (!pattern) return null;

    const slug = config.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
    const moduleName = config.name.replace(/[^a-zA-Z0-9]/g, '');
    const project = App.currentProject;

    const replacements = {
      '{{name}}':       config.name,
      '{{slug}}':       slug,
      '{{emoji}}':      config.emoji || '📦',
      '{{ModuleName}}': moduleName
    };

    const replace = (template) => {
      let result = template;
      for (const [placeholder, value] of Object.entries(replacements)) {
        result = result.split(placeholder).join(value);
      }
      return result;
    };

    const result = {
      html: replace(pattern.html || ''),
      js: replace(pattern.js || ''),
      css: replace(pattern.css || ''),
      python: '',
      checklist: []
    };

    // Generate Python bridge if needed
    if (config.usePython && project) {
      result.python = `# ${config.name} — Python Algorithm
# Location: ${project.pythonDir || 'python/'}${slug}.py

def process(data):
    """
    Process data for ${config.name}.

    Args:
        data: dict — Input data from JavaScript module

    Returns:
        dict — Processed result sent back to JS
    """
    result = {}

    # Your algorithm here
    # Example:
    # result['sorted'] = sorted(data.get('items', []), key=lambda x: x.get('priority', 0))

    return result


# Called from JavaScript via:
# const result = await PythonRunner.run('${slug}', inputData);
`;

      result.js += `\n\n// Python algorithm bridge:
${moduleName}.runAlgorithm = async function(inputData) {
  if (typeof PythonRunner !== 'undefined') {
    const result = await PythonRunner.run('${slug}', inputData);
    return result;
  }
  console.warn('PythonRunner not available');
  return null;
};`;
    }

    // Generate checklist
    result.checklist = [
      { text: `Create JS file: js/${slug}.js`, done: false },
      { text: `Create CSS file: css/${slug}.css`, done: false },
      { text: `Add <link rel="stylesheet" href="css/${slug}.css"> in <head>`, done: false },
      { text: `Add <script src="js/${slug}.js"> before </body>`, done: false },
      { text: `Add container/tab HTML to index.html`, done: false },
      { text: `Register in app routing/tab system`, done: false },
      { text: `Test dark + light mode`, done: false },
      { text: `Test mobile responsive`, done: false }
    ];

    if (config.usePython) {
      result.checklist.push(
        { text: `Create Python file: ${project?.pythonDir || 'python/'}${slug}.py`, done: false },
        { text: `Test Python algorithm bridge`, done: false }
      );
    }

    return result;
  }
};
