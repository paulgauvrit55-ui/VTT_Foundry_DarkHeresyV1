import { DH } from "../../config.mjs";

const { StringField, NumberField, HTMLField } = foundry.data.fields;

/**
 * Compétence avancée (spec §3) : Item réutilisable (compendium, drag & drop) couvrant
 * aussi les compétences groupées (le joueur crée un item par sous-spécialité, ex.
 * « Langue (Bas Gothique) ») — cf. Guide_Implementation_FVTT.md §2.3.
 */
export default class AdvancedSkillData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      characteristic: new StringField({ required: true, initial: "intelligence", choices: Object.keys(DH.characteristics) }),
      mastery: new StringField({ required: true, initial: "0", choices: ["0", "10", "20"] }),
      bonus: new NumberField({ required: true, integer: true, initial: 0 }),
      description: new HTMLField({ required: false, blank: true })
    };
  }

  /** Valeur finale (spec §3) : caractéristique liée (toujours acquise) + palier de maîtrise + bonus libre. */
  prepareDerivedData() {
    const characteristicValue = this.parent?.actor?.system?.characteristics?.[this.characteristic]?.value ?? 0;
    this.total = characteristicValue + Number(this.mastery) + this.bonus;
  }
}
