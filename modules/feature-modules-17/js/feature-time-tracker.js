
const TimeTracker = {
  _running:false,_seconds:0,_interval:null,_task:'Design dashboard',
  _log:[{task:'API integration',time:5420,date:'Apr 7'},{task:'Bug fixing',time:3600,date:'Apr 7'},{task:'Code review',time:1800,date:'Apr 6'}],
  init(cid){this.el=document.getElementById(cid);this.render()},
  render(){if(!this.el)return;const h=Math.floor(this._seconds/3600),m=Math.floor(this._seconds%3600/60),s=this._seconds%60;
    const fmt=n=>String(n).padStart(2,'0');const total=this._log.reduce((a,b)=>a+b.time,0)+this._seconds;
    this.el.innerHTML=`<div style="padding:14px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px"><span style="font-size:1.3rem">⏱️</span><span style="font-weight:800;font-size:1rem">Time Tracker</span><span style="margin-left:auto;font-size:.7rem;color:#5a8a60">Today: ${(total/3600).toFixed(1)}h</span></div>
      <div style="background:#163224;border:1.5px solid #1a3d28;border-radius:12px;padding:16px;text-align:center;margin-bottom:14px">
        <div style="font-size:.72rem;color:#5a8a60;margin-bottom:4px">Current: <strong style="color:#e8f5e9">${this._task}</strong></div>
        <div style="font-size:2.4rem;font-weight:900;font-family:monospace;color:${this._running?'#e91e90':'#e8f5e9'};letter-spacing:2px;margin:8px 0;${this._running?'animation:timePulse 1s infinite':''}">
          ${fmt(h)}:${fmt(m)}:${fmt(s)}</div>
        <div style="display:flex;gap:8px;justify-content:center">
          <button onclick="TimeTracker.toggle()" style="padding:8px 20px;border-radius:8px;border:none;background:${this._running?'#ef4444':'#4caf50'};color:#fff;font-weight:700;font-size:.82rem;cursor:pointer;font-family:inherit">${this._running?'⏸ Pause':'▶ Start'}</button>
          <button onclick="TimeTracker.stop()" style="padding:8px 16px;border-radius:8px;border:1px solid #1a3d28;background:transparent;color:#e8f5e9;font-size:.82rem;cursor:pointer;font-family:inherit">⏹ Stop & Log</button>
          <button onclick="TimeTracker.reset()" style="padding:8px 12px;border-radius:8px;border:1px solid #1a3d28;background:transparent;color:#5a8a60;font-size:.82rem;cursor:pointer;font-family:inherit">↺</button>
        </div>
      </div>
      <div style="font-size:.76rem;font-weight:700;color:#81c784;margin-bottom:6px">📋 Recent Log</div>
      ${this._log.map(l=>{const lh=Math.floor(l.time/3600),lm=Math.floor(l.time%3600/60);
        return`<div style="background:#163224;border:1px solid #1a3d28;border-radius:6px;padding:7px 10px;margin-bottom:4px;display:flex;align-items:center;gap:8px;font-size:.76rem">
          <span style="color:#5a8a60">${l.date}</span><span style="flex:1;font-weight:600">${l.task}</span><span style="color:#e91e90;font-weight:700;font-family:monospace">${lh}h ${lm}m</span></div>`}).join('')}
    </div><style>@keyframes timePulse{0%,100%{opacity:1}50%{opacity:.7}}</style>`},
  toggle(){if(this._running){clearInterval(this._interval);this._running=false}else{this._interval=setInterval(()=>{this._seconds++;this.render()},1000);this._running=true}this.render()},
  stop(){if(this._running){clearInterval(this._interval);this._running=false}
    if(this._seconds>0){this._log.unshift({task:this._task,time:this._seconds,date:new Date().toLocaleDateString('en',{month:'short',day:'numeric'})});this._seconds=0}
    const t=prompt('Next task:',this._task);if(t)this._task=t;this.render()},
  reset(){if(this._running){clearInterval(this._interval);this._running=false}this._seconds=0;this.render()}
};