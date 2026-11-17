const fs = require('fs'), path = require('path'), { render } = require('./render');
function build(c, R = __dirname) {
  const O = path.join(R, 'docs');
  fs.rmSync(O, { recursive: true, force: true }); fs.mkdirSync(path.join(O, 'uploads'), { recursive: true });
  fs.cpSync(path.join(R, 'assets'), path.join(O, 'assets'), { recursive: true });
  c.artworks.forEach(w => [...w.photos, w.video].filter(Boolean).forEach(f => { const s = path.join(R, 'content', 'uploads', f); if (fs.existsSync(s)) fs.copyFileSync(s, path.join(O, 'uploads', f)) }));
  const put = (d, h) => { fs.mkdirSync(path.join(O, d), { recursive: true }); fs.writeFileSync(path.join(O, d, 'index.html'), h) };
  put('', render(c, 'home')); put('about', render(c, 'about')); put('contact', render(c, 'contact'));
  c.artworks.forEach(w => put('n' + w.n, render(c, 'n' + w.n))); fs.writeFileSync(path.join(O, '.nojekyll'), '');
  fs.writeFileSync(path.join(O, 'CNAME'), 'themudflowerstudio.be');
}
module.exports = { build };
if (require.main === module) { build(JSON.parse(fs.readFileSync(path.join(__dirname, 'content', 'site.json')))); console.log('docs/ gebouwd') }
