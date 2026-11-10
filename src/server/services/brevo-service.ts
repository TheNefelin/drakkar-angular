import { config } from '../config';

export interface BrevoEmailPayload {
  to: string;
  subject: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  details: string;
}

export interface BrevoEmailResult {
  ok: boolean;
  message?: string;
  error?: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function buildBrevoEmailHtml(payload: BrevoEmailPayload): string {
  const name = escapeHtml(payload.name || '—');
  const email = escapeHtml(payload.email || '—');
  const phone = escapeHtml(payload.phone || '—');
  const service = escapeHtml(payload.service || '—');
  const details = escapeHtml(payload.details || '—');

  return `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><title>Nueva cotización — Drakar</title></head>
<body style="margin:0;background:#0a0c10;font-family:Arial,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:24px;color:#e7e5e4;">
    <p style="color:#f0b429;font-size:12px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 8px;">Drakar Transportes</p>
    <h1 style="margin:0 0 8px;font-size:28px;">Nueva cotización</h1>
    <p style="margin:0 0 24px;color:#b8bcc4;font-size:14px;">Solicitud desde la landing. Atiende en menos de 48 horas.</p>
    <table style="width:100%;border-collapse:collapse;background:#11141b;border-radius:8px;">
      <tr><td style="padding:12px 16px;color:#8b93a1;font-size:13px;">Nombre</td><td style="padding:12px 16px;">${name}</td></tr>
      <tr><td style="padding:12px 16px;color:#8b93a1;font-size:13px;">Correo</td><td style="padding:12px 16px;">${email}</td></tr>
      <tr><td style="padding:12px 16px;color:#8b93a1;font-size:13px;">Teléfono</td><td style="padding:12px 16px;">${phone}</td></tr>
      <tr><td style="padding:12px 16px;color:#8b93a1;font-size:13px;">Servicio</td><td style="padding:12px 16px;">${service}</td></tr>
      <tr><td style="padding:12px 16px;color:#8b93a1;font-size:13px;vertical-align:top;">Mensaje</td><td style="padding:12px 16px;">${details}</td></tr>
    </table>
    <p style="margin:24px 0 0;font-size:12px;color:#5b616e;">Drakar Transportes · Cotización estimativa</p>
  </div>
</body>
</html>`;
}

export async function sendBrevoEmail(payload: BrevoEmailPayload): Promise<BrevoEmailResult> {
  const { brevoApiKey, brevoSenderEmail, brevoSenderName } = config;

  if (!brevoApiKey || !brevoSenderEmail || !brevoSenderName) {
    return { ok: false, error: 'Faltan variables BREVO_API_KEY, BREVO_SENDER_EMAIL o BREVO_SENDER_NAME en el servidor.' };
  }

  const body = {
    sender: { email: brevoSenderEmail, name: brevoSenderName },
    to: [{ email: payload.to, name: payload.name || payload.to }],
    subject: payload.subject,
    htmlContent: buildBrevoEmailHtml(payload),
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': brevoApiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      return { ok: false, error: `Brevo respondió ${response.status}: ${text.slice(0, 200)}` };
    }

    return { ok: true, message: 'Correo enviado.' };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message };
  }
}
