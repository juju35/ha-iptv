"""Every translation has exactly the keys of the English one."""

import json
from pathlib import Path

import pytest

TRANSLATIONS = Path(__file__).parents[1] / "custom_components" / "iptv" / "translations"


def _keys(data: dict, prefix: str = "") -> set[str]:
    keys = set()
    for key, value in data.items():
        keys.add(prefix + key)
        if isinstance(value, dict):
            keys |= _keys(value, f"{prefix}{key}.")
    return keys


@pytest.mark.parametrize("lang", ["fr", "de", "es"])
def test_translation_keys_match_english(lang: str) -> None:
    """The translation exists and has the same keys as en.json."""
    english = _keys(json.loads((TRANSLATIONS / "en.json").read_text(encoding="utf-8")))
    other = _keys(json.loads((TRANSLATIONS / f"{lang}.json").read_text(encoding="utf-8")))
    assert other == english
