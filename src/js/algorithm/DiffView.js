/* ═══════════════════════════════════════════════════════════════
   DiffView — Before/after comparison when code changes
   Simple line-by-line diff with color coding.
   ═══════════════════════════════════════════════════════════════ */
const DiffView = {
  render(containerId, oldSource, newSource) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const oldLines = (oldSource || '').split('\n');
    const newLines = (newSource || '').split('\n');
    const maxLen = Math.max(oldLines.length, newLines.length);

    let changes = 0;
    let additions = 0;
    let deletions = 0;

    let html = `<div style="font-size:var(--font-size-xs);font-weight:700;color:var(--accent-pink);margin-bottom:6px">📊 Changes Detected</div>
    <div style="max-height:200px;overflow-y:auto;background:var(--bg-deep);border:1px solid var(--border-soft);border-radius:var(--radius-md);font-family:var(--font-mono);font-size:var(--font-size-xs)">`;

    for (let i = 0; i < maxLen; i++) {
      const oldLine = oldLines[i] || '';
      const newLine = newLines[i] || '';

      if (oldLine === newLine) {
        // Unchanged — skip or show dimmed
        continue;
      }

      if (!oldLine && newLine) {
        additions++;
        html += `<div style="background:rgba(76,175,80,.1);padding:2px 8px;border-left:3px solid var(--accent-green)">
          <span style="color:var(--text-muted);min-width:30px;display:inline-block">+${i + 1}</span>
          <span style="color:var(--accent-green)">${DOM.esc(newLine)}</span>
        </div>`;
      } else if (oldLine && !newLine) {
        deletions++;
        html += `<div style="background:rgba(239,68,68,.1);padding:2px 8px;border-left:3px solid var(--p1)">
          <span style="color:var(--text-muted);min-width:30px;display:inline-block">-${i + 1}</span>
          <span style="color:var(--p1);text-decoration:line-through">${DOM.esc(oldLine)}</span>
        </div>`;
      } else {
        changes++;
        html += `<div style="background:rgba(239,68,68,.05);padding:2px 8px;border-left:3px solid var(--p1)">
          <span style="color:var(--text-muted);min-width:30px;display:inline-block">~${i + 1}</span>
          <span style="color:var(--p1);text-decoration:line-through">${DOM.esc(oldLine)}</span>
        </div>
        <div style="background:rgba(76,175,80,.05);padding:2px 8px;border-left:3px solid var(--accent-green)">
          <span style="color:var(--text-muted);min-width:30px;display:inline-block">~${i + 1}</span>
          <span style="color:var(--accent-green)">${DOM.esc(newLine)}</span>
        </div>`;
      }
    }

    html += '</div>';
    html += `<div style="font-size:var(--font-size-xs);color:var(--text-muted);margin-top:4px">
      <span style="color:var(--accent-green)">+${additions} added</span> •
      <span style="color:var(--p1)">-${deletions} removed</span> •
      <span style="color:var(--accent-gold)">~${changes} modified</span>
    </div>`;

    container.innerHTML = html;
  }
};
