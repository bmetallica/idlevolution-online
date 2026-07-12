# Workflows aktivieren

Diese beiden Dateien nach `.github/workflows/` verschieben und pushen
(braucht den `workflow`-Scope, z.B. `gh auth refresh -s workflow`):

- `validate-island.yml` — prüft jeden Insel-PR (Pfad-Schutz, Schema) und merged automatisch
- `build-index.yml` — baut `index.json` nach jedem Merge neu
