import { getBrevoConfig } from '@server/config';

// Body que llega desde el navegador (sin confiar en tipos).
interface ContactRequestBody {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
}

// Respuesta que devuelve el servidor al cliente.
interface SendContactResult {
  status: number;
  body: {
    detail: string;
    visitorNotified?: boolean;
  };
}

// Contrato interno usado para llamar a Brevo.
interface BrevoEmailPayload {
  to: string;
  subject: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  details: string;
}

// Resultado de una llamada a Brevo.
interface BrevoEmailResult {
  ok: boolean;
  error?: string;
}

// Escapa texto para interpolar en HTML sin romperlo ni permitir inyección.
function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Plantilla HTML para la confirmación que recibe el visitante.
function buildBrevoConfirmationHtml(name: string): string {
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

// Plantilla HTML para el correo interno que recibe Transportes Drakar.
function buildBrevoEmailHtml(payload: BrevoEmailPayload): string {
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

// Envía un correo usando Brevo API. Utiliza la API key sólo en servidor.
async function sendBrevoEmail(payload: BrevoEmailPayload, htmlContent?: string): Promise<BrevoEmailResult> {
  // Lee la configuración sólo en el servidor para construir API headers/body.
  const { brevoApiKey, brevoSenderEmail, brevoSenderName } = getBrevoConfig();

  // Arma el body de la transacción para Brevo.
  const body = {
    sender: { email: brevoSenderEmail, name: brevoSenderName },
    to: [{ email: payload.to, name: payload.name || payload.to }],
    subject: payload.subject,
    htmlContent: htmlContent ?? buildBrevoEmailHtml(payload),
  };

  try {
    // Hace la petición a Brevo; si la librería fetch falla, entra al catch.
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': brevoApiKey,
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

// Devuelve cadena vacía si el valor no es texto; si lo es, hace trim.
function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

// Implementa el contacto completo: valida, envía lead a Drakar y correo de confirmación al visitante.
export async function sendContactEmail(body: ContactRequestBody): Promise<SendContactResult> {
// Antes de enviar valida que el body sea texto usable.
  const name = stringValue(body.name);
  const email = stringValue(body.email);
  const phone = stringValue(body.phone);
  const message = stringValue(body.message);

  // Validación server-side: los 4 campos son obligatorios.
  if (!name || !email || !phone || !message) {
    return {
      status: 400,
      body: { detail: 'Faltan campos obligatorios.' },
    };
  }

  // Obtiene la configuración de Brevo; falla explícito si faltan vars.
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

  // Paso 1: enviar los datos del lead a Transportes Drakar.
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

  // Paso 2: enviar confirmación al visitante. Si falla, el lead ya fue recibido.
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
