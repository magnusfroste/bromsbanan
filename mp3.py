#!/usr/bin/env python3
"""mp3.py — färdiga röstfiler för Trafikresan. Läs stemmer.json (generate.py).
Kör: python3 mp3.py"""
import hashlib
import json
import os
import subprocess
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
LJUD = os.path.join(HERE, "public", "ljud")
os.makedirs(LJUD, exist_ok=True)

VOICE = "sv-SE-SofieNeural"
RATE = "-4%"


def synth(text):
    fid = hashlib.sha1((VOICE + "|" + text).encode("utf-8")).hexdigest()[:10]
    path = os.path.join(LJUD, fid + ".mp3")
    if os.path.exists(path) and os.path.getsize(path) > 400:
        return fid
    import time
    for forsok in range(8):
        if forsok:
            time.sleep(2 + forsok * 3)   # edge-tts svarar NoAudioReceived vid rate limit
        p = subprocess.run(
            ["edge-tts", "--text", text, "--voice", VOICE, "--rate", RATE, "--write-media", path],
            capture_output=True, text=True, timeout=90)
        if p.returncode == 0 and os.path.exists(path) and os.path.getsize(path) > 400:
            return fid
        # ibland CC-headers: provia utan --rate om det fortsätter falla
        if forsok >= 3:
            p = subprocess.run(
                ["edge-tts", "--text", text, "--voice", VOICE, "--write-media", path],
                capture_output=True, text=True, timeout=90)
            if p.returncode == 0 and os.path.exists(path) and os.path.getsize(path) > 400:
                return fid
        time.sleep(1)
    if os.path.exists(path):
        os.remove(path)
    return None


def main():
    lista = json.load(open(os.path.join(HERE, "stemmer.json"), encoding="utf-8"))
    lines, miss = {}, 0
    with ThreadPoolExecutor(max_workers=2) as pool:
        for i, (text, fid) in enumerate(zip(lista, pool.map(synth, lista)), 1):
            if not fid:
                miss += 1
                print("MISS", text[:70])
                continue
            lines[text] = fid
            print(f"{i}/{len(lista)}", flush=True)
    with open(os.path.join(LJUD, "lines.js"), "w", encoding="utf-8") as f:
        f.write("window.__ROST = " + json.dumps(lines, ensure_ascii=False, indent=1) + ";\n")
    print(f"klart: {len(lines)} filer, {miss} miss")
    assert miss == 0, "nån mening saknar fil"


main()