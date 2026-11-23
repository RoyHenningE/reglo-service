/* Servicerapport Lift-Man Fold – Reglo AS (bygget på Årskontroll Wall-Man) */
'use strict';
const CFG = window.LMF_CONFIG || {};
const REV = 'RevC 19.11.2026';
const TITLE = 'Servicerapport – LIFTMAN FOLD';

/* ---------- innhold ---------- */
const SECTIONS = [
  {nr:'1',part:1,title:'Mottak og inspeksjon',items:[
    ['1.1','Mottatt liften (dato)'],
    ['1.2','Kontroller om liften kom på pall – hvis nei, lag ny pall og noter for fakturering'],
    ['1.3','Fjern emballasje'],
    ['1.4','Ta bilder av liften uten emballasje'],
    ['1.5','Liften må testes med luft, at alle funksjoner er i orden'],
    ['1.6','Demonter deksel under kurven og deksel bak på tårn'],
    ['1.7','Vask liften grundig med såpe og høytrykk']]},
  {nr:'2',part:1,title:'Demontering, rengjøring og kontroll',items:[
    ['2.1','Noter alle deler som er skadet eller må byttes'],
    ['2.2','Kontroller kurven for rust (under og rundt)'],
    ['2.3','Kontroller tårn og hengslefester for rust'],
    ['2.4','Kontroller bunn og støtteben for rust'],
    ['2.5','Avvente godkjenning før man starter'],
    ['2.6','Kontroller bremsearmer']]},
  {nr:'3',part:1,title:'Avslutning og rapportering',items:[
    ['3.1','Utfør full kontroll og tetthetstest, og noter resultatet på sjekklisten'],
    ['3.2','Gi beskjed til Lageret når liften er klar for pakking og forsendelse']]},
  {nr:'4',part:1,title:'Rapporter Innkjøp',items:[
    ['4.1','Gi beskjed til Innkjøp når rapporten er ferdig slik at den kan sendes til kunden']]},
  {nr:'5',part:2,title:'Sjekkliste årlig kontroll',items:[
    ['5.1','Virker hurtigavlufter?'],
    ['5.2','Virker kjedeslakkventil?'],
    ['5.3','Virker kjedebruddsventil?'],
    ['5.4','Klaring mellom bunnplate og flatt bak på kurv 15 mm?'],
    ['5.5','Virker endedemper på løftesylinder på topp/bunn?'],
    ['5.6','Hastighet opp'],
    ['5.7','Er brems justert riktig?'],
    ['5.8','Virker horn (fløyte)?'],
    ['5.9','Virker løft bare når tårn er helt oppe eller nede?'],
    ['5.10','Er kjørerampe montert?'],
    ['5.11','Er jordledning mot gulv montert?'],
    ['5.12','Virker nødsenkventil?'],
    ['5.13','Prøvet at kurv ikke synker'],
    ['5.14','Er støttebein smurt med grease?'],
    ['5.15','Er sving på støttebein smurt med grease?'],
    ['5.16','Blir øye for støttebein grønn når alle bein er nede?'],
    ['5.17','Virker støtdemper bak på kurv som den skal?'],
    ['5.18','Er alle bevegelige deler sprayet med teflonsmøring?'],
    ['5.19','Er det satt på plastpakning på verktøykasse, bakdeksel og kasse rundt løfteventil?'],
    ['5.20','Er tårnet smurt med teflonspray?'],
    ['5.21','Stramme skruer på dørhengsel'],
    ['5.22','Kontroller alle skruer, etterstram ved behov og merk dem']]}
].map(s=>({...s,items:s.items.map(([nr,text])=>({nr,text}))}));

// Deler som skal byttes ved service. stk=null betyr at antallet fylles ut.
const PARTS = [
  {vn:'AM012646',txt:'Gassdemper GZ10 400N',stk:'1'},
  {vn:'AM012456',txt:'Gassdemper GZ10 1200N',stk:'1'},
  {vn:'AM011485',txt:'Mek. akt. ventil 3/2 aluminium',stk:'4'},
  {vn:'AM010110',txt:'Ventil 3/2 G1/8',stk:'2'},
  {vn:'AM011061',txt:'Hjul LM (antistatisk) ISP 200x50',stk:null},
  {vn:'AM013587',txt:'Forhjul LM Antist. Ø180 (fra s/n 2003)',stk:null}
];

/* ---------- helpers ---------- */
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const today=()=>{const d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
const fmtDate=v=>{const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(v||'');return m?`${m[3]}.${m[2]}.${m[1]}`:(v||'')};
const newId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const clone=o=>JSON.parse(JSON.stringify(o));
let toastT;function toast(msg){const t=$('#toast');t.textContent=msg;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,3200)}
const ls={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}};

/* ---------- records (lagret på enheten) ---------- */
const REC_KEY='lmf-service-records-v1',CUR_KEY='lmf-service-current-v1',AFTER_KEY='lmf-after-login';
const blankExtra=()=>({vn:'',txt:'',stk:'',byttet:false});
function blank(){return{id:newId(),createdAt:new Date().toISOString(),
  meta:{dato:today(),kunde:'',ordrenr:'',modell:'Lift-Man Fold',serienr:'',prodar:'',mottatt:''},
  items:{},parts:{},extra:[blankExtra(),blankExtra()],kommentarInnkjop:'',notater:'',
  sjekklisteAv:'',sjekklisteDato:'',kontrollertAv:'',kontrollertDato:'',utfortAv:'',signDato:today(),signatur:'',firma:'Reglo AS'}}
let records=ls.get(REC_KEY,{});
let state=records[ls.get(CUR_KEY,'')]?Object.assign(blank(),clone(records[ls.get(CUR_KEY,'')])):blank();
const hasContent=s=>!!(s.meta.kunde||s.meta.serienr||s.meta.ordrenr||Object.keys(s.items).length||s.signatur);
function persistRecords(){if(!ls.set(REC_KEY,records))toast('Lagringsplassen på telefonen er full. Slett gamle rapporter under «Lagrede».')}
let saveT;
function saveState(){clearTimeout(saveT);saveT=setTimeout(saveNow,350)}
function saveNow(){clearTimeout(saveT);if(!hasContent(state))return;state.updatedAt=new Date().toISOString();records[state.id]=clone(state);persistRecords();ls.set(CUR_KEY,state.id);updateCount();if(!$('#list').hidden)renderList()}
function getPath(p){return p.split('.').reduce((a,k)=>a==null?a:a[k],state)}
function setPath(p,v){const ks=p.split('.');let a=state;for(let i=0;i<ks.length-1;i++){if(a[ks[i]]==null)a[ks[i]]={};a=a[ks[i]]}a[ks[ks.length-1]]=v}
function touched(){if(state.spUrl)state.spStale=true;saveState()}

/* ---------- rendering ---------- */
const PEN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
function field(label,path,type='text',opts={}){
  return `<label class="f${opts.wide?' wide':''}"><span>${label}</span><input id="f-${path.replace(/\./g,'-')}" data-path="${path}" type="${type}" value="${esc(getPath(path))}" ${opts.attrs||''}></label>`}
function itemHTML(it){
  const v=state.items[it.nr]||{};const showC=!!v.c||v.s==='avvik';
  const b=(s,t,c)=>`<button type="button" class="st ${c}" data-s="${s}" aria-pressed="${v.s===s}">${t}</button>`;
  return `<div class="item s-${v.s||'none'}" data-nr="${it.nr}"><span class="nr">${it.nr}</span><span class="lbl">${esc(it.text)}</span>
    <div class="acts">${b('ok','OK','st-ok')}${b('avvik','Avvik','st-avvik')}${b('ia','I/A','st-ia')}<button type="button" class="cbtn${v.c?' has':''}" aria-label="Merknad til ${it.nr}" aria-expanded="${showC}">${PEN}</button></div>
    <textarea class="cmt" id="c-${it.nr.replace('.','_')}" data-comment="${it.nr}" rows="2" placeholder="Merknad / verdi til ${it.nr}" ${showC?'':'hidden'}>${esc(v.c)}</textarea></div>`}
function sectionHTML(sec){
  return `<section class="sec" data-sec="${sec.nr}"><header class="sec-h"><span class="sec-nr">${sec.nr}</span><h2>${sec.title}</h2>
    <span class="sec-count" data-count="${sec.nr}"></span><div class="sec-tools"><button type="button" class="chip allok">Resten OK</button></div></header>
    <div class="sec-body">${sec.items.map(itemHTML).join('')}</div></section>`}
const byttetBtn=(path,on)=>`<button type="button" class="st st-ok" data-toggle="${path}" aria-pressed="${!!on}">Byttet</button>`;
function partsHTML(){
  return `<div class="prt prt-head"><span>Varenummer</span><span>Beskrivelse</span><span class="qty">Stk</span><span></span></div>`+
    PARTS.map(p=>{const v=state.parts[p.vn]||{};
      const qty=p.stk==null?`<input class="qty" type="text" inputmode="numeric" data-path="parts.${p.vn}.stk" value="${esc(v.stk)}" placeholder="Ant." aria-label="Antall ${p.vn}">`:`<span class="qty">${p.stk}</span>`;
      return `<div class="prt${v.byttet?' done':''}" data-prt="${p.vn}"><span class="vn">${p.vn}</span><span>${esc(p.txt)}</span>${qty}${byttetBtn('parts.'+p.vn+'.byttet',v.byttet)}</div>`}).join('')}
function extraHTML(){
  return `<div class="prt prt-x prt-head"><span>Varenummer</span><span>Beskrivelse</span><span class="qty">Stk</span><span></span><span></span></div>`+
    state.extra.map((x,i)=>`<div class="prt prt-x${x.byttet?' done':''}" data-x="${i}">
      <input class="i-vn" type="text" data-path="extra.${i}.vn" value="${esc(x.vn)}" placeholder="Varenummer" aria-label="Varenummer, rad ${i+1}">
      <input class="i-txt" type="text" data-path="extra.${i}.txt" value="${esc(x.txt)}" placeholder="Beskrivelse" aria-label="Beskrivelse, rad ${i+1}">
      <input class="qty" type="text" inputmode="numeric" data-path="extra.${i}.stk" value="${esc(x.stk)}" placeholder="Stk" aria-label="Antall, rad ${i+1}">
      <span class="bx">${byttetBtn('extra.'+i+'.byttet',x.byttet)}</span>
      <button type="button" class="rm" data-rm="${i}" aria-label="Fjern rad ${i+1}">×</button></div>`).join('')+
    `<div class="endacts" style="justify-content:flex-start;margin-top:10px"><button class="btn small" type="button" id="addExtra">+ Legg til del</button></div>`}
function renderForm(){
  $('#form').innerHTML=`
  <div class="card"><div class="grid">
    ${field('Dato','meta.dato','date')}${field('Kunde','meta.kunde')}
    ${field('Ordrenr.','meta.ordrenr')}${field('Modell','meta.modell')}
    ${field('Serienummer','meta.serienr')}${field('Produksjonsår','meta.prodar','text',{attrs:'inputmode="numeric"'})}
    ${field('Mottatt dato','meta.mottatt','date')}
  </div></div>
  <h2 class="part-h">Del 1 – Sjekkliste service</h2>
  ${SECTIONS.filter(s=>s.part===1).map(sectionHTML).join('')}
  <section class="sec"><header class="sec-h"><h2>Kommentar til Innkjøp</h2></header>
    <label class="f"><textarea id="f-kommentarInnkjop" data-path="kommentarInnkjop" rows="4" placeholder="Skader, deler som må bestilles, ekstra arbeid …">${esc(state.kommentarInnkjop)}</textarea></label>
    <div class="grid" style="margin-top:12px">${field('Sjekkliste utført av','sjekklisteAv')}${field('Dato','sjekklisteDato','date')}</div></section>
  <h2 class="part-h">Del 2 – Årlig kontroll</h2>
  <section class="sec"><header class="sec-h"><h2>Deler som skal byttes ved service</h2><span class="sec-count" id="partsCount"></span></header>
    <div id="parts">${partsHTML()}</div></section>
  <section class="sec"><header class="sec-h"><h2>Andre deler som er byttet <span class="sec-count">(fylles ut ved behov)</span></h2></header>
    <div id="extra">${extraHTML()}</div></section>
  <section class="sec"><header class="sec-h"><h2>Notater</h2></header>
    <label class="f"><textarea id="f-notater" data-path="notater" rows="4">${esc(state.notater)}</textarea></label></section>
  ${SECTIONS.filter(s=>s.part===2).map(sectionHTML).join('')}
  <div class="grid" style="margin-top:12px">${field('Kontrollert av','kontrollertAv')}${field('Dato','kontrollertDato','date')}</div>
  <section class="sec"><header class="sec-h"><h2>Signatur</h2></header>
    <div class="concl">
      <div class="avvlist" id="avvList" hidden></div>
      <div class="grid">${field('Rapporten er utført av','utfortAv')}${field('Dato','signDato','date')}${field('Firma','firma')}</div>
      <div><span class="lbl-s">Signatur</span><div class="sigbox"><canvas id="sig" aria-label="Signaturfelt"></canvas><div class="sigline"></div><span class="sigl">Signer med fingeren</span><button type="button" class="chip sigclr" id="sigClear">Tøm</button></div></div>
    </div>
    <div class="endacts"><button class="btn" type="button" data-act="pdf">Del / lagre PDF</button><button class="btn primary" type="button" data-act="sp">Last opp til SharePoint</button></div>
    <p class="note" id="spNote"></p>
    <div class="mailbox" id="mailBox" hidden></div>
  </section>`;
  initSignature();updateProgress();renderSpNote();renderMailBox(false);
}
function updateItem(nr){
  const el=$(`.item[data-nr="${nr}"]`);if(!el)return;const v=state.items[nr]||{};
  el.className='item s-'+(v.s||'none');
  el.querySelectorAll('.st').forEach(b=>b.setAttribute('aria-pressed',String(v.s===b.dataset.s)));
  const ta=el.querySelector('.cmt'),cb=el.querySelector('.cbtn');
  if(v.s==='avvik'&&ta.hidden){ta.hidden=false;cb.setAttribute('aria-expanded','true')}
  cb.classList.toggle('has',!!v.c)}
function stats(s){let tot=0,done=0;const avv=[];
  SECTIONS.forEach(sec=>sec.items.forEach(it=>{tot++;const v=s.items[it.nr];if(v&&v.s){done++;if(v.s==='avvik')avv.push(it)}}));return{tot,done,avv}}
function updateProgress(){
  const {tot,done,avv}=stats(state);
  SECTIONS.forEach(sec=>{const c=$(`[data-count="${sec.nr}"]`);if(!c)return;
    c.textContent=`${sec.items.filter(i=>state.items[i.nr]&&state.items[i.nr].s).length}/${sec.items.length}`});
  const pc=$('#partsCount');if(pc)pc.textContent=`${PARTS.filter(p=>(state.parts[p.vn]||{}).byttet).length}/${PARTS.length} byttet`;
  $('#progTxt').textContent=`${done} av ${tot} punkter`;$('#progFill').style.width=(tot?done/tot*100:0)+'%';
  $('#progAvv').textContent=avv.length?`${avv.length} avvik`:'';$('#progAvv').className=avv.length?'avv':'';
  const al=$('#avvList');if(al){al.hidden=!avv.length;al.innerHTML=avv.length?`<b>Avvik:</b> ${avv.map(it=>esc(it.nr+' '+it.text)).join(' · ')}`:''}}

/* ---------- events ---------- */
const form=$('#form');
form.addEventListener('input',e=>{const t=e.target;
  if(t.dataset.path){setPath(t.dataset.path,t.value);
    if(/^meta\.(kunde|dato|serienr)$/.test(t.dataset.path)){spReplaceArm=null;renderSpNote()}}
  else if(t.dataset.comment){const nr=t.dataset.comment;state.items[nr]=Object.assign({},state.items[nr],{c:t.value});t.closest('.item').querySelector('.cbtn').classList.toggle('has',!!t.value)}
  touched()});
form.addEventListener('click',e=>{
  const st=e.target.closest('.st[data-s]');
  if(st){const nr=st.closest('.item').dataset.nr,cur=state.items[nr]||{};state.items[nr]=Object.assign({},cur,{s:cur.s===st.dataset.s?'':st.dataset.s});updateItem(nr);updateProgress();touched();return}
  const tg=e.target.closest('[data-toggle]');
  if(tg){const p=tg.dataset.toggle,nv=!getPath(p);setPath(p,nv);tg.setAttribute('aria-pressed',String(nv));tg.closest('.prt').classList.toggle('done',nv);updateProgress();touched();return}
  const cb=e.target.closest('.cbtn');
  if(cb){const ta=cb.closest('.item').querySelector('.cmt');ta.hidden=!ta.hidden;cb.setAttribute('aria-expanded',String(!ta.hidden));if(!ta.hidden)ta.focus();return}
  const ao=e.target.closest('.allok');
  if(ao){const sec=SECTIONS.find(s=>s.nr===ao.closest('.sec').dataset.sec);let n=0;
    sec.items.forEach(it=>{const v=state.items[it.nr]||{};if(!v.s){state.items[it.nr]=Object.assign({},v,{s:'ok'});updateItem(it.nr);n++}});
    updateProgress();touched();toast(n?`${n} punkter merket OK`:'Alle punkter er allerede utfylt');return}
  if(e.target.id==='addExtra'){state.extra.push(blankExtra());$('#extra').innerHTML=extraHTML();const r=state.extra.length-1;const inp=$(`[data-path="extra.${r}.vn"]`);if(inp)inp.focus();touched();return}
  const rm=e.target.closest('[data-rm]');
  if(rm){state.extra.splice(+rm.dataset.rm,1);if(!state.extra.length)state.extra.push(blankExtra());$('#extra').innerHTML=extraHTML();touched();return}
  if(e.target.id==='sigClear'){state.signatur='';sigRedraw();touched();return}
  const act=e.target.closest('[data-act]');
  if(act){act.dataset.act==='pdf'?sharePdf():uploadCurrent()}
});

/* ---------- signatur ---------- */
let sigRedraw=()=>{};
function initSignature(){
  const cv=$('#sig'),ctx=cv.getContext('2d');
  sigRedraw=()=>{const r=cv.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
    cv.width=Math.round(r.width*dpr);cv.height=Math.round(r.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.lineWidth=2.4;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#111';ctx.fillStyle='#111';
    if(state.signatur){const im=new Image();im.onload=()=>ctx.drawImage(im,0,0,r.width,r.height);im.src=state.signatur}};
  sigRedraw();
  let drawing=false,last=null;
  const pt=e=>{const r=cv.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};
  cv.addEventListener('pointerdown',e=>{drawing=true;try{cv.setPointerCapture(e.pointerId)}catch(_){}last=pt(e);ctx.beginPath();ctx.arc(last.x,last.y,1.2,0,Math.PI*2);ctx.fill();e.preventDefault()});
  cv.addEventListener('pointermove',e=>{if(!drawing)return;const p=pt(e);ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();last=p;e.preventDefault()});
  const end=()=>{if(!drawing)return;drawing=false;state.signatur=cv.toDataURL('image/png');touched()};
  cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',end);
}
let rzT,lastW=window.innerWidth;window.addEventListener('resize',()=>{if(window.innerWidth===lastW)return;lastW=window.innerWidth;clearTimeout(rzT);rzT=setTimeout(()=>sigRedraw(),200)});

/* ---------- faner, ny, liste ---------- */
function showTab(which){const f=which==='form';
  $('#tab-form').setAttribute('aria-selected',String(f));$('#tab-list').setAttribute('aria-selected',String(!f));
  $('#form').hidden=!f;$('#list').hidden=f;$('#progRow').hidden=!f;if(!f)renderList();window.scrollTo(0,0)}
$('#tab-form').textContent='Rapport';
$('#btnNew').textContent='Ny rapport';
$('#tab-form').onclick=()=>showTab('form');$('#tab-list').onclick=()=>{saveNow();showTab('list')};
function openRecord(s){saveNow();state=Object.assign(blank(),clone(s));ls.set(CUR_KEY,state.id);spErr='';spReplaceArm=null;renderForm();showTab('form')}
$('#btnNew').onclick=()=>{saveNow();state=blank();ls.set(CUR_KEY,'');spErr='';spReplaceArm=null;renderForm();showTab('form');toast(Object.keys(records).length?'Ny rapport. Tidligere rapporter ligger under «Lagrede».':'Ny rapport')};
function updateCount(){const n=Object.keys(records).length;$('#savedCount').textContent=n?`(${n})`:''}
function recStatus(r){return r.signatur&&r.utfortAv?['ok','Signert']:['wip','Ikke ferdig']}
let delArm=null;
function renderList(){
  updateCount();
  const q=$('#search').value.trim().toLowerCase();
  const all=Object.values(records).sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')));
  const rs=all.filter(r=>!q||[r.meta.kunde,r.meta.serienr,r.meta.ordrenr,r.meta.modell,r.utfortAv].join(' ').toLowerCase().includes(q));
  const pend=all.filter(r=>r.pending).length;const qn=$('#queueNote');qn.hidden=!pend;qn.textContent=pend?`${pend} rapport${pend>1?'er':''} venter på opplasting til SharePoint. Det skjer automatisk når du har nett og er logget inn.`:'';
  if(!all.length){$('#recs').innerHTML='<p class="empty">Ingen rapporter på denne telefonen ennå. Start en ny under «Rapport».</p>';return}
  if(!rs.length){$('#recs').innerHTML='<p class="empty">Ingen treff.</p>';return}
  $('#recs').innerHTML=rs.map(r=>{const [c,t]=recStatus(r);const m=r.meta;const {avv}=stats(r);
    const sp=(r.pending?'<span class="pill wip">Venter på opplasting</span>':r.spUrl?(r.spStale?'<span class="pill wip">Endret etter opplasting</span>':'<span class="pill ok">I SharePoint</span>'):'')+(r.mailSentTo?'<span class="pill ok">Sendt</span>':'');
    return `<div class="rec" data-id="${esc(r.id)}"><div><h3>${esc(m.kunde||'Uten kundenavn')}</h3>
      <div class="meta">${[m.serienr&&'S/N '+m.serienr,m.ordrenr&&'Ordre '+m.ordrenr,fmtDate(m.dato),r.utfortAv].filter(Boolean).map(esc).join(' · ')}${avv.length?` · <b style="color:var(--warn)">${avv.length} avvik</b>`:''}</div></div>
      <div class="pills"><span class="pill ${c}">${t}</span>${sp}</div>
      <div class="ra"><button class="btn small" data-r="open">Åpne</button><button class="btn small" data-r="copy">Ny rapport for samme lift</button><button class="btn small danger" data-r="del">${delArm===r.id?'Bekreft sletting':'Slett'}</button></div></div>`}).join('');
}
$('#search').addEventListener('input',renderList);
$('#recs').addEventListener('click',e=>{
  const b=e.target.closest('[data-r]');if(!b)return;const id=b.closest('.rec').dataset.id;const r=records[id];if(!r)return;
  if(b.dataset.r==='open'){openRecord(r)}
  else if(b.dataset.r==='copy'){saveNow();const n=blank();n.meta=Object.assign({},r.meta,{dato:today(),ordrenr:'',mottatt:''});n.utfortAv=r.utfortAv||'';state=n;renderForm();showTab('form');toast('Ny rapport med kunde- og liftinfo')}
  else if(b.dataset.r==='del'){
    if(delArm!==id){delArm=id;renderList();setTimeout(()=>{if(delArm===id){delArm=null;renderList()}},4000);return}
    delArm=null;delete records[id];persistRecords();if(state.id===id){state=blank();renderForm()}renderList();toast('Rapport slettet fra telefonen')}
});

/* ---------- PDF ---------- */
let logoJpg=null;
function toJpeg(src,w,h){return new Promise(res=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=w||im.naturalWidth;c.height=h||im.naturalHeight;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);try{res(c.toDataURL('image/jpeg',0.85))}catch(e){res(null)}};im.onerror=()=>res(null);im.src=src})}
const logoReady=toJpeg('data:image/svg+xml;charset=utf-8,'+encodeURIComponent($('#logo').outerHTML),600,235).then(d=>logoJpg=d);
async function buildPdf(s){
  await logoReady;
  const sigJpg=s.signatur?await toJpeg(s.signatur,560,140):null;
  const {jsPDF}=window.jspdf;const doc=new jsPDF({unit:'mm',format:'a4',compress:true});
  const W=210,M=14,m=s.meta,GREY=[107,107,107],LINE=[208,208,208],GREEN=[122,185,41];
  const head=()=>{if(logoJpg)doc.addImage(logoJpg,'JPEG',W-M-40,10,40,40*86.469/220.503);
    doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(...GREY);doc.text(`${TITLE} · ${REV}`,M,14)};
  head();
  doc.setTextColor(17);doc.setFont('helvetica','bold');doc.setFontSize(18);doc.text(TITLE,W/2,34,{align:'center'});
  const info=[['Kunde',m.kunde,'Ordrenr.',m.ordrenr],['Modell',m.modell,'Serienummer',m.serienr],['Produksjonsår',m.prodar,'Mottatt dato',fmtDate(m.mottatt)],['Dato',fmtDate(m.dato),'','']];
  doc.setDrawColor(...LINE);doc.setLineWidth(0.2);doc.line(M,40,W-M,40);
  doc.autoTable({startY:41,body:info,theme:'plain',margin:{left:M,right:M},styles:{font:'helvetica',fontSize:9,cellPadding:{top:1.1,bottom:1.1,left:1,right:1},textColor:17},
    columnStyles:{0:{textColor:GREY,cellWidth:28},1:{cellWidth:63},2:{textColor:GREY,cellWidth:30}}});
  let y=doc.lastAutoTable.finalY+1;doc.line(M,y,W-M,y);y+=9;
  const TOP=31;
  const need=h=>{if(y+h>276){doc.addPage();head();y=TOP}};
  const partHead=t=>{need(16);doc.setFont('helvetica','bold');doc.setFontSize(14);doc.setTextColor(17);doc.text(t,M,y);doc.setDrawColor(...GREEN);doc.setLineWidth(0.8);doc.line(M,y+2,M+22,y+2);doc.setLineWidth(0.2);y+=8};
  const subHead=t=>{need(12);doc.setFont('helvetica','bold');doc.setFontSize(11);doc.setTextColor(17);doc.text(t,M,y);y+=2};
  const tableOpts={theme:'grid',margin:{left:M,right:M,bottom:18,top:TOP},
    styles:{font:'helvetica',fontSize:8.5,cellPadding:1.6,lineColor:LINE,lineWidth:0.15,textColor:17,valign:'middle'},
    headStyles:{fillColor:[255,255,255],textColor:17,fontStyle:'bold',lineColor:[17,17,17]},
    didDrawPage:d=>{if(d.pageNumber>1)head()}};
  const checklist=secs=>{const body=[];
    secs.forEach(sec=>{body.push([{content:`${sec.nr}   ${sec.title}`,colSpan:5,styles:{fontStyle:'bold',fillColor:[245,247,242]}}]);
      sec.items.forEach(it=>{const v=s.items[it.nr]||{};body.push([it.nr,it.text,v.s==='ok'?'X':v.s==='ia'?'I/A':'',v.s==='avvik'?'X':'',v.c||''])})});
    doc.autoTable(Object.assign({},tableOpts,{startY:y,head:[['Nr','Kontrollpunkt','OK','Avvik','Merknad / verdi']],body,
      columnStyles:{0:{cellWidth:11},1:{cellWidth:80},2:{cellWidth:11,halign:'center'},3:{cellWidth:13,halign:'center'},4:{}},
      didParseCell:d=>{if(d.section==='body'&&d.column.index===3&&d.cell.raw==='X'){d.cell.styles.textColor=[194,65,12];d.cell.styles.fontStyle='bold'}
        if(d.section==='body'&&d.column.index===2&&d.cell.raw==='X')d.cell.styles.fontStyle='bold'}}));
    y=doc.lastAutoTable.finalY+7};
  const textBlock=(label,txt)=>{if(!txt)return;doc.setFontSize(9);const l=doc.splitTextToSize(txt,W-2*M);need(8+l.length*4.2);doc.setFont('helvetica','bold');doc.setTextColor(17);doc.text(label,M,y);y+=4.8;doc.setFont('helvetica','normal');doc.text(l,M,y);y+=l.length*4.2+4};
  const kv=(k,v,x,off=52)=>{doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(...GREY);doc.text(k,x,y);doc.setTextColor(17);doc.setFont('helvetica','bold');doc.text(v||'–',x+off,y)};
  const signRow=(k1,v1,d)=>{need(10);kv(k1,v1,M,40);kv('Dato:',fmtDate(d),M+118,12);y+=9};

  partHead('Del 1 – Sjekkliste service');
  checklist(SECTIONS.filter(x=>x.part===1));
  textBlock('Kommentar til Innkjøp',s.kommentarInnkjop);
  signRow('Sjekkliste utført av:',s.sjekklisteAv,s.sjekklisteDato);

  doc.addPage();head();y=TOP;
  partHead('Del 2 – Årlig kontroll');
  subHead('Deler som skal byttes ved service');
  const pBody=PARTS.map(p=>{const v=s.parts[p.vn]||{};return[p.vn,p.txt,p.stk==null?(v.stk||''):p.stk,v.byttet?'X':'']});
  const pOpts={head:[['Varenummer','Beskrivelse','Stk','Byttet']],columnStyles:{0:{cellWidth:28},1:{},2:{cellWidth:16,halign:'center'},3:{cellWidth:18,halign:'center',fontStyle:'bold'}}};
  doc.autoTable(Object.assign({},tableOpts,pOpts,{startY:y+1,body:pBody}));y=doc.lastAutoTable.finalY+8;
  const ex=(s.extra||[]).filter(x=>x.vn||x.txt||x.stk);
  if(ex.length){subHead('Andre deler som er byttet');doc.autoTable(Object.assign({},tableOpts,pOpts,{startY:y+1,body:ex.map(x=>[x.vn,x.txt,x.stk,x.byttet?'X':''])}));y=doc.lastAutoTable.finalY+8}
  textBlock('Notater',s.notater);
  checklist(SECTIONS.filter(x=>x.part===2));
  signRow('Kontrollert av:',s.kontrollertAv,s.kontrollertDato);

  // Signaturblokk – samme utforming som Årskontroll Wall-Man
  need(50);doc.setDrawColor(...LINE);doc.setLineWidth(0.2);doc.line(M,y-2,W-M,y-2);y+=3;
  kv('Rapporten er utført av:',s.utfortAv,M);y+=5.5;kv('Dato:',fmtDate(s.signDato),M);y+=5.5;kv('Firma:',s.firma,M);y+=4;
  if(sigJpg){try{doc.addImage(sigJpg,'JPEG',M+50,y,70,70*140/560)}catch(e){}}
  doc.setDrawColor(...GREY);doc.line(M+50,y+19,M+125,y+19);doc.setFont('helvetica','normal');doc.setTextColor(...GREY);doc.setFontSize(8);doc.text('Signatur',M+50,y+23);
  const pages=doc.getNumberOfPages();
  for(let i=1;i<=pages;i++){doc.setPage(i);doc.setDrawColor(...LINE);doc.setLineWidth(0.2);doc.line(M,284,W-M,284);doc.setFontSize(7);doc.setTextColor(...GREY);doc.setFont('helvetica','normal');
    doc.text('Reglo AS · Halumveien 11, 3158 Andebu, Norway · Tlf. +47 33 43 02 80 · info@reglo.no · www.reglo.no · Org.nr. 983 148 336 MVA',W/2,288,{align:'center'});
    doc.text(`Side ${i} av ${pages}`,W-M,292,{align:'right'})}
  return doc.output('blob');
}
const spName=s=>String(s||'').replace(/["*:<>?\/\\|#%]/g,'').replace(/\s+/g,' ').trim().replace(/\.+$/,'');
const pdfName=s=>`${spName(s.meta.serienr)||'Uten serienr'} Servicerapport ${fmtDate(s.meta.dato||today())}.pdf`;
async function sharePdf(){
  if(!window.jspdf){toast('PDF-verktøyet er ikke lastet. Åpne appen med nett én gang først.');return}
  saveNow();const blob=await buildPdf(state);const name=pdfName(state);
  const file=new File([blob],name,{type:'application/pdf'});
  if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:name})}catch(e){}return}
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
}

/* ---------- Microsoft-innlogging ---------- */
const configured=!!(CFG.clientId&&!/SETT-INN/i.test(CFG.clientId)&&window.msal);
const SCOPES=['Files.ReadWrite.All','Mail.Send'];
let msalApp=null,account=null;
async function initAuth(){
  if(!configured){renderWho();return}
  const base=location.origin+location.pathname.replace(/[^/]*$/,'');
  msalApp=new msal.PublicClientApplication({auth:{clientId:CFG.clientId,authority:'https://login.microsoftonline.com/'+(CFG.tenant||'organizations'),redirectUri:CFG.redirectUri||base,navigateToLoginRequestUrl:false},cache:{cacheLocation:'localStorage',storeAuthStateInCookie:true}});
  try{const res=await msalApp.handleRedirectPromise();if(res&&res.account)account=res.account}catch(e){toast('Innloggingen ble avbrutt.')}
  account=account||msalApp.getAllAccounts()[0]||null;if(account)msalApp.setActiveAccount(account);
  renderWho();
  const after=sessionStorage.getItem(AFTER_KEY);sessionStorage.removeItem(AFTER_KEY);
  if(account&&after&&records[after]){if(state.id!==after)openRecord(records[after]);uploadCurrent()}
  else processQueue();
}
function renderWho(){
  const w=$('#who');
  if(!configured){w.innerHTML='<span>SharePoint er ikke satt opp</span>';return}
  w.innerHTML=account?`<span class="nm">${esc(account.name||account.username)}</span><button class="chip" id="btnLogout" type="button">Logg ut</button>`:`<button class="chip" id="btnLogin" type="button">Logg inn</button>`;
  const li=$('#btnLogin');if(li)li.onclick=()=>login();
  const lo=$('#btnLogout');if(lo)lo.onclick=()=>msalApp.logoutRedirect({account,postLogoutRedirectUri:location.href.split('#')[0]});
}
function login(afterId){saveNow();if(afterId)sessionStorage.setItem(AFTER_KEY,afterId);return msalApp.loginRedirect({scopes:SCOPES,prompt:'select_account'})}
async function getToken(interactiveFor){
  if(!account)throw{code:'login'};
  try{return(await msalApp.acquireTokenSilent({scopes:SCOPES,account})).accessToken}
  catch(e){if(e instanceof msal.InteractionRequiredAuthError){if(interactiveFor){saveNow();sessionStorage.setItem(AFTER_KEY,interactiveFor);await msalApp.acquireTokenRedirect({scopes:SCOPES,account})}throw{code:'login'}}
    throw{code:'network',message:e.message}}
}

/* ---------- SharePoint via Microsoft Graph ---------- */
const enc=encodeURIComponent;
async function graph(token,method,path,body,headers){
  let r;try{r=await fetch('https://graph.microsoft.com/v1.0'+path,{method,headers:Object.assign({Authorization:'Bearer '+token},headers||{}),body})}catch(e){throw{code:'network',message:e.message}}
  if(r.status===404)return null;
  if(!r.ok){let msg=r.statusText;try{const j=await r.json();msg=(j.error&&j.error.message)||msg}catch(e){}throw{code:'http',status:r.status,message:msg}}
  if(r.status===202||r.status===204)return{};
  const txt=await r.text();return txt?JSON.parse(txt):{};
}
async function ensureFolder(token,parentId,name){
  const D=CFG.driveId;
  const it=await graph(token,'GET',`/drives/${D}/items/${parentId}:/${enc(name)}`);
  if(it){if(!it.folder)throw{code:'http',status:409,message:`«${name}» finnes, men er ikke en mappe.`};return it.id}
  const c=await graph(token,'POST',`/drives/${D}/items/${parentId}/children`,JSON.stringify({name,folder:{},'@microsoft.graph.conflictBehavior':'fail'}),{'Content-Type':'application/json'});
  return c.id;
}
async function uploadRecord(s,{token,replace}){
  const kunde=spName(s.meta.kunde);const year=(s.meta.dato||today()).slice(0,4);const file=pdfName(s);const D=CFG.driveId;
  const kId=await ensureFolder(token,CFG.kundeFolderId,kunde);
  const yId=await ensureFolder(token,kId,year);
  const existing=await graph(token,'GET',`/drives/${D}/items/${yId}:/${enc(file)}`);
  if(existing&&!replace)return{exists:true,file,webUrl:existing.webUrl};
  const pdf=await buildPdf(s);
  const up=await graph(token,'PUT',`/drives/${D}/items/${yId}:/${enc(file)}:/content?@microsoft.graph.conflictBehavior=replace`,pdf,{'Content-Type':'application/pdf'});
  return{file,webUrl:up&&up.webUrl,path:`${CFG.kundeFolderLabel||'Kunde'} › ${kunde} › ${year}`};
}
let spBusy=false,spReplaceArm=null,spErr='';
function renderSpNote(){const n=$('#spNote');if(!n)return;
  if(spErr){n.innerHTML=`<span class="err">${esc(spErr)}</span>`;return}
  if(state.pending){n.textContent='Venter på nett. Rapporten lastes opp automatisk når du har dekning.';return}
  if(state.spUrl&&!state.spStale){n.innerHTML=`Lastet opp: <a href="${esc(state.spUrl)}" target="_blank" rel="noopener">${esc(state.spFile||'åpne i SharePoint')}</a>`;return}
  if(!configured){n.textContent='SharePoint-opplasting er ikke satt opp ennå. Bruk «Del / lagre PDF».';return}
  const k=spName(state.meta.kunde);
  n.textContent=`${state.spStale?'Endret etter opplasting. ':''}PDF-en «${pdfName(state)}» legges i ${CFG.kundeFolderLabel||'Kunde'} › ${k||'kunde'} › ${(state.meta.dato||today()).slice(0,4)}.`;
}
function setSpBtn(t,dis){document.querySelectorAll('[data-act="sp"]').forEach(b=>{b.textContent=t;b.disabled=!!dis})}
function errText(err){
  if(err.code==='network')return 'Ingen kontakt med SharePoint. Rapporten lastes opp automatisk når du har nett.';
  if(err.code==='http'&&(err.status===401))return 'Innloggingen har gått ut. Trykk «Last opp» igjen for å logge inn.';
  if(err.code==='http'&&err.status===403)return 'Brukeren din har ikke skrivetilgang til Kunde-mappen i SharePoint. Spør den som administrerer SharePoint.';
  if(err.code==='http'&&err.status===429)return 'SharePoint ber oss vente litt. Prøv igjen om et minutt.';
  return 'SharePoint svarte med en feil: '+String(err.message||err.status||'ukjent').slice(0,200);
}
async function uploadCurrent(){
  if(spBusy)return;spErr='';
  if(!configured){toast('SharePoint-opplasting er ikke satt opp ennå.');return}
  if(!spName(state.meta.kunde)){toast('Fyll inn kunde først. Mappen i SharePoint får kundens navn.');$('#f-meta-kunde').focus();return}
  if(!spName(state.meta.serienr)){toast('Fyll inn serienummer først. Det brukes i filnavnet.');$('#f-meta-serienr').focus();return}
  if(!window.jspdf){toast('PDF-verktøyet er ikke lastet. Åpne appen med nett én gang først.');return}
  saveNow();
  if(!account){login(state.id);return}
  spBusy=true;setSpBtn('Laster opp …',true);
  const replace=spReplaceArm===pdfName(state);
  try{
    const token=await getToken(state.id);
    const res=await uploadRecord(state,{token,replace});
    if(res.exists){spReplaceArm=res.file;spBusy=false;setSpBtn('Erstatt filen i SharePoint');spErr='';const n=$('#spNote');n.innerHTML=`«${esc(res.file)}» finnes allerede i SharePoint. Trykk igjen for å erstatte den.`;return}
    Object.assign(state,{spUrl:res.webUrl||'',spFile:res.file,spStale:false,pending:false,uploadedAt:new Date().toISOString()});spReplaceArm=null;saveNow();
    toast('Lastet opp til SharePoint');
    renderMailBox(true);
  }catch(err){
    if(err.code==='login'){spErr='Du må logge inn på nytt. Trykk «Last opp» igjen.'}
    else if(err.code==='network'){state.pending=true;saveNow()}
    else spErr=errText(err);
  }finally{spBusy=false;if(!spReplaceArm)setSpBtn('Last opp til SharePoint');renderSpNote()}
}

/* ---------- send rapport på e-post ---------- */
const blobToB64=b=>new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(String(fr.result).split(',')[1]);fr.onerror=rej;fr.readAsDataURL(b)});
const parseEmails=s=>String(s||'').split(/[,;\s]+/).map(x=>x.trim()).filter(Boolean);
const validEmail=e=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
function mailDefaults(){const m=state.meta;
  const subject=`Servicerapport Lift-Man Fold${m.serienr?' – S/N '+m.serienr:''}${m.kunde?' – '+m.kunde:''} – ${fmtDate(m.dato)}`;
  const avv=stats(state).avv;
  const sender=state.utfortAv||(account&&account.name)||'';
  const body=`Hei,\n\nVedlagt er servicerapporten for Lift-Man Fold${m.serienr?' (S/N '+m.serienr+')':''}${m.kunde?' for '+m.kunde:''}${m.ordrenr?', ordrenr. '+m.ordrenr:''}, utført ${fmtDate(state.signDato||m.dato)}.\n${avv.length?'\nAvvik:\n'+avv.map(it=>{const c=(state.items[it.nr]||{}).c;return `- ${it.nr} ${it.text}${c?': '+c.trim():''}`}).join('\n')+'\n':''}${state.kommentarInnkjop?'\nKommentar til Innkjøp:\n'+state.kommentarInnkjop.trim()+'\n':''}\nMed vennlig hilsen\n${sender?sender+'\n':''}Reglo AS\nTlf. +47 33 43 02 80\nwww.reglo.no`;
  return{to:'',subject,body}}
let mailOpen=false,mailBusy=false;
function renderMailBox(open){
  const box=$('#mailBox');if(!box)return;
  if(open!==undefined)mailOpen=open;
  const sent=state.mailSentTo?`<p class="note">Rapporten ble sendt til ${esc(state.mailSentTo)} ${esc(fmtDate((state.mailSentAt||'').slice(0,10)))}.</p>`:'';
  if(!state.spUrl||!configured){box.hidden=true;return}
  box.hidden=false;
  if(!mailOpen){box.innerHTML=`${sent}<div class="endacts" style="margin-top:12px"><button class="btn" type="button" id="mailOpenBtn">${state.mailSentTo?'Send rapporten på nytt':'Send rapport på e-post'}</button></div>`;
    $('#mailOpenBtn').onclick=()=>renderMailBox(true);return}
  const d=mailDefaults();
  box.innerHTML=`<div class="mailcard">
    <h3>Send rapport på e-post</h3>
    <p class="note" style="margin:0 0 10px">PDF-en legges ved og sendes fra din Reglo-e-post, for eksempel til Innkjøp eller kunden.</p>
    <label class="f"><span>Til</span><input id="mailTo" type="email" inputmode="email" autocomplete="email" placeholder="navn@reglo.no" value="${esc(d.to)}"></label>
    <span class="hint" id="mailToHint" hidden>Skriv en gyldig e-postadresse. Flere adresser skilles med komma.</span>
    <label class="f"><span>Kopi til (valgfritt)</span><input id="mailCc" type="email" inputmode="email" placeholder="kollega@reglo.no"></label>
    <label class="f"><span>Emne</span><input id="mailSubject" type="text" value="${esc(d.subject)}"></label>
    <label class="f"><span>Melding</span><textarea id="mailBody" rows="10">${esc(d.body)}</textarea></label>
    <p class="note" style="margin:0">Vedlegg: ${esc(pdfName(state))}</p>
    <div class="endacts" style="margin-top:12px"><button class="btn" type="button" id="mailSkip">Ikke send nå</button><button class="btn primary" type="button" id="mailSend">Send e-post</button></div>
    <p class="note" id="mailNote"></p></div>`;
  $('#mailSkip').onclick=()=>renderMailBox(false);
  $('#mailSend').onclick=sendMail;
  $('#mailTo').addEventListener('input',()=>{$('#mailToHint').hidden=true});
  setTimeout(()=>box.scrollIntoView({behavior:'smooth',block:'start'}),50);
}
async function sendMail(){
  if(mailBusy)return;
  const to=parseEmails($('#mailTo').value),cc=parseEmails($('#mailCc').value);
  if(!to.length||!to.concat(cc).every(validEmail)){$('#mailToHint').hidden=false;$('#mailTo').focus();return}
  if(!navigator.onLine){$('#mailNote').innerHTML='<span class="err">Du er uten nett. Send e-posten når du har dekning.</span>';return}
  if(!account){login(state.id);return}
  mailBusy=true;const btn=$('#mailSend');btn.disabled=true;btn.textContent='Sender …';$('#mailNote').textContent='';
  try{
    const token=await getToken(state.id);
    const pdf=await buildPdf(state);const b64=await blobToB64(pdf);
    const message={subject:$('#mailSubject').value.trim()||mailDefaults().subject,body:{contentType:'Text',content:$('#mailBody').value},
      toRecipients:to.map(a=>({emailAddress:{address:a}})),ccRecipients:cc.map(a=>({emailAddress:{address:a}})),
      attachments:[{'@odata.type':'#microsoft.graph.fileAttachment',name:pdfName(state),contentType:'application/pdf',contentBytes:b64}]};
    await graph(token,'POST','/me/sendMail',JSON.stringify({message,saveToSentItems:true}),{'Content-Type':'application/json'});
    Object.assign(state,{mailSentTo:to.join(', '),mailSentAt:new Date().toISOString()});
    saveNow();mailOpen=false;renderMailBox();toast('E-posten er sendt til '+to.join(', '));
  }catch(err){
    mailBusy=false;btn.disabled=false;btn.textContent='Send e-post';
    $('#mailNote').innerHTML='<span class="err">'+esc(err.code==='login'?'Du må logge inn på nytt. Trykk «Send e-post» igjen.':err.code==='http'&&err.status===403?'Brukeren din har ikke lov til å sende e-post fra appen. Spør den som administrerer Microsoft 365.':err.code==='network'?'Ingen kontakt. E-posten ble ikke sendt. Prøv igjen når du har nett.':'E-posten ble ikke sendt: '+String(err.message||err.status||'ukjent feil').slice(0,200))+'</span>';
    return}
  mailBusy=false;
}

let queueBusy=false;
async function processQueue(){
  if(queueBusy||!configured||!account||!navigator.onLine)return;
  const pend=Object.values(records).filter(r=>r.pending);if(!pend.length)return;
  queueBusy=true;let ok=0;
  try{const token=await getToken();
    for(const r of pend){try{const res=await uploadRecord(r,{token,replace:true});Object.assign(r,{spUrl:res.webUrl||'',spFile:res.file,spStale:false,pending:false,uploadedAt:new Date().toISOString()});ok++;
      if(state.id===r.id)Object.assign(state,{spUrl:r.spUrl,spFile:r.spFile,spStale:false,pending:false})}catch(e){if(e.code==='network')break}}
    persistRecords();
  }catch(e){}finally{queueBusy=false;if(ok){toast(`${ok} rapport${ok>1?'er':''} lastet opp til SharePoint`);renderSpNote();if(!$('#list').hidden)renderList()}}
}

/* ---------- nett, installering, oppstart ---------- */
function netState(){$('#offlineTip').hidden=navigator.onLine;if(navigator.onLine)processQueue()}
window.addEventListener('online',netState);window.addEventListener('offline',netState);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')saveNow();else processQueue()});
window.addEventListener('pagehide',saveNow);
(function installTip(){
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const standalone=window.navigator.standalone||matchMedia('(display-mode: standalone)').matches;
  if(ios&&!standalone&&!ls.get('lmf-tip-closed',false))$('#installTip').hidden=false;
  $('#tipClose').onclick=()=>{$('#installTip').hidden=true;ls.set('lmf-tip-closed',true)};
})();
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(()=>{});
renderForm();updateCount();netState();initAuth();
