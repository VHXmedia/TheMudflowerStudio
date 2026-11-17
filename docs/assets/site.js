(()=>{const d=document,P=window.PREVIEW,b=d.body;
addEventListener('pointermove',e=>{b.style.setProperty('--mx',e.clientX+'px');b.style.setProperty('--my',e.clientY+'px')});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target)}}),{threshold:.12});
d.querySelectorAll('.rv').forEach(x=>P?x.classList.add('on'):io.observe(x));
const im=[...d.querySelectorAll('.t img,.u img')],par=()=>im.forEach(i=>{const r=i.parentNode.getBoundingClientRect(),p=Math.max(-1,Math.min(1,(r.top+r.height/2-innerHeight/2)/innerHeight));i.style.transform=`translateY(${p*-7}%)`});
addEventListener('scroll',par,{passive:true});par();
const sg=d.querySelector('.sigil');if(sg)addEventListener('pointermove',e=>sg.style.transform=`translate(${(e.clientX/innerWidth-.5)*-26}px,${(e.clientY/innerHeight-.5)*-26}px)`);
const pk=d.createElement('img');pk.className='peek';pk.alt='';b.appendChild(pk);
d.querySelectorAll('.row').forEach(r=>{r.onmouseenter=()=>{if(r.dataset.img){pk.src=r.dataset.img;pk.classList.add('on')}};r.onmouseleave=()=>pk.classList.remove('on');r.onmousemove=e=>{pk.style.left=e.clientX+40+'px';pk.style.top=e.clientY-130+'px'}});
const ph=[...d.querySelectorAll('a.t,a.u')],lb=d.createElement('div');lb.className='lb';lb.innerHTML='<button class="x">×</button><button class="pv">‹</button><img alt=""><button class="nx">›</button>';b.appendChild(lb);
if(ph.length<2)lb.querySelectorAll('.pv,.nx').forEach(x=>x.hidden=true);
let k=0;const li=lb.querySelector('img'),show=n=>{k=(n+ph.length)%ph.length;li.src=ph[k].href;lb.classList.add('on')},hide=()=>lb.classList.remove('on');
d.addEventListener('click',e=>{const a=e.target.closest('a.t,a.u');if(a){e.preventDefault();show(ph.indexOf(a))}});
lb.onclick=e=>{const c=e.target.classList;if(c.contains('pv'))show(k-1);else if(c.contains('nx'))show(k+1);else hide()};
addEventListener('keydown',e=>{if(!lb.classList.contains('on'))return;if(e.key==='Escape')hide();if(e.key==='ArrowLeft')show(k-1);if(e.key==='ArrowRight')show(k+1)});
if(!P){d.addEventListener('click',e=>{const a=e.target.closest('a');if(!a||a.target||a.matches('.t,.u')||e.metaKey||e.ctrlKey||a.origin!==location.origin||a.pathname===location.pathname)return;e.preventDefault();b.classList.add('out');setTimeout(()=>location.href=a.href,350)});addEventListener('pageshow',()=>b.classList.remove('out'))}
})();
