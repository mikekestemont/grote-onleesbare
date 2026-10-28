/* Opdrachten maken en nakijken. Elke opdracht wordt bij het maken zelf gecontroleerd met echte JavaScript-regexen. */
window.ENGINE = (function () {
  const L = window.LEEUW, C = window.CONTENT;
  let seed = (Date.now() ^ 0x5bd1e995) >>> 0;
  function rand() { // mulberry32
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  const pick = a => a[Math.floor(rand() * a.length)];
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const sample = (a, n) => shuffle(a).slice(0, n);

  const WORDS = Object.keys(L.vocab).filter(w => w.length >= 2 && w.length <= 13);
  const COMMON = WORDS.filter(w => L.vocab[w] >= 3);

  function compile(src, flags) {
    if (!src) return { error: "leeg" };
    try { return { re: new RegExp(src, flags || "") }; }
    catch (e) { return { error: friendly(e.message) }; }
  }
  function friendly(msg) {
    if (/Unterminated character class|missing \]/i.test(msg)) return "Er ontbreekt een sluitende ] aan je kooi.";
    if (/Unterminated group|missing \)/i.test(msg)) return "Er ontbreekt een sluitend haakje ).";
    if (/Unmatched '\)'|unmatched/i.test(msg)) return "Er staat een haakje ) te veel.";
    if (/Nothing to repeat/i.test(msg)) return "Een ?, * of + moet ná een teken staan.";
    if (/\\ at end/i.test(msg)) return "Een \\ op het einde: wat wil je daarmee?";
    if (/Range out of order/i.test(msg)) return "Een bereik moet van klein naar groot gaan, zoals [a-z].";
    return "Deze regex klopt nog niet. Kijk je haakjes en tekens na.";
  }
  const test = (re, w) => { re.lastIndex = 0; return re.test(w); };

  function spans(src, text) {
    const c = compile(src, "g"); if (c.error) return null;
    const out = []; let m; c.re.lastIndex = 0;
    while ((m = c.re.exec(text)) !== null) {
      if (m[0] === "") { c.re.lastIndex++; continue; }
      out.push([m.index, m.index + m[0].length]);
    }
    return out;
  }
  const spanKey = s => s.map(x => x.join(":")).join("|");

  function separates(src, catchW, spareW) {
    const c = compile(src); if (c.error) return false;
    return catchW.every(w => test(c.re, w)) && !spareW.some(w => test(c.re, w));
  }

  // ---------------- golf
  function golfFromLists(rule, catchPool, sparePool, n) {
    const re = new RegExp(rule);
    const cat = catchPool.filter(w => test(re, w)), spa = sparePool.filter(w => !test(re, w));
    return { catch: sample(cat, Math.min(n, cat.length)), spare: sample(spa, Math.min(n, spa.length)) };
  }
  function golfFromVocab(rule, near, n) {
    const re = new RegExp(rule), nr = new RegExp(near);
    const pool = n > 4 ? WORDS : COMMON;
    const cat = pool.filter(w => test(re, w));
    let spa = pool.filter(w => !test(re, w) && test(nr, w));
    if (spa.length < n) spa = spa.concat(sample(pool.filter(w => !test(re, w)), n));
    if (cat.length < n) return null;
    return { catch: sample(cat, n), spare: sample(spa, n) };
  }

  // ---------------- spoor: een echte regel uit het handschrift met de vangst van een regex
  function spoor(rule, distractors, opts) {
    opts = opts || {};
    const cands = [];
    const startAt = Math.floor(rand() * L.lines.length);
    for (let k = 0; k < L.lines.length && cands.length < 40; k++) {
      const i = (startAt + k) % L.lines.length, t = L.lines[i][2];
      if (t.length < 18 || t.length > 72) continue;
      const s = spans(rule, t); if (!s || !s.length) continue;
      if (opts.minRun && !new RegExp("@{" + opts.minRun + ",}").test(t)) continue;
      if (opts.minMarks && s.length < opts.minMarks) continue;
      const key = spanKey(s);
      const diff = distractors.filter(d => { const ds = spans(d, t); return ds && spanKey(ds) !== key; });
      if (diff.length < (opts.needAll ? Math.min(4, distractors.length) : 3)) continue;
      const nonEmpty = diff.filter(d => spans(d, t).length > 0);
      cands.push({ i, s, diff: nonEmpty.length >= 3 ? nonEmpty : diff });
    }
    if (!cands.length) return null;
    const c = pick(cands);
    return { line: c.i, marks: c.s, options: shuffle([rule].concat(sample(c.diff, 3))), answer: rule };
  }

  // ---------------- haltes
  function station(i) {
    const st = C.STATIONS[i], v = pick(st.variants);
    const base = { kind: "station", station: i, type: v.type, rule: v.rule, prompt: v.prompt, hint: v.hint, explain: v.explain,
      creature: st.creature, time: v.type === "golf" ? 75 : 30 };
    if (v.type === "golf") {
      let g;
      if (v.pairs) { const ps = sample(v.pairs, v.n); g = { catch: shuffle(ps.map(p => p[0])), spare: shuffle(ps.map(p => p[1])) }; }
      else g = golfFromLists(v.rule, v.catch, v.spare, v.n);
      if (!v.prompt) base.prompt = "Vang alle woorden in het net. Spaar de woorden op de oever.";
      return Object.assign(base, g);
    }
    const sp = spoor(v.rule, v.distractors, { minRun: v.rule === "@+" ? 2 : 0, minMarks: 2, needAll: true }) || spoor(v.rule, v.distractors, { minRun: v.rule === "@+" ? 2 : 0, needAll: true });
    return Object.assign(base, sp);
  }

  // ---------------- toren
  function tierFor(floor) { return floor <= 2 ? 2 : floor <= 4 ? 3 : floor <= 7 ? 4 : 5; }
  function towerTime(type, floor) {
    if (type === "golf") return Math.max(30, 60 - (floor - 1) * 3);
    return Math.max(12, 22 - (floor - 1));
  }
  const MUTATIONS = [
    s => s.replace(/^\^/, ""), s => s.replace(/\$$/, ""), s => s.replace(/\?/, ""), s => s.replace(/\+/, "*"),
    s => s.replace(/\[([a-z])([a-z])\]/, "$1"), s => s.replace(/\.\*/, "."), s => s.replace(/\((\w+)\|(\w+)\)/, "$1"),
    s => s.replace(/\[A-Z\]/, "[a-z]"), s => "^" + s.replace(/^\^/, "") + (s.endsWith("$") ? "" : "$"), s => s.replace(/\./, "")
  ];

  function tower(floor, lastType) {
    const tier = tierFor(floor);
    const types = shuffle(["golf", "golf", "raad", "kies", "spoor"]).filter(t => t !== lastType);
    for (let attempt = 0; attempt < 40; attempt++) {
      const type = types[attempt % types.length];
      const ch = { kind: "tower", floor, type, time: towerTime(type, floor), creature: pick(C.CREATURES) };
      if (type === "spoor") {
        const pool = C.SPOOR_RULES.filter(r => r.t <= tier && r.t >= tier - 2);
        const sr = pick(pool), sp = spoor(sr.r, sr.d, { minRun: sr.r === "@+" ? 2 : 0 });
        if (!sp) continue;
        return Object.assign(ch, sp, { rule: sr.r, prompt: "Elk geel vak is één vangst in deze regel uit het handschrift. Welke regex gaf deze vangst?" });
      }
      const pool = C.TOWER_RULES.filter(r => r.t <= tier && r.t >= tier - 1);
      const rule = pick(pool);
      const n = 3 + (floor > 4 ? 1 : 0) + (floor > 8 ? 1 : 0);
      const g = golfFromVocab(rule.r, rule.near, n);
      if (!g) continue;
      ch.rule = rule.r;
      if (type === "golf") return Object.assign(ch, g, { prompt: "Vang alle woorden in het net. Spaar de woorden op de oever." });
      if (type === "raad") {
        const escapes = rand() < 0.4;
        const right = escapes ? g.spare[0] : g.catch[0];
        const wrong = escapes ? g.catch.slice(0, 3) : g.spare.slice(0, 3);
        if (wrong.length < 3) continue;
        return Object.assign(ch, { options: shuffle([right].concat(wrong)), answer: right, optionKind: "word",
          prompt: escapes ? "Drie woorden zitten in het net van deze regex. Welk woord ontsnapt?" : "Welk woord zit in het net van deze regex?" });
      }
      if (type === "kies") {
        const shownC = g.catch.slice(0, 3), shownS = g.spare.slice(0, 3);
        const ok = s => s !== rule.r && !compile(s).error && !separates(s, shownC, shownS);
        const muts = [...new Set(MUTATIONS.map(f => f(rule.r)))].filter(ok);
        const letters = [...new Set(rule.r.replace(/[^a-z]/g, ""))];
        const close = [...new Set(C.TOWER_RULES.map(r => r.r))].filter(s => ok(s) && !muts.includes(s) && letters.some(ch => s.includes(ch)));
        const ds = sample(muts, 3).concat(sample(close, 3)).slice(0, 3);
        if (ds.length < 3) continue;
        return Object.assign(ch, { catch: shownC, spare: shownS, options: shuffle([rule.r].concat(ds)), answer: rule.r, optionKind: "regex",
          prompt: "Welke regex vangt alle woorden in het net, en geen enkel woord op de oever?" });
      }
    }
    return null;
  }

  // ---------------- nakijken
  function evalGolf(src, ch) {
    const c = compile(src);
    if (c.error) return { error: src ? c.error : null, catchHits: ch.catch.map(() => false), spareHits: ch.spare.map(() => false), solved: false };
    const catchHits = ch.catch.map(w => test(c.re, w)), spareHits = ch.spare.map(w => test(c.re, w));
    return { catchHits, spareHits, solved: catchHits.every(Boolean) && !spareHits.some(Boolean) };
  }

  function score(ch, secondsLeft, extra) {
    const base = 100;
    const speed = Math.round(secondsLeft * (ch.type === "golf" ? 2 : 4));
    let pts = base + speed;
    if (extra.elegant) pts += 50;
    if (ch.kind === "tower") pts = Math.round(pts * (1 + 0.25 * ch.floor));
    if (extra.hint) pts = Math.round(pts / 2);
    return pts;
  }

  // herkomst: een echte regel waarin het woord voorkomt
  function provenance(word) {
    const ids = L.idx[word]; if (!ids || !ids.length) return null;
    const ln = L.lines[pick(ids)];
    return { page: ln[0], n: ln[1], text: ln[2], marks: spans("\\b" + word + "\\b", ln[2]) || [] };
  }
  const line = i => ({ page: L.lines[i][0], n: L.lines[i][1], text: L.lines[i][2] });

  return { compile, spans, evalGolf, separates, station, tower, score, provenance, line, pick, shuffle, rand, test };
})();
