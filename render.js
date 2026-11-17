const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paras=s=>String(s||'').split(/\n\s*\n/).filter(x=>x.trim()).map(p=>`<p>${esc(p.trim()).replace(/\n/g,'<br>')}</p>`).join('');
const stat=w=>w.status==='sold'?'Verkocht':'€ '+esc(w.price);
const ORN='<svg class="orn" viewBox="0 0 20 90"><path d="M10 0V30M10 30l5 11-5 11-5-11zM10 52V90"/></svg>';
function render(c,page,o={}){
  const S=c.site,A=c.artworks,B=o.base??S.basePath??'',w=A.find(x=>'n'+x.n===page);
  let t=S.name,b;
  if(w){t='N°'+w.n+' — '+w.title;const i=A.indexOf(w),pv=A[i-1],nx=A[i+1];
    const P=w.photos,tile=(p,i,c)=>`<a class="${c}" href="${B}/uploads/${esc(p)}"><img src="${B}/uploads/${esc(p)}" alt="${esc(w.title)} — ${i+1}" loading="lazy"></a>`,
    cap=w.videoTitle?`<span class="cap">${esc(w.videoTitle)}</span>`:'',
    vid=w.video?`<video src="${B}/uploads/${esc(w.video)}" muted loop playsinline autoplay disablepictureinpicture disableremoteplayback controlslist="nodownload noremoteplayback" oncontextmenu="return false"></video>`:'',
    grid=(l,o)=>l.length?`<section class="grid">${l.map((p,k)=>tile(p,o+k,'t')).join('')}</section>`:'';
    let gal;
    if(w.video&&P.length>=4){const a=Math.ceil((P.length-4)/2);gal=grid(P.slice(0,a),0)+`<section class="vb">${['p1','p2','p3','p4'].map((c,k)=>tile(P[a+k],a+k,'u '+c)).join('')}<div class="u v">${vid}${cap}</div></section>`+grid(P.slice(a+4),a+4)}
    else gal=grid(P,0)+(w.video?`<section class="film rv"><div class="v1">${vid}</div>${w.videoTitle?`<p>${esc(w.videoTitle)}</p>`:''}</section>`:'');

    b=`<section class="hd"><span class="big rv">N°${w.n}</span><div class="meta rv"><h1>${esc(w.title)}</h1><p class="sub">${[w.medium,w.size,w.year].filter(Boolean).map(esc).join(' · ')}</p><p class="price">${stat(w)}</p>${w.status==='sold'?'':`<a class="btn" href="${B}/contact/?werk=${encodeURIComponent('N°'+w.n)}">Interesse — neem contact op</a>`}</div></section>${ORN}<section class="desc rv">${paras(w.description)}</section>
${gal}
<nav class="pn"><a href="${pv?B+'/n'+pv.n+'/':'#'}" ${pv?'':'class="off"'}>← ${pv?'N°'+pv.n:''}</a><a href="${B}/">Collectie</a><a href="${nx?B+'/n'+nx.n+'/':'#'}" ${nx?'':'class="off"'}>${nx?'N°'+nx.n:''} →</a></nav>`;
  }else if(page==='about'){t='About — '+S.name;
    b=`<section class="ab"><h1 class="rv">${esc(c.about.title)}</h1>${ORN}<div class="rv">${paras(c.about.text)}<p class="note">${esc(c.about.note)}</p></div></section>`;
  }else if(page==='contact'){t='Contact — '+S.name;
    b=`<section class="ct"><h1 class="rv">${esc(c.contact.title)}</h1><div class="rv">${paras(c.contact.intro)}<form id="f" action="${esc(c.contact.formAction)}" method="POST"><input name="name" placeholder="Naam" required><input name="email" type="email" placeholder="E-mail" required><input name="werk" id="werk" placeholder="Werk (optioneel)"><textarea name="message" rows="5" placeholder="Bericht" required></textarea><input name="_gotcha" class="hp" tabindex="-1" autocomplete="off"><button>${esc(c.contact.button)}</button><p id="s"></p></form></div></section>
<script>werk.value=new URLSearchParams(location.search).get('werk')||'';f.onsubmit=async e=>{e.preventDefault();try{const r=await fetch(f.action,{method:'POST',body:new FormData(f),headers:{Accept:'application/json'}});s.textContent=r.ok?'Bedankt — je bericht is verstuurd.':'Er ging iets mis, probeer later opnieuw.';if(r.ok)f.reset()}catch{s.textContent='Er ging iets mis, probeer later opnieuw.'}}</script>`;
  }else{
    b=`<section class="intro"><i class="vline"></i><div class="sigil"><img src="${B}/assets/logo.jpg" alt="${esc(S.name)}"></div><p class="tag">${esc(c.home.tagline)}</p></section>
<section class="statement rv">${paras(c.home.intro)}</section>
<section class="index"><h2 class="lbl rv">Collectie</h2>${A.map(w=>`<a class="row rv" href="${B}/n${w.n}/" data-img="${w.photos[0]?B+'/uploads/'+esc(w.photos[0]):''}"><span class="no">N°${w.n}</span><span class="tt">${esc(w.title)}</span><span class="st">${stat(w)}</span></a>`).join('')}<p class="soon rv">N°${Math.max(0,...A.map(x=>x.n))+1} — in wording</p></section>`;}
  return `<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(t)}</title><meta name="description" content="${esc(c.home.tagline)}"><link rel="icon" href="${B}/assets/logo.jpg"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Inter:wght@300;400&display=swap" rel="stylesheet"><link rel="stylesheet" href="${B}/assets/style.css"><noscript><style>.rv{opacity:1!important;transform:none!important}</style></noscript>${o.preview?'<script>window.PREVIEW=1;addEventListener("click",e=>{if(e.target.closest("a"))e.preventDefault()},true)</script>':''}</head><body><header><a class="brand" href="${B}/">${esc(S.name)}</a><nav><a href="${B}/about/" class="${page==='about'?'act':''}">About</a>${A.map(x=>`<a href="${B}/n${x.n}/" class="${'n'+x.n===page?'act':''}">N°${x.n}</a>`).join('')}<a href="${B}/contact/" class="${page==='contact'?'act':''}">Contact</a></nav></header><main>${b}</main><footer>${ORN.replace('class="orn"','class="orn s"')}<p>© ${new Date().getFullYear()} ${esc(S.name)}</p><p>${esc(S.footer)}</p></footer><script src="${B}/assets/site.js"></script></body></html>`;
}
module.exports={render};
