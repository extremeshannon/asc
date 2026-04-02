# ASC — Alaska Skydive Center public site

This folder is **not** part of the MalfunctionDZ `platform` repository. It is a small **optional Python package** that the platform loads when present on `PYTHONPATH` (or installed with `pip install -e .`).

It contains:

- Default copy and image paths for `/dz/alaska-skydive-center` experience pages
- Home hero tiles, default stats row, and default hero taglines
- Jinja fragments for the stacked “ALASKA SKYDIVE CENTER” hero and About-page sections

## How the platform uses it

1. The dropzone row must use slug `alaska-skydive-center` (your database / migrations).
2. The `asc_public_site` package must be importable (see below).
3. To **disable** ASC branding even if the package is installed: set env `ASC_PUBLIC_SITE_DISABLE=1`.

If the package is **not** installed, that slug still works: you get **generic** MalfunctionDZ marketing defaults (neutral copy, configurable galleries in Admin).

## Local development (Docker + Nginx)

ASC is a Python package consumed by **platform-py** (FastAPI). The main MalfunctionDZ **platform** stack runs Nginx and proxies to `platform_py:8000` when using `docker/nginx/default.conf` there.

### Layout

Keep this repo as a **sibling** of `platform` (same as today), for example:

- `~/projects/platform/` — PHP + MySQL + Nginx (`docker compose` → port **8080**)
- `~/projects/platform/platform-py/` — FastAPI + Postgres (port **8000**)
- `~/projects/ASC/` — this repo

### 1. Start the platform networks and services

From `platform/`:

```bash
docker compose up -d
```

From `platform/platform-py/`:

```bash
docker compose up -d
```

`platform-py` mounts ASC at `/opt/asc` and sets `PYTHONPATH=/app:/opt/asc` so `import asc_public_site` works without `pip install`.

Override the mount if ASC is not at `../../ASC` (typical on a VPS):

```bash
export ASC_REPO_PATH=/absolute/path/to/ASC
docker compose up -d
```

See `deploy/env.example`.

### 2. Optional: Nginx only from this repo

If you want an extra Nginx on **8095** (same proxy rules as the main platform front), from **this** repo:

```bash
docker compose up -d
```

Open [http://localhost:8095](http://localhost:8095). Requires the external Docker network `platform_platform` (created when the main `platform` stack is up).

Config file: `deploy/nginx/default.conf` — copy or mount the same file on your VPS Nginx container or host Nginx.

## VPS / production

Either:

- Clone ASC on the server, set `ASC_REPO_PATH` to that absolute path, and keep the same `platform-py` volume mount, or  
- `pip install -e /path/to/ASC` inside the API image or container and omit the `/opt/asc` bind mount.

Do not merge ASC-specific templates or copy into the platform repo if you want a clean separation for Cursor and deploys.
