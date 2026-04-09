/* ═══════════════════════════════════════════════
   FEATURE: Planner Approvals — Approval workflow
   Submit, reviewer chain, approve/reject/request
   changes, history, status badges.
   ═══════════════════════════════════════════════ */
const FeatPlannerApprovals = {
  requests: [],
  filter: 'all',

  init(containerId) {
    this.container = document.getElementById(containerId) || document.body;
    this._seed();
    this.render();
  },

  _seed() {
    this.requests = [
      { id:1, title:'Launch new pricing page', submitter:'Sara K.', submittedDate:'2026-04-07', status:'pending',
        reviewers:[
          { name:'Alex M.', role:'Design Lead', decision:'approved', date:'2026-04-07', comment:'Looks great, approved.' },
          { name:'Chen W.', role:'Tech Lead', decision:'pending', date:null, comment:null },
          { name:'Eva J.', role:'PM', decision:'pending', date:null, comment:null }
        ],
        history:[
          { action:'Submitted', by:'Sara K.', date:'2026-04-07 09:30', note:'Ready for review' },
          { action:'Approved', by:'Alex M.', date:'2026-04-07 14:15', note:'Design approved' }
        ]},
      { id:2, title:'Database migration to PostgreSQL', submitter:'Chen W.', submittedDate:'2026-04-06', status:'approved',
        reviewers:[
          { name:'Bob L.', role:'DevOps', decision:'approved', date:'2026-04-06', comment:'Migration plan looks solid.' },
          { name:'Eva J.', role:'PM', decision:'approved', date:'2026-04-07', comment:'Go ahead.' }
        ],
        history:[
          { action:'Submitted', by:'Chen W.', date:'2026-04-06 10:00', note:'Migration plan attached' },
          { action:'Approved', by:'Bob L.', date:'2026-04-06 15:30', note:'DevOps approved' },
          { action:'Approved', by:'Eva J.', date:'2026-04-07 09:00', note:'Final approval' }
        ]},
      { id:3, title:'Increase cloud budget by 20%', submitter:'Bob L.', submittedDate:'2026-04-08', status:'changes-requested',
        reviewers:[
          { name:'Eva J.', role:'PM', decision:'changes-requested', date:'2026-04-08', comment:'Need cost breakdown by service.' },
          { name:'Alex M.', role:'Director', decision:'pending', date:null, comment:null }
        ],
        history:[
          { action:'Submitted', by:'Bob L.', date:'2026-04-08 11:00', note:'Budget increase request' },
          { action:'Changes Requested', by:'Eva J.', date:'2026-04-08 16:00', note:'Need more details' }
        ]},
      { id:4, title:'Hire contractor for mobile app', submitter:'Eva J.', submittedDate:'2026-04-05', status:'rejected',
        reviewers:[
          { name:'Alex M.', role:'Director', decision:'rejected', date:'2026-04-05', comment:'Budget frozen until Q3. Let\'s revisit then.' }
        ],
        history:[
          { action:'Submitted', by:'Eva J.', date:'2026-04-05 09:00', note:'Contractor proposal' },
          { action:'Rejected', by:'Alex M.', date:'2026-04-05 17:30', note:'Budget constraints' }
        ]},
      { id:5, title:'Enable SSO for enterprise clients', submitter:'Kim P.', submittedDate:'2026-04-09', status:'pending',
        reviewers:[
          { name:'Chen W.', role:'Tech Lead', decision:'pending', date:null, comment:null },
          { name:'Eva J.', role:'PM', decision:'pending', date:null, comment:null }
        ],
        history:[
          { action:'Submitted', by:'Kim P.', date:'2026-04-09 08:30', note:'SSO implementation plan' }
        ]}
    ];
  },

  render() {
    const statusConfig = {
      pending:['Pending','#eab308'],
      approved:['Approved','#22c55e'],
      rejected:['Rejected','#ef4444'],
      'changes-requested':['Changes Requested','#f97316']
    };
    const decisionIcons = { approved:'&#10003;', rejected:'&#10005;', pending:'&#9679;', 'changes-requested':'&#8635;' };

    let filtered = this.filter === 'all' ? this.requests : this.requests.filter(r => r.status === this.filter);
    const counts = { all:this.requests.length, pending:0, approved:0, rejected:0, 'changes-requested':0 };
    this.requests.forEach(r => counts[r.status]++);

    this.container.innerHTML = `
    <div class="pap-wrap">
      <div class="pap-header">
        <h3 class="pap-title">Approvals</h3>
        <span class="pap-missing-badge">MISSING FROM PLANNER</span>
        <button class="pap-btn pap-btn-pink" onclick="FeatPlannerApprovals.submitNew()">+ Submit for Approval</button>
      </div>
      <div class="pap-filters">
        ${Object.entries(counts).map(([k,v]) => {
          const label = k === 'all' ? 'All' : (statusConfig[k]?statusConfig[k][0]:k);
          const color = statusConfig[k]?statusConfig[k][1]:'#e8f5e9';
          return `<button class="pap-filter ${this.filter===k?'active':''}" onclick="FeatPlannerApprovals.setFilter('${k}')"
            ${this.filter===k?`style="border-color:${color};color:${color}"`:''}>
            ${label} (${v})</button>`;
        }).join('')}
      </div>
      <div class="pap-list">
        ${filtered.map(r => {
          const [statusLabel, statusColor] = statusConfig[r.status];
          return `
          <div class="pap-card">
            <div class="pap-card-top">
              <div>
                <div class="pap-card-title">${this._esc(r.title)}</div>
                <div class="pap-card-meta">by ${this._esc(r.submitter)} on ${r.submittedDate}</div>
              </div>
              <span class="pap-status-badge" style="background:${statusColor}22;color:${statusColor}">${statusLabel}</span>
            </div>
            <div class="pap-reviewers">
              <span class="pap-rev-label">Reviewers:</span>
              ${r.reviewers.map(rv => {
                const dColor = statusConfig[rv.decision]?statusConfig[rv.decision][1]:'#5a8a60';
                return `<div class="pap-reviewer">
                  <span class="pap-rev-icon" style="color:${dColor}">${decisionIcons[rv.decision]}</span>
                  <span class="pap-rev-name">${this._esc(rv.name)}</span>
                  <span class="pap-rev-role">${this._esc(rv.role)}</span>
                  ${rv.comment ? `<span class="pap-rev-comment">"${this._esc(rv.comment)}"</span>` : ''}
                </div>`;
              }).join('')}
            </div>
            ${r.status === 'pending' ? `
            <div class="pap-actions">
              <button class="pap-act-btn pap-approve" onclick="FeatPlannerApprovals.decide(${r.id},'approved')">Approve</button>
              <button class="pap-act-btn pap-reject" onclick="FeatPlannerApprovals.decide(${r.id},'rejected')">Reject</button>
              <button class="pap-act-btn pap-changes" onclick="FeatPlannerApprovals.decide(${r.id},'changes-requested')">Request Changes</button>
            </div>` : ''}
            <details class="pap-history-toggle">
              <summary class="pap-hist-summary">History (${r.history.length})</summary>
              <div class="pap-history">
                ${r.history.map(h => `
                  <div class="pap-hist-item">
                    <span class="pap-hist-action">${h.action}</span>
                    <span class="pap-hist-by">${this._esc(h.by)}</span>
                    <span class="pap-hist-date">${h.date}</span>
                    ${h.note?`<span class="pap-hist-note">${this._esc(h.note)}</span>`:''}
                  </div>`).join('')}
              </div>
            </details>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  },

  setFilter(f) { this.filter = f; this.render(); },

  decide(id, decision) {
    const r = this.requests.find(x => x.id === id);
    const comment = prompt('Comment (optional):') || '';
    const pendingRev = r.reviewers.find(rv => rv.decision === 'pending');
    if (pendingRev) {
      pendingRev.decision = decision;
      pendingRev.date = '2026-04-09';
      pendingRev.comment = comment || (decision === 'approved' ? 'Approved' : decision === 'rejected' ? 'Rejected' : 'Changes needed');
    }
    const actionLabel = decision === 'approved' ? 'Approved' : decision === 'rejected' ? 'Rejected' : 'Changes Requested';
    r.history.push({ action: actionLabel, by: 'You', date: '2026-04-09 ' + new Date().toTimeString().slice(0,5), note: comment });
    if (r.reviewers.every(rv => rv.decision === 'approved')) r.status = 'approved';
    else if (r.reviewers.some(rv => rv.decision === 'rejected')) r.status = 'rejected';
    else if (r.reviewers.some(rv => rv.decision === 'changes-requested')) r.status = 'changes-requested';
    this.render();
  },

  submitNew() {
    const title = prompt('What needs approval?');
    if (!title?.trim()) return;
    this.requests.unshift({
      id: Date.now(), title: title.trim(), submitter: 'You', submittedDate: '2026-04-09', status: 'pending',
      reviewers: [{ name: 'Team Lead', role: 'Reviewer', decision: 'pending', date: null, comment: null }],
      history: [{ action: 'Submitted', by: 'You', date: '2026-04-09 ' + new Date().toTimeString().slice(0,5), note: 'Submitted for review' }]
    });
    this.render();
  },

  _esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; },
  exportState() { return { requests: this.requests, filter: this.filter }; },
  importState(s) { if (s.requests) this.requests = s.requests; if (s.filter) this.filter = s.filter; this.render(); }
};
