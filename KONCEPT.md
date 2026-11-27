# Bromsbanan – koncept och testplan

**Mål (en sak):** eleven ska kunna räkna ut hur långt en bil hinner innan den står stilla, och
förstå varför sträckan växer så snabbt med hastigheten och varför blöt väg och reaktionstid
förlänger den.

**Målgrupp:** fysik åk 7–9. Läser korta texter. Lgr22 FY.7-9.1.9.

**Kärnmekanik (touch först):** bilen står på en väg med meterstreck 0–100. Frågan säger hastighet
och väglag; eleven trycker på en av tre brickor med avstånd. Bilen kör iväg och bromsar in på det
rätta avståndet, med bromsspår och en gul markering som visar antalet meter. Två tryck per fråga,
inga drag, ingen text som måste skrivas.

**Fysik (redovisad i appen):** bromssträcka = v² / (2 · µ · g), reaktionssträcka = v · 1,0 s.
µ = 0,8 torr asfalt, µ = 0,5 blöt asfalt. Kontroll: 50 km/h torr väg = 14 m + 12 m = 26 m, samma
storleksordning som Trafikverkets tabell för stoppsträcka.

**Nivåer:** 1 torr asfalt (bromssträcka), 2 blöt asfalt (bromssträcka), 3 torr asfalt med en
sekunds reaktionstid (stoppsträcka). Fem frågor per nivå, 30/50/70/80/90 km/h. Skalan är alltid
0–100 m, så avstånden går att jämföra mellan frågorna.

**5-minuterssession:** 15 frågor i tre nivåer, en runda till-knapp och nivåknapp i HUD.

**Belöning barnet kan berätta om:** stjärnor per nivå och slutraden "Alla tre nivåer klara" – och
att 90 km/h på blöt väg behöver 64 meter, alltså mer än en fotbollsplan.

**Vad barnet lär:** att bromssträckan går som hastigheten i kvadrat (dubbla farten = fyra gånger
sträckan), att halverad friktion nästan fördubblar sträckan, och att reaktionstiden är en egen
sträcka som adderas.

**Lgr22:** FY.7-9.1.9 – ”Krafter, rörelser och rörelseförändringar samt hur kunskaper om detta kan
användas, till exempel i frågor om trafiksäkerhet.” (ordagrant ur Skolverkets syllabus-API)

**Varför iPad:** allt ryms på en skärm utan scroll, brickorna är 68–76 px höga, canvas ritas om vid
rotation, ingen text i spelbilden kräver läsning utöver frågan som också läses upp (mp3).

## Testplan (mätbar)

1. `node verify.cjs` 0 fel: 15 frågor, rätt svar omräknat oberoende, tre unika alternativ inom
   0–100 m, rätt svar aldrig i frågetexten, reaktion + broms = stoppsträcka, sträckan växer med
   farten, blöt > torr, stopp > broms, v²-sambandet, 33 röstfiler som matchar exakt de meningar
   appen säger.
2. 0 px scroll (`scrollHeight - innerHeight` och `scrollWidth - innerWidth`) i 1024×768, 768×1024,
   390×844, 1440×900 efter att startskärmen stängts.
3. Hela rundan spelad i webbläsare: alla tre nivåer till slutrutan, stjärnräkning stämmer,
   bilen stannar på rätt meter, mp3-anrop > 0.
4. Felvägen prövad: fel svar kostar ingen stjärna, rätt bricka blir grön och pulserar, bilen
   bromsar ändå och förklaringen skrivs + läses upp.
5. Ingen inloggning, inga länkar ut, ingen reklam, inga tredjepartsresurser utom kodsnutten.

## Validering (annan agent)

Se `VALIDERING.md`.
