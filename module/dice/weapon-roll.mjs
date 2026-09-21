import { DH } from "../config.mjs";
import { resolveTargetTest } from "./roll-test.mjs";

/**
 * Lance un test d'attaque à l'arme (spec §9.3.1) : test de CC (corps à corps) ou de CT
 * (distance) selon le groupe de l'arme, modifié par le champ Bonus de l'arme (spec §6.1). En
 * cas de réussite, la carte de chat affiche en plus la localisation touchée et le type de
 * dégâts, avec un bouton de jet de dégâts direct (spec §2.4ter).
 * @param {Actor} actor
 * @param {Item} item Item `weapon` possédé par cet acteur.
 */
export async function rollWeaponAttackTest(actor, item) {
  const characteristicKey = item.system.isMelee ? "cc" : "ct";
  const characteristic = actor.system.characteristics?.[characteristicKey];
  const characteristicConfig = DH.characteristics[characteristicKey];
  if (!characteristic || !characteristicConfig) return null;

  return resolveTargetTest(actor, {
    label: `${item.name} (${game.i18n.localize(characteristicConfig.abbrev)})`,
    target: characteristic.value + (item.system.bonus ?? 0),
    template: `systems/${game.system.id}/templates/chat/weapon-attack.hbs`,
    buildExtraContext: ({ result, success }) => {
      if (!success) return {};
      const location = DH.getHitLocation(result);
      return {
        actorId: actor.id,
        itemId: item.id,
        locationLabel: game.i18n.localize(DH.armourLocations[location].label),
        damageTypeLabel: game.i18n.localize(DH.damageTypes[item.system.damageType])
      };
    }
  });
}

/**
 * Lance le jet de dégâts d'une arme (spec §9.3.3) : ajoute le Bonus de Force pour une arme de
 * mêlée, applique Déchirante en évaluant deux fois la formule et en gardant le meilleur total
 * (simplification actée, Guide_Implementation_FVTT.md §2.4bis).
 * @param {Actor} actor
 * @param {Item} item Item `weapon` possédé par cet acteur.
 */
export async function rollWeaponDamageTest(actor, item) {
  const forceBonus = item.system.isMelee ? (actor.system.characteristics.force.bonus ?? 0) : 0;

  const rolls = [await new Roll(item.system.damageFormula || "0").evaluate()];
  if (item.system.tearing) rolls.push(await new Roll(item.system.damageFormula || "0").evaluate());
  const bestRoll = rolls.reduce((best, roll) => (roll.total > best.total ? roll : best));
  const total = bestRoll.total + forceBonus;

  const content = await foundry.applications.handlebars.renderTemplate(
    `systems/${game.system.id}/templates/chat/weapon-damage.hbs`,
    {
      label: item.name,
      damageTypeLabel: game.i18n.localize(DH.damageTypes[item.system.damageType]),
      penetration: item.system.penetration,
      forceBonus,
      tearing: item.system.tearing,
      total
    }
  );

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    rolls,
    sound: CONFIG.sounds.dice,
    content
  });

  return { total };
}
