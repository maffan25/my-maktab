/* Pembaca PDF Maktabah: tanda warna, garis, catatan, stiker, dan pencarian isi buku.
   Catatan & tanda tersimpan di browser (localStorage). Indeks pencarian di IndexedDB. */
(()=>{
const A=window.APP,NS="http://www.w3.org/2000/svg",$=s=>document.querySelector(s),
el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e},
svg=(t,a)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);return e},
LS=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}},
SV=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){A.toast("Penyimpanan browser penuh")}};
const COL=["#FFD54A","#7ED957","#5BB5F0","#FF8FB1","#FF9F4A","#B48CF2","#E5483D","#33291F"],
STK=["⭐","❤️","😊","🌙","📌","✅","❗","💡","🕌","📖","🤲","🌸","🔥","👍"],
TOOLS=[["baca","📖 Baca"],["hl","🖍️ Stabilo"],["ul","➖ Garis bawah"],["pen","✏️ Pena"],["line","📏 Garis"],["note","📝 Catatan"],["stk","😊 Stiker"],["erase","🧽 Hapus"]],
HINT={hl:"Blok teks untuk menandai",ul:"Blok teks untuk digarisbawahi",pen:"Gambar bebas di halaman",line:"Seret untuk membuat garis lurus",note:"Ketuk halaman untuk menambah catatan",stk:"Pilih stiker, lalu ketuk halaman",erase:"Ketuk tanda untuk menghapus"},
PWS=[.0025,.0045,.009];

/* ===== CSS ===== */
document.head.append(Object.assign(el("style"),{textContent:`
#rd2,#zp{position:fixed;inset:0;z-index:86;display:none;flex-direction:column;background:#EDE3D0;opacity:0;transition:opacity .35s}
#zp{z-index:84;background:linear-gradient(180deg,#FDFBF6,#F1E8D6)}
#rd2.on,#zp.on{display:flex}#rd2.vis,#zp.vis{opacity:1}
#zS{margin:auto;flex:none;will-change:transform}
.zg{position:relative;background:#fff;box-shadow:0 30px 60px -30px rgba(60,40,10,.55),0 0 0 1px rgba(60,40,10,.08);isolation:isolate}
.zg canvas{display:block}
.zl{position:absolute;inset:0;overflow:hidden;line-height:1;z-index:1}
.zl span,.zl br{color:transparent;position:absolute;white-space:pre;cursor:text;transform-origin:0 0}
.zl ::selection{background:rgba(70,120,220,.3)}
.zl span.hit{background:rgba(255,150,0,.42);border-radius:2px}
.za,.zi,.zc,.zh{position:absolute;inset:0;pointer-events:none}
.zh{z-index:0;width:100%;height:100%;mix-blend-mode:multiply;opacity:.5}
.za{z-index:2;width:100%;height:100%}.zc{z-index:3}.zi{z-index:4}
.za *,.zh *{pointer-events:none}
[data-t=erase] .za *,[data-t=erase] .zh *{pointer-events:auto;cursor:pointer}
[data-t=erase] .zl{pointer-events:none}
.zn,.zk2{touch-action:none;cursor:grab}
.zw{flex:none;width:36px;height:30px;border-radius:10px;background:#fff;box-shadow:inset 0 0 0 1px var(--line);display:grid;place-items:center}.zw.on{box-shadow:inset 0 0 0 2px var(--gold)}.zw i{display:block;width:18px;border-radius:9px;background:var(--ink)}
[data-t=pen] .zc,[data-t=line] .zc,[data-t=note] .zc,[data-t=stk] .zc{pointer-events:auto;touch-action:none;cursor:crosshair}
.zi>*{position:absolute;pointer-events:auto}
[data-t=pen] .zi>*,[data-t=line] .zi>*{pointer-events:none}
.zn{width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:9px 9px 9px 2px;font-size:14px;color:#33291F;box-shadow:0 4px 10px -3px rgba(60,40,10,.6),inset 0 0 0 1px rgba(0,0,0,.12)}
.zk2{transform:translate(-50%,-50%);line-height:1;user-select:none}
[data-t=erase] .zk2{cursor:pointer}
.zdock{background:rgba(255,254,251,.97);border-top:1px solid var(--line)}
.zrow{display:flex;gap:6px;align-items:center;overflow-x:auto;padding:8px 12px;scrollbar-width:none}
.zrow::-webkit-scrollbar{display:none}.zrow[hidden]{display:none}
.zt{flex:none;height:38px;padding:0 14px;border-radius:999px;font-weight:700;font-size:12.5px;background:#fff;box-shadow:inset 0 0 0 1px var(--line);white-space:nowrap;transition:transform .2s var(--e)}
.zt:active{transform:scale(.92)}.zt.on{background:var(--btn);color:#F6EAD0}
.zs{flex:none;width:30px;height:30px;border-radius:50%;box-shadow:inset 0 0 0 2px #fff,0 0 0 1px var(--line);transition:transform .2s var(--e)}
.zs.on{box-shadow:inset 0 0 0 2px #fff,0 0 0 2.5px var(--ink);transform:scale(1.12)}
.zk{flex:none;font-size:24px;width:40px;height:40px;border-radius:13px;background:#fff;box-shadow:inset 0 0 0 1px var(--line)}
.zk.on{box-shadow:inset 0 0 0 2px var(--gold)}
.zq{display:flex;align-items:center;gap:8px;padding:8px 14px;background:rgba(255,254,251,.97);border-bottom:1px solid var(--line)}
.zq[hidden]{display:none}.zq .search{height:40px}.zq small{font-size:12.5px;font-weight:700;color:var(--mute);white-space:nowrap}
.zsh{position:absolute;left:0;right:0;bottom:0;z-index:5;max-height:70%;overflow:auto;padding:18px 18px calc(18px + env(safe-area-inset-bottom,0px));border-radius:26px 26px 0 0;background:linear-gradient(180deg,#FFFEFB,#F8F1E3);box-shadow:0 -24px 50px -20px rgba(50,35,12,.5),0 0 0 1px var(--line);animation:sheet .35s var(--e)}
.zsh[hidden]{display:none}.zsh b{font:400 24px/1.1 "Instrument Serif","Noto Naskh Arabic",serif}
.zsh textarea{display:block;width:100%;min-height:110px;margin:12px 0;padding:12px 14px;border:0;border-radius:16px;background:#fff;box-shadow:inset 0 0 0 1px var(--line);outline:0;resize:vertical;font:inherit}
.zsh textarea:focus{box-shadow:inset 0 0 0 1.5px var(--gold)}
.zli{display:block;width:100%;text-align:left;padding:11px 14px;margin-top:8px;border-radius:16px;background:#fff;box-shadow:inset 0 0 0 1px var(--line);font-size:13.5px;transition:box-shadow .2s}
.zli:hover{box-shadow:inset 0 0 0 1px var(--gold)}.zli small{display:block;color:var(--mute);font-size:12px;font-weight:600}
.zr{display:flex;gap:12px;align-items:flex-start}.zr i{flex:none;font-style:normal;font-weight:700;font-size:12px;color:var(--gold-d);min-width:46px;padding-top:2px}
.zr span{min-width:0;overflow-wrap:anywhere;color:#4b4030;line-height:1.55}
mark{background:rgba(255,190,40,.5);color:inherit;border-radius:3px;padding:0 1px}
.zbk{margin:20px 0 4px;font:400 24px/1.1 "Instrument Serif","Noto Naskh Arabic",serif;display:flex;justify-content:space-between;gap:10px;align-items:baseline}
.zbk small{font:600 12px Manrope;color:var(--mute)}
.zst{max-width:760px;margin:0 auto 14px;padding:14px 16px;border-radius:20px;background:rgba(255,254,251,.9);box-shadow:inset 0 0 0 1px var(--line);display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;font-size:13px;font-weight:600;color:var(--mute)}
.zst .btn{height:38px;padding:0 16px}
#zpL{max-width:760px;margin:auto}
`}));

/* ===== Normalisasi & pencarian (sholat = shalat = salat = solat, tanpa harakat Arab) ===== */
const AL=[[/[\u064B-\u065F\u0670\u0640]/g,""],[/[أإآٱ]/g,"ا"],[/ى/g,"ي"],[/ة/g,"ه"],[/[’‘ʿʾ'`´]/g,""]];
function N(s){s=(s||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase();for(const[r,t]of AL)s=s.replace(r,t);return s.replace(/\s+/g," ")}
const key=t=>t.replace(/dz/g,"z").replace(/dh/g,"d").replace(/sh|ts/g,"s").replace(/th/g,"t").replace(/kh/g,"k").replace(/[qk]/g,"k").replace(/o/g,"a").replace(/(.)\1+/g,"$1");
const AR={salat:"صلاة",zakat:"زكاة",puasa:"صيام",siyam:"صيام",haji:"حج",wudu:"وضوء",taharah:"طهارة",nikah:"نكاح",riba:"ربا",talak:"طلاق",janazah:"جنائز",jenazah:"جنازة"};
function rx(q){return N(q).split(" ").filter(Boolean).slice(0,6).map(t=>{
 if(/[\u0600-\u06FF]/.test(t))return new RegExp(t.replace(/[^\u0600-\u06FF]/g,""),"g");
 const al=AR[key(t)],s=t.replace(/(.)\1+/g,"$1").replace(/[^a-z0-9]/g,"");let r="";
 for(let i=0;i<s.length;i++){const c=s[i],d=s[i+1];
  if(c==="k"&&d==="h"){r+="(?:kh|k|h)";i++}else if("std".includes(c)&&d==="h"){r+=c+"+h?";i++}
  else if(c==="d"&&d==="z"){r+="(?:dz|z)";i++}else if(c==="t"&&d==="s"){r+="(?:ts|s)";i++}
  else if(c==="a"||c==="o")r+="[ao]+";else if(c==="q"||c==="k")r+="[qk]+";else if(c==="s"||c==="t")r+=c+"+h?";else if(c==="z")r+="(?:dz|z)";else r+=c+"+"}
 return new RegExp(al?"(?:"+r+"|"+N(al)+")":r||"$^","g")})}
function scan(txts,res){const out=[];txts.forEach((t,i)=>{if(!t)return;let sc=0,pos=-1;
 for(const r of res){r.lastIndex=0;const m=r.exec(t);if(!m)return;if(pos<0)pos=m.index;r.lastIndex=0;sc+=(t.match(r)||[]).length}
 out.push({p:i+1,sc,pos,t})});return out}
function snip(h,res){const t=h.t,a=Math.max(0,h.pos-55),s=el("span");res[0].lastIndex=0;
 const seg=t.slice(a,h.pos+110),m=res[0].exec(seg);
 if(!m){s.textContent=seg;return s}
 s.append((a?"…":"")+seg.slice(0,m.index));s.append(el("mark","",m[0]));s.append(seg.slice(m.index+m[0].length)+"…");return s}

/* ===== IndexedDB: indeks teks per buku ===== */
const IX={},DB=()=>new Promise((ok,no)=>{const r=indexedDB.open("maktabah",1);r.onupgradeneeded=()=>r.result.createObjectStore("idx");r.onsuccess=()=>ok(r.result);r.onerror=()=>no()});
const dbGet=async k=>{try{const d=await DB();return await new Promise(ok=>{const q=d.transaction("idx").objectStore("idx").get(k);q.onsuccess=()=>ok(q.result);q.onerror=()=>ok(null)})}catch(e){return null}};
const dbSet=async(k,v)=>{try{const d=await DB();d.transaction("idx","readwrite").objectStore("idx").put(v,k)}catch(e){}};
const getIdx=async b=>IX[b.f]||(IX[b.f]=await dbGet("v1:"+b.f)||null);
async function build(b,doc,prog){const out=[];
 for(let i=1;i<=doc.numPages;i++){const p=await doc.getPage(i),t=await p.getTextContent();out.push(N(t.items.map(x=>x.str).join(" ")));p.cleanup();if(prog&&i%4===0)prog(i/doc.numPages)}
 IX[b.f]=out;dbSet("v1:"+b.f,out);return out}
const hasText=x=>x&&x.join("").length>40;

/* ===== Pembaca ===== */
const S={pw:.0045,rz:1,pg:0,open:0,doc:null,b:null,n:1,z:1,tok:0,task:null,t:"baca",c:COL[0],sk:STK[0],ann:{},W:null,rx:null,hits:[],hi:-1,lt:null};
const R=el("div");R.id="rd2";R.setAttribute("role","dialog");R.dataset.t="baca";
const ic=d=>'<svg viewBox="0 0 24 24"><path d="'+d+'"/></svg>';
R.innerHTML=`<div class="rbar"><button class="ib" id="zX" aria-label="Tutup">${ic("M15 5l-7 7 7 7")}</button><div class="rtt"><b id="zT"></b><small id="zA"></small></div>
<button class="ib" id="zFind" aria-label="Cari di buku">${ic("M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4")}</button>
<button class="ib" id="zList" aria-label="Catatanku">${ic("M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01")}</button>
<button class="ib" id="zZo" aria-label="Perkecil">${ic("M5 12h14")}</button><button class="ib" id="zPct" style="width:auto;padding:0 11px;border-radius:999px;font-size:12px;font-weight:700" aria-label="Atur ulang zoom">100%</button><button class="ib" id="zZi" aria-label="Perbesar">${ic("M5 12h14M12 5v14")}</button>
<a class="ib" id="zOpen" target="_blank" rel="noopener" aria-label="Buka PDF asli">${ic("M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5")}</a></div>
<div class="zq" id="zQ" hidden><label class="search"><input id="zQi" type="search" placeholder="Cari di buku ini (mis. sholat)" dir="auto"></label><small id="zQc"></small>
<button class="ib" id="zQp" aria-label="Sebelumnya">${ic("M5 15l7-7 7 7")}</button><button class="ib" id="zQn" aria-label="Berikutnya">${ic("M5 9l7 7 7-7")}</button></div>
<div class="rtrack"><i id="zF"></i></div>
<div class="rview" id="zV"><div id="zS"></div><div class="rmsg" id="zM"><p id="zMt">Memuat buku…</p></div></div>
<div class="zdock"><div class="zrow" id="zTools"></div><div class="zrow" id="zCtx"></div></div>
<div class="rfoot"><button class="ib" id="zPv" aria-label="Sebelumnya">${ic("M15 5l-7 7 7 7")}</button><div class="rpg">Hal. <input id="zGo" type="number" min="1" inputmode="numeric"><span id="zOf"></span></div><button class="ib" id="zNx" aria-label="Berikutnya">${ic("M9 5l7 7-7 7")}</button></div>
<div class="zsh" id="zSh" hidden></div>`;
document.body.append(R);
const V=$("#zV"),stage=$("#zS");

function dock(){const T=$("#zTools"),C=$("#zCtx");T.replaceChildren();C.replaceChildren();
 TOOLS.forEach(([k,l])=>{const b=el("button","zt"+(S.t===k?" on":""),l);b.onclick=()=>setT(k);T.append(b)});
 const u=el("button","zt","↶ Urungkan");u.onclick=undo;T.append(u);
 if(S.t==="stk")STK.forEach(e=>{const b=el("button","zk"+(S.sk===e?" on":""),e);b.onclick=()=>{S.sk=e;dock()};C.append(b)});
 else if(["hl","ul","pen","line","note"].includes(S.t)){if(S.t==="pen"||S.t==="line")PWS.forEach((v,i)=>{const b=el("button","zw"+(S.pw===v?" on":"")),d=el("i");d.style.height=(2+i*3)+"px";b.append(d);b.setAttribute("aria-label","Ketebalan");b.onclick=()=>{S.pw=v;dock()};C.append(b)});COL.forEach(c=>{const b=el("button","zs"+(S.c===c?" on":""));b.style.background=c;b.setAttribute("aria-label","Warna");b.onclick=()=>{S.c=c;dock()};C.append(b)})}
 C.hidden=!C.children.length}
function setT(k){S.t=k;R.dataset.t=k;dock();try{getSelection().removeAllRanges()}catch(e){}if(HINT[k])A.toast(HINT[k])}
const saveA=()=>SV("ann:"+S.b.id,S.ann);
function add(o){(S.ann[S.n]=S.ann[S.n]||[]).push(o);saveA();draw()}
function undo(){const L=S.ann[S.n];if(!L||!L.length)return A.toast("Tidak ada tanda di halaman ini");L.pop();saveA();draw()}

const pd=(p,w,h)=>{if(p.length<3)return"M"+p.map(q=>q[0]*w+" "+q[1]*h).join("L");let d="M"+p[0][0]*w+" "+p[0][1]*h;for(let i=1;i<p.length-1;i++)d+="Q"+p[i][0]*w+" "+p[i][1]*h+" "+(p[i][0]+p[i+1][0])/2*w+" "+(p[i][1]+p[i+1][1])/2*h;const l=p[p.length-1];return d+"L"+l[0]*w+" "+l[1]*h};
function drag(e,o,n){if(S.t==="erase"||S.t==="pen"||S.t==="line")return;const r=S.W.it.getBoundingClientRect();let mv=0;try{n.setPointerCapture(e.pointerId)}catch(x){}
 const m=ev=>{mv=1;o.x=Math.max(0,Math.min(1,(ev.clientX-r.left)/r.width));o.y=Math.max(0,Math.min(1,(ev.clientY-r.top)/r.height));n.style.left=o.x*r.width+"px";n.style.top=o.y*r.height+"px"},
 u=()=>{n.removeEventListener("pointermove",m);n.removeEventListener("pointerup",u);n.removeEventListener("pointercancel",u);if(mv){saveA();n._m=1}};
 n.addEventListener("pointermove",m);n.addEventListener("pointerup",u);n.addEventListener("pointercancel",u)}
function draw(){const W=S.W;if(!W)return;const w=W.vp.width,h=W.vp.height,O=S.ann[S.n]||[];W.hl.replaceChildren();W.an.replaceChildren();W.it.replaceChildren();
 O.forEach(o=>{const del=()=>{const i=O.indexOf(o);if(i>-1)O.splice(i,1);saveA();draw()},er=e=>{e.onclick=()=>{if(S.t==="erase")del()};return e};
  if(o.k==="hl")o.r.forEach(r=>W.hl.append(er(svg("rect",{x:r[0]*w-1,y:(r[1]+r[3]*.08)*h,width:r[2]*w+2,height:r[3]*h*.84,rx:3,fill:o.c}))));
  else if(o.k==="ul")o.r.forEach(r=>W.an.append(er(svg("rect",{x:r[0]*w,y:(r[1]+r[3])*h-1.5,width:r[2]*w,height:2.4,rx:1,fill:o.c}))));
  else if(o.k==="pen"){const a={d:pd(o.p,w,h),fill:"none","stroke-linecap":"round","stroke-linejoin":"round"};
   W.an.append(er(svg("path",{...a,stroke:o.c,"stroke-width":o.w*w})),er(svg("path",{...a,stroke:"transparent","stroke-width":Math.max(16,o.w*w)})))}
  else if(o.k==="note"){const n=el("button","zn","✎");n.style.left=o.x*w+"px";n.style.top=o.y*h+"px";n.style.background=o.c;n.title=o.t;n.onpointerdown=e=>drag(e,o,n);n.onclick=()=>{if(n._m){n._m=0;return}S.t==="erase"?del():noteEd(o)};W.it.append(n)}
  else if(o.k==="stk"){const s=el("span","zk2",o.e);s.style.cssText=`left:${o.x*w}px;top:${o.y*h}px;font-size:${w*.075}px`;s.onpointerdown=e=>drag(e,o,s);s.onclick=()=>{if(s._m){s._m=0;return}if(S.t==="erase")del()};W.it.append(s)}})}

function noteEd(o){const sh=$("#zSh"),ta=el("textarea"),row=el("div","act");sh.hidden=false;sh.replaceChildren();ta.value=o.t||"";ta.placeholder="Tulis catatan atau komentar…";ta.dir="auto";
 const ok=el("button","btn","Simpan"),dl=el("button","btn g","Hapus"),done=()=>{sh.hidden=true;saveA();draw()};
 ok.onclick=()=>{o.t=ta.value.trim();if(!o.t){const L=S.ann[S.n],i=L.indexOf(o);if(i>-1)L.splice(i,1)}done()};
 dl.onclick=()=>{const L=S.ann[S.n],i=L.indexOf(o);if(i>-1)L.splice(i,1);done()};
 row.append(dl,ok);sh.append(el("b","","Catatan · hal. "+S.n),ta,row);setTimeout(()=>ta.focus(),60)}

function bind(W){const cap=W.cap;let pts=null,pv=null;const P=e=>{const r=cap.getBoundingClientRect();return[(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height]};
 cap.onpointerdown=e=>{const[x,y]=P(e);
  if(S.t==="pen"||S.t==="line"){pts=[[x,y]];pv=svg("path",{fill:"none",stroke:S.c,"stroke-width":S.pw*W.vp.width,"stroke-linecap":"round","stroke-linejoin":"round"});W.an.append(pv);cap.setPointerCapture(e.pointerId)}
  else if(S.t==="note"){const o={k:"note",x,y,c:S.c,t:""};add(o);noteEd(o)}
  else if(S.t==="stk")add({k:"stk",x,y,e:S.sk})};
 cap.onpointermove=e=>{if(!pts)return;const p=P(e),l=pts[pts.length-1];if(S.t==="line")pts[1]=p;else if(Math.hypot(p[0]-l[0],p[1]-l[1])>.0015)pts.push(p);pv.setAttribute("d",pd(pts,W.vp.width,W.vp.height))};
 cap.onpointerup=cap.onpointercancel=()=>{if(!pts)return;if(pts.length>1)add({k:"pen",c:S.c,w:S.pw,p:pts});else pv.remove();pts=null}}

function applySel(){if(S.t!=="hl"&&S.t!=="ul")return;const sl=getSelection(),W=S.W;if(!sl||sl.isCollapsed||!W||!sl.rangeCount)return;
 const rg=sl.getRangeAt(0);if(!W.tl.contains(rg.commonAncestorContainer))return;const r0=W.w.getBoundingClientRect(),rs=[];
 for(const r of rg.getClientRects()){if(r.width<2||r.height>r0.height*.08)continue;rs.push([(r.left-r0.left)/r0.width,(r.top-r0.top)/r0.height,r.width/r0.width,r.height/r0.height])}
 sl.removeAllRanges();if(rs.length)add({k:S.t,c:S.c,r:rs})}
document.addEventListener("pointerup",e=>{if(S.open&&e.pointerType!=="touch")setTimeout(applySel,15)});
let sct;document.addEventListener("selectionchange",()=>{if(!S.open||(S.t!=="hl"&&S.t!=="ul"))return;clearTimeout(sct);sct=setTimeout(()=>{if(!matchMedia("(pointer:fine)").matches)applySel()},800)});

function markHits(){const W=S.W;if(!W||!S.rx)return;W.tl.querySelectorAll("span").forEach(sp=>{const t=N(sp.textContent);if(S.rx.some(r=>{r.lastIndex=0;return r.test(t)}))sp.classList.add("hit")})}

async function show(num,keep,foc){const d=S.doc;if(!d)return;num=Math.max(1,Math.min(d.numPages,num));S.n=num;const tok=++S.tok;
 $("#zGo").value=num;$("#zPv").disabled=num<=1;$("#zNx").disabled=num>=d.numPages;$("#zF").style.width=num/d.numPages*100+"%";A.setProg(S.b,num);$("#zSh").hidden=true;
 try{const pg=await d.getPage(num);if(tok!==S.tok)return;
  const v0=pg.getViewport({scale:1}),vp=pg.getViewport({scale:Math.max(.2,Math.min((V.clientWidth-24)/v0.width,(V.clientHeight-24)/v0.height))*S.z});
  let dpr=Math.min(devicePixelRatio||1,2);while(vp.width*vp.height*dpr*dpr>9e6&&dpr>1)dpr-=.25;
  const w=el("div","zg"),c=el("canvas"),tl=el("div","zl"),an=svg("svg",{viewBox:`0 0 ${vp.width} ${vp.height}`,class:"za"}),hl=svg("svg",{viewBox:`0 0 ${vp.width} ${vp.height}`,class:"zh"}),it=el("div","zi"),cap=el("div","zc");
  w.style.width=vp.width+"px";w.style.height=vp.height+"px";c.width=Math.floor(vp.width*dpr);c.height=Math.floor(vp.height*dpr);c.style.width=vp.width+"px";c.style.height=vp.height+"px";
  tl.style.setProperty("--scale-factor",vp.scale);w.append(c,hl,tl,an,cap,it);
  if(S.task){try{S.task.cancel()}catch(e){}}
  const task=pg.render({canvasContext:c.getContext("2d"),viewport:vp,transform:dpr!==1?[dpr,0,0,dpr,0,0]:null});S.task=task;await task.promise;if(tok!==S.tok)return;
  stage.style.transition="none";stage.style.transform="";S.rz=S.z;stage.replaceChildren(w);if(!keep)V.scrollTo(0,0);
  if(foc){const r2=stage.getBoundingClientRect();V.scrollLeft+=r2.left+foc.fx*r2.width-foc.cx;V.scrollTop+=r2.top+foc.fy*r2.height-foc.cy}
  $("#zPct").textContent=Math.round(S.z*100)+"%";const W=S.W={w,vp,tl,an,hl,it,cap};bind(W);draw();
  try{await pdfjsLib.renderTextLayer({textContentSource:pg.streamTextContent(),container:tl,viewport:vp,textDivs:[]}).promise;if(tok===S.tok)markHits()}catch(e){}
  if(num<d.numPages)d.getPage(num+1).catch(()=>{})}catch(e){}}
const turn=d=>S.doc&&show(S.n+d);
let zt,fo=null;
function zoomTo(nz,cx,cy,anim){nz=Math.max(1,Math.min(5,nz));if(!S.doc||Math.abs(nz-S.z)<.005)return;
 if(!fo){const r=stage.getBoundingClientRect();fo={fx:(cx-r.left)/r.width,fy:(cy-r.top)/r.height,cx,cy}}
 S.z=nz;stage.style.transformOrigin=fo.fx*100+"% "+fo.fy*100+"%";stage.style.transition=anim?"transform .26s cubic-bezier(.22,.8,.2,1)":"none";stage.style.transform="scale("+nz/S.rz+")";
 V.classList.toggle("z",nz>1);$("#zPct").textContent=Math.round(nz*100)+"%";clearTimeout(zt);zt=setTimeout(()=>{const f=fo;fo=null;show(S.n,true,f)},anim?280:170)}
const vc=()=>{const r=V.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]};
function zoom(d){const[x,y]=vc();zoomTo(S.z*(d>0?1.3:1/1.3),x,y,true)}
$("#zPct").onclick=()=>{const[x,y]=vc();zoomTo(1,x,y,true)};
V.addEventListener("wheel",e=>{if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();zoomTo(S.z*Math.exp(-e.deltaY*.0025),e.clientX,e.clientY,false)},{passive:false});
let d0=0,z0=1,lt=0;const dst=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
V.addEventListener("touchstart",e=>{if(e.touches.length===2){S.pg=1;d0=dst(e.touches);z0=S.z}},{passive:true});
V.addEventListener("touchmove",e=>{if(e.touches.length===2&&d0){e.preventDefault();const t=e.touches;zoomTo(z0*dst(t)/d0,(t[0].clientX+t[1].clientX)/2,(t[0].clientY+t[1].clientY)/2,false)}},{passive:false});
V.addEventListener("touchend",e=>{if(!e.touches.length){d0=0;setTimeout(()=>S.pg=0,120)}});

async function open(b,start,q){
 if(!b.f)return A.toast("PDF buku ini belum diunggah ke folder buku");
 if(S.open)return;S.open=1;S.b=b;S.z=1;S.doc=null;S.n=start||A.prog(b)||1;S.ann=LS("ann:"+b.id,{});S.rx=null;S.hits=[];S.hi=-1;S.t="baca";R.dataset.t="baca";V.classList.remove("z");
 $("#zT").textContent=b.t;$("#zA").textContent=b.a;$("#zOpen").href=A.url(b);$("#zMt").textContent="Memuat buku…";$("#zM").classList.remove("hide");stage.replaceChildren();$("#zQ").hidden=true;$("#zQi").value="";$("#zQc").textContent="";
 $("#zGo").value=S.n;$("#zOf").textContent="/ "+(b.pg||"…");$("#zPv").disabled=$("#zNx").disabled=true;$("#zF").style.width="0";dock();
 R.classList.add("on");requestAnimationFrame(()=>R.classList.add("vis"));document.documentElement.style.overflow="hidden";try{history.pushState({zr:1},"")}catch(e){}
 try{const lib=await A.loadPdfJs(),t=lib.getDocument({url:A.url(b)});S.lt=t;
  t.onProgress=p=>{if(S.open&&!S.doc&&p.total)$("#zMt").textContent="Memuat buku "+Math.min(100,Math.round(p.loaded/p.total*100))+"%"};
  const doc=await t.promise;if(!S.open||S.b!==b){try{doc.destroy()}catch(e){}return}
  S.doc=doc;A.setPages(b,doc.numPages);$("#zGo").max=doc.numPages;$("#zOf").textContent="/ "+doc.numPages;$("#zM").classList.add("hide");
  if(q){$("#zQ").hidden=false;$("#zQi").value=q;await find(q,S.n)}else show(Math.min(S.n,doc.numPages))
 }catch(e){if(S.open&&S.b===b)$("#zMt").textContent="PDF tidak bisa dimuat. Pastikan file ada di folder buku dan situs dibuka lewat Vercel."}}
function close(fromPop){if(!S.open)return;S.open=0;S.tok++;if(S.task){try{S.task.cancel()}catch(e){}}
 if(S.doc){try{S.doc.destroy()}catch(e){}S.doc=null}if(S.lt){try{S.lt.destroy()}catch(e){}}S.W=null;
 R.classList.remove("vis");document.documentElement.style.overflow=PS.open?"hidden":"";setTimeout(()=>{if(!S.open){R.classList.remove("on");stage.replaceChildren()}},450);
 if(!fromPop&&history.state&&history.state.zr){try{history.back()}catch(e){}}}

/* ===== Cari di dalam buku ===== */
async function find(q,from){const c=$("#zQc");S.rx=rx(q);S.hits=[];S.hi=-1;if(!N(q).trim()){c.textContent="";return show(S.n)}
 let ix=await getIdx(S.b);
 if(!ix){c.textContent="Menyiapkan 0%";ix=await build(S.b,S.doc,p=>{c.textContent="Menyiapkan "+Math.round(p*100)+"%"})}
 if(!S.open)return;if(!hasText(ix)){c.textContent="PDF tanpa teks";return show(S.n)}
 S.hits=scan(ix,S.rx).sort((a,b)=>a.p-b.p);
 if(!S.hits.length){c.textContent="0 hasil";return show(S.n)}
 const i=S.hits.findIndex(h=>h.p>=(from||S.n));hit(i<0?0:i)}
function hit(i){const n=S.hits.length;S.hi=(i+n)%n;$("#zQc").textContent=(S.hi+1)+" / "+n+" hal.";show(S.hits[S.hi].p)}
let qt;$("#zQi").oninput=e=>{clearTimeout(qt);qt=setTimeout(()=>find(e.target.value,S.n),450)};
$("#zQi").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();S.hits.length?hit(S.hi+(e.shiftKey?-1:1)):find(e.target.value,S.n)}};
$("#zQn").onclick=()=>S.hits.length&&hit(S.hi+1);$("#zQp").onclick=()=>S.hits.length&&hit(S.hi-1);
$("#zFind").onclick=()=>{const q=$("#zQ");q.hidden=!q.hidden;if(!q.hidden)$("#zQi").focus();else{S.rx=null;show(S.n,true)}};

/* ===== Daftar catatan & tanda ===== */
$("#zList").onclick=()=>{const sh=$("#zSh"),P=Object.keys(S.ann).map(Number).filter(p=>(S.ann[p]||[]).length).sort((a,b)=>a-b);
 sh.hidden=false;sh.replaceChildren(el("b","","Catatan & tanda saya"));
 if(!P.length)sh.append(el("p","none","Belum ada tanda. Pilih alat di bawah lalu mulai menandai."));
 P.forEach(p=>{const L=S.ann[p],nm={hl:"stabilo",ul:"garis bawah",pen:"coretan",note:"catatan",stk:"stiker"},cnt={};L.forEach(o=>cnt[o.k]=(cnt[o.k]||0)+1);
  const notes=L.filter(o=>o.k==="note"&&o.t).map(o=>"📝 "+o.t).join("\n"),b=el("button","zli","Halaman "+p);
  b.append(el("small","",Object.keys(cnt).map(k=>cnt[k]+" "+nm[k]).join(" · ")));if(notes){const n=el("small","",notes);n.style.whiteSpace="pre-wrap";b.append(n)}
  b.onclick=()=>{sh.hidden=true;show(p)};sh.append(b)});
 const x=el("button","btn g","Tutup");x.style.marginTop="14px";x.onclick=()=>sh.hidden=true;sh.append(x)};

/* ===== Kontrol dasar ===== */
$("#zX").onclick=()=>close();$("#zPv").onclick=()=>turn(-1);$("#zNx").onclick=()=>turn(1);$("#zZi").onclick=()=>zoom(1);$("#zZo").onclick=()=>zoom(-1);
$("#zGo").onfocus=e=>e.target.select();$("#zGo").onchange=e=>show(parseInt(e.target.value)||S.n);
addEventListener("keydown",e=>{if(!S.open)return;
 if(e.key==="Escape"){e.stopImmediatePropagation();close();return}
 if(/INPUT|TEXTAREA/.test(e.target.tagName))return;
 if(e.key==="ArrowRight"||e.key==="PageDown"){e.preventDefault();turn(1)}else if(e.key==="ArrowLeft"||e.key==="PageUp"){e.preventDefault();turn(-1)}
 else if(e.key==="+"||e.key==="="){zoom(1)}else if(e.key==="-"){zoom(-1)}},true);
let sx=null,sy=0;V.addEventListener("pointerdown",e=>{sx=e.clientX;sy=e.clientY});V.addEventListener("pointercancel",()=>sx=null);
V.addEventListener("pointerup",e=>{if(sx==null)return;const dx=e.clientX-sx,dy=e.clientY-sy;sx=null;if(S.pg)return;if(S.t==="baca"&&S.z<1.02&&Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.8)return turn(dx<0?1:-1);
 if(e.pointerType==="touch"&&S.t==="baca"&&Math.abs(dx)<10&&Math.abs(dy)<10){const n=Date.now();if(n-lt<320){zoomTo(S.z>1.05?1:2.2,e.clientX,e.clientY,true);lt=0}else lt=n}});
let rzt;addEventListener("resize",()=>{if(!S.open||!S.doc)return;clearTimeout(rzt);rzt=setTimeout(()=>show(S.n,true),180)});

/* ===== Cari isi semua buku ===== */
const P=el("div");P.id="zp";P.innerHTML=`<div class="rbar"><button class="ib" id="pX" aria-label="Kembali">${ic("M15 5l-7 7 7 7")}</button><label class="search" style="flex:1"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input id="pQ" type="search" placeholder="Cari di isi semua buku, mis. sholat" dir="auto"></label></div>
<div class="fbody"><div id="zpL"></div></div>`;document.body.append(P);
const PS={open:0,busy:0,q:""},L=$("#zpL");
function stat(){const n=A.BOOKS.filter(b=>b.f&&IX[b.f]).length,tot=A.BOOKS.filter(b=>b.f).length;return[n,tot]}
async function loadAll(){await Promise.all(A.BOOKS.filter(b=>b.f).map(getIdx))}
async function indexAll(){if(PS.busy)return;PS.busy=1;const lib=await A.loadPdfJs();
 for(const b of A.BOOKS.filter(b=>b.f&&!IX[b.f])){if(!PS.open)break;let doc;
  try{doc=await lib.getDocument({url:A.url(b)}).promise;await build(b,doc,p=>{const s=$("#zpS");if(s)s.textContent="Mengindeks "+b.t+" "+Math.round(p*100)+"%"})}catch(e){}
  finally{if(doc)try{doc.destroy()}catch(e){}}renderP()}
 PS.busy=0;renderP()}
function renderP(){const[n,tot]=stat(),q=PS.q.trim();L.replaceChildren();
 const st=el("div","zst"),tx=el("span","",PS.busy?"":(n+" dari "+tot+" buku siap dicari"));tx.id="zpS";st.append(tx);
 if(n<tot&&!PS.busy){const b=el("button","btn","Indeks "+(n?"sisanya":"semua buku"));b.onclick=indexAll;st.append(b)}else if(PS.busy)tx.textContent="Mengindeks…";
 L.append(st);if(n<tot&&!PS.busy)L.append(Object.assign(el("p","none","Pencarian hanya mencakup buku yang sudah diindeks. Indeks dibuat sekali (butuh mengunduh PDF) lalu tersimpan di perangkat ini."),{style:"padding:6px 10px 20px"}));
 if(!q)return;const res=rx(q);if(!res.length)return;let any=0;
 A.BOOKS.filter(b=>b.f&&IX[b.f]).map(b=>({b,h:scan(IX[b.f],res)})).filter(x=>x.h.length).sort((a,b)=>b.h.reduce((s,x)=>s+x.sc,0)-a.h.reduce((s,x)=>s+x.sc,0)).forEach(({b,h})=>{any=1;
  const head=el("div","zbk");head.append(el("span","",b.t),el("small","",h.length+" halaman"));L.append(head);
  h.sort((x,y)=>y.sc-x.sc||x.p-y.p).slice(0,8).forEach(x=>{const r=el("button","zli zr"),pg=el("i","","Hal. "+x.p);r.append(pg,snip(x,res));r.onclick=()=>open(b,x.p,q);L.append(r)});
  if(h.length>8){const m=el("small","","+"+(h.length-8)+" halaman lain. Buka bukunya lalu cari di dalam untuk melihat semuanya.");m.style.cssText="display:block;margin:8px 4px;color:var(--mute);font-weight:600";L.append(m)}});
 if(!any)L.append(el("p","none","Tidak ada hasil untuk “"+q+"”."+(n<tot?" Coba indeks semua buku dulu.":"")))}
let pt;$("#pQ").oninput=e=>{clearTimeout(pt);pt=setTimeout(()=>{PS.q=e.target.value;renderP()},250)};
async function openSearch(){if(PS.open)return;PS.open=1;P.classList.add("on");requestAnimationFrame(()=>requestAnimationFrame(()=>P.classList.add("vis")));
 document.documentElement.style.overflow="hidden";try{history.pushState({zp:1},"")}catch(e){}await loadAll();renderP();setTimeout(()=>$("#pQ").focus(),250)}
function closeSearch(fromPop){if(!PS.open)return;PS.open=0;P.classList.remove("vis");setTimeout(()=>{if(!PS.open)P.classList.remove("on")},400);if(!S.open)document.documentElement.style.overflow="";
 if(!fromPop&&history.state&&history.state.zp){try{history.back()}catch(e){}}}
$("#pX").onclick=()=>closeSearch();
addEventListener("popstate",()=>{if(S.open&&!(history.state&&history.state.zr))close(true);else if(PS.open&&!S.open&&!(history.state&&history.state.zp))closeSearch(true)});
const nb=$("#isiNav");if(nb)nb.onclick=openSearch;
window.Reader={open,search:openSearch};
})();
