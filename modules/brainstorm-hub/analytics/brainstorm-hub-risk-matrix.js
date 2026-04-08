
const RiskMatrix = {
  _risks:[
    {id:'r1',name:'API rate limiting',prob:4,impact:5,status:'open',owner:'Dev'},
    {id:'r2',name:'Scope creep',prob:3,impact:4,status:'monitoring',owner:'PM'},
    {id:'r3',name:'Browser compatibility',prob:2,impact:2,status:'mitigated',owner:'QA'},
    {id:'r4',name:'Data loss',prob:1,impact:5,status:'mitigated',owner:'Dev'},
    {id:'r5',name:'Performance degradation',prob:3,impact:3,status:'open',owner:'Dev'},
  ],
  init(cid){this.el=document.getElementById(cid);this.render()},
  _sev(p,i){const s=p*i;return s>=15?{l:'CRITICAL',c:'#ef4444'}:s>=8?{l:'HIGH',c:'#f97316'}:s>=4?{l:'MEDIUM',c:'#eab308'}:{l:'LOW',c:'#22c55e'}},
  _stc:{open:'#ef4444',monitoring:'#f97316',mitigated:'#22c55e'},
  render(){if(!this.el)return;
    this.el.innerHTML=`<div style="padding:14px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px"><span style="font-size:1.3rem">⚠️</span><span style="font-weight:800;font-size:1rem">Risk Management</span>
        <button onclick="RiskMatrix.addRisk()" style="margin-left:auto;padding:4px 10px;border-radius:6px;border:1px solid #1a3d28;background:transparent;color:#81c784;font-size:.68rem;cursor:pointer;font-family:inherit">+ Add Risk</button></div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:14px">
        <div style="background:rgba(239,68,68,.08);border:1px solid #ef444430;border-radius:8px;padding:8px;text-align:center"><div style="font-size:1.4rem;font-weight:900;color:#ef4444">${this._risks.filter(r=>r.status==='open').length}</div><div style="font-size:.65rem;color:#5a8a60">Open</div></div>
        <div style="background:rgba(249,115,22,.08);border:1px solid #f9731630;border-radius:8px;padding:8px;text-align:center"><div style="font-size:1.4rem;font-weight:900;color:#f97316">${this._risks.filter(r=>r.status==='monitoring').length}</div><div style="font-size:.65rem;color:#5a8a60">Monitoring</div></div>
        <div style="background:rgba(34,197,94,.08);border:1px solid #22c55e30;border-radius:8px;padding:8px;text-align:center"><div style="font-size:1.4rem;font-weight:900;color:#22c55e">${this._risks.filter(r=>r.status==='mitigated').length}</div><div style="font-size:.65rem;color:#5a8a60">Mitigated</div></div>
      </div>
      ${this._risks.map(r=>{const sev=this._sev(r.prob,r.impact);const sc=this._stc[r.status]||'#666';
        return`<div style="background:#163224;border:1px solid #1a3d28;border-left:4px solid ${sev.c};border-radius:8px;padding:10px 12px;margin-bottom:6px;display:flex;align-items:center;gap:8px;transition:.2s" onmouseover="this.style.borderColor='#e91e90'" onmouseout="this.style.borderColor='#1a3d28'">
          <span style="font-size:.62rem;font-weight:800;color:${sev.c};min-width:55px;background:${sev.c}15;padding:2px 6px;border-radius:4px;text-align:center">${sev.l}</span>
          <div style="flex:1"><div style="font-weight:700;font-size:.82rem">${r.name}</div><div style="font-size:.65rem;color:#5a8a60">P:${r.prob} × I:${r.impact} = ${r.prob*r.impact} • 👤 ${r.owner}</div></div>
          <select onchange="RiskMatrix.setSt('${r.id}',this.value)" style="background:#122b1e;border:1px solid #1a3d28;color:#e8f5e9;padding:3px 6px;border-radius:5px;font-size:.68rem;font-family:inherit">
            <option value="open" ${r.status==='open'?'selected':''}>🔴 Open</option>
            <option value="monitoring" ${r.status==='monitoring'?'selected':''}>🟠 Monitor</option>
            <option value="mitigated" ${r.status==='mitigated'?'selected':''}>🟢 Mitigated</option>
          </select></div>`}).join('')}
    </div>`},
  setSt(id,st){const r=this._risks.find(x=>x.id===id);if(r){r.status=st;this.render()}},
  addRisk(){const n=prompt('Risk name:');if(!n)return;const p=parseInt(prompt('Probability (1-5):','3'))||3;const i=parseInt(prompt('Impact (1-5):','3'))||3;
    this._risks.push({id:'r'+Date.now(),name:n,prob:p,impact:i,status:'open',owner:'TBD'});this.render()}
};