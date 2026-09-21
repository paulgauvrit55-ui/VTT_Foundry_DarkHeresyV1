import { DH } from "../../config.mjs";

const { SchemaField, StringField, NumberField } = foundry.data.fields;

/**
 * Profil d'arme (spec §6.1) : un seul type d'Item pour corps-à-corps et distance — le champ
 * `group` sert de discriminant (seul "corpsACorps" désigne une arme de mêlée), cf.
 * Guide_Implementation_FVTT.md §2.3. Poids/prix/disponibilité volontairement absents (spec
 * §6.1 : "champs sus-mentionnés moins le prix, poids et la disponibilité").
 * Aucun attribut d'arme n'a d'effet mécanique automatisé, y compris Déchirante : tous restent
 * des tags informatifs dans le champ libre `attributes` (décision révisée du 2026-09-21, qui
 * amende Guide_Implementation_FVTT.md §2.4bis — le double jet de dégâts pour Déchirante était
 * jugé superflu, le joueur peut exprimer un effet similaire directement dans la formule de dés).
 */
export default class WeaponData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      group: new StringField({ required: true, initial: "corpsACorps", choices: Object.keys(DH.weaponGroups) }),
      damageFormula: new StringField({ required: true, blank: true, initial: "1d10" }),
      damageType: new StringField({ required: true, initial: "impact", choices: Object.keys(DH.damageTypes) }),
      penetration: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      bonus: new NumberField({ required: true, integer: true, initial: 0 }),
      attributes: new StringField({ required: false, blank: true }),
      // Champs pertinents uniquement pour les armes à distance (masqués sur la fiche pour les
      // armes de mêlée), mais conservés dans le schéma pour toutes les armes par simplicité.
      range: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      fireModes: new StringField({ required: false, blank: true }),
      reload: new StringField({ required: false, blank: true }),
      ammo: new SchemaField({
        current: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        max: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
      })
    };
  }

  get isMelee() {
    return this.group === "corpsACorps";
  }
}
