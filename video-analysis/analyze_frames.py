from __future__ import annotations

import csv
import json
import math
import re
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
FRAMES_DIR = ROOT / "every-frame"
SHEETS_DIR = ROOT / "contact-sheets-1s"
FPS = 60.0
EXPECTED_COUNT = 14527
FRAME_RE = re.compile(r"frame_(\d{6})\.jpg$")


def timestamp(frame_number: int) -> str:
    seconds = (frame_number - 1) / FPS
    minutes = int(seconds // 60)
    remainder = seconds - minutes * 60
    return f"{minutes:02d}:{remainder:05.2f}"


def main() -> None:
    frames = sorted(FRAMES_DIR.glob("frame_*.jpg"))
    if len(frames) != EXPECTED_COUNT:
        raise RuntimeError(f"Expected {EXPECTED_COUNT} frames, found {len(frames)}")

    numbers = []
    dimensions: dict[str, int] = {}
    corrupt: list[str] = []
    differences: list[dict[str, float | int]] = []
    previous: np.ndarray | None = None

    for index, path in enumerate(frames, start=1):
        match = FRAME_RE.match(path.name)
        if not match:
            raise RuntimeError(f"Unexpected frame filename: {path.name}")
        frame_number = int(match.group(1))
        numbers.append(frame_number)

        try:
            with Image.open(path) as image:
                image.load()
                size_key = f"{image.width}x{image.height}"
                dimensions[size_key] = dimensions.get(size_key, 0) + 1
                small = np.asarray(
                    image.convert("L").resize((160, 90), Image.Resampling.BILINEAR),
                    dtype=np.int16,
                )
        except Exception as exc:  # pragma: no cover - diagnostic path
            corrupt.append(f"{path.name}: {exc}")
            continue

        if previous is None:
            mean_abs = 0.0
            changed_fraction = 0.0
        else:
            delta = np.abs(small - previous)
            mean_abs = float(delta.mean())
            changed_fraction = float(np.count_nonzero(delta >= 12) / delta.size)

        differences.append(
            {
                "frame": frame_number,
                "time_seconds": round((frame_number - 1) / FPS, 6),
                "mean_abs_difference": round(mean_abs, 6),
                "changed_fraction_ge_12": round(changed_fraction, 6),
            }
        )
        previous = small

    expected_numbers = list(range(1, EXPECTED_COUNT + 1))
    missing_numbers = sorted(set(expected_numbers) - set(numbers))
    duplicate_count = len(numbers) - len(set(numbers))

    with (ROOT / "per-frame-change.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(differences[0].keys()))
        writer.writeheader()
        writer.writerows(differences)

    SHEETS_DIR.mkdir(exist_ok=True)
    samples = list(range(1, EXPECTED_COUNT + 1, int(FPS)))
    tile_width, tile_height = 320, 180
    columns, rows = 4, 5
    label_height = 28
    font = ImageFont.load_default(size=16)

    for sheet_index in range(math.ceil(len(samples) / (columns * rows))):
        sheet = Image.new(
            "RGB",
            (columns * tile_width, rows * (tile_height + label_height)),
            "#111111",
        )
        draw = ImageDraw.Draw(sheet)
        batch = samples[sheet_index * columns * rows : (sheet_index + 1) * columns * rows]
        for tile_index, frame_number in enumerate(batch):
            row, column = divmod(tile_index, columns)
            x = column * tile_width
            y = row * (tile_height + label_height)
            with Image.open(FRAMES_DIR / f"frame_{frame_number:06d}.jpg") as image:
                thumb = image.convert("RGB").resize((tile_width, tile_height), Image.Resampling.LANCZOS)
            sheet.paste(thumb, (x, y))
            draw.rectangle((x, y + tile_height, x + tile_width, y + tile_height + label_height), fill="#111111")
            draw.text(
                (x + 8, y + tile_height + 5),
                f"{timestamp(frame_number)}  f{frame_number:06d}",
                fill="#ffffff",
                font=font,
            )
        sheet.save(SHEETS_DIR / f"timeline_{sheet_index + 1:02d}.jpg", quality=90, subsampling=0)

    top_changes = sorted(
        differences[1:],
        key=lambda item: (float(item["mean_abs_difference"]), float(item["changed_fraction_ge_12"])),
        reverse=True,
    )[:250]

    verification = {
        "expected_frame_count": EXPECTED_COUNT,
        "written_frame_count": len(frames),
        "first_frame": frames[0].name,
        "last_frame": frames[-1].name,
        "missing_frame_numbers": missing_numbers,
        "duplicate_frame_numbers": duplicate_count,
        "corrupt_frames": corrupt,
        "dimensions": dimensions,
        "fps": FPS,
        "duration_from_frame_count_seconds": round(EXPECTED_COUNT / FPS, 6),
        "one_second_samples": len(samples),
        "contact_sheet_count": math.ceil(len(samples) / (columns * rows)),
        "top_frame_changes": top_changes,
    }
    (ROOT / "verification-and-change-summary.json").write_text(
        json.dumps(verification, indent=2), encoding="utf-8"
    )
    print(json.dumps({key: value for key, value in verification.items() if key != "top_frame_changes"}, indent=2))


if __name__ == "__main__":
    main()
