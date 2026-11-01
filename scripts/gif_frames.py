"""Compare two screenshots (GIF animations frame by frame, or PNG images) by their decoded pixels, exactly, on every
channel (needs ffmpeg), and encode the refresh GIF deterministically.

The screenshots job must not commit "refreshed" files whose picture did not change, yet must rewrite them on any
real change (a digit, an icon, a shade of colour). Both hold once the renders are deterministic:
- a PNG capture is byte-identical from one render to the next;
- the GIF frames are too (scripts/screenshots.py pauses and steps every animation, shadow roots included), and
  `encode_gif` builds its palette from those identical frames and applies it with ordered (Bayer) dithering, so
  the same frames always give the same GIF.
`replace_if_changed` therefore compares the decoded RGBA pixels exactly, with no tolerance.
"""

import json
import os
import subprocess
from pathlib import Path


def _probe(path):
    """Return (width, height) of the first video stream."""
    out = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-select_streams",
            "v:0",
            "-show_entries",
            "stream=width,height",
            "-of",
            "json",
            path,
        ],
        capture_output=True,
        check=True,
        text=True,
    ).stdout
    stream = json.loads(out)["streams"][0]
    return stream["width"], stream["height"]


def decode(path):
    """Return (width, height, every frame as RGBA bytes, concatenated): all four channels are compared."""
    width, height = _probe(str(path))
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-f", "rawvideo", "-pix_fmt", "rgba", "-"],
        capture_output=True,
        check=True,
    ).stdout
    return width, height, raw


def same_frames(a, b, width, height):
    """True when two RGBA frame sequences of width x height hold exactly the same pixels."""
    size = width * height * 4
    return bool(size) and len(a) % size == 0 and a == b


def encode_gif(frame_dir, fps, width, out):
    """Encode frame_dir/f000.png, f001.png... into a looping GIF `width` px wide (the retina frames are halved).

    The palette is generated from the frames themselves (no per-run randomness) and applied with ordered dithering,
    so identical frames always give an identical GIF.
    """
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-loglevel",
            "error",
            "-framerate",
            str(fps),
            "-i",
            f"{frame_dir}/f%03d.png",
            "-vf",
            f"scale={width}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=4",
            "-loop",
            "0",
            str(out),
        ],
        check=True,
    )


def replace_if_changed(new, out):
    """Move the GIF or PNG `new` onto `out` unless `out` holds exactly the same pixels; return True when written.

    SCREENSHOTS_FORCE=1 always writes it.
    """
    new, out = Path(new), Path(out)
    if out.exists() and not os.environ.get("SCREENSHOTS_FORCE"):
        w1, h1, a = decode(out)
        w2, h2, b = decode(new)
        if (w1, h1) == (w2, h2) and same_frames(a, b, w1, h1):
            new.unlink()
            return False
    new.replace(out)
    return True
