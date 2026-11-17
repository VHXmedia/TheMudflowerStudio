// Lokale admin: bewerken, preview, bouwen en git push. Luistert enkel op 127.0.0.1.
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto'),{execFile,execFileSync}=require('child_process');
const {render}=require('./render'),{build}=require('./build');
const os=require('os'),R=__dirname,E=process.env,PORT=E.PORT||3000,TOKEN=E.GITHUB_TOKEN,W=E.GITHUB_REPO?path.join(os.tmpdir(),'site'):R;
const CF=path.join(W,'content','site.json'),UP=path.join(W,'content','uploads');
// Online-modus: de repo wordt bij het opstarten van GitHub gehaald (GITHUB_REPO=gebruiker/repo + GITHUB_TOKEN)
if(E.GITHUB_REPO){if(!TOKEN){console.error('GITHUB_TOKEN ontbreekt');process.exit(1)}
  if(!fs.existsSync(path.join(W,'.git'))){try{execFileSync('git',['clone','--depth','50',`https://x-access-token:${TOKEN}@github.com/${E.GITHUB_REPO}.git`,W],{stdio:'pipe'})}catch(e){console.error('Clone mislukt:',String(e.stderr||e.message).split(TOKEN).join('***'));process.exit(1)}}
  execFileSync('git',['config','user.name','Mudflower Admin'],{cwd:W});execFileSync('git',['config','user.email','admin@users.noreply.github.com'],{cwd:W});fs.mkdirSync(UP,{recursive:true})}
const MIME={'.html':'text/html;charset=utf-8','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.mp4':'video/mp4','.webm':'video/webm','.mov':'video/quicktime'};
const sessions=new Map(),fails=new Map();
const load=()=>JSON.parse(fs.readFileSync(CF));
const json=(res,c,o)=>{res.writeHead(c,{'Content-Type':'application/json'});res.end(JSON.stringify(o))};
const body=req=>new Promise((ok,no)=>{let b='';req.on('data',c=>{b+=c;if(b.length>5e6){req.destroy();no()}});req.on('end',()=>{try{ok(JSON.parse(b||'{}'))}catch{no()}})});
const cookie=r=>Object.fromEntries((r.headers.cookie||'').split(';').map(c=>c.trim().split('=')).filter(c=>c[0]));
function checkPw(role,pw){let u;const ev=E['ADMIN_'+role.toUpperCase()];if(ev){const[s,h]=ev.split(':');u={salt:s,hash:h}}else{try{u=JSON.parse(fs.readFileSync(path.join(R,'data','users.json')))[role]}catch{}}if(!u)return false;
  return crypto.timingSafeEqual(crypto.scryptSync(pw,Buffer.from(u.salt,'hex'),64),Buffer.from(u.hash,'hex'))}
function clean(c){const f=/^[\w.-]+$/,s=x=>String(x??'');if(!c||!c.site||!c.home||!c.about||!c.contact||!Array.isArray(c.artworks))throw 0;
  c.site.basePath=/^(\/[\w.-]+)?$/.test(c.site.basePath||'')?c.site.basePath||'':'';
  c.artworks=c.artworks.map(w=>({n:+w.n,title:s(w.title),medium:s(w.medium),size:s(w.size),year:s(w.year),price:Number(w.price)||0,status:w.status==='sold'?'sold':'available',description:s(w.description),photos:(w.photos||[]).filter(p=>f.test(p)),video:f.test(w.video||'')?w.video:null,videoTitle:s(w.videoTitle).slice(0,80)})).sort((a,b)=>a.n-b.n);return c}
const git=(...a)=>new Promise(r=>execFile('git',a,{cwd:W},(e,o,er)=>r({ok:!e,out:(TOKEN?(o+er).split(TOKEN).join('***'):o+er).trim()})));
async function publish(msg){let log='';for(const a of [['add','-A'],['commit','-m',msg],['pull','--rebase'],['push']]){const r=await git(...a);log+=`$ git ${a[0]}\n${r.out}\n`;
  if(!r.ok&&a[0]!=='pull'&&!(a[0]==='commit'&&/nothing to commit/.test(r.out)))return{ok:false,log}}return{ok:true,log}}
function file(req,res,f){fs.stat(f,(e,s)=>{if(e||!s.isFile()){res.writeHead(404);return res.end('404')}
  const o={'Cache-Control':'no-store','Content-Type':MIME[path.extname(f).toLowerCase()]||'application/octet-stream','Accept-Ranges':'bytes'},m=/bytes=(\d*)-(\d*)/.exec(req.headers.range||'');
  if(m){const a=m[1]?+m[1]:0,b=m[2]?Math.min(+m[2],s.size-1):s.size-1;if(a>b||a>=s.size){res.writeHead(416);return res.end()}
    res.writeHead(206,{...o,'Content-Range':`bytes ${a}-${b}/${s.size}`,'Content-Length':b-a+1});return fs.createReadStream(f,{start:a,end:b}).pipe(res)}
  res.writeHead(200,{...o,'Content-Length':s.size});fs.createReadStream(f).pipe(res)})}

http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Robots-Tag','noindex');res.setHeader('X-Frame-Options','SAMEORIGIN');
  const url=new URL(req.url,'http://x'),p=url.pathname,ip=(E.TRUST_PROXY&&req.headers['x-forwarded-for']||req.socket.remoteAddress).split(',')[0].trim(),s=sessions.get(cookie(req).sid),ok=s&&s.exp>Date.now();
  try{
  if(p==='/api/login'&&req.method==='POST'){const f=fails.get(ip)||{c:0,u:0};if(f.c>=5&&f.u>Date.now())return json(res,429,{error:'Te veel pogingen, probeer later opnieuw.'});
    const d=await body(req);if(!['developer','artist'].includes(d.user)||!checkPw(d.user,String(d.password||''))){fails.set(ip,{c:f.c+1,u:Date.now()+9e5});return json(res,401,{error:'Ongeldige login.'})}
    fails.delete(ip);const sid=crypto.randomBytes(32).toString('hex');sessions.set(sid,{role:d.user,exp:Date.now()+288e5});
    res.setHeader('Set-Cookie',`sid=${sid}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${E.SECURE?'; Secure':''}`);return json(res,200,{role:d.user})}
  if(p.startsWith('/api/')){
    if(!ok||req.headers['x-requested-with']!=='mf')return json(res,401,{error:'Niet ingelogd'});
    if(p==='/api/me')return json(res,200,{role:s.role});
    if(p==='/api/logout'){sessions.delete(cookie(req).sid);return json(res,200,{})}
    if(p==='/api/content'){await git('pull','--ff-only');return json(res,200,load())}
    if(p==='/api/upload'){const ext=(url.searchParams.get('ext')||'').toLowerCase();if(!/^(jpg|png|webp|mp4|webm|mov)$/.test(ext))return json(res,400,{error:'Type niet toegestaan'});
      const name=crypto.randomBytes(6).toString('hex')+'.'+ext,fp=path.join(UP,name),ws=fs.createWriteStream(fp);let n=0,bad=false;
      req.on('data',c=>{n+=c.length;if(n>1e8&&!bad){bad=true;req.unpipe(ws);ws.destroy();fs.unlink(fp,()=>{});json(res,413,{error:'Max. 100 MB (GitHub-limiet)'})}});
      req.pipe(ws);ws.on('finish',()=>{if(!bad)json(res,200,{name})});return}
    if(p==='/api/preview'){const d=await body(req);res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});return res.end(render(clean(d.content),String(d.page||'home'),{base:'',preview:true}))}
    if(p==='/api/publish'){const d=await body(req),c=clean(d.content);fs.writeFileSync(CF,JSON.stringify(c,null,2));build(c,W);return json(res,200,await publish('Update via admin ('+s.role+')'))}
    return json(res,404,{});
  }
  if(p==='/')return file(req,res,path.join(R,'admin','index.html'));
  if(p==='/admin.js'||p==='/admin.css')return file(req,res,path.join(R,'admin',path.basename(p)));
  if(p.startsWith('/assets/'))return file(req,res,path.join(W,'assets',path.basename(p)));
  if(p.startsWith('/uploads/')){if(!ok){res.writeHead(401);return res.end()}return file(req,res,path.join(UP,path.basename(p)))}
  res.writeHead(404);res.end('404');
  }catch{if(!res.headersSent)json(res,400,{error:'Ongeldige aanvraag'})}
}).listen(PORT,E.HOST||'127.0.0.1',()=>console.log('Admin draait op poort '+PORT+(E.GITHUB_REPO?' (online-modus)':': open http://127.0.0.1:'+PORT)));
