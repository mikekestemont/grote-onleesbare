/* Kleine klanken, gesynthetiseerd met Web Audio (geen bestanden). Pas actief na de eerste klik. */
window.SFX = (function () {
  let ctx = null, on = true;
  try { on = localStorage.getItem("onleesbare.sound") !== "off"; } catch (e) {}
  function ac() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function tone(freq, start, dur, type, vol) {
    const a = ac(); if (!a || !on) return;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type || "sine"; o.frequency.value = freq;
    const t0 = a.currentTime + start;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.15, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(a.destination); o.start(t0); o.stop(t0 + dur + 0.02);
  }
  function noise(start, dur, vol, freq) {
    const a = ac(); if (!a || !on) return;
    const len = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    f.type = "bandpass"; f.frequency.value = freq || 3000; f.Q.value = 0.8; g.gain.value = vol || 0.06;
    s.buffer = buf; s.connect(f).connect(g).connect(a.destination); s.start(a.currentTime + start);
  }
  return {
    get on() { return on; },
    toggle() { on = !on; try { localStorage.setItem("onleesbare.sound", on ? "on" : "off"); } catch (e) {} return on; },
    unlock() { ac(); },
    scratch() { noise(0, 0.05, 0.035, 4200); },
    hit() { tone(660, 0, 0.12, "triangle", 0.12); noise(0, 0.08, 0.05, 1200); },
    oops() { tone(180, 0, 0.18, "square", 0.05); },
    right() { tone(523, 0, 0.18, "sine", 0.16); tone(659, 0.09, 0.18, "sine", 0.16); tone(784, 0.18, 0.35, "sine", 0.16); },
    wrong() { tone(220, 0, 0.3, "triangle", 0.18); tone(165, 0.12, 0.45, "triangle", 0.16); },
    tick() { tone(1200, 0, 0.04, "square", 0.03); },
    step() { noise(0, 0.04, 0.03, 600); },
    fanfare() { [523, 659, 784, 1046, 784, 1046].forEach((f, i) => tone(f, i * 0.13, 0.32, "triangle", 0.14)); },
    fall() { for (let i = 0; i < 8; i++) tone(700 - i * 70, i * 0.07, 0.12, "sine", 0.1); }
  };
})();
