"""
Alaska Skydive Center — optional public marketing plugin for MalfunctionDZ.

Kept outside the platform repo so ASC content, defaults, and Jinja fragments
live in one place (/projects/ASC).
"""

from __future__ import annotations

from asc_public_site.experience_data import BASE_EXPERIENCE_PAGES, home_experience_tiles

PUBLIC_SITE_SLUG = "alaska-skydive-center"


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
    "BASE_EXPERIENCE_PAGES",
    "matches_public_site",
    "default_home_stats",
    "default_hero_location_line",
    "default_hero_subheadline",
    "home_experience_tiles",
]
