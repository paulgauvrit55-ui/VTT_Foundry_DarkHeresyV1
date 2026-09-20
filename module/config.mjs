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
