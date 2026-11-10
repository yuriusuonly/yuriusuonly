import { create } from "zustand";

/**
 * Zustand store for the domain-expansion overture choreography.
 *
 * Portal presses stage the exact pointer origin of an expansion, and the
 * return portal stages a full "collapse" handoff so the previous screen can
 * mount with the expand animation playing in reverse. `domain-shell` reads
 * and clears both via the take* handshake on mount.
 * @module stores/expansion-store
 */

/**
 * Normalized pointer origin of a domain-expansion overture.
 *
 * @typedef {object} ExpansionOrigin
 * @property {number} x Normalized viewport x (0–1) where the card was clicked.
 * @property {number} y Normalized viewport y (0–1) where the card was clicked.
 */

/**
 * A staged exit for the collapse (reverse-expansion) back to a previous screen.
 *
 * @typedef {object} StagedExit
 * @property {ExpansionOrigin} origin Pointer origin where the return portal was clicked.
 * @property {string} accent Accent color of the dimension being left (the collapsing disc).
 */

/**
 * Expansion store state and actions.
 *
 * @typedef {object} ExpansionStore
 * @property {ExpansionOrigin|null} origin Pointer origin for the next expansion overture.
 * @property {StagedExit|null} exit Staged collapse overlay for the next screen mount.
 * @property {(origin: ExpansionOrigin|null) => void} setExpansionOrigin Stage (or clear) the overture origin.
 * @property {() => ExpansionOrigin|null} takeExpansionOrigin Read and clear the staged origin (shell mount handshake).
 * @property {(exit: StagedExit|null) => void} setExitStage Stage (or clear) the pending collapse.
 * @property {() => StagedExit|null} takeExitStage Read and clear the staged exit (shell mount handshake).
 */

/**
 * Zustand store holding the staged overture origin and pending collapse.
 *
 * @type {import("zustand").UseBoundStore<import("zustand").StoreApi<ExpansionStore>>}
 */
export const useExpansionStore = create((set, get) => ({
  origin: null,
  exit: null,
  /** @param {ExpansionOrigin|null} origin */
  setExpansionOrigin: (origin) => set({ origin }),
  /** @returns {ExpansionOrigin|null} */
  takeExpansionOrigin: () => {
    const { origin } = get();
    set({ origin: null });
    return origin;
  },
  /** @param {StagedExit|null} exit */
  setExitStage: (exit) => set({ exit }),
  /** @returns {StagedExit|null} */
  takeExitStage: () => {
    const { exit } = get();
    set({ exit: null });
    return exit;
  }
}));
