import type { NextConfig } from "next";

/**
 * Production security headers (Group 3).
 *
 * Kept intentionally conservative so no existing functionality breaks:
 *   - NO Content-Security-Policy: the app relies on Next.js inline scripts for
 *     hydration, Google Maps embeds
 *     (maps.google.com), QR code images (api.qrserver.com) and menu/gallery
 *     images (images.pexels.com). A strict CSP without careful nonce/hash and
 *     domain allow-listing would break these.
 *   - NO frame blocking beyond SAMEORIGIN: X-Frame-Options governs whether
 *     OTHER sites may embed OUR pages; it does not affect the Google Maps
 *     iframes we embed ourselves.
 *   - `camera` is NOT disabled in Permissions-Policy: the receipt-photo flow
 *     uses `<input type="file" capture="environment">` (mobile camera capture),
 *     which is not the getUserMedia API, but we leave it unrestricted to be
 *     certain the phone capture workflow is unaffected.
 */
/**
 * BUILD-WORKER CAP (fixes the Coolify/Railpack "SIGABRT" deploy failure).
 *
 * Next.js spawns one prerender worker per CPU core of the BUILD machine:
 * `experimental.cpus` defaults to `os.cpus().length - 1`. On Coolify the build
 * runs inside `docker buildx`, which sees EVERY core of the host VPS, so a
 * 32-core machine makes Next.js start 31 separate Node processes for
 * "Collecting page data" / "Generating static pages" — far more than the
 * container's memory/pids limits can hold. The build then aborts with:
 *
 *   Warning: Failed to load CA certificates off thread: resource temporarily
 *   unavailable            <- EAGAIN: thread/fd exhaustion, not a code error
 *   ⨯ Next.js build worker exited with code: null and signal: SIGABRT
 *   ERROR: process "npm run build" did not complete successfully: exit code: 1
 *
 * This site has only ~42 static pages, so two workers finish in about a minute
 * and use a fraction of the RAM. On a machine with more memory you can raise
 * it at deploy time with the build variable NEXT_BUILD_WORKERS — no code
 * change needed. Never set it to 0 (Next.js would fall back to one per core).
 */
const requestedWorkers = Number.parseInt(
  process.env.NEXT_BUILD_WORKERS ?? "",
  10,
);
const buildWorkers =
  Number.isInteger(requestedWorkers) && requestedWorkers > 0
    ? Math.min(requestedWorkers, 16)
    : 2;

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  // See the buildWorkers note above — keeps `next build` from forking one
  // 300 MB Node worker per host CPU core inside the Coolify build container.
  experimental: {
    cpus: buildWorkers,
  },
  async headers() {
    return [
      {
        // Apply to every route (pages, API, static assets).
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // POCKET ALERTS: the service worker must never be served from a cache.
        // A staff phone that keeps an old sw.js keeps the OLD alert behaviour
        // (that is how the "no sound in my pocket" bug survived a deploy), so
        // every check for an update has to hit the server.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
