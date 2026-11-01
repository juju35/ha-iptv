"""The refresh GIF is only rewritten when the animation really changed (scripts/gif_frames.py).

Re-rendering the same card gives slightly different anti-aliasing and palette from one run to the next; rewriting the
GIF each time made the screenshots job commit "refreshed" GIFs on every pull request.
"""

import importlib.util
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
_spec = importlib.util.spec_from_file_location("gif_frames", ROOT / "scripts" / "gif_frames.py")
gif_frames = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(gif_frames)

W, H = 40, 10
FRAME = W * H * 3


def _frames(count=2, value=200):
    return bytearray([value]) * (FRAME * count)


def test_identical_frames_are_the_same_animation():
    assert gif_frames.same_frames(_frames(), _frames(), W, H)


def test_antialiasing_noise_is_ignored():
    noisy = _frames()
    noisy[0:3] = b"\x00\x00\x00"  # one pixel far off in a 400-pixel frame...
    for i in range(30, 60):  # ...and small palette shifts
        noisy[i] = 190
    assert gif_frames.same_frames(_frames(), noisy, W, H, tolerance=0.005)


def test_a_visible_change_is_detected():
    changed = _frames()
    changed[FRAME : FRAME + 3 * 20] = b"\x00" * 60  # 20 pixels (5 %) of the second frame
    assert not gif_frames.same_frames(_frames(), changed, W, H)


def test_a_different_frame_count_or_size_is_a_change():
    assert not gif_frames.same_frames(_frames(2), _frames(3), W, H)


needs_ffmpeg = pytest.mark.skipif(shutil.which("ffmpeg") is None, reason="ffmpeg is not installed")


def _reencode(src, dst, dither):
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-loglevel",
            "error",
            "-i",
            str(src),
            "-vf",
            f"split[a][b];[a]palettegen=max_colors=120[p];[b][p]paletteuse=dither={dither}",
            "-loop",
            "0",
            str(dst),
        ],
        check=True,
    )


@needs_ffmpeg
def test_keep_existing_gif_when_only_the_encoding_noise_differs(tmp_path):
    existing = tmp_path / "refreshing.gif"
    shutil.copy(ROOT / "screenshots" / "refreshing.gif", existing)
    before = existing.read_bytes()
    new = tmp_path / "new.gif"
    _reencode(existing, new, "bayer:bayer_scale=3")
    assert new.read_bytes() != before
    assert gif_frames.replace_if_changed(new, existing) is False
    assert existing.read_bytes() == before
    assert not new.exists()


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


def test_screenshots_script_writes_every_png_through_the_pixel_comparison():
    source = (ROOT / "scripts" / "screenshots.py").read_text()
    # Each page.screenshot goes to a temporary file (a PNG to compare, or a GIF frame), never straight to screenshots/
    assert "path=str(out_dir" not in source
    assert source.count("save_png(page, out_dir /") == 2
    assert "written = replace_if_changed(new, out)" in source.split("def save_png", 1)[1].split("def animate", 1)[0]
