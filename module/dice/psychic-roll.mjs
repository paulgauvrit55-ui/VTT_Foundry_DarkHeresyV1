import { DH } from "../config.mjs";
import { promptPsychicPowerOptions } from "../apps/roll-dialog.mjs";

/**
 * Lance le jet de Puissance d'un pouvoir psychique (spec §7.2) : jusqu'à Niveau Psy d10 (le
 * joueur choisit le nombre, "au maximum" son Niveau Psy) + Bonus de Force Mentale + modificateur
 * libre (stimulants, équipement…), réussite si le total atteint le Seuil Psychique du pouvoir.
 * Chaque 9 naturel est compté (spec §7.3) : la carte de chat propose alors un bouton de tirage
 * sur la table des Phénomènes psychiques (cf. `rollPsychicPhenomenon`).
 * @param {Actor} actor
 * @param {Item} item Item `psychicPower` possédé par cet acteur.
 */
export async function rollPsychicPowerTest(actor, item) {
  const psyRating = actor.system.psyRating ?? 0;
  if (psyRating < 1) {
    ui.notifications.warn(game.i18n.localize("DH.PsychicPower.NoPsyRating"));
    return null;
  }

  const options = await promptPsychicPowerOptions(psyRating);
  if (!options) return null;

  const roll = await new Roll(`${options.dice}d10`).evaluate();
  const willpowerBonus = actor.system.characteristics.forceMentale.bonus ?? 0;
  const total = roll.total + willpowerBonus + options.modifier;
  const threshold = item.system.threshold;
  const success = total >= threshold;
  const dice = roll.dice[0].results.map(result => ({ value: result.result, isNine: result.result === 9 }));
  const phenomena = dice.filter(die => die.isNine).length;

  const content = await foundry.applications.handlebars.renderTemplate(
    `systems/${game.system.id}/templates/chat/psychic-power.hbs`,
    {
      label: item.name,
      threshold,
      dice,
      willpowerBonus,
      modifier: options.modifier,
      total,
      success,
      margin: total - threshold,
      overbleed: item.system.overbleed,
      phenomena
    }
  );

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    rolls: [roll],
    sound: CONFIG.sounds.dice,
    content
  });

  return { roll, total, success, phenomena };
}

/**
 * Tire sur la table des Phénomènes psychiques, puis — si le résultat atteint le seuil de la spec
 * §7.3 (75+) — enchaîne automatiquement un tirage sur la table des Périls du Warp. Les tables sont
 * retrouvées par leur drapeau `tableKey` (posé au pré-remplissage, cf. `compendium-seed.mjs`),
 * d'abord parmi les tables du monde (copie importée/éditée par le MJ, prioritaire), sinon dans
 * les compendiums.
 */
export async function rollPsychicPhenomenon() {
  const phenomena = await findPsychicTable("psychicPhenomena");
  if (!phenomena) return;

  const draw = await phenomena.draw();
  if (draw.roll.total < DH.perilsOfTheWarpThreshold) return;

  const perils = await findPsychicTable("perilsOfTheWarp");
  if (perils) await perils.draw();
}

async function findPsychicTable(tableKey) {
  const flagPath = `flags.${game.system.id}.tableKey`;
  const worldTable = game.tables.find(table => foundry.utils.getProperty(table, flagPath) === tableKey);
  if (worldTable) return worldTable;

  for (const pack of game.packs.filter(pack => pack.documentName === "RollTable")) {
    const index = await pack.getIndex({ fields: [flagPath] });
    const entry = index.find(entry => foundry.utils.getProperty(entry, flagPath) === tableKey);
    if (entry) return pack.getDocument(entry._id);
  }

  ui.notifications.warn(game.i18n.format("DH.PsychicPower.TableNotFound", {
    name: game.i18n.localize(DH.psychicTables[tableKey].label)
  }));
  return null;
}
