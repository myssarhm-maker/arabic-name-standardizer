import re

from .rules import CANONICAL_NAMES


class NameStandardizer:
    """Standardize Arabic names and English spelling variants."""

    def __init__(self, rules=None):
        self.rules = rules or CANONICAL_NAMES

    @staticmethod
    def normalize_text(text: str) -> str:
        """Normalize spaces and Arabic diacritics."""
        text = text.strip()
        text = re.sub(r"\s+", " ", text)

        # Remove Arabic diacritics.
        text = re.sub(r"[\u064B-\u065F\u0670]", "", text)

        return text

    def standardize_token(self, token: str) -> str | None:
        """Return the canonical English spelling for one token."""

        token = self.normalize_text(token)

        # Arabic is kept as-is.
        # English is normalized to lowercase for lookup.
        lookup = token if any("\u0600" <= char <= "\u06FF" for char in token) else token.lower()

        return self.rules.get(lookup)

    def standardize(self, name: str) -> dict:
        """
        Standardize an Arabic or English name.

        Returns:
            input: Original input.
            standardized: Canonical English result.
            unknown: Unrecognized tokens.
            matched: True if all tokens were recognized.
        """

        normalized = self.normalize_text(name)

        if not normalized:
            return {
                "input": name,
                "standardized": "",
                "unknown": [],
                "matched": False,
            }

        # Check complete name first.
        exact = self.standardize_token(normalized)

        if exact:
            return {
                "input": name,
                "standardized": exact,
                "unknown": [],
                "matched": True,
            }

        tokens = normalized.split(" ")

        output = []
        unknown = []

        for token in tokens:
            english = self.standardize_token(token)

            if english:
                output.append(english)
            else:
                output.append(token)
                unknown.append(token)

        return {
            "input": name,
            "standardized": " ".join(output),
            "unknown": unknown,
            "matched": len(unknown) == 0,
        }
