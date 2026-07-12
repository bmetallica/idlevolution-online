// Baut index.json aus allen islands/<user>/island.json — der Einstiegspunkt,
// den die Spiele lesen (eine Datei statt vieler API-Aufrufe).
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';

const entries = [];
if (existsSync('islands')) {
  for (const user of readdirSync('islands', { withFileTypes: true })) {
    if (!user.isDirectory()) continue;
    const p = `islands/${user.name}/island.json`;
    if (!existsSync(p)) continue;
    try {
      const d = JSON.parse(readFileSync(p, 'utf8'));
      entries.push({
        owner: user.name,
        name: String(d.name || user.name).slice(0, 40),
        epoch: String(d.epoch || '').slice(0, 40),
        population: Number(d.population) || 0,
        exportedAt: String(d.exportedAt || '').slice(0, 30),
        hasOffers: existsSync(`islands/${user.name}/offers.json`),
        hasPacks: existsSync(`islands/${user.name}/packs.json`),
      });
    } catch { /* defekte Datei → nicht in den Index */ }
  }
}
entries.sort((a, b) => b.population - a.population);
writeFileSync('index.json', JSON.stringify({ version: 1, updatedAt: new Date().toISOString(), islands: entries }, null, 2) + '\n');
console.log(`index.json: ${entries.length} Insel(n)`);
