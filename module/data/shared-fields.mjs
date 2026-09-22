import { DH } from "../config.mjs";

const { SchemaField, NumberField, StringField } = foundry.data.fields;

/**
 * Champs de schéma communs aux Data Models `acolyte` et `npc` (spec §12 : le profil de PNJ
 * "réutilise intégralement" la structure du PJ) — factorisés ici pour éviter la duplication
 * entre les deux Data Models d'Actor.
 */

function characteristicField(initial = 30) {
  return new SchemaField({
    value: new NumberField({ required: true, integer: true, min: 0, initial })
  });
}

/** Les 9 caractéristiques (spec §2.1). */
export function characteristicsSchema() {
  const characteristics = {};
  for (const key of Object.keys(DH.characteristics)) {
    characteristics[key] = characteristicField();
  }
  return new SchemaField(characteristics);
}

/** Ressource avec valeur courante et maximum, tous deux saisis à la main (spec §2.3). */
export function resourcePoolField() {
  return new SchemaField({
    value: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
    max: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
  });
}

/** Entrée nom + description (spec §2.4) : forme commune aux troubles mentaux, malignités et traits. */
export function nameDescriptionField() {
  return new SchemaField({
    name: new StringField({ required: true, blank: true }),
    description: new StringField({ required: true, blank: true })
  });
}

/** Compétence de base (spec §3) : maîtrise (Non acquise/0/+10/+20) + bonus libre éditable. */
export function baseSkillField() {
  return new SchemaField({
    mastery: new StringField({ required: true, initial: "untrained", choices: ["untrained", "0", "10", "20"] }),
    bonus: new NumberField({ required: true, integer: true, initial: 0 })
  });
}

/** Les 20 compétences de base (spec §3), champs fixes. */
export function baseSkillsSchema() {
  return new SchemaField(
    Object.fromEntries(Object.keys(DH.baseSkills).map(key => [key, baseSkillField()]))
  );
}

/** Armure par localisation (spec §6.4) : champs manuels de PA, pas d'Item dédié (décision #12). */
export function armourSchema() {
  return new SchemaField(
    Object.fromEntries(Object.keys(DH.armourLocations).map(key => [key, new SchemaField({
      value: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
    })]))
  );
}

/** Bonus de caractéristique = chiffre des dizaines (spec §2.2), recalculé à chaque préparation. Mute `characteristics` en place. */
export function computeCharacteristicBonuses(characteristics) {
  for (const [key, characteristic] of Object.entries(characteristics)) {
    characteristic.bonus = DH.characteristics[key].hasBonus
      ? Math.floor(characteristic.value / 10)
      : null;
  }
}

/**
 * Valeur finale d'une compétence de base (spec §3) : caractéristique liée (divisée par deux si
 * non acquise) + palier de maîtrise + bonus libre. Mute `skills` en place.
 */
export function computeBaseSkillTotals(skills, characteristics) {
  for (const [key, skill] of Object.entries(skills)) {
    const characteristic = characteristics[DH.baseSkills[key].characteristic];
    const untrained = skill.mastery === "untrained";
    const base = untrained ? Math.floor(characteristic.value / 2) : characteristic.value;
    const masteryBonus = untrained ? 0 : Number(skill.mastery);
    skill.total = base + masteryBonus + skill.bonus;
  }
}

/** Poids porté = somme des poids des objets `gear` possédés (armes exclues, spec §6.1/§6.5). */
export function computeCarriedWeight(actor) {
  const gearItems = actor?.itemTypes?.gear ?? [];
  return gearItems.reduce((sum, item) => sum + (item.system.weight ?? 0), 0);
}
