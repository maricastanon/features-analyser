/* ═══════════════════════════════════════════════
   FEATURE: Planner Burndown — Agile burndown chart
   SVG ideal vs actual, sprint selector, velocity,
   scope change indicators, story points remaining.
   ═══════════════════════════════════════════════ */
const FeatPlannerBurndown = {
  sprints: [],
  activeSprint: 0,

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this._seed();
    this.render();
  },

  _seed() {
    this.sprints = [
      { id:0, name:'Sprint 12', startDate:'2026-04-06', endDate:'2026-04-17', totalPoints:80,
        days:['Apr 6','Apr 7','Apr 8','Apr 9','Apr 10','Apr 11','Apr 13','Apr 14','Apr 15','Apr 16','Apr 17'],
        ideal:[80,72,64,56,48,40,32,24,16,8,0],
        actual:[80,75,68,62,55,52,null,null,null,null,null],
        scopeChanges:[{day:3,delta:'+5 pts',reason:'New requirement added'}],
        velocity:26
      },
      { id:1, name:'Sprint 11', startDate:'2026-03-23', endDate:'2026-04-03', totalPoints:70,
        days:['Mar 23','Mar 24','Mar 25','Mar 26','Mar 27','Mar 28','Mar 30','Mar 31','Apr 1','Apr 2','Apr 3'],
        ideal:[70,63,56,49,42,35,28,21,14,7,0],
        actual:[70,65,58,50,42,35,28,20,12,5,2],
        scopeChanges:[],
        velocity:28
      },
      { id:2, name:'Sprint 10', startDate:'2026-03-09', endDate:'2026-03-20', totalPoints:65,
        days:['Mar 9','Mar 10','Mar 11','Mar 12','Mar 13','Mar 14','Mar 16','Mar 17','Mar 18','Mar 19','Mar 20'],
        ideal:[65,58.5,52,45.5,39,32.5,26,19.5,13,6.5,0],
        actual:[65,60,55,48,40,33,25,18,10,4,0],
        scopeChanges:[{day:5,delta:'-3 pts',reason:'Scope trimmed'}],
        velocity:25
      }
    ];
    this.activeSprint = 0;
  },

  render() {
    const sp = this.sprints[this.activeSprint];
    const svgW = 500, svgH = 200, padL = 40, padR = 10, padT = 10, padB = 30;
    const chartW = svgW - padL - padR;
    const chartH = svgH - padT - padB;
    const maxPts = sp.totalPoints;
    const numDays = sp.days.length;

    const toX = (i) => padL + (i / (numDays - 1)) * chartW;
    const toY = (v) => padT + ((maxPts - v) / maxPts) * chartH;

    const idealPath = sp.ideal.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(v)}`).join(' ');
    const actualPts = sp.actual.filter(v => v !== null);
    const actualPath = actualPts.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(v)}`).join(' ');

    const remaining = actualPts.length > 0 ? actualPts[actualPts.length - 1] : sp.totalPoints;
    const completed = sp.totalPoints - remaining;
    const pctDone = Math.round((completed / sp.totalPoints) * 100);

    // Velocity history
    const avgVelocity = Math.round(this.sprints.reduce((s, sp) => s + sp.velocity, 0) / this.sprints.length);

    this.container.innerHTML = `
    <div class="pbd-wrap">
      <div class="pbd-header">
        <h3 class="pbd-title">Burndown Chart</h3>
        <span class="pbd-missing-badge">MISSING FROM PLANNER</span>
        <select class="pbd-select" onchange="FeatPlannerBurndown.selectSprint(this.value)">
          ${this.sprints.map(s => `<option value="${s.id}" ${s.id===this.activeSprint?'selected':''}>${s.name}</option>`).join('')}
        </select>
      </div>

      <div class="pbd-stats">
        <div class="pbd-stat"><span class="pbd-stat-val">${sp.totalPoints}</span><span class="pbd-stat-label">Total Points</span></div>
        <div class="pbd-stat"><span class="pbd-stat-val" style="color:#22c55e">${completed}</span><span class="pbd-stat-label">Completed</span></div>
        <div class="pbd-stat"><span class="pbd-stat-val" style="color:#f97316">${remaining}</span><span class="pbd-stat-label">Remaining</span></div>
        <div class="pbd-stat"><span class="pbd-stat-val" style="color:#e91e90">${pctDone}%</span><span class="pbd-stat-label">Progress</span></div>
      </div>

      <div class="pbd-chart-card">
        <svg class="pbd-svg" viewBox="0 0 ${svgW} ${svgH}">
          <!-- Grid lines -->
          ${[0, 0.25, 0.5, 0.75, 1].map(f => {
            const y = padT + f * chartH;
            const val = Math.round(maxPts * (1 - f));
            return `<line x1="${padL}" y1="${y}" x2="${svgW - padR}" y2="${y}" stroke="#1a3d28" stroke-width="0.5"/>
              <text x="${padL - 4}" y="${y + 3}" text-anchor="end" fill="#5a8a60" font-size="8">${val}</text>`;
          }).join('')}
          <!-- Day labels -->
          ${sp.days.map((d, i) => `<text x="${toX(i)}" y="${svgH - 5}" text-anchor="middle" fill="#5a8a60" font-size="6">${d.split(' ')[1]}</text>`).join('')}
          <!-- Ideal line -->
          <path d="${idealPath}" fill="none" stroke="#5a8a60" stroke-width="1.5" stroke-dasharray="4,3"/>
          <!-- Actual line -->
          <path d="${actualPath}" fill="none" stroke="#e91e90" stroke-width="2.5" stroke-linecap="round"/>
          <!-- Actual dots -->
          ${actualPts.map((v, i) => `<circle cx="${toX(i)}" cy="${toY(v)}" r="3" fill="#e91e90"/>`).join('')}
          <!-- Scope changes -->
          ${sp.scopeChanges.map(sc => `
            <line x1="${toX(sc.day)}" y1="${padT}" x2="${toX(sc.day)}" y2="${padT + chartH}" stroke="#eab308" stroke-width="1" stroke-dasharray="3,2"/>
            <text x="${toX(sc.day) + 3}" y="${padT + 10}" fill="#eab308" font-size="6">${sc.delta}</text>
          `).join('')}
        </svg>
        <div class="pbd-legend">
          <span class="pbd-legend-item"><span class="pbd-legend-line" style="border-top:2px dashed #5a8a60"></span>Ideal</span>
          <span class="pbd-legend-item"><span class="pbd-legend-line" style="border-top:2px solid #e91e90"></span>Actual</span>
          ${sp.scopeChanges.length ? `<span class="pbd-legend-item"><span class="pbd-legend-line" style="border-top:2px dashed #eab308"></span>Scope Change</span>` : ''}
        </div>
      </div>

      <div class="pbd-velocity">
        <div class="pbd-vel-title">Sprint Velocity</div>
        <div class="pbd-vel-bars">
          ${this.sprints.slice().reverse().map(s => `
            <div class="pbd-vel-col">
              <div class="pbd-vel-bar" style="height:${(s.velocity / 40) * 100}%"></div>
              <span class="pbd-vel-val">${s.velocity}</span>
              <span class="pbd-vel-label">${s.name.replace('Sprint ','S')}</span>
            </div>`).join('')}
        </div>
        <div class="pbd-vel-avg">Avg velocity: <strong>${avgVelocity} pts/sprint</strong></div>
      </div>
    </div>`;
  },

  selectSprint(id) {
    this.activeSprint = parseInt(id);
    this.render();
  },

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },
  exportState() { return { sprints: this.sprints, activeSprint: this.activeSprint }; },
  importState(s) { if (s.sprints) this.sprints = s.sprints; if (s.activeSprint != null) this.activeSprint = s.activeSprint; this.render(); }
};
