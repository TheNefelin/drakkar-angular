import { Router, type Request, type Response } from 'express';
import { getPortfolioConfig } from '@server/config';
import { ContactService } from '@server/services/contact.service';

// SERVER (Express): proxy BFF para la API externa.
export const apiProxy = Router();

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// Instancia del servicio de contacto.
const contactService = new ContactService();

// Endpoints para email. Contact delega en el servicio real; quote todavía es placeholder.
apiProxy.post('/contact', async (req: Request, res: Response) => {
  const result = await contactService.send(req.body);
  res.status(result.status).json(result.body);
});

apiProxy.post('/quote', async (_req: Request, res: Response) => {
  res.status(501).json({ detail: 'Quote email no implementado todavía.' });
});

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// Timeout máximo de la petición externa al API.
const PROXY_TIMEOUT_MS = 15_000;

// Métodos HTTP que pueden pasar por el proxy genérico.
const ALLOWED_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);

// Intenta convertir body a JSON; si falla, devuelve { detail: texto }.
function parseJsonSafe(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}

// CRUD genérico: reenvía cualquier ruta/método válido al API externa.
apiProxy.use(async (req: Request, res: Response) => {
  // Rechaza métodos no permitidos.
  if (!ALLOWED_METHODS.has(req.method)) {
    res.status(405).json({ detail: `Método no permitido: ${req.method}` });
    return;
  }

  // req.url incluye la ruta relativa y la query (ej: '/health?page=1').
  const path = req.url;

  // La ruta debe empezar en '/' y no contener barras invertidas.
  if (!path.startsWith('/') || path.includes('\\')) {
    res.status(400).json({ detail: 'Ruta inválida.' });
    return;
  }

  try {
    // Lee URL y API key desde variables de entorno (solo servidor).
    const { PORTFOLIO_API_KEY, PORTFOLIO_API_URL } = getPortfolioConfig();

    // Determina si el método enviará body.
    const sendsBody = req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH';

    // Hace la llamada real al backend externo.
    const response = await fetch(`${PORTFOLIO_API_URL}${path}`, {
      method: req.method,
      headers: {
        // Acepta respuesta JSON.
        Accept: 'application/json',
        // Agrega la API key sólo en servidor.
        ...(PORTFOLIO_API_KEY ? { 'X-API-Key': PORTFOLIO_API_KEY } : {}),
        // Content-Type sólo si hay body que enviar.
        ...(sendsBody ? { 'Content-Type': 'application/json' } : {}),
      },
      body: sendsBody ? JSON.stringify(req.body ?? {}) : undefined,
      // Timeout de la petición externa.
      signal: AbortSignal.timeout(PROXY_TIMEOUT_MS),
    });

    // Respuesta cruda del backend externo (texto).
    const text = await response.text();

    // Sin body devuelve status sin cuerpo.
    if (!text) {
      res.status(response.status).end();
      return;
    }

    // Devuelve JSON del backend o { detail } si no parsea.
    res.status(response.status).json(parseJsonSafe(text));
  } catch (error) {
    // Errores de red/URL/etc -> 502 (bad gateway, no alcanzó el backend).
    console.error('[api-proxy] proxy error:', error);
    res.status(502).json({ detail: 'Error de conexión con la API.' });
  }
});

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
