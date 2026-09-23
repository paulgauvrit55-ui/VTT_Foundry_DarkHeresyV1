const { DialogV2 } = foundry.applications.api;

/**
 * Demande au joueur le modificateur de difficulté final (spec §8.3) avant un test.
 * @returns {Promise<number|null>} Le modificateur saisi, ou `null` si l'utilisateur annule.
 */
export async function promptDifficultyModifier() {
  const modifier = await DialogV2.wait({
    window: { title: game.i18n.localize("DH.Roll.DifficultyPromptTitle") },
    content: `
      <form class="dark-heresy-v1 dh-roll-dialog">
        <div class="form-group">
          <label>${game.i18n.localize("DH.Roll.DifficultyModifier")}</label>
          <input type="number" name="modifier" value="0" step="10" autofocus>
        </div>
      </form>
    `,
    buttons: [
      {
        action: "roll",
        label: game.i18n.localize("DH.Roll.Roll"),
        default: true,
        callback: (event, button) => Number(button.form.elements.modifier.value) || 0
      },
      {
        action: "cancel",
        label: game.i18n.localize("DH.Roll.Cancel"),
        callback: () => null
      }
    ],
    rejectClose: false
  });

  return modifier ?? null;
}

/**
 * Demande au joueur les paramètres d'un jet de Puissance (spec §7.2) : nombre de d10 lancés, de 1
 * à son Niveau Psy (par défaut le maximum), et un modificateur libre ajouté au total.
 * @param {number} psyRating Niveau Psy de l'acteur (≥ 1).
 * @returns {Promise<{dice: number, modifier: number}|null>} `null` si l'utilisateur annule.
 */
export async function promptPsychicPowerOptions(psyRating) {
  const diceOptions = Array.from({ length: psyRating }, (_, i) => i + 1)
    .map(count => `<option value="${count}" ${count === psyRating ? "selected" : ""}>${count}d10</option>`)
    .join("");

  const options = await DialogV2.wait({
    window: { title: game.i18n.localize("DH.PsychicPower.PromptTitle") },
    content: `
      <form class="dark-heresy-v1 dh-roll-dialog">
        <div class="form-group">
          <label>${game.i18n.localize("DH.PsychicPower.DiceCount")}</label>
          <select name="dice">${diceOptions}</select>
        </div>
        <div class="form-group">
          <label>${game.i18n.localize("DH.PsychicPower.Modifier")}</label>
          <input type="number" name="modifier" value="0">
        </div>
      </form>
    `,
    buttons: [
      {
        action: "roll",
        label: game.i18n.localize("DH.Roll.Roll"),
        default: true,
        callback: (event, button) => ({
          dice: Number(button.form.elements.dice.value) || psyRating,
          modifier: Number(button.form.elements.modifier.value) || 0
        })
      },
      {
        action: "cancel",
        label: game.i18n.localize("DH.Roll.Cancel"),
        callback: () => null
      }
    ],
    rejectClose: false
  });

  return options ?? null;
}
