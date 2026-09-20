import { DH } from "../../config.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

export default class AcolyteSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["dark-heresy-v1", "sheet", "actor", "acolyte"],
    tag: "form",
    position: { width: 640, height: 520 },
    window: { resizable: true },
    form: { submitOnChange: true, closeOnSubmit: false },
    actions: {
      rollCharacteristic: AcolyteSheet.#rollCharacteristic
    }
  };

  // Chemin en dur (pas de `game.system.id`) : ce champ statique est évalué au chargement
  // du module, potentiellement avant que `game.system` ne soit disponible.
  static PARTS = {
    body: { template: "systems/dark-heresy-v1/templates/actor/acolyte.hbs" }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.system = this.actor.system;
    context.characteristics = Object.entries(this.actor.system.characteristics).map(([key, characteristic]) => ({
      key,
      value: characteristic.value,
      bonus: characteristic.bonus,
      hasBonus: DH.characteristics[key].hasBonus,
      label: game.i18n.localize(DH.characteristics[key].label),
      abbrev: game.i18n.localize(DH.characteristics[key].abbrev)
    }));
    return context;
  }

  static async #rollCharacteristic(event, target) {
    await this.actor.rollCharacteristicTest(target.dataset.characteristic);
  }
}
