/**
 * Pré-remplissage des compendiums (Guide_Implementation_FVTT.md §3 décision #18) : un
 * compendium monde par type d'Item réutilisable, importé depuis les sources JSON de `packs/` au
 * premier chargement du monde. Pas de compendium système compilé en LevelDB (nécessiterait
 * `@foundryvtt/foundryvtt-cli` comme dépendance de build, contraire à "pas de build/bundler") —
 * ce sont des compendiums **monde**, créés au runtime, dont les sources JSON restent éditables à
 * la main dans `packs/`.
 */
const SEEDS = [
  { key: "talents", label: "DH.CompendiumSeed.Talents", file: "talents.json" },
  { key: "advanced-skills", label: "DH.CompendiumSeed.AdvancedSkills", file: "advanced-skills.json" },
  { key: "weapons", label: "DH.CompendiumSeed.Weapons", file: "weapons.json" },
  { key: "ranged-weapons", label: "DH.CompendiumSeed.RangedWeapons", file: "ranged-weapons.json" },
  { key: "gear", label: "DH.CompendiumSeed.Gear", file: "gear.json" }
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
      const items = await fetch(`systems/${game.system.id}/packs/${seed.file}`).then(response => response.json());

      const pack = await CompendiumCollection.createCompendium({
        type: "Item",
        label: game.i18n.localize(seed.label),
        name: seed.key
      });

      await Item.createDocuments(items, { pack: pack.collection });
    } catch (error) {
      console.error(`Dark Heresy V1 | Échec du pré-remplissage du compendium "${seed.key}"`, error);
      ui.notifications.error(game.i18n.format("DH.CompendiumSeed.Error", { name: seed.key }));
    }
  }
}
