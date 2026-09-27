import { DH } from "../config.mjs";
import { resolveTargetTest } from "./roll-test.mjs";
import { promptDifficultyModifier } from "../apps/roll-dialog.mjs";

/**
 * Caractéristique testée avec une arme (CC en mêlée, CT à distance) et cible du test
 * (caractéristique + Bonus de l'arme, spec §6.1). Partagé par le test d'attaque et la Fureur du juste.
 * @returns {{config: object, target: number}|null}
 */
function weaponTestTarget(actor, item) {
  const characteristicKey = item.system.isMelee ? "cc" : "ct";
  const characteristic = actor.system.characteristics?.[characteristicKey];
  const config = DH.characteristics[characteristicKey];
  if (!characteristic || !config) return null;
  return { config, target: characteristic.value + (item.system.bonus ?? 0) };
}

/**
 * Lance un test d'attaque à l'arme (spec §9.3.1) : test de CC (corps à corps) ou de CT
 * (distance) selon le groupe de l'arme, modifié par le champ Bonus de l'arme (spec §6.1). En
 * cas de réussite, la carte de chat affiche en plus la localisation touchée et le type de
 * dégâts, avec un bouton de jet de dégâts direct (spec §2.4ter).
 * @param {Actor} actor
 * @param {Item} item Item `weapon` possédé par cet acteur.
 */
export async function rollWeaponAttackTest(actor, item) {
  const test = weaponTestTarget(actor, item);
  if (!test) return null;

  return resolveTargetTest(actor, {
    label: `${item.name} (${game.i18n.localize(test.config.abbrev)})`,
    target: test.target,
    template: `systems/${game.system.id}/templates/chat/weapon-attack.hbs`,
    // Attributs affichés quel que soit le résultat : certains (Précise, Fiable…) jouent aussi sur un échec.
    buildExtraContext: ({ result, success }) => {
      const attributes = item.system.attributes?.trim() ?? "";
      if (!success) return { attributes };
      const location = DH.getHitLocation(result);
      return {
        attributes,
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
 * @returns {Array<{display: number, active: boolean, isDie: boolean, isTen?: boolean, sign: number}>}
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
        const active = result.active !== false;
        // `isTen` : 10 naturel sur un d10 actif, déclencheur de la Fureur du juste.
        const isTen = active && term.faces === 10 && result.result === 10;
        parts.push({ display: result.result, active, isDie: true, isTen, sign });
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
  const breakdown = buildDamageBreakdown(roll);

  const content = await foundry.applications.handlebars.renderTemplate(
    `systems/${game.system.id}/templates/chat/weapon-damage.hbs`,
    {
      label: item.name,
      damageTypeLabel: game.i18n.localize(DH.damageTypes[item.system.damageType]),
      penetration: item.system.penetration,
      attributes: item.system.attributes?.trim() ?? "",
      forceBonus,
      breakdown,
      total,
      // Au moins un 10 naturel sur un d10 : la carte propose la Fureur du juste.
      furyAvailable: breakdown.some(part => part.isTen),
      actorId: actor.id,
      itemId: item.id
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

/**
 * Fureur du juste, déclenchée depuis une carte de dégâts contenant au moins un 10 naturel sur un
 * d10 : nouveau test de la caractéristique de l'arme (même cible que le test d'attaque, avec
 * modificateur de difficulté). En cas de réussite, 1d10 est ajouté aux dégâts ; chaque 10 en
 * relance un autre sans nouveau test (dé explosif `1d10x10`), jusqu'à un résultat différent de 10.
 * @param {Actor} actor
 * @param {Item} item Arme ayant infligé les dégâts.
 * @param {number} baseTotal Total de la carte de dégâts d'origine.
 */
export async function rollRighteousFury(actor, item, baseTotal) {
  const test = weaponTestTarget(actor, item);
  if (!test) return null;

  const modifier = await promptDifficultyModifier();
  if (modifier === null) return null;

  const target = Math.max(0, test.target + modifier);
  const testRoll = await new Roll("1d100").evaluate();
  const result = testRoll.total;
  const success = result <= target;
  const degree = Math.floor(Math.abs(target - result) / 10);

  const rolls = [testRoll];
  let furyBreakdown = [];
  let extra = 0;
  if (success) {
    const furyRoll = await new Roll("1d10x10").evaluate();
    rolls.push(furyRoll);
    furyBreakdown = buildDamageBreakdown(furyRoll);
    extra = furyRoll.total;
  }

  const content = await foundry.applications.handlebars.renderTemplate(
    `systems/${game.system.id}/templates/chat/righteous-fury.hbs`,
    {
      label: `${item.name} (${game.i18n.localize(test.config.abbrev)})`,
      target,
      modifier,
      result,
      success,
      degree,
      furyBreakdown,
      extra,
      baseTotal,
      total: baseTotal + extra
    }
  );

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    rolls,
    sound: CONFIG.sounds.dice,
    content
  });

  return { success, extra, total: baseTotal + extra };
}
