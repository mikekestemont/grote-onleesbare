/* Spelverloop: titel → proloog → tien haltes → toren (sudden death) → oorkonde. */
(function () {
  const C = window.CONTENT, E = window.ENGINE, A = window.ART, S = window.SFX, L = window.LEEUW;
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem("onleesbare." + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("onleesbare." + k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem("onleesbare." + k); } catch (e) {} }
  };
  const isNarrow = () => window.matchMedia("(max-width: 760px)").matches;

  // ------------------------------------------------------------------ toestand
  let G = null;
  function fresh(mode) {
    return { mode, name: ($("inp-name").value || "").trim() || E.pick(C.NAMES), phase: "story", station: 0, results: [], score: 0,
      correct: 0, wrong: 0, times: [], floor: 0, freed: false, golden: 0, hints: 0, story: 0, lastType: null };
  }
  const calm = () => G && G.mode === "calm";
  const runesKnown = () => !G ? store.get("runes", 0) : G.phase === "tower" || G.phase === "end" ? 10 : Math.min(10, G.station + 1);

  const anim = { t: 0, walk: null, player: [560, 150], creature: null, scene: null, tower: null, celebrate: null };

  // ------------------------------------------------------------------ schermen
  const SCREENS = ["scr-title", "scr-story", "scr-station", "scr-duel", "scr-tower", "scr-end", "travel"];
  function show(id) {
    SCREENS.forEach(s => { $(s).hidden = s !== id; });
    if (id && isNarrow()) setTimeout(() => $(id).scrollIntoView({ behavior: "smooth", block: "start" }), 30);
    hud();
  }
  function hud() {
    const tally = $("tally");
    if (!G || G.phase === "story") { tally.innerHTML = ""; $("score").textContent = ""; return; }
    let h = "";
    for (let i = 0; i < 10; i++) {
      const r = G.results[i];
      h += `<span class="dot ${r === true ? "ok" : r === false ? "no" : ""} ${i === G.results.length && G.phase === "journey" ? "now" : ""}" title="Halte ${i + 1}"></span>`;
    }
    if (G.phase === "tower" || G.phase === "end") h += `<span class="floor">Toren ${G.floor}</span>`;
    tally.innerHTML = h;
    $("score").textContent = calm() ? "leertocht" : G.score + " pt";
  }

  // ------------------------------------------------------------------ titel
  function title() {
    G = null; anim.player = [560, 150]; anim.walk = null; anim.celebrate = null;
    $("inp-name").value = store.get("name", "");
    $("inp-name").placeholder = E.pick(C.NAMES);
    const saved = store.get("run", null);
    $("resume-row").hidden = !saved;
    if (saved) $("btn-resume").textContent = saved.phase === "tower" ? `Hervat je tocht (toren, verdieping ${saved.floor})` : `Hervat je tocht (halte ${saved.station + 1}: ${C.STATIONS[Math.min(saved.station, 9)].place})`;
    show("scr-title");
  }
  function start(mode) {
    S.unlock();
    G = fresh(mode); store.set("name", ($("inp-name").value || "").trim()); anim.celebrate = null; anim.player = [560, 150];
    store.del("run");
    story(0);
  }

  // ------------------------------------------------------------------ proloog
  function story(i) {
    G.phase = "story"; G.story = i;
    const p = C.STORY.prologue[i];
    $("story-title").textContent = p.title; $("story-body").textContent = p.text;
    $("btn-story-next").textContent = i < C.STORY.prologue.length - 1 ? "Verder" : "Pak je ganzenveer";
    anim.scene = p.scene; show("scr-story");
  }
  function storyNext() { if (G.story < C.STORY.prologue.length - 1) story(G.story + 1); else beginJourney(); }
  function beginJourney() {
    G.phase = "journey"; anim.scene = null; show(null);
    walk(-1, () => stationCard());
  }

  // ------------------------------------------------------------------ reizen
  function walk(seg, done) {
    anim.walk = { seg, start: performance.now(), dur: seg < 0 ? 1600 : 2000, done, lastStep: 0 };
  }
  function travel() {
    const st = C.STATIONS[G.station];
    $("travel-name").textContent = st.place; $("travel-sub").textContent = st.sub;
    show("travel"); setTimeout(() => $("btn-go").focus({ preventScroll: true }), 50);
  }
  function go() { S.unlock(); show(null); walk(G.station - 1, () => stationCard()); }

  // ------------------------------------------------------------------ halte
  function runeCardHTML(i) {
    const r = C.RUNES[i];
    return `<div class="rune-glyph">${esc(r.glyph)}</div><div class="rune-name">Nieuwe regex: ${esc(r.name)}</div><div>${esc(r.text)}</div>${demoHTML(r.demo)}`;
  }
  function demoHTML(demo) {
    const [rx, words] = demo;
    return `<div class="rune-demo"><code>${esc(rx)}</code>${words.map(w => `<span class="chip">${markHTML(w, E.spans(rx, w) || [])}</span>`).join("")}</div>`;
  }
  function markHTML(text, marks) {
    let s = "", p = 0;
    marks.forEach(([a, b]) => { s += esc(text.slice(p, a)) + "<mark>" + esc(text.slice(a, b)) + "</mark>"; p = b; });
    return s + esc(text.slice(p));
  }
  function stationCard() {
    const i = G.station, st = C.STATIONS[i];
    $("st-count").textContent = `Halte ${i + 1} van 10`;
    $("st-place").textContent = st.place; $("st-sub").textContent = st.sub;
    $("st-blurb").textContent = st.blurb;
    $("st-taunt").textContent = `${cap(st.creature)}: "${st.taunt}"`;
    $("st-rune").innerHTML = runeCardHTML(i);
    store.set("runes", Math.max(store.get("runes", 0), i + 1));
    anim.creature = { canvas: $("st-creature"), seed: i + 3, feature: A.FEATURES[i], hit: 0, laugh: 0, dead: 0, particles: [] };
    show("scr-station"); setTimeout(() => $("btn-fight").focus({ preventScroll: true }), 50);
  }
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  // ------------------------------------------------------------------ duel
  let D = null; // huidig duel
  function duel(ch) {
    D = { ch, start: performance.now(), limit: calm() ? Infinity : ch.time * 1000, done: false, hint: false, lastTick: 99, hits: new Set() };
    const st = ch.kind === "station" ? C.STATIONS[ch.station] : null;
    $("duel-where").textContent = st ? `Halte ${ch.station + 1} · ${st.place}` : `Toren · verdieping ${ch.floor}${ch.floor >= 5 && !G.freed ? "" : ""}`;
    $("duel-foe").textContent = cap(ch.creature);
    $("duel-prompt").textContent = ch.prompt;
    $("timer").className = "timer" + (calm() ? " calm" : "");
    $("duel-result").hidden = true; $("scr-duel").classList.remove("duel-locked");
    anim.creature = { canvas: $("duel-creature"), seed: (ch.station ?? ch.floor * 7) + 3, feature: st ? A.FEATURES[ch.station] : A.FEATURES[(ch.floor * 3) % A.FEATURES.length], boss: ch.kind === "tower" && ch.floor % 5 === 0, hit: 0, laugh: 0, dead: 0, particles: [] };
    const body = $("duel-body");
    if (ch.type === "golf") body.innerHTML = golfHTML(ch);
    else if (ch.type === "raad") body.innerHTML = `<div class="bigregex">/${esc(ch.rule)}/</div>` + optsHTML(ch.options, false);
    else if (ch.type === "kies") body.innerHTML = fieldsHTML(ch, false) + optsHTML(ch.options, true);
    else if (ch.type === "spoor") { const ln = E.line(ch.line); body.innerHTML = `<div class="manuscript">${markHTML(ln.text, ch.marks)}</div><div class="prov">Handschrift, p. ${esc(ln.page)}, regel ${ln.n} · ${ch.marks.length} ${ch.marks.length === 1 ? "vangst" : "vangsten"}</div>` + optsHTML(ch.options, true); }
    body.insertAdjacentHTML("beforeend", `<div class="btnrow"><button class="btn ghost" id="btn-hint">Briefje van Machteld${calm() ? "" : " (halve punten)"}</button>${ch.type === "golf" ? '<button class="btn ghost" id="btn-giveup">Geef op</button>' : ""}</div><div id="hintslot"></div>`);
    $("btn-hint").onclick = hint;
    if ($("btn-giveup")) $("btn-giveup").onclick = () => finish(false, "Opgegeven");
    if (ch.type === "golf") {
      const inp = $("rx");
      inp.addEventListener("input", () => { S.scratch(); golfCheck(); });
      inp.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); golfCheck(true); } });
      document.querySelectorAll(".runekey").forEach(b => b.addEventListener("click", () => runeKey(b.dataset.k)));
      setTimeout(() => inp.focus({ preventScroll: true }), 60);
    } else {
      document.querySelectorAll(".opt").forEach(b => b.addEventListener("click", () => choose(b)));
    }
    show("scr-duel");
  }
  function fieldsHTML(ch, live) {
    const chips = (ws, cls) => ws.map((w, i) => `<span class="chip" data-${cls}="${i}">${esc(w)}</span>`).join("");
    return `<div class="fields">
      <div class="field net"><h4><span>In het net</span><span id="cnt-c">${live ? "0/" + ch.catch.length : "vangen"}</span></h4><div class="chips">${chips(ch.catch, "c")}</div></div>
      <div class="field bank"><h4><span>Op de oever</span><span>sparen</span></h4><div class="chips">${chips(ch.spare, "s")}</div></div></div>`;
  }
  function runeKeys() {
    const n = runesKnown(), keys = [];
    const add = (i, ks) => { if (n > i) keys.push(...ks); };
    add(1, ["."]); add(2, ["[", "]"]); add(3, ["?"]); add(4, ["+"]); add(5, ["(", "|", ")"]); add(6, ["^", "$"]); add(7, ["[A-Z]", "[a-z]", "-"]); add(8, ["*", ".*"]); add(9, ["\\b"]);
    return keys.map(k => `<button class="runekey" type="button" data-k="${esc(k)}" aria-label="Voeg ${esc(k)} in">${esc(k)}</button>`).join("") + `<button class="runekey del" type="button" data-k="DEL" aria-label="Wis een teken">⌫</button>`;
  }
  function golfHTML(ch) {
    return fieldsHTML(ch, true) + `
      <div class="regexrow"><span aria-hidden="true">/</span><input id="rx" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Jouw regex"><span aria-hidden="true">/</span></div>
      <div class="runekeys">${runeKeys()}</div><div class="status" id="status">Typ een regex. Alles in het net moet goud worden, niets op de oever rood.</div>`;
  }
  function optsHTML(opts, code) {
    return `<div class="opts">${opts.map((o, i) => `<button class="opt" data-v="${esc(o)}"><span class="k">${i + 1}</span><span class="v ${code ? "code" : ""}">${code ? "/" + esc(o) + "/" : esc(o)}</span></button>`).join("")}</div>`;
  }
  function runeKey(k) {
    const inp = $("rx"); if (!inp || D.done) return;
    const s = inp.selectionStart ?? inp.value.length, e = inp.selectionEnd ?? s;
    if (k === "DEL") { const a = s === e ? Math.max(0, s - 1) : s; inp.value = inp.value.slice(0, a) + inp.value.slice(e); inp.setSelectionRange(a, a); }
    else { inp.value = inp.value.slice(0, s) + k + inp.value.slice(e); inp.setSelectionRange(s + k.length, s + k.length); }
    inp.focus(); S.scratch(); golfCheck();
  }
  function golfCheck(enter) {
    if (!D || D.done) return;
    const src = $("rx").value, r = E.evalGolf(src, D.ch);
    let newHit = false, badHit = false;
    document.querySelectorAll("[data-c]").forEach(el => { const i = +el.dataset.c, on = r.catchHits[i]; el.classList.toggle("hit", on); if (on && !D.hits.has(i)) { D.hits.add(i); newHit = true; } if (!on) D.hits.delete(i); });
    document.querySelectorAll("[data-s]").forEach(el => { const on = r.spareHits[+el.dataset.s]; if (on && !el.classList.contains("hit")) badHit = true; el.classList.toggle("hit", on); });
    $("cnt-c").textContent = r.catchHits.filter(Boolean).length + "/" + D.ch.catch.length;
    const st = $("status");
    if (r.error) { st.className = "status err"; st.textContent = r.error; }
    else if (!src) { st.className = "status"; st.textContent = "Typ een regex. Alles in het net moet goud worden, niets op de oever rood."; }
    else { const n = r.spareHits.filter(Boolean).length, m = r.catchHits.filter(x => !x).length; st.className = "status"; st.textContent = r.solved ? "Raak!" : [m ? `Nog ${m} in het net te vangen.` : "", n ? `${n} op de oever ${n === 1 ? "is" : "zijn"} per ongeluk gevangen.` : ""].join(" "); }
    if (newHit) { S.hit(); creatureHit(); }
    if (badHit) { S.oops(); anim.creature.laugh = 1; }
    if (r.solved) { D.done = true; setTimeout(() => finish(true), 380); }
    else if (enter && !r.error && src) { anim.creature.laugh = 1; }
  }
  function choose(btn) {
    if (D.done) return; D.done = true;
    const v = btn.dataset.v, ok = v === D.ch.answer || (D.ch.type === "raad" && v === D.ch.answer);
    document.querySelectorAll(".opt").forEach(b => { b.disabled = true; if (b.dataset.v === D.ch.answer) b.classList.add("right"); });
    if (!ok) btn.classList.add("wrong");
    finish(ok, ok ? null : "Mis");
  }
  function hint() {
    if (!D || D.done || $("hintslot").innerHTML) return;
    D.hint = true; G.hints++;
    const ch = D.ch;
    let h = ch.hint;
    if (!h) {
      if (ch.type === "golf" || ch.type === "kies") h = `Wat hebben alle woorden in het net gemeen dat de woorden op de oever net niet hebben? De kortste oplossing telt ${ch.rule.length} tekens.`;
      else if (ch.type === "raad") h = `Lees de regex hardop: ${readRegex(ch.rule)}. Probeer dat op elk woord.`;
      else h = `Tel de gele vakken en kijk precies waar ze beginnen en eindigen. Welke optie vangt exact die stukjes?`;
    }
    $("hintslot").innerHTML = `<div class="hintbox">${esc(h)}</div>`;
    $("btn-hint").disabled = true;
  }

  function creatureHit() {
    const c = anim.creature; if (!c) return;
    c.hit = 1;
    const cv = c.canvas;
    for (let i = 0; i < 10; i++) c.particles.push({ x: cv.width / 2 + (Math.random() - 0.5) * 40, y: cv.height * 0.55, vx: (Math.random() - 0.5) * 6, vy: -Math.random() * 6 - 1, r: 2 + Math.random() * 4, life: 1, c: "#17131f" });
  }
  function creatureDie() {
    const c = anim.creature; if (!c) return;
    c.dead = 0.001;
    const cv = c.canvas;
    for (let i = 0; i < 46; i++) c.particles.push({ x: cv.width / 2, y: cv.height * 0.58, vx: (Math.random() - 0.5) * 11, vy: -Math.random() * 9, r: 2 + Math.random() * 6, life: 1.4, c: i % 5 ? "#17131f" : "#c99a2e" });
  }

  function flash(kind) { const f = $("flash"); f.className = kind; requestAnimationFrame(() => setTimeout(() => { f.className = ""; }, 80)); }
  function floater(text) {
    const cv = $("duel-creature").getBoundingClientRect(), st = $("stage").getBoundingClientRect(), el = document.createElement("div");
    el.className = "floater"; el.textContent = text;
    const fixed = isNarrow();
    el.style.left = (fixed ? cv.left + cv.width / 2 : cv.left - st.left + cv.width / 2) - 30 + "px";
    el.style.top = (fixed ? cv.top : cv.top - st.top) + "px";
    $("floaters").appendChild(el); setTimeout(() => el.remove(), 1500);
  }

  // ------------------------------------------------------------------ afloop van een vraag
  function finish(ok, why) {
    if (!D) return;
    D.done = true;
    const ch = D.ch, elapsed = (performance.now() - D.start) / 1000, left = calm() ? 0 : Math.max(0, ch.time - elapsed);
    $("scr-duel").classList.add("duel-locked");
    if ($("rx")) $("rx").readOnly = true;
    ["btn-hint", "btn-giveup"].forEach(id => { const b = $(id); if (b) b.parentElement.hidden = true; });
    G.times.push(elapsed);
    let pts = 0, elegant = false;
    if (ok) {
      if (ch.type === "golf") { const src = $("rx").value; elegant = src.length <= ch.rule.length; if (elegant) G.golden++; }
      pts = calm() ? 0 : E.score(ch, left, { elegant, hint: D.hint });
      G.score += pts; G.correct++;
      flash("ok"); S.right(); creatureDie(); if (pts) floater("+" + pts);
    } else {
      G.wrong++; flash("no"); S.wrong(); if (anim.creature) anim.creature.laugh = 1;
    }
    if (ch.kind === "station") G.results[ch.station] = ok;
    hud();
    const R = $("duel-result");
    R.className = "result " + (ok ? "ok" : "no");
    const verdict = ok ? (elegant ? "Raak, met een gouden veer!" : "Raak!") : (why === "Te laat" ? "Te laat!" : why === "Opgegeven" ? "Opgegeven" : "Mis!");
    let h = `<div class="verdict">${verdict}</div>`;
    if (ok && elegant) h += `<p>Jouw regex is even kort als de kortste oplossing (of korter). Dat is regex golf op zijn best.</p>`;
    if (ok && ch.type === "golf" && !elegant) h += `<p>Een kortere oplossing: <code>${esc(ch.rule)}</code></p>`;
    if (!ok) h += `<p>Een oplossing: <code>${esc(ch.rule)}</code></p>`;
    h += `<p>${esc(ch.explain || ("Lees de regex zo: " + readRegex(ch.rule) + "."))}</p>`;
    const prov = provenanceFor(ch);
    if (prov) h += `<p class="quote">Zo staat het in het handschrift (p. ${esc(prov.page)}, regel ${prov.n}): “${markHTML(prov.text, prov.marks)}”</p>`;
    if (ok && pts) h += `<div class="pts">+${pts} punten${D.hint ? " (met briefje)" : ""}</div>`;
    const towerFail = ch.kind === "tower" && !ok;
    h += `<div class="btnrow"><button class="btn primary" id="btn-next">${towerFail ? "Naar de oorkonde" : ch.kind === "tower" ? "Klim verder" : G.station >= 9 ? "Naar de toren" : "Verder"}</button></div>`;
    R.innerHTML = h; R.hidden = false;
    $("btn-next").onclick = () => next(ok);
    setTimeout(() => { R.scrollIntoView({ behavior: "smooth", block: "nearest" }); $("btn-next").focus({ preventScroll: true }); }, 60);
  }
  function provenanceFor(ch) {
    if (ch.type === "spoor") return null;
    const words = ch.type === "raad" ? [ch.answer] : ch.catch;
    for (const w of E.shuffle(words)) { const p = E.provenance(w); if (p) return p; }
    return null;
  }
  function next(ok) {
    const ch = D.ch; D = null;
    if (ch.kind === "station") {
      G.station++;
      if (G.station < 10) { save(); travel(); }
      else { G.phase = "tower"; save(); show(null); walk(9, () => towerIntro()); }
    } else {
      if (!ok) return end();
      G.floor = ch.floor;
      if (G.floor === 5 && !G.freed) { G.freed = true; save(); return freedScene(); }
      save(); towerFloor();
    }
  }

  // ------------------------------------------------------------------ toren
  function towerIntro() {
    G.phase = "tower";
    $("tw-eyebrow").textContent = "Sudden death"; $("tw-title").textContent = "De Toren";
    $("tw-body").textContent = C.STORY.towerIntro + (calm() ? " (In de leertocht loopt er geen klok.)" : "");
    $("btn-climb").textContent = "Klim naar verdieping 1";
    anim.tower = { floor: 0, climb: 0 }; show("scr-tower");
  }
  function freedScene() {
    S.fanfare(); anim.celebrate = anim.t;
    $("tw-eyebrow").textContent = "Verdieping 5"; $("tw-title").textContent = "Machteld is vrij!";
    $("tw-body").textContent = C.STORY.freed;
    $("btn-climb").textContent = "Klim verder";
    anim.tower = { floor: 5, climb: 0 }; show("scr-tower");
  }
  function towerFloor() {
    $("tw-eyebrow").textContent = `Verdieping ${G.floor} gehaald`;
    $("tw-title").textContent = G.floor < 5 ? `Nog ${5 - G.floor} tot Machteld` : "Hoger!";
    $("tw-body").textContent = G.floor < 5 ? "De volgende vraag is iets moeilijker en de klok loopt iets sneller." : "Elke verdieping levert meer punten op. Hoe hoog raak jij?";
    $("btn-climb").textContent = `Klim naar verdieping ${G.floor + 1}`;
    anim.tower = { floor: G.floor, climb: 0 }; show("scr-tower");
  }
  function climb() {
    S.unlock(); anim.tower.climb = 0.001;
    setTimeout(() => {
      const ch = E.tower(G.floor + 1, G.lastType) || E.tower(G.floor + 1, null);
      G.lastType = ch.type; duel(ch);
    }, 650);
  }

  // ------------------------------------------------------------------ einde
  function end() {
    G.phase = "end"; store.del("run"); S.fall();
    const top = store.get("top", []);
    let rank = -1;
    if (!calm()) {
      const entry = { name: G.name, score: G.score, floor: G.floor, freed: G.freed, correct: G.correct, date: new Date().toISOString().slice(0, 10), id: Date.now() };
      top.push(entry); top.sort((a, b) => b.score - a.score); top.splice(10);
      store.set("top", top); rank = top.findIndex(e => e.id === entry.id); G.entryId = entry.id;
    }
    const o = $("oorkonde");
    o.innerHTML = `<div class="eyebrow">Oorkonde</div><div class="o-title">${G.freed ? "Bevrijder van Machteld" : "Dappere kopiist"}</div>
      <div>Hierbij wordt bevestigd dat</div><div class="o-name">${esc(G.name)}</div>
      <div>de Grote Onleesbare trotseerde tot op verdieping ${G.floor} van de toren.</div>
      <canvas id="seal" width="240" height="240"></canvas>
      <div class="o-score">${calm() ? G.correct + " juist" : G.score + " pt"}</div>
      <small>${calm() ? "leertocht zonder klok" : G.correct === 1 ? "1 juist antwoord" : G.correct + " juiste antwoorden"} · ${new Date().toLocaleDateString("nl-BE")}</small>`;
    A.drawSeal($("seal"), G.freed);
    $("end-story").textContent = G.freed ? C.STORY.fallLate : C.STORY.fallEarly;
    const avg = G.times.length ? (G.times.reduce((a, b) => a + b, 0) / G.times.length) : 0;
    $("end-stats").innerHTML = `<div class="statgrid">
      <div class="stat"><b>${G.correct}</b><span>juist</span></div><div class="stat"><b>${G.wrong}</b><span>fout</span></div>
      <div class="stat"><b>${G.floor}</b><span>hoogste verdieping</span></div><div class="stat"><b>${G.golden}</b><span>gouden veren</span></div>
      <div class="stat"><b>${avg.toFixed(1)} s</b><span>per vraag</span></div></div>
      ${rank >= 0 ? `<p><b>Je staat op plaats ${rank + 1} in de erelijst van dit toestel.</b></p>` : calm() ? "<p>Leertochten tellen niet mee voor de erelijst. Probeer nu de tocht met de klok!</p>" : "<p>Net niet in de top 10 van dit toestel. Nog een keer?</p>"}`;
    $("end-top").innerHTML = topHTML(top, G.entryId);
    hud(); show("scr-end");
  }
  function topHTML(top, me) {
    if (!top.length) return "<li>Nog niemand. Wees de eerste!</li>";
    return top.map(e => `<li class="${e.id === me ? "me" : ""}"><span class="tl-score">${e.score} pt</span>${esc(e.name)} <span class="tl-meta">· verdieping ${e.floor}${e.freed ? " · Machteld bevrijd" : ""} · ${e.date}</span></li>`).join("");
  }

  // ------------------------------------------------------------------ bewaren en hervatten
  function save() { store.set("run", G); }
  function resume() {
    const s = store.get("run", null); if (!s) return title();
    S.unlock(); G = s;
    if (G.phase === "tower") { anim.player = A.routePoint(10); if (G.floor === 0) towerIntro(); else towerFloor(); }
    else { G.phase = "journey"; anim.player = G.station > 0 ? A.routePoint(G.station - 1) : [560, 150]; if (G.station === 0) beginJourney(); else travel(); }
  }

  // ------------------------------------------------------------------ regex voorlezen
  function readRegex(src) {
    const out = []; let i = 0;
    const quant = q => q === "?" ? " (mag ontbreken)" : q === "+" ? " (één of meer keer)" : q === "*" ? " (nul of meer keer)" : "";
    while (i < src.length) {
      let part = "", c = src[i];
      if (c === "^") { out.push("aan het begin"); i++; continue; }
      if (c === "$") { out.push("aan het einde"); i++; continue; }
      if (c === "\\" && src[i + 1] === "b") { out.push("een woordgrens"); i += 2; continue; }
      if (c === "\\" && src[i + 1] === "w") { part = "een letter"; i += 2; }
      else if (c === ".") { part = "een willekeurig teken"; i++; }
      else if (c === "[") { const j = src.indexOf("]", i); const inner = src.slice(i + 1, j); part = inner === "A-Z" ? "een hoofdletter" : inner === "a-z" ? "een kleine letter" : inner === "0-9" ? "een cijfer" : inner.startsWith("^") ? "een teken dat geen " + inner.slice(1).split("").join(", ") + " is" : "een " + inner.split("").join(" of een "); i = j + 1; }
      else if (c === "(") { let d = 0, j = i; for (; j < src.length; j++) { if (src[j] === "(") d++; if (src[j] === ")") { d--; if (!d) break; } } part = src.slice(i + 1, j).split("|").map(x => "“" + x + "”").join(" of "); i = j + 1; }
      else if (c === "|") { out.push("óf"); i++; continue; }
      else { let j = i; while (j < src.length && /[A-Za-z@]/.test(src[j]) && !/[?+*]/.test(src[j + 1] || "")) j++; if (j === i) j = i + 1; part = "“" + src.slice(i, j) + "”"; i = j; }
      const q = /[?+*]/.test(src[i] || "") ? src[i++] : "";
      if (part === "een willekeurig teken" && q === "*") out.push("om het even wat");
      else out.push(part + quant(q));
    }
    return out.join(", dan ").replace(/^aan het begin, dan /, "aan het begin ").replace(/, dan aan het einde$/, " en dan het einde van het woord");
  }

  // ------------------------------------------------------------------ overlays
  function openOverlay(id) {
    if (id === "ovl-runes") {
      const n = Math.max(runesKnown(), store.get("runes", 0));
      $("runebook").innerHTML = C.RUNES.map((r, i) => i < n ? `<div class="rb"><div class="g">${esc(r.glyph)}</div><div class="n">${esc(r.name)}</div><p>${esc(r.text)}</p>${demoHTML(r.demo)}</div>` : `<div class="rb locked"><div class="g">?</div><div class="n">Regex ${i + 1}</div><p>Te vinden in ${esc(C.STATIONS[i].place)}.</p></div>`).join("");
    }
    if (id === "ovl-top") $("toplist").innerHTML = topHTML(store.get("top", []), G && G.entryId);
    const o = $(id); o.hidden = false; o.dataset.prev = document.activeElement && document.activeElement.id || "";
    setTimeout(() => o.querySelector(".close").focus(), 30);
  }
  function closeOverlays() { document.querySelectorAll(".overlay").forEach(o => { if (!o.hidden) { o.hidden = true; const p = o.dataset.prev && $(o.dataset.prev); if (p) p.focus({ preventScroll: true }); } }); }

  // ------------------------------------------------------------------ lus
  function loop(now) {
    const t = now / 1000, dt = Math.min(0.05, t - (anim.t || t)); anim.t = t;
    // lopen
    if (anim.walk) {
      const w = anim.walk, p = Math.min(1, (now - w.start) / w.dur), e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      anim.player = A.playerPos(w.seg, e);
      if (now - w.lastStep > 260) { S.step(); w.lastStep = now; }
      if (p >= 1) { anim.walk = null; w.done && w.done(); }
    }
    A.drawMap($("map"), { t, results: G ? G.results : [], walk: anim.walk, phase: G ? G.phase : "title", freed: G && G.freed, player: anim.player, walking: !!anim.walk, celebrate: anim.celebrate });
    // wezen
    const c = anim.creature;
    if (c && !c.canvas.closest("[hidden]")) {
      c.hit = Math.max(0, c.hit - dt * 3); c.laugh = Math.max(0, c.laugh - dt * 1.2);
      if (c.dead) c.dead = Math.min(1, c.dead + dt * 2.2);
      c.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.35; p.life -= dt * 0.9; });
      c.particles = c.particles.filter(p => p.life > 0);
      A.drawCreature(c.canvas, { t, seed: c.seed, feature: c.feature, boss: c.boss, hit: c.hit, laugh: c.laugh, dead: c.dead, particles: c.particles });
    }
    if (anim.scene && !$("scr-story").hidden) A.drawScene($("story-art"), anim.scene, t);
    if (anim.tower && !$("scr-tower").hidden) {
      if (anim.tower.climb) anim.tower.climb = Math.min(1, anim.tower.climb + dt * 1.6);
      A.drawTowerView($("tower-art"), { t, floor: anim.tower.floor + (anim.tower.climb ? 1 : 0), climb: anim.tower.climb && anim.tower.climb < 1 ? anim.tower.climb : 0, freed: G && G.freed });
    }
    // klok
    if (D && !D.done && D.limit !== Infinity) {
      const left = D.limit - (now - D.start), frac = Math.max(0, left / D.limit);
      $("timer-fill").style.transform = `scaleX(${frac})`;
      $("timer").classList.toggle("low", left < 5000);
      const sec = Math.ceil(left / 1000); if (sec <= 5 && sec < D.lastTick && sec > 0) { D.lastTick = sec; S.tick(); }
      if (left <= 0) {
        D.done = true;
        document.querySelectorAll(".opt").forEach(b => { b.disabled = true; if (b.dataset.v === D.ch.answer) b.classList.add("right"); });
        finish(false, "Te laat");
      }
    }
    requestAnimationFrame(loop);
  }

  // ------------------------------------------------------------------ knoppen
  function wire() {
    $("btn-start").onclick = () => start("normal");
    $("btn-calm").onclick = () => start("calm");
    $("btn-resume").onclick = resume;
    $("btn-story-next").onclick = storyNext;
    $("btn-story-skip").onclick = beginJourney;
    $("btn-go").onclick = go;
    $("btn-fight").onclick = () => duel(E.station(G.station));
    $("btn-climb").onclick = climb;
    $("btn-again").onclick = () => start(G ? G.mode : "normal");
    $("btn-home").onclick = title;
    $("btn-runes").onclick = () => openOverlay("ovl-runes");
    $("lnk-runes").onclick = () => openOverlay("ovl-runes");
    $("lnk-top").onclick = () => openOverlay("ovl-top");
    $("lnk-about").onclick = () => openOverlay("ovl-about");
    $("btn-sound").onclick = () => { const on = S.toggle(); $("btn-sound").classList.toggle("off", !on); };
    $("btn-sound").classList.toggle("off", !S.on);
    document.querySelectorAll("[data-close]").forEach(b => b.onclick = closeOverlays);
    document.querySelectorAll(".overlay").forEach(o => o.addEventListener("click", e => { if (e.target === o) closeOverlays(); }));
    $("inp-name").addEventListener("keydown", e => { if (e.key === "Enter") start("normal"); });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") return closeOverlays();
      if (D && !D.done && D.ch.type !== "golf" && /^[1-4]$/.test(e.key) && !$("scr-duel").hidden) {
        const b = document.querySelectorAll(".opt")[+e.key - 1]; if (b) choose(b);
      }
    });
    document.addEventListener("pointerdown", () => S.unlock(), { once: true });
  }

  // ------------------------------------------------------------------ opstarten
  function jump() {
    const m = /^#halte(\d+)$/.exec(location.hash), tm = /^#toren(\d*)$/.exec(location.hash), tw = !!tm;
    if (!m && !tw) return false;
    G = fresh("normal"); G.phase = "journey";
    if (tw) { G.station = 10; G.results = Array(10).fill(true); G.phase = "tower"; anim.player = A.routePoint(10); G.floor = Math.max(0, (+tm[1] || 1) - 1); if (G.floor) towerFloor(); else towerIntro(); return true; }
    const n = Math.max(1, Math.min(10, +m[1]));
    G.station = n - 1; G.results = Array(n - 1).fill(true);
    anim.player = n > 1 ? A.routePoint(n - 2) : [560, 150];
    if (n === 1) beginJourney(); else travel();
    return true;
  }
  const boot = () => { A.init(C.STATIONS); wire(); if (!jump()) title(); requestAnimationFrame(loop); };
  if (document.fonts && document.fonts.load) {
    const want = ["500 30px 'Grenze Gotisch'", "600 21px 'Alegreya SC'", "italic 19px Alegreya", "19px Alegreya", "700 22px 'JetBrains Mono'"];
    Promise.race([Promise.all(want.map(f => document.fonts.load(f).catch(() => null))), new Promise(r => setTimeout(r, 3000))]).then(boot);
  }
  else boot();
})();
