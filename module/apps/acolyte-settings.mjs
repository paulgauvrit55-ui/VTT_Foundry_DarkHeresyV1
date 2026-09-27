import { DH } from "../config.mjs";

const { HandlebarsApplicationMixin, DocumentSheetV2 } = foundry.applications.api;

/**
 * Fenêtre « Paramètres avancés » de l'acolyte, ouverte depuis le bouton en haut à droite de sa
 * fiche : case Psyker (visibilité de l'onglet Pouvoirs psychiques) et valeurs Surnaturel de
 * chaque caractéristique (ajoutées au bonus, cf. `computeCharacteristicBonuses`). Sous-classe de
 * `DocumentSheetV2` pour hériter de la soumission vers `actor.update` et du re-render sur update.
 */
export default class AcolyteSettingsConfig extends HandlebarsApplicationMixin(DocumentSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["dark-heresy-v1", "acolyte-settings"],
    tag: "form",
    position: { width: 360, height: "auto" },
    window: { icon: "fa-solid fa-gear" },
    form: { submitOnChange: true, closeOnSubmit: false }
  };

  static PARTS = {
    body: { template: "systems/dark-heresy-v1/templates/apps/acolyte-settings.hbs" }
  };

  get title() {
    return `${game.i18n.localize("DH.AdvancedSettings.Title")} : ${this.document.name}`;
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const system = this.document.system;
    context.system = system;
    context.unnatural = Object.entries(DH.characteristics).filter(([, config]) => config.hasBonus).map(([key, config]) => ({
      key,
      label: game.i18n.format("DH.AdvancedSettings.Unnatural", { name: game.i18n.localize(config.label) }),
      value: system.unnatural[key]
    }));
    return context;
  }
}
