import { rollCharacteristicTest } from "../dice/characteristic-roll.mjs";
import { rollBaseSkillTest, rollAdvancedSkillTest } from "../dice/skill-roll.mjs";
import { rollWeaponAttackTest, rollWeaponDamageTest } from "../dice/weapon-roll.mjs";
import { rollPsychicPowerTest } from "../dice/psychic-roll.mjs";

export default class DarkHeresyActor extends Actor {
  /**
   * Lance un test de caractéristique (spec §8.1) pour cet acteur.
   * @param {string} characteristicKey Clé de `DH.characteristics` (ex. "force").
   */
  async rollCharacteristicTest(characteristicKey) {
    return rollCharacteristicTest(this, characteristicKey);
  }

  /**
   * Lance un test de compétence de base (spec §3) pour cet acteur.
   * @param {string} skillKey Clé de `DH.baseSkills` (ex. "vigilance").
   */
  async rollBaseSkillTest(skillKey) {
    return rollBaseSkillTest(this, skillKey);
  }

  /**
   * Lance un test de compétence avancée (spec §3) pour cet acteur.
   * @param {Item} item Item `advancedSkill` possédé par cet acteur.
   */
  async rollAdvancedSkillTest(item) {
    return rollAdvancedSkillTest(this, item);
  }

  /**
   * Lance un test d'attaque à l'arme (spec §9.3.1) pour cet acteur.
   * @param {Item} item Item `weapon` possédé par cet acteur.
   */
  async rollWeaponAttackTest(item) {
    return rollWeaponAttackTest(this, item);
  }

  /**
   * Lance le jet de dégâts d'une arme (spec §9.3.3) pour cet acteur.
   * @param {Item} item Item `weapon` possédé par cet acteur.
   */
  async rollWeaponDamageTest(item) {
    return rollWeaponDamageTest(this, item);
  }

  /**
   * Lance le jet de Puissance d'un pouvoir psychique (spec §7.2) pour cet acteur.
   * @param {Item} item Item `psychicPower` possédé par cet acteur.
   */
  async rollPsychicPowerTest(item) {
    return rollPsychicPowerTest(this, item);
  }
}
