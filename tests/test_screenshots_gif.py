"""Screenshots are only rewritten when their decoded pixels changed, compared exactly (scripts/gif_frames.py).

PNG captures are byte-identical from one render to the next, and the refresh GIF is made deterministic (every
animation, shadow roots included, is paused and stepped; the palette is built from those identical frames and applied
with ordered dithering), so any pixel difference is a real change: a digit, an icon or a shade of colour.
"""

import importlib.util
import re
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
_spec = importlib.util.spec_from_file_location("gif_frames", ROOT / "scripts" / "gif_frames.py")
gif_frames = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(gif_frames)

W, H = 40, 10
FRAME = W * H * 4  # RGBA


def _frames(count=2, value=200):
    return bytearray([value]) * (FRAME * count)


def test_identical_frames_are_the_same_animation():
    assert gif_frames.same_frames(_frames(), _frames(), W, H)


def test_any_channel_difference_is_a_change():
    for index, value in ((0, 199), (FRAME + 5, 201), (len(_frames()) - 1, 0)):
        changed = _frames()
        changed[index] = value
        assert not gif_frames.same_frames(_frames(), changed, W, H)


def test_a_visible_change_is_detected():
    changed = _frames()
    changed[FRAME : FRAME + 4 * 20] = b"\x00" * 80  # 20 pixels (5 %) of the second frame
    assert not gif_frames.same_frames(_frames(), changed, W, H)


def test_a_different_frame_count_or_size_is_a_change():
    assert not gif_frames.same_frames(_frames(2), _frames(3), W, H)


needs_ffmpeg = pytest.mark.skipif(shutil.which("ffmpeg") is None, reason="ffmpeg is not installed")


def _frames_dir(path, changed_frame=None):
    """Write 10 PNG frames of a moving box (retina size), optionally with a small grey square in one frame."""
    path.mkdir()
    for i in range(10):
        box = f"drawbox=x={10 + 8 * i}:y=20:w=24:h=24:color=0x03a9f4:t=fill"
        if i == changed_frame:
            box += ",drawbox=x=150:y=60:w=6:h=6:color=0xf0f0f0:t=fill"
        subprocess.run(
            [
                *("ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", "color=c=white:s=240x120"),
                *("-vf", box, "-frames:v", "1", str(path / f"f{i:03d}.png")),
            ],
            check=True,
        )
    return path


@needs_ffmpeg
def test_the_same_frames_encode_to_the_same_gif(tmp_path):
    frames = _frames_dir(tmp_path / "frames")
    out, new = tmp_path / "refreshing.gif", tmp_path / "new.gif"
    gif_frames.encode_gif(frames, 20, 120, out)
    gif_frames.encode_gif(frames, 20, 120, new)
    assert gif_frames.replace_if_changed(new, out) is False


@needs_ffmpeg
def test_a_small_change_in_one_gif_frame_is_written(tmp_path):
    out, new = tmp_path / "refreshing.gif", tmp_path / "new.gif"
    gif_frames.encode_gif(_frames_dir(tmp_path / "a"), 20, 120, out)
    gif_frames.encode_gif(_frames_dir(tmp_path / "b", changed_frame=4), 20, 120, new)
    expected = new.read_bytes()
    assert gif_frames.replace_if_changed(new, out) is True
    assert out.read_bytes() == expected


@needs_ffmpeg
def test_replace_the_gif_when_the_animation_changed(tmp_path):
    existing = tmp_path / "refreshing.gif"
    shutil.copy(ROOT / "screenshots" / "refreshing.gif", existing)
    new = tmp_path / "new.gif"
    shutil.copy(ROOT / "screenshots" / "refreshing-dark.gif", new)
    expected = new.read_bytes()
    assert gif_frames.replace_if_changed(new, existing) is True
    assert existing.read_bytes() == expected


@needs_ffmpeg
def test_a_missing_gif_is_written(tmp_path):
    new = tmp_path / "new.gif"
    shutil.copy(ROOT / "screenshots" / "refreshing.gif", new)
    out = tmp_path / "out.gif"
    assert gif_frames.replace_if_changed(new, out) is True
    assert out.exists()


def _png(src, dst, *args):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), *args, str(dst)], check=True)


@needs_ffmpeg
def test_keep_existing_png_when_only_the_bytes_differ(tmp_path):
    existing = tmp_path / "card.png"
    shutil.copy(ROOT / "screenshots" / "card.png", existing)
    before = existing.read_bytes()
    new = tmp_path / "new.png"
    _png(existing, new, "-compression_level", "1")  # same pixels, other bytes
    assert new.read_bytes() != before
    assert gif_frames.replace_if_changed(new, existing) is False
    assert existing.read_bytes() == before


@needs_ffmpeg
def test_replace_the_png_when_its_pixels_changed(tmp_path):
    existing = tmp_path / "card.png"
    shutil.copy(ROOT / "screenshots" / "card.png", existing)
    new = tmp_path / "new.png"
    _png(existing, new, "-vf", "negate")
    expected = new.read_bytes()
    assert gif_frames.replace_if_changed(new, existing) is True
    assert existing.read_bytes() == expected


def _solid_png(dst, colour, *extra):
    subprocess.run(
        [
            *("ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", f"color=c={colour}:s=400x300"),
            *extra,
            *("-frames:v", "1", str(dst)),
        ],
        check=True,
    )


@needs_ffmpeg
@pytest.mark.parametrize(("before", "after"), [("0xffffff", "0xf0f0f0"), ("0x03a9f4", "0x0288d1")])
def test_replace_an_opaque_png_whose_colour_changed_slightly(tmp_path, before, after):
    existing, new = tmp_path / "card.png", tmp_path / "new.png"
    _solid_png(existing, before)
    _solid_png(new, after)
    expected = new.read_bytes()
    assert gif_frames.replace_if_changed(new, existing) is True
    assert existing.read_bytes() == expected


@needs_ffmpeg
@pytest.mark.parametrize("size", [(15, 23), (1, 1)])
def test_replace_the_png_when_a_small_area_changed(tmp_path, size):
    """A changed digit of the channel count (about 15 x 23 px), down to a single pixel."""
    existing = tmp_path / "card.png"
    shutil.copy(ROOT / "screenshots" / "card.png", existing)
    new = tmp_path / "new.png"
    w, h = size
    _png(existing, new, "-vf", f"drawbox=x=151:y=221:w={w}:h={h}:color=0x808080:t=fill")
    assert gif_frames.replace_if_changed(new, existing) is True


def test_screenshots_script_writes_every_png_through_the_pixel_comparison():
    source = (ROOT / "scripts" / "screenshots.py").read_text()
    # Each page.screenshot goes to a temporary file (a PNG to compare, or a GIF frame), never straight to screenshots/
    assert "path=str(out_dir" not in source
    assert len(re.findall(r"save_png\(\s*page,\s*out_dir /", source)) == 2
    assert "written = replace_if_changed(new, out)" in source.split("def save_png", 1)[1].split("def animate", 1)[0]


def test_screenshots_script_freezes_every_animation_through_the_shadow_roots():
    source = (ROOT / "scripts" / "screenshots.py").read_text()
    animate = source.split("def animate", 1)[1].split("def main", 1)[0]
    # document.getAnimations() leaves out the card's shadow root: its spinner kept turning in real time.
    assert "document.getAnimations()" not in animate
    assert "FREEZE_ANIMATIONS" in animate
    assert "encode_gif(" in animate


@pytest.mark.skipif(importlib.util.find_spec("playwright") is None, reason="playwright is not installed")
def test_freeze_animations_steps_an_animation_inside_nested_shadow_roots():
    import sys

    sys.path.insert(0, str(ROOT / "scripts"))
    try:
        import screenshots
    finally:
        sys.path.remove(str(ROOT / "scripts"))
    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        browser = p.chromium.launch()
        try:
            page = browser.new_page()
            page.set_content("<div id=host></div>")
            page.evaluate(
                """() => {
                  const outer = document.getElementById("host").attachShadow({mode: "open"});
                  outer.innerHTML = "<div id=inner></div>";
                  const inner = outer.getElementById("inner").attachShadow({mode: "open"});
                  inner.innerHTML = "<style>i{display:block;animation:spin 1s linear infinite}" +
                    "@keyframes spin{to{transform:rotate(360deg)}}</style><i></i>";
                }"""
            )
            page.evaluate(screenshots.FREEZE_ANIMATIONS, 250)
            state = page.evaluate(
                """() => {
                  const inner = document.getElementById("host").shadowRoot.getElementById("inner").shadowRoot;
                  return inner.getAnimations().map((a) => [a.playState, a.currentTime]);
                }"""
            )
        finally:
            browser.close()
    assert state == [["paused", 250]]
