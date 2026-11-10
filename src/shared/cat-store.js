import { create } from "zustand";

/**
 * Zustand store for the chibi cat's movement state.
 *
 * The DOM side (window/`Pressable` click handlers in `domain-shell`) calls
 * {@link pursue}; the WebGL side (`chibi-cat`) subscribes to the store and
 * walks the cat to the latest target. Events are fire-and-forget: only the
 * latest target matters.
 * @module shared/cat-store
 */

/**
 * A cat movement request.
 *
 * @typedef {object} CatTarget
 * @property {number} x Normalized viewport x (0 = left edge, 1 = right edge).
 * @property {number} y Normalized viewport y (0 = top edge, 1 = bottom edge).
 * @property {boolean} teleport When true the cat pops in at the target with
 * a burst effect instead of hopping there (used on dimension arrival).
 */

/**
 * Cat store state and actions.
 *
 * @typedef {object} CatStore
 * @property {CatTarget|null} target Latest movement target, or null before any publish.
 * @property {(target: CatTarget) => void} pursue Publish a new movement target.
 */

/**
 * Zustand store holding the chibi cat's latest target.
 *
 * @type {import("zustand").UseBoundStore<import("zustand").StoreApi<CatStore>>}
 */
export const useCatStore = create((set) => ({
  target: null,
  /** @param {CatTarget} target */
  pursue: (target) => set({ target })
}));

/**
 * Convenience action: publish a movement target (or teleport pop) for the cat.
 *
 * @param {CatTarget} target The viewport-relative destination.
 * @returns {void}
 */
export function pursue(target) {
  useCatStore.getState().pursue(target);
}
