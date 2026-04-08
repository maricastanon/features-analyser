
const CapacityPlanner = {
  _team:[
    {name:'Mari',role:'Lead Dev',capacity:100,allocated:85,tasks:12,color:'#e91e90'},
    {name:'Alex',role:'Legal/PM',capacity:100,allocated:60,tasks:8,color:'#4caf50'},
    {name:'Robin',role:'Tester',capacity:80,allocated:75,tasks:6,color:'#3b82f6'},
    {name:'Max',role:'Designer',capacity:100,allocated:45,tasks:5,color:'#f97316'},
  ],
  init(cid){this.el=document.getElementById(cid);this.render()},
  render(){if(!this.el)return;const avg=Math.round(this._team.reduce((a,m)=>a+m.allocated,0)/this._team.length);
    this.el.innerHTML=`<div style="padding:14px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px"><span style="font-size:1.3rem">📊</span><span style="font-weight:800;font-size:1rem">Capacity Planner</span><span style="margin-left:auto;font-size:.7rem;color:#5a8a60">Avg load: ${avg}%</span></div>
      ${this._team.map(m=>{const over=m.allocated>m.capacity;const pct=Math.min(m.allocated,100);const barColor=pct>90?'#ef4444':pct>70?'#f97316':'#4caf50';
        return`<div style="background:#163224;border:1px solid #1a3d28;border-radius:8px;padding:10px 12px;margin-bottom:6px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <div style="width:28px;height:28px;border-radius:50%;background:${m.color};display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:800;color:#fff">${m.name[0]}</div>
            <div style="flex:1"><div style="font-weight:700;font-size:.84rem">${m.name}</div><div style="font-size:.65rem;color:#5a8a60">${m.role} • ${m.tasks} tasks</div></div>
            <span style="font-size:.9rem;font-weight:900;color:${barColor}">${m.allocated}%</span>
            ${over?'<span style="font-size:.6rem;background:#ef444420;color:#ef4444;padding:1px 6px;border-radius:4px;font-weight:700">OVER</span>':''}
          </div>
          <div style="height:8px;background:#1a3d28;border-radius:4px;overflow:hidden;position:relative">
            <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,${m.color},${barColor});border-radius:4px;transition:width .5s"></div>
            <div style="position:absolute;top:0;left:${m.capacity}%;width:2px;height:100%;background:#e8f5e9;opacity:.3"></div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:3px;font-size:.6rem;color:#5a8a60"><span>0%</span><span>Cap: ${m.capacity}%</span></div>
        </div>`}).join('')}
      <button onclick="CapacityPlanner.rebalance()" style="width:100%;padding:8px;border-radius:8px;border:1.5px dashed #1a3d28;background:transparent;color:#81c784;font-size:.76rem;font-weight:700;cursor:pointer;margin-top:6px;font-family:inherit;transition:.2s" onmouseover="this.style.borderColor='#e91e90'" onmouseout="this.style.borderColor='#1a3d28'">🔄 Auto-Rebalance Workload</button>
    </div>`},
  rebalance(){const avg=Math.round(this._team.reduce((a,m)=>a+m.allocated,0)/this._team.length);this._team.forEach(m=>{m.allocated=avg+Math.floor(Math.random()*20-10);m.allocated=Math.max(20,Math.min(100,m.allocated))});this.render()}
};