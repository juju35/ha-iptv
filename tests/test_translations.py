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


def test_notification_texts_cover_every_language() -> None:
    """The Python-side notifications exist in every language of the integration, with the same keys."""
    from custom_components.iptv.notify_add import TEXTS
    from custom_components.iptv.notify_expiry import DATE_FORMATS, MESSAGES

    languages = {path.stem for path in TRANSLATIONS.glob("*.json")}
    for texts in (TEXTS, MESSAGES, DATE_FORMATS):
        assert set(texts) == languages
    for texts in (TEXTS, MESSAGES):
        for lang, strings in texts.items():
            assert _keys(strings) == _keys(texts["en"]), lang
