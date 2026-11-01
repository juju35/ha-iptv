"""Compare two screenshots (GIF animations frame by frame, or PNG images) by their decoded pixels, ignoring the noise
of a re-render (needs ffmpeg).

Rendering the same card twice gives a few pixels of different anti-aliasing on the spinning icon, and a per-clip
palette then shifts a little: the GIF bytes change although nothing visible did; PNG bytes can change the same way.
`replace_if_changed` only writes the new file when the picture really changed, so the screenshots job does not commit
"refreshed" screenshots on every run.
"""

import json
import os
import subprocess
from pathlib import Path

# A colour channel counts as changed beyond this difference (0-255): palette and dithering shifts stay below it.
DELTA = 48
# Share of changed channel values allowed per frame: re-render noise measured on refreshing.gif stays below 0.07 %.
TOLERANCE = 0.002


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
    """Return (width, height, every frame as RGB24 bytes, concatenated)."""
    width, height = _probe(str(path))
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        capture_output=True,
        check=True,
    ).stdout
    return width, height, raw


def same_frames(a, b, width, height, *, delta=DELTA, tolerance=TOLERANCE):
    """True when two RGB24 frame sequences of width x height show the same animation, give or take render noise."""
    size = width * height * 3
    if len(a) != len(b) or not size or len(a) % size:
        return False
    limit = tolerance * size
    for start in range(0, len(a), size):
        fa, fb = a[start : start + size], b[start : start + size]
        if fa == fb:
            continue
        if sum(1 for x, y in zip(fa, fb, strict=True) if abs(x - y) > delta) > limit:
            return False
    return True


def replace_if_changed(new, out):
    """Move the GIF or PNG `new` onto `out` unless `out` already shows the same picture; return True when written.

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
