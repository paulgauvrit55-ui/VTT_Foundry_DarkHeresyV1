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
