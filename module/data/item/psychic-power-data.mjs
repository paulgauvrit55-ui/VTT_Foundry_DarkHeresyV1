const { StringField, NumberField, BooleanField, HTMLField } = foundry.data.fields;

/**
 * Pouvoir psychique (spec §7.1) : profil affiché et éditable sur l'onglet "Pouvoirs psychiques"
 * de la fiche d'acolyte, à la manière des armes. Seul le Seuil Psychique a un effet mécanique
 * (cible du jet de Puissance, §7.2) ; temps de focalisation, portée et surpuissance restent du
 * texte libre informatif, les formulations des livres étant trop variées pour une liste fermée
 * ("demi-action", "10 m × Niveau Psy", etc.).
 */
export default class PsychicPowerData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      discipline: new StringField({ required: false, blank: true }),
      threshold: new NumberField({ required: true, integer: true, min: 0, initial: 10 }),
      focusTime: new StringField({ required: false, blank: true }),
      sustainable: new BooleanField({ required: true, initial: false }),
      range: new StringField({ required: false, blank: true }),
      overbleed: new StringField({ required: false, blank: true }),
      description: new HTMLField({ required: false, blank: true })
    };
  }
}
