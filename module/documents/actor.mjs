import { rollCharacteristicTest, rollInfluenceTest } from "../dice/characteristic-roll.mjs";
import { rollBaseSkillTest, rollAdvancedSkillTest } from "../dice/skill-roll.mjs";
import { rollWeaponAttackTest, rollWeaponDamageTest, rollRighteousFury } from "../dice/weapon-roll.mjs";
import { rollPsychicPowerTest } from "../dice/psychic-roll.mjs";

export default class DarkHeresyActor extends Actor {
  /** Ajoute aux données de jet les variables de la formule d'initiative (`CONFIG.Combat.initiative`). */
  getRollData() {
    const data = { ...super.getRollData() };
    data.initiativeDie = this.system.initiativeDie?.trim() || "1d10";
    data.agilityBonus = this.system.characteristics?.agilite?.bonus ?? 0;
    return data;
  }

  /**
   * Bouton « Lancer l'initiative » : si un combat est actif, passe par l'API de combat de
   * Foundry (ajout du jeton au combat si besoin, relance autorisée) pour placer l'acteur dans
   * l'ordre de tour ; sinon (pas de combat, ou aucun jeton de l'acteur sur la scène), simple jet
   * dans le chat avec la même formule.
   */
  async rollInitiativeTest() {
    try {
      const combat = game.combat;
      if (combat) {
        await this.rollInitiative({ createCombatants: true, rerollInitiative: true });
        if (combat.getCombatantsByActor(this).length) return;
      }
      const roll = await new Roll(CONFIG.Combat.initiative.formula, this.getRollData()).evaluate();
      await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: game.i18n.localize("DH.Initiative.Flavor")
      });
    } catch (error) {
      console.error(error);
      ui.notifications.error(game.i18n.localize("DH.Initiative.Error"));
    }
  }

  /**
   * Lance un test de caractéristique (spec §8.1) pour cet acteur.
   * @param {string} characteristicKey Clé de `DH.characteristics` (ex. "force").
   */
  async rollCharacteristicTest(characteristicKey) {
    return rollCharacteristicTest(this, characteristicKey);
  }

  /** Lance un test d'Influence (règle alternative) pour cet acteur. */
  async rollInfluenceTest() {
    return rollInfluenceTest(this);
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
   * Fureur du juste (10 naturel aux dégâts) : test de la caractéristique de l'arme puis d10 explosifs ajoutés.
   * @param {Item} item Arme ayant infligé les dégâts.
   * @param {number} baseTotal Total de dégâts à compléter.
   */
  async rollRighteousFury(item, baseTotal) {
    return rollRighteousFury(this, item, baseTotal);
  }

  /**
   * Lance le jet de Puissance d'un pouvoir psychique (spec §7.2) pour cet acteur.
   * @param {Item} item Item `psychicPower` possédé par cet acteur.
   */
  async rollPsychicPowerTest(item) {
    return rollPsychicPowerTest(this, item);
  }
}
