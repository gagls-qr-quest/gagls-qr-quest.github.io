// QR Quest – spoločná knižnica, verzia 1
// ------------------------------------------------------------------
// Toto je „zmluva“ medzi modulmi hra, mapa a editor:
//   • odkiaľ sa načítava quest (questy/<id>/quest.json alebo draft z editora),
//   • pod akým kľúčom a v akom tvare sa ukladá postup hráča,
//   • aké adresy majú stanovištia (to, čo je v QR kóde).
// Formát dát je popísaný vo FORMAT.md.
//
// Pravidlá:
//   • Zmenu najprv dohodnite v kanáli #dohody na Discorde.
//   • Pridať novú funkciu je v poriadku. Zmeniť alebo zmazať existujúcu
//     znamená novú verziu (shared/v2/), aby sa nikomu nič nerozbilo.
// ------------------------------------------------------------------

/** Adresa spoločného základu (GitHub Pages organizácie). */
export const BASE_URL = 'https://gagls-qr-quest.github.io';

/** Quest, ktorý sa načíta, keď adresa neobsahuje ?q=... */
export const DEFAULT_QUEST = 'ukazka';

/** Id pre rozpracovaný quest z editora (uložený v localStorage). */
export const DRAFT_ID = 'draft';

const PREFIX = 'qrq:v1:';

/** Kľúče v localStorage. Všetky moduly bežia na jednej doméne, takže ich zdieľajú. */
export const KEYS = {
  draft: PREFIX + 'draft',
  progress: (questId) => `${PREFIX}progress:${questId}`,
};

/** Hodnota parametra z adresy stránky, napr. getParam('s') pre ...?s=K7P2QX */
export function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/** Id questu z adresy (?q=...), inak predvolený quest. */
export function getQuestId() {
  return getParam('q') || DEFAULT_QUEST;
}

/**
 * Načíta quest.
 *   'draft'  → rozpracovaný quest z editora (localStorage na tomto zariadení),
 *   iné id   → súbor questy/<id>/quest.json zo spoločného základu.
 * Každému poschodiu doplní floor.imageUrl = plná adresa obrázka pôdorysu.
 */
export async function loadQuest(questId = getQuestId()) {
  let quest;
  if (questId === DRAFT_ID) {
    const text = localStorage.getItem(KEYS.draft);
    if (!text) {
      throw new Error('Na tomto zariadení nie je uložený žiadny rozpracovaný quest z editora.');
    }
    quest = JSON.parse(text);
  } else {
    const url = `${BASE_URL}/questy/${encodeURIComponent(questId)}/quest.json`;
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`Quest „${questId}“ sa nepodarilo načítať (HTTP ${response.status}).`);
    }
    quest = await response.json();
  }

  // Obrázok pôdorysu môže byť názov súboru v priečinku questu alebo celá adresa.
  const folder = `${BASE_URL}/questy/${encodeURIComponent(quest.id)}/`;
  for (const floor of quest.floors ?? []) {
    floor.imageUrl = new URL(floor.image, folder).href;
  }
  return quest;
}

/** Prázdny postup hráča. */
export function newProgress(questId) {
  return {
    questId,
    team: null,
    startedAt: null,
    finishedAt: null,
    lastStation: null,
    stations: {},
  };
}

/**
 * Postup hráča pre daný quest (alebo prázdny, ak ešte nehral).
 * Postup sa ukladá pod id z adresy – pri ?q=draft teda pod 'draft'.
 */
export function loadProgress(questId = getQuestId()) {
  try {
    const text = localStorage.getItem(KEYS.progress(questId));
    return text ? JSON.parse(text) : newProgress(questId);
  } catch (error) {
    console.warn('Postup sa nepodarilo načítať, začínam odznova.', error);
    return newProgress(questId);
  }
}

/** Uloží postup hráča. */
export function saveProgress(progress) {
  try {
    localStorage.setItem(KEYS.progress(progress.questId), JSON.stringify(progress));
  } catch (error) {
    console.warn('Postup sa nepodarilo uložiť (súkromný režim alebo plné úložisko?).', error);
  }
}

/** Zmaže postup hráča (nová hra). */
export function resetProgress(questId = getQuestId()) {
  localStorage.removeItem(KEYS.progress(questId));
}

/** Adresa stanovišťa v hre – presne toto patrí do QR kódu. */
export function stationUrl(questId, code) {
  return `${BASE_URL}/hra/?q=${encodeURIComponent(questId)}&s=${encodeURIComponent(code)}`;
}

/** Adresa mapy, voliteľne so zvýrazneným stanovišťom („Si tu“). */
export function mapUrl(questId, code) {
  const url = `${BASE_URL}/mapa/?q=${encodeURIComponent(questId)}`;
  return code ? `${url}&s=${encodeURIComponent(code)}` : url;
}

/** Adresa editora. */
export function editorUrl() {
  return `${BASE_URL}/editor/`;
}
