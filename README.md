# QR Quest GAGLS – spoločný základ

Hra po budove Gymnázia arm. gen. L. Svobodu v Humennom: hráč naskenuje QR kód na stanovišti,
vyrieši úlohu a zbiera body. Mentoringový projekt TUKE × GAGLS, školský rok 2026/27.

**Živá stránka:** https://gagls-qr-quest.github.io/

## Ako je projekt poskladaný

| Repozitár | Čo obsahuje | Kto ho spravuje |
| --- | --- | --- |
| [`gagls-qr-quest.github.io`](https://github.com/gagls-qr-quest/gagls-qr-quest.github.io) | rozcestník, spoločná knižnica a vzhľad, questy a pôdorysy | mentor (všetci môžu pushovať) |
| [`hra`](https://github.com/gagls-qr-quest/hra) | hráčska aplikácia: stanovištia, úlohy, body | študent – Hra |
| [`mapa`](https://github.com/gagls-qr-quest/mapa) | mapa školy: pôdorysy a stanovištia | študent – Mapa |
| [`editor`](https://github.com/gagls-qr-quest/editor) | tvorba questu, QR karty, výsledky | študent – Editor |

Všetky repozitáre bežia na jednej doméne `gagls-qr-quest.github.io`, preto spolu tvoria jednu hru.
Ako si moduly odovzdávajú dáta, popisuje **[FORMAT.md](FORMAT.md)** – prečítaj si ho ako prvé.

## Čo je v tomto repozitári

```
index.html            rozcestník
demo-qr.html          testovacie QR kódy ukážkového questu
FORMAT.md             dohoda o formáte dát medzi modulmi
shared/v1/qrq.js      spoločná knižnica (načítanie questu, postup hráča, adresy)
shared/v1/style.css   spoločný vzhľad (farby, tlačidlá, karty)
questy/ukazka/        ukážkový quest s dvoma pôdorysmi
```

## Pravidlá pre tento repozitár

- Sem môže pushovať každý z tímu, ale `shared/` a `FORMAT.md` sa menia len po dohode v #dohody.
- Nový quest = nový priečinok `questy/<id>/` s `quest.json` a obrázkami pôdorysov.
- Skutočné pôdorysy školy sem patria až so súhlasom školy a len v zjednodušenej podobe.
