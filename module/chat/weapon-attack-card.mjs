/**
 * Bouton "Lancer les dégâts" d'une carte de chat d'attaque à l'arme (spec §2.4ter). Les cartes
 * de chat ne bénéficient pas du système d'actions déclaratives d'ApplicationV2 (réservé aux
 * Application), d'où un listener manuel sur le hook `renderChatMessageHTML` (nom confirmé v13).
 */
export function registerWeaponAttackCard() {
  Hooks.on("renderChatMessageHTML", (message, html) => {
    const root = html instanceof HTMLElement ? html : html?.[0];
    const button = root?.querySelector(".weapon-damage-roll");
    if (!button) return;

    button.addEventListener("click", async () => {
      const actor = game.actors.get(button.dataset.actorId);
      const item = actor?.items.get(button.dataset.itemId);
      if (item) await actor.rollWeaponDamageTest(item);
    });
  });
}
