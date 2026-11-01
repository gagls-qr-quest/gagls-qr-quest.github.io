# Formát dát QR Questu (verzia 1)

Tento súbor je dohoda medzi modulmi **hra**, **mapa** a **editor**. Keď ju všetci dodržia,
moduly sa spoja do jednej hry bez toho, aby si navzájom upravovali kód.

> Zmenu formátu najprv navrhni v kanáli **#dohody** na Discorde. Po dohode ju mentor (alebo autor návrhu)
> zapíše sem. Nové nepovinné pole je v poriadku; zmena alebo odstránenie existujúceho poľa = nová verzia.

## Kde čo beží

Všetky moduly bežia na jednej doméne, preto si zdieľajú `localStorage`:

| Čo | Adresa |
| --- | --- |
| Spoločný základ (tento repozitár) | `https://gagls-qr-quest.github.io/` |
| Hra | `https://gagls-qr-quest.github.io/hra/` |
| Mapa | `https://gagls-qr-quest.github.io/mapa/` |
| Editor | `https://gagls-qr-quest.github.io/editor/` |
| Questy | `https://gagls-qr-quest.github.io/questy/<id>/quest.json` |
| Spoločná knižnica | `https://gagls-qr-quest.github.io/shared/v1/qrq.js` |
| Spoločný vzhľad | `https://gagls-qr-quest.github.io/shared/v1/style.css` |

## Parametre v adrese

| Parameter | Význam | Príklad |
| --- | --- | --- |
| `q` | id questu; `draft` = rozpracovaný quest z editora na tomto zariadení | `?q=ukazka` |
| `s` | kód stanovišťa (to, čo je v QR kóde) | `?q=ukazka&s=G6A9WP` |
| `debug` | zapne pomôcky na testovanie (každý modul si určí sám) | `?debug=1` |

**Do QR kódu patrí celá adresa hry**, napr. `https://gagls-qr-quest.github.io/hra/?q=ukazka&s=G6A9WP`.
Hráč ju naskenuje bežným fotoaparátom a hra sa otvorí priamo na stanovišti. Adresu vyrobí funkcia `stationUrl()`.

## Quest – `questy/<id>/quest.json`

```json
{
  "format": "qrq-1",
  "id": "ukazka",
  "title": "Ukážkový quest",
  "intro": "Vitaj na ukážkovom queste! ...",
  "mode": "free",
  "floors": [
    { "id": "p0", "name": "Prízemie", "image": "podorys-p0.svg" }
  ],
  "stations": [
    {
      "id": "chemia",
      "code": "XFUU7K",
      "name": "Chemické laboratórium",
      "floor": "p0",
      "x": 22.6,
      "y": 21.8,
      "points": 10,
      "task": {
        "type": "text",
        "question": "Aký prvok má v periodickej tabuľke značku Fe?",
        "answers": ["železo"]
      },
      "hint": { "text": "Je magnetický a hrdzavie.", "cost": 3 },
      "success": "Presne, železo (lat. ferrum)."
    }
  ]
}
```

| Pole | Povinné | Význam |
| --- | --- | --- |
| `format` | áno | vždy `"qrq-1"` |
| `id` | áno | malé písmená, číslice a pomlčky; zhoduje sa s názvom priečinka v `questy/` |
| `title`, `intro` | áno | názov a úvodný text pre hráča |
| `mode` | áno | `"free"` = ľubovoľné poradie, `"linear"` = stanovištia idú za sebou v poradí zoznamu |
| `floors[]` | áno | poschodia: `id`, `name`, `image` (súbor v priečinku questu alebo celá adresa) |
| `stations[].id` | áno | unikátne v rámci questu, malé písmená bez diakritiky |
| `stations[].code` | áno | 6 znakov z `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (bez 0/O a 1/I), unikátny |
| `stations[].name` | áno | názov stanovišťa (miestnosti) |
| `stations[].floor` | áno | `id` poschodia |
| `stations[].x`, `y` | áno | poloha na pôdoryse v percentách 0–100 (ľavý horný roh = 0, 0) |
| `stations[].points` | áno | body za vyriešenie |
| `task.type` | áno | `"text"`, `"choice"` (výber z možností) alebo `"number"` |
| `task.question` | áno | otázka alebo hádanka |
| `task.choices` | pri `choice` | možnosti, ktoré uvidí hráč |
| `task.answers` | áno | všetky prijaté odpovede; pri `choice` presný text správnej možnosti |
| `hint` | nie | `text` nápovedy a `cost` = koľko bodov stojí |
| `success` | nie | text po vyriešení (v režime `linear` napr. nápoveda, kde je ďalšie stanovište) |

**Kontrola odpovede:** odpoveď hráča aj prijaté odpovede sa pred porovnaním normalizujú –
malé písmená, bez diakritiky, bez medzier na začiatku a konci, viac medzier = jedna.
`" Železo "` je teda to isté ako `"zelezo"`.

## Postup hráča – `localStorage`

Kľúč: `qrq:v1:progress:<id questu z adresy>` (pri `?q=draft` teda `qrq:v1:progress:draft`).
Čítaj a zapisuj ho len cez `loadProgress()` a `saveProgress()`.

```json
{
  "questId": "ukazka",
  "team": "Sovy",
  "startedAt": "2026-11-20T17:03:00.000Z",
  "finishedAt": null,
  "lastStation": "chemia",
  "stations": {
    "chemia": {
      "foundAt": "2026-11-20T17:05:10.000Z",
      "solvedAt": "2026-11-20T17:06:02.000Z",
      "attempts": 2,
      "hintUsed": false,
      "points": 10
    }
  }
}
```

| Pole | Kto zapisuje | Význam |
| --- | --- | --- |
| `team` | hra | meno tímu z úvodnej obrazovky |
| `startedAt`, `finishedAt` | hra | začiatok a koniec hry (ISO čas) |
| `lastStation` | hra | `id` naposledy otvoreného stanovišťa (mapa ukáže „Si tu“) |
| `stations.<id>.foundAt` | hra | kedy hráč stanovište naskenoval |
| `stations.<id>.solvedAt` | hra | kedy ho vyriešil (`null` = ešte nie) |
| `stations.<id>.attempts` | hra | počet pokusov |
| `stations.<id>.hintUsed` | hra | či si kúpil nápovedu |
| `stations.<id>.points` | hra | získané body (po odpočítaní nápovedy) |

Mapa postup len číta. Editor ho nepoužíva.

## Rozpracovaný quest z editora

Editor ukladá rozpracovaný quest do `localStorage` pod kľúčom `qrq:v1:draft` (celý quest ako JSON).
Hra a mapa ho otvoria s `?q=draft` – funguje to len na tom istom zariadení a v tom istom prehliadači.
Na zverejnenie treba quest exportovať a nahrať do `questy/<id>/` v tomto repozitári.

## Spoločná knižnica `shared/v1/qrq.js`

```js
import {
  BASE_URL, KEYS, getParam, getQuestId, loadQuest,
  loadProgress, saveProgress, resetProgress, newProgress,
  stationUrl, mapUrl, editorUrl,
} from 'https://gagls-qr-quest.github.io/shared/v1/qrq.js';

const quest = await loadQuest();            // podľa ?q=..., inak ukážkový quest
const progress = loadProgress();            // postup hráča pre ten istý quest
const url = stationUrl('ukazka', 'G6A9WP'); // adresa do QR kódu
```

## Ako testovať spoluprácu modulov

- **Lokálne** (VS Code + Live Server) každý modul funguje samostatne: quest aj knižnicu načíta z internetu.
  `localStorage` je však na `127.0.0.1` iný ako na GitHub Pages, takže postup z hry mapa lokálne neuvidí.
- **Spolu** to testujte na GitHub Pages: po `git push` je zmena online asi o minútu.
- Mapa má na testovanie tlačidlo „Simuluj postup“ (`?debug=1`), aby nemusela čakať na hru.

## História zmien

| Verzia | Dátum | Zmena |
| --- | --- | --- |
| qrq-1 | 2026-11 | Prvá verzia: quest, postup hráča, draft, `shared/v1/qrq.js` |
