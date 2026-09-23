import { DH } from "../../config.mjs";
import { physicalItemSchema } from "../shared-fields.mjs";

const { SchemaField, NumberField, StringField } = foundry.data.fields;

/**
 * Pièce d'armure (spec §6.4) : catégorie + PA par localisation, plus les champs communs à tout
 * objet physique (poids/description/prix/disponibilité, cf. `physicalItemSchema`) — l'armure
 * apparaît donc dans la liste d'inventaire de la fiche comme un `gear`.
 * Les PA de l'acteur restent des champs manuels (`system.armour.<localisation>.value`, décision
 * #12) : l'Item ne les remplace pas, il les **relève** à l'ajout sur la fiche (cf. `_onCreate`).
 */
export default class ArmourData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      category: new StringField({ required: true, initial: "primitive", choices: Object.keys(DH.armourCategories) }),
      locations: new SchemaField(
        Object.fromEntries(Object.keys(DH.armourLocations).map(key => [
          key,
          new NumberField({ required: true, integer: true, min: 0, initial: 0 })
        ]))
      ),
      ...physicalItemSchema()
    };
  }

  /**
   * À l'ajout sur un acteur, relève chaque localisation de l'acteur à la valeur de l'armure si
   * elle lui est inférieure (spec §6.4 : les armures ne se cumulent pas, seule la plus élevée
   * compte). Jamais de baisse, ni à l'ajout ni au retrait : les PA de l'acteur restent éditables
   * à la main, l'Item ne fait que proposer un plancher au moment où il est équipé.
   * Seul le client à l'origine de la création agit, pour ne pas dupliquer la mise à jour.
   */
  _onCreate(data, options, userId) {
    super._onCreate(data, options, userId);
    const actor = this.parent.actor;
    if (!actor?.system.armour || game.user.id !== userId) return;

    const updates = {};
    for (const [key, value] of Object.entries(this.locations)) {
      if (value > (actor.system.armour[key]?.value ?? 0)) updates[`system.armour.${key}.value`] = value;
    }
    if (!foundry.utils.isEmpty(updates)) actor.update(updates);
  }
}
