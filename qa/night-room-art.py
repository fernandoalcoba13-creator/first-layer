"""Offline, lossless repair of the baked printers; never used by the game."""
import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
SPEC = json.loads((ROOT / "qa/night-room-art.json").read_text(encoding="utf-8"))


def box(rect):
    x, y, width, height = rect
    return x, y, x + width, y + height


def load_source():
    path = ROOT / SPEC["source"]
    assert hashlib.sha256(path.read_bytes()).hexdigest() == SPEC["sourceSHA256"], "Remeasure changed source art first"
    with Image.open(path) as image:
        source = image.convert("RGBA")
    assert list(source.size) == SPEC["size"]
    sample = source.crop(box(SPEC["benchSample"]))
    assert sample.getchannel("A").getextrema()[0] > 0, "Bench sample must contain only the intact tabletop"
    sx, sy, sw, sh = SPEC["benchSample"]
    for printer in SPEC["printers"]:
        x, y, w, h = printer["bounds"]
        assert 0 <= x < x + w <= source.width and 0 <= y < y + h <= source.height
        assert w == sw and sy + sh == y + h
        assert sx + sw <= x or sx >= x + w, "Sample cannot contain another baked printer"
        assert printer["anchor"] == [x + w / 2, y + h]
    return source, sample


def clean(source, sample, count):
    result = source.copy()
    for printer in SPEC["printers"][:count]:
        x, y, w, h = printer["bounds"]
        result.paste((0, 0, 0, 0), box(printer["bounds"]))
        # Copy pixels without alpha compositing or color conversion.
        result.paste(sample, (x, SPEC["benchSample"][1]))
    return result


def verify(source, expected, output, count):
    with Image.open(output) as image:
        actual = image.convert("RGBA")
    assert actual.size == source.size
    assert actual.tobytes() == expected.tobytes(), f"Unexpected pixel in {output.name}"
    regions = SPEC["printers"][:count]
    changed = 0
    for y in range(source.height):
        for x in range(source.width):
            if source.getpixel((x, y)) == actual.getpixel((x, y)):
                continue
            changed += 1
            assert any(rx <= x < rx + rw and ry <= y < ry + rh
                       for rx, ry, rw, rh in (p["bounds"] for p in regions)), "Changed a pixel outside the printer slots"
    for printer in regions:
        x, y, w, h = printer["bounds"]
        assert actual.crop((x, y, x + w, SPEC["benchSample"][1])).getchannel("A").getbbox() is None
        assert actual.crop((x, SPEC["benchSample"][1], x + w, y + h)).tobytes() == source.crop(box(SPEC["benchSample"])).tobytes()
    assert changed > 0
    print(f"PASS {output.name}: {count} removed, {changed} changed pixels, zero changes outside slots")


def preview(source, sample, destination):
    with Image.open(ROOT / "assets/environment/workshop-v2/floor.png") as image:
        floor = image.convert("RGBA")
    paths = ["assets/printers/maquina3d_lvl1.png", "assets/printers/variants/printer_variant_2.png", "assets/printers/maquina3d.png"]
    region = (134, 70, 258, 131)
    tile_size = ((region[2] - region[0]) * 4, (region[3] - region[1]) * 4)
    canvas = Image.new("RGB", (tile_size[0] * 3, (tile_size[1] + 24) * 2), "#14191a")
    labels = ImageDraw.Draw(canvas)
    for count in range(1, 4):
        for row in range(2):
            layer = source if row == 0 else clean(source, sample, count)
            scene = Image.alpha_composite(floor, layer)
            for index in range(count):
                with Image.open(ROOT / paths[index]) as image:
                    sprite = image.convert("RGBA").crop((0, 0, 26, 34))
                x, y = SPEC["printers"][index]["anchor"]
                scene.alpha_composite(sprite, (x - 13, y - 34))
            x, y = (count - 1) * tile_size[0], row * (tile_size[1] + 24)
            labels.text((x + 8, y + 5), f"{'BAKED + LIVE' if row == 0 else 'CLEAN + LIVE'} / {count} PRINTER(S)", fill="white")
            canvas.paste(scene.crop(region).resize(tile_size, Image.Resampling.NEAREST), (x, y + 24))
    canvas.save(destination)
    print(f"Offline compositing preview (not Phaser): {destination}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write", action="store_true", help="Regenerate only the three named clean PNG outputs")
    parser.add_argument("--preview", type=Path, help="Optional before/after compositing image for inspection")
    args = parser.parse_args()
    source, sample = load_source()
    for count, name in enumerate(SPEC["outputs"], start=1):
        output = ROOT / name
        assert output != ROOT / SPEC["source"]
        expected = clean(source, sample, count)
        if args.write:
            expected.save(output)
        verify(source, expected, output, count)
    if args.preview:
        preview(source, sample, args.preview)


if __name__ == "__main__":
    main()
