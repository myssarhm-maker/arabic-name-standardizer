import json
from pathlib import Path


DATA_FILE = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "names.json"
)


def load_names():
    """Load canonical Arabic names and their English variants."""

    with DATA_FILE.open("r", encoding="utf-8") as file:
        data = json.load(file)

    rules = {}

    for item in data["names"]:
        arabic = item["arabic"]
        canonical = item["canonical"]
        variants = item.get("variants", [])

        # Arabic → canonical English
        rules[arabic] = canonical

        # Also support alternative Arabic spacing
        # for names such as عبد الرحمن.
        if " " in arabic:
            rules[arabic.replace(" ", "")] = canonical

        # English variants → canonical English
        for variant in variants:
            rules[variant.lower()] = canonical

    return rules


CANONICAL_NAMES = load_names()
