import { DH } from "../config.mjs";
import { resolveTargetTest } from "./roll-test.mjs";

/**
 * Lance un test de caractéristique (spec §8.1).
 * @param {Actor} actor
 * @param {string} characteristicKey Clé de `DH.characteristics` (ex. "force").
 */
export async function rollCharacteristicTest(actor, characteristicKey) {
  const characteristic = actor.system.characteristics?.[characteristicKey];
  const config = DH.characteristics[characteristicKey];
  if (!characteristic || !config) return null;

  return resolveTargetTest(actor, {
    label: game.i18n.localize(config.label),
    target: characteristic.value
  });
}

/**
 * Lance un test d'Influence (règle alternative) : test d100 roll-under contre la valeur
 * d'Influence, résolu comme un test de caractéristique.
 * @param {Actor} actor
 */
export async function rollInfluenceTest(actor) {
  const influence = actor.system.resources?.influence;
  if (influence === undefined) return null;

  return resolveTargetTest(actor, {
    label: game.i18n.localize("DH.Resources.Influence"),
    target: influence
  });
}
