import { promptDifficultyModifier } from "../apps/roll-dialog.mjs";

/**
 * Résout un test d100 roll-under générique (spec §8.1-8.2) contre une cible déjà
 * calculée (caractéristique ou compétence) : prompt du modificateur de difficulté,
 * jet de 1d100, calcul du degré de réussite/échec, puis carte de chat.
 * @param {Actor} actor
 * @param {{label: string, target: number}} options
 */
export async function resolveTargetTest(actor, { label, target }) {
  const modifier = await promptDifficultyModifier();
  if (modifier === null) return null;

  const finalTarget = Math.max(0, target + modifier);
  const roll = await new Roll("1d100").evaluate();
  const result = roll.total;
  const success = result <= finalTarget;
  const degree = Math.floor(Math.abs(finalTarget - result) / 10);

  const content = await foundry.applications.handlebars.renderTemplate(
    `systems/${game.system.id}/templates/chat/characteristic-test.hbs`,
    { label, target: finalTarget, modifier, result, success, degree }
  );

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    rolls: [roll],
    sound: CONFIG.sounds.dice,
    content
  });

  return { roll, success, degree };
}
