# De Grote Onleesbare

Een regextocht door het handschrift van *De Leeuw van Vlaenderen* (Hendrik Conscience, 1838), gemaakt voor het vak Digitale geletterdheid (Universiteit Antwerpen).

Een inktwezen, de Grote Onleesbare, eet de letters uit het boek en houdt Machteld gevangen in zijn toren. De speler reist langs tien haltes op een kaart van Vlaendren, leert bij elke halte een nieuwe *rune* (een stukje regex-syntaxis) en verslaat er een inktwezen mee. Daarna volgt de toren: *sudden death*, steeds moeilijker en sneller, tot de eerste fout. Op de vijfde verdieping zit Machteld.

## Spelopzet
- **Tocht**: tien vragen, één per halte, elk met een tijdslimiet. Een fout kost punten, maar je reist verder.
- **Toren**: elke verdieping is een vraag; één fout of één keer te traag en je valt. Opzet naar de *sudden death*-quiz in Karsdorp, Manjavacas & Kestemont (2019), *PLOS ONE* 14(10): e0224152.
- **Vraagtypes**: *golf* (schrijf een regex die alle woorden in het net vangt en geen enkel woord op de oever), *raad* (welk woord vangt deze regex?), *kies* (welke regex scheidt beide groepen?) en *spoor* (welke regex gaf deze markering in een echte regel uit het handschrift?).
- **Leertocht zonder klok**: geen tijd, geen punten, briefjes (hints) gratis.
- Na elke vraag: uitleg, een voorgelezen versie van de regex en de plaats in het handschrift (pagina en regel).

## Runen
| Halte | Rune | Syntaxis |
|---|---|---|
| Damme | De Letter | gewone tekens |
| Male | De Joker | `.` |
| Brugge | De Kooi | `[ ]` |
| Wijnendale | De Twijfel | `?` |
| Torhout | De Ketting | `+` |
| Ieper | De Splitsing | `( \| )` |
| De Leie | De Ankers | `^ $` |
| Gent | Het Bereik | `[A-Z] [a-z]` |
| Het Moer | De Ster | `*`, `.*` |
| De Schelde | De Grens | `\b` |

## Voor de lesgever
- Spring rechtstreeks naar een halte met `#halte1` … `#halte10`, of naar de toren met `#toren` (of `#toren5` voor de verdieping van Machteld). Handig om één rune klassikaal te demonstreren.
- De erelijst en de voortgang blijven alleen in de browser van de speler (localStorage). Er wordt niets verstuurd.
- Elke opdracht wordt bij het maken gecontroleerd met echte JavaScript-regexen; `node tools/test_engine.js` genereert duizenden opdrachten en controleert dat elke opdracht precies één juist antwoord heeft.

## Bestanden
- `index.html`, `css/`, `js/`: het spel (statische site, geen build nodig; werkt ook rechtstreeks vanaf schijf).
- `js/data.js`: gegenereerd uit een Transkribus-export (PAGE XML) met `python3 tools/bouw_data.py <export.zip>`. Bevat alleen regeltekst, geen metadata of namen.
- `tools/bundel.py`: maakt `dist/grote-onleesbare.html`, één losstaand bestand om offline te spelen of op Blackboard te zetten.

## Bron
Alle woorden en regels komen uit de transcripties die studenten van Digitale geletterdheid (2025-2027) maakten van het handschrift van *De Leeuw van Vlaenderen* (Letterenhuis, Antwerpen, C 34 / H (1)), fouten en onleesbare plekken (@) inbegrepen.

## Over deze Leeuw
Conscience maakte van de Guldensporenslag een romantisch verhaal over trots en vrijheid; de leeuw werd later ook een symbool dat extreemrechtse bewegingen voor zich opeisten. Dit spel vertelt dat verhaal niet na: niemand vecht hier om land, taal of afkomst. De enige vijand is onleesbaarheid.

Gemaakt door Mike Kestemont en Claude.
