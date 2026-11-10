import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { apiProxy } from '@server/proxy/api-proxy';
import { createRateLimit } from '@server/middleware/rate-limit';
import { API_ENDPOINTS } from '@shared/constants/api-endpoints';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// [BFF] ── Inicio del código propio ─────────────────────────────────────────
// Todo este bloque es nuestro (BFF), NO parte del server.ts original de Angular SSR.
// Proxy /ssr-api que oculta la API y las variables de entorno del navegador.
// Incluye rate limit básico para /contact, que es el endpoint público.
app.use('/ssr-api', express.json());
app.use(`/ssr-api/${API_ENDPOINTS.contact}`, createRateLimit(5, 15));
app.use('/ssr-api', apiProxy);
// [BFF] ── Fin del código propio ────────────────────────────────────────────

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
