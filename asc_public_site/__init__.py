"""
Alaska Skydive Center — optional public marketing plugin for MalfunctionDZ.

Kept outside the platform repo so ASC content, defaults, and Jinja fragments
live in one place (/projects/ASC).
"""

from __future__ import annotations

from asc_public_site.experience_data import BASE_EXPERIENCE_PAGES, home_experience_tiles

PUBLIC_SITE_SLUG = "alaska-skydive-center"

# Marketing JPEGs live in repo public/; ASC Nginx serves them at /site-assets/…
SITE_ASSETS_PREFIX = "/site-assets"


def default_hero_image_url() -> str:
    return f"{SITE_ASSETS_PREFIX}/hero-main.jpg"


def default_about_gallery_urls() -> list[str]:
    """About-page gallery when admin has not set branding_json.about_gallery_urls."""
    p = SITE_ASSETS_PREFIX
    return [
        f"{p}/gallery-01-tandem.jpg",
        f"{p}/gallery-04-climbout.jpg",
        f"{p}/gallery-02-landing.jpg",
        f"{p}/gallery-03-solo.jpg",
    ]


def matches_public_site(slug: str) -> bool:
    return (slug or "").strip().lower() == PUBLIC_SITE_SLUG


def default_home_stats() -> list[dict]:
    return [
        {"value": "10,500", "label": "FEET ALTITUDE"},
        {"value": "60", "label": "SECONDS FREEFALL"},
        {"value": "120", "label": "MPH TERMINAL VELOCITY"},
        {"value": "360°", "label": "ALASKA MOUNTAIN VIEWS"},
    ]


def default_hero_location_line() -> str:
    return "PALMER MUNICIPAL AIRPORT • PALMER, ALASKA"


def default_hero_subheadline() -> str:
    return "JUMP ABOVE THE CHUGACH • EXPERIENCE ALASKA FROM THE TOP"


__all__ = [
    "PUBLIC_SITE_SLUG",
    "SITE_ASSETS_PREFIX",
    "BASE_EXPERIENCE_PAGES",
    "matches_public_site",
    "default_home_stats",
    "default_hero_location_line",
    "default_hero_subheadline",
    "default_hero_image_url",
    "default_about_gallery_urls",
    "home_experience_tiles",
]
