import { DH } from "../../config.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

export default class RangedWeaponSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["dark-heresy-v1", "sheet", "item", "ranged-weapon"],
    tag: "form",
    position: { width: 480, height: 760 },
    window: { resizable: true },
    form: { submitOnChange: true, closeOnSubmit: false }
  };

  static PARTS = {
    body: { template: "systems/dark-heresy-v1/templates/item/ranged-weapon.hbs" }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.item = this.item;
    context.system = this.item.system;
    context.weaponGroups = Object.entries(DH.weaponGroups).map(([key, label]) => ({
      key,
      label: game.i18n.localize(label),
      selected: key === this.item.system.group
    }));
    context.damageTypes = Object.entries(DH.damageTypes).map(([key, label]) => ({
      key,
      label: game.i18n.localize(label),
      selected: key === this.item.system.damageType
    }));
    return context;
  }
}
