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

/** Compétence de base (spec §3) : maîtrise (Non acquise/0/+10/+20) + bonus libre éditable. */
function baseSkillField() {
  return new SchemaField({
    mastery: new StringField({ required: true, initial: "untrained", choices: ["untrained", "0", "10", "20"] }),
    bonus: new NumberField({ required: true, integer: true, initial: 0 })
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
      // Champs libres (spec §5) : pas de moteur de carrière, juste affichés dans l'en-tête de fiche.
      homeworld: new StringField({ required: false, blank: true }),
      career: new StringField({ required: false, blank: true }),
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
        monthlyIncome: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        // Port de charge (spec §11.2) : champ manuel, pas de calcul dérivé depuis BF+BE — même
        // logique que Mouvement (Guide_Implementation_FVTT.md §2.5, décision actée §3.8), des
        // talents/équipements pouvant faire varier le seuil réel.
        carryCapacity: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
      }),
      insanityDegree: new StringField({ required: true, initial: "stable", choices: Object.keys(DH.insanityDegrees) }),
      mentalDisorders: new ArrayField(mentalDisorderField()),
      // Armure par localisation (spec §6.4) : champs manuels saisis par le joueur (pas d'Item
      // `armour` avec agrégation automatique) — décision utilisateur du 2026-09-21, cohérente
      // avec le mockup `Exemples/LayoutTab2.png` (aucun bouton d'ajout/suppression dessiné,
      // contrairement aux listes d'armes/objets) et avec le précédent Mouvement/port de charge.
      armour: new SchemaField(
        Object.fromEntries(Object.keys(DH.armourLocations).map(key => [key, new SchemaField({
          value: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
        })]))
      ),
      skills: new SchemaField(
        Object.fromEntries(Object.keys(DH.baseSkills).map(key => [key, baseSkillField()]))
      ),
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

    // Poids porté = somme des poids des objets d'inventaire (spec §6.5) ; les armes en sont
    // exclues (spec §6.1 : champs de la liste d'armes "moins ... le poids").
    const gearItems = this.parent?.itemTypes?.gear ?? [];
    this.resources.carriedWeight = gearItems.reduce((sum, item) => sum + (item.system.weight ?? 0), 0);

    // Valeur finale d'une compétence de base (spec §3) : caractéristique liée (divisée par
    // deux si non acquise) + palier de maîtrise + bonus libre.
    for (const [key, skill] of Object.entries(this.skills)) {
      const characteristic = this.characteristics[DH.baseSkills[key].characteristic];
      const untrained = skill.mastery === "untrained";
      const base = untrained ? Math.floor(characteristic.value / 2) : characteristic.value;
      const masteryBonus = untrained ? 0 : Number(skill.mastery);
      skill.total = base + masteryBonus + skill.bonus;
    }
  }
}
