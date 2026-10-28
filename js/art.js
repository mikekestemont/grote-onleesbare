/* Alle tekenwerk: de kaart van Vlaendren, de inktwezens, de verhaalscènes en de toren. Alles procedureel op canvas. */
window.ART = (function () {
  const W = 1600, H = 1000, TOWER = { x: 1468, y: 318 };
  const COL = {
    vellum: "#efe2c0", ink: "#2a1f16", sepia: "#6e5236", rubric: "#b8321f", verdigris: "#2f7d6d",
    gold: "#c99a2e", night: "#17131f", sea: "rgba(96,132,126,0.30)", water: "#9fb9b0", tree: ["#8d9a5f", "#7c8f58", "#a2a466", "#6f8452", "#b8843f"]
  };
  function rng(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  function smooth(ctx, pts, close) {
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
      ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
    }
    const l = pts[pts.length - 1];
    if (close) ctx.quadraticCurveTo(l[0], l[1], (l[0] + pts[0][0]) / 2, (l[1] + pts[0][1]) / 2); else ctx.lineTo(l[0], l[1]);
  }

  // ------------------------------------------------------------------ kaart: vaste laag
  const COAST = [[0, 365], [90, 348], [180, 326], [270, 302], [360, 274], [450, 242], [528, 206], [586, 168], [640, 128], [700, 86], [760, 42], [812, 0]];
  const LEIE = [[60, 1010], [150, 930], [270, 895], [400, 880], [520, 852], [640, 812], [760, 745], [860, 680], [945, 630], [1000, 604]];
  const SCHELDE = [[880, 1010], [915, 900], [960, 760], [995, 640], [1010, 600], [1090, 585], [1180, 600], [1265, 572], [1345, 545], [1420, 500], [1520, 452], [1610, 430]];
  const VILLAGES = [["Oostkamp", 600, 420], ["Aalter", 820, 470], ["Tielt", 600, 640], ["Roeselare", 310, 690], ["Diksmuide", 150, 560], ["Poperinge", 90, 790],
    ["Eeklo", 900, 360], ["Deinze", 690, 760], ["Lokeren", 1240, 470], ["Oudenaerde", 860, 900], ["Thielt-Winge", 1120, 900]];

  function makeStatic(stations) {
    const S = 1.25, c = document.createElement("canvas"); c.width = W * S; c.height = H * S;
    const ctx = c.getContext("2d"); ctx.scale(S, S);
    const R = rng(1302);
    // perkament
    ctx.fillStyle = COL.vellum; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 26; i++) {
      const x = R() * W, y = R() * H, r = 60 + R() * 260, g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${150 + R() * 40},${110 + R() * 30},${60 + R() * 30},${0.05 + R() * 0.06})`); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
    for (let i = 0; i < 14000; i++) { ctx.fillStyle = `rgba(80,55,30,${0.02 + R() * 0.06})`; ctx.fillRect(R() * W, R() * H, 1 + R() * 1.6, 1 + R() * 1.6); }
    // vouwen
    ctx.strokeStyle = "rgba(110,82,54,0.18)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2 + 3, H); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2 - 4); ctx.stroke();
    ctx.strokeStyle = "rgba(255,250,235,0.35)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W / 2 + 2, 0); ctx.lineTo(W / 2 + 5, H); ctx.moveTo(0, H / 2 + 2); ctx.lineTo(W, H / 2 - 2); ctx.stroke();

    // zee
    const sea = new Path2D(); sea.moveTo(0, 0); COAST.forEach(p => sea.lineTo(p[0], p[1])); sea.lineTo(0, 0); sea.closePath();
    ctx.fillStyle = COL.sea; ctx.fill(sea);
    ctx.save(); ctx.clip(sea);
    ctx.strokeStyle = "rgba(42,31,22,0.32)"; ctx.lineWidth = 1.1;
    for (let y = 14; y < 380; y += 21) for (let x = (y / 21 % 2) * 17; x < 840; x += 34) {
      const jx = x + R() * 6, jy = y + R() * 4; ctx.beginPath(); ctx.arc(jx, jy, 6, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    }
    ctx.restore();
    for (let k = 3; k >= 1; k--) {
      ctx.strokeStyle = `rgba(42,31,22,${0.12 * k})`; ctx.lineWidth = 1;
      ctx.beginPath(); COAST.forEach((p, i) => { const q = [p[0] - k * 6, p[1] - k * 7]; i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.stroke();
    }
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 2.2; ctx.beginPath(); smooth(ctx, COAST); ctx.stroke();
    // duinen
    ctx.fillStyle = "rgba(110,82,54,0.45)";
    for (let i = 0; i < 160; i++) { const t = R(), a = Math.floor(t * (COAST.length - 1)), f = t * (COAST.length - 1) - a; const p = COAST[a], q = COAST[a + 1]; ctx.fillRect(p[0] + (q[0] - p[0]) * f + 4 + R() * 14, p[1] + (q[1] - p[1]) * f + 4 + R() * 12, 1.4, 1.4); }
    // Zwin
    ctx.fillStyle = COL.water; ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(574, 176); ctx.quadraticCurveTo(610, 200, 640, 238); ctx.quadraticCurveTo(650, 246, 656, 240); ctx.quadraticCurveTo(632, 196, 606, 152); ctx.closePath(); ctx.fill(); ctx.stroke();

    // rivieren
    function river(pts, w) {
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.strokeStyle = COL.ink; ctx.lineWidth = w + 3; ctx.beginPath(); smooth(ctx, pts); ctx.stroke();
      ctx.strokeStyle = COL.water; ctx.lineWidth = w; ctx.beginPath(); smooth(ctx, pts); ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 1; ctx.setLineDash([6, 10]); ctx.beginPath(); smooth(ctx, pts); ctx.stroke(); ctx.setLineDash([]);
    }
    river(LEIE, 7); river(SCHELDE, 9);
    river([[520, 330], [600, 380], [700, 430], [820, 500], [930, 560], [1000, 604]], 3); // vaart Brugge-Gent

    // akkers
    function fields(cx, cy, n, spread) {
      for (let i = 0; i < n; i++) {
        const x = cx + (R() - 0.5) * spread, y = cy + (R() - 0.5) * spread * 0.6, w = 34 + R() * 40, h = 20 + R() * 22, a = (R() - 0.5) * 0.6;
        ctx.save(); ctx.translate(x, y); ctx.rotate(a);
        ctx.fillStyle = R() < 0.5 ? "rgba(201,154,46,0.18)" : "rgba(110,140,80,0.16)"; ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.strokeStyle = "rgba(110,82,54,0.35)"; ctx.lineWidth = 0.8; ctx.strokeRect(-w / 2, -h / 2, w, h);
        ctx.beginPath(); for (let k = -w / 2 + 5; k < w / 2; k += 5) { ctx.moveTo(k, -h / 2 + 2); ctx.lineTo(k, h / 2 - 2); } ctx.stroke();
        ctx.restore();
      }
    }
    fields(470, 420, 9, 160); fields(560, 650, 8, 200); fields(900, 720, 9, 220); fields(1150, 680, 6, 160); fields(330, 860, 6, 160); fields(820, 420, 6, 160);

    // grassprietjes
    const seaHit = (x, y) => ctx.isPointInPath(sea, x * S, y * S);
    ctx.strokeStyle = "rgba(90,70,40,0.28)"; ctx.lineWidth = 0.9;
    for (let i = 0; i < 900; i++) {
      const x = R() * W, y = R() * H; if (seaHit(x, y)) continue;
      ctx.beginPath(); ctx.moveTo(x - 3, y - 4); ctx.lineTo(x, y); ctx.lineTo(x + 3, y - 4); ctx.stroke();
    }

    // bossen
    function tree(x, y, s) {
      ctx.fillStyle = "rgba(42,31,22,0.15)"; ctx.beginPath(); ctx.ellipse(x + 3, y + 3, 9 * s, 4 * s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x, y + 2); ctx.lineTo(x, y - 6 * s); ctx.stroke();
      ctx.fillStyle = COL.tree[Math.floor(R() * COL.tree.length)];
      ctx.beginPath(); ctx.arc(x, y - 11 * s, 8 * s, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 1.2; ctx.stroke();
      ctx.strokeStyle = "rgba(42,31,22,0.4)"; ctx.beginPath(); ctx.arc(x + 1.5 * s, y - 10 * s, 5.5 * s, 0.2, 1.6); ctx.stroke();
    }
    function forest(cx, cy, n, rx, ry, avoid) {
      const pts = [];
      for (let i = 0; i < n; i++) {
        const a = R() * Math.PI * 2, d = Math.sqrt(R());
        const x = cx + Math.cos(a) * rx * d, y = cy + Math.sin(a) * ry * d;
        if (avoid && Math.hypot(x - avoid[0], y - avoid[1]) < 38) continue;
        pts.push([x, y]);
      }
      pts.sort((p, q) => p[1] - q[1]).forEach(p => tree(p[0], p[1], 0.9 + R() * 0.5));
    }
    forest(330, 470, 85, 120, 80, [330, 470]);
    forest(780, 300, 16, 50, 30); forest(1080, 760, 14, 50, 30); forest(480, 740, 18, 70, 40); forest(1250, 760, 10, 50, 30); forest(130, 470, 14, 60, 40);
    forest(1300, 860, 12, 60, 40); forest(700, 560, 10, 50, 30);

    // Kemmelberg
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.4;
    [[150, 900, 38], [200, 912, 26], [110, 915, 22]].forEach(([x, y, r]) => {
      ctx.fillStyle = "rgba(160,140,90,0.25)"; ctx.beginPath(); ctx.arc(x, y, r, Math.PI, 0); ctx.fill(); ctx.stroke();
      ctx.lineWidth = 0.8; for (let k = 0; k < 6; k++) { const a = Math.PI + 0.3 + k * 0.4; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); ctx.lineTo(x + Math.cos(a) * (r - 8), y + Math.sin(a) * (r - 8) + 4); ctx.stroke(); } ctx.lineWidth = 1.4;
    });

    // dorpjes
    VILLAGES.forEach(([n, x, y]) => {
      ctx.fillStyle = "#a8573a"; ctx.strokeStyle = COL.ink; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x - 7, y); ctx.lineTo(x, y - 8); ctx.lineTo(x + 7, y); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#efe2c0"; ctx.fillRect(x - 6, y, 12, 7); ctx.strokeRect(x - 6, y, 12, 7);
      ctx.fillStyle = COL.sepia; ctx.font = "italic 15px Alegreya, Georgia, serif"; ctx.textAlign = "center"; ctx.fillText(n, x, y + 22);
    });

    // haltes
    stations.forEach(st => ICONS[st.icon] && ICONS[st.icon](ctx, st.x, st.y, R));
    stations.forEach(st => {
      ctx.textAlign = "center"; ctx.fillStyle = COL.ink; ctx.font = "600 21px 'Alegreya SC', Georgia, serif";
      ctx.lineWidth = 4; ctx.strokeStyle = "rgba(239,226,192,0.9)"; ctx.strokeText(st.place, st.x, st.y + 46); ctx.fillText(st.place, st.x, st.y + 46);
    });

    // rivier- en streeknamen
    function label(t, x, y, a, font, color, spacing) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(a || 0); ctx.font = font; ctx.fillStyle = color; ctx.textAlign = "center";
      if (spacing) { const chars = t.split(""), w = chars.reduce((s, c) => s + ctx.measureText(c).width + spacing, 0); let px = -w / 2; chars.forEach(c => { ctx.fillText(c, px + ctx.measureText(c).width / 2, 0); px += ctx.measureText(c).width + spacing; }); }
      else ctx.fillText(t, 0, 0);
      ctx.restore();
    }
    label("VLAENDREN", 760, 640, -0.04, "700 64px 'Alegreya SC', Georgia, serif", "rgba(184,50,31,0.16)", 28);
    label("De Zee van Inkt", 300, 238, -0.26, "italic 34px Alegreya, Georgia, serif", "rgba(42,31,22,0.55)", 4);
    label("Leie", 420, 905, -0.1, "italic 19px Alegreya, Georgia, serif", COL.sepia);
    label("Schelde", 1210, 618, -0.2, "italic 19px Alegreya, Georgia, serif", COL.sepia);
    label("Zwin", 585, 220, 0.9, "italic 15px Alegreya, Georgia, serif", COL.sepia);
    label("Kemmelberg", 150, 942, 0, "italic 15px Alegreya, Georgia, serif", COL.sepia);

    // windroos
    (function (x, y, r) {
      ctx.save(); ctx.translate(x, y);
      for (let i = 0; i < 16; i++) { ctx.strokeStyle = "rgba(42,31,22,0.25)"; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(0, 0); const a = i * Math.PI / 8; ctx.lineTo(Math.cos(a) * r * 1.5, Math.sin(a) * r * 1.5); ctx.stroke(); }
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4 - Math.PI / 2, l = i % 2 ? r * 0.55 : r;
        ctx.fillStyle = i % 2 ? COL.sepia : (i === 0 ? COL.rubric : COL.ink); ctx.beginPath(); ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a - 0.22) * l * 0.32, Math.sin(a - 0.22) * l * 0.32); ctx.lineTo(Math.cos(a) * l, Math.sin(a) * l); ctx.closePath(); ctx.fill();
        ctx.fillStyle = COL.vellum; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a + 0.22) * l * 0.32, Math.sin(a + 0.22) * l * 0.32); ctx.lineTo(Math.cos(a) * l, Math.sin(a) * l); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = COL.ink; ctx.lineWidth = 1; ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fillStyle = COL.gold; ctx.fill(); ctx.stroke();
      ctx.fillStyle = COL.ink; ctx.font = "700 22px 'Alegreya SC', Georgia, serif"; ctx.textAlign = "center"; ctx.fillText("N", 0, -r - 8);
      ctx.restore();
    })(120, 125, 62);

    // kogge
    (function (x, y) {
      ctx.save(); ctx.translate(x, y); ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.6;
      ctx.fillStyle = "#8a5a35"; ctx.beginPath(); ctx.moveTo(-34, 0); ctx.quadraticCurveTo(0, 22, 36, 0); ctx.lineTo(30, -6); ctx.lineTo(-30, -6); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(0, -62); ctx.stroke();
      ctx.fillStyle = "#f5ecd2"; ctx.beginPath(); ctx.moveTo(-22, -54); ctx.quadraticCurveTo(-4, -34, -22, -12); ctx.lineTo(22, -12); ctx.quadraticCurveTo(6, -34, 22, -54); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = "rgba(184,50,31,0.7)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-14, -42); ctx.lineTo(14, -42); ctx.moveTo(-14, -26); ctx.lineTo(14, -26); ctx.stroke();
      ctx.fillStyle = COL.rubric; ctx.beginPath(); ctx.moveTo(0, -62); ctx.lineTo(16, -58); ctx.lineTo(0, -54); ctx.fill();
      ctx.restore();
    })(470, 150);

    // zeeslang van @
    (function (x, y) {
      ctx.save(); ctx.translate(x, y); ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.5; ctx.fillStyle = "#4f6b66";
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(i * 34, 0, 14, Math.PI, 0); ctx.fill(); ctx.stroke(); }
      ctx.beginPath(); ctx.ellipse(-26, -10, 15, 10, -0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(-31, -14, 3.5, 0, 7); ctx.fill(); ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(-32, -14, 1.7, 0, 7); ctx.fill();
      ctx.strokeStyle = COL.rubric; ctx.beginPath(); ctx.moveTo(-40, -6); ctx.lineTo(-50, -2); ctx.lineTo(-46, -8); ctx.stroke();
      ctx.font = "700 34px 'JetBrains Mono', monospace"; ctx.fillStyle = "#4f6b66"; ctx.strokeStyle = COL.ink; ctx.lineWidth = 1; ctx.fillText("@", 82, 10); ctx.strokeText("@", 82, 10);
      ctx.restore();
    })(270, 70);

    // cartouche
    (function () {
      const x = 28, y = 862, w = 340, h = 112;
      ctx.fillStyle = "rgba(245,235,205,0.92)"; ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h); ctx.lineWidth = 0.8; ctx.strokeRect(x + 6, y + 6, w - 12, h - 12);
      ctx.textAlign = "center"; ctx.fillStyle = COL.ink; ctx.font = "500 30px 'Grenze Gotisch', Georgia, serif"; ctx.fillText("Kaerte van Vlaendren", x + w / 2, y + 40);
      ctx.font = "italic 16px Alegreya, Georgia, serif"; ctx.fillStyle = COL.sepia; ctx.fillText("zooals Conscience het droomde, anno 1838", x + w / 2, y + 62);
      ctx.fillStyle = COL.ink; for (let i = 0; i < 5; i++) { ctx.fillStyle = i % 2 ? COL.vellum : COL.ink; ctx.fillRect(x + 70 + i * 40, y + 78, 40, 7); } ctx.strokeRect(x + 70, y + 78, 200, 7);
      ctx.font = "13px Alegreya, Georgia, serif"; ctx.fillStyle = COL.sepia; ctx.fillText("1 regel = 1 mijl", x + w / 2, y + 100);
    })();

    // kader
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 3; ctx.strokeRect(10, 10, W - 20, H - 20); ctx.lineWidth = 1; ctx.strokeRect(19, 19, W - 38, H - 38);
    ctx.lineWidth = 1;
    for (let x = 19; x < W - 19; x += 40) { ctx.beginPath(); ctx.moveTo(x, 10); ctx.lineTo(x, 19); ctx.moveTo(x, H - 19); ctx.lineTo(x, H - 10); ctx.stroke(); }
    for (let y = 19; y < H - 19; y += 40) { ctx.beginPath(); ctx.moveTo(10, y); ctx.lineTo(19, y); ctx.moveTo(W - 19, y); ctx.lineTo(W - 10, y); ctx.stroke(); }
    // vignet
    const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 0.95); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(70,45,20,0.28)");
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    return c;
  }

  // ------------------------------------------------------------------ iconen van de haltes
  function house(ctx, x, y, w, h, roof) {
    ctx.fillStyle = "#f3e7c8"; ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.3;
    ctx.fillRect(x - w / 2, y - h, w, h); ctx.strokeRect(x - w / 2, y - h, w, h);
    ctx.fillStyle = roof || "#a8573a"; ctx.beginPath(); ctx.moveTo(x - w / 2 - 2, y - h); ctx.lineTo(x, y - h - w * 0.6); ctx.lineTo(x + w / 2 + 2, y - h); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = COL.ink; ctx.fillRect(x - 2, y - h * 0.55, 4, h * 0.55 - 1);
  }
  function tower(ctx, x, y, w, h, top) {
    ctx.fillStyle = "#eadbb4"; ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.4;
    ctx.fillRect(x - w / 2, y - h, w, h); ctx.strokeRect(x - w / 2, y - h, w, h);
    if (top === "spire") { ctx.fillStyle = "#5d6f74"; ctx.beginPath(); ctx.moveTo(x - w / 2 - 1, y - h); ctx.lineTo(x, y - h - w * 1.4); ctx.lineTo(x + w / 2 + 1, y - h); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    else { ctx.fillStyle = "#eadbb4"; for (let i = 0; i < 3; i++) { const cx = x - w / 2 + i * w / 2.5; ctx.fillRect(cx, y - h - 5, w / 5, 5); ctx.strokeRect(cx, y - h - 5, w / 5, 5); } }
    ctx.fillStyle = COL.ink; ctx.fillRect(x - 1.5, y - h * 0.75, 3, 6);
  }
  const ICONS = {
    harbour(ctx, x, y) { house(ctx, x - 22, y + 8, 14, 12); house(ctx, x - 6, y + 4, 16, 16, "#8f4a30"); house(ctx, x + 12, y + 8, 13, 11);
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 26, y + 8); ctx.lineTo(x + 26, y - 26); ctx.lineTo(x + 40, y - 18); ctx.stroke();
      ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 40, y - 18); ctx.lineTo(x + 40, y - 6); ctx.stroke(); ctx.fillStyle = "#8a5a35"; ctx.fillRect(x + 36, y - 6, 8, 6); },
    castle(ctx, x, y) { ctx.fillStyle = COL.water; ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(x, y + 6, 38, 14, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#eadbb4"; ctx.fillRect(x - 20, y - 14, 40, 18); ctx.strokeRect(x - 20, y - 14, 40, 18);
      tower(ctx, x - 22, y + 4, 12, 30, "spire"); tower(ctx, x + 22, y + 4, 12, 30, "spire"); tower(ctx, x, y - 10, 14, 16, "spire"); },
    belfry(ctx, x, y) { house(ctx, x - 26, y + 10, 14, 14); house(ctx, x + 24, y + 10, 14, 13, "#8f4a30"); house(ctx, x - 12, y + 12, 12, 10);
      tower(ctx, x, y + 10, 18, 48); ctx.fillStyle = "#eadbb4"; ctx.fillRect(x - 7, y - 54, 14, 18); ctx.strokeRect(x - 7, y - 54, 14, 18);
      ctx.fillStyle = "#5d6f74"; ctx.beginPath(); ctx.moveTo(x - 8, y - 54); ctx.lineTo(x, y - 68); ctx.lineTo(x + 8, y - 54); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = COL.gold; ctx.beginPath(); ctx.arc(x, y - 44, 3.5, 0, 7); ctx.fill(); ctx.stroke(); },
    forest(ctx, x, y) { tower(ctx, x, y + 8, 16, 26); ctx.fillStyle = "#eadbb4"; ctx.fillRect(x + 8, y - 6, 18, 14); ctx.strokeRect(x + 8, y - 6, 18, 14);
      ctx.fillStyle = "#a8573a"; ctx.beginPath(); ctx.moveTo(x + 6, y - 6); ctx.lineTo(x + 17, y - 16); ctx.lineTo(x + 28, y - 6); ctx.closePath(); ctx.fill(); ctx.stroke(); },
    church(ctx, x, y) { house(ctx, x - 22, y + 10, 13, 12); house(ctx, x + 22, y + 10, 13, 12, "#8f4a30");
      ctx.fillStyle = "#eadbb4"; ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.4; ctx.fillRect(x - 14, y - 8, 28, 18); ctx.strokeRect(x - 14, y - 8, 28, 18);
      ctx.fillStyle = "#a8573a"; ctx.beginPath(); ctx.moveTo(x - 16, y - 8); ctx.lineTo(x, y - 20); ctx.lineTo(x + 16, y - 8); ctx.closePath(); ctx.fill(); ctx.stroke();
      tower(ctx, x - 10, y + 10, 10, 34, "spire"); },
    hall(ctx, x, y) { ctx.fillStyle = "#eadbb4"; ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.4; ctx.fillRect(x - 40, y - 10, 80, 22); ctx.strokeRect(x - 40, y - 10, 80, 22);
      ctx.fillStyle = "#5d6f74"; ctx.beginPath(); ctx.moveTo(x - 42, y - 10); ctx.lineTo(x - 36, y - 22); ctx.lineTo(x + 36, y - 22); ctx.lineTo(x + 42, y - 10); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = COL.ink; for (let i = -32; i <= 32; i += 8) ctx.fillRect(x + i - 1.5, y - 4, 3, 8);
      tower(ctx, x, y - 10, 16, 32, "spire"); },
    sluice(ctx, x, y) { ctx.strokeStyle = COL.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 22, y - 12); ctx.lineTo(x - 22, y + 12); ctx.moveTo(x + 22, y - 12); ctx.lineTo(x + 22, y + 12); ctx.stroke();
      ctx.lineWidth = 1.2; ctx.beginPath(); for (let k = -10; k <= 10; k += 5) { ctx.moveTo(x - 26, y + k); ctx.lineTo(x - 18, y + k); ctx.moveTo(x + 18, y + k); ctx.lineTo(x + 26, y + k); } ctx.stroke();
      house(ctx, x, y - 14, 16, 12); },
    keep(ctx, x, y) { ctx.fillStyle = "#d9c79c"; ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.4; ctx.fillRect(x - 34, y - 6, 68, 18); ctx.strokeRect(x - 34, y - 6, 68, 18);
      for (let i = -34; i < 34; i += 8) { ctx.fillRect(i + x, y - 11, 5, 5); ctx.strokeRect(i + x, y - 11, 5, 5); }
      tower(ctx, x, y - 4, 26, 34); tower(ctx, x - 34, y + 12, 12, 26); tower(ctx, x + 34, y + 12, 12, 26);
      ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(x, y + 12, 6, Math.PI, 0); ctx.fill(); },
    marsh(ctx, x, y, R) { ctx.fillStyle = COL.water; ctx.strokeStyle = COL.ink; ctx.lineWidth = 1;
      [[-18, 6, 16], [14, 10, 12], [0, -8, 10]].forEach(([dx, dy, r]) => { ctx.beginPath(); ctx.ellipse(x + dx, y + dy, r, r * 0.45, 0, 0, 7); ctx.fill(); ctx.stroke(); });
      ctx.strokeStyle = "#4e5a32"; ctx.lineWidth = 1.4;
      for (let i = 0; i < 16; i++) { const rx = x - 30 + R() * 60, ry = y - 10 + R() * 26; ctx.beginPath(); ctx.moveTo(rx, ry); ctx.quadraticCurveTo(rx + 2, ry - 10, rx + (R() - 0.5) * 8, ry - 18); ctx.stroke(); ctx.fillStyle = "#6e5236"; ctx.fillRect(rx - 1, ry - 20, 3, 6); } },
    river(ctx, x, y) { ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.3; ctx.fillStyle = "#b59a6a";
      ctx.beginPath(); ctx.moveTo(x - 30, y + 4); ctx.quadraticCurveTo(x, y - 20, x + 30, y + 4); ctx.lineTo(x + 30, y + 10); ctx.quadraticCurveTo(x, y - 12, x - 30, y + 10); ctx.closePath(); ctx.fill(); ctx.stroke();
      for (const dx of [-24, 24]) { ctx.fillStyle = "#cfc4a8"; ctx.fillRect(x + dx - 4, y - 2, 8, 16); ctx.strokeRect(x + dx - 4, y - 2, 8, 16); }
      ctx.fillStyle = COL.rubric; ctx.beginPath(); ctx.moveTo(x, y - 14); ctx.lineTo(x, y - 34); ctx.lineTo(x + 14, y - 30); ctx.lineTo(x, y - 26); ctx.fill(); ctx.stroke(); }
  };

  // ------------------------------------------------------------------ kaart: per beeld
  let STATIC = null, STATIONS = [];
  function routePoint(i) { return i < STATIONS.length ? [STATIONS[i].x, STATIONS[i].y + 18] : [TOWER.x - 40, TOWER.y + 120]; }
  function ctrl(a, b, k) { const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], s = (k % 2 ? 1 : -1) * 0.18; return [mx - dy * s, my + dx * s]; }
  function bez(a, c, b, t) { const u = 1 - t; return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]; }
  // positie van de speler: seg = segment (van halte seg naar seg+1), t = 0..1; seg -1 = aan land komen in Damme
  function playerPos(seg, t) {
    if (seg < 0) { const a = [560, 150], b = routePoint(0); return bez(a, [600, 120], b, t); }
    const a = routePoint(seg), b = routePoint(seg + 1); return bez(a, ctrl(a, b, seg), b, t);
  }

  function blob(ctx, cx, cy, r, t, n, amp, seed) {
    ctx.beginPath();
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2;
      const rr = r * (1 + amp * Math.sin(a * 3 + seed) * 0.6 + amp * 0.5 * Math.sin(a * 5 + seed * 2 + t * 1.3) + amp * 0.3 * Math.sin(a * 7 - t * 0.9));
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    smooth(ctx, pts.concat([pts[0]]), true); ctx.closePath();
  }

  function drawMap(canvas, st) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2), cw = canvas.clientWidth;
    if (!cw) return;
    const ch = cw * H / W;
    if (canvas.width !== Math.round(cw * dpr)) { canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr); }
    const ctx = canvas.getContext("2d"), k = canvas.width / W;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.drawImage(STATIC, 0, 0, W, H);
    const t = st.t;

    // route
    const cleared = st.results.length;
    for (let i = -1; i < STATIONS.length; i++) {
      ctx.beginPath();
      if (i < 0) { ctx.moveTo(560, 150); ctx.quadraticCurveTo(600, 120, routePoint(0)[0], routePoint(0)[1]); }
      else { const a = routePoint(i), b = routePoint(i + 1), c = ctrl(a, b, i); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(c[0], c[1], b[0], b[1]); }
      const done = i < cleared - 1 || (i === cleared - 1 && st.walk === null);
      ctx.setLineDash(done ? [2, 7] : [9, 9]); ctx.lineCap = "round";
      ctx.strokeStyle = done ? "rgba(42,31,22,0.55)" : COL.rubric; ctx.lineWidth = done ? 3 : 3.5; ctx.stroke();
    }
    ctx.setLineDash([]);

    // de vlek van de Onleesbare
    const shrink = st.freed ? 0.22 : Math.max(0.35, 1 - cleared * 0.065);
    const R = 250 * shrink;
    ctx.save();
    const g = ctx.createRadialGradient(TOWER.x, TOWER.y + 40, R * 0.2, TOWER.x, TOWER.y + 40, R * 1.1);
    g.addColorStop(0, "rgba(23,19,31,0.97)"); g.addColorStop(0.75, "rgba(28,22,40,0.92)"); g.addColorStop(1, "rgba(40,30,55,0.75)");
    ctx.fillStyle = g; blob(ctx, TOWER.x, TOWER.y + 40, R, t, 40, 0.16, 3); ctx.fill();
    for (let i = 0; i < 9; i++) { // druppels
      const a = i * 0.7 + 0.4, d = R * (1.02 + 0.05 * Math.sin(t * 1.6 + i)), x = TOWER.x + Math.cos(a) * d, y = TOWER.y + 40 + Math.sin(a) * d * 0.9;
      ctx.beginPath(); ctx.arc(x, y + ((t * 12 + i * 30) % 26), 4 + (i % 3), 0, 7); ctx.fill();
    }
    ctx.font = "600 26px 'JetBrains Mono', monospace"; ctx.textAlign = "center";
    for (let i = 0; i < 14 * shrink + 2; i++) { // zwevende @
      const a = i * 2.39 + t * 0.12, d = R * (0.35 + 0.5 * ((i * 0.37) % 1)), x = TOWER.x + Math.cos(a) * d, y = TOWER.y + 40 + Math.sin(a) * d * 0.8;
      ctx.fillStyle = `rgba(190,170,230,${0.18 + 0.15 * Math.sin(t * 2 + i)})`; ctx.fillText("@", x, y);
    }
    for (let i = 0; i < Math.round(10 * shrink); i++) { // ogen
      const a = i * 1.9 + 0.5, d = R * (0.45 + 0.4 * ((i * 0.53) % 1)), x = TOWER.x + Math.cos(a) * d, y = TOWER.y + 70 + Math.sin(a) * d * 0.7;
      const blink = Math.abs(Math.sin(t * 0.7 + i * 1.3)) < 0.06 ? 0.15 : 1;
      ctx.fillStyle = "#efe2c0"; ctx.beginPath(); ctx.ellipse(x, y, 7, 7 * blink, 0, 0, 7); ctx.fill();
      ctx.fillStyle = COL.rubric; ctx.beginPath(); ctx.arc(x + Math.cos(t + i) * 2, y, 3 * blink, 0, 7); ctx.fill();
    }
    ctx.restore();
    // de toren
    drawDarkTower(ctx, TOWER.x, TOWER.y + 120, 1, t, st.freed);
    ctx.textAlign = "center"; ctx.font = "italic 18px Alegreya, Georgia, serif"; ctx.fillStyle = "rgba(239,226,192,0.85)";
    if (!st.freed) ctx.fillText("de Toren van de Grote Onleesbare", TOWER.x - 20, TOWER.y + 160);

    // zegels
    STATIONS.forEach((s, i) => {
      const x = s.x + 34, y = s.y - 30, r = st.results[i];
      ctx.save(); ctx.translate(x, y);
      if (r === undefined) {
        const now = i === cleared && st.phase === "journey";
        ctx.strokeStyle = now ? COL.rubric : "rgba(42,31,22,0.45)"; ctx.lineWidth = now ? 3 : 1.5; ctx.fillStyle = "rgba(239,226,192,0.85)";
        ctx.beginPath(); ctx.arc(0, 0, now ? 13 + 2 * Math.sin(t * 4) : 11, 0, 7); ctx.fill(); ctx.stroke();
        ctx.fillStyle = now ? COL.rubric : COL.sepia; ctx.font = "700 13px 'Alegreya SC', serif"; ctx.textAlign = "center"; ctx.fillText(String(i + 1), 0, 4.5);
      } else if (r) {
        ctx.fillStyle = COL.gold; ctx.strokeStyle = "#7c5c12"; ctx.lineWidth = 2;
        ctx.beginPath(); for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, rr = k % 2 ? 13 : 15; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = COL.ink; ctx.font = "700 11px 'JetBrains Mono', monospace"; ctx.textAlign = "center"; ctx.fillText(window.CONTENT.RUNES[i].glyph.replace(/ /g, ""), 0, 4);
      } else {
        ctx.fillStyle = COL.night; blob(ctx, 0, 0, 13, t, 14, 0.2, i); ctx.fill();
        ctx.strokeStyle = "#efe2c0"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-5, -5); ctx.lineTo(5, 5); ctx.moveTo(5, -5); ctx.lineTo(-5, 5); ctx.stroke();
      }
      ctx.restore();
    });

    // de opgegeten letters keren terug naar het land
    if (st.celebrate !== null && st.celebrate !== undefined) {
      const age = t - st.celebrate;
      if (age < 7) {
        const RL = rng(1838), abc = "abcdefghijklmnopqrstuvwxyzMACHTELDVLAENDREN";
        ctx.textAlign = "center";
        for (let i = 0; i < 90; i++) {
          const a = Math.PI * (0.55 + RL() * 1.1), v = 260 + RL() * 520, d = RL() * 0.8;
          const tt = Math.max(0, age - d); if (tt <= 0) continue;
          const x = TOWER.x + Math.cos(a) * v * tt, y = TOWER.y + 40 - Math.sin(a) * v * tt * 0.55 + 140 * tt * tt;
          ctx.globalAlpha = Math.max(0, 1 - tt / 5.5);
          ctx.fillStyle = i % 4 ? COL.ink : COL.rubric; ctx.font = `${i % 3 ? "italic" : "600"} ${18 + RL() * 22}px Alegreya, Georgia, serif`;
          ctx.save(); ctx.translate(x, y); ctx.rotate(tt * (RL() - 0.5) * 4); ctx.fillText(abc[Math.floor(RL() * abc.length)], 0, 0); ctx.restore();
        }
        ctx.globalAlpha = 1;
      }
    }
    // speler
    if (st.player) drawScribe(ctx, st.player[0], st.player[1] - 6, 1.1, t, st.walking);
  }

  function drawDarkTower(ctx, x, y, s, t, freed) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = "#0e0b14"; ctx.strokeStyle = "#3d3352"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(-24, -190); ctx.lineTo(24, -190); ctx.lineTo(34, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    for (let i = 0; i < 5; i++) { ctx.fillRect(-30 + i * 13, -202, 8, 12); }
    ctx.beginPath(); ctx.moveTo(-30, -202); ctx.lineTo(0, -250); ctx.lineTo(30, -202); ctx.closePath(); ctx.fill(); ctx.stroke();
    for (let i = 0; i < 5; i++) {
      const wy = -30 - i * 34, top = i === 4;
      ctx.fillStyle = top ? (freed ? "rgba(239,226,192,0.35)" : `rgba(242,194,48,${0.75 + 0.25 * Math.sin(t * 3)})`) : `rgba(180,150,220,${0.25 + 0.15 * Math.sin(t * 2 + i)})`;
      ctx.beginPath(); ctx.moveTo(-6, wy); ctx.lineTo(-6, wy - 12); ctx.quadraticCurveTo(0, wy - 20, 6, wy - 12); ctx.lineTo(6, wy); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  // ------------------------------------------------------------------ figuren
  function drawScribe(ctx, x, y, s, t, walking) {
    const bob = walking ? Math.abs(Math.sin(t * 9)) * 3 : Math.sin(t * 2) * 1;
    ctx.save(); ctx.translate(x, y - bob); ctx.scale(s, s);
    ctx.fillStyle = "rgba(42,31,22,0.25)"; ctx.beginPath(); ctx.ellipse(0, 4 + bob, 12, 4, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.6;
    if (walking) { const sw = Math.sin(t * 9) * 4; ctx.beginPath(); ctx.moveTo(-3, -2); ctx.lineTo(-3 - sw, 4); ctx.moveTo(3, -2); ctx.lineTo(3 + sw, 4); ctx.stroke(); }
    ctx.fillStyle = COL.rubric; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.quadraticCurveTo(-9, -22, 0, -28); ctx.quadraticCurveTo(9, -22, 10, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#e9c9a0"; ctx.beginPath(); ctx.arc(0, -31, 6.5, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = COL.rubric; ctx.beginPath(); ctx.arc(0, -32, 8, Math.PI * 1.05, Math.PI * 1.95); ctx.lineTo(4, -38); ctx.fill(); ctx.stroke();
    ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(-2, -31, 1, 0, 7); ctx.arc(2.5, -31, 1, 0, 7); ctx.fill();
    ctx.strokeStyle = COL.ink; ctx.fillStyle = "#fffaf0"; ctx.lineWidth = 1; // ganzenveer
    ctx.beginPath(); ctx.moveTo(8, -14); ctx.quadraticCurveTo(22, -40, 16, -48); ctx.quadraticCurveTo(10, -34, 8, -14); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  function drawMachteld(ctx, x, y, s, t) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.6;
    ctx.fillStyle = COL.verdigris; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.quadraticCurveTo(-10, -30, 0, -36); ctx.quadraticCurveTo(10, -30, 14, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#6a4a2a"; ctx.beginPath(); ctx.moveTo(-7, -44); ctx.quadraticCurveTo(-14, -20, -8 + Math.sin(t * 2) * 2, -6); ctx.lineTo(-5, -8); ctx.quadraticCurveTo(-8, -24, -3, -40); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#ecd0a8"; ctx.beginPath(); ctx.arc(0, -42, 8, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#6a4a2a"; ctx.beginPath(); ctx.arc(0, -44, 8.5, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = COL.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -44, 8.5, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(-3, -42, 1.1, 0, 7); ctx.arc(3, -42, 1.1, 0, 7); ctx.fill();
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, -39.5, 3, 0.3, Math.PI - 0.3); ctx.stroke();
    ctx.fillStyle = "#fffaf0"; ctx.beginPath(); ctx.moveTo(6, -46); ctx.quadraticCurveTo(18, -64, 14, -70); ctx.quadraticCurveTo(10, -58, 6, -46); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  // ------------------------------------------------------------------ inktwezens
  const FEATURES = ["mouse", "fox", "toad", "twohead", "chain", "spider", "lock", "frog", "snake", "wolf"];
  function drawCreature(canvas, o) {
    const ctx = canvas.getContext("2d"), w = canvas.width, h = canvas.height, t = o.t;
    ctx.clearRect(0, 0, w, h);
    const f = o.feature || FEATURES[o.seed % FEATURES.length];
    const dead = o.dead || 0; if (dead >= 1) { drawParticles(ctx, o); return; }
    const hit = o.hit || 0, laugh = o.laugh || 0;
    const cx = w / 2 + Math.sin(t * 40) * 4 * hit, cy = h * 0.6 + Math.sin(t * 2) * 2 - laugh * Math.abs(Math.sin(t * 18)) * 5;
    const r = Math.min(w, h) * 0.3 * (1 - dead) * (o.boss ? 1.18 : 1);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(1 + 0.12 * hit, 1 - 0.12 * hit);
    ctx.fillStyle = "rgba(42,31,22,0.18)"; ctx.beginPath(); ctx.ellipse(0, r * 1.05, r * 0.9, r * 0.2, 0, 0, 7); ctx.fill();
    const body = () => {
      const g = ctx.createRadialGradient(-r * 0.3, -r * 0.4, r * 0.1, 0, 0, r * 1.2);
      g.addColorStop(0, o.boss ? "#4a3a66" : "#3e3450"); g.addColorStop(1, COL.night); ctx.fillStyle = g; return g;
    };
    ctx.strokeStyle = "#0b0810"; ctx.lineWidth = 2;
    // aanhangsels achter het lijf
    if (f === "fox") { body(); ctx.beginPath(); ctx.moveTo(r * 0.7, r * 0.3); ctx.quadraticCurveTo(r * 1.6, r * 0.1 + Math.sin(t * 3) * 6, r * 1.45, -r * 0.6); ctx.quadraticCurveTo(r * 1.1, -r * 0.1, r * 0.6, r * 0.05); ctx.fill(); ctx.fillStyle = "#efe2c0"; ctx.beginPath(); ctx.arc(r * 1.42, -r * 0.55, r * 0.12, 0, 7); ctx.fill(); }
    if (f === "mouse") { ctx.strokeStyle = COL.night; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(r * 0.8, r * 0.5); ctx.bezierCurveTo(r * 1.5, r * 0.6, r * 1.3, -r * 0.2 + Math.sin(t * 4) * 5, r * 1.6, -r * 0.1); ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = "#0b0810"; }
    if (f === "spider") { ctx.strokeStyle = COL.night; ctx.lineWidth = 3; for (let i = 0; i < 4; i++) for (const sd of [-1, 1]) { const a = 0.2 + i * 0.32, wig = Math.sin(t * 6 + i) * 4; ctx.beginPath(); ctx.moveTo(sd * r * 0.6, r * 0.1 + i * 4); ctx.quadraticCurveTo(sd * r * (1.2 + a * 0.3), -r * 0.4 + i * 10, sd * r * (1.35 + a * 0.2), r * (0.6 + a * 0.3) + wig); ctx.stroke(); } ctx.lineWidth = 2; ctx.strokeStyle = "#0b0810"; }
    if (f === "chain") { ctx.strokeStyle = "#8a7f96"; ctx.lineWidth = 3; for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2 + t * 0.5; ctx.beginPath(); ctx.ellipse(Math.cos(a) * r * 1.15, Math.sin(a) * r * 0.95, 7, 4, a + Math.PI / 2, 0, 7); ctx.stroke(); } ctx.lineWidth = 2; ctx.strokeStyle = "#0b0810"; }
    // lijf
    body();
    if (f === "snake") {
      ctx.lineCap = "round"; ctx.strokeStyle = COL.night; ctx.lineWidth = r * 0.55;
      ctx.beginPath(); ctx.moveTo(-r * 1.3, r * 0.6); ctx.bezierCurveTo(-r * 0.6, -r * 0.2 + Math.sin(t * 3) * 8, r * 0.2, r * 0.9, r * 0.5, -r * 0.1); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(r * 0.55, -r * 0.35, r * 0.55, r * 0.42, -0.3, 0, 7); ctx.fill();
    } else {
      blob(ctx, 0, 0, f === "toad" ? r * 1.05 : r, t * 1.6, 22, 0.1, o.seed || 1);
      if (f === "toad") ctx.scale(1, 1);
      ctx.fill(); ctx.stroke();
    }
    // glans
    ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(-r * 0.15, -r * 0.1, r * 0.65, Math.PI * 1.15, Math.PI * 1.45); ctx.stroke();
    ctx.strokeStyle = "#0b0810"; ctx.lineWidth = 2;
    // oren, hoorns
    ctx.fillStyle = COL.night;
    if (f === "mouse") for (const sd of [-1, 1]) { ctx.beginPath(); ctx.arc(sd * r * 0.6, -r * 0.85, r * 0.32, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#6b4f7a"; ctx.beginPath(); ctx.arc(sd * r * 0.6, -r * 0.85, r * 0.17, 0, 7); ctx.fill(); ctx.fillStyle = COL.night; }
    if (f === "fox" || f === "wolf") for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * r * 0.25, -r * 0.85); ctx.lineTo(sd * r * 0.62, -r * 1.45); ctx.lineTo(sd * r * 0.8, -r * 0.6); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    if (f === "twohead") for (const sd of [-1, 1]) { ctx.beginPath(); ctx.arc(sd * r * 0.5, -r * 0.95 + Math.sin(t * 3 + sd) * 3, r * 0.42, 0, 7); ctx.fill(); ctx.stroke(); }
    if (f === "frog") for (const sd of [-1, 1]) { ctx.beginPath(); ctx.arc(sd * r * 0.45, -r * 0.82, r * 0.34, 0, 7); ctx.fill(); ctx.stroke(); }
    if (f === "toad") { ctx.fillStyle = "#4a3e5e"; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(Math.cos(i * 2.1) * r * 0.6, Math.sin(i * 2.1) * r * 0.5 + r * 0.1, 3 + (i % 3), 0, 7); ctx.fill(); } ctx.fillStyle = COL.night; }
    if (o.boss) for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * r * 0.3, -r * 0.9); ctx.quadraticCurveTo(sd * r * 0.9, -r * 1.6, sd * r * 1.1, -r * 1.2); ctx.quadraticCurveTo(sd * r * 0.7, -r * 1.1, sd * r * 0.55, -r * 0.75); ctx.fill(); ctx.stroke(); }
    // ogen
    let eyes = [[-r * 0.3, -r * 0.25], [r * 0.3, -r * 0.25]];
    if (f === "twohead") eyes = [[-r * 0.62, -r * 1.0], [-r * 0.38, -r * 1.0], [r * 0.38, -r * 1.0], [r * 0.62, -r * 1.0]];
    if (f === "frog") eyes = [[-r * 0.45, -r * 0.85], [r * 0.45, -r * 0.85]];
    if (f === "spider") eyes = [[-r * 0.32, -r * 0.3], [r * 0.32, -r * 0.3], [-r * 0.12, -r * 0.5], [r * 0.12, -r * 0.5]];
    if (f === "snake") eyes = [[r * 0.4, -r * 0.5], [r * 0.75, -r * 0.45]];
    if (o.boss) eyes = [[-r * 0.45, -r * 0.3], [0, -r * 0.45], [r * 0.45, -r * 0.3], [-r * 0.2, r * 0.05], [r * 0.25, r * 0.08]];
    const blink = Math.abs(Math.sin(t * 0.9 + (o.seed || 0))) < 0.05 ? 0.1 : 1;
    eyes.forEach(([ex, ey], i) => {
      const er = (f === "frog" ? r * 0.22 : f === "twohead" || f === "spider" ? r * 0.12 : r * 0.17) * (o.boss ? 0.95 : 1);
      ctx.fillStyle = "#f4ecd8"; ctx.beginPath(); ctx.ellipse(ex, ey, er, er * blink, 0, 0, 7); ctx.fill();
      ctx.fillStyle = o.boss ? COL.rubric : COL.ink;
      const px = ex + Math.cos(t * 1.3 + i) * er * 0.35, py = ey + er * 0.2;
      if (o.boss) { ctx.font = `700 ${er * 1.6}px 'JetBrains Mono', monospace`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("@", px, py); ctx.textBaseline = "alphabetic"; }
      else { ctx.beginPath(); ctx.arc(px, py, er * 0.45 * blink, 0, 7); ctx.fill(); }
      if (!laugh) { ctx.strokeStyle = "#0b0810"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(ex - er, ey - er * 0.9 + (ex < 0 ? -2 : 2)); ctx.lineTo(ex + er, ey - er * 0.9 + (ex < 0 ? 2 : -2)); ctx.stroke(); }
    });
    // mond
    const my = f === "snake" ? -r * 0.15 : f === "twohead" ? -r * 0.1 : r * 0.25, mx = f === "snake" ? r * 0.6 : 0;
    ctx.fillStyle = "#0b0810";
    if (laugh) { ctx.beginPath(); ctx.ellipse(mx, my, r * 0.35, r * 0.22 + Math.abs(Math.sin(t * 18)) * 4, 0, 0, Math.PI); ctx.fill(); }
    else { ctx.beginPath(); ctx.moveTo(mx - r * 0.35, my); ctx.quadraticCurveTo(mx, my + r * 0.18, mx + r * 0.35, my); ctx.quadraticCurveTo(mx, my + r * 0.05, mx - r * 0.35, my); ctx.fill(); }
    ctx.fillStyle = "#f4ecd8";
    for (let i = 0; i < 4; i++) { const tx = mx - r * 0.24 + i * r * 0.16; ctx.beginPath(); ctx.moveTo(tx, my + 1); ctx.lineTo(tx + 4, my + 1); ctx.lineTo(tx + 2, my + 7); ctx.fill(); }
    if (f === "lock") { ctx.fillStyle = COL.gold; ctx.strokeStyle = "#5c4410"; ctx.beginPath(); ctx.arc(0, r * 0.55, r * 0.18, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = COL.ink; ctx.fillRect(-2, r * 0.5, 4, r * 0.16); }
    // druppelende voetjes
    ctx.fillStyle = COL.night;
    for (let i = -1; i <= 1; i += 2) { ctx.beginPath(); ctx.ellipse(i * r * 0.45, r * 0.92, r * 0.18, r * 0.1, 0, 0, 7); ctx.fill(); }
    const dy = (t * 30) % 22; ctx.beginPath(); ctx.arc(-r * 0.1, r * 0.95 + dy, 3.5 * (1 - dy / 22), 0, 7); ctx.fill();
    ctx.restore();
    drawParticles(ctx, o);
  }
  function drawParticles(ctx, o) {
    (o.particles || []).forEach(p => {
      ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.c || COL.night;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  // ------------------------------------------------------------------ verhaalscènes
  function scribbles(ctx, x, y, w, lines, R, color) {
    ctx.strokeStyle = color || "rgba(42,31,22,0.75)"; ctx.lineWidth = 1.3;
    for (let l = 0; l < lines; l++) {
      ctx.beginPath(); let px = x + (l === 0 ? 14 : 0); const py = y + l * 14; ctx.moveTo(px, py);
      const end = x + w - R() * (l % 5 === 4 ? w * 0.5 : 12);
      while (px < end) { const s = 4 + R() * 7; ctx.quadraticCurveTo(px + s / 2, py - 5 - R() * 4, px + s, py + R() * 1.5); px += s; if (R() < 0.12) { px += 5; ctx.moveTo(px, py); } }
      ctx.stroke();
    }
  }
  function drawScene(canvas, name, t) {
    const ctx = canvas.getContext("2d"), w = canvas.width, h = canvas.height, R = rng(name.length * 77);
    ctx.fillStyle = "#e9dab4"; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 2500; i++) { ctx.fillStyle = `rgba(80,55,30,${R() * 0.07})`; ctx.fillRect(R() * w, R() * h, 1.5, 1.5); }
    if (name === "archive") {
      const lamp = ctx.createRadialGradient(470, 70, 10, 470, 70, 320); lamp.addColorStop(0, "rgba(255,226,150,0.55)"); lamp.addColorStop(1, "rgba(255,226,150,0)"); ctx.fillStyle = lamp; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#8d969a"; ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.fillRect(40, 150, 150, 110); ctx.strokeRect(40, 150, 150, 110);
      ctx.fillStyle = "#f3ead4"; ctx.fillRect(70, 175, 90, 34); ctx.strokeRect(70, 175, 90, 34);
      ctx.fillStyle = COL.ink; ctx.font = "15px 'JetBrains Mono', monospace"; ctx.textAlign = "center"; ctx.fillText("C 34 / H (1)", 115, 197);
      ctx.fillStyle = "#f6edd3"; ctx.save(); ctx.translate(390, 175); ctx.rotate(-0.04);
      ctx.fillRect(-170, -110, 168, 200); ctx.fillRect(2, -110, 168, 200); ctx.strokeRect(-170, -110, 168, 200); ctx.strokeRect(2, -110, 168, 200);
      scribbles(ctx, -158, -86, 145, 12, R); scribbles(ctx, 14, -86, 145, 12, R);
      ctx.restore();
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(470, 0); ctx.lineTo(470, 50); ctx.stroke();
      ctx.fillStyle = COL.verdigris; ctx.beginPath(); ctx.moveTo(445, 72); ctx.lineTo(470, 44); ctx.lineTo(495, 72); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    if (name === "blot") {
      ctx.fillStyle = "#f6edd3"; ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.fillRect(60, 30, 230, 250); ctx.strokeRect(60, 30, 230, 250);
      scribbles(ctx, 75, 56, 200, 16, R);
      ctx.font = "700 22px 'JetBrains Mono', monospace";
      for (let i = 0; i < 16; i++) { const p = Math.min(1, ((t * 0.25 + i / 16) % 1)); const x = 150 + p * 300 + Math.sin(i * 3 + t * 2) * 20, y = 60 + (i * 37) % 200 + Math.sin(t * 3 + i) * 6; ctx.fillStyle = `rgba(23,19,31,${0.9 - p * 0.3})`; ctx.fillText("@", x, y); }
      const o = { t, seed: 5, feature: "toad", boss: true };
      ctx.save(); ctx.translate(380, -10); const c2 = document.createElement("canvas"); c2.width = 260; c2.height = 300; drawCreature(c2, o); ctx.drawImage(c2, 0, 0); ctx.restore();
    }
    if (name === "letter") {
      ctx.save(); ctx.translate(w / 2, h / 2 + 6); ctx.rotate(-0.05 + Math.sin(t) * 0.02);
      ctx.fillStyle = "#fbf3dc"; ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.6; ctx.fillRect(-190, -110, 380, 220); ctx.strokeRect(-190, -110, 380, 220);
      ctx.strokeStyle = "rgba(110,82,54,0.3)"; ctx.beginPath(); ctx.moveTo(-190, -37); ctx.lineTo(190, -37); ctx.moveTo(-190, 37); ctx.lineTo(190, 37); ctx.stroke();
      ctx.fillStyle = COL.ink; ctx.font = "italic 30px Alegreya, Georgia, serif"; ctx.textAlign = "left"; ctx.fillText("Kopiist!", -160, -62);
      scribbles(ctx, -160, -20, 320, 6, R); ctx.font = "italic 22px Alegreya, Georgia, serif"; ctx.fillText("— M.", 90, 92);
      ctx.fillStyle = COL.rubric; ctx.beginPath(); ctx.arc(150, 70, 22, 0, 7); ctx.fill(); ctx.fillStyle = "#8f2414"; ctx.font = "700 22px 'Grenze Gotisch', serif"; ctx.textAlign = "center"; ctx.fillText("M", 150, 78);
      ctx.restore();
      drawScribe(ctx, 70, 270, 1.8, t, false);
    }
  }

  // ------------------------------------------------------------------ de toren (sudden death)
  function drawTowerView(canvas, o) {
    const ctx = canvas.getContext("2d"), w = canvas.width, h = canvas.height, t = o.t;
    ctx.fillStyle = "#1a1524"; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(190,170,230,${0.05 + 0.08 * Math.sin(t + i)})`; ctx.font = "600 20px 'JetBrains Mono', monospace"; ctx.fillText("@", (i * 97) % w, (i * 53 + t * 8) % h); }
    const fh = 64, base = h - 22, view = Math.max(0, o.floor - 4);
    ctx.save(); ctx.translate(0, view * fh);
    for (let f = 0; f <= Math.max(o.floor + 3, 6); f++) {
      const y = base - f * fh; if (y + view * fh < -fh) continue;
      ctx.fillStyle = f % 2 ? "#251e33" : "#2b2339"; ctx.fillRect(w / 2 - 110, y - fh, 220, fh);
      ctx.strokeStyle = "#4b3f63"; ctx.lineWidth = 2; ctx.strokeRect(w / 2 - 110, y - fh, 220, fh);
      ctx.fillStyle = "#4b3f63"; for (let b = 0; b < 6; b++) ctx.fillRect(w / 2 - 110 + b * 40 + (f % 2) * 20, y - fh / 2, 2, fh / 2);
      if (f > 0) { ctx.fillStyle = "#8a7aa8"; ctx.font = "600 16px 'Alegreya SC', serif"; ctx.textAlign = "left"; ctx.fillText(String(f), w / 2 - 100, y - fh + 20); }
      if (f === 5) { // Machteld
        if (!o.freed) { drawMachteld(ctx, w / 2 + 50, y - 8, 0.95, t); ctx.strokeStyle = COL.night; ctx.lineWidth = 4; for (let b = -3; b <= 3; b++) { ctx.beginPath(); ctx.moveTo(w / 2 + 50 + b * 8, y - 72); ctx.lineTo(w / 2 + 50 + b * 8, y - 4); ctx.stroke(); } }
        else { ctx.fillStyle = "rgba(242,194,48,0.15)"; ctx.fillRect(w / 2 - 108, y - fh + 2, 216, fh - 4); }
      }
    }
    // speler op huidige verdieping
    const py = base - o.floor * fh - 6 + (o.climb ? (1 - o.climb) * fh : 0);
    drawScribe(ctx, w / 2 - 30, py, 1.3, t, !!o.climb);
    if (o.freed && o.floor >= 5) drawMachteld(ctx, w / 2 + 20, py, 0.9, t);
    ctx.restore();
    ctx.fillStyle = "#efe2c0"; ctx.font = "500 30px 'Grenze Gotisch', serif"; ctx.textAlign = "center"; ctx.fillText("Verdieping " + o.floor, w / 2, 36);
  }

  function drawSeal(canvas, freed) {
    const ctx = canvas.getContext("2d"), w = canvas.width; ctx.clearRect(0, 0, w, w);
    ctx.save(); ctx.translate(w / 2, w / 2);
    ctx.fillStyle = freed ? COL.rubric : COL.night;
    ctx.beginPath(); for (let k = 0; k < 28; k++) { const a = k / 28 * Math.PI * 2, r = w * (k % 2 ? 0.41 : 0.45); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill();
    ctx.strokeStyle = freed ? "#f5c9b8" : "#6b5a85"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, w * 0.33, 0, 7); ctx.stroke();
    ctx.fillStyle = freed ? "#fff0e0" : "#c9b8e8"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = freed ? `500 ${w * 0.42}px 'Grenze Gotisch', serif` : `700 ${w * 0.38}px 'JetBrains Mono', monospace`; ctx.fillText(freed ? "M" : "@", 0, freed ? 4 : 2);
    ctx.restore();
  }

  function init(stations) { STATIONS = stations; STATIC = makeStatic(stations); }
  return { init, drawMap, playerPos, drawCreature, drawScene, drawTowerView, drawSeal, routePoint, FEATURES, W, H };
})();
