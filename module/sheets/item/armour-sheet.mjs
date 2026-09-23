import { DH } from "../../config.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

export default class ArmourSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["dark-heresy-v1", "sheet", "item", "armour"],
    tag: "form",
    position: { width: 480, height: 720 },
    window: { resizable: true },
    form: { submitOnChange: true, closeOnSubmit: false }
  };

  static PARTS = {
    body: { template: "systems/dark-heresy-v1/templates/item/armour.hbs" }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.item = this.item;
    context.system = this.item.system;
    context.categories = Object.entries(DH.armourCategories).map(([key, label]) => ({
      key,
      label: game.i18n.localize(label),
      selected: key === this.item.system.category
    }));
    context.locations = Object.entries(DH.armourLocations).map(([key, config]) => ({
      key,
      label: game.i18n.localize(config.label),
      value: this.item.system.locations[key]
    }));
    return context;
  }
}
