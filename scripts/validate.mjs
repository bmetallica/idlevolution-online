// Validiert die Dateien eines Insel-PRs — bewusst OHNE fremde Abhängigkeiten
// (die Action führt nur diesen versionierten Code aus, nie PR-Inhalte).
//
// Aufruf: node scripts/validate.mjs <pr-autor> <datei-verzeichnis> <changed-files.txt>
//   - jede geänderte Datei MUSS unter islands/<pr-autor>/ liegen
//   - nur erlaubte Dateinamen, nur gültiges JSON, harte Größen-Limits
//   - island.json wird strukturell gegen das v1-Schema geprüft

import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const [, , author, dir, listFile] = process.argv;
if (!author || !dir || !listFile) { console.error('Argumente fehlen'); process.exit(2); }

const MAX_FILE = 512 * 1024;
const MAX_TOTAL = 2 * 1024 * 1024;
const ALLOWED = new Set(['island.json', 'packs.json', 'offers.json', 'accepts.json']);
const USER_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

const fail = (msg) => { console.error(`❌ ${msg}`); process.exit(1); };
const files = readFileSync(listFile, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
if (!files.length) fail('PR enthält keine Dateien');
if (!USER_RE.test(author)) fail(`Ungültiger Autor: ${author}`);

// ── 1) Pfad-Schutz: nur der eigene Ordner, nur erlaubte Dateinamen ──
for (const f of files) {
  const parts = f.split('/');
  if (parts.length !== 3 || parts[0] !== 'islands') fail(`Pfad außerhalb von islands/: ${f}`);
  if (parts[1] !== author) fail(`${f}: Ordner "${parts[1]}" gehört nicht PR-Autor "${author}"`);
  if (!ALLOWED.has(parts[2])) fail(`${f}: Dateiname nicht erlaubt (${[...ALLOWED].join(', ')})`);
}

// ── 2) Größe + JSON-Parse ──
let total = 0;
const json = {};
for (const f of files) {
  const p = path.join(dir, f);
  const size = statSync(p).size;
  if (size > MAX_FILE) fail(`${f}: ${size} Bytes > ${MAX_FILE}`);
  total += size;
  try { json[f] = JSON.parse(readFileSync(p, 'utf8')); }
  catch (e) { fail(`${f}: kein gültiges JSON (${e.message})`); }
}
if (total > MAX_TOTAL) fail(`Gesamtgröße ${total} > ${MAX_TOTAL}`);

// ── 3) island.json strukturell prüfen (Schema v1, handgeprüft = 0 Dependencies) ──
const str = (v, max, re) => typeof v === 'string' && v.length <= max && (!re || re.test(v));
const int = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
const islandFile = files.find((f) => f.endsWith('/island.json'));
if (islandFile) {
  const d = json[islandFile];
  const bad = (m) => fail(`${islandFile}: ${m}`);
  if (typeof d !== 'object' || Array.isArray(d) || d === null) bad('kein Objekt');
  const allowedKeys = new Set(['version', 'owner', 'name', 'epoch', 'population', 'exportedAt', 'chronicle', 'map', 'instances', 'roads']);
  for (const k of Object.keys(d)) if (!allowedKeys.has(k)) bad(`unbekanntes Feld "${k}"`);
  if (d.version !== 1) bad('version muss 1 sein');
  if (d.owner !== author) bad(`owner "${d.owner}" ≠ PR-Autor "${author}"`);
  if (!str(d.name, 40) || !d.name.length) bad('name fehlt/zu lang');
  if (!str(d.epoch, 40, /^[a-z0-9_]+$/)) bad('epoch ungültig');
  if (d.chronicle !== undefined && !str(d.chronicle, 500)) bad('chronicle zu lang');
  if (typeof d.map !== 'object' || d.map === null) bad('map fehlt');
  if (!int(d.map.width, 8, 128) || !int(d.map.height, 8, 128)) bad('map-Maße ungültig');
  if (!str(d.map.tiles, 16384, /^[WGSFR]+$/)) bad('map.tiles ungültig (nur WGSFR)');
  if (d.map.tiles.length !== d.map.width * d.map.height) bad('map.tiles-Länge ≠ width×height');
  if (!Array.isArray(d.instances) || d.instances.length > 2000) bad('instances ungültig/zu viele');
  for (const i of d.instances) {
    if (!str(i.buildingId, 80, /^[a-z0-9_-]+$/)) bad(`instance buildingId ungültig`);
    if (!int(i.x, 0, 127) || !int(i.y, 0, 127)) bad('instance-Koordinate ungültig');
    if (i.rot !== undefined && !int(i.rot, 0, 3)) bad('instance rot ungültig');
    for (const k of Object.keys(i)) if (!['buildingId', 'x', 'y', 'rot'].includes(k)) bad(`instance: unbekanntes Feld "${k}"`);
  }
  if (d.roads !== undefined) {
    if (!Array.isArray(d.roads) || d.roads.length > 8000) bad('roads ungültig');
    for (const r of d.roads) if (!str(r, 8, /^\d{1,3},\d{1,3}$/)) bad('roads-Eintrag ungültig');
  }
}

console.log(`✅ ${files.length} Datei(en) von ${author} gültig (${total} Bytes)`);
