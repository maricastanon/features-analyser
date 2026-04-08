
const CriticalPath={
  _tasks:[{id:'a',name:'Requirements',dur:3,deps:[],done:true},{id:'b',name:'Architecture',dur:5,deps:['a'],done:true},{id:'c',name:'Backend API',dur:8,deps:['b'],done:false},{id:'d',name:'Frontend UI',dur:6,deps:['b'],done:false},{id:'e',name:'Integration',dur:4,deps:['c','d'],done:false},{id:'f',name:'Testing',dur:5,deps:['e'],done:false},{id:'g',name:'Deploy',dur:2,deps:['f'],done:false}],
  init(cid){this.el=document.getElementById(cid);this.render()},
  render(){if(!this.el)return;const cp=['b','c','e','f','g'];const total=this._tasks.reduce((a,t)=>a+t.dur,0);
    this.el.innerHTML=`<div style="padding:14px"><div style="display:flex;align-items:center;gap:8px;margin-bottom:14px"><span style="font-size:1.3rem">🛤️</span><span style="font-weight:800;font-size:1rem">Critical Path</span><span style="margin-left:auto;font-size:.7rem;color:#ef4444;font-weight:700">Critical: ${cp.length} tasks, ${this._tasks.filter(t=>cp.includes(t.id)).reduce((a,t)=>a+t.dur,0)} days</span></div>
    ${this._tasks.map(t=>{const isCp=cp.includes(t.id);const pct=(t.dur/total*100).toFixed(0);
      return`<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <span style="width:90px;font-size:.76rem;font-weight:${isCp?'800':'500'};color:${t.done?'#4caf50':isCp?'#ef4444':'#e8f5e9'}">${t.done?'✅':isCp?'🔴':'⚪'} ${t.name}</span>
        <div style="flex:1;height:20px;background:#1a3d28;border-radius:4px;overflow:hidden;position:relative">
          <div style="height:100%;width:${pct}%;background:${t.done?'#4caf50':isCp?'linear-gradient(90deg,#ef4444,#f97316)':'#3b82f6'};border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:.6rem;font-weight:700;color:#fff;min-width:30px">${t.dur}d</div>
        </div>
        <span style="font-size:.62rem;color:#5a8a60;min-width:35px">${t.deps.length?'←'+t.deps.join(','):'start'}</span>
      </div>`}).join('')}
    <div style="margin-top:10px;background:rgba(239,68,68,.08);border:1px solid #ef444430;border-radius:8px;padding:8px;text-align:center;font-size:.74rem;color:#ef4444;font-weight:700">🔴 Critical Path: Architecture → Backend → Integration → Testing → Deploy = 24 days</div></div>`}
};