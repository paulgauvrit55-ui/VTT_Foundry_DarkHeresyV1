const { NumberField, HTMLField } = foundry.data.fields;

/** Objet générique d'inventaire (spec §6.5) : nom (champ natif de l'Item), description, poids. */
export default class GearData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      weight: new NumberField({ required: true, min: 0, initial: 0 }),
      description: new HTMLField({ required: false, blank: true })
    };
  }
}
