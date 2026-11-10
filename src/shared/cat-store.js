import { create } from "zustand";

/**
 * Zustand store for the Shimeji-style screen cat and the domain-expansion
 * overture.
 *
 * The DOM side (window/`Pressable` handlers in `domain-shell` and the home
 * portals) publishes click targets and the pointer origin of a domain
 * expansion; the 2D pet (`screen-cat`) subscribes to targets and walks/falls
 * to the latest one. Targets are fire-and-forget: only the latest matters.
 * @module shared/cat-store
 */

/**
 * A cat movement request.
 *
 * @typedef {object} CatTarget
 * @property {number} x Normalized viewport x (0 = left edge, 1 = right edge).
 * @property {number} y Normalized viewport y (0 = top edge, 1 = bottom edge).
 * @property {boolean} teleport When true the cat drops in from above the
 * screen Shimeji-style instead of walking there (used on dimension arrival).
 */

/**
 * Normalized pointer origin of a domain-expansion overture.
 *
 * @typedef {object} ExpansionOrigin
 * @property {number} x Normalized viewport x (0–1) where the card was clicked.
 * @property {number} y Normalized viewport y (0–1) where the card was clicked.
 */

/**
 * Cat/expansion store state and actions.
 *
 * @typedef {object} CatStore
 * @property {CatTarget|null} target Latest movement target, or null before any publish.
 * @property {ExpansionOrigin|null} origin Pointer origin for the next expansion overture.
 * @property {(target: CatTarget) => void} pursue Publish a new movement target.
 * @property {(origin: ExpansionOrigin|null) => void} setExpansionOrigin Stage (or clear) the overture origin.
 * @property {() => ExpansionOrigin|null} takeExpansionOrigin Read and clear the staged origin (shell mount handshake).
 */

/**
 * Zustand store holding the screen cat's target and the staged overture origin.
 *
 * @type {import("zustand").UseBoundStore<import("zustand").StoreApi<CatStore>>}
 */
export const useCatStore = create((set, get) => ({
  target: null,
  origin: null,
  /** @param {CatTarget} target */
  pursue: (target) => set({ target }),
  /** @param {ExpansionOrigin|null} origin */
  setExpansionOrigin: (origin) => set({ origin }),
  /** @returns {ExpansionOrigin|null} */
  takeExpansionOrigin: () => {
    const { origin } = get();
    set({ origin: null });
    return origin;
  }
}));

/**
 * Convenience action: publish a movement target (or drop-in request) for the cat.
 *
 * @param {CatTarget} target The viewport-relative destination.
 * @returns {void}
 */
export function pursue(target) {
  useCatStore.getState().pursue(target);
}
