# Alaska Skydive Center — website only

This repo is **only** the public Alaska Skydive Center site: **HTML + CSS** in `site/`, optional images in `public/`.  
**No MalfunctionDZ, no platform-py, no database, no Python runtime for the live site.**

## Run (VPS or laptop)

```bash
cd ASC
docker compose up -d
```

Open **http://localhost:8006/** (or `http://YOUR_SERVER_IP:8006/`).

## Images

Add photos under `public/` — see `public/README.txt`. Same filenames as your dev hero/gallery if you want it to match.

## Edit copy

- Pages: `site/*.html`
- Shared header/footer: `site/nav.html`, `site/footer.html` (included via Nginx SSI)
- Styles: `site/css/site.css`

## Domain + HTTPS

Point **dev.alaskaskydivecenter.com** at your VPS, then use host Nginx (or Caddy) to reverse-proxy to **127.0.0.1:8006** and terminate TLS. You only need this Docker container for the ASC site.

## Optional: `asc_public_site/` Python package

Unused for serving the website. Keep it only if you use it elsewhere for copy defaults.
