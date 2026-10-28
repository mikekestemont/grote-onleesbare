/* Verhaal, regexen, haltes en regels voor de toren. Alle woorden komen uit LEEUW.vocab. */
window.CONTENT = (function () {

  const RUNES = [
    { glyph: "ae", name: "De Letter",
      text: "Gewone tekens vangen zichzelf. De regex ae vindt elke plek waar een a en een e naast elkaar staan.",
      demo: ["ae", ["haer", "maer", "haar", "Graef"]] },
    { glyph: ".", name: "De Joker",
      text: "Een punt vangt één teken, welk teken ook. h.er vindt hier, heer en haer: de punt neemt de plaats in van i, e of a.",
      demo: ["h.er", ["hier", "heer", "haer", "haar"]] },
    { glyph: "[ ]", name: "De Kooi",
      text: "Tussen vierkante haken sluit je letters op. Op die plek moet één van die letters staan. Gra[ae]f vindt Graef en Graaf.",
      demo: ["Gra[ae]f", ["Graef", "Graaf", "Graven"]] },
    { glyph: "?", name: "De Twijfel",
      text: "Het teken vóór een vraagteken mag er staan, maar het mag ook ontbreken. Vlaende?ren vindt Vlaenderen én Vlaendren.",
      demo: ["Vlaende?ren", ["Vlaenderen", "Vlaendren", "Vlaming"]] },
    { glyph: "+", name: "De Ketting",
      text: "Het teken vóór een plusteken komt één of meer keer voor, als schakels in een ketting. @+ vangt @, @@ en @@@@ telkens als één geheel.",
      demo: ["@+", ["@", "@@", "@@@@"]] },
    { glyph: "( | )", name: "De Splitsing",
      text: "Met een verticale streep kies je tussen twee wegen. Haakjes bakenen af waar de splitsing begint en eindigt. z(y|ij)n vindt zyn en zijn.",
      demo: ["z(y|ij)n", ["zyn", "zijn", "zyne", "zin"]] },
    { glyph: "^ $", name: "De Ankers",
      text: "^ legt je regex vast aan het begin van het woord, $ aan het einde. ^ver vindt verlaten maar niet over. heid$ vindt droefheid maar niet onderscheiden.",
      demo: ["^ver", ["verlaten", "over", "verder"]] },
    { glyph: "[A-Z]", name: "Het Bereik",
      text: "In een kooi kun je een reeks zetten: [a-z] is elke kleine letter, [A-Z] elke hoofdletter, [0-9] elk cijfer. ^[A-Z] vindt woorden die met een hoofdletter beginnen.",
      demo: ["^[A-Z]", ["Machteld", "Brugge", "ridder"]] },
    { glyph: "*", name: "De Ster",
      text: "Het teken vóór een sterretje mag nul, één of veel keer voorkomen. Een punt met een ster, .*, betekent dus: om het even wat, of niets. ^ver.*en$ vindt verlaten en verloren.",
      demo: ["^ver.*en$", ["verlaten", "verloren", "verder"]] },
    { glyph: "\\b", name: "De Grens",
      text: "\\b is een woordgrens: de plek tussen een letter en een spatie, een leesteken of het begin van de regel. \\bde\\b vindt het woordje de, maar niet de de in deze of onder.",
      demo: ["\\bde\\b", ["de leeuw", "deze", "onder"]] }
  ];

  // De 10 haltes. Golf: vang alle 'catch', geen enkele 'spare'. Per run worden woorden (en varianten) getrokken.
  const STATIONS = [
    { place: "Damme", sub: "de haven aan het Zwin", x: 668, y: 248, icon: "harbour",
      blurb: "Je spoelt aan op de kade van Damme, tussen koggen vol wol en wijn. De inkt druipt nog van je mouwen. Op een baal zit iets te knagen.",
      creature: "de Kladmuis", taunt: "Ik vreet elke ae die ik vind. Haer, maer, naer... lekker!",
      variants: [{ type: "golf", rule: "ae",
        prompt: "Conscience schreef haer en maer, waar wij haar en maar schrijven. Vang de woorden met ae. Spaar die met aa.",
        pairs: [["haer", "haar"], ["maer", "maar"], ["naer", "naar"], ["daer", "daar"], ["Graef", "Graaf"], ["gaen", "gaan"], ["zael", "zaal"], ["plaets", "plaats"], ["maegd", "maagd"], ["staen", "staan"], ["laet", "laat"]],
        n: 4,
        hint: "Kijk wat alle woorden links gemeen hebben: twee letters naast elkaar. Typ gewoon die twee letters.",
        explain: "ae vangt elk woord waarin a en e naast elkaar staan. Haar en maar hebben twee keer a, dus die ontsnappen." }] },

    { place: "Male", sub: "het waterkasteel van de graven", x: 740, y: 372, icon: "castle",
      blurb: "Het kasteel van Male ligt in een slotgracht. Aan de brug zit een Vlekvos die alle heren, haren en hieren door elkaar haalt.",
      creature: "de Vlekvos", taunt: "Hier, heer, haer: voor mij is het allemaal hetzelfde!",
      variants: [{ type: "golf", rule: "h.er",
        catch: ["haer", "heer", "hier", "dochter", "achter", "Mynheer", "heeren", "rechter"],
        spare: ["haar", "hem", "hoe", "hun", "her", "heeft", "hand"], n: 4,
        hint: "Hier, heer, haer: alleen de tweede letter verschilt. Zet op die plek de Joker.",
        explain: "h.er: een h, dan één willekeurig teken, dan er. Daarom vangt de Joker ook dochter en achter." }] },

    { place: "Brugge", sub: "het Belfort", x: 520, y: 330, icon: "belfry",
      blurb: "Op het Belfort luiden de klokken vals: de Onleesbare heeft het opschrift aangevreten. In de klokkenkamer houdt de Inktpad de wacht.",
      creature: "de Inktpad", taunt: "Ik sluit letters op. Raad maar welke er in mijn kooi zitten!",
      variants: [
        { type: "golf", rule: "[Gg]ra[ae]f", catch: ["Graef", "Graaf", "graef", "graefschap", "graeflyk"], spare: ["Graven", "Gravin", "graf", "gracht", "gras", "graven"], n: 4,
          hint: "Graef en Graaf verschillen in één letter, en soms staat er een kleine g. Je hebt twee kooien nodig.",
          explain: "[Gg]ra[ae]f: een G of g, dan ra, dan een a of een e, dan f. Graven en graf hebben daar geen a of e." },
        { type: "golf", rule: "ma[ae]gd", catch: ["maegd", "maagd", "maegden", "dienstmaegd"], spare: ["mag", "mager", "maer", "maken"], n: 4,
          hint: "Maegd en maagd verschillen in één letter. Zet de twee mogelijke letters samen in een kooi.",
          explain: "ma[ae]gd: na ma volgt een a of een e, en dan gd." }] },

    { place: "Wijnendale", sub: "het jachtbos", x: 330, y: 470, icon: "forest",
      blurb: "In het bos van Wijnendale groeien de bomen scheef. Tussen de stammen loopt de Twijfelaar met zijn twee koppen. Hij weet nooit of hij een e wil of niet.",
      creature: "de Twijfelaar", taunt: "Vlaenderen? Vlaendren? Wel een e? Geen e? Ik weet het nooit!",
      variants: [{ type: "golf", rule: "Vla[ae]nde?ren",
        catch: ["Vlaenderen", "Vlaanderen", "Vlaendren", "Vlaandren"], spare: ["Vlaming", "Vlamingen", "vlaemsch", "vlam", "vlammen"], n: 4,
        hint: "Begin met wat je in Brugge leerde: Vla[ae]nderen. Welke letter mag nu ook wegvallen? Zet daar de Twijfel achter.",
        explain: "Vla[ae]nde?ren: de e na de d mag er staan of ontbreken. In jullie transcripties is Vlaendren zelfs de gewoonste vorm (84 keer)." }] },

    { place: "Torhout", sub: "de markt", x: 420, y: 592, icon: "church",
      blurb: "Op de markt van Torhout is een kettingsmid aan het werk. De Onleesbare heeft hier een regel tekst aangevreten: overal @.",
      creature: "de Kettingklad", taunt: "Hoeveel @ zie je? Eén? Drie? Ik ketting ze aan elkaar!",
      variants: [{ type: "spoor", rule: "@+", distractors: ["@", "@?", ".@", "@@"],
        prompt: "Elk geel vak is één vangst. Een hele reeks @ telt telkens als één geheel. Welke regex gaf deze vangst?",
        hint: "Zonder ketting vangt @ elk teken apart. Met welke regex hang je ze aan elkaar?",
        explain: "@+ vangt één of meer @ na elkaar als één geheel. Met alleen @ krijg je elk @ als aparte vangst." }] },

    { place: "Ieper", sub: "de Lakenhalle", x: 210, y: 768, icon: "hall",
      blurb: "In de Lakenhalle weven ze twee draden tot één doek. Een Spinnekop van inkt heeft de y en de ij in de knoop gelegd.",
      creature: "de Spinnekop", taunt: "Zyn of zijn? Myn of mijn? Ik spin ze door elkaar!",
      variants: [
        { type: "golf", rule: "z(y|ij)n", catch: ["zyn", "zijn", "zyne", "zijne", "zynen", "zijnen"], spare: ["zy", "zij", "zien", "zit", "zyt", "zijt"], n: 4,
          hint: "Na de z volgt ofwel y ofwel ij, en dan een n. Zet die twee wegen tussen haakjes, met een streep ertussen.",
          explain: "z(y|ij)n: een z, dan y óf ij, dan n. Een kooi [yij] zou niet werken, want ij zijn twee letters." },
        { type: "golf", rule: "m(y|ij)n", catch: ["myn", "mijn", "myne", "mijne", "mynheer", "mijnen"], spare: ["my", "mij", "min", "midden", "mits"], n: 4,
          hint: "Na de m volgt ofwel y ofwel ij, en dan een n. Zet die twee wegen tussen haakjes, met een streep ertussen.",
          explain: "m(y|ij)n: een m, dan y óf ij, dan n. Een kooi [yij] zou niet werken, want ij zijn twee letters." }] },

    { place: "De Leie", sub: "de sluis bij Deinze", x: 560, y: 830, icon: "sluice",
      blurb: "Een sluis heeft twee deuren: één vooraan en één achteraan. De Sluiswachter laat alleen woorden door die op de juiste plek beginnen.",
      creature: "de Sluiswachter", taunt: "Over? Zilver? Liever? Daar zit ook ver in! Of niet soms?",
      variants: [
        { type: "golf", rule: "^ver", catch: ["verlaten", "vergeten", "verloren", "verder", "verliet", "verstand", "vertrek"], spare: ["over", "liever", "zilver", "overal", "onverschillig", "wever", "zuiver"], n: 4,
          hint: "Alle woorden bevatten ver. Maar alleen de woorden links beginnen ermee. Leg het anker aan het begin.",
          explain: "^ver: het anker ^ eist dat ver helemaal vooraan staat. Over en zilver bevatten ver, maar niet aan het begin." },
        { type: "golf", rule: "^ge", catch: ["geweld", "geld", "gezegd", "gehoord", "gebod", "gekleed"], spare: ["tegen", "oogen", "Brugge", "morgen", "dagen", "vragen"], n: 4,
          hint: "Alle woorden bevatten ge. Maar alleen de woorden links beginnen ermee. Leg het anker aan het begin.",
          explain: "^ge: het anker ^ eist dat ge helemaal vooraan staat. Tegen en oogen bevatten ge, maar niet aan het begin." }] },

    { place: "Gent", sub: "het Gravensteen", x: 1000, y: 600, icon: "keep",
      blurb: "In de grote zaal van het Gravensteen hangen banieren met namen. Namen staan rechtop, met een hoofdletter vooraan. De Kikkerklad springt er tussendoor.",
      creature: "de Kikkerklad", taunt: "Machteld, macht, Brugge, brief... Kwaak! Ik zie geen verschil!",
      variants: [{ type: "golf", rule: "^[A-Z]",
        catch: ["Machteld", "Breydel", "Brugge", "Adolf", "Johanna", "Robrecht", "Deconinck", "Valois"], spare: ["macht", "brief", "ridder", "adem", "heer", "koning", "leeuw", "graef"], n: 5,
        hint: "Je hoeft niet alle namen op te sommen. Eén kooi met het bereik van alle hoofdletters volstaat.",
        explain: "^[A-Z]: een hoofdletter vooraan. Het bereik [A-Z] spaart je 26 letters typwerk." }] },

    { place: "Het Moer", sub: "het moeras bij de Schelde", x: 1175, y: 760, icon: "marsh",
      blurb: "In het Moer zakt alles weg wat in het midden staat. Alleen het begin en het einde steken boven het water uit. Daar woont de Slijkslang.",
      creature: "de Slijkslang", taunt: "Wat er tussen ver en en zit, slok ik op. Raad jij nog wat het was?",
      variants: [{ type: "golf", rule: "^ver.*en$",
        catch: ["verlaten", "vergeten", "verloren", "verdwenen", "vertrekken", "veranderen", "verdedigen"], spare: ["verliet", "verder", "vertrek", "verstand", "overleden", "overgeven", "waren"], n: 4,
        hint: "Begin met het anker ^ver en eindig met het anker en$. Wat zet je ertussen voor 'om het even wat'?",
        explain: "^ver.*en$: begint met ver, eindigt op en, en .* laat om het even wat toe in het midden." }] },

    { place: "De Schelde", sub: "de oude grens", x: 1330, y: 560, icon: "river",
      blurb: "De Schelde was eeuwenlang een grens. Hier begint het land van de Grote Onleesbare: de woorden lopen in elkaar over. Alleen wie grenzen ziet, raakt erdoor.",
      creature: "de Grenswolf", taunt: "De, deze, onder, beide... Waar houdt het ene woord op en begint het andere?",
      variants: [{ type: "spoor", rule: "\\bde\\b", distractors: ["de", "\\bde", "de\\b", "d.", ".de"],
        prompt: "Alleen het losse woordje de is gevangen, niet de de binnen een ander woord (deze, onder). Welke regex gaf deze vangst?",
        hint: "Je hebt een grens nodig vóór én na het woordje.",
        explain: "\\bde\\b: een woordgrens, dan de, dan weer een woordgrens. Zo vang je het woordje de, maar niet de de in deze of onder." }] }
  ];

  // Regels voor de toren. near: waar we bijna-treffers zoeken (woorden die erop lijken, maar niet matchen).
  const TOWER_RULES = [
    // tier 1-2: één regex
    { r: "ae", near: "aa", t: 1 }, { r: "aa", near: "ae", t: 1 }, { r: "ij", near: "y", t: 1 }, { r: "y", near: "ij", t: 1 },
    { r: "sch", near: "s", t: 1 }, { r: "oo", near: "o", t: 1 }, { r: "ch", near: "c|h", t: 1 },
    { r: "h.er", near: "^h", t: 2 }, { r: "Gra[ae]f", near: "^[Gg]ra", t: 2 }, { r: "Vla[ae]nde?ren", near: "^[Vv]la", t: 2 },
    { r: "z(y|ij)n", near: "^z", t: 2 }, { r: "m(y|ij)n", near: "^m[iy]", t: 2 }, { r: "t(y|ij)d", near: "^t", t: 2 },
    { r: "gr[oa]+t", near: "^gr", t: 2 }, { r: "[dt]ie", near: "ie", t: 2 }, { r: "Brey?i?j?del", near: "^Br", t: 2 },
    // tier 3: ankers en bereik
    { r: "^ver", near: "ver", t: 3 }, { r: "^ge", near: "ge", t: 3 }, { r: "^be", near: "be", t: 3 }, { r: "^on", near: "on", t: 3 },
    { r: "heid$", near: "hei", t: 3 }, { r: "sch$", near: "sch", t: 3 }, { r: "^[A-Z]", near: "^[a-z]", t: 3 },
    { r: "(lijk|lyk)$", near: "l(ij|y)k", t: 3 }, { r: "^en", near: "en", t: 3 }, { r: "d$", near: "d", t: 3 }, { r: "^ont", near: "ont", t: 3 },
    // tier 4: combinaties
    { r: "^ver.*en$", near: "^ver|en$", t: 4 }, { r: "^ge.*d$", near: "^ge|d$", t: 4 }, { r: "^[A-Z].*e$", near: "e$|^[A-Z]", t: 4 },
    { r: "(heid|schap)$", near: "hei|scha", t: 4 }, { r: "^(ver|ont)", near: "ver|ont", t: 4 }, { r: "^z(y|ij)ne?$", near: "z(y|ij)n", t: 4 },
    { r: "^....$", near: "^.{3,5}$", t: 4 }, { r: "^h.*r$", near: "^h|r$", t: 4 }, { r: "ae.*ae", near: "ae", t: 4 },
    { r: "^[A-Z][a-z]*n$", near: "n$", t: 4 }, { r: "^be.*en$", near: "^be|en$", t: 4 },
    // tier 5: zwaar
    { r: "^(ge|be|ver).*(en|de)$", near: "^(ge|be|ver)|(en|de)$", t: 5 }, { r: "^.....$", near: "^.{4,6}$", t: 5 },
    { r: "(y|ij).*(y|ij)", near: "y|ij", t: 5 }, { r: "^[A-Z][a-z]+(en|s)$", near: "^[A-Z]|(en|s)$", t: 5 },
    { r: "^[a-z]+(heid|nis)$", near: "heid|nis", t: 5 }, { r: "oo.*oo|ee.*ee", near: "oo|ee", t: 5 },
    { r: "^(over|onder)", near: "over|onder", t: 5 }
  ];

  // Patronen voor 'spoor'-vragen in de toren (vangst in een echte regel), met mogelijke afleiders.
  const SPOOR_RULES = [
    { r: "@+", d: ["@", "@?", ".@", "@@"], t: 2 },
    { r: "\\bhy\\b", d: ["hy", "hy\\b", "\\bhy", "h"], t: 3 },
    { r: "[A-Z][a-z]+", d: ["[A-Z]", "[a-z]+", "[A-Z][a-z]", "^[A-Z][a-z]+"], t: 3 },
    { r: "\\bde\\b", d: ["de", "\\bde", "de\\b", "d."], t: 3 },
    { r: "ae", d: ["a", "a.", "[ae]", "e"], t: 1 },
    { r: "Vla[ae]nde?ren", d: ["Vla[ae]nderen", "Vla", "Vla.nderen", "Vlaendren"], t: 2 },
    { r: "z(y|ij)n", d: ["zyn", "z[yij]", "zijn", "z.n"], t: 2 },
    { r: "\\b[a-z]+heid\\b", d: ["heid", "[a-z]+heid", "\\bheid", "\\b[a-z]+"], t: 4 },
    { r: "\\b[A-Z][a-z]*", d: ["[A-Z]", "[a-z]+", "[A-Z][a-z]", "\\b[a-z]+"], t: 4 },
    { r: "\\b(en|de)\\b", d: ["en|de", "\\ben|de\\b", "\\b(en|de)", "(en|de)\\b"], t: 5 },
    { r: "\\b(hy|zy|gy)\\b", d: ["(hy|zy|gy)", "\\b[hzg]y", "y\\b", "\\b.y"], t: 5 }
  ];

  const CREATURES = ["de Inktlarve", "de Vlekuil", "de Kladkever", "de Spatrat", "de Klodderkraai", "de Smeerslak",
    "de Druipduivel", "de Vegevalk", "de Kleksnoek", "de Morsmot", "de Vlekkenwolf", "de Pennenvreter", "de Roetrob",
    "de Galnoot", "de Kladkrab", "de Sputterspin"];

  const STORY = {
    prologue: [
      { title: "Antwerpen, vandaag", scene: "archive",
        text: "In het Letterenhuis ligt een dikke bundel papier: het handschrift van De Leeuw van Vlaenderen. Hendrik Conscience schreef het in 1838 met ijzergalinkt. Jij hebt er een pagina van overgetikt in Transkribus." },
      { title: "Het @ ontsnapt", scene: "blot",
        text: "Overal waar jullie iets niet konden lezen, typten jullie een @. Vandaag kroop al dat @ terug het papier in. Het klonterde samen tot één grote vlek met honderd ogen: de Grote Onleesbare. Het eet letters. Waar het komt, wordt de tekst onleesbaar." },
      { title: "Een briefje", scene: "letter",
        text: "Uit de inkt dwarrelt een papiertje: 'Kopiist! De Onleesbare houdt me vast in zijn toren, op de laatste pagina. Volg de rode stippellijn door het land van het boek. Onderweg leer je regexen: tekens die patronen vangen. Als je vastzit, stuur ik je een briefje. — Machteld'" }
    ],
    towerIntro: "Je staat aan de voet van de Toren van de Grote Onleesbare. Elke verdieping is één vraag, en de vragen worden steeds moeilijker. Eén fout of één keer te traag, en je valt. Machteld zit op de vijfde verdieping.",
    freed: "De tralies van inkt lossen op. Machteld stapt naar buiten, met een ganzenveer achter haar oor. 'Dacht je dat ik hier zat te wachten? Ik schreef al die tijd de briefjes die je hielpen.' Ze grijnst. 'De toren gaat nog hoger. Hoe ver geraak jij?'",
    fallEarly: "Je glijdt uit over een natte klodder en tuimelt naar beneden, op een zachte stapel kladpapier. Boven roept Machteld uit haar raam: 'Bijna! De regexen ken je nu. Probeer het opnieuw.'",
    fallLate: "Je valt, maar Machteld is vrij. Met jullie tweeën is de Grote Onleesbare gekrompen tot één klein, mopperend @."
  };

  const NAMES = ["Kopiist Klodder", "Broeder Ganzenveer", "Zuster Schrapmes", "Meester Inktpot", "Kopiist Krabbel",
    "Zuster Rubriek", "Broeder Perkament", "Meesteres Pennenmes"];

  return { RUNES, STATIONS, TOWER_RULES, SPOOR_RULES, CREATURES, STORY, NAMES };
})();
