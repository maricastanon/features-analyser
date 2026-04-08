
const CustomBackgrounds={
  _bgs:[
    {id:'b1',name:'Default Dark',css:'linear-gradient(135deg,#0d1f17,#1a3d28)'},
    {id:'b2',name:'Midnight Rose',css:'linear-gradient(135deg,#1a1a2e,#e94560)'},
    {id:'b3',name:'Ocean Mint',css:'linear-gradient(135deg,#0f3460,#16c79a)'},
    {id:'b4',name:'Sunset',css:'linear-gradient(135deg,#2d1b69,#f97316)'},
    {id:'b5',name:'Forest',css:'linear-gradient(135deg,#0d3b0d,#2e7d32)'},
    {id:'b6',name:'Pink Dream',css:'linear-gradient(135deg,#4a0028,#e91e90)'},
    {id:'b7',name:'Arctic',css:'linear-gradient(135deg,#0c2340,#60a5fa)'},
    {id:'b8',name:'Light Blush',css:'linear-gradient(135deg,#fff5f7,#fce4ec)'},
  ],
  _active:'b1',
  init(cid){this.el=document.getElementById(cid);this.render()},
  render(){if(!this.el)return;
    this.el.innerHTML=`<div style="padding:14px"><div style="display:flex;align-items:center;gap:8px;margin-bottom:14px"><span style="font-size:1.3rem">🎨</span><span style="font-weight:800;font-size:1rem">Custom Backgrounds</span></div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px">${this._bgs.map(b=>`<div onclick="CustomBackgrounds.set('${b.id}')" style="height:60px;border-radius:8px;background:${b.css};cursor:pointer;border:3px solid ${this._active===b.id?'#fff':'transparent'};transition:.2s;display:flex;align-items:flex-end;padding:4px 6px;box-shadow:${this._active===b.id?'0 0 12px rgba(255,255,255,.3)':'none'}" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"><span style="font-size:.58rem;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.6);font-weight:700">${b.name}</span></div>`).join('')}</div>
      <div id="bgPreview" style="height:100px;border-radius:10px;background:${this._bgs.find(b=>b.id===this._active)?.css};display:flex;align-items:center;justify-content:center;transition:background .5s"><span style="color:#fff;font-weight:800;font-size:1rem;text-shadow:0 2px 8px rgba(0,0,0,.4)">🌸 Preview: ${this._bgs.find(b=>b.id===this._active)?.name}</span></div></div>`},
  set(id){this._active=id;this.render()}
};