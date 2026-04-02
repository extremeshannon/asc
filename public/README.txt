These JPEGs power the standalone site at /site-assets/… (same names as MalfunctionDZ branding):

  hero-main.jpg
  gallery-01-tandem.jpg
  gallery-02-landing.jpg
  gallery-03-solo.jpg
  gallery-04-climbout.jpg

Generate them in platform-py from source PNGs:

  docker exec platform_py python scripts/process_public_site_photos.py

Then copy into this folder (from ASC repo root):

  make sync-photos
  # or: PLATFORM_PY=/path/to/platform-py bash scripts/sync_public_site_photos.sh

If a file is missing, the site falls back to gradients (no broken image icons).
