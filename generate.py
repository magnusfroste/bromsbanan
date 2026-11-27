#!/usr/bin/env python3
"""generate.py – samlar EXAKT de meningar appen säger till stemmer.json.

Meningarna byggs i data.js (frågor och svar) och i app.js (nivåklart).
Vi hämtar dem ur data.js via node, så att ljudfilerna alltid matchar
den text som faktiskt skickas till tala().
"""
import json
import os
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))

DUMP = r"""
require('./public/data.js');
const B = globalThis.BROMS;
const ut = [];
for (const q of B.FRÅGOR) { ut.push(q.fraga); ut.push(q.svar); }
ut.push('Nivå 1 klar.');
ut.push('Nivå 2 klar.');
ut.push('Alla tre nivåerna är klara.');
console.log(JSON.stringify(ut));
"""


def main():
    p = subprocess.run(["node", "-e", DUMP], cwd=HERE, capture_output=True, text=True)
    assert p.returncode == 0, p.stderr
    lines = json.loads(p.stdout)
    # unika, behåll ordningen
    sedda, ut = set(), []
    for s in lines:
        if s not in sedda:
            sedda.add(s)
            ut.append(s)
    with open(os.path.join(HERE, "stemmer.json"), "w", encoding="utf-8") as f:
        json.dump(ut, f, ensure_ascii=False, indent=1)
    print(f"{len(ut)} meningar -> stemmer.json")
    fragor = sum(1 for s in ut if s.endswith("?"))
    print(f"varav frågor: {fragor}")


main()
