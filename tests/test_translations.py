"""Every translation has exactly the keys and placeholders of the English one."""

import json
import re
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


PLACEHOLDER = re.compile(r"\{(\w+)\}")


def _strings(data: dict, prefix: str = "") -> dict[str, str]:
    out: dict[str, str] = {}
    for key, value in data.items():
        if isinstance(value, dict):
            out |= _strings(value, f"{prefix}{key}.")
        else:
            out[prefix + key] = value
    return out


def _load(lang: str) -> dict[str, str]:
    return _strings(json.loads((TRANSLATIONS / f"{lang}.json").read_text(encoding="utf-8")))


@pytest.mark.parametrize(
    "lang",
    [
        "fr",
        "de",
        "es",
        "it",
        "nl",
        "pt",
        "pt-BR",
        "pl",
        "ro",
        "da",
        "sv",
        "bg",
        "ru",
        "uk",
        "hu",
        "ga",
        "sk",
        "cs",
        "sl",
        "mt",
        "lv",
        "el",
        "sr",
        "sr-Latn",
    ],
)
def test_translation_keys_match_english(lang: str) -> None:
    """The translation exists and has the same keys and placeholders as en.json."""
    english = _keys(json.loads((TRANSLATIONS / "en.json").read_text(encoding="utf-8")))
    other = _keys(json.loads((TRANSLATIONS / f"{lang}.json").read_text(encoding="utf-8")))
    assert other == english
    en_strings, strings = _load("en"), _load(lang)
    for key, text in en_strings.items():
        assert sorted(PLACEHOLDER.findall(strings[key])) == sorted(PLACEHOLDER.findall(text)), f"{lang}: {key}"


def test_brazilian_portuguese_is_european_portuguese() -> None:
    """pt-BR.json is an exact copy of pt.json: Brazilian Portuguese uses the European Portuguese texts."""
    assert (TRANSLATIONS / "pt-BR.json").read_bytes() == (TRANSLATIONS / "pt.json").read_bytes()


# Languages that only copy another file; the notifications resolve them to their base (pt-BR → pt)
_ALIASES = {"pt-BR"}


# Serbian Cyrillic letter by letter, then its Latin spelling (љ, њ and џ take two letters).
_SERBIAN = "аaбbвvгgдdђđеeжžзzиiјjкkлlљljмmнnњnjоoпpрrсsтtћćуuфfхhцcчčџdžшš"
_TO_LATIN = dict(re.findall(r"([а-џ])([^а-џ]+)", _SERBIAN))
_TO_LATIN |= {c.upper(): lat.capitalize() for c, lat in _TO_LATIN.items()}
# Latin text allowed in Cyrillic Serbian: placeholders, URLs, identifiers, the MAC format, brands and acronyms
_NOT_SERBIAN = re.compile(
    r"\{\w+\}|https?://\S+|\b\w+[._/]\S+|AA:BB:CC:DD:EE:FF"
    r"|\b(IPTV|URL|MAC|VOD|API|OK|Xtream|Codes|Stalker|Ministra|Home Assistant|Recorder|xtream|stalker)\b"
)


def _to_latin(text: str) -> str:
    return "".join(_TO_LATIN.get(ch, ch) for ch in text)


def test_serbian_scripts_match() -> None:
    """The Cyrillic and Latin Serbian files say the same thing, letter for letter, each in its own script."""
    cyrillic, latin = _load("sr"), _load("sr-Latn")
    for key, text in cyrillic.items():
        assert _to_latin(text) == latin[key], key
        assert not re.search(r"[A-Za-z]", _NOT_SERBIAN.sub("", text)), key
        assert not re.search(r"[\u0400-\u04ff]", latin[key]), key


def test_serbian_notification_texts_match() -> None:
    """The Python-side Serbian notifications: Latin is the Cyrillic text letter for letter."""
    from custom_components.iptv.notify_add import TEXTS
    from custom_components.iptv.notify_expiry import DATE_FORMATS, MESSAGES

    for texts in (TEXTS, MESSAGES):
        cyrillic, latin = _strings(texts["sr"]), _strings(texts["sr-Latn"])
        assert {key: _to_latin(text) for key, text in cyrillic.items()} == latin
    assert DATE_FORMATS["sr"] == DATE_FORMATS["sr-Latn"]


@pytest.mark.parametrize(
    ("language", "expected"),
    [
        ("fr-FR", "fr"),
        ("sr-Latn", "sr-Latn"),
        ("sr", "sr"),
        ("de-CH", "de"),
        ("it-IT", "it"),
        ("nl-BE", "nl"),
        ("pt", "pt"),
        ("pt-BR", "pt"),  # Brazilian Portuguese falls back to European Portuguese on purpose
        ("pl-PL", "pl"),
        ("ro", "ro"),
        ("da", "da"),
        ("sv-FI", "sv"),
        ("bg", "bg"),
        ("ru", "ru"),
        ("uk", "uk"),
        ("hu", "hu"),
        ("ga", "ga"),
        ("sk", "sk"),
        ("cs", "cs"),
        ("sl", "sl"),
        ("mt", "mt"),
        ("lv", "lv"),
        ("el-CY", "el"),
        ("ja", "en"),
        (None, "en"),
    ],
)
def test_notification_language(language: str | None, expected: str) -> None:
    """The full code when it has texts (sr-Latn), else its base, else English."""
    from custom_components.iptv.notify_add import text_language
    from custom_components.iptv.notify_expiry import message_language

    assert text_language(language) == expected
    assert message_language(language) == expected


def test_notification_texts_cover_every_language() -> None:
    """The Python-side notifications exist in every language of the integration, with the same keys."""
    from custom_components.iptv.notify_add import TEXTS
    from custom_components.iptv.notify_expiry import DATE_FORMATS, MESSAGES

    languages = {path.stem for path in TRANSLATIONS.glob("*.json")} - _ALIASES
    for texts in (TEXTS, MESSAGES, DATE_FORMATS):
        assert set(texts) == languages
    for texts in (TEXTS, MESSAGES):
        for lang, strings in texts.items():
            assert _keys(strings) == _keys(texts["en"]), lang


def test_notification_texts_have_english_placeholders() -> None:
    """Every notification text is filled in and keeps the English placeholders."""
    from custom_components.iptv.notify_add import TEXTS
    from custom_components.iptv.notify_expiry import MESSAGES

    for texts in (TEXTS, MESSAGES):
        english = _strings(texts["en"])
        for lang, strings in texts.items():
            for key, text in _strings(strings).items():
                assert text, f"{lang}: {key}"
                assert sorted(PLACEHOLDER.findall(text)) == sorted(PLACEHOLDER.findall(english[key])), f"{lang}: {key}"
