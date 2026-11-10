import { Router, type Request, type Response } from 'express';
import { getExternalApiConfig } from '@server/config';
import { ContactService } from '@server/services/contact.service';
import { API_ENDPOINTS } from '@shared/constants/api-endpoints';

// SERVER (Express): proxy BFF para la API externa.
export const apiProxy = Router();

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// Instancia del servicio de contacto.
const contactService = new ContactService();

// Endpoints para email. Contact delega en el servicio real; quote todavía es placeholder.
apiProxy.post(`/${API_ENDPOINTS.contact}`, async (req: Request, res: Response) => {
  const result = await contactService.send(req.body);
  res.status(result.status).json(result.body);
});

apiProxy.post(`/${API_ENDPOINTS.quote}`, async (_req: Request, res: Response) => {
  res.status(501).json({ detail: 'Quote email no implementado todavía.' });
});

// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// Timeout máximo de la petición externa al API.
const PROXY_TIMEOUT_MS = 15_000;

// Rutas permitidas hacia la API externa. Agregar nuevas entradas cuando el frontend
// efectivamente las use; el panel interno no se expone como proxy abierto.
interface AllowedProxyRoute {
  methods: readonly string[];
  path: RegExp;
}

const ALLOWED_PROXY_ROUTES: AllowedProxyRoute[] = [
  { methods: ['GET'], path: /^\/health$/ },
  //{ methods: ['GET', 'POST', 'PUT', 'DELETE'], path: /^\/END_POINT$/ },
];

// Verifica si el método y la ruta relativa están permitidos por la allowlist.
function isAllowedProxyRoute(method: string, pathname: string): boolean {
  return ALLOWED_PROXY_ROUTES.some(
    (route) => route.methods.includes(method) && route.path.test(pathname),
  );
}

// Devuelve la ruta sin query string.
function pathnameOf(rawPath: string): string {
  try {
    return new URL(rawPath, 'http://localhost').pathname;
  } catch {
    return rawPath.split('?')[0];
  }
}

// Intenta convertir body a JSON; si falla, devuelve { detail: texto }.
function parseJsonSafe(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}

// Proxy seguro hacia la API externa; solo deja pasar lo declarado en ALLOWED_PROXY_ROUTES.
apiProxy.use(async (req: Request, res: Response) => {
  const pathname = pathnameOf(req.url);

  // Rechaza métodos/rutas no permitidas por la allowlist.
  if (!isAllowedProxyRoute(req.method, pathname)) {
    res.status(403).json({ detail: 'Ruta no permitida.' });
    return;
  }

  try {
    // Lee URL y API key desde variables de entorno (sólo servidor).
    const { API_KEY, API_URL } = getExternalApiConfig();

    // Determina si el método enviará body.
    const sendsBody = req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH';

    // Hace la llamada real al backend externo en el path permitido.
    const response = await fetch(`${API_URL}${pathname}`, {
      method: req.method,
      headers: {
        // Acepta respuesta JSON.
        Accept: 'application/json',
        // Agrega la API key sólo en servidor.
        ...(API_KEY ? { 'X-API-Key': API_KEY } : {}),
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
