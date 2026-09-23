import { DH } from "./config.mjs";

/**
 * Pré-remplissage des compendiums (Guide_Implementation_FVTT.md §3 décision #18) : un
 * compendium monde par type d'Item réutilisable, importé depuis les sources JSON de `packs/` au
 * premier chargement du monde. Pas de compendium système compilé en LevelDB (nécessiterait
 * `@foundryvtt/foundryvtt-cli` comme dépendance de build, contraire à "pas de build/bundler") —
 * ce sont des compendiums **monde**, créés au runtime, dont les sources JSON restent éditables à
 * la main dans `packs/`.
 * Chaque entrée précise le type de document du compendium et comment construire ses documents :
 * directement depuis un fichier JSON pour les Items, ou assemblés depuis plusieurs fichiers pour
 * les tables aléatoires des pouvoirs psychiques (cf. `buildPsychicTables`).
 */
const SEEDS = [
  { key: "talents", label: "DH.CompendiumSeed.Talents", type: "Item", build: () => loadPackFile("talents.json") },
  { key: "advanced-skills", label: "DH.CompendiumSeed.AdvancedSkills", type: "Item", build: () => loadPackFile("advanced-skills.json") },
  { key: "weapons", label: "DH.CompendiumSeed.Weapons", type: "Item", build: () => loadPackFile("weapons.json") },
  { key: "ranged-weapons", label: "DH.CompendiumSeed.RangedWeapons", type: "Item", build: () => loadPackFile("ranged-weapons.json") },
  { key: "gear", label: "DH.CompendiumSeed.Gear", type: "Item", build: () => loadPackFile("gear.json") },
  { key: "armours", label: "DH.CompendiumSeed.Armours", type: "Item", build: () => loadPackFile("armours.json") },
  { key: "psychic-powers", label: "DH.CompendiumSeed.PsychicPowers", type: "Item", build: () => loadPackFile("psychic-powers.json") },
  { key: "psychic-tables", label: "DH.CompendiumSeed.PsychicTables", type: "RollTable", build: buildPsychicTables }
];

/**
 * Sème les compendiums par défaut au premier chargement du monde. Seul le MJ agit (évite que
 * plusieurs clients connectés ne tentent de créer le même compendium en parallèle). Garde par
 * compendium (`game.packs.get`) : si le compendium existe déjà — qu'il ait été semé lors d'un
 * chargement précédent ou que le MJ en ait créé/renommé un manuellement portant le même
 * identifiant — on ne le retouche pas, pour ne jamais dupliquer les entrées ni écraser des
 * modifications du MJ.
 */
export async function seedCompendiums() {
  if (!game.user.isGM) return;

  for (const seed of SEEDS) {
    const collectionId = `world.${seed.key}`;
    if (game.packs.get(collectionId)) continue;

    try {
      const documents = await seed.build();

      const pack = await CompendiumCollection.createCompendium({
        type: seed.type,
        label: game.i18n.localize(seed.label),
        name: seed.key
      });

      await getDocumentClass(seed.type).createDocuments(documents, { pack: pack.collection });
    } catch (error) {
      console.error(`Dark Heresy V1 | Échec du pré-remplissage du compendium "${seed.key}"`, error);
      ui.notifications.error(game.i18n.format("DH.CompendiumSeed.Error", { name: seed.key }));
    }
  }
}

function loadPackFile(file) {
  return fetch(`systems/${game.system.id}/packs/${file}`).then(response => response.json());
}

/**
 * Tables des Phénomènes psychiques et des Périls du Warp (spec §7.3) : chaque fichier source est
 * un tableau d'entrées `{ name, description, range }` (plage "01-05", "100" ou [1, 5]), converti
 * en RollTable 1d100. Le drapeau `tableKey` permet au jet de Puissance de retrouver la table quel
 * que soit son nom affiché (cf. `psychic-roll.mjs`).
 */
async function buildPsychicTables() {
  const tables = [];
  for (const [tableKey, config] of Object.entries(DH.psychicTables)) {
    const entries = await loadPackFile(config.file);
    tables.push({
      name: game.i18n.localize(config.label),
      formula: "1d100",
      replacement: true,
      displayRoll: true,
      flags: { [game.system.id]: { tableKey } },
      results: entries.map(entry => {
        const range = parseRange(entry.range);
        return {
          type: CONST.TABLE_RESULT_TYPES.TEXT,
          name: entry.name,
          description: entry.description,
          range,
          weight: range[1] - range[0] + 1
        };
      })
    });
  }
  return tables;
}

function parseRange(range) {
  if (Array.isArray(range)) return range.map(Number);
  const [low, high = low] = String(range).split("-").map(Number);
  return [low, high];
}
