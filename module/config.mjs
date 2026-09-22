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

/**
 * Groupes d'armes à distance (spec §6.1) : déterminent le talent de formation requis et si le
 * Bonus de Force s'ajoute aux dégâts. Corps à corps n'y figure plus (retiré le 2026-09-22) :
 * le discriminant corps-à-corps/distance est désormais porté par le type d'Item lui-même
 * (`weapon` vs `rangedWeapon`) plutôt que par ce champ — cf. Guide_Implementation_FVTT.md §3.15.
 */
DH.weaponGroups = {
  jet: "DH.WeaponGroup.Jet",
  base: "DH.WeaponGroup.Base",
  poing: "DH.WeaponGroup.Poing",
  lourde: "DH.WeaponGroup.Lourde"
};

/** Types de dégâts (spec §6.1) : déterminent la table de dégâts critiques applicable (consultée manuellement, §2.4ter). */
DH.damageTypes = {
  energie: "DH.DamageType.Energie",
  explosif: "DH.DamageType.Explosif",
  impact: "DH.DamageType.Impact",
  penetrant: "DH.DamageType.Penetrant"
};

/**
 * Localisations de la table de touche (spec §9.3.2, reprise pour l'armure §6.4) : bornes du
 * d100 inversé utilisées à la fois pour l'affichage des plages sur les boîtes d'armure et pour
 * le calcul de la localisation touchée après un test d'attaque réussi.
 */
DH.armourLocations = {
  tete: { label: "DH.ArmourLocation.Tete", rangeLabel: "01-10", min: 1, max: 10 },
  brasDroit: { label: "DH.ArmourLocation.BrasDroit", rangeLabel: "11-20", min: 11, max: 20 },
  brasGauche: { label: "DH.ArmourLocation.BrasGauche", rangeLabel: "21-30", min: 21, max: 30 },
  corps: { label: "DH.ArmourLocation.Corps", rangeLabel: "31-70", min: 31, max: 70 },
  jambeDroite: { label: "DH.ArmourLocation.JambeDroite", rangeLabel: "71-85", min: 71, max: 85 },
  jambeGauche: { label: "DH.ArmourLocation.JambeGauche", rangeLabel: "86-100", min: 86, max: 100 }
};

/**
 * Niveau de Menace des PNJ/créatures (spec §12) : catégorie qualifiant la nature de la menace.
 * Simple repère d'échelle pour le MJ, sans effet mécanique direct sur les jets.
 */
DH.threatCategories = {
  hereticus: "DH.ThreatCategory.Hereticus",
  malleus: "DH.ThreatCategory.Malleus",
  obscuro: "DH.ThreatCategory.Obscuro",
  xenos: "DH.ThreatCategory.Xenos"
};

/** Niveau de Menace des PNJ/créatures (spec §12) : degré qualifiant l'ampleur de la menace. */
DH.threatDegrees = {
  minima: "DH.ThreatDegree.Minima",
  minoris: "DH.ThreatDegree.Minoris",
  majoris: "DH.ThreatDegree.Majoris",
  extremis: "DH.ThreatDegree.Extremis",
  terminus: "DH.ThreatDegree.Terminus"
};

/**
 * Modificateur de taille des PNJ/créatures (spec §12, Table 12-2) : échelle informative
 * affichée sur le profil, sans moteur automatisé qui l'appliquerait aux tests d'attaque/
 * Esquive/Bonus d'Agilité — cohérent avec les autres tables non automatisées du projet
 * (Guide_Implementation_FVTT.md, décisions #4-#6), le MJ applique l'ajustement lui-même.
 */
DH.sizeCategories = {
  tresPetite: "DH.Size.TresPetite",
  petite: "DH.Size.Petite",
  normale: "DH.Size.Normale",
  grande: "DH.Size.Grande",
  enorme: "DH.Size.Enorme",
  massive: "DH.Size.Massive",
  titanesque: "DH.Size.Titanesque"
};

/**
 * Calcule la localisation touchée (spec §9.3.2) en inversant les deux chiffres du résultat du
 * d100 (ex. 37 → 73) et en le comparant aux bornes de `DH.armourLocations`. Un résultat de 100
 * (chiffres "00") s'inverse en lui-même.
 * @param {number} result Résultat du d100 (1-100).
 * @returns {string} Clé de `DH.armourLocations`.
 */
DH.getHitLocation = function (result) {
  const digits = String(result).padStart(2, "0").slice(-2).split("").reverse().join("");
  const inverted = Number(digits) || 100;
  return Object.entries(DH.armourLocations).find(([, loc]) => inverted >= loc.min && inverted <= loc.max)?.[0];
};
