// Plantillas HTML para los correos de contacto de Drakar.
interface LeadEmailData {
  name: string;
  email: string;
  phone: string;
  service: string;
  details: string;
  reference: string;
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
  const reference = escapeHtml(data.reference);

  return `<!doctype html>
  <html lang="es">
    <head><meta charset="utf-8"><title>Nuevo Contacto — Transportes Drakar</title></head>
    <body style="margin:0;background:#0a0c10;font-family:Arial,sans-serif;">
      <div style="max-width:640px;margin:0 auto;padding:24px;color:#e7e5e4;">
        <p style="color:#f0b429;font-size:12px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 8px;">Transportes Drakar</p>
        <h1 style="margin:0 0 8px;font-size:28px;">Nuevo contacto</h1>
        <p style="margin:0 0 24px;color:#b8bcc4;font-size:14px;">Solicitud desde la landing. Atiende en menos de 48 horas.</p>
        <table style="width:100%;border-collapse:collapse;background:#11141b;border-radius:8px;">
          <tr><td style="padding:12px 16px;color:#8b93a1;font-size:13px;">Código</td><td style="padding:12px 16px;color:#f0b429;">${reference}</td></tr>
          <tr><td style="padding:12px 16px;color:#8b93a1;font-size:13px;">Nombre</td><td style="padding:12px 16px;color:#f0b429;">${name}</td></tr>
          <tr><td style="padding:12px 16px;color:#8b93a1;font-size:13px;">Correo</td><td style="padding:12px 16px;"><a href="mailto:${email}" style="color:#f0b429;text-decoration:none;">${email}</a></td></tr>
          <tr><td style="padding:12px 16px;color:#8b93a1;font-size:13px;">Teléfono</td><td style="padding:12px 16px;">${phone}</td></tr>
          <tr><td style="padding:12px 16px;color:#8b93a1;font-size:13px;">Servicio</td><td style="padding:12px 16px;">${service}</td></tr>
          <tr><td style="padding:12px 16px;color:#8b93a1;font-size:13px;vertical-align:top;">Mensaje</td><td style="padding:12px 16px;">${details}</td></tr>
        </table>
        <p style="margin:24px 0 0;font-size:12px;color:#5b616e;">Transportes Drakar · Cotización estimativa</p>
      </div>
    </body>
  </html>`;
}

// Plantilla HTML para la confirmación que recibe el visitante.
export function renderConfirmationEmail(name: string, reference: string): string {
  const safeName = escapeHtml(name || '—');
  const safeReference = escapeHtml(reference || '—');

  return `<!doctype html>
  <html lang="es">
    <head><meta charset="utf-8"><title>Recibimos tu Mensaje — Transportes Drakar</title></head>
    <body style="margin:0;background:#0a0c10;font-family:Arial,sans-serif;">
      <div style="max-width:640px;margin:0 auto;padding:24px;color:#e7e5e4;">
        <p style="color:#f0b429;font-size:12px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 8px;">Transportes Drakar</p>
        <h1 style="margin:0 0 8px;font-size:28px;">Mensaje recibido</h1>
        <p style="margin:0;color:#e7e5e4;line-height:1.6;">Gracias, <span style="color:#f0b429;">${safeName}</span>. Recibimos tu mensaje y te responderemos en menos de 48 horas.</p>
        <div style="margin:20px 0;padding:12px;border:1px solid #f0b429;border-radius:8px;background:rgba(240,180,41,0.12);">
          <p style="margin:0;color:#f0b429;font-size:14px;"><strong>No respondas a este correo.</strong> Es un mensaje automático.</p>
        </div>
        <p style="margin:0 0 16px;color:#b8bcc4;font-size:14px;">Código: <span style="color:#f0b429;font-weight:bold;">${safeReference}</span></p>
        <div style="text-align:center;margin:16px 0;">
          <img src="https://transportesdrakkar.cl/images/qr-code.png" alt="Código QR de WhatsApp" width="160" style="display:inline-block;max-width:100%;height:auto;border-radius:8px;" />
          <p style="margin:8px 0 0;color:#b8bcc4;font-size:13px;">Escanea el código QR para escribirnos por WhatsApp.</p>
        </div>
      </div>
    </body>
  </html>`;
}
