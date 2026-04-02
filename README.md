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

## Local development (Docker)

From `platform-py`, `docker-compose.yml` mounts this repo at `/opt/asc` and sets `PYTHONPATH=/app:/opt/asc` so `import asc_public_site` succeeds without a pip install.

## VPS / production

Either:

- Mount or copy this tree on the server and add its parent directory to `PYTHONPATH` (same as compose), or  
- `pip install -e /path/to/ASC` inside the API image or container.

Do not merge ASC-specific templates or copy into the platform repo if you want a clean separation for Cursor and deploys.
