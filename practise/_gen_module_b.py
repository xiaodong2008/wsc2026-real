#!/usr/bin/env python3
"""Build practise/ModuleB assets. Not a solution."""

import json
import shutil
import struct
import subprocess
import zlib
from pathlib import Path

ROOT = Path("/Users/xiaodong/Program/wsk/real")
DEST = ROOT / "practise" / "ModuleB"
ASSETS = DEST / "assets"

# 5x7 glyphs. '#' is ink.
GLYPHS = {
    "0": [" ### ", "#   #", "#  ##", "# # #", "##  #", "#   #", " ### "],
    "1": ["  #  ", " ##  ", "  #  ", "  #  ", "  #  ", "  #  ", " ### "],
    "2": [" ### ", "#   #", "    #", "  ## ", " #   ", "#    ", "#####"],
    "3": [" ### ", "#   #", "    #", "  ## ", "    #", "#   #", " ### "],
    "4": ["   # ", "  ## ", " # # ", "#  # ", "#####", "   # ", "   # "],
    "5": ["#####", "#    ", "#### ", "    #", "    #", "#   #", " ### "],
    "6": [" ### ", "#    ", "#    ", "#### ", "#   #", "#   #", " ### "],
    "7": ["#####", "    #", "   # ", "  #  ", "  #  ", "  #  ", "  #  "],
    "8": [" ### ", "#   #", "#   #", " ### ", "#   #", "#   #", " ### "],
    "9": [" ### ", "#   #", "#   #", " ####", "    #", "    #", " ### "],
    "A": [" ### ", "#   #", "#   #", "#####", "#   #", "#   #", "#   #"],
    "B": ["#### ", "#   #", "#   #", "#### ", "#   #", "#   #", "#### "],
    "C": [" ### ", "#   #", "#    ", "#    ", "#    ", "#   #", " ### "],
    "D": ["#### ", "#   #", "#   #", "#   #", "#   #", "#   #", "#### "],
    "E": ["#####", "#    ", "#    ", "#### ", "#    ", "#    ", "#####"],
    "G": [" ### ", "#   #", "#    ", "# ###", "#   #", "#   #", " ### "],
    "H": ["#   #", "#   #", "#   #", "#####", "#   #", "#   #", "#   #"],
    "I": [" ### ", "  #  ", "  #  ", "  #  ", "  #  ", "  #  ", " ### "],
    "J": ["  ###", "   # ", "   # ", "   # ", "#  # ", "#  # ", " ##  "],
    "L": ["#    ", "#    ", "#    ", "#    ", "#    ", "#    ", "#####"],
    "M": ["#   #", "## ##", "# # #", "#   #", "#   #", "#   #", "#   #"],
    "N": ["#   #", "##  #", "# # #", "#  ##", "#   #", "#   #", "#   #"],
    "O": [" ### ", "#   #", "#   #", "#   #", "#   #", "#   #", " ### "],
    "P": ["#### ", "#   #", "#   #", "#### ", "#    ", "#    ", "#    "],
    "R": ["#### ", "#   #", "#   #", "#### ", "# #  ", "#  # ", "#   #"],
    "S": [" ####", "#    ", "#    ", " ### ", "    #", "    #", "#### "],
    "T": ["#####", "  #  ", "  #  ", "  #  ", "  #  ", "  #  ", "  #  "],
    "U": ["#   #", "#   #", "#   #", "#   #", "#   #", "#   #", " ### "],
    "V": ["#   #", "#   #", "#   #", "#   #", "#   #", " # # ", "  #  "],
    "W": ["#   #", "#   #", "#   #", "# # #", "# # #", "## ##", "#   #"],
    "Y": ["#   #", "#   #", " # # ", "  #  ", "  #  ", "  #  ", "  #  "],
    " ": ["     ", "     ", "     ", "     ", "     ", "     ", "     "],
    ".": ["     ", "     ", "     ", "     ", "     ", " ##  ", " ##  "],
    "-": ["     ", "     ", "     ", " ### ", "     ", "     ", "     "],
}


def write_png(path, width, height, rgba=False):
    """path is written by the caller via a pixel buffer of width*height*(3 or 4)."""
    raise NotImplementedError


def png_bytes(width, height, raw, color_type):
    def chunk(tag, data):
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    ihdr = struct.pack(">IIBBBBB", width, height, 8, color_type, 0, 0, 0)
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(raw, 6)) + chunk(b"IEND", b"")


def save_rgba(path, width, height, buf):
    stride = width * 4
    raw = bytearray()
    for y in range(height):
        raw.append(0)
        raw.extend(buf[y * stride:(y + 1) * stride])
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(png_bytes(width, height, bytes(raw), 6))


def save_rgb_png(path, width, height, pixel):
    raw = bytearray()
    for y in range(height):
        raw.append(0)
        for x in range(width):
            raw.extend(pixel(x, y))
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(png_bytes(width, height, bytes(raw), 2))


def blit_text(draw, text, x, y, scale, color):
    cursor = x
    for ch in text:
        glyph = GLYPHS.get(ch, GLYPHS[" "])
        for row, line in enumerate(glyph):
            for col, bit in enumerate(line):
                if bit != "#":
                    continue
                for dy in range(scale):
                    for dx in range(scale):
                        draw(cursor + col * scale + dx, y + row * scale + dy, color)
        cursor += 6 * scale


def paint(buf, width, x, y, color):
    i = (y * width + x) * 4
    buf[i:i + 4] = bytes(color)


def rect(buf, width, height, x0, y0, x1, y1, color):
    x0 = max(0, x0)
    y0 = max(0, y0)
    x1 = min(width, x1)
    y1 = min(height, y1)
    for y in range(y0, y1):
        row = y * width * 4
        for x in range(x0, x1):
            i = row + x * 4
            buf[i:i + 4] = bytes(color)


SESSIONS = [
    {"id": "1", "title": "Opening Keynote", "speaker": "Alex Chen", "time": "09:00", "endTime": "09:45", "room": "hall", "roomName": "Hall", "day": 1},
    {"id": "2", "title": "Edge Networks", "speaker": "Jane Smith", "time": "10:00", "endTime": "10:45", "room": "room1", "roomName": "Room 1", "day": 1},
    {"id": "3", "title": "Design Systems", "speaker": "John Doe", "time": "11:00", "endTime": "11:45", "room": "room2", "roomName": "Room 2", "day": 1},
    {"id": "4", "title": "Data Platforms", "speaker": "Li Wei", "time": "14:00", "endTime": "14:45", "room": "room3", "roomName": "Room 3", "day": 1},
    {"id": "5", "title": "Mobile Performance", "speaker": "Maria Garcia", "time": "09:00", "endTime": "09:45", "room": "room4", "roomName": "Room 4", "day": 2},
    {"id": "6", "title": "API Craft", "speaker": "Alex Chen", "time": "10:00", "endTime": "10:45", "room": "room1", "roomName": "Room 1", "day": 2},
    {"id": "7", "title": "Inclusive Interfaces", "speaker": "Jane Smith", "time": "11:00", "endTime": "11:45", "room": "room2", "roomName": "Room 2", "day": 2},
    {"id": "8", "title": "Testing at Scale", "speaker": "John Doe", "time": "14:00", "endTime": "14:45", "room": "hall", "roomName": "Hall", "day": 2},
    {"id": "9", "title": "Cloud Costs", "speaker": "Li Wei", "time": "09:00", "endTime": "09:45", "room": "room3", "roomName": "Room 3", "day": 3},
    {"id": "10", "title": "Sensor Maps", "speaker": "Maria Garcia", "time": "10:00", "endTime": "10:45", "room": "room4", "roomName": "Room 4", "day": 3},
    {"id": "11", "title": "Realtime Sync", "speaker": "Alex Chen", "time": "11:00", "endTime": "11:45", "room": "room1", "roomName": "Room 1", "day": 3},
    {"id": "12", "title": "Typography", "speaker": "Jane Smith", "time": "14:00", "endTime": "14:45", "room": "room2", "roomName": "Room 2", "day": 3},
    {"id": "13", "title": "Security Reviews", "speaker": "John Doe", "time": "09:00", "endTime": "09:45", "room": "room3", "roomName": "Room 3", "day": 4},
    {"id": "14", "title": "Offline First", "speaker": "Li Wei", "time": "10:00", "endTime": "10:45", "room": "room4", "roomName": "Room 4", "day": 4},
    {"id": "15", "title": "Design Crit", "speaker": "Maria Garcia", "time": "11:00", "endTime": "11:45", "room": "room1", "roomName": "Room 1", "day": 4},
    {"id": "16", "title": "Closing Remarks", "speaker": "Alex Chen", "time": "14:00", "endTime": "14:45", "room": "hall", "roomName": "Hall", "day": 4},
]

ROOMS = [
    {"id": "room1", "name": "Room 1", "capacity": 40},
    {"id": "room2", "name": "Room 2", "capacity": 30},
    {"id": "room3", "name": "Room 3", "capacity": 24},
    {"id": "room4", "name": "Room 4", "capacity": 18},
    {"id": "hall", "name": "Hall", "capacity": 180},
]

SPEAKERS = [
    ("Alex Chen", (61, 122, 232), "AC"),
    ("Jane Smith", (31, 168, 135), "JS"),
    ("John Doe", (124, 94, 199), "JD"),
    ("Li Wei", (212, 95, 132), "LW"),
    ("Maria Garcia", (196, 138, 42), "MG"),
]

FRAME_COLORS = {
    "bands": (61, 122, 232),
    "polaroid": (245, 245, 242),
    "panels": (124, 94, 199),
    "diagonal": (212, 95, 132),
    "geometric": (31, 168, 135),
    "neon": (0, 229, 255),
}

# panels: wide only. geometric: normal only. The rest have both.
FRAME_VARIANTS = {
    "bands": (True, True),
    "polaroid": (True, True),
    "panels": (False, True),
    "diagonal": (True, True),
    "geometric": (True, False),
    "neon": (True, True),
}


def slug(name):
    return name.lower().replace(" ", "-")


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2) + "\n")


def make_frames():
    frames = ASSETS / "frames"
    for design, (has_normal, has_wide) in FRAME_VARIANTS.items():
        color = FRAME_COLORS[design]
        if has_normal:
            draw_frame(frames / f"frame_{design}.png", 1080, 1080, design, color)
        if has_wide:
            draw_frame(frames / f"frame_wide_{design}.png", 1600, 1080, design, color)


def draw_frame(path, width, height, design, color):
    buf = bytearray(width * height * 4)
    r, g, b = color
    ink = (r, g, b, 255)
    soft = (r, g, b, 230)

    if design == "bands":
        rect(buf, width, height, 0, 0, width, 72, ink)
        rect(buf, width, height, 0, height - 72, width, height, ink)
        rect(buf, width, height, 0, 0, 28, height, soft)
        rect(buf, width, height, width - 28, 0, width, height, soft)
    elif design == "polaroid":
        white = (248, 246, 240, 255)
        rect(buf, width, height, 0, 0, width, 46, white)
        rect(buf, width, height, 0, 0, 46, height, white)
        rect(buf, width, height, width - 46, 0, width, height, white)
        rect(buf, width, height, 0, height - 170, width, height, white)
    elif design == "panels":
        size = 120
        for x0, y0 in ((0, 0), (width - size, 0), (0, height - size), (width - size, height - size)):
            rect(buf, width, height, x0, y0, x0 + size, y0 + size, ink)
        rect(buf, width, height, 0, 0, width, 14, soft)
        rect(buf, width, height, 0, height - 14, width, height, soft)
        rect(buf, width, height, 0, 0, 14, height, soft)
        rect(buf, width, height, width - 14, 0, width, height, soft)
    elif design == "diagonal":
        for y in range(40):
            for x in range(width):
                if (x + y) % 18 < 9:
                    paint(buf, width, x, y, ink)
                    paint(buf, width, x, height - 1 - y, ink)
        for y in range(height):
            for x in range(40):
                if (x + y) % 18 < 9:
                    paint(buf, width, x, y, ink)
                    paint(buf, width, width - 1 - x, y, ink)
    elif design == "geometric":
        depth = 90
        for y in range(depth):
            for x in range(depth - y):
                paint(buf, width, x, y, ink)
                paint(buf, width, width - 1 - x, y, ink)
                paint(buf, width, x, height - 1 - y, ink)
                paint(buf, width, width - 1 - x, height - 1 - y, ink)
        rect(buf, width, height, 0, 0, width, 10, soft)
        rect(buf, width, height, 0, height - 10, width, height, soft)
    elif design == "neon":
        glow = (r, g, b, 255)
        dim = (8, 16, 28, 180)
        rect(buf, width, height, 18, 18, width - 18, 28, glow)
        rect(buf, width, height, 18, height - 28, width - 18, height - 18, glow)
        rect(buf, width, height, 18, 18, 28, height - 18, glow)
        rect(buf, width, height, width - 28, 18, width - 18, height - 18, glow)
        rect(buf, width, height, 0, 0, width, 8, dim)
        rect(buf, width, height, 0, height - 8, width, height, dim)
    else:
        raise SystemExit(design)

    save_rgba(path, width, height, buf)


def make_speakers():
    folder = ASSETS / "speakers"
    folder.mkdir(parents=True, exist_ok=True)
    for name, color, initials in SPEAKERS:
        width, height = 640, 800
        png = folder / f"{slug(name)}.png"
        jpg = folder / f"{slug(name)}.jpg"

        def pixel(x, y, base=color):
            t = y / height
            shade = 0.55 + 0.45 * (1 - t)
            r = min(255, int(base[0] * shade + 30))
            g = min(255, int(base[1] * shade + 24))
            b = min(255, int(base[2] * shade + 20))
            cx, cy, rad = 320, 300, 150
            if (x - cx) ** 2 + (y - cy) ** 2 <= rad ** 2:
                return (236, 224, 208)
            return (r, g, b)

        save_rgb_png(png, width, height, pixel)
        # Initials painted by rewriting: easier to draw into a second pass via RGBA then flatten.
        buf_draw = bytearray()
        # Re-open by drawing text onto a fresh RGB buffer.
        raw = bytearray(width * height * 3)
        for y in range(height):
            for x in range(width):
                raw[y * width * 3 + x * 3:y * width * 3 + x * 3 + 3] = bytes(pixel(x, y))

        def draw(x, y, color):
            if 0 <= x < width and 0 <= y < height:
                raw[y * width * 3 + x * 3:y * width * 3 + x * 3 + 3] = bytes(color[:3])

        blit_text(draw, initials, 210, 500, 14, (255, 255, 255))
        blit_text(draw, name.upper(), 70, 680, 5, (255, 255, 255))
        raw_png = bytearray()
        for y in range(height):
            raw_png.append(0)
            raw_png.extend(raw[y * width * 3:(y + 1) * width * 3])
        png.write_bytes(png_bytes(width, height, bytes(raw_png), 2))
        subprocess.check_call(
            ["sips", "-s", "format", "jpeg", str(png), "--out", str(jpg)],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        png.unlink()
        del buf_draw


def make_stamps():
    folder = ASSETS / "stamps"
    day_color = {
        1: (61, 122, 232),
        2: (31, 168, 135),
        3: (124, 94, 199),
        4: (212, 95, 132),
    }
    size = 512
    for n in range(1, 17):
        day = (n - 1) // 4 + 1
        color = day_color[day]
        buf = bytearray(size * size * 4)
        cx = cy = size // 2
        outer, inner = 230, 190
        for y in range(size):
            for x in range(size):
                d2 = (x - cx) ** 2 + (y - cy) ** 2
                if inner * inner <= d2 <= outer * outer:
                    paint(buf, size, x, y, (*color, 255))
                elif d2 < inner * inner:
                    paint(buf, size, x, y, (255, 250, 244, 255))

        def draw(x, y, ink):
            if 0 <= x < size and 0 <= y < size:
                paint(buf, size, x, y, ink)

        label = str(n)
        scale = 16
        text_w = len(label) * 6 * scale
        blit_text(draw, label, (size - text_w) // 2, 150, scale, (*color, 255))
        day_label = f"DAY {day}"
        day_w = len(day_label) * 6 * 6
        blit_text(draw, day_label, (size - day_w) // 2, 330, 6, (*color, 255))
        save_rgba(folder / f"{n}.png", size, size, buf)


def copy_template():
    dest = DEST / "original-template"
    if dest.exists():
        shutil.rmtree(dest)
    dest.mkdir(parents=True)
    subprocess.check_call([
        "rsync", "-a", "--exclude", ".git",
        str(ROOT / "template-repo-vue") + "/",
        str(dest) + "/",
    ])


def main():
    copy_template()
    write_json(ASSETS / "api" / "schedule.json", SESSIONS)
    write_json(ASSETS / "api" / "rooms.json", ROOMS)
    for room in ROOMS:
        subset = [item for item in SESSIONS if item["room"] == room["id"]]
        write_json(ASSETS / "api" / "rooms" / room["id"] / "sessions.json", subset)
    print("json ok", flush=True)
    make_speakers()
    print("speakers ok", flush=True)
    make_stamps()
    print("stamps ok", flush=True)
    make_frames()
    print("frames ok", flush=True)

    keys = set(SESSIONS[0])
    assert keys == {"id", "title", "speaker", "time", "endTime", "room", "roomName", "day"}
    assert len(SESSIONS) == 16
    assert len(list((ASSETS / "stamps").glob("*.png"))) == 16
    assert len(list((ASSETS / "speakers").glob("*.jpg"))) == 5
    assert not (ASSETS / "frames" / "frame_panels.png").exists()
    assert (ASSETS / "frames" / "frame_wide_panels.png").exists()
    assert (ASSETS / "frames" / "frame_geometric.png").exists()
    assert not (ASSETS / "frames" / "frame_wide_geometric.png").exists()
    assert not (DEST / "original-template" / ".git").exists()
    print("checked", flush=True)


if __name__ == "__main__":
    main()
