/* Årskontroll Wall-Man – Reglo AS */
'use strict';
const CFG = window.WM_CONFIG || {};
const REV = '19.10.2026';
const SECTIONS = [
  {nr:'1',title:'Lufttilførsel',items:[
    ['1.1','Kontrollere for lekkasjer'],
    ['1.2','Kontrollere slangetrommel (stramme om nødvendig)'],
    ['1.3','Kontrollere slangeføringsarm'],
    ['1.4','Kontrollere sikkerhetslenke på slangekobling']]},
  {nr:'2',title:'Skinner',items:[
    ['2.1','Kontrollere innfestningspunkter'],
    ['2.2','Kontrollere sveiser visuelt'],
    ['2.3','Avstand innside til ytterkant frontleppe, mindre enn 48 mm'],
    ['2.4','Kontrollere rengjøring i skinne'],
    ['2.5','Kontrollere endestoppere']]},
  {nr:'3',title:'Skinneskjøt',optional:true,items:[
    ['3.1','Type',['Manuell','Pneumatisk']],
    ['3.2','Åpner og lukker som normalt'],
    ['3.3','Sikkerhetsklaff fungerer'],
    ['3.4','Kontramutter bak bolt for klaff er på plass'],
    ['3.5','Alle skruer/muttere er merket'],
    ['3.6','Kontrollere sveiser']]},
  {nr:'4',title:'Toppseksjon',items:[
    ['4.1','Kontrollere alle sveiser visuelt'],
    ['4.2','Kontrollere skruene på aluminiumsdeksel topp/bunn'],
    ['4.3','Kontrollere slitasje bremsekloss, bytt ved behov'],
    ['4.4','Kontrollere innfestning drivmotor, ettertrekk om nødvendig'],
    ['4.5','Kontrollere styrehjul i skinne'],
    ['4.6','Kontrollere sikkerhetshake'],
    ['4.7','Kontrollere/ettertrekke skruer'],
    ['4.8','Alle skruer/muttere er merket']]},
  {nr:'5',title:'Bunnseksjon',items:[
    ['5.1','Kontrollere brems nedre hjul (hvis montert)'],
    ['5.2','Kontrollere nedre hjul'],
    ['5.3','Kontrollere skinne/anleggsflate på vegg'],
    ['5.4','Kontrollere/ettertrekke skruer'],
    ['5.5','Alle skruer/muttere er merket']]},
  {nr:'6',title:'Løftemekanisme',items:[
    ['6.1','Kontrollere sylindere og koblinger for lekkasjer'],
    ['6.2','Kontrollere beskyttelsesstrømpe på sylindere'],
    ['6.3','Kontrollere kjeder: 18 ledd C:C mindre enn 232 mm'],
    ['6.4','Smøre kjeder og glidelager kjedehjul'],
    ['6.5','Kontrollere nylonruller for opp/ned (skift ved behov)'],
    ['6.6','Kontrollere renhold stamme'],
    ['6.7','Kontrollere slakk i kjedehjulene'],
    ['6.8','Alle skruer/muttere er merket']]},
  {nr:'7',title:'Ut/inn-mekanisme',items:[
    ['7.1','Kontrollere Lintra-sylindre og koblinger for lekkasje'],
    ['7.2','Kontrollere alle sveiser visuelt'],
    ['7.3','Kontrollere alle nylonruller for ut/inn (skift ved behov)'],
    ['7.4','Kontrollere renhold ut/inn-mekanisme'],
    ['7.5','Kontrollere lager i ut/inn-sleide'],
    ['7.6','Kontrollere kabelkjeder under kurv, med innfestning'],
    ['7.7','Alle skruer/muttere er merket']]},
  {nr:'8',title:'Kurv',items:[
    ['8.1','Dører lukker automatisk og kan ikke slå utover'],
    ['8.2','Kontrollere/smøre hengsler'],
    ['8.3','Slåe for dører er hel og låser'],
    ['8.4','Kontrollere krok for sikkerhetssele'],
    ['8.5','Kontrollere kurv for defekter'],
    ['8.6','Kontrollere beskyttelsesstrømpe for kabelkjede'],
    ['8.7','Sikkerhetsbøyle over kontrollspaker'],
    ['8.8','Stoppekran fungerer og kan låses'],
    ['8.9','Ekstra luftuttak fungerer'],
    ['9.0','Kontrollere fallsikring/Atex-klistremerker'],
    ['9.1','Kontrollere/ettertrekke skruer'],
    ['9.2','Alle skruer/muttere er merket']]},
  {nr:'10',title:'Sikkerhet',items:[
    ['10.1','Kontrollere kjedeslakkventil'],
    ['10.2','Kontrollere nødsenk og skruene i enden på ventilen'],
    ['10.3','Kontrollere horn'],
    ['10.4','Kontrollere overlastventil'],
    ['10.5','Kontrollere ut/ned-stopp (hvis montert)'],
    ['10.6','Kontrollere skrue til nødsenk-dekselet']]},
  {nr:'11',title:'Funksjonstest',items:[
    ['11.1','Testkjøre opp/ned'],
    ['11.2','Testkjøre ut/inn'],
    ['11.3','Testkjøre sideveis'],
    ['11.4','Testkjøre opp/ned fra gulv']]}
].map(s=>({...s,items:s.items.map(([nr,text,choice])=>({nr,text,choice}))}));

/* ---------- helpers ---------- */
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const today=()=>{const d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
const fmtDate=v=>{const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(v||'');return m?`${m[3]}.${m[2]}.${m[1]}`:(v||'')};
const ckey=nr=>nr.replace('.','_');
const newId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const clone=o=>JSON.parse(JSON.stringify(o));
let toastT;function toast(msg){const t=$('#toast');t.textContent=msg;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,3200)}
const ls={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}};

/* ---------- records (lagret på enheten) ---------- */
const REC_KEY='wm-arskontroll-records-v1',CUR_KEY='wm-arskontroll-current-v1';
function blank(){return{id:newId(),createdAt:new Date().toISOString(),meta:{dato:today(),kunde:'',adresse:'',kontakt:'',tlf:'',epost:'',serienr:'',modell:'',leveringsar:'',manualer:'',luftType:'',luftTrykk:'',kundeKommentar:''},na:{},items:{},choice:{},annet:'',godkjent:'',oblat:'',utfortAv:'',signDato:today(),signatur:'',firma:'Reglo AS'}}
let records=ls.get(REC_KEY,{});
let state=records[ls.get(CUR_KEY,'')]?Object.assign(blank(),clone(records[ls.get(CUR_KEY,'')])):blank();
const hasContent=s=>!!(s.meta.kunde||s.meta.serienr||Object.keys(s.items).length||s.signatur);
function persistRecords(){if(!ls.set(REC_KEY,records))toast('Lagringsplassen på telefonen er full. Slett gamle kontroller under «Lagrede».')}
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
function seg(path,opts){const v=getPath(path)||'';
  return `<div class="seg" data-path="${path}" role="group">${opts.map(o=>`<button type="button" data-v="${esc(o)}" aria-pressed="${v===o}">${esc(o)}</button>`).join('')}</div>`}
const segField=(label,path,opts)=>`<div class="f"><span class="lbl-s">${label}</span>${seg(path,opts)}</div>`;
function itemHTML(it){
  if(it.choice)return `<div class="item choice"><span class="nr">${it.nr}</span><span class="lbl">${esc(it.text)}</span>${seg('choice.'+ckey(it.nr),it.choice)}</div>`;
  const v=state.items[it.nr]||{};const showC=!!v.c||v.s==='avvik';
  const b=(s,t,c)=>`<button type="button" class="st ${c}" data-s="${s}" aria-pressed="${v.s===s}">${t}</button>`;
  return `<div class="item s-${v.s||'none'}" data-nr="${it.nr}"><span class="nr">${it.nr}</span><span class="lbl">${esc(it.text)}</span>
    <div class="acts">${b('ok','OK','st-ok')}${b('avvik','Krever handling','st-avvik')}${b('ia','I/A','st-ia')}<button type="button" class="cbtn${v.c?' has':''}" aria-label="Kommentar til ${it.nr}" aria-expanded="${showC}">${PEN}</button></div>
    <textarea class="cmt" id="c-${ckey(it.nr)}" data-comment="${it.nr}" rows="2" placeholder="Kommentar til ${it.nr}" ${showC?'':'hidden'}>${esc(v.c)}</textarea></div>`}
function sectionHTML(sec){const na=!!state.na[sec.nr];
  return `<section class="sec${na?' is-na':''}" data-sec="${sec.nr}"><header class="sec-h"><span class="sec-nr">${sec.nr}</span><h2>${sec.title}${sec.optional?' <span class="sec-count">(hvis aktuelt)</span>':''}</h2>
    <span class="sec-count" data-count="${sec.nr}"></span><div class="sec-tools">${sec.optional?`<button type="button" class="chip na-toggle" aria-pressed="${na}">Ikke aktuelt</button>`:''}<button type="button" class="chip allok">Resten OK</button></div></header>
    <div class="sec-body">${sec.items.map(itemHTML).join('')}</div></section>`}
function renderForm(){
  const trykk=parseFloat(String(state.meta.luftTrykk).replace(',','.'));
  $('#form').innerHTML=`
  <div class="card"><div class="grid">
    ${field('Dato','meta.dato','date')}${field('Kunde','meta.kunde')}
    ${field('Adresse','meta.adresse','text',{wide:1})}
    ${field('Kontaktperson','meta.kontakt')}${field('Tlf','meta.tlf','tel')}
    ${field('Epost','meta.epost','email',{wide:1})}
  </div></div>
  <div class="card"><div class="grid">
    ${field('Serie nr','meta.serienr')}${field('Modell','meta.modell')}
    ${field('Leveringsår','meta.leveringsar','text',{attrs:'inputmode="numeric"'})}
    ${segField('Kunde har manualer tilgjengelig','meta.manualer',['JA','NEI'])}
    ${segField('Lufttilførsel type','meta.luftType',['Slangetrommel','Kabelkjede'])}
    <label class="f"><span>Lufttilførsel trykk (minimum 6 bar)</span><span class="unit"><input id="f-meta-luftTrykk" data-path="meta.luftTrykk" type="text" inputmode="decimal" value="${esc(state.meta.luftTrykk)}"><em>bar</em></span><span class="hint" id="trykkHint" ${trykk<6?'':'hidden'}>Under 6 bar</span></label>
    <label class="f wide"><span>Kommentar/feilmelding fra kunde</span><textarea id="f-kundeKommentar" data-path="meta.kundeKommentar" rows="3">${esc(state.meta.kundeKommentar)}</textarea></label>
  </div></div>
  ${SECTIONS.map(sectionHTML).join('')}
  <section class="sec"><header class="sec-h"><h2>Annet</h2></header>
    <label class="f"><textarea id="f-annet" data-path="annet" rows="4" placeholder="Andre merknader, utført arbeid, deler byttet …">${esc(state.annet)}</textarea></label></section>
  <section class="sec"><header class="sec-h"><h2>Konklusjon og signatur</h2></header>
    <div class="concl">
      <div class="avvlist" id="avvList" hidden></div>
      <div class="row"><span>Lift godkjent for bruk</span>${seg('godkjent',['JA','NEI'])}</div>
      <div class="row"><span>Godkjenningsoblat montert</span>${seg('oblat',['JA','NEI'])}</div>
      <div class="grid">${field('Kontroll utført av','utfortAv')}${field('Dato','signDato','date')}${field('Firma','firma')}</div>
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
  SECTIONS.forEach(sec=>{if(s.na[sec.nr])return;sec.items.forEach(it=>{if(it.choice)return;tot++;const v=s.items[it.nr];if(v&&v.s){done++;if(v.s==='avvik')avv.push(it)}})});return{tot,done,avv}}
function updateProgress(){
  const {tot,done,avv}=stats(state);
  SECTIONS.forEach(sec=>{const c=$(`[data-count="${sec.nr}"]`);if(!c)return;if(state.na[sec.nr]){c.textContent='';return}
    const its=sec.items.filter(i=>!i.choice);c.textContent=`${its.filter(i=>state.items[i.nr]&&state.items[i.nr].s).length}/${its.length}`});
  $('#progTxt').textContent=`${done} av ${tot} punkter`;$('#progFill').style.width=(tot?done/tot*100:0)+'%';
  $('#progAvv').textContent=avv.length?`${avv.length} krever handling`:'';$('#progAvv').className=avv.length?'avv':'';
  const al=$('#avvList');if(al){al.hidden=!avv.length;al.innerHTML=avv.length?`<b>Krever handling:</b> ${avv.map(it=>esc(it.nr+' '+it.text)).join(' · ')}`:''}}

/* ---------- events ---------- */
const form=$('#form');
form.addEventListener('input',e=>{const t=e.target;
  if(t.dataset.path){setPath(t.dataset.path,t.value);
    if(t.dataset.path==='meta.luftTrykk'){const n=parseFloat(t.value.replace(',','.'));$('#trykkHint').hidden=!(n<6)}
    if(/^meta\.(kunde|dato|serienr)$/.test(t.dataset.path)){spReplaceArm=null;renderSpNote()}}
  else if(t.dataset.comment){const nr=t.dataset.comment;state.items[nr]=Object.assign({},state.items[nr],{c:t.value});t.closest('.item').querySelector('.cbtn').classList.toggle('has',!!t.value)}
  touched()});
form.addEventListener('click',e=>{
  const sb=e.target.closest('.seg button');
  if(sb){const sg=sb.parentElement,p=sg.dataset.path,v=sb.dataset.v,nv=getPath(p)===v?'':v;setPath(p,nv);sg.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===nv)));touched();return}
  const st=e.target.closest('.st');
  if(st){const nr=st.closest('.item').dataset.nr,cur=state.items[nr]||{};state.items[nr]=Object.assign({},cur,{s:cur.s===st.dataset.s?'':st.dataset.s});updateItem(nr);updateProgress();touched();return}
  const cb=e.target.closest('.cbtn');
  if(cb){const ta=cb.closest('.item').querySelector('.cmt');ta.hidden=!ta.hidden;cb.setAttribute('aria-expanded',String(!ta.hidden));if(!ta.hidden)ta.focus();return}
  const ao=e.target.closest('.allok');
  if(ao){const sec=SECTIONS.find(s=>s.nr===ao.closest('.sec').dataset.sec);let n=0;
    sec.items.forEach(it=>{if(it.choice)return;const v=state.items[it.nr]||{};if(!v.s){state.items[it.nr]=Object.assign({},v,{s:'ok'});updateItem(it.nr);n++}});
    updateProgress();touched();toast(n?`${n} punkter merket OK`:'Alle punkter er allerede utfylt');return}
  const na=e.target.closest('.na-toggle');
  if(na){const s=na.closest('.sec'),nr=s.dataset.sec;state.na[nr]=!state.na[nr];s.classList.toggle('is-na',state.na[nr]);na.setAttribute('aria-pressed',String(state.na[nr]));updateProgress();touched();return}
  if(e.target.id==='sigClear'){state.signatur='';sigRedraw();touched();return}
  const act=e.target.closest('[data-act]');
  if(act){act.dataset.act==='pdf'?sharePdf():uploadCurrent()}
});

/* ---------- signature ---------- */
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

/* ---------- tabs, ny, liste ---------- */
function showTab(which){const f=which==='form';
  $('#tab-form').setAttribute('aria-selected',String(f));$('#tab-list').setAttribute('aria-selected',String(!f));
  $('#form').hidden=!f;$('#list').hidden=f;$('#progRow').hidden=!f;if(!f)renderList();window.scrollTo(0,0)}
$('#tab-form').onclick=()=>showTab('form');$('#tab-list').onclick=()=>{saveNow();showTab('list')};
function openRecord(s){saveNow();state=Object.assign(blank(),clone(s));ls.set(CUR_KEY,state.id);spErr='';spReplaceArm=null;renderForm();showTab('form')}
$('#btnNew').onclick=()=>{saveNow();state=blank();ls.set(CUR_KEY,'');spErr='';spReplaceArm=null;renderForm();showTab('form');toast(Object.keys(records).length?'Ny kontroll. Tidligere kontroller ligger under «Lagrede».':'Ny kontroll')};
function updateCount(){const n=Object.keys(records).length;$('#savedCount').textContent=n?`(${n})`:''}
function recStatus(r){return r.godkjent==='JA'?['ok','Godkjent']:r.godkjent==='NEI'?['no','Ikke godkjent']:['wip','Ikke ferdig']}
let delArm=null;
function renderList(){
  updateCount();
  const q=$('#search').value.trim().toLowerCase();
  const all=Object.values(records).sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')));
  const rs=all.filter(r=>!q||[r.meta.kunde,r.meta.serienr,r.meta.modell,r.utfortAv,r.meta.adresse].join(' ').toLowerCase().includes(q));
  const pend=all.filter(r=>r.pending).length;const qn=$('#queueNote');qn.hidden=!pend;qn.textContent=pend?`${pend} kontroll${pend>1?'er':''} venter på opplasting til SharePoint. Det skjer automatisk når du har nett og er logget inn.`:'';
  if(!all.length){$('#recs').innerHTML='<p class="empty">Ingen kontroller på denne telefonen ennå. Start en ny under «Kontroll».</p>';return}
  if(!rs.length){$('#recs').innerHTML='<p class="empty">Ingen treff.</p>';return}
  $('#recs').innerHTML=rs.map(r=>{const [c,t]=recStatus(r);const m=r.meta;const {avv}=stats(r);
    const sp=(r.pending?'<span class="pill wip">Venter på opplasting</span>':r.spUrl?(r.spStale?'<span class="pill wip">Endret etter opplasting</span>':'<span class="pill ok">I SharePoint</span>'):'')+(r.mailSentTo?'<span class="pill ok">Sendt kunde</span>':'');
    return `<div class="rec" data-id="${esc(r.id)}"><div><h3>${esc(m.kunde||'Uten kundenavn')}</h3>
      <div class="meta">${[m.serienr&&'Serie nr '+m.serienr,m.modell,fmtDate(m.dato),r.utfortAv].filter(Boolean).map(esc).join(' · ')}${avv.length?` · <b style="color:var(--warn)">${avv.length} krever handling</b>`:''}</div></div>
      <div class="pills"><span class="pill ${c}">${t}</span>${sp}</div>
      <div class="ra"><button class="btn small" data-r="open">Åpne</button><button class="btn small" data-r="copy">Ny kontroll for samme lift</button><button class="btn small danger" data-r="del">${delArm===r.id?'Bekreft sletting':'Slett'}</button></div></div>`}).join('');
}
$('#search').addEventListener('input',renderList);
$('#recs').addEventListener('click',e=>{
  const b=e.target.closest('[data-r]');if(!b)return;const id=b.closest('.rec').dataset.id;const r=records[id];if(!r)return;
  if(b.dataset.r==='open'){openRecord(r)}
  else if(b.dataset.r==='copy'){saveNow();const n=blank();n.meta=Object.assign({},r.meta,{dato:today(),kundeKommentar:''});n.utfortAv=r.utfortAv||'';state=n;renderForm();showTab('form');toast('Ny kontroll med kunde- og liftinfo')}
  else if(b.dataset.r==='del'){
    if(delArm!==id){delArm=id;renderList();setTimeout(()=>{if(delArm===id){delArm=null;renderList()}},4000);return}
    delArm=null;delete records[id];persistRecords();if(state.id===id){state=blank();renderForm()}renderList();toast('Kontroll slettet fra telefonen')}
});

/* ---------- PDF ---------- */
let logoJpg=null;
function toJpeg(src,w,h){return new Promise(res=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=w||im.naturalWidth;c.height=h||im.naturalHeight;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);try{res(c.toDataURL('image/jpeg',0.85))}catch(e){res(null)}};im.onerror=()=>res(null);im.src=src})}
const logoReady=toJpeg('data:image/svg+xml;charset=utf-8,'+encodeURIComponent($('#logo').outerHTML),600,235).then(d=>logoJpg=d);
async function buildPdf(s){
  await logoReady;
  const sigJpg=s.signatur?await toJpeg(s.signatur,560,140):null;
  const {jsPDF}=window.jspdf;const doc=new jsPDF({unit:'mm',format:'a4',compress:true});
  const W=210,M=14,m=s.meta,GREY=[107,107,107],LINE=[208,208,208];
  if(logoJpg)doc.addImage(logoJpg,'JPEG',W-M-40,10,40,40*86.469/220.503);
  doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(...GREY);doc.text('Rev: '+REV,M,14);
  doc.setTextColor(17);doc.setFont('helvetica','bold');doc.setFontSize(18);doc.text('ÅRSKONTROLL Wall-Man',W/2,34,{align:'center'});
  const info=[['Dato',fmtDate(m.dato),'Serie nr',m.serienr],['Kunde',m.kunde,'Modell',m.modell],['Adresse',m.adresse,'Leveringsår',m.leveringsar],
    ['Kontaktperson',m.kontakt,'Manualer tilgjengelig',m.manualer],['Tlf',m.tlf,'Lufttilførsel type',m.luftType],['Epost',m.epost,'Lufttrykk (min. 6 bar)',m.luftTrykk?m.luftTrykk+' bar':'']];
  doc.setDrawColor(...LINE);doc.setLineWidth(0.2);doc.line(M,40,W-M,40);
  doc.autoTable({startY:41,body:info,theme:'plain',margin:{left:M,right:M},styles:{font:'helvetica',fontSize:9,cellPadding:{top:1.1,bottom:1.1,left:1,right:1},textColor:17},
    columnStyles:{0:{textColor:GREY,cellWidth:25},1:{cellWidth:66},2:{textColor:GREY,cellWidth:38}}});
  let y=doc.lastAutoTable.finalY+1;doc.line(M,y,W-M,y);y+=5;
  if(m.kundeKommentar){doc.setFontSize(9);doc.setTextColor(...GREY);doc.text('Kommentar/feilmelding fra kunde:',M,y);y+=4.5;doc.setTextColor(17);const l=doc.splitTextToSize(m.kundeKommentar,W-2*M);doc.text(l,M,y);y+=l.length*4+3}
  const body=[];
  SECTIONS.forEach(sec=>{const na=s.na[sec.nr];
    body.push([{content:`${sec.nr}   ${sec.title}${na?'  (ikke aktuelt)':''}`,colSpan:5,styles:{fontStyle:'bold',fillColor:[245,247,242]}}]);
    if(na)return;
    sec.items.forEach(it=>{if(it.choice){body.push([it.nr,it.text,{content:s.choice[ckey(it.nr)]||'',colSpan:3}]);return}
      const v=s.items[it.nr]||{};body.push([it.nr,it.text,v.s==='ok'?'X':v.s==='ia'?'I/A':'',v.s==='avvik'?'X':'',v.c||''])})});
  doc.autoTable({startY:y,head:[['Nr','Kontrollpunkt','OK','Krever handling','Kommentar']],body,theme:'grid',margin:{left:M,right:M,bottom:18},
    styles:{font:'helvetica',fontSize:8.5,cellPadding:1.6,lineColor:LINE,lineWidth:0.15,textColor:17,valign:'middle'},
    headStyles:{fillColor:[255,255,255],textColor:17,fontStyle:'bold',lineColor:[17,17,17]},
    columnStyles:{0:{cellWidth:11},1:{cellWidth:76},2:{cellWidth:12,halign:'center'},3:{cellWidth:18,halign:'center'},4:{}},
    didParseCell:d=>{if(d.section==='body'&&d.column.index===3&&d.cell.raw==='X'){d.cell.styles.textColor=[194,65,12];d.cell.styles.fontStyle='bold'}
      if(d.section==='body'&&d.column.index===2&&d.cell.raw==='X')d.cell.styles.fontStyle='bold'}});
  y=doc.lastAutoTable.finalY+7;
  const need=h=>{if(y+h>278){doc.addPage();y=20}};
  doc.setFontSize(10);
  if(s.annet){const l=doc.splitTextToSize(s.annet,W-2*M);need(8+l.length*4.2);doc.setFont('helvetica','bold');doc.text('Annet',M,y);y+=5;doc.setFont('helvetica','normal');doc.setFontSize(9);doc.text(l,M,y);y+=l.length*4.2+5;doc.setFontSize(10)}
  need(62);doc.setDrawColor(...LINE);doc.line(M,y-2,W-M,y-2);y+=3;
  const kv=(k,v,x)=>{doc.setFont('helvetica','normal');doc.setTextColor(...GREY);doc.text(k,x,y);doc.setTextColor(17);doc.setFont('helvetica','bold');doc.text(v||'–',x+52,y)};
  kv('Lift godkjent for bruk:',s.godkjent,M);y+=6;kv('Godkjenningsoblat montert:',s.oblat,M);y+=9;
  doc.setFontSize(9);kv('Kontroll utført av:',s.utfortAv,M);y+=5.5;kv('Dato:',fmtDate(s.signDato),M);y+=5.5;kv('Firma:',s.firma,M);y+=4;
  if(sigJpg){try{doc.addImage(sigJpg,'JPEG',M+50,y,70,70*140/560)}catch(e){}}
  doc.setDrawColor(...GREY);doc.line(M+50,y+19,M+125,y+19);doc.setFont('helvetica','normal');doc.setTextColor(...GREY);doc.setFontSize(8);doc.text('Signatur',M+50,y+23);
  const pages=doc.getNumberOfPages();
  for(let i=1;i<=pages;i++){doc.setPage(i);doc.setDrawColor(...LINE);doc.line(M,284,W-M,284);doc.setFontSize(7);doc.setTextColor(...GREY);
    doc.text('Reglo AS · Halumveien 11, 3158 Andebu, Norway · Tlf. +47 33 43 02 80 · info@reglo.no · www.reglo.no · Org.nr. 983 148 336 MVA',W/2,288,{align:'center'});
    doc.text(`Side ${i} av ${pages}`,W-M,292,{align:'right'})}
  return doc.output('blob');
}
const spName=s=>String(s||'').replace(/["*:<>?\/\\|#%]/g,'').replace(/\s+/g,' ').trim().replace(/\.+$/,'');
const pdfName=s=>`${spName(s.meta.serienr)||'Uten serienr'} Årskontroll ${fmtDate(s.meta.dato||today())}.pdf`;
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
  const after=sessionStorage.getItem('wm-after-login');sessionStorage.removeItem('wm-after-login');
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
function login(afterId){saveNow();if(afterId)sessionStorage.setItem('wm-after-login',afterId);return msalApp.loginRedirect({scopes:SCOPES,prompt:'select_account'})}
async function getToken(interactiveFor){
  if(!account)throw{code:'login'};
  try{return(await msalApp.acquireTokenSilent({scopes:SCOPES,account})).accessToken}
  catch(e){if(e instanceof msal.InteractionRequiredAuthError){if(interactiveFor){saveNow();sessionStorage.setItem('wm-after-login',interactiveFor);await msalApp.acquireTokenRedirect({scopes:SCOPES,account})}throw{code:'login'}}
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
  if(state.pending){n.textContent='Venter på nett. Kontrollen lastes opp automatisk når du har dekning.';return}
  if(state.spUrl&&!state.spStale){n.innerHTML=`Lastet opp: <a href="${esc(state.spUrl)}" target="_blank" rel="noopener">${esc(state.spFile||'åpne i SharePoint')}</a>`;return}
  if(!configured){n.textContent='SharePoint-opplasting er ikke satt opp ennå. Bruk «Del / lagre PDF».';return}
  const k=spName(state.meta.kunde);
  n.textContent=`${state.spStale?'Endret etter opplasting. ':''}PDF-en legges i ${CFG.kundeFolderLabel||'Kunde'} › ${k||'kunde'} › ${(state.meta.dato||today()).slice(0,4)}.`;
}
function setSpBtn(t,dis){document.querySelectorAll('[data-act="sp"]').forEach(b=>{b.textContent=t;b.disabled=!!dis})}
function errText(err){
  if(err.code==='network')return 'Ingen kontakt med SharePoint. Kontrollen lastes opp automatisk når du har nett.';
  if(err.code==='http'&&(err.status===401))return 'Innloggingen har gått ut. Trykk «Last opp» igjen for å logge inn.';
  if(err.code==='http'&&err.status===403)return 'Brukeren din har ikke skrivetilgang til Kunde-mappen i SharePoint. Spør den som administrerer SharePoint.';
  if(err.code==='http'&&err.status===429)return 'SharePoint ber oss vente litt. Prøv igjen om et minutt.';
  return 'SharePoint svarte med en feil: '+String(err.message||err.status||'ukjent').slice(0,200);
}
async function uploadCurrent(){
  if(spBusy)return;spErr='';
  if(!configured){toast('SharePoint-opplasting er ikke satt opp ennå.');return}
  if(!spName(state.meta.kunde)){toast('Fyll inn kunde først. Mappen i SharePoint får kundens navn.');return}
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
/* ---------- send rapport til kunde ---------- */
const blobToB64=b=>new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(String(fr.result).split(',')[1]);fr.onerror=rej;fr.readAsDataURL(b)});
const parseEmails=s=>String(s||'').split(/[,;\s]+/).map(x=>x.trim()).filter(Boolean);
const validEmail=e=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
function mailDefaults(){const m=state.meta;
  const subject=`Årskontroll Wall-Man${m.serienr?' – serie nr '+m.serienr:''} – ${fmtDate(m.dato)}`;
  const concl=state.godkjent==='JA'?'Liften er godkjent for bruk.':state.godkjent==='NEI'?'Liften er ikke godkjent for bruk. Se punktene merket «Krever handling» i rapporten.':'';
  const avv=stats(state).avv;
  const sender=state.utfortAv||(account&&account.name)||'';
  const body=`Hei${m.kontakt?' '+m.kontakt:''},\n\nVedlagt er rapporten fra årskontrollen av Wall-Man${m.serienr?' (serie nr '+m.serienr+')':''}${m.adresse?' hos '+m.kunde+', '+m.adresse:''}, utført ${fmtDate(state.signDato||m.dato)}.\n${concl?'\n'+concl+'\n':''}${avv.length?'\nPunkter som krever handling:\n'+avv.map(it=>{const c=(state.items[it.nr]||{}).c;return `- ${it.nr} ${it.text}${c?': '+c.trim():''}`}).join('\n')+'\n':''}\nTa gjerne kontakt hvis dere har spørsmål.\n\nMed vennlig hilsen\n${sender?sender+'\n':''}Reglo AS\nTlf. +47 33 43 02 80\nwww.reglo.no`;
  return{to:m.epost||'',subject,body}}
let mailOpen=false,mailBusy=false;
function renderMailBox(open){
  const box=$('#mailBox');if(!box)return;
  if(open!==undefined)mailOpen=open;
  const sent=state.mailSentTo?`<p class="note">Rapporten ble sendt til ${esc(state.mailSentTo)} ${esc(fmtDate((state.mailSentAt||'').slice(0,10)))}.</p>`:'';
  if(!state.spUrl||!configured){box.hidden=true;return}
  box.hidden=false;
  if(!mailOpen){box.innerHTML=`${sent}<div class="endacts" style="margin-top:12px"><button class="btn" type="button" id="mailOpenBtn">${state.mailSentTo?'Send rapporten på nytt':'Send rapport til kunde'}</button></div>`;
    $('#mailOpenBtn').onclick=()=>renderMailBox(true);return}
  const d=mailDefaults();
  box.innerHTML=`<div class="mailcard">
    <h3>Send rapport til kunde</h3>
    <p class="note" style="margin:0 0 10px">PDF-en legges ved og sendes fra din Reglo-e-post.</p>
    <label class="f"><span>Til (e-post til kunde)</span><input id="mailTo" type="email" inputmode="email" autocomplete="email" placeholder="navn@kunde.no" value="${esc(d.to)}"></label>
    <span class="hint" id="mailToHint" hidden>Skriv en gyldig e-postadresse. Flere adresser skilles med komma.</span>
    <label class="f"><span>Kopi til (valgfritt)</span><input id="mailCc" type="email" inputmode="email" placeholder="kollega@reglo.no"></label>
    <label class="f"><span>Emne</span><input id="mailSubject" type="text" value="${esc(d.subject)}"></label>
    <label class="f"><span>Melding</span><textarea id="mailBody" rows="10">${esc(d.body)}</textarea></label>
    <p class="note" style="margin:0">Vedlegg: ${esc(pdfName(state))}</p>
    <div class="endacts" style="margin-top:12px"><button class="btn" type="button" id="mailSkip">Ikke send nå</button><button class="btn primary" type="button" id="mailSend">Send e-post</button></div>
    <p class="note" id="mailNote"></p></div>`;
  $('#mailSkip').onclick=()=>renderMailBox(false);
  $('#mailSend').onclick=sendMailToCustomer;
  $('#mailTo').addEventListener('input',()=>{$('#mailToHint').hidden=true});
  setTimeout(()=>box.scrollIntoView({behavior:'smooth',block:'start'}),50);
}
async function sendMailToCustomer(){
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
    if(!state.meta.epost){state.meta.epost=to[0];const f=$('#f-meta-epost');if(f)f.value=to[0]}
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
  }catch(e){}finally{queueBusy=false;if(ok){toast(`${ok} kontroll${ok>1?'er':''} lastet opp til SharePoint`);renderSpNote();if(!$('#list').hidden)renderList()}}
}

/* ---------- nett, installering, oppstart ---------- */
function netState(){$('#offlineTip').hidden=navigator.onLine;if(navigator.onLine)processQueue()}
window.addEventListener('online',netState);window.addEventListener('offline',netState);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')saveNow();else processQueue()});
window.addEventListener('pagehide',saveNow);
(function installTip(){
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const standalone=window.navigator.standalone||matchMedia('(display-mode: standalone)').matches;
  if(ios&&!standalone&&!ls.get('wm-tip-closed',false))$('#installTip').hidden=false;
  $('#tipClose').onclick=()=>{$('#installTip').hidden=true;ls.set('wm-tip-closed',true)};
})();
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(()=>{});
renderForm();updateCount();netState();initAuth();
