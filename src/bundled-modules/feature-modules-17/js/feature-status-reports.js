
const StatusReports={
  init(cid){this.el=document.getElementById(cid);this.render()},
  render(){if(!this.el)return;
    this.el.innerHTML=`<div style="padding:14px"><div style="display:flex;align-items:center;gap:8px;margin-bottom:14px"><span style="font-size:1.3rem">📊</span><span style="font-weight:800;font-size:1rem">AI Status Reports</span><button onclick="StatusReports.generate()" style="margin-left:auto;padding:5px 12px;border-radius:6px;border:none;background:#e91e90;color:#fff;font-size:.72rem;font-weight:700;cursor:pointer;font-family:inherit">🤖 Generate Report</button></div>
      <div style="background:#163224;border:1px solid #1a3d28;border-radius:10px;padding:14px">
        <div style="font-weight:800;font-size:.9rem;margin-bottom:10px">📊 Sprint 14 — Weekly Status</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:12px">
          <div style="background:rgba(76,175,80,.1);border-radius:6px;padding:8px;text-align:center"><div style="font-size:1.3rem;font-weight:900;color:#4caf50">12</div><div style="font-size:.6rem;color:#5a8a60">Done</div></div>
          <div style="background:rgba(249,115,22,.1);border-radius:6px;padding:8px;text-align:center"><div style="font-size:1.3rem;font-weight:900;color:#f97316">5</div><div style="font-size:.6rem;color:#5a8a60">Active</div></div>
          <div style="background:rgba(239,68,68,.1);border-radius:6px;padding:8px;text-align:center"><div style="font-size:1.3rem;font-weight:900;color:#ef4444">2</div><div style="font-size:.6rem;color:#5a8a60">Blocked</div></div>
          <div style="background:rgba(59,130,246,.1);border-radius:6px;padding:8px;text-align:center"><div style="font-size:1.3rem;font-weight:900;color:#3b82f6">87%</div><div style="font-size:.6rem;color:#5a8a60">Velocity</div></div>
        </div>
        <div style="font-size:.76rem;color:#81c784;margin-bottom:6px"><strong>✅ Highlights:</strong> Auth module complete, Dashboard 90% done</div>
        <div style="font-size:.76rem;color:#f97316;margin-bottom:6px"><strong>⚠️ Risks:</strong> API integration delayed 2 days</div>
        <div style="font-size:.76rem;color:#60a5fa"><strong>📋 Next:</strong> Integration testing, Mobile responsive</div>
        <div style="display:flex;gap:6px;margin-top:10px"><button style="padding:5px 12px;border-radius:6px;border:none;background:#4caf50;color:#fff;font-size:.7rem;cursor:pointer;font-family:inherit">📥 PDF</button><button style="padding:5px 12px;border-radius:6px;border:none;background:#3b82f6;color:#fff;font-size:.7rem;cursor:pointer;font-family:inherit">📧 Email</button><button style="padding:5px 12px;border-radius:6px;border:1px solid #1a3d28;background:transparent;color:#e8f5e9;font-size:.7rem;cursor:pointer;font-family:inherit">📋 Copy</button></div>
      </div></div>`},
  generate(){alert('🤖 Report regenerated with latest data!')}
};