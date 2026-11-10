/**
 * robots.txt web API route (`src/app/robots.txt+api.js`): allows all user agents
 * to crawl the site (an empty `Disallow`).
 * @module app/robots+api
 */

/**
 * GET handler for `/robots.txt`.
 *
 * @returns {Response} Plain text robots.txt content served with `Content-Type: text/plain; charset=utf-8`.
 */
export function GET() {
  return new Response(
    [
      "User-agent: *",
      "Disallow: ",
      ""
    ].join("\n"),
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8"
      }
    }
  );
}
