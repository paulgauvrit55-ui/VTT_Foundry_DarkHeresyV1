import { promptDifficultyModifier } from "../apps/roll-dialog.mjs";

/**
 * Résout un test d100 roll-under générique (spec §8.1-8.2) contre une cible déjà
 * calculée (caractéristique ou compétence) : prompt du modificateur de difficulté,
 * jet de 1d100, calcul du degré de réussite/échec, puis carte de chat.
 * @param {Actor} actor
 * @param {object} options
 * @param {string} options.label
 * @param {number} options.target
 * @param {string} [options.template] Template de carte de chat, par défaut celui du test générique.
 * @param {(rollInfo: {result: number, success: boolean, degree: number}) => object} [options.buildExtraContext]
 *   Callback fournissant des données additionnelles à fusionner dans le contexte du template
 *   (ex. localisation touchée pour une carte d'attaque à l'arme, §2.4ter), calculée après le jet.
 */
export async function resolveTargetTest(actor, { label, target, template, buildExtraContext } = {}) {
  const modifier = await promptDifficultyModifier();
  if (modifier === null) return null;

  const finalTarget = Math.max(0, target + modifier);
  const roll = await new Roll("1d100").evaluate();
  const result = roll.total;
  const success = result <= finalTarget;
  const degree = Math.floor(Math.abs(finalTarget - result) / 10);

  const context = { label, target: finalTarget, modifier, result, success, degree };
  if (buildExtraContext) Object.assign(context, buildExtraContext({ result, success, degree }));

  const content = await foundry.applications.handlebars.renderTemplate(
    template ?? `systems/${game.system.id}/templates/chat/characteristic-test.hbs`,
    context
  );

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    rolls: [roll],
    sound: CONFIG.sounds.dice,
    content
  });

  return { roll, success, degree, result, finalTarget };
}
