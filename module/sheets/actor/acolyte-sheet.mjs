import { DH } from "../../config.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

export default class AcolyteSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["dark-heresy-v1", "sheet", "actor", "acolyte"],
    tag: "form",
    position: { width: 640, height: 760 },
    window: { resizable: true },
    form: { submitOnChange: true, closeOnSubmit: false },
    actions: {
      rollCharacteristic: AcolyteSheet.#rollCharacteristic,
      addMentalDisorder: AcolyteSheet.#addMentalDisorder,
      deleteMentalDisorder: AcolyteSheet.#deleteMentalDisorder,
      rollBaseSkill: AcolyteSheet.#rollBaseSkill,
      rollAdvancedSkill: AcolyteSheet.#rollAdvancedSkill,
      createAdvancedSkill: AcolyteSheet.#createAdvancedSkill,
      createTalent: AcolyteSheet.#createTalent,
      deleteItem: AcolyteSheet.#deleteItem
    }
  };

  // Chemin en dur (pas de `game.system.id`) : ce champ statique est évalué au chargement
  // du module, potentiellement avant que `game.system` ne soit disponible.
  static PARTS = {
    body: { template: "systems/dark-heresy-v1/templates/actor/acolyte.hbs" }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.actor = this.actor;
    context.system = this.actor.system;
    context.characteristics = Object.entries(this.actor.system.characteristics).map(([key, characteristic]) => ({
      key,
      value: characteristic.value,
      bonus: characteristic.bonus,
      hasBonus: DH.characteristics[key].hasBonus,
      label: game.i18n.localize(DH.characteristics[key].label),
      abbrev: game.i18n.localize(DH.characteristics[key].abbrev)
    }));
    context.insanityDegrees = Object.entries(DH.insanityDegrees).map(([key, label]) => ({
      key,
      label: game.i18n.localize(label)
    }));
    context.mentalDisorders = this.actor.system.mentalDisorders.map((disorder, index) => ({ ...disorder, index }));

    // Ordre explicite : les clés numériques d'un objet JS ("0"/"10"/"20") s'énumèrent avant
    // les clés textuelles ("untrained"), quel que soit l'ordre d'écriture — Object.entries()
    // placerait donc "Non acquise" en dernier.
    const baseMasteryOrder = ["untrained", "0", "10", "20"];
    context.baseSkills = Object.entries(this.actor.system.skills).map(([key, skill]) => ({
      key,
      label: game.i18n.localize(DH.baseSkills[key].label),
      abbrev: game.i18n.localize(DH.characteristics[DH.baseSkills[key].characteristic].abbrev),
      mastery: skill.mastery,
      bonus: skill.bonus,
      total: skill.total,
      masteryLevels: baseMasteryOrder.map(levelKey => ({
        key: levelKey,
        label: game.i18n.localize(DH.skillMasteryLevels[levelKey]),
        selected: levelKey === skill.mastery
      }))
    }));

    const advancedMasteryLevels = ["0", "10", "20"].map(level => ({ key: level, label: game.i18n.localize(DH.skillMasteryLevels[level]) }));
    context.advancedSkills = this.actor.itemTypes.advancedSkill.map(item => ({
      id: item.id,
      name: item.name,
      bonus: item.system.bonus,
      total: item.system.total,
      characteristics: Object.entries(DH.characteristics).map(([key, config]) => ({
        key,
        label: game.i18n.localize(config.abbrev),
        selected: key === item.system.characteristic
      })),
      masteryLevels: advancedMasteryLevels.map(level => ({ ...level, selected: level.key === item.system.mastery }))
    }));

    context.talents = this.actor.itemTypes.talent.map(item => ({
      id: item.id,
      name: item.name,
      description: item.system.description
    }));

    return context;
  }

  _onRender(context, options) {
    super._onRender(context, options);
    for (const element of this.element.querySelectorAll("[data-item-field]")) {
      element.addEventListener("change", this.#onItemFieldChange.bind(this));
    }
  }

  async #onItemFieldChange(event) {
    const input = event.currentTarget;
    const itemId = input.closest("[data-item-id]")?.dataset.itemId;
    const item = itemId && this.actor.items.get(itemId);
    if (!item) return;

    const field = input.dataset.itemField;
    const value = input.type === "number" ? Number(input.value) : input.value;
    await item.update({ [field]: value });
  }

  static async #rollCharacteristic(event, target) {
    await this.actor.rollCharacteristicTest(target.dataset.characteristic);
  }

  static async #rollBaseSkill(event, target) {
    await this.actor.rollBaseSkillTest(target.dataset.skill);
  }

  static async #rollAdvancedSkill(event, target) {
    const item = this.actor.items.get(target.closest("[data-item-id]")?.dataset.itemId);
    if (item) await this.actor.rollAdvancedSkillTest(item);
  }

  static async #createAdvancedSkill() {
    await this.actor.createEmbeddedDocuments("Item", [{
      name: game.i18n.localize("DH.AdvancedSkill.NewName"),
      type: "advancedSkill"
    }]);
  }

  static async #createTalent() {
    await this.actor.createEmbeddedDocuments("Item", [{
      name: game.i18n.localize("DH.Talent.NewName"),
      type: "talent"
    }]);
  }

  static async #deleteItem(event, target) {
    const itemId = target.closest("[data-item-id]")?.dataset.itemId;
    if (itemId) await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
  }

  static async #addMentalDisorder() {
    const disorders = this.actor.system.mentalDisorders.map(d => ({ name: d.name, description: d.description }));
    disorders.push({ name: "", description: "" });
    await this.actor.update({ "system.mentalDisorders": disorders });
  }

  static async #deleteMentalDisorder(event, target) {
    const index = Number(target.dataset.index);
    const disorders = this.actor.system.mentalDisorders
      .filter((_, i) => i !== index)
      .map(d => ({ name: d.name, description: d.description }));
    await this.actor.update({ "system.mentalDisorders": disorders });
  }
}
