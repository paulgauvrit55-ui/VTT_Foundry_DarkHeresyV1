import { DH } from "../../config.mjs";

const { SchemaField, StringField, NumberField } = foundry.data.fields;

/**
 * Profil d'arme à distance (spec §6.1) : type d'Item distinct de `weapon` (corps-à-corps) depuis
 * le 2026-09-22, avec les champs propres au tir (portée, modes de tir, rechargement, munitions)
 * — cf. `weapon-data.mjs` pour le contexte de la scission. Poids/prix/disponibilité
 * volontairement absents (spec §6.1). Aucun attribut d'arme n'a d'effet mécanique automatisé
 * (décision révisée du 2026-09-21, cf. `weapon-data.mjs`).
 */
export default class RangedWeaponData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      group: new StringField({ required: true, initial: "base", choices: Object.keys(DH.weaponGroups) }),
      damageFormula: new StringField({ required: true, blank: true, initial: "1d10" }),
      damageType: new StringField({ required: true, initial: "impact", choices: Object.keys(DH.damageTypes) }),
      penetration: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      bonus: new NumberField({ required: true, integer: true, initial: 0 }),
      attributes: new StringField({ required: false, blank: true }),
      range: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      fireModes: new StringField({ required: false, blank: true }),
      reload: new StringField({ required: false, blank: true }),
      ammo: new SchemaField({
        current: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        max: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
      })
    };
  }

  /** Toujours faux : le discriminant corps-à-corps/distance est désormais porté par le type d'Item (cf. `WeaponData#isMelee`). */
  get isMelee() {
    return false;
  }
}
