These JPEGs power the standalone site at /site-assets/… (same names as MalfunctionDZ branding).

Docker maps this folder to /usr/share/nginx/site-assets in the container; nginx uses
`root /usr/share/nginx` for /site-assets/ so URLs resolve to files here (not under html/).

  hero-main.jpg
  gallery-01-tandem.jpg
  gallery-02-landing.jpg
  gallery-03-solo.jpg
  gallery-04-climbout.jpg
  team-franzi.jpg   (Franzi — /about team thumb + /team/franzi profile)
  team-{slug}.jpg   (optional — same slug as /team/{slug}; list falls back to initials if missing)

Generate them in platform-py from source PNGs:

  docker exec platform_py python scripts/process_public_site_photos.py

Then copy into this folder (from ASC repo root):

  make sync-photos
  # or: PLATFORM_PY=/path/to/platform-py bash scripts/sync_public_site_photos.sh

If a file is missing, the site falls back to gradients (no broken image icons).
