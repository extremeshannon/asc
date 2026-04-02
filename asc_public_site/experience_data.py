"""ASC-specific experience page defaults and home tile row."""

from __future__ import annotations

# Image URLs are served by ASC Nginx from this repo’s public/ → /site-assets/ (not platform uploads/).
_SITE = "/site-assets"

# Same keys as platform EXPERIENCE_ORDER; copy and paths are ASC-only.
BASE_EXPERIENCE_PAGES: dict[str, dict] = {
    "freefall": {
        "title": "Freefall",
        "hero_eyebrow": "Tandem skydiving",
        "lead": "Up to a minute of pure adrenaline with Alaska spread out below you.",
        "paragraphs": [
            "Exit the aircraft with your USPA-rated tandem instructor and accelerate into freefall. "
            "At Alaska Skydive Center you will feel the rush of the wind, hear the roar of the slipstream, "
            "and see the Chugach and the valley in a way only jumpers get to.",
            "Your instructor handles deployment timing and body position; you get to soak in every second. "
            "When the parachute opens, the ride shifts from fast and loud to calm and scenic — "
            "but the freefall chapter is the one guests talk about for years.",
        ],
        "hero_image": f"{_SITE}/gallery-01-tandem.jpg",
    },
    "tandem-exit": {
        "title": "Door exit",
        "hero_eyebrow": "The moment before flight",
        "lead": "Knees in the breeze, heart in your throat — then you go.",
        "paragraphs": [
            "The door opens and the world tilts into blue sky and green earth. "
            "You and your instructor set up on the step, check handles and altitude, "
            "and when it is go-time you leave the plane together.",
            "We brief every tandem guest on arch, hand placement, and what to expect from climb-out through exit. "
            "Safety and clear communication come first; the epic view from the door is a close second.",
        ],
        "hero_image": f"{_SITE}/gallery-04-climbout.jpg",
    },
    "canopy-ride": {
        "title": "Canopy ride",
        "hero_eyebrow": "Under parachute",
        "lead": "Quiet air, big views, and a soft finish on the grass.",
        "paragraphs": [
            "After freefall, the canopy ride is your chance to breathe, steer (if conditions allow), "
            "and take in the Mat-Su from a slower, peaceful vantage point.",
            "Your instructor flies a predictable pattern toward our landing area. "
            "We coach lift your legs for landing so you finish standing or sliding in gently — "
            "then it is high-fives, photos, and the grin that does not quit.",
        ],
        "hero_image": f"{_SITE}/gallery-02-landing.jpg",
    },
    "learn-to-skydive": {
        "title": "Learn to skydive",
        "hero_eyebrow": "Your own parachute",
        "lead": "AFF progression, coaching, and a community that wants you to succeed.",
        "paragraphs": [
            "Ready to jump on your own? Our Accelerated Freefall (AFF) program pairs you with instructors "
            "in freefall while you learn stability, awareness, and emergency procedures on every jump.",
            "Between jumps you will study, debrief video, and pack skills with coaches who know Alaska skies. "
            "Licensed fun jumpers are part of the same family — loads, mentoring, and scenery that never gets old.",
            "Start with a tandem if you are unsure, or talk to our team about scheduling your first AFF ground school. "
            "We will map a path that fits your schedule and goals.",
        ],
        "hero_image": f"{_SITE}/gallery-03-solo.jpg",
    },
}


def home_experience_tiles(dz_slug: str) -> list[dict]:
    """Home band: L→R freefall, door exit, canopy ride, learn to skydive."""
    base = _SITE
    rows = [
        (f"{base}/gallery-01-tandem.jpg", "FREEFALL", "freefall"),
        (f"{base}/gallery-04-climbout.jpg", "DOOR EXIT", "tandem-exit"),
        (f"{base}/gallery-02-landing.jpg", "CANOPY RIDE", "canopy-ride"),
        (f"{base}/gallery-03-solo.jpg", "LEARN TO SKYDIVE", "asp"),
    ]
    return [
        {"url": url, "caption": cap, "href": f"/dz/{dz_slug}/{path}"}
        for url, cap, path in rows
    ]
