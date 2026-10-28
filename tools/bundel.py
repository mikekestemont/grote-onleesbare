"""Maakt één losstaand HTML-bestand (dist/grote-onleesbare.html) met alle CSS en JS ingebed.
Handig om offline te spelen of op Blackboard te zetten. De GitHub Pages-versie gebruikt gewoon index.html."""
import pathlib, re
root = pathlib.Path(__file__).resolve().parents[1]
html = (root / "index.html").read_text(encoding="utf-8")
css = (root / "css/style.css").read_text(encoding="utf-8")
html = html.replace('<link rel="stylesheet" href="css/style.css">', "<style>\n" + css + "\n</style>")
def inline(m):
    js = (root / m.group(1)).read_text(encoding="utf-8").replace("</script", "<\\/script")
    return "<script>\n" + js + "\n</script>"
html = re.sub(r'<script src="(js/[a-z]+\.js)"></script>', inline, html)
out = root / "dist" / "grote-onleesbare.html"; out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding="utf-8")
print(out, out.stat().st_size // 1024, "kB")

# variant zonder documentskelet, voor een (privé) voorbeeld als Claude-artifact
head = html[html.index("<head>") + 6: html.index("</head>")]
head = re.sub(r'<meta charset="utf-8">\s*|<meta name="viewport"[^>]*>\s*', "", head)
body = html[html.index("<body>") + 6: html.index("</body>")]
art = root / "dist" / "artifact.html"
art.write_text(head.strip() + "\n" + body.strip() + "\n", encoding="utf-8")
print(art, art.stat().st_size // 1024, "kB")
