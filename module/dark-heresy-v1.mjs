import { DH } from "./config.mjs";
import AcolyteData from "./data/actor/acolyte-data.mjs";
import TalentData from "./data/item/talent-data.mjs";
import AdvancedSkillData from "./data/item/advanced-skill-data.mjs";
import WeaponData from "./data/item/weapon-data.mjs";
import GearData from "./data/item/gear-data.mjs";
import DarkHeresyActor from "./documents/actor.mjs";
import AcolyteSheet from "./sheets/actor/acolyte-sheet.mjs";
import TalentSheet from "./sheets/item/talent-sheet.mjs";
import AdvancedSkillSheet from "./sheets/item/advanced-skill-sheet.mjs";
import WeaponSheet from "./sheets/item/weapon-sheet.mjs";
import GearSheet from "./sheets/item/gear-sheet.mjs";
import { registerWeaponAttackCard } from "./chat/weapon-attack-card.mjs";

Hooks.once("init", () => {
  CONFIG.DH = DH;
  game.darkHeresy = { config: DH };

  CONFIG.Actor.documentClass = DarkHeresyActor;
  CONFIG.Actor.dataModels.acolyte = AcolyteData;
  CONFIG.Item.dataModels.talent = TalentData;
  CONFIG.Item.dataModels.advancedSkill = AdvancedSkillData;
  CONFIG.Item.dataModels.weapon = WeaponData;
  CONFIG.Item.dataModels.gear = GearData;
  CONFIG.ActiveEffect.legacyTransferral = false;

  foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Actor, game.system.id, AcolyteSheet, {
    types: ["acolyte"],
    makeDefault: true,
    label: "DH.SheetLabel.Acolyte"
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

  foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, game.system.id, GearSheet, {
    types: ["gear"],
    makeDefault: true,
    label: "DH.SheetLabel.Gear"
  });

  registerWeaponAttackCard();
});
