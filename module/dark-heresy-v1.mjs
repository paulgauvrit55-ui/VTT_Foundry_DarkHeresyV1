import { DH } from "./config.mjs";
import AcolyteData from "./data/actor/acolyte-data.mjs";
import NpcData from "./data/actor/npc-data.mjs";
import TalentData from "./data/item/talent-data.mjs";
import AdvancedSkillData from "./data/item/advanced-skill-data.mjs";
import WeaponData from "./data/item/weapon-data.mjs";
import RangedWeaponData from "./data/item/ranged-weapon-data.mjs";
import GearData from "./data/item/gear-data.mjs";
import ArmourData from "./data/item/armour-data.mjs";
import PsychicPowerData from "./data/item/psychic-power-data.mjs";
import DarkHeresyActor from "./documents/actor.mjs";
import AcolyteSheet from "./sheets/actor/acolyte-sheet.mjs";
import NpcSheet from "./sheets/actor/npc-sheet.mjs";
import TalentSheet from "./sheets/item/talent-sheet.mjs";
import AdvancedSkillSheet from "./sheets/item/advanced-skill-sheet.mjs";
import WeaponSheet from "./sheets/item/weapon-sheet.mjs";
import RangedWeaponSheet from "./sheets/item/ranged-weapon-sheet.mjs";
import GearSheet from "./sheets/item/gear-sheet.mjs";
import ArmourSheet from "./sheets/item/armour-sheet.mjs";
import PsychicPowerSheet from "./sheets/item/psychic-power-sheet.mjs";
import { registerWeaponAttackCard } from "./chat/weapon-attack-card.mjs";
import { registerPsychicPowerCard } from "./chat/psychic-power-card.mjs";
import { seedCompendiums } from "./compendium-seed.mjs";

Hooks.once("init", () => {
  CONFIG.DH = DH;
  game.darkHeresy = { config: DH };

  CONFIG.Actor.documentClass = DarkHeresyActor;
  CONFIG.Actor.dataModels.acolyte = AcolyteData;
  CONFIG.Actor.dataModels.npc = NpcData;
  CONFIG.Item.dataModels.talent = TalentData;
  CONFIG.Item.dataModels.advancedSkill = AdvancedSkillData;
  CONFIG.Item.dataModels.weapon = WeaponData;
  CONFIG.Item.dataModels.rangedWeapon = RangedWeaponData;
  CONFIG.Item.dataModels.gear = GearData;
  CONFIG.Item.dataModels.armour = ArmourData;
  CONFIG.Item.dataModels.psychicPower = PsychicPowerData;
  CONFIG.ActiveEffect.legacyTransferral = false;

  foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Actor, game.system.id, AcolyteSheet, {
    types: ["acolyte"],
    makeDefault: true,
    label: "DH.SheetLabel.Acolyte"
  });

  foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Actor, game.system.id, NpcSheet, {
    types: ["npc"],
    makeDefault: true,
    label: "DH.SheetLabel.Npc"
  });

  foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, game.system.id, TalentSheet, {
    types: ["talent"],
    makeDefault: true,
    label: "DH.SheetLabel.Talent"
  });

  foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, game.system.id, AdvancedSkillSheet, {
    types: ["advancedSkill"],
    makeDefault: true,
    label: "DH.SheetLabel.AdvancedSkill"
  });

  foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, game.system.id, WeaponSheet, {
    types: ["weapon"],
    makeDefault: true,
    label: "DH.SheetLabel.Weapon"
  });

  foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, game.system.id, RangedWeaponSheet, {
    types: ["rangedWeapon"],
    makeDefault: true,
    label: "DH.SheetLabel.RangedWeapon"
  });

  foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, game.system.id, GearSheet, {
    types: ["gear"],
    makeDefault: true,
    label: "DH.SheetLabel.Gear"
  });

  foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, game.system.id, ArmourSheet, {
    types: ["armour"],
    makeDefault: true,
    label: "DH.SheetLabel.Armour"
  });

  foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, game.system.id, PsychicPowerSheet, {
    types: ["psychicPower"],
    makeDefault: true,
    label: "DH.SheetLabel.PsychicPower"
  });

  registerWeaponAttackCard();
  registerPsychicPowerCard();
});

Hooks.once("ready", seedCompendiums);
