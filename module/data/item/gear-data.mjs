import { physicalItemSchema } from "../shared-fields.mjs";

/** Objet générique d'inventaire (spec §6.5) : nom (champ natif de l'Item) + champs communs à tout objet physique (poids/description/prix/disponibilité, cf. `shared-fields.mjs`). */
export default class GearData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return physicalItemSchema();
  }
}
