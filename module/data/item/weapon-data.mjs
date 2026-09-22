import { DH } from "../../config.mjs";

const { StringField, NumberField } = foundry.data.fields;

/**
 * Profil d'arme de corps-à-corps (spec §6.1). Jusqu'au 2026-09-22, un seul type d'Item couvrait
 * corps-à-corps et distance avec un champ `group` comme discriminant ; désormais scindé en deux
 * types d'Item distincts (celui-ci et `rangedWeapon`, cf. `ranged-weapon-data.mjs`) pour que le
 * drag & drop depuis un compendium range directement l'arme dans la bonne liste de la fiche
 * d'acolyte — cf. Guide_Implementation_FVTT.md §3.15. Poids/prix/disponibilité volontairement
 * absents (spec §6.1 : "champs sus-mentionnés moins le prix, poids et la disponibilité").
 * Aucun attribut d'arme n'a d'effet mécanique automatisé, y compris Déchirante : tous restent
 * des tags informatifs dans le champ libre `attributes` (décision révisée du 2026-09-21, qui
 * amende Guide_Implementation_FVTT.md §2.4bis — le double jet de dégâts pour Déchirante était
 * jugé superflu, le joueur peut exprimer un effet similaire directement dans la formule de dés).
 */
export default class WeaponData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      damageFormula: new StringField({ required: true, blank: true, initial: "1d10" }),
      damageType: new StringField({ required: true, initial: "impact", choices: Object.keys(DH.damageTypes) }),
      penetration: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      bonus: new NumberField({ required: true, integer: true, initial: 0 }),
      attributes: new StringField({ required: false, blank: true })
    };
  }

  /** Toujours vrai : le discriminant corps-à-corps/distance est désormais porté par le type d'Item (cf. `RangedWeaponData#isMelee`). */
  get isMelee() {
    return true;
  }
}
