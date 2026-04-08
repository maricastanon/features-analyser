
const RecurringTasks = {
  _tasks: [
    {id:'r1',title:'Daily standup prep',freq:'weekdays',next:'Tomorrow',color:'#4caf50',done:false},
    {id:'r2',title:'Sprint review',freq:'Every 2 weeks',next:'Apr 18',color:'#f97316',done:false},
    {id:'r3',title:'Monthly report',freq:'Monthly (1st)',next:'May 1',color:'#e91e90',done:false},
    {id:'r4',title:'Weekly backup',freq:'Every Monday',next:'Apr 14',color:'#3b82f6',done:false},
    {id:'r5',title:'Code review',freq:'Every 3 days',next:'Apr 11',color:'#8b5cf6',done:false},
  ],
  _freqs:['Daily','Weekdays','Weekly','Every 2 weeks','Monthly (1st)','Monthly (15th)','Quarterly','Yearly','Custom...'],
  init(cid){this.el=document.getElementById(cid);this.render()},
  render(){if(!this.el)return;
    const freqBtns=this._freqs.map(f=>`<button onclick="RecurringTasks.addWith('${f}')" style="padding:5px 12px;border-radius:14px;border:1.5px solid #1a3d28;background:transparent;color:#e8f5e9;font-size:.7rem;font-weight:600;cursor:pointer;transition:.2s;font-family:inherit" onmouseover="this.style.borderColor='#4caf50';this.style.background='rgba(76,175,80,.1)'" onmouseout="this.style.borderColor='#1a3d28';this.style.background='transparent'">${f}</button>`).join('');
    this.el.innerHTML=`<div style="padding:14px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px"><span style="font-size:1.3rem">🔄</span><span style="font-weight:800;font-size:1rem">Recurring Tasks</span><span style="margin-left:auto;font-size:.7rem;color:#5a8a60">${this._tasks.length} active</span></div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">${freqBtns}</div>
      <div id="rtList">${this._tasks.map(t=>this._card(t)).join('')}</div>
    </div>`;
  },
  _card(t){return`<div style="background:#163224;border:1px solid #1a3d28;border-left:4px solid ${t.color};border-radius:8px;padding:10px 12px;margin-bottom:6px;display:flex;align-items:center;gap:10px;transition:.2s;cursor:pointer" onmouseover="this.style.borderColor='#e91e90'" onmouseout="this.style.borderColor='#1a3d28'">
    <div onclick="RecurringTasks.toggle('${t.id}')" style="width:18px;height:18px;border-radius:50%;border:2px solid ${t.done?'#4caf50':'#1a3d28'};background:${t.done?'#4caf50':'transparent'};cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.6rem;color:#fff;transition:.2s">${t.done?'✓':''}</div>
    <div style="flex:1"><div style="font-weight:700;font-size:.84rem;${t.done?'text-decoration:line-through;opacity:.5':''}">${t.title}</div><div style="font-size:.68rem;color:#5a8a60">🔄 ${t.freq}</div></div>
    <div style="text-align:right"><div style="font-size:.68rem;color:#81c784">Next: ${t.next}</div></div>
    <button onclick="RecurringTasks.remove('${t.id}')" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:.8rem;opacity:.4" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=.4">✕</button>
  </div>`},
  toggle(id){const t=this._tasks.find(x=>x.id===id);if(t){t.done=!t.done;this.render()}},
  remove(id){this._tasks=this._tasks.filter(x=>x.id!==id);this.render()},
  addWith(freq){const title=prompt('Task name:');if(!title)return;
    const colors=['#4caf50','#e91e90','#f97316','#3b82f6','#8b5cf6','#eab308'];
    this._tasks.push({id:'r'+Date.now(),title,freq,next:'Pending',color:colors[Math.floor(Math.random()*colors.length)],done:false});this.render()}
};