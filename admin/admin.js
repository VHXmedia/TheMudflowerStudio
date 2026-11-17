const $=s=>document.querySelector(s),H={'X-Requested-With':'mf'};
const api=(u,o={})=>fetch(u,{...o,headers:{...H,...(o.headers||{})}});
const J=(u,d)=>api(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let C,sec='home',cur=0,tm;
const TABS=[['home','Home'],['about','About'],['contact','Contact'],['art','Kunstwerken'],['site','Site']];
const SCH={home:[['home.tagline','Tagline'],['home.intro','Introtekst (lege regel = nieuwe alinea)','a']],
 about:[['about.title','Titel'],['about.text','Tekst (lege regel = nieuwe alinea)','a'],['about.note','Kleine zin onderaan']],
 contact:[['contact.title','Titel'],['contact.intro','Introtekst','a'],['contact.button','Tekst op knop'],['contact.formAction','Formspree-adres (waar berichten naartoe gaan)']],
 site:[['site.name','Naam van de studio'],['site.footer','Footertekst'],['site.basePath','Base path: leeg bij eigen domein, "/repo-naam" bij github.io/repo-naam']]};
const get=p=>p.split('.').reduce((o,k)=>o?.[k],C),set=(p,v)=>{const k=p.split('.'),l=k.pop();k.reduce((o,x)=>o[x],C)[l]=v};
const fld=(p,l,t)=>`<label>${l}</label>`+(t==='a'?`<textarea data-p="${p}">${esc(get(p))}</textarea>`:t==='s'?`<select data-p="${p}"><option value="available" ${get(p)==='available'?'selected':''}>Te koop</option><option value="sold" ${get(p)==='sold'?'selected':''}>Verkocht</option></select>`:`<input data-p="${p}" type="${t==='n'?'number':'text'}" value="${esc(get(p))}">`);
async function init(){const r=await api('/api/me');if(!r.ok)return login();C=await api('/api/content').then(r=>r.json());ui()}
function login(){$('#app').innerHTML=`<form class="login" id="l"><h2 style="font-weight:300;letter-spacing:.2em;text-transform:uppercase">Admin</h2><label>Gebruiker (developer of artist)</label><input name="user" autocomplete="username" required><label>Wachtwoord</label><input name="password" type="password" autocomplete="current-password" required><p></p><button>Inloggen</button><p id="e" style="color:#d9b9a2"></p></form>`;
  $('#l').onsubmit=async e=>{e.preventDefault();const r=await J('/api/login',Object.fromEntries(new FormData(e.target)));r.ok?init():$('#e').textContent=(await r.json()).error}}
function ui(){$('#app').innerHTML=`<div class="top"><b style="letter-spacing:.2em;text-transform:uppercase;font-weight:400">Mudflower Admin</b><nav>${TABS.map(([k,l])=>`<a data-t="${k}" class="${k===sec?'on':''}">${l}</a>`).join('')}</nav><span><button id="pub">Opslaan &amp; publiceren</button> &nbsp;<a id="out">Uitloggen</a></span></div><div class="main"><div class="ed" id="ed"></div><iframe id="pv"></iframe></div><pre id="log" hidden></pre>`;
  document.querySelectorAll('[data-t]').forEach(a=>a.onclick=()=>{sec=a.dataset.t;ui()});
  $('#out').onclick=async()=>{await J('/api/logout',{});login()};
  $('#ed').oninput=e=>{const p=e.target.dataset.p;if(p){set(p,e.target.value);prev()}};
  $('#ed').onclick=photoActs;$('#pub').onclick=pub;edit();prev()}
function edit(){const e=$('#ed');if(sec!=='art')return e.innerHTML=SCH[sec].map(([p,l,t])=>fld(p,l,t)).join('');
  const A=C.artworks,w=A[cur],i=`artworks.${cur}.`;
  e.innerHTML=`<select id="sel">${A.map((x,k)=>`<option value="${k}" ${k===cur?'selected':''}>N°${x.n} — ${esc(x.title)}</option>`).join('')}</select><p><button id="add">+ Nieuw kunstwerk</button> <button id="del">Verwijder</button></p>`+(w?
   fld(i+'title','Titel')+fld(i+'medium','Materiaal')+fld(i+'size','Afmetingen')+fld(i+'year','Jaar')+fld(i+'price','Prijs (€)','n')+fld(i+'status','Status','s')+fld(i+'description','Omschrijving','a')+
   `<label>Foto's (volgorde = volgorde in de grid)</label>${w.photos.map((p,k)=>`<div class="ph"><img src="/uploads/${p}"><span>${k+1}</span><button data-a="up" data-k="${k}">↑</button><button data-a="dn" data-k="${k}">↓</button><button data-a="rm" data-k="${k}">✕</button></div>`).join('')}<input type="file" id="ph" accept="image/*" multiple>
   <label>Verticale video (max. 100 MB)</label>${w.video?`<div class="ph"><span>${w.video}</span><button data-a="vrm">✕</button></div>`:''}<input type="file" id="vd" accept="video/mp4,video/webm,video/quicktime">${fld(i+'videoTitle','Naam bij de video (leeg laten = geen naam)')}<p id="st"></p>`:'');
  $('#sel').onchange=e=>{cur=+e.target.value;edit();prev()};
  $('#add').onclick=()=>{const n=Math.max(0,...A.map(x=>x.n))+1;A.push({n,title:'Nieuw werk',medium:'',size:'',year:new Date().getFullYear()+'',price:250,status:'available',description:'',photos:[],video:null});cur=A.length-1;edit();prev()};
  $('#del').onclick=()=>{if(w&&confirm(`N°${w.n} verwijderen?`)){A.splice(cur,1);cur=0;edit();prev()}};
  if(w){$('#ph').onchange=async e=>{for(const f of e.target.files){$('#st').textContent='Uploaden…';w.photos.push(await up(await shrink(f),'jpg'))}edit();prev()};
    $('#vd').onchange=async e=>{const f=e.target.files[0];if(f){$('#st').textContent='Video uploaden…';try{w.video=await up(f,f.name.split('.').pop().toLowerCase())}catch(x){alert(x.message)}edit();prev()}}}}
function photoActs(e){const b=e.target.closest('[data-a]');if(!b)return;const w=C.artworks[cur],k=+b.dataset.k,a=b.dataset.a;
  if(a==='rm')w.photos.splice(k,1);if(a==='vrm')w.video=null;if(a==='up'&&k>0)[w.photos[k-1],w.photos[k]]=[w.photos[k],w.photos[k-1]];if(a==='dn'&&k<w.photos.length-1)[w.photos[k+1],w.photos[k]]=[w.photos[k],w.photos[k+1]];edit();prev()}
const shrink=async f=>{const b=await createImageBitmap(f),s=Math.min(1,2000/Math.max(b.width,b.height)),c=document.createElement('canvas');c.width=b.width*s;c.height=b.height*s;c.getContext('2d').drawImage(b,0,0,c.width,c.height);return new Promise(r=>c.toBlob(r,'image/jpeg',.86))};
async function up(f,ext){const r=await api('/api/upload?ext='+ext,{method:'POST',body:f});if(!r.ok)throw new Error((await r.json()).error);return(await r.json()).name}
function prev(){clearTimeout(tm);tm=setTimeout(async()=>{const pg=sec==='art'&&C.artworks[cur]?'n'+C.artworks[cur].n:sec==='about'||sec==='contact'?sec:'home',pv=$('#pv'),y=pv.contentWindow?.scrollY||0;
  const h=await J('/api/preview',{content:C,page:pg}).then(r=>r.text());pv.onload=()=>pv.contentWindow.scrollTo(0,y);pv.srcdoc=h},250)}
async function pub(){if(!confirm('Opslaan en publiceren naar GitHub?'))return;const b=$('#pub'),l=$('#log');b.disabled=true;b.textContent='Bezig…';
  const r=await J('/api/publish',{content:C}).then(r=>r.json()).catch(()=>({ok:false,log:'Fout bij publiceren'}));l.hidden=false;l.textContent=(r.ok?'✔ Gepusht. GitHub Pages is binnen ~1 minuut bijgewerkt.\n\n':'✘ Mislukt\n\n')+r.log;b.disabled=false;b.textContent='Opslaan & publiceren'}
init();
