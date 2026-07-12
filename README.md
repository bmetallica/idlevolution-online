# Idlevolution Online

Gemeinsamer Online-Speicher für den asynchronen Multiplayer von
[Idlevolution](https://github.com/bmetallica/idlevolution).

## Wie es funktioniert

- Jeder Spieler veröffentlicht seine Insel **ausschließlich** unter
  `islands/<github-username>/` — per Fork + Pull Request aus dem Spiel heraus.
- Eine GitHub Action prüft jeden PR automatisch (Pfad-Schutz, Schema,
  Größen-Limits) und merged ihn bei Erfolg.
- `index.json` wird nach jedem Merge automatisch neu aufgebaut und ist der
  Einstiegspunkt für alle Spiele (Lesen ohne Token über `raw.githubusercontent.com`).

## Regeln

1. Du darfst nur Dateien unter `islands/<dein-github-name>/` ändern.
2. Nur JSON — keine Skripte, keine Binärdateien. Erlaubte Dateien:
   `island.json`, `packs.json`, `offers.json`, `accepts.json`.
3. Max. 512 KB pro Datei, max. 2 MB pro Ordner; harte Stück-Limits
   (max. 20 offene Angebote, 50 Accepts, 200 Gebäude-Definitionen).
4. Inseln ohne Update seit **90 Tagen** fallen aus dem Index (Dateien bleiben;
   der nächste Upload bringt die Insel zurück).
5. Moderation: `blocklist.json` (gepflegt vom Repo-Inhaber) nimmt Ordner aus
   dem Index; die Spiele ignorieren geblockte Ordner zusätzlich client-seitig.

## Handel (asynchron)

- `offers.json` = eigene offene Angebote + Abschluss-Tombstones (`closed`).
- `accepts.json` = angenommene fremde Angebote (Konditionen eingefroren).
- Abwicklung: Der Anbieter sieht den Accept beim Sync, bucht die Bezahlung und
  schreibt einen Tombstone (`winner` = frühester Annehmer). Der Annehmer löst
  den Tombstone beim nächsten Sync auf (Ware bzw. Erstattung).

## Haftungsausschluss

Alle Inhalte werden von Spielern hochgeladen und automatisiert, aber ohne
Gewähr geprüft. Die Nutzung erfolgt **auf eigene Gefahr** — es wird keine
Haftung für Schäden durch heruntergeladene Inhalte übernommen. Details im
Spiel unter „Insel online freigeben".
