import { DH } from "../../config.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

export default class AdvancedSkillSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["dark-heresy-v1", "sheet", "item", "advanced-skill"],
    tag: "form",
    position: { width: 480, height: 400 },
    window: { resizable: true },
    form: { submitOnChange: true, closeOnSubmit: false }
  };

  static PARTS = {
    body: { template: "systems/dark-heresy-v1/templates/item/advanced-skill.hbs" }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.item = this.item;
    context.system = this.item.system;
    context.characteristics = Object.entries(DH.characteristics).map(([key, config]) => ({
      key,
      label: game.i18n.localize(config.label)
    }));
    context.masteryLevels = [0, 10, 20].map(level => ({
      key: String(level),
      label: game.i18n.localize(DH.skillMasteryLevels[level])
    }));
    return context;
  }
}
