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
TOOLS=[["hl","🖍️","Stabilo"],["ul","➖","Garis"],["pen","✏️","Pena"],["line","📏","Lurus"],["note","📝","Catatan"],["stk","😊","Stiker"],["erase","🧽","Hapus"]],
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
[data-t=note] .zc,[data-t=stk] .zc{touch-action:auto}
.zi>*{position:absolute;pointer-events:auto}
[data-t=pen] .zi>*,[data-t=line] .zi>*{pointer-events:none}
.zn{width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:9px 9px 9px 2px;font-size:14px;color:#33291F;box-shadow:0 4px 10px -3px rgba(60,40,10,.6),inset 0 0 0 1px rgba(0,0,0,.12)}
.zk2{transform:translate(-50%,-50%);line-height:1;user-select:none}
[data-t=erase] .zk2{cursor:pointer}
.zbody{flex:1;min-height:0;display:flex;flex-direction:column;position:relative}
#rd2 .rbar{gap:6px;padding:calc(6px + env(safe-area-inset-top,0px)) max(10px,env(safe-area-inset-right,0px)) 6px max(10px,env(safe-area-inset-left,0px))}
#rd2 .ib{width:38px;height:38px}#rd2 .rtt b{font-size:18px}
#rd2 .rview{padding:8px}
#rd2 .zue,#rd2 .zdk{display:none}#rd2.ed .zue{display:grid}
#rd2 .rfoot{justify-content:space-between;gap:8px;padding:6px max(10px,env(safe-area-inset-right,0px)) calc(6px + env(safe-area-inset-bottom,0px)) max(10px,env(safe-area-inset-left,0px))}
.zpgr{display:flex;align-items:center;gap:8px}
.zedit{flex:none;height:38px;padding:0 14px;border-radius:999px;display:flex;align-items:center;gap:7px;font-weight:700;font-size:13px;background:#fff;box-shadow:inset 0 0 0 1px var(--line);transition:transform .2s var(--e)}
.zedit:active{transform:scale(.94)}.zedit.on{background:var(--btn);color:#F6EAD0}
.zedit svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.zdock{display:none;flex:none;background:rgba(255,254,251,.98);border-top:1px solid var(--line)}
#rd2.ed .zdock{display:flex;flex-direction:column;animation:zup .25s var(--e)}
.zrow{display:flex;gap:6px;align-items:center;overflow-x:auto;padding:6px 12px;scrollbar-width:none}
.zrow::-webkit-scrollbar{display:none}.zrow[hidden]{display:none}
.zt{flex:none;min-width:50px;height:46px;padding:0 6px;border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;background:#fff;box-shadow:inset 0 0 0 1px var(--line);font-size:10.5px;font-weight:700;color:var(--mute);line-height:1;transition:transform .2s var(--e)}
.zt b{font-size:19px;font-weight:400;line-height:1}
.zt:active{transform:scale(.92)}.zt.on{background:var(--btn);color:#F6EAD0}
.zs{flex:none;width:30px;height:30px;border-radius:50%;box-shadow:inset 0 0 0 2px #fff,0 0 0 1px var(--line);transition:transform .2s var(--e)}
.zs.on{box-shadow:inset 0 0 0 2px #fff,0 0 0 2.5px var(--ink);transform:scale(1.12)}
.zk{flex:none;font-size:24px;width:40px;height:40px;border-radius:13px;background:#fff;box-shadow:inset 0 0 0 1px var(--line)}
.zk.on{box-shadow:inset 0 0 0 2px var(--gold)}
#zBd{position:absolute;right:max(12px,env(safe-area-inset-right,0px));bottom:max(10px,env(safe-area-inset-bottom,0px));z-index:4;padding:5px 12px;border-radius:999px;background:rgba(43,33,24,.78);color:#F6EAD0;font-size:12px;font-weight:700;pointer-events:none;display:none}
#rd2.im #zBd{display:block}
#rd2.im .rbar,#rd2.im .rtrack,#rd2.im .rfoot{display:none}
.zmn{position:absolute;right:max(10px,env(safe-area-inset-right,0px));top:calc(54px + env(safe-area-inset-top,0px));z-index:7;min-width:230px;padding:6px;border-radius:18px;background:#FFFEFB;box-shadow:0 20px 40px -14px rgba(50,35,12,.5),0 0 0 1px var(--line);animation:zpop .18s var(--e)}
.zmn[hidden]{display:none}
.zmn button,.zmn a{display:flex;align-items:center;gap:12px;width:100%;padding:11px 12px;border-radius:12px;font-weight:600;font-size:13.5px;text-align:left;color:var(--ink);text-decoration:none}
.zmn button:hover,.zmn a:hover{background:rgba(227,205,155,.3)}
.zmn svg{flex:none;width:18px;height:18px;stroke:var(--ink);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
@media(min-width:900px){#rd2 .zdk{display:grid}#rd2 .zmo{display:none}}
@media(max-width:480px){#rd2.ed #zFind{display:none}}
@media(orientation:landscape) and (min-width:560px){
.zbody{flex-direction:row}
.zbody>.rview{order:1;min-width:0}.zdock{order:2}.rfoot{order:3}
#rd2 .rfoot{flex-direction:column;justify-content:center;gap:12px;width:70px;padding:8px max(8px,env(safe-area-inset-right,0px)) 8px 8px;border-top:0;border-left:1px solid var(--line)}
.zpgr{flex-direction:column;gap:6px}
#rd2 .rpg{flex-direction:column;gap:2px;font-size:11px}
#rd2 .rpg input{width:54px;height:34px}
.zedit{flex-direction:column;gap:3px;height:auto;width:54px;padding:8px 4px;border-radius:16px;font-size:10.5px}
#rd2.ed .zdock{flex-direction:row;border-top:0;border-left:1px solid var(--line)}
.zrow{flex-direction:column;overflow-x:visible;overflow-y:auto;padding:8px 6px}
#zCtx{border-left:1px solid var(--line)}
}
@media(orientation:landscape) and (max-height:560px){.zt span{display:none}.zt{height:38px;min-width:44px}.zt b{font-size:18px}#rd2 .rfoot{gap:8px}}
@keyframes zup{from{transform:translateY(12px);opacity:0}}@keyframes zin{from{transform:translateX(100%)}}@keyframes zpop{from{transform:scale(.94) translateY(-6px);opacity:0}}

.zq{display:flex;align-items:center;gap:8px;padding:8px 14px;background:rgba(255,254,251,.97);border-bottom:1px solid var(--line)}
.zq[hidden]{display:none}.zq .search{height:40px}.zq small{font-size:12.5px;font-weight:700;color:var(--mute);white-space:nowrap}
.zsh{position:absolute;left:0;right:0;bottom:0;z-index:6;max-height:62%;overflow:auto;padding:14px 16px calc(14px + env(safe-area-inset-bottom,0px));border-radius:22px 22px 0 0;background:linear-gradient(180deg,#FFFEFB,#F8F1E3);box-shadow:0 -24px 50px -20px rgba(50,35,12,.5),0 0 0 1px var(--line);animation:sheet .3s var(--e)}
.zsh.ne{display:flex;flex-direction:column}
.zsh[hidden]{display:none}.zsh b{font:400 22px/1.1 "Instrument Serif","Noto Naskh Arabic",serif}
.zsh textarea{display:block;width:100%;flex:1;min-height:84px;margin:10px 0;padding:12px 14px;border:0;border-radius:16px;background:#fff;box-shadow:inset 0 0 0 1px var(--line);outline:0;resize:none;font:inherit;font-size:16px}
.zsh textarea:focus{box-shadow:inset 0 0 0 1.5px var(--gold)}
.zsh .act{margin-top:0}
@media(orientation:landscape) and (min-width:560px){.zsh{left:auto;top:0;bottom:0;width:min(340px,48%);max-height:none;border-radius:22px 0 0 22px;padding:calc(12px + env(safe-area-inset-top,0px)) 14px 12px;animation:zin .3s var(--e)}.zsh textarea{min-height:56px}}

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
const S={pw:.0045,rz:1,pg:0,open:0,doc:null,b:null,n:1,z:1,tok:0,task:null,t:"baca",c:COL[0],sk:STK[0],ann:{},W:null,rx:null,hits:[],hi:-1,lt:null,hist:[],redo:[],ed:null,last:"hl",fit:LS("fit",null),vw:0,vh:0};
const R=el("div");R.id="rd2";R.setAttribute("role","dialog");R.dataset.t="baca";
const ic=d=>'<svg viewBox="0 0 24 24"><path d="'+d+'"/></svg>',
UNDO="M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3",REDO="M15 14l5-5-5-5M20 9H10a6 6 0 0 0 0 12h3",
SRCH="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4",PEN="M4 20l4-1 11-11a2.1 2.1 0 0 0-3-3L5 16l-1 4z";
R.innerHTML=`<div class="rbar"><button class="ib" id="zX" aria-label="Tutup">${ic("M15 5l-7 7 7 7")}</button><div class="rtt"><b id="zT"></b><small id="zA"></small></div>
<button class="ib zue" id="zUn" aria-label="Urungkan" title="Urungkan (Ctrl+Z)" disabled>${ic(UNDO)}</button><button class="ib zue" id="zRe" aria-label="Ulangi" title="Ulangi (Ctrl+Shift+Z)" disabled>${ic(REDO)}</button>
<button class="ib" id="zFind" aria-label="Cari di buku">${ic(SRCH)}</button>
<button class="ib" id="zList" aria-label="Catatanku">${ic("M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01")}</button>
<button class="ib zdk" id="zZo" aria-label="Perkecil">${ic("M5 12h14")}</button><button class="ib zdk" id="zZi" aria-label="Perbesar">${ic("M5 12h14M12 5v14")}</button>
<button class="ib" id="zMore" aria-label="Menu lainnya" aria-haspopup="true"><svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.7" fill="#33291F" stroke="none"/><circle cx="12" cy="12" r="1.7" fill="#33291F" stroke="none"/><circle cx="19" cy="12" r="1.7" fill="#33291F" stroke="none"/></svg></button></div>
<div class="zq" id="zQ" hidden><label class="search"><input id="zQi" type="search" placeholder="Cari di buku ini (mis. sholat)" dir="auto"></label><small id="zQc"></small>
<button class="ib" id="zQp" aria-label="Sebelumnya">${ic("M5 15l7-7 7 7")}</button><button class="ib" id="zQn" aria-label="Berikutnya">${ic("M5 9l7 7 7-7")}</button></div>
<div class="rtrack"><i id="zF"></i></div>
<div class="zbody"><div class="rview" id="zV"><div id="zS"></div><div class="rmsg" id="zM"><p id="zMt">Memuat buku…</p></div></div>
<div class="zdock"><div class="zrow" id="zTools"></div><div class="zrow" id="zCtx"></div></div>
<div class="rfoot"><button class="zedit" id="zEd" aria-label="Mode edit"><svg viewBox="0 0 24 24"><path d="${PEN}"/></svg><span>Edit</span></button>
<div class="zpgr"><button class="ib" id="zPv" aria-label="Sebelumnya">${ic("M15 5l-7 7 7 7")}</button><div class="rpg">Hal. <input id="zGo" type="number" min="1" inputmode="numeric"><span id="zOf"></span></div><button class="ib" id="zNx" aria-label="Berikutnya">${ic("M9 5l7 7-7 7")}</button></div></div>
<div id="zBd"></div></div>
<div class="zmn" id="zMn" hidden>
<button id="zMFind">${ic(SRCH)}<span>Cari di buku</span></button>
<button id="zFit">${ic("M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4")}<span>Lebar halaman penuh</span></button>
<button id="zIm">${ic("M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5")}<span>Mode fokus (sembunyikan menu)</span></button>
<button id="zZo2" class="zmo">${ic("M5 12h14")}<span>Perkecil</span></button><button id="zZi2" class="zmo">${ic("M5 12h14M12 5v14")}<span>Perbesar</span></button>
<button id="zPct">${ic("M4 12a8 8 0 1 0 3-6.2M4 4v5h5")}<span>Atur ulang zoom · 100%</span></button>
<a id="zOpen" target="_blank" rel="noopener">${ic("M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5")}<span>Buka PDF asli</span></a></div>
<div class="zsh" id="zSh" hidden></div>`;
document.body.append(R);
const V=$("#zV"),stage=$("#zS");

function dock(){const T=$("#zTools"),C=$("#zCtx");T.replaceChildren();C.replaceChildren();
 TOOLS.forEach(([k,i,l])=>{const b=el("button","zt"+(S.t===k?" on":""));b.append(el("b","",i),el("span","",l));b.setAttribute("aria-label",l);b.title=HINT[k];b.onclick=()=>setT(k);T.append(b)});
 if(S.t==="stk")STK.forEach(e=>{const b=el("button","zk"+(S.sk===e?" on":""),e);b.onclick=()=>{S.sk=e;dock()};C.append(b)});
 else if(["hl","ul","pen","line","note"].includes(S.t)){if(S.t==="pen"||S.t==="line")PWS.forEach((v,i)=>{const b=el("button","zw"+(S.pw===v?" on":"")),d=el("i");d.style.height=(2+i*3)+"px";b.append(d);b.setAttribute("aria-label","Ketebalan");b.onclick=()=>{S.pw=v;dock()};C.append(b)});COL.forEach(c=>{const b=el("button","zs"+(S.c===c?" on":""));b.style.background=c;b.setAttribute("aria-label","Warna");b.onclick=()=>{S.c=c;dock()};C.append(b)})}
 C.hidden=!C.children.length;sync()}
function sync(){const ed=S.t!=="baca";R.classList.toggle("ed",ed);$("#zUn").disabled=!S.hist.length;$("#zRe").disabled=!S.redo.length;const b=$("#zEd");b.classList.toggle("on",ed);b.querySelector("span").textContent=ed?"Selesai":"Edit"}
function setT(k){if(S.ed)closeEd("save");S.t=k;if(k!=="baca"){S.last=k;R.classList.remove("im")}R.dataset.t=k;$("#zMn").hidden=true;dock();try{getSelection().removeAllRanges()}catch(e){}if(HINT[k])A.toast(HINT[k])}
const saveA=()=>SV("ann:"+S.b.id,S.ann);
function rec(h){S.hist.push(h);if(S.hist.length>300)S.hist.shift();S.redo.length=0;sync()}
function add(o,p){p=p||S.n;(S.ann[p]=S.ann[p]||[]).push(o);rec({t:"add",p,o});saveA();draw()}
function rm(o,p){p=p||S.n;const L=S.ann[p]||[],i=L.indexOf(o);if(i<0)return;L.splice(i,1);rec({t:"del",p,o,i});saveA();draw()}
function step(h,back){const L=S.ann[h.p]=S.ann[h.p]||[];
 if(h.t==="add"){if(back){const i=L.indexOf(h.o);if(i>-1)L.splice(i,1)}else L.push(h.o)}
 else if(h.t==="del"){if(back)L.splice(Math.min(h.i,L.length),0,h.o);else{const i=L.indexOf(h.o);if(i>-1)L.splice(i,1)}}
 else Object.assign(h.o,back?h.a:h.b)}
function undo(redo){if(S.ed)closeEd("save");const h=(redo?S.redo:S.hist).pop();if(!h)return A.toast(redo?"Tidak ada yang bisa diulang":"Tidak ada yang bisa diurungkan");
 step(h,!redo);(redo?S.hist:S.redo).push(h);saveA();sync();if(h.p!==S.n)show(h.p);else draw();A.toast((redo?"Diulang":"Diurungkan")+" · hal. "+h.p)}

const pd=(p,w,h)=>{if(p.length<3)return"M"+p.map(q=>q[0]*w+" "+q[1]*h).join("L");let d="M"+p[0][0]*w+" "+p[0][1]*h;for(let i=1;i<p.length-1;i++)d+="Q"+p[i][0]*w+" "+p[i][1]*h+" "+(p[i][0]+p[i+1][0])/2*w+" "+(p[i][1]+p[i+1][1])/2*h;const l=p[p.length-1];return d+"L"+l[0]*w+" "+l[1]*h};
function drag(e,o,n){if(S.t==="erase"||S.t==="pen"||S.t==="line")return;const r=S.W.it.getBoundingClientRect();let mv=0;const x0=o.x,y0=o.y;try{n.setPointerCapture(e.pointerId)}catch(x){}
 const m=ev=>{mv=1;o.x=Math.max(0,Math.min(1,(ev.clientX-r.left)/r.width));o.y=Math.max(0,Math.min(1,(ev.clientY-r.top)/r.height));n.style.left=o.x*r.width+"px";n.style.top=o.y*r.height+"px"},
 u=()=>{n.removeEventListener("pointermove",m);n.removeEventListener("pointerup",u);n.removeEventListener("pointercancel",u);if(mv){rec({t:"mod",p:S.n,o,a:{x:x0,y:y0},b:{x:o.x,y:o.y}});saveA();n._m=1}};
 n.addEventListener("pointermove",m);n.addEventListener("pointerup",u);n.addEventListener("pointercancel",u)}
function draw(){const W=S.W;if(!W)return;const w=W.vp.width,h=W.vp.height,O=S.ann[S.n]||[];W.hl.replaceChildren();W.an.replaceChildren();W.it.replaceChildren();
 O.forEach(o=>{const del=()=>rm(o),er=e=>{e.onclick=()=>{if(S.t==="erase")del()};return e};
  if(o.k==="hl")o.r.forEach(r=>W.hl.append(er(svg("rect",{x:r[0]*w-1,y:(r[1]+r[3]*.08)*h,width:r[2]*w+2,height:r[3]*h*.84,rx:3,fill:o.c}))));
  else if(o.k==="ul")o.r.forEach(r=>W.an.append(er(svg("rect",{x:r[0]*w,y:(r[1]+r[3])*h-1.5,width:r[2]*w,height:2.4,rx:1,fill:o.c}))));
  else if(o.k==="pen"){const a={d:pd(o.p,w,h),fill:"none","stroke-linecap":"round","stroke-linejoin":"round"};
   W.an.append(er(svg("path",{...a,stroke:o.c,"stroke-width":o.w*w})),er(svg("path",{...a,stroke:"transparent","stroke-width":Math.max(16,o.w*w)})))}
  else if(o.k==="note"){const n=el("button","zn","✎");n.style.left=o.x*w+"px";n.style.top=o.y*h+"px";n.style.background=o.c;n.title=o.t;n.onpointerdown=e=>drag(e,o,n);n.onclick=()=>{if(n._m){n._m=0;return}S.t==="erase"?del():noteEd(o,false)};W.it.append(n)}
  else if(o.k==="stk"){const s=el("span","zk2",o.e);s.style.cssText=`left:${o.x*w}px;top:${o.y*h}px;font-size:${w*.075}px`;s.onpointerdown=e=>drag(e,o,s);s.onclick=()=>{if(s._m){s._m=0;return}if(S.t==="erase")del()};W.it.append(s)}});
 if(S.ed&&S.ed.isNew&&S.ed.p===S.n){const n=el("span","zn","✎");n.style.cssText=`left:${S.ed.o.x*w}px;top:${S.ed.o.y*h}px;background:${S.ed.o.c};opacity:.9;outline:2px dashed rgba(51,41,31,.45);pointer-events:none`;W.it.append(n)}}

function noteEd(o,isNew){if(S.ed)closeEd("save");const sh=$("#zSh"),ta=el("textarea"),row=el("div","act");
 S.ed={o,isNew,p:S.n,ta};sh.className="zsh ne";sh.hidden=false;sh.replaceChildren();ta.value=o.t||"";ta.placeholder="Tulis catatan atau komentar…";ta.dir="auto";
 const ok=el("button","btn","Simpan"),dl=el("button","btn g",isNew?"Batal":"Hapus");ok.onclick=()=>closeEd("save");dl.onclick=()=>closeEd(isNew?"cancel":"del");
 row.append(dl,ok);sh.append(el("b","","Catatan · hal. "+S.n),ta,row);draw();
 if(isNew||!o.t)setTimeout(()=>{if(S.ed&&S.ed.ta===ta)try{ta.focus({preventScroll:true})}catch(e){ta.focus()}},90)}
function closeEd(m){const E=S.ed;if(!E)return;S.ed=null;const sh=$("#zSh");sh.hidden=true;sh.className="zsh";try{E.ta.blur()}catch(e){}
 const t=E.ta.value.trim(),o=E.o;
 if(m==="save"){
  if(E.isNew){if(t){o.t=t;add(o,E.p);return}}
  else if(!t){rm(o,E.p);return}
  else if(t!==o.t){const a={t:o.t};o.t=t;rec({t:"mod",p:E.p,o,a,b:{t}});saveA()}}
 else if(m==="del"){rm(o,E.p);return}
 draw()}
function tapAt(t){const sh=$("#zSh");if(!sh.hidden){if(S.ed)closeEd("save");else sh.hidden=true;return}
 if(S.t==="note")noteEd({k:"note",x:t.x,y:t.y,c:S.c,t:""},true);else add({k:"stk",x:t.x,y:t.y,e:S.sk})}

function bind(W){const cap=W.cap;let pts=null,pv=null,tap=null;const P=e=>{const r=cap.getBoundingClientRect();return[(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height]};
 cap.onpointerdown=e=>{const[x,y]=P(e);
  if(S.t==="pen"||S.t==="line"){pts=[[x,y]];pv=svg("path",{fill:"none",stroke:S.c,"stroke-width":S.pw*W.vp.width,"stroke-linecap":"round","stroke-linejoin":"round"});W.an.append(pv);cap.setPointerCapture(e.pointerId)}
  else if(S.t==="note"||S.t==="stk")tap=e.isPrimary?{x,y,cx:e.clientX,cy:e.clientY,t:Date.now()}:null};
 cap.onpointermove=e=>{if(tap&&Math.hypot(e.clientX-tap.cx,e.clientY-tap.cy)>9)tap=null;if(!pts)return;const p=P(e),l=pts[pts.length-1];if(S.t==="line")pts[1]=p;else if(Math.hypot(p[0]-l[0],p[1]-l[1])>.0015)pts.push(p);pv.setAttribute("d",pd(pts,W.vp.width,W.vp.height))};
 const fin=()=>{if(!pts)return;if(pts.length>1)add({k:"pen",c:S.c,w:S.pw,p:pts});else pv.remove();pts=null};
 cap.onpointerup=e=>{if(tap){const t=tap;tap=null;if(Date.now()-t.t<700)tapAt(t)}fin()};
 cap.onpointercancel=()=>{tap=null;fin()}}

function applySel(){if(S.t!=="hl"&&S.t!=="ul")return;const sl=getSelection(),W=S.W;if(!sl||sl.isCollapsed||!W||!sl.rangeCount)return;
 const rg=sl.getRangeAt(0);if(!W.tl.contains(rg.commonAncestorContainer))return;const r0=W.w.getBoundingClientRect(),rs=[];
 for(const r of rg.getClientRects()){if(r.width<2||r.height>r0.height*.08)continue;rs.push([(r.left-r0.left)/r0.width,(r.top-r0.top)/r0.height,r.width/r0.width,r.height/r0.height])}
 sl.removeAllRanges();if(rs.length)add({k:S.t,c:S.c,r:rs})}
document.addEventListener("pointerup",e=>{if(S.open&&e.pointerType!=="touch")setTimeout(applySel,15)});
let sct;document.addEventListener("selectionchange",()=>{if(!S.open||(S.t!=="hl"&&S.t!=="ul"))return;clearTimeout(sct);sct=setTimeout(()=>{if(!matchMedia("(pointer:fine)").matches)applySel()},800)});

function markHits(){const W=S.W;if(!W||!S.rx)return;W.tl.querySelectorAll("span").forEach(sp=>{const t=N(sp.textContent);if(S.rx.some(r=>{r.lastIndex=0;return r.test(t)}))sp.classList.add("hit")})}

async function show(num,keep,foc){const d=S.doc;if(!d)return;num=Math.max(1,Math.min(d.numPages,num));S.n=num;const tok=++S.tok;
 $("#zGo").value=num;$("#zPv").disabled=num<=1;$("#zNx").disabled=num>=d.numPages;$("#zF").style.width=num/d.numPages*100+"%";$("#zBd").textContent=num+" / "+d.numPages;A.setProg(S.b,num);if(!keep){if(S.ed)closeEd("save");$("#zSh").hidden=true}
 try{const pg=await d.getPage(num);if(tok!==S.tok)return;
  const v0=pg.getViewport({scale:1}),aw=V.clientWidth-16,ah=V.clientHeight-16,sc=S.fit==="width"?aw/v0.width:Math.min(aw/v0.width,ah/v0.height),vp=pg.getViewport({scale:Math.max(.2,sc)*S.z});S.vw=V.clientWidth;S.vh=V.clientHeight;
  let dpr=Math.min(devicePixelRatio||1,2);while(vp.width*vp.height*dpr*dpr>9e6&&dpr>1)dpr-=.25;
  const w=el("div","zg"),c=el("canvas"),tl=el("div","zl"),an=svg("svg",{viewBox:`0 0 ${vp.width} ${vp.height}`,class:"za"}),hl=svg("svg",{viewBox:`0 0 ${vp.width} ${vp.height}`,class:"zh"}),it=el("div","zi"),cap=el("div","zc");
  w.style.width=vp.width+"px";w.style.height=vp.height+"px";c.width=Math.floor(vp.width*dpr);c.height=Math.floor(vp.height*dpr);c.style.width=vp.width+"px";c.style.height=vp.height+"px";
  tl.style.setProperty("--scale-factor",vp.scale);w.append(c,hl,tl,an,cap,it);
  if(S.task){try{S.task.cancel()}catch(e){}}
  const task=pg.render({canvasContext:c.getContext("2d"),viewport:vp,transform:dpr!==1?[dpr,0,0,dpr,0,0]:null});S.task=task;await task.promise;if(tok!==S.tok)return;
  stage.style.transition="none";stage.style.transform="";S.rz=S.z;stage.replaceChildren(w);if(!keep)V.scrollTo(0,0);
  if(foc){const r2=stage.getBoundingClientRect();V.scrollLeft+=r2.left+foc.fx*r2.width-foc.cx;V.scrollTop+=r2.top+foc.fy*r2.height-foc.cy}
  setPct(S.z);const W=S.W={w,vp,tl,an,hl,it,cap};bind(W);draw();
  try{await pdfjsLib.renderTextLayer({textContentSource:pg.streamTextContent(),container:tl,viewport:vp,textDivs:[]}).promise;if(tok===S.tok)markHits()}catch(e){}
  if(num<d.numPages)d.getPage(num+1).catch(()=>{})}catch(e){}}
const setPct=z=>{$("#zPct span").textContent="Atur ulang zoom · "+Math.round(z*100)+"%"},fitLbl=()=>{$("#zFit span").textContent=S.fit==="width"?"Pas satu halaman":"Lebar halaman penuh"};
const turn=d=>S.doc&&show(S.n+d);
let zt,fo=null;
function zoomTo(nz,cx,cy,anim){nz=Math.max(1,Math.min(5,nz));if(!S.doc||Math.abs(nz-S.z)<.005)return;
 if(!fo){const r=stage.getBoundingClientRect();fo={fx:(cx-r.left)/r.width,fy:(cy-r.top)/r.height,cx,cy}}
 S.z=nz;stage.style.transformOrigin=fo.fx*100+"% "+fo.fy*100+"%";stage.style.transition=anim?"transform .26s cubic-bezier(.22,.8,.2,1)":"none";stage.style.transform="scale("+nz/S.rz+")";
 V.classList.toggle("z",nz>1);setPct(nz);clearTimeout(zt);zt=setTimeout(()=>{const f=fo;fo=null;show(S.n,true,f)},anim?280:170)}
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
 if(S.open)return;S.open=1;S.b=b;S.z=1;S.doc=null;S.n=start||A.prog(b)||1;S.ann=LS("ann:"+b.id,{});S.rx=null;S.hits=[];S.hi=-1;S.t="baca";R.dataset.t="baca";V.classList.remove("z");S.hist=[];S.redo=[];S.ed=null;R.classList.remove("ed","im");$("#zSh").hidden=true;$("#zMn").hidden=true;fitLbl();setPct(1);
 $("#zT").textContent=b.t;$("#zA").textContent=b.a;$("#zOpen").href=A.url(b);$("#zMt").textContent="Memuat buku…";$("#zM").classList.remove("hide");stage.replaceChildren();$("#zQ").hidden=true;$("#zQi").value="";$("#zQc").textContent="";
 $("#zGo").value=S.n;$("#zOf").textContent="/ "+(b.pg||"…");$("#zPv").disabled=$("#zNx").disabled=true;$("#zF").style.width="0";dock();
 R.classList.add("on");requestAnimationFrame(()=>R.classList.add("vis"));document.documentElement.style.overflow="hidden";try{history.pushState({zr:1},"")}catch(e){}
 try{const lib=await A.loadPdfJs(),t=lib.getDocument({url:A.url(b)});S.lt=t;
  t.onProgress=p=>{if(S.open&&!S.doc&&p.total)$("#zMt").textContent="Memuat buku "+Math.min(100,Math.round(p.loaded/p.total*100))+"%"};
  const doc=await t.promise;if(!S.open||S.b!==b){try{doc.destroy()}catch(e){}return}
  S.doc=doc;A.setPages(b,doc.numPages);$("#zGo").max=doc.numPages;$("#zOf").textContent="/ "+doc.numPages;$("#zM").classList.add("hide");
  if(q){$("#zQ").hidden=false;$("#zQi").value=q;await find(q,S.n)}else show(Math.min(S.n,doc.numPages))
 }catch(e){if(S.open&&S.b===b)$("#zMt").textContent="PDF tidak bisa dimuat. Pastikan file ada di folder buku dan situs dibuka lewat Vercel."}}
function close(fromPop){if(!S.open)return;if(S.ed)closeEd("save");S.open=0;S.tok++;$("#zMn").hidden=true;if(S.task){try{S.task.cancel()}catch(e){}}
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
$("#zFind").onclick=()=>{R.classList.remove("im");$("#zMn").hidden=true;const q=$("#zQ");q.hidden=!q.hidden;if(!q.hidden)$("#zQi").focus();else{S.rx=null;show(S.n,true)}};

/* ===== Daftar catatan & tanda ===== */
$("#zList").onclick=()=>{if(S.ed)closeEd("save");$("#zMn").hidden=true;const sh=$("#zSh"),P=Object.keys(S.ann).map(Number).filter(p=>(S.ann[p]||[]).length).sort((a,b)=>a-b);
 sh.className="zsh";sh.hidden=false;sh.replaceChildren(el("b","","Catatan & tanda saya"));
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
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="z"){e.preventDefault();undo(e.shiftKey);return}
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="y"){e.preventDefault();undo(1);return}
 if(e.key==="ArrowRight"||e.key==="PageDown"){e.preventDefault();turn(1)}else if(e.key==="ArrowLeft"||e.key==="PageUp"){e.preventDefault();turn(-1)}
 else if(e.key==="+"||e.key==="="){zoom(1)}else if(e.key==="-"){zoom(-1)}},true);
let sx=null,sy=0,tapT=0,imHint=0;
function toggleIm(){R.classList.toggle("im");$("#zMn").hidden=true;if(R.classList.contains("im")&&!imHint){imHint=1;A.toast("Ketuk halaman sekali untuk menampilkan menu")}}
V.addEventListener("pointerdown",e=>{sx=e.clientX;sy=e.clientY});V.addEventListener("pointercancel",()=>sx=null);
V.addEventListener("pointerup",e=>{if(sx==null)return;const dx=e.clientX-sx,dy=e.clientY-sy;sx=null;if(S.pg)return;
 if(S.t==="baca"&&S.z<1.02&&Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.8)return turn(dx<0?1:-1);
 if(e.pointerType!=="touch"||S.t!=="baca"||Math.abs(dx)>10||Math.abs(dy)>10||e.target.closest(".zn,.zk2"))return;
 const sl=getSelection();if(sl&&!sl.isCollapsed)return;
 if(S.ed){closeEd("save");return}
 const sh=$("#zSh");if(!sh.hidden){sh.hidden=true;return}
 const n=Date.now();clearTimeout(tapT);if(n-lt<320){zoomTo(S.z>1.05?1:2.2,e.clientX,e.clientY,true);lt=0}else{lt=n;tapT=setTimeout(toggleIm,330)}});

/* Render ulang hanya jika ukuran area baca benar-benar berubah (bukan karena keyboard muncul) */
let rzt;const typing=()=>{const a=document.activeElement;return a&&/TEXTAREA|INPUT/.test(a.tagName)&&R.contains(a)};
if(window.ResizeObserver)new ResizeObserver(()=>{if(!S.open||!S.doc)return;clearTimeout(rzt);rzt=setTimeout(()=>{if(typing())return;if(Math.abs(V.clientWidth-S.vw)<3&&Math.abs(V.clientHeight-S.vh)<3)return;show(S.n,true)},200)}).observe(V);
/* Saat mengetik, tinggi pembaca mengikuti area yang tidak tertutup keyboard agar kolom catatan tetap terlihat */
const vv=window.visualViewport;
function fitVV(){const a=document.activeElement,on=vv&&a&&a.tagName==="TEXTAREA"&&R.contains(a);
 if(on){R.style.bottom="auto";R.style.height=vv.height+"px";R.style.top=vv.offsetTop+"px"}else{R.style.bottom=R.style.height=R.style.top=""}}
if(vv){vv.addEventListener("resize",fitVV);vv.addEventListener("scroll",fitVV)}
R.addEventListener("focusin",fitVV);R.addEventListener("focusout",()=>setTimeout(fitVV,60));

/* ===== Menu, edit, urungkan ===== */
const mn=$("#zMn");
$("#zMore").onclick=()=>{mn.hidden=!mn.hidden};
document.addEventListener("pointerdown",e=>{if(!mn.hidden&&!mn.contains(e.target)&&!e.target.closest("#zMore"))mn.hidden=true},true);
mn.addEventListener("click",e=>{if(e.target.closest("button,a"))mn.hidden=true});
$("#zMFind").onclick=()=>$("#zFind").click();
$("#zZo2").onclick=()=>zoom(-1);$("#zZi2").onclick=()=>zoom(1);$("#zIm").onclick=toggleIm;
$("#zFit").onclick=()=>{S.fit=S.fit==="width"?"page":"width";SV("fit",S.fit);fitLbl();S.z=1;V.classList.remove("z");show(S.n)};
$("#zEd").onclick=()=>setT(S.t==="baca"?(S.last||"hl"):"baca");
$("#zUn").onclick=()=>undo(0);$("#zRe").onclick=()=>undo(1);

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
