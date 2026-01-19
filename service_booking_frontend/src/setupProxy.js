const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * CRA runtime proxy configuration.
 *
 * Why this exists:
 * - CRA's package.json "proxy" is fixed to http://localhost:5000, which works only when your browser
 *   is on the same machine as the backend.
 * - In this hosted/dev environment, the backend is reachable via a different origin, so relying on
 *   the package.json proxy can yield 500s for /api calls and trigger the UI's fallback mode.
 *
 * This middleware forwards /api requests from the CRA dev server to the configured backend URL.
 *
 * Env:
 * - REACT_APP_BACKEND_URL (preferred): full backend origin, e.g. "https://...:3001"
 * - REACT_APP_API_BASE_URL / REACT_APP_API_BASE: if set to an absolute URL, can also be used
 *
 * Note: This file is only used by `react-scripts start` (development). Production deployments should
 * serve the frontend and backend behind the same origin or configure the hosting proxy accordingly.
 */
module.exports = function setupProxy(app) {
  // Prefer backend URL when provided; otherwise leave CRA's default proxy behavior unchanged.
  const candidate =
    process.env.REACT_APP_BACKEND_URL ||
    process.env.REACT_APP_API_BASE_URL ||
    process.env.REACT_APP_API_BASE ||
    '';

  const target = String(candidate).trim().replace(/\/+$/, '');

  // Only enable when an absolute URL is provided (so we don't accidentally proxy to "/api").
  if (!/^https?:\/\//i.test(target)) {
    return;
  }

  app.use(
    '/api',
    createProxyMiddleware({
      target,
      changeOrigin: true,
      secure: true,
      // Keep path as-is: /api/... -> /api/...
      logLevel: 'warn',
      onProxyReq(proxyReq) {
        // Some hosted environments are sensitive to Host headers; setting changeOrigin already helps,
        // but this is an extra guard.
        try {
          proxyReq.setHeader('Origin', target);
        } catch {
          // ignore
        }
      }
    })
  );
};
