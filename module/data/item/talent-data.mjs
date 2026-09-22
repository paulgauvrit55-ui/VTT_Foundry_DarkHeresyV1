const { StringField, HTMLField } = foundry.data.fields;

/**
 * Talent (spec §4) : nom (champ natif de l'Item) + description libre, sans logique automatisée.
 * Prérequis (texte libre, ex. "Force Mentale 30+, talent Résistant à la douleur") : indicatif
 * uniquement, jamais vérifié automatiquement — décision utilisateur du 2026-09-22, affiché
 * uniquement sur la fiche de l'Item, jamais sur la fiche Actor (même logique que prix/
 * disponibilité des objets physiques, cf. `shared-fields.mjs#physicalItemSchema`).
 */
export default class TalentData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      prerequisites: new StringField({ required: false, blank: true }),
      description: new HTMLField({ required: false, blank: true })
    };
  }
}
