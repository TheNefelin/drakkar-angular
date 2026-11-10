import { Router, type Request, type Response } from 'express';
import { getPortfolioConfig } from '@server/config';
import { sendTestEmail } from '@server/services/brevo-service';

// SERVER (Express): proxy BFF para la API externa.
export const apiProxy = Router();

const PROXY_TIMEOUT_MS = 15_000;
const ALLOWED_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);

apiProxy.post('/email-test', async (_req: Request, res: Response) => {
  const result = await sendTestEmail();
  res.status(result.status).json(result.body);
});

function parseJsonSafe(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}

apiProxy.use(async (req: Request, res: Response) => {
  if (!ALLOWED_METHODS.has(req.method)) {
    res.status(405).json({ detail: `Método no permitido: ${req.method}` });
    return;
  }

  const path = req.url;

  if (!path.startsWith('/') || path.includes('\\')) {
    res.status(400).json({ detail: 'Ruta inválida.' });
    return;
  }

  try {
    const { PORTFOLIO_API_KEY, PORTFOLIO_API_URL } = getPortfolioConfig();
    const sendsBody = req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH';

    const response = await fetch(`${PORTFOLIO_API_URL}${path}`, {
      method: req.method,
      headers: {
        Accept: 'application/json',
        ...(PORTFOLIO_API_KEY ? { 'X-API-Key': PORTFOLIO_API_KEY } : {}),
        ...(sendsBody ? { 'Content-Type': 'application/json' } : {}),
      },
      body: sendsBody ? JSON.stringify(req.body ?? {}) : undefined,
      signal: AbortSignal.timeout(PROXY_TIMEOUT_MS),
    });

    const text = await response.text();

    if (!text) {
      res.status(response.status).end();
      return;
    }

    res.status(response.status).json(parseJsonSafe(text));
  } catch (error) {
    console.error('[api-proxy] proxy error:', error);
    res.status(502).json({ detail: 'Error de conexión con la API.' });
  }
});
