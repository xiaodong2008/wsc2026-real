import os
import pathlib
import sqlite3
import struct
import subprocess
import zlib

ROOT = pathlib.Path("/Users/xiaodong/Program/wsk/real")


def write_png(path, width, height, pixel):
    raw = bytearray()
    for y in range(height):
        raw.append(0)
        for x in range(width):
            red, green, blue = pixel(x, y, width, height)
            raw.extend((red & 255, green & 255, blue & 255))
    compressed = zlib.compress(bytes(raw), 6)

    def chunk(tag, data):
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", compressed) + chunk(b"IEND", b"")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(png)


def save_jpg(path, width, height, pixel):
    temporary = path.with_suffix(".png")
    write_png(temporary, width, height, pixel)
    subprocess.check_call(
        ["sips", "-s", "format", "jpeg", str(temporary), "--out", str(path)],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    temporary.unlink()


def carousel(index):
    def pixel(x, y, width, height):
        band = (x * 3 // width + index) % 6
        palette = [
            (220, 70, 60),
            (240, 160, 40),
            (240, 210, 60),
            (40, 160, 90),
            (40, 120, 200),
            (120, 70, 190),
        ]
        red, green, blue = palette[band]
        if (y // 18) % 2 == 0:
            red = min(255, red + 30)
        return red, green, blue
    return pixel


def photo(seed):
    def pixel(x, y, width, height):
        nx = x / width
        ny = y / height
        red = int(30 + 180 * nx + 20 * seed) % 256
        green = int(40 + 140 * (1 - ny) + 35 * seed) % 256
        blue = int(80 + 100 * ny + 15 * seed) % 256
        if abs(nx - 0.15 * seed) < 0.08 and ny > 0.3:
            return 250, 250, 245
        return red, green, blue
    return pixel


def captcha(kind):
    def pixel(x, y, width, height):
        if kind == 0:
            return (40 + (x // 12) * 18 % 200, 30, 40 + (y // 10) * 12 % 180)
        if kind == 1:
            dx, dy = x - 180, y - 140
            ring = int((dx * dx + dy * dy) ** 0.5) // 14
            return (20 + (ring * 40) % 220, 80 + (ring * 25) % 150, 200 - (ring * 30) % 160)
        if kind == 2:
            cell = ((x // 30) + (y // 30) * 3) % 5
            colors = [(200, 40, 40), (40, 160, 70), (40, 80, 200), (230, 180, 40), (160, 60, 180)]
            return colors[cell]
        if kind == 3:
            stripe = (x + y) // 16
            return (30 + (stripe * 37) % 200, 20 + (stripe * 17) % 180, 90)
        spots = (x * 13 + y * 7 + kind * 19) % 47 < 6
        base = (20 + kind * 30, 30 + (x // 8) % 90, 40 + (y // 6) % 120)
        if spots:
            return 245, 245, 240
        return base
    return pixel


def main():
    save_jpg(ROOT / "A07/assets/loaded.jpg", 960, 480, photo(1))
    for index in range(1, 13):
        save_jpg(ROOT / f"A12/images/{index}.jpg", 640, 420, carousel(index))
    for index in range(1, 4):
        save_jpg(ROOT / f"A23/assets/{index}.jpg", 500, 800, photo(index + 2))
    for index in range(1, 6):
        save_jpg(ROOT / f"B19/assets/{index}.jpg", 600, 400, captcha(index - 1))

    schema = (ROOT / "C06/media/schema.sql").read_text()
    query = "\n".join(
        line for line in (ROOT / "C06/result/result.sql").read_text().splitlines()
        if not line.strip().startswith("--")
    )
    connection = sqlite3.connect(":memory:")
    connection.executescript(schema)
    rows = connection.execute(query).fetchall()
    got = [(row[0], round(float(row[1]), 2)) for row in rows]
    expected = [("Aurora", 720.0), ("Cascade", 600.0), ("Glacier", 600.0), ("March End", 550.0)]
    if got != expected:
        raise SystemExit(f"C06 FAIL {got}")
    print("C06 PASS", got)


if __name__ == "__main__":
    main()
