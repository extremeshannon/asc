# Alaska Skydive Center — website only

This repo is **only** the public Alaska Skydive Center site: **HTML + CSS** in `site/`, images in **`public/`** (served at `/site-assets/…`).  
**No MalfunctionDZ, no platform-py, no database, no Python runtime for the live site.**

## Run (VPS or laptop)

```bash
cd ASC
docker compose up -d
```

Open **http://localhost:8006/** (or `http://YOUR_SERVER_IP:8006/`).

## Images

JPEGs live in **`public/`** and are **git-tracked** so deploys include them. URLs are always **`/site-assets/filename.jpg`** (never `platform-py/uploads/` for these):

| File | Typical use |
|------|-------------|
| `hero-main.jpg` | Home hero |
| `gallery-01-tandem.jpg` | Tandem / freefall tile |
| `gallery-02-landing.jpg` | Landing / canopy tile |
| `gallery-03-solo.jpg` | Training / ASP tile |
| `gallery-04-climbout.jpg` | Door exit tile |

To regenerate from source PNGs in platform-py, run `process_public_site_photos.py`, then from this repo: **`make sync-photos`** (see `public/README.txt`).

## Edit copy

- Pages: `site/*.html`
- Shared header/footer: `site/nav.html`, `site/footer.html` (included via Nginx SSI)
- Styles: `site/css/site.css`

Contact, pricing, team, and homepage blurbs are synced from the public content on [alaskaskydivecenter.com](https://www.alaskaskydivecenter.com) (verify rates and hours when they change).

## Domain + HTTPS

Point **dev.alaskaskydivecenter.com** at your VPS, then use host Nginx (or Caddy) to reverse-proxy to **127.0.0.1:8006** and terminate TLS. You only need this Docker container for the ASC site.

## Optional: `asc_public_site/` Python package

Unused for serving this standalone site. If you use it with MalfunctionDZ elsewhere, marketing image paths there use the same **`/site-assets/…`** URLs so files stay in this repo’s `public/`.
