# The Mudflower Studio
Static site on GitHub Pages (folder `docs/`) plus an admin site the artist uses to manage everything herself. Clicking "Save & publish" makes the admin build the site, commit and push to GitHub, after which GitHub Pages updates itself.

## 1. GitHub (once)
1. Create a repo, upload this folder (`git init`, `git add -A`, `git commit`, `git remote add origin ...`, `git push -u origin main`).
2. Settings → Pages → Deploy from branch → `main` + folder `/docs`.
3. Create a **fine-grained token**: GitHub → Settings → Developer settings → Fine-grained tokens → only this repo → Permissions: *Contents: Read and write*. Save it (it expires after at most 1 year: set a reminder).

## 2. Passwords (on your own computer)
```
node set-password.js developer "atleast10chars"
node set-password.js artist "atleast10chars"
```
For each login you get a line `ADMIN_DEVELOPER=salt:hash` / `ADMIN_ARTIST=salt:hash`. This is only a hash, not a password.

## 3. Hosting the admin online (e.g. Render, Railway or Fly.io)
- New Web Service from your GitHub repo, runtime **Docker** (the `Dockerfile` is included).
- Environment variables:
  - `GITHUB_REPO` = `yourname/yourrepo`
  - `GITHUB_TOKEN` = the token from step 1
  - `ADMIN_DEVELOPER` and `ADMIN_ARTIST` = the lines from step 2 (only the part after the `=`)
  - `SECURE` = `1` and `TRUST_PROXY` = `1`
- **Turn off auto-deploy** (or ignore the paths `docs/**` and `content/**`), otherwise the server restarts on every publish.
- Only give the address you get (or a custom `admin.yourdomain.com`) to the artist. The public site does not link to it anywhere.
- Set the base path and Formspree address in the admin (Site/Contact tab).

## Working locally (optional)
`node preview.js` → site at http://localhost:4000. `node server.js` → admin at http://127.0.0.1:3000 (without the GITHUB_ variables it works on this folder and pushes with your own git).

## Note
- Photos/videos are only saved when you click "Save & publish". Free hosting may sleep or restart, so upload and publish in one session.
- Every login and preview runs over HTTPS thanks to the host; the passwords are never stored in readable form on the server.
