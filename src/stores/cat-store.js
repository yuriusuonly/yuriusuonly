import { create } from "zustand";

/**
 * Zustand store for the Shimeji-style screen cat's movement.
 *
 * The DOM side (window pointerdown handlers in `domain-shell`) publishes
 * click targets; the 2D pet (`screen-cat`) subscribes and respawns/drops to
 * the latest one. Targets are fire-and-forget: only the latest matters.
 * @module stores/cat-store
 */

/**
 * A cat movement request.
 *
 * @typedef {object} CatTarget
 * @property {number} x Normalized viewport x (0 = left edge, 1 = right edge).
 * @property {number} y Normalized viewport y (0 = top edge, 1 = bottom edge).
 * @property {boolean} teleport When true the cat drops in from above the
 * screen Shimeji-style instead of popping in there (used on dimension arrival).
 */

/**
 * Cat store state and actions.
 *
 * @typedef {object} CatStore
 * @property {CatTarget|null} target Latest movement target, or null before any publish.
 * @property {(target: CatTarget) => void} pursue Publish a new movement target.
 */

/**
 * Zustand store holding the screen cat's latest movement target.
 *
 * @type {import("zustand").UseBoundStore<import("zustand").StoreApi<CatStore>>}
 */
export const useCatStore = create((set) => ({
  target: null,
  /** @param {CatTarget} target */
  pursue: (target) => set({ target })
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
