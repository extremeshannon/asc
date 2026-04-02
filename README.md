# ASC — Alaska Skydive Center public website

**Separate website from a visitor’s perspective:** its own origin in dev (`http://localhost:8006/`), navigation as `/about`, `/prices`, `/booking`, etc. — not `/dz/{slug}/…`. Nginx here sends `X-Asc-Public-Site` so the API rewrites public links accordingly; hitting the API on **:8000** without that header is unchanged (canonical `/dz/…` URLs).

This repo is not the MalfunctionDZ admin app. It holds the ASC **marketing** layer: Nginx front, optional static files under `public/` → `/site-assets/…`, and the `asc_public_site` Python package mounted into `platform_py` for copy and Jinja fragments.

## What lives here

| Path | Purpose |
|------|---------|
| `asc_public_site/` | Python plugin (defaults, experience copy, Jinja hero/about fragments) — loaded by `platform_py` via `PYTHONPATH` |
| `deploy/nginx/asc-public-site.conf` | Nginx: maps `/` → `/dz/alaska-skydive-center/…` and sets `X-Asc-Public-Site` for clean links |
| `public/` | Optional static files at `https://yoursite/site-assets/…` (logos, PDFs) |

Admin, manifest, bookings backend, and database stay in **MalfunctionDZ** (`platform` repo).

## Local URLs

| URL | What |
|-----|------|
| **http://localhost:8006/** | ASC public site (this compose file) |
| **http://localhost:8000/** | Full MalfunctionDZ app (admin, `/dz/...` canonical URLs) |

## Run locally

1. **Layout**

   ```text
   projects/
     platform/     ← clone MalfunctionDZ (contains platform-py/)
     ASC/          ← this repo
   ```

2. **Create network** (once):  
   `docker network create platform_platform`  
   (Skip if it already exists.)

3. **Start API + DB** (mounts this repo for `asc_public_site`):  

   ```bash
   cd ../platform/platform-py
   docker compose up -d
   ```

   If the API was started before ASC existed:  
   `docker compose up -d --force-recreate api`

4. **Start ASC Nginx** (port **8006**):  

   ```bash
   cd ../ASC
   docker compose up -d
   ```

5. Open **http://localhost:8006/**

6. **Verify the plugin** (optional):  
   `bash scripts/verify_platform.sh`

### Custom paths

- **`platform-py/.env`**: `ASC_REPO_PATH=/absolute/path/to/ASC` if the default `../../ASC` bind mount is wrong.
- **`deploy/nginx/asc-public-site.conf`**: change `set $asc_slug …` if the dropzone slug is not `alaska-skydive-center`.

### Disable ASC branding in the API

Set **`ASC_PUBLIC_SITE_DISABLE=1`** in the API environment — generic marketing defaults apply even if this repo is mounted.

## VPS

- Run `platform_py` and attach this Nginx container to the **same Docker network**, using `deploy/nginx/asc-public-site.conf` (adjust `server_name`, TLS, and `$asc_slug`).
- Put TLS on Nginx; proxy to `platform_py:8000`.

## Legacy

Older docs mentioned port 8095; the standalone public site now uses **8006** only.
