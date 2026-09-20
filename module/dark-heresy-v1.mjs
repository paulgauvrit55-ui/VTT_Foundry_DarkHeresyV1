import { DH } from "./config.mjs";
import AcolyteData from "./data/actor/acolyte-data.mjs";
import DarkHeresyActor from "./documents/actor.mjs";
import AcolyteSheet from "./sheets/actor/acolyte-sheet.mjs";

Hooks.once("init", () => {
  CONFIG.DH = DH;
  game.darkHeresy = { config: DH };

  CONFIG.Actor.documentClass = DarkHeresyActor;
  CONFIG.Actor.dataModels.acolyte = AcolyteData;
  CONFIG.ActiveEffect.legacyTransferral = false;

  foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Actor, game.system.id, AcolyteSheet, {
    types: ["acolyte"],
    makeDefault: true,
    label: "DH.SheetLabel.Acolyte"
  });
});
