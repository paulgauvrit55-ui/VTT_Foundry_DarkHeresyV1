const { HTMLField } = foundry.data.fields;

/** Talent (spec §4) : nom (champ natif de l'Item) + description libre, sans logique automatisée. */
export default class TalentData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      description: new HTMLField({ required: false, blank: true })
    };
  }
}
