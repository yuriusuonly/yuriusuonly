import { create } from "zustand";

/**
 * Zustand store for the domain-expansion choreography.
 *
 * Portal/card presses play a cover disc on the screen being left, then stage a
 * handoff so the destination mounts already covered: `entry` stages an
 * expansion (destination dissolves the cover into its world), `exit` stages a
 * collapse (the previous screen re-opens with the disc shrinking back into
 * the click point). Both originate at the pointer position of the press.
 * @module stores/expansion-store
 */

/**
 * Normalized pointer origin of an expansion/collapse overture.
 *
 * @typedef {object} ExpansionOrigin
 * @property {number} x Normalized viewport x (0–1) where the press happened.
 * @property {number} y Normalized viewport y (0–1) where the press happened.
 */

/**
 * A staged cover handoff for the next screen mount.
 *
 * @typedef {object} StagedCover
 * @property {ExpansionOrigin} origin Pointer origin where the press happened.
 * @property {string} accent Disc color (the clicked tile's accent, or the leaving dimension's).
 */

/**
 * Expansion store state and actions.
 *
 * @typedef {object} ExpansionStore
 * @property {StagedCover|null} entry Cover staged for a forward expansion (destination dissolves it).
 * @property {StagedCover|null} exit Cover staged for a return collapse (destination shrinks it into the point).
 * @property {(cover: StagedCover|null) => void} setEntryStage Stage (or clear) the pending expansion handoff.
 * @property {(cover: StagedCover|null) => void} setExitStage Stage (or clear) the pending collapse handoff.
 * @property {() => void} clearStages Clear both staged values once a shell has stamped them into local state.
 */

/**
 * Zustand store holding the staged expansion/collapse handoffs.
 *
 * @type {import("zustand").UseBoundStore<import("zustand").StoreApi<ExpansionStore>>}
 */
export const useExpansionStore = create((set) => ({
  entry: null,
  exit: null,
  /** @param {StagedCover|null} cover */
  setEntryStage: (cover) => set({ entry: cover }),
  /** @param {StagedCover|null} cover */
  setExitStage: (cover) => set({ exit: cover }),
  /** @returns {void} */
  clearStages: () => set({ entry: null, exit: null })
}));
