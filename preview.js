// Toont de gebouwde site (docs/) lokaal op http://localhost:4000
const http=require('http'),fs=require('fs'),path=require('path'),{build}=require('./build');
const c=JSON.parse(fs.readFileSync(path.join(__dirname,'content','site.json')));
const bp=c.site.basePath||'';build(c);
const MIME={'.html':'text/html;charset=utf-8','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.mp4':'video/mp4','.webm':'video/webm'};
http.createServer((req,res)=>{let p=decodeURIComponent(new URL(req.url,'http://x').pathname);if(bp&&p.startsWith(bp))p=p.slice(bp.length)||'/';
  let f=path.join(__dirname,'docs',path.normalize(p).replace(/^(\.\.[\/\\])+/,''));if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');
  fs.readFile(f,(e,d)=>{if(e){res.writeHead(404);return res.end('404')}res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});res.end(d)})
}).listen(4000,'127.0.0.1',()=>console.log('Site: http://localhost:4000'+bp+'/'));
