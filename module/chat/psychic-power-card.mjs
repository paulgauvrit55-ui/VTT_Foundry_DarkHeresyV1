import { rollPsychicPhenomenon } from "../dice/psychic-roll.mjs";

/**
 * Bouton "Phénomène psychique" d'une carte de jet de Puissance (spec §7.3) : un clic = un tirage,
 * à répéter autant de fois que la carte compte de 9 naturels. Même mécanique de listener manuel
 * que `weapon-attack-card.mjs`, les cartes de chat n'ayant pas d'actions déclaratives.
 */
export function registerPsychicPowerCard() {
  Hooks.on("renderChatMessageHTML", (message, html) => {
    const root = html instanceof HTMLElement ? html : html?.[0];
    const button = root?.querySelector(".psychic-phenomenon-roll");
    if (!button) return;

    button.addEventListener("click", () => rollPsychicPhenomenon());
  });
}
