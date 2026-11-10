import type { Express, Request, Response } from 'express';
import { sendContactEmail } from '../services/brevo-service';

// SERVER (Express): proxy BFF para API externa y endpoint del formulario.
export function registerApiProxy(app: Express): void {
  app.post('/ssr-api/brevo', async (req: Request, res: Response) => {
    const result = await sendContactEmail(req.body);
    res.status(result.status).json(result.body);
  });
}
