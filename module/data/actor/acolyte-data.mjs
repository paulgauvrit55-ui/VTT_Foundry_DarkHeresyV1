import {
  characteristicsSchema,
  resourcePoolField,
  nameDescriptionField,
  baseSkillsSchema,
  armourSchema,
  computeCharacteristicBonuses,
  computeBaseSkillTotals,
  computeCarriedWeight
} from "../shared-fields.mjs";

const { SchemaField, NumberField, StringField, HTMLField, ArrayField } = foundry.data.fields;

/** Achat de progression (spec §5.2) : entrée libre nom + coût en PX consigné par le joueur. */
function progressionEntryField() {
  return new SchemaField({
    name: new StringField({ required: true, blank: true }),
    cost: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
  });
}

export default class AcolyteData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      characteristics: characteristicsSchema(),
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
          // "spent" et "unspent" ne sont pas stockés : "spent" est dérivé de la somme des
          // coûts de `progression` (demande utilisateur du 2026-09-22, remplace la saisie
          // manuelle), et "unspent" de total - spent, à chaque préparation.
          total: new NumberField({ required: true, integer: true, min: 0, initial: 400 })
        }),
        thrones: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        monthlyIncome: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        // Port de charge (spec §11.2) : champ manuel, pas de calcul dérivé depuis BF+BE — même
        // logique que Mouvement (Guide_Implementation_FVTT.md §2.5, décision actée §3.8), des
        // talents/équipements pouvant faire varier le seuil réel.
        carryCapacity: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
      }),
      mentalDisorders: new ArrayField(nameDescriptionField()),
      // Malignités (spec §2.5) : fonctionnellement identique aux troubles mentaux, mais liée
      // aux Points de Corruption plutôt qu'aux Points de Folie — décision utilisateur du
      // 2026-09-22, remplace la liste déroulante "degré de folie" prévue en §2.4 (jugée
      // superflue par l'utilisateur, retirée).
      malignancies: new ArrayField(nameDescriptionField()),
      // Suivi manuel des achats de progression (spec §5.2) : les joueurs gèrent eux-mêmes la
      // progression (§5.1), ce champ ne fait que consigner nom + coût en PX de chaque achat.
      progression: new ArrayField(progressionEntryField()),
      // Armure par localisation (spec §6.4) : champs manuels saisis par le joueur (pas d'Item
      // `armour` avec agrégation automatique) — décision utilisateur du 2026-09-21, cohérente
      // avec le mockup `Exemples/LayoutTab2.png` (aucun bouton d'ajout/suppression dessiné,
      // contrairement aux listes d'armes/objets) et avec le précédent Mouvement/port de charge.
      armour: armourSchema(),
      skills: baseSkillsSchema(),
      biography: new HTMLField({ required: false, blank: true })
    };
  }

  prepareDerivedData() {
    computeCharacteristicBonuses(this.characteristics);

    // Plafond de Fatigue = Bonus d'Endurance (spec §2.3, §9.7) : dérivé, non stocké.
    this.resources.fatigueMax = this.characteristics.endurance.bonus;

    // PX dépensés = somme des coûts de la liste d'achats de progression (spec §5.2) ; PX non
    // dépensés = total - dépensé. Les deux sont dérivés, non stockés.
    this.resources.experience.spent = this.progression.reduce((sum, entry) => sum + (entry.cost ?? 0), 0);
    this.resources.experience.unspent = this.resources.experience.total - this.resources.experience.spent;

    // Poids porté = somme des poids des objets d'inventaire (spec §6.5) ; les armes en sont
    // exclues (spec §6.1 : champs de la liste d'armes "moins ... le poids").
    this.resources.carriedWeight = computeCarriedWeight(this.parent);

    computeBaseSkillTotals(this.skills, this.characteristics);
  }
}
