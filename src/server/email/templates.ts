// Plantillas HTML para los correos de contacto de Drakar.
interface LeadEmailData {
  name: string;
  email: string;
  phone: string;
  service: string;
  details: string;
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

// Plantilla HTML para el correo interno que recibe Transportes Drakar.
export function renderLeadEmail(data: LeadEmailData): string {
  const name = escapeHtml(data.name);
  const email = escapeHtml(data.email);
  const phone = escapeHtml(data.phone);
  const service = escapeHtml(data.service);
  const details = escapeHtml(data.details);

  return `<!doctype html>
<html lang="es">
  <head><meta charset="utf-8"><title>Nuevo contacto — Drakar Transportes</title></head>
  <body style="margin:0;background:#0a0c10;font-family:Arial,sans-serif;">
    <div style="max-width:640px;margin:0 auto;padding:24px;color:#e7e5e4;">
      <p style="color:#f0b429;font-size:12px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 8px;">Drakar Transportes</p>
      <h1 style="margin:0 0 8px;font-size:28px;">Nuevo contacto</h1>
      <p style="margin:0 0 24px;color:#b8bcc4;font-size:14px;">Solicitud desde la landing. Atiende en menos de 48 horas.</p>
      <table style="width:100%;border-collapse:collapse;background:#11141b;border-radius:8px;">
        <tr><td style="padding:12px 16px;color:#8b93a1;font-size:13px;">Nombre</td><td style="padding:12px 16px;color:#f0b429;">${name}</td></tr>
        <tr><td style="padding:12px 16px;color:#8b93a1;font-size:13px;">Correo</td><td style="padding:12px 16px;"><a href="mailto:${email}" style="color:#f0b429;text-decoration:none;">${email}</a></td></tr>
        <tr><td style="padding:12px 16px;color:#8b93a1;font-size:13px;">Teléfono</td><td style="padding:12px 16px;">${phone}</td></tr>
        <tr><td style="padding:12px 16px;color:#8b93a1;font-size:13px;">Servicio</td><td style="padding:12px 16px;">${service}</td></tr>
        <tr><td style="padding:12px 16px;color:#8b93a1;font-size:13px;vertical-align:top;">Mensaje</td><td style="padding:12px 16px;">${details}</td></tr>
      </table>
      <p style="margin:24px 0 0;font-size:12px;color:#5b616e;">Drakar Transportes · Cotización estimativa</p>
    </div>
  </body>
</html>`;
}

// Plantilla HTML para la confirmación que recibe el visitante.
export function renderConfirmationEmail(name: string): string {
  const safeName = escapeHtml(name || '—');

  return `<!doctype html>
<html lang="es">
  <head><meta charset="utf-8"><title>Recibimos tu mensaje — Drakar Transportes</title></head>
  <body style="margin:0;background:#0a0c10;font-family:Arial,sans-serif;">
    <div style="max-width:640px;margin:0 auto;padding:24px;color:#e7e5e4;">
      <p style="color:#f0b429;font-size:12px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 8px;">Drakar Transportes</p>
      <h1 style="margin:0 0 8px;font-size:28px;">Mensaje recibido</h1>
      <p style="margin:0;color:#e7e5e4;line-height:1.6;">Gracias, ${safeName}. Recibimos tu mensaje y te responderemos en menos de 48 horas.</p>
    </div>
  </body>
</html>`;
}
