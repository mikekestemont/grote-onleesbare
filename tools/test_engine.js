// node tools/test_engine.js : genereert veel opdrachten en controleert dat elke opdracht precies één juist antwoord heeft.
const fs = require("fs"), vm = require("vm");
const ctx = { window: {}, console }; vm.createContext(ctx);
for (const f of ["js/data.js", "js/content.js", "js/engine.js"]) vm.runInContext(fs.readFileSync(f, "utf8"), ctx);
const E = ctx.window.ENGINE, C = ctx.window.CONTENT, L = ctx.window.LEEUW;
let bad = 0, stats = {};
function check(ch, label) {
  if (!ch) { bad++; console.log("NULL", label); return; }
  const k = label.split(" ")[0] + ":" + ch.type; stats[k] = (stats[k] || 0) + 1;
  if (ch.type === "golf") {
    if (ch.catch.length < 3 || ch.spare.length < 3) { bad++; console.log("FEW", label, ch.rule, ch.catch, ch.spare); }
    if (!E.separates(ch.rule, ch.catch, ch.spare)) { bad++; console.log("NOSEP", label, ch.rule); }
    if (new Set(ch.catch.concat(ch.spare)).size !== ch.catch.length + ch.spare.length) { bad++; console.log("DUP", label); }
  } else if (ch.type === "spoor") {
    const t = L.lines[ch.line][2], key = JSON.stringify(ch.marks);
    const ok = ch.options.filter(o => JSON.stringify(E.spans(o, t)) === key);
    if (ok.length !== 1 || new Set(ch.options).size !== 4) { bad++; console.log("SPOOR", label, ch.options, t); }
  } else if (ch.type === "raad") {
    const re = new RegExp(ch.rule);
    const m = ch.options.filter(w => re.test(w));
    const okCount = ch.prompt.includes("ontsnapt") ? ch.options.length - m.length : m.length;
    if (okCount !== 1) { bad++; console.log("RAAD", label, ch.rule, ch.options); }
  } else if (ch.type === "kies") {
    const ok = ch.options.filter(o => E.separates(o, ch.catch, ch.spare));
    if (ok.length !== 1 || ok[0] !== ch.answer) { bad++; console.log("KIES", label, ch.options, ch.catch, ch.spare); }
  }
}
for (let r = 0; r < 300; r++) {
  for (let i = 0; i < C.STATIONS.length; i++) check(E.station(i), "station " + i);
  let last = null;
  for (let f = 1; f <= 14; f++) { const ch = E.tower(f, last); check(ch, "toren " + f); last = ch && ch.type; }
}
console.log("fouten:", bad); console.log(stats);
// inhoud: liggen alle woorden uit de haltes in het corpus?
const miss = [];
C.STATIONS.forEach(s => s.variants.forEach(v => (v.catch || []).concat(v.spare || [], (v.pairs || []).flat()).forEach(w => { if (!L.vocab[w]) miss.push(w); })));
console.log("niet in corpus (freq>=2):", miss.join(", ") || "geen");
