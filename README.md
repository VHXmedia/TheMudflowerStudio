# The Mudflower Studio
Statische site op GitHub Pages (map `docs/`) + een admin-website waarmee de kunstenares alles zelf aanpast. Bij "Opslaan & publiceren" bouwt de admin de site, commit en pusht naar GitHub, waarna GitHub Pages zichzelf bijwerkt.

## 1. GitHub (eenmalig)
1. Maak een repo, upload deze map (`git init`, `git add -A`, `git commit`, `git remote add origin ...`, `git push -u origin main`).
2. Settings → Pages → Deploy from branch → `main` + map `/docs`.
3. Maak een **fine-grained token**: GitHub → Settings → Developer settings → Fine-grained tokens → enkel deze repo → Permissions: *Contents: Read and write*. Bewaar hem (verloopt na max. 1 jaar: zet een herinnering).

## 2. Wachtwoorden (op je eigen computer)
```
node set-password.js developer "minstens10tekens"
node set-password.js artist "minstens10tekens"
```
Je krijgt per login een regel `ADMIN_DEVELOPER=salt:hash` / `ADMIN_ARTIST=salt:hash`. Dat is enkel een hash, geen wachtwoord.

## 3. Admin online zetten (bv. Render, Railway of Fly.io)
- Nieuwe Web Service vanaf je GitHub-repo, runtime **Docker** (de `Dockerfile` zit erbij).
- Omgevingsvariabelen:
  - `GITHUB_REPO` = `jouwnaam/jouwrepo`
  - `GITHUB_TOKEN` = het token uit stap 1
  - `ADMIN_DEVELOPER` en `ADMIN_ARTIST` = de regels uit stap 2 (enkel het deel na het `=`)
  - `SECURE` = `1` en `TRUST_PROXY` = `1`
- **Zet auto-deploy uit** (of negeer de paden `docs/**` en `content/**`), anders herstart de server bij elke publicatie.
- Het adres dat je krijgt (of een eigen `admin.jouwdomein.be`) geef je enkel aan de kunstenares. De publieke site linkt er nergens naar.
- Basepath en Formspree-adres stel je in via de admin (tab Site/Contact).

## Lokaal werken (optioneel)
`node preview.js` → site op http://localhost:4000. `node server.js` → admin op http://127.0.0.1:3000 (zonder de GITHUB_-variabelen werkt hij op deze map en pusht met je eigen git).

## Let op
- Foto's/video's worden pas bewaard bij "Opslaan & publiceren". Gratis hosting slaapt of herstart soms: upload en publiceer dus in één sessie.
- Elke login en preview draait op HTTPS dankzij de host; de wachtwoorden staan nooit leesbaar op de server.
