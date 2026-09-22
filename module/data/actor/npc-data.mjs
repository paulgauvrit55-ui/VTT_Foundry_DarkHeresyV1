import { DH } from "../../config.mjs";
import {
  characteristicsSchema,
  resourcePoolField,
  nameDescriptionField,
  baseSkillsSchema,
  armourSchema,
  computeCharacteristicBonuses,
  computeBaseSkillTotals,
  computeCarriedWeight
} from "../shared-fields.mjs";

const { SchemaField, NumberField, StringField, HTMLField, ArrayField } = foundry.data.fields;

/**
 * Profil condensé de PNJ/créature (spec §12) : réutilise intégralement la structure du PJ
 * (caractéristiques, compétences de base, armure, armes/objets en Items partagés) et n'ajoute
 * que ce que le format condensé introduit par rapport à `AcolyteData` — Traits, Niveau de
 * Menace, modificateur de taille, et un Mouvement en quatre vitesses au lieu d'un champ unique.
 * Ressources propres au PJ (Destin, Folie, Corruption, PX, Trônes...) volontairement absentes :
 * la table de la spec ne les mentionne pas pour ce profil.
 */
export default class NpcData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      characteristics: characteristicsSchema(),
      resources: new SchemaField({
        wounds: resourcePoolField(),
        // Déplacement (spec §11.1, §12) : le profil condensé de PNJ affiche les quatre vitesses
        // (demi-déplacement/déplacement complet/charge/course) telles quelles, à la différence
        // du PJ qui n'affiche qu'un Mouvement unique en en-tête — champs manuels dans les deux
        // cas, aucune formule dérivée du Bonus d'Agilité (même logique que la décision #8).
        speed: new SchemaField({
          half: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
          full: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
          charge: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
          run: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
        }),
        carryCapacity: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
      }),
      skills: baseSkillsSchema(),
      armour: armourSchema(),
      // Traits (spec §12) : capacités innées propres aux créatures (non accessibles aux PJ),
      // ex. Armes naturelles, Régénération, Instabilité warp — liste libre nom + description,
      // non automatisée (chaque trait modifie une règle précise que le MJ applique lui-même),
      // structurellement identique aux troubles mentaux/malignités du PJ.
      traits: new ArrayField(nameDescriptionField()),
      // Niveau de Menace (spec §12) : catégorie (nature) + degré (ampleur), simple repère
      // d'échelle pour le MJ sans effet mécanique direct sur les jets.
      threatLevel: new SchemaField({
        category: new StringField({ required: true, blank: true, initial: "", choices: ["", ...Object.keys(DH.threatCategories)] }),
        degree: new StringField({ required: true, blank: true, initial: "", choices: ["", ...Object.keys(DH.threatDegrees)] })
      }),
      // Modificateur de taille (spec §12, Table 12-2) : champ informatif, pas de moteur qui
      // l'appliquerait automatiquement aux tests d'attaque/Esquive/mouvement (cohérent avec les
      // autres tables non automatisées du projet) — le MJ applique l'ajustement lui-même.
      size: new StringField({ required: true, initial: "normale", choices: Object.keys(DH.sizeCategories) }),
      biography: new HTMLField({ required: false, blank: true })
    };
  }

  prepareDerivedData() {
    computeCharacteristicBonuses(this.characteristics);
    computeBaseSkillTotals(this.skills, this.characteristics);
    this.resources.carriedWeight = computeCarriedWeight(this.parent);
  }
}
