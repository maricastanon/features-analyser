
const BulkEdit = {
  _tasks:[
    {id:'t1',title:'Design login page',label:'design',selected:false,priority:2,status:'todo'},
    {id:'t2',title:'Create API endpoints',label:'backend',selected:false,priority:1,status:'progress'},
    {id:'t3',title:'Write unit tests',label:'testing',selected:false,priority:3,status:'todo'},
    {id:'t4',title:'Setup CI/CD pipeline',label:'devops',selected:false,priority:2,status:'done'},
    {id:'t5',title:'Mobile responsive layout',label:'frontend',selected:false,priority:1,status:'todo'},
    {id:'t6',title:'Database optimization',label:'backend',selected:false,priority:2,status:'progress'},
    {id:'t7',title:'User onboarding flow',label:'ux',selected:false,priority:3,status:'todo'},
  ],
  _lc:{design:'#ec4899',backend:'#6366f1',testing:'#22c55e',devops:'#f97316',frontend:'#06b6d4',ux:'#a855f7'},
  init(cid){this.el=document.getElementById(cid);this.render()},
  render(){if(!this.el)return;const sel=this._tasks.filter(t=>t.selected);
    this.el.innerHTML=`<div style="padding:14px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><span style="font-size:1.3rem">✏️</span><span style="font-weight:800;font-size:1rem">Bulk Task Editor</span>
        <button onclick="BulkEdit.selectAll()" style="margin-left:auto;padding:4px 10px;border-radius:6px;border:1px solid #1a3d28;background:transparent;color:#81c784;font-size:.68rem;cursor:pointer;font-family:inherit">Select All</button>
        <button onclick="BulkEdit.clearSel()" style="padding:4px 10px;border-radius:6px;border:1px solid #1a3d28;background:transparent;color:#81c784;font-size:.68rem;cursor:pointer;font-family:inherit">Clear</button></div>
      ${sel.length?`<div style="background:#e91e90;color:#fff;padding:8px 12px;border-radius:8px;margin-bottom:10px;font-size:.76rem;font-weight:700;display:flex;align-items:center;gap:6px;flex-wrap:wrap">
        <span>☑️ ${sel.length} selected</span><span style="margin-left:auto;display:flex;gap:4px">
        <button onclick="BulkEdit.bulkStatus('done')" style="background:rgba(255,255,255,.2);border:none;color:#fff;padding:3px 8px;border-radius:5px;font-size:.66rem;cursor:pointer">✅ Done</button>
        <button onclick="BulkEdit.bulkStatus('todo')" style="background:rgba(255,255,255,.2);border:none;color:#fff;padding:3px 8px;border-radius:5px;font-size:.66rem;cursor:pointer">📝 Todo</button>
        <button onclick="BulkEdit.bulkPri(1)" style="background:rgba(255,255,255,.2);border:none;color:#fff;padding:3px 8px;border-radius:5px;font-size:.66rem;cursor:pointer">🔴 P1</button>
        <button onclick="BulkEdit.bulkPri(3)" style="background:rgba(255,255,255,.2);border:none;color:#fff;padding:3px 8px;border-radius:5px;font-size:.66rem;cursor:pointer">🟡 P3</button>
        <button onclick="BulkEdit.bulkDel()" style="background:rgba(255,255,255,.2);border:none;color:#fff;padding:3px 8px;border-radius:5px;font-size:.66rem;cursor:pointer">🗑️ Del</button>
        </span></div>`:''}
      ${this._tasks.map(t=>{const lc=this._lc[t.label]||'#666';const sc={todo:'📝',progress:'🔥',done:'✅'};
        return`<div onclick="BulkEdit.toggleSel('${t.id}')" style="background:${t.selected?'rgba(233,30,144,.08)':'#163224'};border:1.5px solid ${t.selected?'#e91e90':'#1a3d28'};border-radius:8px;padding:9px 11px;margin-bottom:5px;display:flex;align-items:center;gap:8px;cursor:pointer;transition:.15s" onmouseover="this.style.borderColor='${t.selected?'#e91e90':'#4caf50'}'" onmouseout="this.style.borderColor='${t.selected?'#e91e90':'#1a3d28'}'">
          <span style="color:${t.selected?'#e91e90':'#5a8a60'};font-size:.9rem">${t.selected?'☑':'☐'}</span>
          <span style="font-weight:600;font-size:.82rem;flex:1">${t.title}</span>
          <span style="font-size:.62rem;background:${lc}30;color:${lc};padding:1px 7px;border-radius:5px;font-weight:600">${t.label}</span>
          <span style="font-size:.7rem">${sc[t.status]||'📝'}</span>
          <span style="font-size:.6rem;color:#5a8a60">P${t.priority}</span>
        </div>`}).join('')}
    </div>`},
  toggleSel(id){const t=this._tasks.find(x=>x.id===id);if(t)t.selected=!t.selected;this.render()},
  selectAll(){this._tasks.forEach(t=>t.selected=true);this.render()},
  clearSel(){this._tasks.forEach(t=>t.selected=false);this.render()},
  bulkStatus(s){this._tasks.filter(t=>t.selected).forEach(t=>t.status=s);this.render()},
  bulkPri(p){this._tasks.filter(t=>t.selected).forEach(t=>t.priority=p);this.render()},
  bulkDel(){this._tasks=this._tasks.filter(t=>!t.selected);this.render()}
};