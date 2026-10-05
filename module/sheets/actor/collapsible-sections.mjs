/**
 * Sections repliables des fiches d'acteur (caractéristiques, compétences, armes) : blocs
 * `.collapsible-section[data-section]` dont l'en-tête porte l'action `toggleSection`.
 *
 * L'état replié est gardé en mémoire par acteur (clé : UUID) pour la session du client : il
 * survit aux re-renders déclenchés par les updates comme à la fermeture/réouverture de la fiche,
 * sans rien écrire dans les données de l'acteur (préférence d'affichage propre à chaque joueur).
 */
const collapsedByActor = new Map();

function collapsedSet(actor) {
  let set = collapsedByActor.get(actor.uuid);
  if (!set) collapsedByActor.set(actor.uuid, set = new Set());
  return set;
}

/** Applique l'état replié mémorisé aux sections rendues (à appeler dans `_onRender`). */
export function applyCollapsedSections(element, actor) {
  const collapsed = collapsedSet(actor);
  for (const section of element.querySelectorAll(".collapsible-section[data-section]")) {
    section.classList.toggle("collapsed", collapsed.has(section.dataset.section));
  }
}

/** Action `toggleSection` : bascule la section contenant `target` et mémorise son état. */
export function toggleSection(actor, target) {
  const section = target.closest(".collapsible-section[data-section]");
  if (!section) return;
  const collapsed = collapsedSet(actor);
  const key = section.dataset.section;
  if (collapsed.has(key)) collapsed.delete(key);
  else collapsed.add(key);
  section.classList.toggle("collapsed", collapsed.has(key));
}

/**
 * Entrées de liste repliables (talents) : repliées par défaut, seules celles que le joueur a
 * dépliées sont mémorisées (même portée que les sections : par acteur, pour la session du
 * client) — sans quoi chaque re-render les replierait à nouveau.
 */
const expandedByActor = new Map();

function expandedSet(actor) {
  let set = expandedByActor.get(actor.uuid);
  if (!set) expandedByActor.set(actor.uuid, set = new Set());
  return set;
}

/** Vrai si l'entrée `id` a été dépliée par le joueur. */
export function isEntryExpanded(actor, id) {
  return expandedSet(actor).has(id);
}

/** Bascule l'entrée `entrySelector` contenant `target` (identifiée par `data-item-id`) et mémorise son état. */
export function toggleEntry(actor, target, entrySelector) {
  const entry = target.closest(entrySelector);
  const id = entry?.dataset.itemId;
  if (!id) return;
  const expanded = expandedSet(actor);
  if (expanded.has(id)) expanded.delete(id);
  else expanded.add(id);
  entry.classList.toggle("collapsed", !expanded.has(id));
}
