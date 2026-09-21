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
 * Décompose une évaluation de `Roll` en parties affichables (spec 2026-09-21, demande
 * utilisateur) : chaque dé individuel (y compris ceux écartés par un modificateur `kh`/`kl`/
 * `dh`/`dl`, marqués `active: false`) et chaque modificateur fixe de la formule, avec son signe.
 * @param {Roll} roll Un `Roll` déjà évalué.
 * @returns {Array<{display: number, active: boolean, isDie: boolean, sign: number}>}
 */
function buildDamageBreakdown(roll) {
  const { DiceTerm, NumericTerm, OperatorTerm } = foundry.dice.terms;
  const parts = [];
  let sign = 1;
  for (const term of roll.terms) {
    if (term instanceof OperatorTerm) {
      sign = term.operator === "-" ? -1 : 1;
      continue;
    }
    if (term instanceof DiceTerm) {
      for (const result of term.results) {
        parts.push({ display: result.result, active: result.active !== false, isDie: true, sign });
      }
    } else if (term instanceof NumericTerm) {
      parts.push({ display: term.number, active: true, isDie: false, sign });
    }
    sign = 1;
  }
  return parts;
}

/**
 * Lance le jet de dégâts d'une arme (spec §9.3.3) : ajoute le Bonus de Force pour une arme de
 * mêlée. Plus d'automatisation pour Déchirante (décision révisée, cf. `weapon-data.mjs`) : le
 * joueur peut déjà exprimer un effet équivalent dans la formule via les modificateurs `Roll`
 * natifs de Foundry (`kh`/`kl`, etc.).
 * @param {Actor} actor
 * @param {Item} item Item `weapon` possédé par cet acteur.
 */
export async function rollWeaponDamageTest(actor, item) {
  const forceBonus = item.system.isMelee ? (actor.system.characteristics.force.bonus ?? 0) : 0;

  const roll = await new Roll(item.system.damageFormula || "0").evaluate();
  const total = roll.total + forceBonus;

  const content = await foundry.applications.handlebars.renderTemplate(
    `systems/${game.system.id}/templates/chat/weapon-damage.hbs`,
    {
      label: item.name,
      damageTypeLabel: game.i18n.localize(DH.damageTypes[item.system.damageType]),
      penetration: item.system.penetration,
      forceBonus,
      breakdown: buildDamageBreakdown(roll),
      total
    }
  );

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    rolls: [roll],
    sound: CONFIG.sounds.dice,
    content
  });

  return { total };
}
