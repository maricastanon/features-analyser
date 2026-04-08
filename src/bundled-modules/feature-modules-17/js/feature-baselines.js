
const Baselines={
  _snaps:[{id:'v1',name:'Baseline v1',date:'Mar 1',tasks:24,weeks:6,scope:100},{id:'v2',name:'Mid-sprint',date:'Mar 20',tasks:28,weeks:7,scope:117}],
  _current:{tasks:31,weeks:8,scope:129},
  init(cid){this.el=document.getElementById(cid);this.render()},
  render(){if(!this.el)return;
    this.el.innerHTML=`<div style="padding:14px"><div style="display:flex;align-items:center;gap:8px;margin-bottom:12px"><span style="font-size:1.3rem">📸</span><span style="font-weight:800;font-size:1rem">Baselines & Snapshots</span>
      <button onclick="Baselines.take()" style="margin-left:auto;padding:5px 12px;border-radius:6px;border:none;background:#4caf50;color:#fff;font-size:.72rem;font-weight:700;cursor:pointer;font-family:inherit">📸 Take Snapshot</button></div>
    <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">${this._snaps.map(s=>`<div style="background:#163224;border:1px solid #1a3d28;border-radius:8px;padding:10px;flex:1;min-width:120px">
      <div style="font-weight:700;font-size:.8rem;color:#4caf50">${s.name}</div><div style="font-size:.66rem;color:#5a8a60">${s.date} • ${s.tasks} tasks • ${s.weeks}w</div></div>`).join('')}
      <div style="background:#163224;border:1.5px solid #e91e90;border-radius:8px;padding:10px;flex:1;min-width:120px"><div style="font-weight:700;font-size:.8rem;color:#e91e90">📍 Current</div><div style="font-size:.66rem;color:#5a8a60">Now • ${this._current.tasks} tasks • ${this._current.weeks}w</div></div></div>
    <div style="background:rgba(249,115,22,.06);border:1px solid #f9731630;border-radius:8px;padding:10px;font-size:.78rem;color:#f97316;text-align:center">⚠️ vs Baseline v1: <strong>+${this._current.tasks-this._snaps[0].tasks} tasks</strong> • <strong>+${this._current.weeks-this._snaps[0].weeks} weeks</strong> • Scope: ${this._current.scope}% of original</div></div>`},
  take(){this._snaps.push({id:'v'+Date.now(),name:'Snapshot '+(this._snaps.length+1),date:new Date().toLocaleDateString('en',{month:'short',day:'numeric'}),tasks:this._current.tasks,weeks:this._current.weeks,scope:this._current.scope});this.render()}
};