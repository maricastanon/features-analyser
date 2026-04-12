/* PM TOOLKIT — Gantt Engine (shared rendering utilities) */
var GanttEngine = window.GanttEngine = {};

GanttEngine.h = function(tag, cls, props) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (props) Object.entries(props).forEach(function(kv) {
    if (kv[0]==='text') e.textContent = kv[1];
    else if (kv[0]==='html') e.innerHTML = kv[1];
    else if (kv[0]==='style' && typeof kv[1]==='object') Object.assign(e.style, kv[1]);
    else e.setAttribute(kv[0], kv[1]);
  });
  return e;
};
GanttEngine.ap = function(p) { for(var i=1;i<arguments.length;i++){var c=arguments[i];if(c){if(typeof c==='string')p.appendChild(document.createTextNode(c));else p.appendChild(c)}} return p; };

// Calculate date range from tasks
GanttEngine.calcRange = function(tasks, milestones, padDays) {
  padDays = padDays || 7;
  var allDates = [];
  tasks.forEach(function(t) { if(t.start)allDates.push(new Date(t.start)); if(t.end)allDates.push(new Date(t.end));
    if(t.planned_start)allDates.push(new Date(t.planned_start)); if(t.planned_end)allDates.push(new Date(t.planned_end)); });
  if (milestones) milestones.forEach(function(m) { allDates.push(new Date(m.date)); });
  if (!allDates.length) return { min: new Date(), max: new Date(), days: 30 };
  var mn = new Date(Math.min.apply(null, allDates)), mx = new Date(Math.max.apply(null, allDates));
  mn.setDate(mn.getDate() - padDays); mx.setDate(mx.getDate() + padDays);
  return { min: mn, max: mx, days: Math.ceil((mx - mn) / 864e5) };
};

// Get day offset from range start
GanttEngine.dayOffset = function(dateStr, rangeMin) {
  return Math.max(0, Math.ceil((new Date(dateStr) - rangeMin) / 864e5));
};

// Render time header (months + days)
GanttEngine.renderTimeHeader = function(range, dayWidth, showDays) {
  var h = GanttEngine.h, ap = GanttEngine.ap;
  var wrap = h('div','gantt-time-col');

  // Month labels
  var cur = new Date(range.min);
  while (cur < range.max) {
    var mEnd = new Date(cur.getFullYear(), cur.getMonth()+1, 0);
    var daysInView = Math.min(Math.ceil((mEnd - cur)/864e5)+1, range.days);
    var cell = h('div','gantt-time-cell',{
      text: cur.toLocaleDateString('en-US',{month:'short', year:'numeric'}),
      style: {width: daysInView*dayWidth+'px', borderBottom:'1px solid var(--bD)'}
    });
    wrap.appendChild(cell);
    cur = new Date(cur.getFullYear(), cur.getMonth()+1, 1);
  }
  return wrap;
};

// Render a task bar
GanttEngine.renderBar = function(task, range, dayWidth, opts) {
  opts = opts || {};
  var h = GanttEngine.h;
  var startD = GanttEngine.dayOffset(task.start || task.end, range.min);
  var endD = GanttEngine.dayOffset(task.end || task.start, range.min);
  var dur = Math.max(1, endD - startD) + 1;
  var color = opts.color || '#35b8ff';

  var bar = h('div','gantt-bar',{
    text: opts.showName !== false ? task.name : '',
    style: {
      left: startD*dayWidth+'px', width: dur*dayWidth+'px',
      background: color+'33', borderLeft:'3px solid '+color,
      color: 'var(--t1)', zIndex:'2'
    }
  });

  // Progress fill
  if (task.progress != null && task.progress > 0) {
    var fill = h('div','gantt-bar-progress',{style:{width:task.progress+'%', background:color}});
    bar.appendChild(fill);
  }

  // Tooltip
  bar.title = task.name + (task.progress != null ? ' ('+task.progress+'%)' : '') +
    '\n' + (task.start||'?') + ' → ' + (task.end||'?');

  if (opts.onClick) bar.addEventListener('click', opts.onClick);
  return bar;
};

// Render milestone diamond
GanttEngine.renderMilestone = function(ms, range, dayWidth) {
  var h = GanttEngine.h;
  var off = GanttEngine.dayOffset(ms.date, range.min);
  var colors = {done:'#00e676', pending:'#ffb935', upcoming:'var(--t3)'};
  var el = h('div','gantt-milestone',{
    style: {left: (off*dayWidth - 9)+'px', background: colors[ms.status]||'var(--t3)'},
    title: ms.name + ' (' + ms.date + ')\nStatus: ' + ms.status
  });
  return el;
};

// Render gate (circle with lock)
GanttEngine.renderGate = function(gate, range, dayWidth) {
  var h = GanttEngine.h;
  var off = GanttEngine.dayOffset(gate.date, range.min);
  var colors = {done:'#00e676', pending:'#ffb935', upcoming:'var(--t3)'};
  var el = h('div','gantt-gate',{
    text: gate.icon || '🔒',
    style: {left:(off*dayWidth-11)+'px', borderColor:colors[gate.status]||'var(--t3)', background:colors[gate.status]+'22'},
    title: gate.name + '\nApprover: '+(gate.approver||'?') + '\nCriteria: '+(gate.criteria||'—') + '\nStatus: '+gate.status
  });
  return el;
};

// Render today line
GanttEngine.renderToday = function(range, dayWidth) {
  var h = GanttEngine.h;
  var today = new Date();
  if (today >= range.min && today <= range.max) {
    var off = GanttEngine.dayOffset(today.toISOString().split('T')[0], range.min);
    return h('div','gantt-today',{style:{left:off*dayWidth+'px'}});
  }
  return null;
};

// Render weekend bands
GanttEngine.renderWeekends = function(range, dayWidth) {
  var h = GanttEngine.h, frag = document.createDocumentFragment();
  var cur = new Date(range.min);
  for (var d = 0; d < range.days; d++) {
    var day = new Date(cur); day.setDate(day.getDate() + d);
    if (day.getDay() === 0 || day.getDay() === 6) {
      frag.appendChild(h('div','gantt-weekend',{style:{left:d*dayWidth+'px', width:dayWidth+'px'}}));
    }
  }
  return frag;
};

// Format helpers
GanttEngine.statusColor = function(s) {
  return {done:'#00e676',inprogress:'#35b8ff',todo:'var(--t3)',review:'#b46eff',blocked:'#ff3d5c'}[s]||'var(--t3)';
};
GanttEngine.priColor = function(p) {
  return {urgent:'#ff3d5c',high:'#ff6b35',medium:'#ffb935',low:'#35b8ff'}[p]||'var(--t3)';
};

// Simple tooltip on hover
GanttEngine.addDetailPopup = function(el, html) {
  var popup = null;
  el.addEventListener('mouseenter', function(e) {
    popup = GanttEngine.h('div','',{html:html,style:{
      position:'fixed',left:(e.clientX+12)+'px',top:(e.clientY-10)+'px',
      background:'var(--bg3)',border:'1px solid var(--bD)',borderRadius:'var(--r)',
      padding:'10px 14px',fontSize:'.78rem',color:'var(--t1)',zIndex:'1000',
      maxWidth:'300px',boxShadow:'0 8px 24px rgba(0,0,0,.5)',lineHeight:'1.5',pointerEvents:'none'
    }});
    document.body.appendChild(popup);
  });
  el.addEventListener('mousemove', function(e) {
    if(popup){popup.style.left=(e.clientX+12)+'px';popup.style.top=(e.clientY-10)+'px'}
  });
  el.addEventListener('mouseleave', function() {
    if(popup){popup.remove();popup=null}
  });
};
