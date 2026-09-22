import { DH } from "../../config.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

/**
 * Fiche de PNJ/créature (spec §12) : profil condensé sur une seule page, sans onglets
 * (contrairement à la fiche d'Acolyte) — réutilise les mêmes blocs (caractéristiques,
 * compétences, armes, armure, objets) et ajoute Traits/Niveau de Menace/Taille.
 */
export default class NpcSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["dark-heresy-v1", "sheet", "actor", "npc"],
    tag: "form",
    position: { width: 760, height: 800 },
    window: { resizable: true },
    form: { submitOnChange: true, closeOnSubmit: false },
    actions: {
      rollCharacteristic: NpcSheet.#rollCharacteristic,
      rollBaseSkill: NpcSheet.#rollBaseSkill,
      rollAdvancedSkill: NpcSheet.#rollAdvancedSkill,
      createAdvancedSkill: NpcSheet.#createAdvancedSkill,
      createTalent: NpcSheet.#createTalent,
      deleteItem: NpcSheet.#deleteItem,
      toggleTalent: NpcSheet.#toggleTalent,
      addTrait: NpcSheet.#addTrait,
      deleteTrait: NpcSheet.#deleteTrait,
      toggleTrait: NpcSheet.#toggleTrait,
      editImage: NpcSheet.#editImage,
      createWeapon: NpcSheet.#createWeapon,
      toggleWeapon: NpcSheet.#toggleWeapon,
      rollWeaponAttack: NpcSheet.#rollWeaponAttack,
      rollWeaponDamage: NpcSheet.#rollWeaponDamage,
      createGear: NpcSheet.#createGear
    }
  };

  // Chemin en dur (pas de `game.system.id`) : ce champ statique est évalué au chargement
  // du module, potentiellement avant que `game.system` ne soit disponible.
  static PARTS = {
    body: { template: "systems/dark-heresy-v1/templates/actor/npc.hbs" }
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

    context.threatCategories = Object.entries(DH.threatCategories).map(([key, label]) => ({
      key,
      label: game.i18n.localize(label),
      selected: key === this.actor.system.threatLevel.category
    }));
    context.threatDegrees = Object.entries(DH.threatDegrees).map(([key, label]) => ({
      key,
      label: game.i18n.localize(label),
      selected: key === this.actor.system.threatLevel.degree
    }));
    context.sizeCategories = Object.entries(DH.sizeCategories).map(([key, label]) => ({
      key,
      label: game.i18n.localize(label),
      selected: key === this.actor.system.size
    }));

    context.traits = this.actor.system.traits.map((trait, index) => ({ ...trait, index }));

    // Ordre explicite : les clés numériques d'un objet JS ("0"/"10"/"20") s'énumèrent avant
    // les clés textuelles ("untrained"), quel que soit l'ordre d'écriture.
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

    const weaponGroupOptions = Object.entries(DH.weaponGroups).map(([key, label]) => ({
      key,
      label: game.i18n.localize(label)
    }));
    const damageTypeOptions = Object.entries(DH.damageTypes).map(([key, label]) => ({
      key,
      label: game.i18n.localize(label)
    }));
    const damageTypesFor = item => damageTypeOptions.map(type => ({ ...type, selected: type.key === item.system.damageType }));

    context.meleeWeapons = this.actor.itemTypes.weapon.map(item => ({
      id: item.id,
      name: item.name,
      damageFormula: item.system.damageFormula,
      damageTypes: damageTypesFor(item),
      penetration: item.system.penetration,
      bonus: item.system.bonus,
      attributes: item.system.attributes
    }));

    context.rangedWeapons = this.actor.itemTypes.rangedWeapon.map(item => ({
      id: item.id,
      name: item.name,
      groups: weaponGroupOptions.map(group => ({ ...group, selected: group.key === item.system.group })),
      damageFormula: item.system.damageFormula,
      damageTypes: damageTypesFor(item),
      penetration: item.system.penetration,
      bonus: item.system.bonus,
      attributes: item.system.attributes,
      range: item.system.range,
      fireModes: item.system.fireModes,
      reload: item.system.reload,
      ammo: item.system.ammo
    }));

    context.gearItems = this.actor.itemTypes.gear.map(item => ({
      id: item.id,
      name: item.name,
      weight: item.system.weight
    }));
    context.carriedWeight = this.actor.system.resources.carriedWeight;
    context.carryCapacity = this.actor.system.resources.carryCapacity;

    context.armourLocations = Object.entries(DH.armourLocations).map(([key, config]) => ({
      key,
      label: game.i18n.localize(config.label),
      rangeLabel: config.rangeLabel,
      value: this.actor.system.armour[key].value
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
    const value = input.type === "checkbox" ? input.checked : input.type === "number" ? Number(input.value) : input.value;
    await item.update({ [field]: value });
  }

  static async #toggleTalent(event, target) {
    target.closest(".talent-entry")?.classList.toggle("collapsed");
  }

  static async #toggleTrait(event, target) {
    target.closest(".trait-entry")?.classList.toggle("collapsed");
  }

  static async #editImage(event, target) {
    const attr = target.dataset.edit;
    const current = foundry.utils.getProperty(this.actor, attr);
    const fp = new FilePicker({
      current,
      type: "image",
      callback: path => this.actor.update({ [attr]: path }),
      top: this.position.top + 40,
      left: this.position.left + 10
    });
    return fp.browse();
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

  static async #createWeapon(event, target) {
    const isMelee = target.dataset.category === "melee";
    await this.actor.createEmbeddedDocuments("Item", [{
      name: game.i18n.localize(isMelee ? "DH.Weapon.NewName" : "DH.Weapon.NewRangedName"),
      type: isMelee ? "weapon" : "rangedWeapon"
    }]);
  }

  static async #toggleWeapon(event, target) {
    target.closest(".weapon-entry")?.classList.toggle("collapsed");
  }

  static async #rollWeaponAttack(event, target) {
    const item = this.actor.items.get(target.closest("[data-item-id]")?.dataset.itemId);
    if (item) await this.actor.rollWeaponAttackTest(item);
  }

  static async #rollWeaponDamage(event, target) {
    const item = this.actor.items.get(target.closest("[data-item-id]")?.dataset.itemId);
    if (item) await this.actor.rollWeaponDamageTest(item);
  }

  static async #createGear() {
    await this.actor.createEmbeddedDocuments("Item", [{
      name: game.i18n.localize("DH.Gear.NewName"),
      type: "gear"
    }]);
  }

  static async #addTrait() {
    const traits = this.actor.system.traits.map(trait => ({ ...trait }));
    traits.push({ name: "", description: "" });
    await this.actor.update({ "system.traits": traits });
  }

  static async #deleteTrait(event, target) {
    const index = Number(target.dataset.index);
    const traits = this.actor.system.traits.filter((_, i) => i !== index).map(trait => ({ ...trait }));
    await this.actor.update({ "system.traits": traits });
  }
}
