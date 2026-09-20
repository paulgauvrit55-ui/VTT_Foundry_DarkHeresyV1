import { rollCharacteristicTest } from "../dice/characteristic-roll.mjs";

export default class DarkHeresyActor extends Actor {
  /**
   * Lance un test de caractéristique (spec §8.1) pour cet acteur.
   * @param {string} characteristicKey Clé de `DH.characteristics` (ex. "force").
   */
  async rollCharacteristicTest(characteristicKey) {
    return rollCharacteristicTest(this, characteristicKey);
  }
}
