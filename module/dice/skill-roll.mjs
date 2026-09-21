import { DH } from "../config.mjs";
import { resolveTargetTest } from "./roll-test.mjs";

/**
 * Lance un test de compétence de base (spec §3), champ fixe du Data Model `acolyte`.
 * @param {Actor} actor
 * @param {string} skillKey Clé de `DH.baseSkills` (ex. "vigilance").
 */
export async function rollBaseSkillTest(actor, skillKey) {
  const skill = actor.system.skills?.[skillKey];
  const config = DH.baseSkills[skillKey];
  if (!skill || !config) return null;

  return resolveTargetTest(actor, {
    label: game.i18n.localize(config.label),
    target: skill.total
  });
}

/**
 * Lance un test de compétence avancée (spec §3), portée par un Item `advancedSkill`.
 * @param {Actor} actor
 * @param {Item} item
 */
export async function rollAdvancedSkillTest(actor, item) {
  if (!item?.system) return null;

  return resolveTargetTest(actor, {
    label: item.name,
    target: item.system.total
  });
}
