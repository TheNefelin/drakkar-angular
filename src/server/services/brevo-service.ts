import { getBrevoConfig } from '../config';

export interface ContactRequestBody {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
}

export interface SendContactResult {
  status: number;
  body: {
    detail: string;
    visitorNotified?: boolean;
  };
}

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

export function buildBrevoConfirmationHtml(name: string): string {
  const safeName = escapeHtml(name || '—');

  return `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><title>Recibimos tu mensaje — Drakar</title></head>
<body style="margin:0;background:#0a0c10;font-family:Arial,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:24px;color:#e7e5e4;">
    <p style="color:#f0b429;font-size:12px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 8px;">Drakar Transportes</p>
    <h1 style="margin:0 0 8px;font-size:28px;">Mensaje recibido</h1>
    <p style="margin:0;color:#e7e5e4;line-height:1.6;">Gracias, ${safeName}. Recibimos tu mensaje y te responderemos en menos de 48 horas.</p>
  </div>
</body>
</html>`;
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

export async function sendBrevoEmail(payload: BrevoEmailPayload, htmlContent?: string): Promise<BrevoEmailResult> {
  const { brevoApiKey, brevoSenderEmail, brevoSenderName } = getBrevoConfig();

  const body = {
    sender: { email: brevoSenderEmail, name: brevoSenderName },
    to: [{ email: payload.to, name: payload.name || payload.to }],
    subject: payload.subject,
    htmlContent: htmlContent ?? buildBrevoEmailHtml(payload),
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

export async function sendTestEmail(): Promise<SendContactResult> {
  try {
    const brevo = getBrevoConfig();
    const result = await sendBrevoEmail({
      to: brevo.brevoSenderEmail,
      subject: 'Drakar — test de envío',
      name: brevo.brevoSenderName || 'Drakar',
      email: brevo.brevoSenderEmail,
      phone: '—',
      service: 'Test de Brevo',
      details: 'Correo de prueba enviado desde el botón de test.',
    });

    return result.ok
      ? { status: 200, body: { detail: 'FUNCIONA' } }
      : { status: 502, body: { detail: result.error ?? 'No se pudo enviar el correo.' } };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { status: 500, body: { detail: message } };
  }
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export async function sendContactEmail(body: ContactRequestBody): Promise<SendContactResult> {
  const name = stringValue(body.name);
  const email = stringValue(body.email);
  const phone = stringValue(body.phone);
  const message = stringValue(body.message);

  if (!name || !email || !phone || !message) {
    return {
      status: 400,
      body: { detail: 'Faltan campos obligatorios.' },
    };
  }

  let brevo: ReturnType<typeof getBrevoConfig>;

  try {
    brevo = getBrevoConfig();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      status: 500,
      body: { detail: message },
    };
  }

  const businessResult = await sendBrevoEmail({
    to: brevo.brevoSenderEmail,
    subject: `Nuevo contacto desde la landing: ${name}`,
    name,
    email,
    phone,
    service: 'Contacto',
    details: message,
  });

  if (!businessResult.ok) {
    return {
      status: 502,
      body: { detail: businessResult.error ?? 'No se pudo enviar el correo.' },
    };
  }

  const confirmationResult = await sendBrevoEmail(
    {
      to: email,
      subject: 'Recibimos tu mensaje — Drakar Transportes',
      name,
      email,
      phone,
      service: 'Contacto',
      details: message,
    },
    buildBrevoConfirmationHtml(name),
  );

  return {
    status: 200,
    body: {
      detail: 'Mensaje enviado.',
      visitorNotified: confirmationResult.ok,
    },
  };
}
