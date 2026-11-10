import type { NextFunction, Request, Response } from 'express';

// Rate limit básico en memoria para el BFF.
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Recibe la cantidad de intentos permitidos y el tiempo en minutos para la ventana.
// Si no se especifican, usa los valores por defecto: 5 intentos / 15 minutos.
export function createRateLimit(maxAttempts = 5, timeInMinutes = 15) {
  const windowMs = timeInMinutes * 60 * 1000;
  const entries = new Map<string, RateLimitEntry>();

  return (req: Request, res: Response, next: NextFunction): void => {
    // La IP preferida es la que Express detecta por remote/socket.
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const current = entries.get(key);

    if (!current || current.resetAt <= now) {
      entries.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    current.count += 1;

    if (current.count > maxAttempts) {
      res.status(429).json({ detail: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' });
      return;
    }

    entries.set(key, current);
    next();
  };
}
