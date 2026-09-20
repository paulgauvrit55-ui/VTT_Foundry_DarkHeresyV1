import { DH } from "../config.mjs";
import { promptDifficultyModifier } from "../apps/roll-dialog.mjs";

/**
 * Résout un test de caractéristique (spec §8.1-8.2) : prompt du modificateur de
 * difficulté, jet de 1d100 comparé à la cible, calcul du degré de réussite/échec,
 * puis publication d'une carte de chat.
 * @param {Actor} actor
 * @param {string} characteristicKey Clé de `DH.characteristics` (ex. "force").
 */
export async function rollCharacteristicTest(actor, characteristicKey) {
  const characteristic = actor.system.characteristics?.[characteristicKey];
  const config = DH.characteristics[characteristicKey];
  if (!characteristic || !config) return null;

  const modifier = await promptDifficultyModifier();
  if (modifier === null) return null;

  const target = Math.max(0, characteristic.value + modifier);
  const roll = await new Roll("1d100").evaluate();
  const result = roll.total;
  const success = result <= target;
  const degree = Math.floor(Math.abs(target - result) / 10);

  const content = await foundry.applications.handlebars.renderTemplate(
    `systems/${game.system.id}/templates/chat/characteristic-test.hbs`,
    {
      label: game.i18n.localize(config.label),
      target,
      modifier,
      result,
      success,
      degree
    }
  );

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    rolls: [roll],
    sound: CONFIG.sounds.dice,
    content
  });

  return { roll, success, degree };
}
