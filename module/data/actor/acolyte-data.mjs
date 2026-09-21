import { DH } from "../../config.mjs";

const { SchemaField, NumberField, StringField, HTMLField, ArrayField } = foundry.data.fields;

function characteristicField(initial = 30) {
  return new SchemaField({
    value: new NumberField({ required: true, integer: true, min: 0, initial })
  });
}

/** Ressource avec valeur courante et maximum, tous deux saisis à la main (spec §2.3). */
function resourcePoolField() {
  return new SchemaField({
    value: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
    max: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
  });
}

function mentalDisorderField() {
  return new SchemaField({
    name: new StringField({ required: true, blank: true }),
    description: new StringField({ required: true, blank: true })
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
      resources: new SchemaField({
        wounds: resourcePoolField(),
        fate: resourcePoolField(),
        movement: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        fatigue: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        insanity: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        corruption: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        experience: new SchemaField({
          spent: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
          total: new NumberField({ required: true, integer: true, min: 0, initial: 400 })
        }),
        thrones: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        monthlyIncome: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
      }),
      insanityDegree: new StringField({ required: true, initial: "stable", choices: Object.keys(DH.insanityDegrees) }),
      mentalDisorders: new ArrayField(mentalDisorderField()),
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

    // Plafond de Fatigue = Bonus d'Endurance (spec §2.3, §9.7) : dérivé, non stocké.
    this.resources.fatigueMax = this.characteristics.endurance.bonus;
  }
}
