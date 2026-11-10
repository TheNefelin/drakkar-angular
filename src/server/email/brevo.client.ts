// Adaptador para el proveedor Brevo. Mantiene todo el detalle de la API externa.
import { getBrevoConfig } from '@server/config';


interface BrevoEmailMessage {
  to: string;
  subject: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  details: string;
}

interface BrevoEmailResult {
  ok: boolean;
  error?: string;
}

export class BrevoClient {
  // Envía un correo usando Brevo. API key sólo en servidor.
  async send(payload: BrevoEmailMessage, htmlContent: string): Promise<BrevoEmailResult> {
    const { BREVO_API_URL, BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME } = getBrevoConfig();

    const body = {
      sender: { email: BREVO_SENDER_EMAIL, name: BREVO_SENDER_NAME },
      to: [{ email: payload.to, name: payload.name || payload.to }],
      subject: payload.subject,
      htmlContent,
    };

    try {
      // Llamada a Brevo; si falla el fetch entra al catch.
      const response = await fetch(BREVO_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': BREVO_API_KEY,
        },
        body: JSON.stringify(body),
      });

      // Brevo responde con status no-OK; guardamos el detail del upstream para diagnosticar.
      if (!response.ok) {
        const text = await response.text();
        return { ok: false, error: `Brevo respondió ${response.status}: ${text.slice(0, 200)}` };
      }

      // Brevo aceptó la petición.
      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { ok: false, error: message };
    }
  }
}
