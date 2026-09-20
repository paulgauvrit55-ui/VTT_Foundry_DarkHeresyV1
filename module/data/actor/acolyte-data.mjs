import { DH } from "../../config.mjs";

const { SchemaField, NumberField, HTMLField } = foundry.data.fields;

function characteristicField(initial = 30) {
  return new SchemaField({
    value: new NumberField({ required: true, integer: true, min: 0, initial })
  });
}

export default class AcolyteData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const characteristics = {};
    for (const key of Object.keys(DH.characteristics)) {
      characteristics[key] = characteristicField();
    }

    return {
      characteristics: new SchemaField(characteristics),
      biography: new HTMLField({ required: false, blank: true })
    };
  }

  /** Bonus de caractéristique = chiffre des dizaines (spec §2.2), recalculé à chaque préparation. */
  prepareDerivedData() {
    for (const [key, characteristic] of Object.entries(this.characteristics)) {
      characteristic.bonus = DH.characteristics[key].hasBonus
        ? Math.floor(characteristic.value / 10)
        : null;
    }
  }
}
