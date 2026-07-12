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
2. Nur JSON — keine Skripte, keine Binärdateien.
3. Max. 512 KB pro Datei, max. 2 MB pro Ordner.

## Haftungsausschluss

Alle Inhalte werden von Spielern hochgeladen und automatisiert, aber ohne
Gewähr geprüft. Die Nutzung erfolgt **auf eigene Gefahr** — es wird keine
Haftung für Schäden durch heruntergeladene Inhalte übernommen. Details im
Spiel unter „Insel online freigeben".
