from __future__ import annotations

import argparse
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


FPS = 60.0


def frame_for_time(seconds: float) -> int:
    return max(1, round(seconds * FPS) + 1)


def label_time(seconds: float) -> str:
    minutes = int(seconds // 60)
    remainder = seconds - minutes * 60
    return f"{minutes:02d}:{remainder:05.2f}"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("name")
    parser.add_argument("start", type=float)
    parser.add_argument("end", type=float)
    parser.add_argument("interval", type=float)
    parser.add_argument("--columns", type=int, default=4)
    parser.add_argument("--tiles-per-sheet", type=int, default=20)
    args = parser.parse_args()

    root = Path(__file__).resolve().parent
    frames_dir = root / "every-frame"
    output_dir = root / "sequence-sheets" / args.name
    output_dir.mkdir(parents=True, exist_ok=True)

    samples: list[float] = []
    current = args.start
    while current <= args.end + 1e-9:
        samples.append(round(current, 6))
        current += args.interval

    tile_width, tile_height, label_height = 320, 180, 28
    font = ImageFont.load_default(size=16)
    sheet_count = math.ceil(len(samples) / args.tiles_per_sheet)

    for sheet_index in range(sheet_count):
        batch = samples[
            sheet_index * args.tiles_per_sheet : (sheet_index + 1) * args.tiles_per_sheet
        ]
        rows = math.ceil(len(batch) / args.columns)
        sheet = Image.new(
            "RGB",
            (args.columns * tile_width, rows * (tile_height + label_height)),
            "#111111",
        )
        draw = ImageDraw.Draw(sheet)
        for tile_index, seconds in enumerate(batch):
            row, column = divmod(tile_index, args.columns)
            x = column * tile_width
            y = row * (tile_height + label_height)
            frame_number = frame_for_time(seconds)
            frame_path = frames_dir / f"frame_{frame_number:06d}.jpg"
            with Image.open(frame_path) as image:
                thumb = image.convert("RGB").resize((tile_width, tile_height), Image.Resampling.LANCZOS)
            sheet.paste(thumb, (x, y))
            draw.rectangle((x, y + tile_height, x + tile_width, y + tile_height + label_height), fill="#111111")
            draw.text(
                (x + 8, y + tile_height + 5),
                f"{label_time(seconds)}  f{frame_number:06d}",
                fill="#ffffff",
                font=font,
            )
        sheet.save(output_dir / f"{args.name}_{sheet_index + 1:02d}.jpg", quality=92, subsampling=0)

    print(f"{args.name}: {len(samples)} samples across {sheet_count} sheet(s)")


if __name__ == "__main__":
    main()
