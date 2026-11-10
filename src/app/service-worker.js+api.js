/**
 * Service worker web API route (`src/app/service-worker.js+api.js`): serves a
 * minimal service worker that claims clients immediately after install/activate.
 * Registered client-side on mount by `src/app/_layout.js`.
 * @module app/service-worker+api
 */

/**
 * GET handler for `/service-worker.js`.
 *
 * @returns {Response} JavaScript service worker source with `Cache-Control: no-cache` so updates are always fetched fresh.
 */
export function GET() {
  return new Response(
    [
      "self.addEventListener('install', () => self.skipWaiting());",
      "self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));",
      ""
    ].join("\n"),
    {
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "no-cache"
      }
    }
  );
}
