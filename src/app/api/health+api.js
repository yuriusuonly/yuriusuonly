/**
 * Health-check web API route (`src/app/api/health+api.js`): responds with
 * status, timestamp, and process uptime for Docker/proxy probes.
 * @module app/api/health+api
 */

/**
 * GET handler for `/api/health`.
 *
 * Handlers receive a web `Request` and return a `Response`.
 *
 * @returns {Response} JSON acknowledging that the process is up, with `Cache-Control: no-store` so health checks are never cached by clients or proxies.
 */
export function GET() {
  return Response.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    {
      headers: {
        // Health checks must never be cached by clients or proxies.
        "Cache-Control": "no-store",
      },
    }
  );
}
