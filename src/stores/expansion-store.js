import { create } from "zustand";

/**
 * Zustand store for the domain-expansion choreography.
 *
 * Portal/card presses play a cover disc on the screen being left, then stage a
 * handoff so the destination mounts already covered: `entry` stages an
 * expansion (destination dissolves the cover into its world). The staged
 * cover originates at the pointer position of the press.
 * @module stores/expansion-store
 */

/**
 * Normalized pointer origin of an expansion overture.
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
 * @property {string} accent Disc color (the clicked tile's accent).
 */

/**
 * Expansion store state and actions.
 *
 * @typedef {object} ExpansionStore
 * @property {StagedCover|null} entry Cover staged for a forward expansion (destination dissolves it).
 * @property {(cover: StagedCover|null) => void} setEntryStage Stage (or clear) the pending expansion handoff.
 * @property {() => void} clearStages Clear the staged value once a shell has stamped it into local state.
 */

/**
 * Zustand store holding the staged expansion handoff.
 *
 * @type {import("zustand").UseBoundStore<import("zustand").StoreApi<ExpansionStore>>}
 */
export const useExpansionStore = create((set) => ({
  entry: null,
  /** @param {StagedCover|null} cover */
  setEntryStage: (cover) => set({ entry: cover }),
  /** @returns {void} */
  clearStages: () => set({ entry: null })
}));
