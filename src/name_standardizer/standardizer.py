import re

from .rules import CANONICAL_NAMES


class NameStandardizer:
    """Convert Arabic personal names to approved canonical English spellings."""

    def __init__(self, rules=None):
        self.rules = rules or CANONICAL_NAMES

    @staticmethod
    def normalize_arabic(text: str) -> str:
        """Normalize spaces and remove Arabic diacritics."""
        text = text.strip()
        text = re.sub(r"\s+", " ", text)

        # Remove Arabic diacritics (Tashkeel).
        text = re.sub(r"[\u064B-\u065F\u0670]", "", text)

        return text

    def standardize_token(self, token: str) -> str | None:
        """Return the canonical English spelling for one Arabic token."""
        token = self.normalize_arabic(token)
        return self.rules.get(token)

    def standardize(self, name: str) -> dict:
        """
        Standardize an Arabic name.

        Returns:
            input: Original input.
            standardized: Canonical English result.
            unknown: Arabic tokens not found in the dictionary.
            matched: True when every token was recognized.
        """
        normalized = self.normalize_arabic(name)

        if not normalized:
            return {
                "input": name,
                "standardized": "",
                "unknown": [],
                "matched": False,
            }

        # First check the complete name.
        # This is important for compound names.
        exact = self.rules.get(normalized)

        if exact:
            return {
                "input": name,
                "standardized": exact,
                "unknown": [],
                "matched": True,
            }

        # If the complete name was not found,
        # process each part separately.
        tokens = normalized.split(" ")

        output = []
        unknown = []

        for token in tokens:
            english = self.rules.get(token)

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
