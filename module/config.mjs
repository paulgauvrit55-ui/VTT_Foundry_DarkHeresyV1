export const DH = {};

/**
 * Les neuf caractéristiques (spec §2.1). `hasBonus` marque les sept
 * caractéristiques dont la dizaine constitue un bonus utilisable (§2.2) —
 * Capacité de Combat et Capacité de Tir en sont exclues.
 */
DH.characteristics = {
  cc: { label: "DH.Characteristic.CC", abbrev: "DH.CharacteristicAbbrev.CC", hasBonus: false },
  ct: { label: "DH.Characteristic.CT", abbrev: "DH.CharacteristicAbbrev.CT", hasBonus: false },
  force: { label: "DH.Characteristic.Force", abbrev: "DH.CharacteristicAbbrev.Force", hasBonus: true },
  endurance: { label: "DH.Characteristic.Endurance", abbrev: "DH.CharacteristicAbbrev.Endurance", hasBonus: true },
  agilite: { label: "DH.Characteristic.Agilite", abbrev: "DH.CharacteristicAbbrev.Agilite", hasBonus: true },
  intelligence: { label: "DH.Characteristic.Intelligence", abbrev: "DH.CharacteristicAbbrev.Intelligence", hasBonus: true },
  perception: { label: "DH.Characteristic.Perception", abbrev: "DH.CharacteristicAbbrev.Perception", hasBonus: true },
  forceMentale: { label: "DH.Characteristic.ForceMentale", abbrev: "DH.CharacteristicAbbrev.ForceMentale", hasBonus: true },
  sociabilite: { label: "DH.Characteristic.Sociabilite", abbrev: "DH.CharacteristicAbbrev.Sociabilite", hasBonus: true }
};

/**
 * Échelle du degré de folie (spec §2.4) — sélection manuelle par le joueur,
 * les paliers de PF exacts n'étant pas chiffrés dans la spec.
 */
DH.insanityDegrees = {
  stable: "DH.InsanityDegree.Stable",
  instable: "DH.InsanityDegree.Instable",
  perturbe: "DH.InsanityDegree.Perturbe",
  desequilibre: "DH.InsanityDegree.Desequilibre",
  derange: "DH.InsanityDegree.Derange",
  terminal: "DH.InsanityDegree.Terminal"
};

/**
 * Compétences de base (spec §3) : liste fixe, chacune rattachée à une
 * caractéristique (clé de `DH.characteristics`). Champs fixes du Data Model
 * `acolyte` (§skills.<clé>), pas des Items — cf. Guide_Implementation_FVTT.md §2.3.
 */
DH.baseSkills = {
  charisme: { label: "DH.Skill.Charisme", characteristic: "sociabilite" },
  commandement: { label: "DH.Skill.Commandement", characteristic: "sociabilite" },
  contorsionnisme: { label: "DH.Skill.Contorsionnisme", characteristic: "agilite" },
  deguisement: { label: "DH.Skill.Deguisement", characteristic: "sociabilite" },
  deplacementSilencieux: { label: "DH.Skill.DeplacementSilencieux", characteristic: "agilite" },
  dissimulation: { label: "DH.Skill.Dissimulation", characteristic: "agilite" },
  duperie: { label: "DH.Skill.Duperie", characteristic: "sociabilite" },
  enquete: { label: "DH.Skill.Enquete", characteristic: "sociabilite" },
  escalade: { label: "DH.Skill.Escalade", characteristic: "force" },
  esquive: { label: "DH.Skill.Esquive", characteristic: "agilite" },
  evaluation: { label: "DH.Skill.Evaluation", characteristic: "intelligence" },
  fouille: { label: "DH.Skill.Fouille", characteristic: "perception" },
  intimidation: { label: "DH.Skill.Intimidation", characteristic: "force" },
  jeu: { label: "DH.Skill.Jeu", characteristic: "intelligence" },
  logique: { label: "DH.Skill.Logique", characteristic: "intelligence" },
  marchandage: { label: "DH.Skill.Marchandage", characteristic: "sociabilite" },
  natation: { label: "DH.Skill.Natation", characteristic: "force" },
  psychologie: { label: "DH.Skill.Psychologie", characteristic: "perception" },
  resistanceIntoxications: { label: "DH.Skill.ResistanceIntoxications", characteristic: "endurance" },
  vigilance: { label: "DH.Skill.Vigilance", characteristic: "perception" }
};

/**
 * Paliers de maîtrise d'une compétence (spec §3) : chaque acquisition
 * redondante (jusqu'à 3 fois) confère +10, plafonné à +20. Les compétences
 * de base ajoutent la valeur spéciale "untrained" (utilisable à char./2).
 */
DH.skillMasteryLevels = {
  untrained: "DH.SkillMastery.Untrained",
  0: "DH.SkillMastery.Level0",
  10: "DH.SkillMastery.Level10",
  20: "DH.SkillMastery.Level20"
};
