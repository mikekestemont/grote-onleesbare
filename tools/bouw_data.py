"""Bouwt js/data.js uit een Transkribus-export (PAGE XML, zip).
Gebruik: python3 tools/bouw_data.py <export.zip>
Enkel de regeltekst (TextEquiv/Unicode) wordt overgenomen: geen metadata, geen namen."""
import collections, json, pathlib, re, sys, zipfile
from lxml import etree

zip_path = sys.argv[1]
out = pathlib.Path(__file__).resolve().parents[1] / "js" / "data.js"

z = zipfile.ZipFile(zip_path)
lines = []
for n in sorted(z.namelist()):
    m = re.search(r"page/\d+_tg_lhhs_3873_(\w+)\.xml$", n)
    if not m:
        continue
    root = etree.fromstring(z.read(n))
    ns = {"p": root.nsmap[None]}
    page = m.group(1).lstrip("0") or "0"
    k = 0
    for tl in root.iterfind(".//p:TextLine", ns):
        u = tl.find("p:TextEquiv/p:Unicode", ns)
        t = re.sub(r"[  ]+", " ", (u.text or "") if u is not None else "").strip()
        if t:
            k += 1
            lines.append([page, k, t])

tok = re.compile(r"[A-Za-z]+")
freq = collections.Counter(w for _, _, t in lines for w in tok.findall(t))
vocab = {w: c for w, c in freq.items() if c >= 2}
# per woord tot 3 regels als herkomst, bij voorkeur regels van gewone lengte zonder @
idx = collections.defaultdict(list)
order = sorted(range(len(lines)), key=lambda i: ("@" in lines[i][2], abs(len(lines[i][2]) - 50)))
for i in order:
    for w in set(tok.findall(lines[i][2])):
        if w in vocab and len(idx[w]) < 3:
            idx[w].append(i)

data = {"lines": lines, "vocab": vocab, "idx": idx,
        "pages": len({p for p, _, _ in lines}), "words": sum(freq.values())}
js = "window.LEEUW = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n"
out.write_text(js, encoding="utf-8")
print(f"{len(lines)} regels, {len(vocab)} woordtypes, {out.stat().st_size // 1024} kB → {out}")
