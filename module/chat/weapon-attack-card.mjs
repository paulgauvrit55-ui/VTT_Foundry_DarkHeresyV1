/**
 * Bouton "Lancer les dégâts" d'une carte de chat d'attaque à l'arme (spec §2.4ter). Les cartes
 * de chat ne bénéficient pas du système d'actions déclaratives d'ApplicationV2 (réservé aux
 * Application), d'où un listener manuel sur le hook `renderChatMessageHTML` (nom confirmé v13).
 */
export function registerWeaponAttackCard() {
  Hooks.on("renderChatMessageHTML", (message, html) => {
    const root = html instanceof HTMLElement ? html : html?.[0];
    const button = root?.querySelector(".weapon-damage-roll");
    if (button) {
      button.addEventListener("click", async () => {
        const actor = game.actors.get(button.dataset.actorId);
        const item = actor?.items.get(button.dataset.itemId);
        if (item) await actor.rollWeaponDamageTest(item);
      });
    }

    const furyButton = root?.querySelector(".righteous-fury-roll");
    if (furyButton) bindRighteousFuryButton(message, furyButton);
  });
}

/**
 * Bouton "Fureur du juste" d'une carte de dégâts (10 naturel sur un d10). Une seule tentative par
 * jet de dégâts : une fois le test lancé, le drapeau `furyUsed` est posé sur le message (par son
 * auteur ou un MJ, seuls autorisés à le modifier) et le bouton reste désactivé aux rendus suivants.
 */
function bindRighteousFuryButton(message, button) {
  if (message.getFlag(game.system.id, "furyUsed")) {
    button.disabled = true;
    return;
  }

  button.addEventListener("click", async () => {
    const actor = game.actors.get(button.dataset.actorId);
    const item = actor?.items.get(button.dataset.itemId);
    if (!item) return;

    button.disabled = true;
    const outcome = await actor.rollRighteousFury(item, Number(button.dataset.baseTotal) || 0);
    // Dialogue de difficulté annulé : aucune tentative consommée.
    if (!outcome) {
      button.disabled = false;
      return;
    }
    if (message.isOwner) await message.setFlag(game.system.id, "furyUsed", true);
  });
}
